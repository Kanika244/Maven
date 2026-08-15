from fastapi import APIRouter, Depends, HTTPException

from models import User
from router.auth import get_current_user
from portfolio.megabull import MegaBullClient, MegaBullError

portfoliorouter = APIRouter()


@portfoliorouter.get("")
async def get_portfolio(current_user: User = Depends(get_current_user)):
    client = MegaBullClient()
    try:
        account = await client.user()
        megabull_email = str(account.get("emailId") or "").strip().lower()
        if not megabull_email or megabull_email != current_user.email.strip().lower():
            raise HTTPException(
                status_code=409,
                detail="The configured MegaBull account email does not match your Maven account email.",
            )
        return await client.portfolio_from_user(account)
    except MegaBullError as exc:
        status = exc.status_code if exc.status_code in {401, 402, 503} else 502
        if exc.status_code == 401:
            detail = "MegaBull API key is missing, invalid, or expired."
        elif exc.status_code == 402:
            detail = "MegaBull denied access to this account."
        else:
            detail = str(exc)
        raise HTTPException(status_code=status, detail=detail) from exc
