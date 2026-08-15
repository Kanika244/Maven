import json
import logging

from groq import Groq
from investor_onboarding.groq_utils import get_groq_api_key

logger = logging.getLogger(__name__)


_client = Groq(api_key=get_groq_api_key())

# Free, fast Llama model on Groq. Swap this string if Groq changes their
# free-tier model lineup.
_MODEL = "llama-3.1-8b-instant"

_SYSTEM_PROMPT = (
    "You are a financial news sentiment classifier for an investing app. "
    "Given a news headline and description, respond with ONLY a JSON object "
    '(no markdown, no preamble) in this exact shape: '
    '{"sentiment": "Positive"|"Neutral"|"Negative", "score": <float 0.0-1.0>, '
    '"summary": "<one or two sentence plain-English summary>"}. '
    "score is your confidence in the sentiment label, not the sentiment's "
    "strength."
)


def score_article(title: str, description: str) -> dict:
    """Call the LLM to get {sentiment, score, summary} for one article.

    Isolated in this one function so swapping providers later only means
    editing this file.
    """
    try:
        response = _client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": f"Headline: {title}\n\nDescription: {description}"},
            ],
            temperature=0.2,
            max_tokens=200,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        return {
            "sentiment": data.get("sentiment", "Neutral"),
            "score": float(data.get("score", 0.5)),
            "summary": data.get("summary", description[:200]),
        }
    except Exception:
        logger.exception("Sentiment scoring failed for article: %s", title)
        # Fail safe: still store the article, just without sentiment data,
        # rather than losing it entirely because the LLM call failed.
        return {"sentiment": None, "score": None, "summary": description[:200] if description else None}
