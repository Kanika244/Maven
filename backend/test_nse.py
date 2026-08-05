"""
Quick standalone test — no DB, no scheduler, no FastAPI.
Run this directly from backend/ whenever you're debugging market data:

    python test_nse.py
"""

import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

from market_agent import nsetools_client
from market_agent import yfinance_client
from market_agent.nse_client import nse_client

print("=" * 60)
print("1. Market overview (nsetools)")
print("=" * 60)
print(nsetools_client.get_market_overview())

print()
print("=" * 60)
print("2. Symbol snapshot: RELIANCE (yfinance)")
print("=" * 60)
snap = yfinance_client.get_symbol_snapshot("RELIANCE")
closes = snap.pop("closes")
print(snap)
print(f"({len(closes)} historical closes fetched alongside this)")

print()
print("=" * 60)
print("3. Symbol snapshot: TCS (yfinance) — sanity check on a 2nd symbol")
print("=" * 60)
snap2 = yfinance_client.get_symbol_snapshot("TCS")
snap2.pop("closes")
print(snap2)

print()
print("=" * 60)
print("4. Corporate announcements (raw nse_client, first 3 shown)")
print("=" * 60)
announcements = nse_client.get_corporate_announcements()
print(f"Got {len(announcements)} announcements")
for a in announcements[:3]:
    print(a)

print()
print("=" * 60)
print("Done. If sections 2/3 show ltp=None, paste the printed dict back —")
print("means yfinance's .info schema differs from what we assumed.")
print("=" * 60)