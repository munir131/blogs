---
title: "Cutting Observability Costs: Migrating from Datadog to Self-Hosted Jaeger on GKE"
description: "A deep dive into migrating a multi-language microservices stack (Go, PHP, Next.js) from Datadog to self-hosted Jaeger on Kubernetes to control skyrocketing observability costs."
date: 2025-12-17
tags:
  - observability
  - kubernetes
  - golang
  - devops
  - performance
layout: layouts/post.njk
keywords: "datadog alternative, jaeger vs datadog, self-hosted observability, kubernetes tracing, opentelemetry migration, gke observability cost"
author: Munir Khakhi
---

Observability is the tax we pay for microservices. When you break a monolith into a distributed system across Google Kubernetes Engine (GKE), tracing isn't optional - it's the only way to prove where latency lives.

We started with Datadog. It’s the gold standard for a reason: zero-config instrumentation, polished UI, and unified logs/metrics/traces. But convenience has a price tag. As our platform is a hybrid stack of Go (Fiber), Next.js, and Laravel (PHP) backed by Postgres and Redis scaled, our observability bill began to rival our compute costs.

This isn't a hit piece on Datadog. It’s an engineering case study on when to buy and when to build. This is how we migrated to self-hosted Jaeger and OpenTelemetry, regaining control over our data and our budget.

## The Problem: The Cost of Visibility

Our architecture runs on GKE with distinct environments for Dev, Staging, UAT, and Production. We instrumented everything:

- **Go Services:** High-throughput APIs using Fiber.
- **PHP Monoliths:** Legacy business logic in Laravel.
- **Frontend:** Next.js handling server-side rendering.
- **Datastores:** Span-level visibility into Postgres queries and Redis caches.

Datadog's billing model charges for ingestion and retention. As our user base grew, so did the traces. We weren't just paying for "errors"; we were paying for every successful health check, every keep-alive, and every sub-millisecond Redis hit.

The tipping point wasn't just the SaaS subscription. It was the **network egress**. Sending terabytes of trace data out of our VPC to Datadog’s cloud incurred significant cross-region bandwidth charges. We were effectively double-billed: once for the tool, and once for the privilege of sending data to it.

## The Decision: Why Jaeger?

We evaluated Grafana Tempo and Zipkin, but settled on **Jaeger** for three reasons:

1.  **OpenTelemetry (OTel) Native:** We didn't want vendor lock-in again. OTel is the industry standard. If Jaeger failed us, we could swap the backend without rewriting a single line of application code.
2.  **Self-Hosted Economics:** Running Jaeger on our existing GKE cluster meant our observability cost became a fixed infrastructure cost (CPU/RAM + Storage) rather than a variable usage cost.
3.  **Language Support:** Strong client libraries for Go, PHP, and Node.js.

## Architecture: The OpenTelemetry Pipeline

The most critical architectural decision was decoupling instrumentation from storage. We didn't send traces directly from apps to Jaeger. We used the **OpenTelemetry Collector**.

### The Flow

1.  **Applications (Go/PHP/Node)** emit traces via OTel SDKs.
2.  **OTel Agents** (running as DaemonSets on GKE nodes) capture these traces on `localhost`.
3.  **OTel Collectors** (Deployment) receive aggregated batches, process them (sampling, filtering), and export them to the Jaeger backend.
4.  **Jaeger** writes to Elasticsearch (for scalable storage).

This "sidecar-less" approach (using DaemonSets) minimized the resource overhead on our application pods.

## Implementation: The Polyglot Challenge

Migrating a mixed stack is never clean. Each language presented unique challenges.

### 1. Golang (Fiber)

Go was the easiest. The `go.opentelemetry.io` libraries are mature. We implemented a middleware for Fiber that automatically started spans for incoming HTTP requests and propagated context to downstream services.

```go
// Simplified OTel Middleware for Fiber
func New(cfg Config) fiber.Handler {
    return func(c *fiber.Ctx) error {
        tracer := otel.Tracer("fiber-server")
        ctx, span := tracer.Start(c.UserContext(), c.Method()+" "+c.Path())
        defer span.End()

        // Propagate context to downstream
        c.SetUserContext(ctx)
        return c.Next()
    }
}
```

**Key Optimization:** We implemented "Head-Based Sampling" at the SDK level. We dropped 90% of successful health checks (HTTP 200s on `/health`) immediately, only keeping 100% of errors. This drastically reduced noise.

### 2. PHP (Laravel)

PHP is synchronous and stateless, making long-lived trace batching difficult. The OTel PHP library typically requires an extension or a sidecar to offload traces asynchronously so the user request isn't blocked by telemetry uploads.

We utilized the **OpenTelemetry PHP extension** for auto-instrumentation but manually instrumented critical business logic blocks. We had to tune the batch size carefully; too large, and we risked memory limits in PHP-FPM; too small, and we increased network overhead.

### 3. Next.js

Frontend tracing is tricky. You don't want to expose your internal Jaeger topology to the public internet. We used the **OpenTelemetry Collector** as a gateway. Next.js server-side traces (API routes, `getServerSideProps`) flowed internally, while client-side traces were sent to a public-facing OTel Collector endpoint secured behind an ingress with strict rate limiting.

## The Hard Truths: Trade-offs

This migration wasn't free. We traded **money** for **engineering hours**.

### What We Lost

- **The "It Just Works" Factor:** Datadog correlates logs and traces automatically. In Jaeger, we had to ensure our loggers injected `trace_id` into JSON logs and configure Fluentd/Elasticsearch to index them correctly for correlation.
- **Sophisticated Alerting:** Jaeger is for tracing. It doesn't natively alert on "P99 latency > 500ms" like Datadog monitors. We had to build parallel Prometheus metrics for alerting.

### What We Gained

- **Predictable Costs:** Our bill is now flat. Scaling users means adding a few nodes to the Elasticsearch cluster, not negotiating a new enterprise contract.
- **Data Sovereignty:** Trace data never leaves our VPC.
- **Performance:** By using OTel Collectors within the cluster, we reduced the latency overhead of sending telemetry data over the public internet.

## Results

Post-migration, we reduced our total observability spend by approximately **60%**.

More importantly, we sanitized our architecture. By adopting OpenTelemetry, we standardized how every service—regardless of language—reports health and performance. We aren't married to Jaeger forever; if a better backend appears next year, we change the exporter config in the OTel Collector, and we're done.

## Conclusion

SaaS observability is fantastic for starting up. But at a certain scale, owning your data becomes an infrastructure imperative. If you are running on GKE and seeing your monitoring bill creep up, look at OpenTelemetry. The initial lift is heavy, but the long-term leverage is undeniable.

---

_Munir Khakhi is a Backend Infrastructure Engineer specializing in high-scale distributed systems, Kubernetes, and Go. He helps companies optimize architecture for performance and cost._
