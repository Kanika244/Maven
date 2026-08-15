# Implementation Status (Current)

This file tracks what is implemented now (not future roadmap).

## Completed

### Authentication and account
- Public landing page with separate sign-in and registration CTAs
- Email OTP registration flow
- Login with JWT
- Password setup/change/forgot/reset
- Profile read/write APIs
- Account export/delete APIs

### KYC
- PAN/Aadhaar upload endpoint
- OCR extraction from image/PDF
- Extracted details persisted in PostgreSQL

### Investor onboarding
- Registration-integrated onboarding flow on `/register`
- Chat-based onboarding UI
- LangGraph-backed backend flow
- Missing-field follow-up prompts
- Financial metric and risk score computation
- Persona generation and confirmation
- Persona + conversation persistence
- Persist and display structured chatbot answers in the investor profile
- Replace profile-page mock holdings and placeholder controls with real persisted user data

### News intelligence
- Scheduled RSS ingestion
- Sentiment scoring and AI summary generation
- Ticker matching
- News feed API and frontend page integration

### Market intelligence
- Scheduled Nifty 50 quote refresh
- Corporate announcements ingestion
- Quarterly financial ingestion
- Per-company AI analysis generation
- Market APIs and frontend market page integration

### MegaBull portfolio
- Read-only MegaBull API integration
- Maven/MegaBull email matching
- Live holdings, positions, orders, balances, and derived purchase dates
- Portfolio refresh and CSV export

## Current limitations / known gaps
- Onboarding backend uses invoke-style responses (no streamed token-by-token API response yet).
- Onboarding graph state checkpointer is in-memory; persistence across backend restarts depends on saved conversation/persona data rather than checkpointer storage.
- Some non-market/non-news screens still rely partly on mock presentation data.
- MegaBull currently uses one deployment-level API key; keys expire monthly.
- MegaBull holdings do not include acquisition timestamps, so purchase dates are derived from executed orders.
