# Hardcoded ticker -> company-name aliases used to tag news articles with
# "related" stocks by simple substring matching. Extend this list as needed;
# swap for a DB-backed stocks table later without changing match_tickers.

TICKER_ALIASES: dict[str, list[str]] = {
    "RELIANCE": ["reliance industries", "reliance"],
    "TCS": ["tata consultancy services", "tcs"],
    "HDFCBANK": ["hdfc bank"],
    "ICICIBANK": ["icici bank"],
    "INFY": ["infosys"],
    "HINDUNILVR": ["hindustan unilever"],
    "ITC": ["itc ltd", "itc limited"],
    "SBIN": ["state bank of india", "sbi"],
    "BHARTIARTL": ["bharti airtel", "airtel"],
    "LT": ["larsen & toubro", "larsen and toubro", "l&t"],
    "KOTAKBANK": ["kotak mahindra bank", "kotak bank"],
    "AXISBANK": ["axis bank"],
    "MARUTI": ["maruti suzuki"],
    "SUNPHARMA": ["sun pharma", "sun pharmaceutical"],
    "TITAN": ["titan company"],
    "ASIANPAINT": ["asian paints"],
    "WIPRO": ["wipro"],
    "ADANIENT": ["adani enterprises"],
    "ADANIPORTS": ["adani ports"],
    "TATASTEEL": ["tata steel"],
    "TATAMOTORS": ["tata motors"],
    "NTPC": ["ntpc"],
    "POWERGRID": ["power grid corporation", "powergrid"],
    "ONGC": ["oil and natural gas corporation", "ongc"],
    "COALINDIA": ["coal india"],
    "BAJFINANCE": ["bajaj finance"],
    "NESTLEIND": ["nestle india"],
    "ULTRACEMCO": ["ultratech cement"],
    "JSWSTEEL": ["jsw steel"],
    "GRASIM": ["grasim industries"],
}


def match_tickers(text: str, limit: int = 5) -> list[str]:
    """Return tickers whose company name/aliases appear in the given text."""
    lowered = text.lower()
    matches = [
        ticker
        for ticker, aliases in TICKER_ALIASES.items()
        if any(alias in lowered for alias in aliases)
    ]
    return matches[:limit]