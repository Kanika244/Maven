# MAVEN: Multi-Agent Wealth and Equity Navigator (Agent Entry Point)

This is the project entry point for engineering work.

## Project Overview
MAVEN is an AI-enabled investor platform focused on Indian equity workflows.  
Current implementation combines:
- FastAPI backend (`/backend`) with PostgreSQL (Supabase) and scheduled market/news ingestion.
- React + TanStack Router frontend (`/frontend`) with dark-theme dashboard UX.

## Implemented Agents
### 1. Investor Onboarding Agent (`backend/investor_onboarding/`)
- Uses LangGraph state flow + Groq Llama model.
- Accepts free-form user chat and extracts profile fields.
- Validates missing fields and asks one follow-up question at a time.
- Calculates metrics and risk score in Python.
- Generates and persists final investor persona.

### 2. Market Agent (`backend/market_agent/`)
- Pulls Nifty 50 quote snapshots and technical/fundamental context.
- Stores:
  - `market_quotes`
  - `corporate_announcements`
  - `quarterly_financials`
- Generates per-company sentiment + analysis summary.
- Exposes market endpoints consumed by `/market` frontend route.

### 3. News Agent (`backend/news_agent/`)
- Fetches RSS feeds on schedule.
- Deduplicates by article link.
- Runs sentiment + summary + ticker matching.
- Stores output in `news_articles`.
- Exposes `/api/news/feed` consumed by `/news`.

## Runtime Scheduling
Defined in `backend/main.py` via APScheduler:
- News fetch: every 15 minutes
- Market cycle (quotes + announcements + analysis): every 15 minutes
- Quarterly financial refresh: every 6 hours

Jobs are background-scheduled at startup; API availability is not blocked by initial data ingestion.

## Where to Look Next
1. **[architecture.md](architecture.md)** for modules, APIs, and scheduling details.
2. **[schema.md](schema.md)** for the exact implemented PostgreSQL tables/columns.
3. **[design.md](design.md)** for frontend route behavior and UI system.
4. **[changelog.md](changelog.md)** for documented project updates.
5. **[todo.md](todo.md)** for current implementation-status checklist (not future roadmap).

## Important Constraints
- Project is Lovable-connected: avoid history rewriting on pushed branches.
- Keep changes aligned with existing TanStack + Tailwind + FastAPI patterns.
- Treat SQLAlchemy models in `backend/models.py` as schema source of truth.
