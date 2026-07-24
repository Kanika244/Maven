# RSS feed sources for the news agent. Verify each URL still resolves
# periodically (RSS endpoints do get renamed/retired by publishers).

RSS_FEEDS: list[dict] = [
    {"name": "Moneycontrol", "url": "https://www.moneycontrol.com/rss/latestnews.xml"},
    {"name": "Economic Times", "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"},
    {"name": "Yahoo Finance", "url": "https://finance.yahoo.com/news/rssindex"},
]