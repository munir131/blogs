---
title: "Node.js Streams at Scale: Handling 1 Million Records Without Crashing"
description: "Learn how to generate and upload massive CSV reports in Node.js using streams and backpressure handling, avoiding Heap Out of Memory errors in production."
date: "2026-02-19"
tags: ["nodejs", "performance", "aws", "streams", "backend"]
keywords: ["node.js streams", "memory management", "aws s3 upload", "backpressure", "csv generation", "fintech engineering"]
author: "Munir Khakhi"
---

In FinTech, "scale" isn't just a buzzword—it's a monthly requirement. Consider this common scenario: It's the first of the month, and your system needs to generate monthly statement CSVs for **1 million credit card users** and upload them to AWS S3 for compliance and user access.

If you approach this like a standard web request—fetching data, formatting it, and sending it off—you will crash your server.

This post breaks down why the naive approach fails and how to implement a robust, memory-efficient streaming pipeline that handles millions of records with a constant memory footprint.

## The Anti-Pattern: Buffering in Memory

The most common mistake engineers make is treating a large dataset like a small one.

```javascript
// ❌ DO NOT DO THIS IN PRODUCTION
const users = await db.collection('users').find({}).toArray(); // 1 million objects
const csv = users.map(user => `${user.id},${user.name},${user.balance}`).join('\n');
await s3Client.send(new PutObjectCommand({ Body: csv, ... }));
```

### Why This Fails
1.  **Heap Exhaustion**: Loading 1 million objects into V8's heap immediately spikes memory usage. If each object is just 1KB, that's ~1GB of RAM just for the raw data, before overhead.
2.  **GC Pauses**: The garbage collector works overtime trying to manage this massive allocation, blocking the event loop and causing latency spikes for other requests.
3.  **String Concatenation**: Creating the huge CSV string requires even more contiguous memory allocation.

The result is the dreaded `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`.

## The Solution: Streaming Pipelines

The correct approach is to process data **chunk by chunk**. We never hold the entire dataset in memory; we only hold the current chunk being processed.

Our architecture looks like this:
`Database Cursor (Source)` -> `CSV Formatter (Transform)` -> `S3 Upload (Destination)`

### 1. The Source: Database Cursor
Instead of `toArray()`, we use a cursor. A cursor fetches documents in batches (e.g., 100 at a time) from the database server, keeping the application memory footprint low.

### 2. The Transform: CSV Formatting
We need a Transform stream that takes an object chunk and converts it into a CSV string line.

### 3. The Destination: S3 Upload
The AWS SDK v3 `Upload` utility is designed specifically for streams. It manages multipart uploads automatically, buffering just enough data to send a part (usually 5MB) before clearing memory.

## Implementation

Here is how you implement this pipeline using Node.js streams for robust error handling.

```javascript
import { Readable, Transform } from 'node:stream';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';

async function generateMonthlyReport() {
  const s3 = new S3Client({ region: 'us-east-1' });

  // 1. Source: Readable from Cursor
  // Convert the AsyncIterable cursor into a standard Node.js Readable stream
  const dbStream = Readable.from(db.collection('users').find());

  // 2. Transform: Object to CSV Line
  const csvTransform = new Transform({
    writableObjectMode: true, // Accepts objects
    transform(chunk, encoding, callback) {
      try {
        // Format logic: sanitize inputs, handle dates, etc.
        const line = `${chunk.id},"${chunk.name}",${chunk.balance.toFixed(2)}\n`;
        callback(null, line);
      } catch (err) {
        callback(err);
      }
    }
  });

  // Add Header row
  csvTransform.push('User ID,Name,Balance\n');

  // 3. Destination: AWS S3 Upload
  // The Upload class reads from the stream and handles multipart upload
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: 'financial-reports',
      Key: `statements/2026-02.csv`,
      Body: csvTransform // The readable end of our transform stream
    }
  });

  try {
    // Connect the DB stream to the CSV transform
    // We don't pipe to 'upload' directly because AWS SDK 'Upload' takes the stream as a param.
    // Note: .pipe() does not forward errors, so we must handle them explicitly.
    dbStream.on('error', (err) => csvTransform.destroy(err));
    dbStream.pipe(csvTransform);

    console.log('Starting upload...');
    await upload.done();
    console.log('Upload complete!');
    
  } catch (error) {
    console.error('Pipeline failed:', error);
    // Ensure streams are destroyed to prevent leaks
    dbStream.destroy();
  }
}
```

## The Critical Concept: Backpressure

Why is `pipe()` or `pipeline()` essential here?

If the database reads records faster than S3 can upload them (which is highly likely given network latency), data would accumulate in memory, eventually causing the same OOM crash we tried to avoid.

**Backpressure** is the mechanism where the destination stream signals the source stream to "pause" reading until the buffer clears.
1.  S3 Upload stream fills its internal buffer.
2.  It returns `false` to the Transform stream.
3.  The Transform stream pauses and signals the DB cursor to stop fetching.
4.  Once S3 uploads a chunk, it drains the buffer and signals "resume".

Node.js streams handle this negotiation automatically when you use `.pipe()`.

## Summary

By using streams, we decoupled memory usage from dataset size. Whether processing 1,000 users or 10 million, the memory consumption remains constant (roughly the size of the highWaterMark buffers).

For high-volume FinTech applications, streaming isn't an optimization—it's a requirement for stability.
