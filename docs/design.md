# Frontend Design & UX (Current Implementation)

This document captures the current UI system and route behavior.

## Design direction
- Dark-first premium finance interface.
- High information density with clear visual hierarchy.
- Consistent use of sentiment and trend color semantics.

## Tech and styling system
- React 19 + TanStack Router
- Tailwind CSS v4
- Radix UI primitives
- Lucide icons
- Recharts for charts

Theme and design tokens are centralized in `frontend/src/styles.css`.

## Layout model
- Shared shell route: `/_app`
- Sidebar navigation groups:
  - Overview
  - Intelligence
  - Markets
  - Account
- Sticky top header with search and market status chip.
- Main content area rendered inside `AppShell`.

## Implemented route UX

### Public/auth routes
- `/`: public MAVEN landing page with product positioning, feature overview, MegaBull paper-trading callout, and Login/Register CTAs.
- `/login`: email/password sign-in, keep-signed-in option.
- `/register`: multi-step flow (account, personal details, PAN, Aadhaar).
- `/forgot-password`: password reset entry flow.

### App routes
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

The root landing page is intentionally separate from authentication so visitors can understand the product before signing in or creating an account.

## Real investor profile data
- Registration fields (name, email, phone, and city) are loaded from the authenticated profile API.
- Chatbot answers are persisted after persona confirmation and displayed in the Investor Profile page.
- Dashboard greeting, sidebar name/initials, risk label, and investment style use the authenticated user/profile response instead of mock identity values.
- Investor Profile is a real-data view containing account details, confirmed persona, chatbot-derived financial context, goals, behaviour, and existing investments; mock holdings and placeholder preference controls are excluded.

## Onboarding UI (implemented)
- Route: `/register` after the registration/profile steps
- Uses the same split AuthLayout as registration, with the brand panel on the left and the AI conversation on the right.
- Chat-style conversation panel with:
  - user and assistant message bubbles
  - typing indicator
  - auto-scroll
  - persona summary card once generated
  - confirm button that finalizes onboarding
- Uses backend endpoints:
  - `GET /api/onboarding/status`
  - `POST /api/onboarding/chat`
  - `POST /api/onboarding/confirm`
- The old `/onboarding` URL redirects to `/register` and is not rendered inside the dashboard shell.

## Market page UX (implemented)
- Route: `/market`
- Data panels:
  - Nifty and breadth snapshot cards
  - sector performance chart
  - heatmap by % change
  - searchable company table
  - expandable AI analysis per symbol
- Uses:
  - `/api/market/overview`
  - `/api/market/companies`

## News page UX (implemented)
- Route: `/news`
- Displays:
  - sentiment counters (positive/neutral/negative)
  - filter chips
  - article cards with source, relative timestamp, AI summary, related tickers
- Uses:
  - `/api/news/feed`

## Portfolio page UX (implemented)
- Route: `/portfolio`
- Read-only MegaBull account view with virtual balance, delivery holdings, open positions, and executed orders.
- Holdings show quantity, average buy price, invested/current value, P&L, first purchase, latest purchase, and transaction detail.
- Purchase dates are derived from executed MegaBull orders and are marked unavailable when no matching order exists.
- Includes loading, retry, API-key/account mismatch, empty-state, manual refresh, and CSV export states.
- Uses `GET /api/portfolio`; the API key is server-side only.

## Current UI conventions
- Use semantic utility classes (`text-positive`, `text-negative`, `bg-card`, etc.).
- Financial numbers should use mono/tabular numeric styling where available (`font-num`).
- Reuse existing component primitives under `src/components/ui` and `src/components/maven`.
