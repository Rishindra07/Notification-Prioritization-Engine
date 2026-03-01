# DEPLOYMENT.md

## Deployment Targets
- Frontend: Vercel (React app in `frontend/`)
- Backend: Render/Railway/Fly/AWS App Runner (Node app in `backend/`)
- Database: MongoDB Atlas

## Production Environment Variables

### Backend
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN` (set to deployed frontend URL)
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_NAME`
- `AI_TIMEOUT_MS`
- `AI_MAX_RETRIES`
- `AI_CIRCUIT_FAILURE_THRESHOLD`
- `AI_CIRCUIT_RESET_MS`
- `LATER_QUEUE_INTERVAL_SECONDS`
- `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`
- `DEMO_OPERATOR_EMAIL`, `DEMO_OPERATOR_PASSWORD`

### Frontend
- `VITE_API_BASE_URL` (set to deployed backend `/api`)

## Deployment Steps
1. Push repository to GitHub.
2. Provision MongoDB Atlas and whitelist backend egress.
3. Deploy backend service and set all backend env vars.
4. Verify backend health endpoint.
5. Deploy frontend to Vercel from `frontend/`.
6. Set `VITE_API_BASE_URL` to backend API base URL.
7. Validate login, simulator, rules, queue, and metrics flows on live URLs.

## Local vs Production Differences
- Production uses Atlas + cloud runtime URLs.
- CORS origin is strict in production.
- OpenRouter key is configured via platform secret manager.

## Redeploy Trigger
- Any push to deployment branch (`main`) triggers redeploy.
- Manual redeploy can be run from provider dashboard if verification requires rerun.
