"""
Live quote + historical data via yfinance, using the ".NS" suffix for
NSE-listed tickers (e.g. "RELIANCE.NS").

This replaced both the raw nse_client per-symbol calls AND nsetools'
per-symbol calls (get_stock_quote_in_index / get_quote) after both turned
out to hit the same two broken/blocked NSE endpoints under the hood —
nsetools wraps plain `requests` too, it doesn't bypass Akamai. yfinance
works because it never talks to NSE at all; it talks to Yahoo Finance's
own servers, which mirror NSE prices under the .NS suffix. That's a
different (working) path, not a smarter way of scraping the same one.

nsetools is still used for the index-level overview (nsetools_client.py) —
that one specific call (get_index_quote) is proven working.
"""

import logging
import math

# curl_cffi (yfinance's HTTP layer) has open, unresolved GitHub issues
# about failing to verify certs on Windows regardless of CURL_CA_BUNDLE /
# SSL_CERT_FILE (see yfinance issues #2450, #2463, curl_cffi issue #601) —
# it's a bug in how curl_cffi locates the CA bundle on Windows, not
# something fixable from our side by pointing at certifi more carefully
# (already tried that; it didn't help).
#
# The workaround curl_cffi's own FAQ recommends is disabling verification
# for the session. That's a real tradeoff — we're not confirming Yahoo's
# server identity — but this client only ever reads public stock quotes,
# nothing authenticated or sensitive, so it's contained to this one module
# rather than anything touching auth/KYC.
import curl_cffi.requests as _curl_requests

_original_session_init = _curl_requests.Session.__init__


def _session_init_no_verify(self, *args, **kwargs):
    kwargs.setdefault("verify", False)
    _original_session_init(self, *args, **kwargs)


_curl_requests.Session.__init__ = _session_init_no_verify

import warnings

warnings.filterwarnings("ignore", message="Unverified HTTPS request")

import yfinance as yf

logger = logging.getLogger(__name__)



def _clean(value):
    """yfinance's `.info` dict (and occasionally `.history()` closes) uses
    NaN for missing numeric fields, pandas-style. NaN/Infinity are valid
    Python floats but NOT valid JSON — Starlette's JSONResponse renders
    with allow_nan=False and throws a 500 the moment one of these reaches
    an API response. Storing a clean None instead is the actual fix, not
    a serialization-side patch.
    """
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value


def get_symbol_snapshot(symbol: str, history_days: int = 60) -> dict:
    """One yfinance Ticker → quote snapshot + historical closes (oldest
    first) for RSI, in a single object reuse (two requests total: info +
    history, vs re-creating the ticker for each).

    Returns a dict with everything zeroed/None if the fetch fails — callers
    should check `closes` and `ltp` before trusting the rest.
    """
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        info = ticker.info or {}
        hist = ticker.history(period=f"{history_days}d")
        raw_closes = hist["Close"].tolist() if not hist.empty else []
        closes = [c for c in raw_closes if not (math.isnan(c) or math.isinf(c))]

        ltp = _clean(info.get("currentPrice") or info.get("regularMarketPrice"))
        prev_close = _clean(info.get("previousClose"))
        change = (ltp - prev_close) if (ltp is not None and prev_close is not None) else None
        pct_change = (change / prev_close * 100) if (change is not None and prev_close) else None

        return {
            "symbol": symbol,
            "name": info.get("longName") or info.get("shortName") or symbol,
            "sector": info.get("sector"),
            "ltp": ltp,
            "prev_close": prev_close,
            "change": _clean(change),
            "pct_change": _clean(pct_change),
            "day_high": _clean(info.get("dayHigh")),
            "day_low": _clean(info.get("dayLow")),
            "year_high": _clean(info.get("fiftyTwoWeekHigh")),
            "year_low": _clean(info.get("fiftyTwoWeekLow")),
            "volume": _clean(info.get("volume")),
            "pe": _clean(info.get("trailingPE")),
            "closes": closes,
        }
    except Exception:
        logger.exception("yfinance snapshot failed for %s", symbol)
        return {
            "symbol": symbol, "name": symbol, "sector": None, "ltp": None,
            "prev_close": None, "change": None, "pct_change": None,
            "day_high": None, "day_low": None, "year_high": None,
            "year_low": None, "volume": None, "pe": None, "closes": [],
        }