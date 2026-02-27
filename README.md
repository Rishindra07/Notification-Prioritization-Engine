# Notification Prioritization Engine

## Overview
This project is a Notification Prioritization Engine designed to classify incoming notification events as **Now**, **Later**, or **Never**. It prevents duplicate notifications, reduces alert fatigue, supports configurable rules, and logs every decision for auditability.

---

## High-Level Architecture

**Components:**
- **API Layer:** Express.js routes/controllers for notifications and rules.
- **Decision Service:** Core logic for classifying notifications.
- **Deduplication Service:** Prevents exact/near-duplicate notifications.
- **Fatigue Service:** Applies rate limits and user fatigue logic.
- **Scoring Service:** Assigns priority scores to events.
- **Rule Engine:** Allows human-configurable rules (DB-driven).
- **Audit Logging:** Records every decision and reason.
- **Database:** MongoDB for events, rules, user history, and logs.

**Data Flow:**
1. API receives notification event.
2. Decision service evaluates event (expiry, dedupe, rules, fatigue, scoring).
3. Decision and reason are logged.
4. Response: Now/Later/Never.

---

## Decision Logic (Now / Later / Never)
1. **Expiry Check:** Suppress expired notifications.
2. **Duplicate Check:** Suppress duplicates (hash-based, recent window).
3. **Rule Check:** Apply admin-configured rules (DB-driven, no code deploy).
4. **Fatigue Check:** Apply per-user rate limits/caps.
5. **Scoring:** Assign score, classify as Now/Later/Never.
6. **Fallback:** If any service fails, default to safe (e.g., send Now or Later, never silently drop important notifications).

---

## Data Models
- **NotificationEvent:** Stores each event and its status.
- **Rule:** Stores admin-configurable rules.
- **UserHistory:** Tracks per-user notification counts and last sent time.
- **AuditLog:** Records every decision and reason for auditability.

---

## API Endpoints
- `POST /api/notifications/evaluate` — Evaluate a notification event.
- `POST /api/rules` — Create a new rule.

---

## Duplicate Prevention
- Uses SHA256 hash of key fields (user, event_type, message, etc.).
- Checks for recent events with same hash (2-minute window).
- Near-duplicates handled by including message and event_type in hash.

---

## Alert Fatigue Strategy
- Per-user rate limits (10min, 24hr caps).
- Fatigue service checks history and applies caps.
- Optionally, can extend to batching/digest in future.

---

## Fallback Strategy
- All controller logic is wrapped in try-catch.
- If a dependent service fails, returns a safe default (e.g., Later, not Never for important events).
- Errors are logged and surfaced in API response.

---

## Metrics & Monitoring
- Log all decisions and reasons (AuditLog).
- Track error rates, decision distribution, and latency.
- Monitor DB health and service uptime.

---

## File-by-File Explanation

- **server.js**: Entry point, loads env, connects DB, starts server.
- **src/app.js**: Express app, sets up routes and middleware.
- **src/config/db.js**: MongoDB connection logic.
- **src/routes/**: API route definitions for notifications and rules.
- **src/controllers/**: Handles API requests, wraps logic in try-catch, calls services.
- **src/models/**: Mongoose schemas for events, rules, user history, audit logs.
- **src/services/decision.service.js**: Main decision logic (expiry, dedupe, rules, fatigue, scoring).
- **src/services/dedupe.service.js**: Checks for duplicates using hash and recent window.
- **src/services/fatigue.service.js**: Checks user notification history for fatigue/rate limits.
- **src/services/scoring.service.js**: Assigns a score to each event based on priority and type.
- **src/utils/**: Utility functions for time and hashing.

---

## Test Cases (Suggested)
- Evaluate notification with expired timestamp → returns Never.
- Send duplicate notification within 2 minutes → returns Never.
- Send notification with custom rule (e.g., event_type=promo, decision=Never) → returns Never.
- Exceed 10min or 24hr cap for user → returns Later or Never.
- High-priority event (e.g., security_alert) → returns Now.
- Service error (e.g., DB down) → returns error with safe fallback, logs error.

---

## How to Run
1. Install dependencies: `npm install`
2. Set up MongoDB and .env file (see below).
3. Start server: `node server.js`

---

## .env Example
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/notifications
RATE_LIMIT_10MIN=10
DAILY_LIMIT=50
```

---

## AI/Tool Usage
- Solution crafted with GitHub Copilot (GPT-4.1) for code, structure, and documentation.
- Manual review and adjustments for clarity and best practices.

---

## Video Walkthrough
- Use this README as your script outline.
- Walk through each file and explain its role as above.
- Demo test cases using Postman or curl.

---

## License
MIT
