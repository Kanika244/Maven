"""
Wraps `nsetools` for the index-level overview only. Its per-symbol calls
(get_stock_quote_in_index, get_quote) turned out to hit the exact same
broken/blocked raw NSE endpoints we'd already ruled out — nsetools wraps
plain `requests` under the hood, it doesn't do anything special to get
past NSE's Akamai protection. get_index_quote, used here, is the one
call that's actually been confirmed working end-to-end.

Per-symbol quotes + historicals moved to yfinance_client.py.
"""

import logging

from nsetools import Nse

logger = logging.getLogger(__name__)

_nse = Nse()


def get_market_overview() -> dict:
    try:
        idx = _nse.get_index_quote("NIFTY 50")
    except Exception:
        logger.exception("nsetools get_index_quote(NIFTY 50) failed")
        idx = {}

    vix = None
    try:
        vix_data = _nse.get_index_quote("INDIA VIX")
        vix = vix_data.get("last")
    except Exception:
        logger.exception("nsetools get_index_quote(INDIA VIX) failed")

    return {
        "level": idx.get("last"),
        "change": idx.get("variation"),
        "changePct": idx.get("percentChange"),
        "dayHigh": idx.get("high"),
        "dayLow": idx.get("low"),
        "pe": idx.get("pe"),
        "advances": idx.get("advances"),
        "declines": idx.get("declines"),
        "vix": vix,
    }