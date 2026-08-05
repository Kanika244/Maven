"""Structured quarterly financials via yfinance — no PDF parsing needed for
this part, Yahoo already has revenue/net income/EPS as clean numbers.

yfinance renamed `.quarterly_financials` to `.quarterly_income_stmt` in
recent versions; we try the new name first and fall back to the old one
for compatibility with whatever's actually installed.
"""

import logging
import math

import yfinance as yf

logger = logging.getLogger(__name__)


def _clean(value):
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    return None if (math.isnan(f) or math.isinf(f)) else f


def _get_row(df, *possible_labels):
    """yfinance's row labels for the same concept vary by company/version
    (e.g. 'Total Revenue' vs 'Operating Revenue') — try each in order."""
    for label in possible_labels:
        if label in df.index:
            return df.loc[label]
    return None


def get_quarterly_financials(symbol: str, quarters: int = 8) -> list[dict]:
    """Returns newest-first list of dicts:
    {quarter_end, revenue, net_income, eps, yoy_revenue_growth, yoy_profit_growth}

    yoy_* compares each quarter to the same quarter 4 columns back (i.e.
    4 quarters prior) — only populated if that much history is available.
    """
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        df = getattr(ticker, "quarterly_income_stmt", None)
        if df is None or df.empty:
            df = ticker.quarterly_financials
        if df is None or df.empty:
            return []

        revenue_row = _get_row(df, "Total Revenue", "Operating Revenue")
        net_income_row = _get_row(df, "Net Income", "Net Income Common Stockholders")
        eps_row = _get_row(df, "Diluted EPS", "Basic EPS")

        columns = list(df.columns)[:quarters]
        results = []
        for i, col in enumerate(columns):
            revenue = _clean(revenue_row.get(col)) if revenue_row is not None else None
            net_income = _clean(net_income_row.get(col)) if net_income_row is not None else None
            eps = _clean(eps_row.get(col)) if eps_row is not None else None

            yoy_revenue_growth = None
            yoy_profit_growth = None
            if i + 4 < len(df.columns):
                prior_col = df.columns[i + 4]
                if revenue_row is not None:
                    prior_rev = _clean(revenue_row.get(prior_col))
                    if revenue and prior_rev:
                        yoy_revenue_growth = round((revenue - prior_rev) / abs(prior_rev) * 100, 2)
                if net_income_row is not None:
                    prior_ni = _clean(net_income_row.get(prior_col))
                    if net_income is not None and prior_ni:
                        yoy_profit_growth = round((net_income - prior_ni) / abs(prior_ni) * 100, 2)

            results.append({
                "quarter_end": col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col),
                "revenue": revenue,
                "net_income": net_income,
                "eps": eps,
                "yoy_revenue_growth": yoy_revenue_growth,
                "yoy_profit_growth": yoy_profit_growth,
            })
        return results
    except Exception:
        logger.exception("Quarterly financials fetch failed for %s", symbol)
        return []
