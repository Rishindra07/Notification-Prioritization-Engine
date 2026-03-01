# BUILD_PLAN.md

## Day 1 Plan
- Finalize MongoDB schemas and indexes.
- Build synchronous decision pipeline first (without AI).
- Implement auth and role-based access.
- Build required backend APIs and audit logging.

## Day 1 Actual
- Implemented models: notifications, rules, audit logs, settings, user history, dead-letter, users.
- Implemented pipeline: expiry, dedupe (exact + near), rule evaluation, fatigue checks, score classifier.
- Implemented auth middleware and demo user seeding.
- Implemented append-only audit creation.

## Day 2 Plan
- Add async AI processing with fail-safe architecture.
- Add LATER queue scheduler and retries.
- Build all 7 frontend screens and connect to APIs.
- Add realtime dashboard updates and required docs.

## Day 2 Actual
- Added async OpenRouter LLM integration with retries, backoff, circuit breaker, and fallback.
- Added queue processor with retry tracking and dead-letter preservation.
- Built frontend pages: Login, Simulator, Dashboard, Audit, LATER Queue, Rules, Metrics.
- Added SSE stream for live updates.
- Added documentation set for submission.
