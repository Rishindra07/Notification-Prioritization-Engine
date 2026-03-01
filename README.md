# Notification Prioritization Engine (MERN Stack)

This repository contains the MERN implementation for the Round 2 Build & Ship challenge.

## Project Structure
- `backend/`: Express + MongoDB backend with decision pipeline, async AI processing, fallback, audit logs, and LATER queue scheduler.
- `frontend/`: React app with login, event simulator, live dashboard, audit log, queue view, rules manager, and metrics screens.

## AI Provider
- Provider: OpenRouter
- Endpoint used by backend: `https://openrouter.ai/api/v1/chat/completions`
- Default model: `openai/gpt-4o-mini` (configurable via `OPENROUTER_MODEL`)
- Fallback behavior: if OpenRouter fails repeatedly, the circuit breaker opens and score-based classification is used.

## Local Run

### Backend
1. `cd backend`
2. Copy env template: `.env.example -> .env`
3. Fill required values: `MONGO_URI`, `JWT_SECRET`, `OPENROUTER_API_KEY`
4. `npm install`
5. `npm run dev`

Backend base URL: `http://localhost:5000`
Health: `http://localhost:5000/api/health`

### Frontend
1. `cd frontend`
2. Copy env template: `.env.example -> .env`
3. `npm install`
4. `npm run dev`

Frontend URL: `http://localhost:5173`

## Demo Credentials (shown on login page)
- Admin: `admin@demo.com / Admin@123`
- Operator: `operator@demo.com / Operator@123`

## Mandatory Docs
- `SYSTEM_WORKFLOW.md`
- `BUILD_PLAN.md`
- `PLAN_OF_ACTION.md`
- `ARCHITECTURE_DECISIONS.md`
- `DEPLOYMENT.md`
