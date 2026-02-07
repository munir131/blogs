---
title: "Distributed Transactions: Why I Stopped Fighting the CAP Theorem"
description: "ACID guarantees are a comfort blanket that will suffocate your high-throughput payment system. Here is why I moved to SAGA and Temporal."
date: 2026-02-06
tags:
  - posts
  - microservices
  - architecture
  - payments
  - saga-pattern
  - temporal
layout: layouts/post.njk
author: Munir Khakhi
---

I used to think I was smarter than the CAP theorem.

When I first started breaking apart monoliths, I looked at the database transactions that kept our financial data consistent and thought, "I can just do this over HTTP." I wrapped three microservices in a Two-Phase Commit (2PC) protocol and deployed to production.

Then Black Friday hit.

Latencies spiked. Database locks held on for seconds instead of milliseconds. The coordinator service choked, leaving thousands of transactions in a "prepared" state that required manual database surgery to fix. I spent that entire weekend running SQL updates by hand while my phone buzzed with angry alerts.

That was the day I learned that **ACID is a lie** in distributed systems. If you want scale, you have to embrace the mess.

## The 2PC Trap

Two-Phase Commit is seductive. It promises that you can keep your beautiful, consistent world where a transaction either happens everywhere or nowhere.

But in a payment system processing thousands of requests per second, 2PC is essentially a distributed denial of service attack against yourself.

You are asking Service A, Service B, and Service C to lock their resources simultaneously. If Service B experiences a GC pause or a network blip, Service A and C are left hanging. They hold their locks, blocking other traffic, waiting for a signal that might never come.

I’ve seen entire platforms grind to a halt because one non-critical service in a 2PC chain got slow. It’s brittle. It’s synchronous. It’s a single point of failure.

## Embracing the SAGA Pattern

The alternative is the SAGA pattern. I view it simply as **"cleaning up your own mess."**

In a SAGA, there is no global lock.

1.  **Wallet Service** deducts money. Commit.
2.  **Ledger Service** records the entry. Commit.
3.  **Notification Service** sends an email. Commit.

If the Ledger Service fails? We don't rollback. We can't rollback—the Wallet transaction is already committed and visible to the user.

Instead, we run a **Compensating Transaction**. We trigger a new step: "Refund Wallet."

### "But the data is inconsistent!"

Yes. For a few hundred milliseconds, the user has less money than they should, and the ledger doesn't know about it yet.

This often scares engineers who are used to strong consistency. "What if the user checks their balance _right now_?"

My answer: **Let them.**

This is **Eventual Consistency**. The real world is eventually consistent. When you buy coffee with a credit card, the money doesn't leave your bank account instantly. It’s a pending authorization. The settlement happens days later.

If Visa and Mastercard can live with eventual consistency, so can your startup.

## Orchestration is the Only Way

You can implement SAGAs in two ways: Choreography (events) or Orchestration (command-and-control).

I have tried Choreography. I have the scars to prove it.
Service A emits `PaymentStarted`. Service B listens and emits `PaymentDebited`. Service C listens...

It sounds decoupled and elegant until you need to debug why transaction #8492 is stuck. You end up grepping through logs across six different services, trying to piece together a murder mystery. We call this the "Pinball Architecture"—requests bounce around until they hopefully land in the right hole.

**Always use Orchestration.**
Build a central brain (The Orchestrator) that knows the plan.

1.  "Service A, deduct money." (Wait for success)
2.  "Service B, credit account." (Wait for success)
3.  "Service B failed? Okay, Service A, refund money."

You need a single place to look when things go wrong.

## Stop Writing Your Own Orchestrator

In my early days, I wrote my own orchestrators using Kafka and a state machine in the database.

It was a nightmare. I spent more time writing boilerplate for retries, timeouts, exponential backoff, and crash recovery than I did on the actual payment logic.

Today, I just use **Temporal**.

Temporal abstracts all the distributed systems pain away. It persists the execution state to a database. If your server crashes in the middle of a function, Temporal resumes it on another server, at the exact same line of code, with all local variables intact.

This is the code I run in production:

```go
func ProcessPayment(ctx workflow.Context, data PaymentData) error {
    // Step 1: Charge the user
    // Temporal handles the retries automatically if this fails.
    err := workflow.ExecuteActivity(ctx, ChargeUser, data).Get(ctx, nil)
    if err != nil {
        return err // Nothing to compensate yet
    }

    // Step 2: Fulfill the order
    err = workflow.ExecuteActivity(ctx, FulfillOrder, data).Get(ctx, nil)
    if err != nil {
        // Step 2 failed. We MUST refund Step 1.
        // Temporal guarantees this runs until it succeeds.
        workflow.ExecuteActivity(ctx, RefundUser, data)
        return err
    }

    return nil
}
```

That’s it. No state machine logic. No "if kafka message lost" handling. It just works.

## The Reality Check

Distributed transactions are hard. There is no silver bullet that gives you the speed of microservices with the safety of a monolith.

But if you stop fighting the reality of network failures and start designing for **compensation** rather than **perfection**, you’ll build systems that actually stay up during Black Friday.
