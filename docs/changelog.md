# Changelog

All notable changes to MAVEN are documented here.

Format follows Keep a Changelog and Semantic Versioning principles.

## [Unreleased]

### Added
- Investor onboarding module (`backend/investor_onboarding/`) with LangGraph state flow.
- Onboarding APIs:
  - `POST /api/onboarding/chat`
  - `GET /api/onboarding/status`
  - `POST /api/onboarding/confirm`
- Persona persistence tables and conversation persistence:
  - `investor_personas`
  - `onboarding_conversations`
- News ingestion pipeline (`backend/news_agent/`) and `GET /api/news/feed`.
- Market ingestion/analysis pipeline (`backend/market_agent/`) and `/api/market/*` APIs.
- Registration KYC OCR integration with `POST /api/kyc/upload`.
- Frontend onboarding experience at `/onboarding`.
- Frontend market and news pages wired to backend APIs.

### Changed
- Backend startup now mounts onboarding router under `/api/onboarding`.
- Scheduler-based background refresh is used for market/news workloads.
- Documentation in `docs/` updated to reflect current implemented state only.
