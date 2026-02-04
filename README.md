# Cron Worker Thread Service – Report Generation using NestJS + PostgreSQL

## Background Jobs using Cron + Worker Threads with Retry Handling

This project demonstrates how **real-world backend systems** handle **heavy background tasks** using:

* Cron jobs for scheduling
* Worker Threads for CPU-intensive work
* Database-backed logs for tracking status & retries

The goal of this service is to show **how long-running or heavy computations are safely moved out of the main Node.js thread**, while still being reliable, observable, and retryable.

---

## What Problem Does This Project Solve?

In real production systems:

* Cron jobs are used for **scheduled tasks** (reports, cleanups, syncs)
* Heavy computation **must NOT block** the main server
* Failures **must be tracked and retried**

This service solves that by:

* Triggering jobs using **NestJS Cron**
* Executing heavy logic inside **Worker Threads**
* Persisting job status in **PostgreSQL**
* Implementing **retry & failure handling**

---

## High-Level Architecture

Flow:

Cron Scheduler → Main Thread → Worker Thread → Database Updates

Meaning:

* Cron triggers a job every minute
* Main thread spawns a worker thread
* Worker performs CPU-heavy calculation
* Result + status are saved in DB

---

## Why Worker Threads?

Node.js runs on a **single-threaded event loop**.

If heavy computation runs in the main thread:

* API requests freeze
* Server becomes unresponsive

**Worker Threads** allow:

* CPU-heavy tasks to run in parallel
* Main thread to stay responsive
* True multi-core utilization

---

## What is “Spawn Worker Thread”?

Spawning a worker thread means:

* Creating a **new thread**
* Running heavy code in isolation
* Communicating via messages

In this project:

```ts
new Worker('report.worker.js', { workerData })
```

Each job gets its **own worker instance**.

---

## Database Design (report_logs Table)

This table acts as a **job execution log**.

### Columns Explained

* **id**

  * Unique identifier for each job

* **status** (SUCCESS | FAILED | RETRYING)

  * Tracks current job state

* **generatedAt**

  * Business timestamp for report generation

* **result (bigint)**

  * Stores large computed result
  * bigint is used because results exceed 32-bit limits

* **retryCount**

  * Number of retry attempts

* **createdAt**

  * When the job entry was created

This ensures:

* Full traceability
* Debugging support
* Production-grade observability

---

## Why Database Will NOT Get Overloaded

Important points:

* One row per cron execution
* Data can be cleaned via retention policy
* This is how real systems audit background jobs

In production:

* Old logs are archived or deleted
* DB is not used as a queue, only as **job state storage**

---

## Why bigint Result Values Are So Large

Inside worker:

```ts
for (let i = 0; i < 1e8; i++) {
  total += i;
}
```

* `1e8` simulates **heavy CPU work**
* Result grows beyond normal integer range
* Hence `bigint` is required

Alternatives could be:

* Smaller loop
* File output
* External storage

This approach is chosen **only for demonstration**.

---

## Retry & Failure Handling Logic

MAX_RETRY = 3

Flow:

1. Worker succeeds → status = SUCCESS
2. Worker fails → retryCount++
3. If retryCount < MAX_RETRY → retry
4. If retryCount >= MAX_RETRY → status = FAILED

This mimics **real production retry mechanisms**.

---

## Cron Execution Flow (Step-by-Step)

1. Cron runs every minute
2. New log entry created in DB
3. Worker thread is spawned
4. Worker executes heavy computation
5. Result is sent back
6. DB is updated
7. Retry happens automatically on failure

---

## Tech Stack Used

* NestJS
* @nestjs/schedule (Cron)
* Worker Threads (Node.js)
* PostgreSQL
* TypeORM
* Node.js

---

## Project Folder Structure

```
src/
├── cron/
│   ├── cron.module.ts
│   └── cron.service.ts
├── workers/
│   └── report.worker.js
├── database/
│   ├── database.module.ts
│   └── entities/
│       └── report-log.entity.ts
├── app.module.ts
└── main.ts
```

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd cron-worker-thread
npm install
```

---

### 2. Setup PostgreSQL

Create database:

```
cron_worker_thread
```

Update credentials in:
`database.module.ts`

---

### 3. Start Application

```bash
npm run start:dev
```

Console output:

```
Cron triggered
cron worker is running...
```

---

## Verification

Check PostgreSQL:

```sql
SELECT * FROM report_logs;
```

You will see:

* RETRYING
* SUCCESS
* FAILED

With retry counts.

---

## Production-Level Concepts Applied

* Background job processing
* Cron scheduling
* Worker thread isolation
* Retry & failure strategy
* Database-backed job tracking
* Non-blocking server design
* Clean separation of concerns

---

## What I Learned from This Project

* How cron jobs work internally
* Why worker threads are needed in Node.js
* How to offload CPU-heavy work safely
* How retry mechanisms are designed
* How real systems track background jobs
* Difference between async tasks and multi-threading

---

## Made By Deeksha

This project demonstrates **real-world cron + worker thread usage**
with NestJS and PostgreSQL, focusing on scalability, reliability,
and production-grade backend design.
