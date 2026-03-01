# ARCHITECTURE_DECISIONS.md

## Decision 1: Near-Duplicate Detection
- Approach: hash-based exact match + Jaccard similarity over normalized message text for recent same-user/same-event events.
- Why: low-complexity implementation that works without vector infrastructure.
- Failure cases: semantic duplicates with different wording may evade Jaccard; high-volume streams may require ANN/vector search.

## Decision 2: Asynchronous AI Processing
- AI runs in background after immediate synchronous classification.
- Provider selected: OpenRouter (`/chat/completions`) with model configured by `OPENROUTER_MODEL`.
- Why: user request latency stays low and system remains available even with AI delays.
- Synchronous downside: request timeouts and cascading failures during model/provider degradation.
- Tradeoff: final classification may be adjusted later; handled through audit logs and realtime updates.

## Decision 3: Database Model Choices
- MongoDB strengths: flexible `metadata` and evolving rule condition shapes.
- Relational strengths (for Spring stack): strict constraints and easier transactional consistency.
- Mongo challenge: enforcing strict relational constraints is manual.
- Relational challenge: schema evolution for dynamic metadata is harder.

## Decision 4: Failure Handling Thresholds
- AI retries: 3 attempts with increasing backoff.
- Circuit breaker: open after 5 failures; retry half-open after 120s.
- Too low threshold: false positives open circuit too often.
- Too high threshold: wastes resources hammering unstable upstream.

## Decision 5: LATER Queue Design
- Chosen: scheduled polling processor.
- Why: simple to build and reliable under interview time constraints.
- Interval tradeoff: shorter interval improves responsiveness but increases DB load.
- Switch conditions: very high scale or strict latency SLAs justify event-driven queue infra.

## Decision 6: Two Stacks, One Architecture
- Consistent: same pipeline stages, API shape, audit-first observability, and fail-safe strategy.
- Allowed divergence: framework-level implementation details (Spring scheduling/transactions vs Node async services).
- Divergence source: mostly framework characteristics, not business logic differences.
