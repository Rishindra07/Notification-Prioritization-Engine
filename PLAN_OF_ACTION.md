# PLAN_OF_ACTION.md

## Day 1
- Planned: lock data model and indexes before controller code.
- Built: schemas with indexed critical lookup fields (`dedupe_key`, `status`, `createdAt`, `user_id`).
- Decision: use soft delete flags for recoverability and keep audit entries append-only.

## Day 2
- Planned: validate core decision path independent of AI.
- Built: synchronous deterministic classification path and API endpoints.
- Decision: return immediate decision and run AI asynchronously to avoid blocking user requests.

## Day 3
- Planned: implement fail-safe architecture.
- Built: retry + backoff + circuit breaker + dead-letter handling.
- Decision: prefer safe fallbacks over hard failures to keep system operational under AI outage.

## Day 4
- Planned: complete frontend and bind to backend.
- Built: mobile-first React UI with all required screens and role-aware actions.
- Decision: use SSE + polling mix for practical realtime behavior.

## Two-stack sequencing note
- For coherence, I kept a stack-agnostic architecture contract: same entities, same pipeline stages, same fail-safe behavior.
- If restarting, I would define shared API contracts first and auto-generate clients in both stacks.
