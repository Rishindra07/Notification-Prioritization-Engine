# SYSTEM_WORKFLOW.md

## Happy Path: Event Submission
1. Operator submits event from Event Simulator UI.
2. Frontend calls `POST /api/notifications/evaluate`.
3. Backend decision pipeline runs synchronously:
   - expiry check
   - exact and near-duplicate check
   - active rule evaluation
   - fatigue threshold evaluation
   - score-based fallback decision
4. Event is stored in `NotificationEvent`.
5. Append-only audit entry is stored in `AuditLog`.
6. API returns immediate decision (`NOW/LATER/NEVER`) with reason.
7. Backend emits realtime update to SSE stream.
8. Frontend dashboard and metrics auto-refresh/stream updates.

## Failure Path: AI Unavailable
1. Event is still classified synchronously by non-AI pipeline and returned immediately.
2. Async OpenRouter AI job starts in background.
3. AI call retries with backoff.
4. If repeated failures happen, circuit breaker opens.
5. While circuit is open, AI calls are skipped and score-based fallback is used.
6. Fallback usage is persisted in event `ai_analysis` and audit logs.
7. Health endpoint reports degraded AI status and circuit state.

## LATER Queue Processing
1. Background scheduler runs every `LATER_QUEUE_INTERVAL_SECONDS`.
2. It fetches events with `status=LATER` and due retry time.
3. Each event is re-evaluated via decision pipeline (dedupe skipped to avoid self-match).
4. If still `LATER`, attempts increase and next retry is scheduled with backoff.
5. If max retries are exceeded, event is preserved in dead-letter and marked safe-final.
6. Every queue action writes an audit log entry.

## Rule Change Flow
1. Admin opens Rules Manager UI.
2. Admin creates/updates/deletes a rule via `/api/rules`.
3. Rule changes are persisted in MongoDB immediately.
4. Next event evaluation fetches latest active rules directly from DB.
5. No backend restart or redeploy is needed.

## Deduplication Flow
1. Incoming event gets exact hash from core fields.
2. Backend checks recent events for exact key/hash matches.
3. Backend also checks near-duplicates with Jaccard similarity on normalized text.
4. If similarity >= 0.8, event is marked duplicate.
5. Duplicate decision (`NEVER`) and confidence context are logged in audit trail.
