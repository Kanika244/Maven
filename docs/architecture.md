# Technical Architecture

This document describes the currently implemented MAVEN architecture.

## Backend (`/backend`)

### Core stack
- FastAPI
- SQLAlchemy async ORM with `asyncpg`
- PostgreSQL (Supabase)
- APScheduler background jobs
- Groq + LangGraph for AI flows

### App entrypoint
`backend/main.py` is the runtime entrypoint and does the following:
- Initializes FastAPI and CORS.
- Ensures tables exist with `Base.metadata.create_all`.
- Mounts routers:
  - `/api/auth`
  - `/api/kyc`
  - `/api/onboarding`
  - `/api/news`
  - `/api/market`
  - `/api/portfolio`
- Starts APScheduler jobs:
  - News refresh every 15 minutes
  - Market refresh cycle every 15 minutes
  - Quarterly financial refresh every 6 hours

### API modules

#### `router/auth.py`
Implements account/auth flows:
- registration + OTP verification
- login
- password setup / change / forgot / reset
- profile read/write
- account export/delete
- profile responses include registration fields plus the extracted investor data captured during onboarding

JWT bearer tokens are used for protected APIs.

#### `router/kyc.py`
Implements `POST /api/kyc/upload`:
- accepts PAN/Aadhaar documents (image/PDF)
- extracts ID information using OCR
- stores extraction records in `kyc_documents`

#### `investor_onboarding/router.py`
Implements onboarding APIs:
- `POST /api/onboarding/chat`
- `GET /api/onboarding/status`
- `POST /api/onboarding/confirm`

Handles chat persistence and persona persistence.

#### `news_agent/news_router.py`
Implements:
- `GET /api/news/feed` (optional sentiment filter + limit)

#### `market_agent/market_router.py`
Implements:
- `GET /api/market/overview`
- `GET /api/market/companies`
- `GET /api/market/companies/{symbol}`
- `GET /api/market/companies/{symbol}/announcements`
- `GET /api/market/companies/{symbol}/quarterly`

#### `router/portfolio.py` and `portfolio/megabull.py`
Implements the protected read-only MegaBull integration:
- `GET /api/portfolio`
- server-side `MEGABULL_API_KEY` authentication
- Maven/MegaBull email matching
- normalized account, holdings, positions, orders, and report data
- purchase dates derived from executed BUY orders

### Agent/service modules

#### Investor Onboarding Agent (`investor_onboarding/`)
- LangGraph state graph (`extract`, `follow_up`, `calculate`, `persona`).
- Uses Groq model for extraction + persona generation.
- Uses Python logic for validation, metrics, and risk scoring.
- Persists final persona to `investor_personas`.
- Persists the extracted chatbot profile alongside the persona in `investor_personas.financial_metrics_json.extracted_profile`.
- Persists messages to `onboarding_conversations`.

#### News Agent (`news_agent/`)
- Pulls RSS feeds on schedule.
- Deduplicates by article link.
- Runs sentiment + summary generation and ticker matching.
- Stores in `news_articles`.

#### Market Agent (`market_agent/`)
- Pulls Nifty 50 market snapshots.
- Pulls and stores corporate announcements.
- Pulls and upserts quarterly financials.
- Generates per-company sentiment + analysis summary.
- Stores in:
  - `market_quotes`
  - `corporate_announcements`
  - `quarterly_financials`

## Frontend (`/frontend`)

### Core stack
- React 19
- TanStack Router (file-based routing)
- Vite
- Tailwind CSS v4
- Radix UI + Lucide icons

### Route map (implemented)
- Public routes:
  - `/` (MAVEN landing page)
  - `/login`
  - `/register`
  - `/forgot-password`
- App routes:
  - `/dashboard`
  - `/portfolio`
  - `/recommendations`
  - `/rebalancing`
  - `/explainability`
  - `/assistant`
  - `/market`
  - `/news`
  - `/onboarding` (legacy redirect to `/register`)
  - `/profile`
  - `/settings`

### Integration behavior
- API base URL comes from `VITE_API_URL` (fallback `http://localhost:8000`).
- Login stores bearer token in localStorage/sessionStorage.
- `/` is a public marketing/entry page with links to `/login` and `/register`.
- `/login` remains the dedicated sign-in experience; authentication does not render at `/`.
- Registration transitions directly from the account/profile steps into the onboarding conversation on `/register`.
- Legacy `/onboarding` navigation redirects to `/register`; onboarding is no longer rendered inside the dashboard shell.
- Post-login flow checks onboarding status:
  - onboarding complete -> `/dashboard`
  - onboarding incomplete -> `/register` in onboarding mode
- Market and news pages call backend data endpoints directly.
- Portfolio calls `/api/portfolio` with the Maven bearer token; the MegaBull key never reaches the frontend.
- Dashboard shell, dashboard greeting, and profile UI load identity/profile values from `/api/auth/profile` instead of mock investor identity data.
- The profile page only renders persisted account, onboarding, and persona data; presentation-only mock holdings/preferences are not used there.

## End-to-end flow (current)
1. User authenticates via `/api/auth`.
2. Registration flow collects KYC docs via `/api/kyc/upload`.
3. User completes registration and the onboarding conversation on `/register` via `/api/onboarding`.
4. Persona and extracted investor answers are saved; the profile endpoint exposes both registration and chatbot data.
5. News/market datasets are continuously refreshed by scheduler jobs.
6. The portfolio page fetches the matching MegaBull paper account on load or manual refresh.
