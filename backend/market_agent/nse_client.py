"""
Thin client around nseindia.com's unofficial corporate-announcements
endpoint — the one part of the raw NSE API that actually works with a
plain `requests` session. Live quotes and per-symbol detail moved to
nsetools_client.py after equity-stockIndices turned out to be a dead path
and quote-equity turned out to be Akamai-blocked at the TLS level (not
fixable from the `requests` side — see chat history for the debugging
that led here).
"""

import logging
from datetime import datetime, timedelta
from urllib.parse import urlencode, quote

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://www.nseindia.com"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Referer": "https://www.nseindia.com/companies-listing/corporate-filings-announcements",
    "X-Requested-With": "XMLHttpRequest",
}


class NSEClient:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self._warmed_up = False

    def _warm_up(self):
        try:
            self.session.get(BASE_URL, timeout=10)
            self.session.get(
                f"{BASE_URL}/companies-listing/corporate-filings-announcements", timeout=10
            )
            self._warmed_up = True
        except requests.RequestException:
            logger.exception("Failed to warm up NSE session")
            self._warmed_up = False

    def _get(self, path: str, params: dict | None = None, retry: bool = True) -> dict | list | None:
        if not self._warmed_up:
            self._warm_up()

        url = f"{BASE_URL}{path}"
        if params:
            url = f"{url}?{urlencode(params, quote_via=quote)}"  # NSE wants %20, not +

        try:
            resp = self.session.get(url, timeout=10)

            if resp.status_code in (401, 403, 404) and retry:
                logger.warning(
                    "NSE returned %s for %s — re-warming and retrying once. Body starts: %r",
                    resp.status_code, path, resp.text[:150],
                )
                self._warmed_up = False
                self._warm_up()
                return self._get(path, params=params, retry=False)

            resp.raise_for_status()

            try:
                return resp.json()
            except requests.exceptions.JSONDecodeError:
                logger.warning("NSE returned non-JSON for %s (body starts: %r)", path, resp.text[:150])
                if retry:
                    self._warmed_up = False
                    self._warm_up()
                    return self._get(path, params=params, retry=False)
                return None
        except requests.RequestException:
            logger.exception("NSE request failed: %s", path)
            return None

    def get_corporate_announcements(self, days_back: int = 30) -> list[dict]:
        """Market-wide announcements for the last `days_back` days.

        Defaults to 30 days rather than a tighter window — results filings
        specifically are infrequent (a handful of times a year per
        company), so a short window has a real chance of catching zero of
        them even though the fetch itself runs every 15 minutes. Ongoing
        announcements still get caught the cycle after they're posted
        either way, since we dedupe on (symbol, date, subject) — a wider
        window just means more history re-scanned each time, not slower
        detection of new ones.

        Fetched once (not per-symbol) — each item carries its own `symbol`
        field, so we bucket them locally in market_service.py instead of
        making 50 extra requests.
        """
        to_date = datetime.now()
        from_date = to_date - timedelta(days=days_back)
        params = {
            "index": "equities",
            "from_date": from_date.strftime("%d-%m-%Y"),
            "to_date": to_date.strftime("%d-%m-%Y"),
        }
        data = self._get("/api/corporate-announcements", params=params)
        return data if isinstance(data, list) else (data or {}).get("data", [])


# Module-level singleton so the whole app shares one warmed-up session
# instead of every caller re-doing the cookie handshake.
nse_client = NSEClient()