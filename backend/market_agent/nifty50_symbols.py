# Nifty 50 constituents as of mid-2026. Index composition is reviewed by
# NSE twice a year (Mar/Sep) — re-check this list against
# https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%2050
# after each rebalance rather than assuming it's static.
#
# Note: "TATAMOTORS" traded as TMPV from Oct 24, 2025 onward, following
# Tata Motors' Oct 1, 2025 demerger (passenger vehicles + JLR retained the
# Nifty 50 slot as Tata Motors Passenger Vehicles; commercial vehicles
# spun off separately). Update again if the symbol changes further.

NIFTY_50_SYMBOLS: list[str] = [
    "RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "INFY", "HINDUNILVR", "ITC",
    "SBIN", "BHARTIARTL", "LT", "KOTAKBANK", "AXISBANK", "MARUTI",
    "SUNPHARMA", "TITAN", "ASIANPAINT", "WIPRO", "ADANIENT", "ADANIPORTS",
    "TATASTEEL", "TMPV", "NTPC", "POWERGRID", "ONGC", "COALINDIA",
    "BAJFINANCE", "NESTLEIND", "ULTRACEMCO", "JSWSTEEL", "GRASIM",
    "BAJAJFINSV", "HCLTECH", "DRREDDY", "CIPLA", "DIVISLAB", "EICHERMOT",
    "HEROMOTOCO", "HINDALCO", "INDUSINDBK", "M&M", "SBILIFE", "HDFCLIFE",
    "TATACONSUM", "TECHM", "APOLLOHOSP", "BAJAJ-AUTO", "BPCL", "BRITANNIA",
    "SHRIRAMFIN", "TRENT",
]