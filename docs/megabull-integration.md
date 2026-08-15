# MegaBull Portfolio Integration

MAVEN displays a read-only portfolio from MegaBull’s paper-trading API. MegaBull uses the `api-key` request header and the production base URL `https://api.megabull.in`.

## Configuration

Set these variables in the backend environment:

```env
MEGABULL_API_KEY=replace-with-the-key-generated-in-MegaBull-Profile
MEGABULL_API_BASE_URL=https://api.megabull.in
```

The API key stays server-side. It is never sent to the browser, stored in PostgreSQL, or included in logs. MegaBull keys expire after one month and must be regenerated and replaced in the deployment environment.

## Account mapping

The first version uses one deployment-level API key. `GET /api/portfolio` calls MegaBull’s user endpoint and requires its returned `emailId` to match the authenticated Maven user email, case-insensitively. A mismatch returns an error and no portfolio data is shown. Multi-user deployments require a later encrypted per-user key design.

## Data flow

The protected endpoint calls these read-only MegaBull endpoints:

- `/api/user/my` — account identity and virtual balance
- `/api/holding/my` — delivery holdings
- `/api/position/my` — open positions
- `/api/order/my` — open and executed orders
- `/api/report/virtual/{start}/{end}` — optional virtual-money history

The backend normalizes the response before returning it to the frontend. The portfolio page loads on entry and supports manual refresh; no portfolio snapshot is persisted locally.

## Purchase dates

MegaBull holdings provide quantities, average prices, and P&L, but not acquisition timestamps. MAVEN matches executed BUY orders to each holding by instrument token/name and shows the first and latest matching buy timestamps plus transaction details. If no matching order is available, the purchase date is shown as unavailable rather than inferred.

All values represent virtual paper-trading money and are not real brokerage holdings or investment returns.
