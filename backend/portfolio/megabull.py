import os
from datetime import date, datetime, timedelta
from typing import Any

import httpx


class MegaBullError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class MegaBullClient:
    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        self.api_key = api_key or os.getenv("MEGABULL_API_KEY")
        self.base_url = (base_url or os.getenv("MEGABULL_API_BASE_URL", "https://api.megabull.in")).rstrip("/")
        self.timeout = float(os.getenv("MEGABULL_TIMEOUT_SECONDS", "15"))

    async def _get(self, path: str) -> Any:
        if not self.api_key:
            raise MegaBullError("MegaBull API key is not configured", 503)

        try:
            async with httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout) as client:
                response = await client.get(path, headers={"api-key": self.api_key})
        except httpx.RequestError as exc:
            raise MegaBullError("MegaBull is temporarily unreachable", 502) from exc

        if response.status_code >= 400:
            detail = "MegaBull request failed"
            try:
                body = response.json()
                messages = body.get("message", []) if isinstance(body, dict) else []
                if isinstance(messages, list) and messages:
                    detail = "; ".join(str(item) for item in messages)
                elif isinstance(body, dict) and body.get("error"):
                    detail = str(body["error"])
            except ValueError:
                pass
            raise MegaBullError(detail, response.status_code)

        try:
            return response.json()
        except ValueError as exc:
            raise MegaBullError("MegaBull returned an invalid response", 502) from exc

    async def user(self) -> dict[str, Any]:
        return await self._get("/api/user/my")

    async def holdings(self) -> list[dict[str, Any]]:
        return await self._get("/api/holding/my")

    async def positions(self) -> list[dict[str, Any]]:
        return await self._get("/api/position/my")

    async def orders(self) -> dict[str, Any]:
        return await self._get("/api/order/my")

    async def virtual_report(self) -> list[dict[str, Any]]:
        start = date.today() - timedelta(days=365)
        return await self._get(f"/api/report/virtual/{start.isoformat()}/{date.today().isoformat()}")

    async def portfolio(self) -> dict[str, Any]:
        user = await self.user()
        return await self.portfolio_from_user(user)

    async def portfolio_from_user(self, user: dict[str, Any]) -> dict[str, Any]:
        _, holdings, positions, orders = await self._get_portfolio_data(user)
        try:
            report = await self.virtual_report()
        except MegaBullError:
            report = []
        return normalize_portfolio(user, holdings, positions, orders, report)

    async def _get_portfolio_data(self, user: dict[str, Any] | None = None):
        return (
            user or await self.user(),
            await self.holdings(),
            await self.positions(),
            await self.orders(),
        )


def _number(value: Any, default: float = 0) -> float:
    try:
        return float(value) if value is not None else default
    except (TypeError, ValueError):
        return default


def _iso_timestamp(value: Any) -> str | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.isoformat()
    except ValueError:
        return str(value)


def _instrument_key(item: dict[str, Any]) -> str:
    return str(item.get("instrumentToken") or item.get("instrumentName") or "").strip().lower()


def normalize_portfolio(
    user: dict[str, Any],
    holdings: list[dict[str, Any]],
    positions: list[dict[str, Any]],
    orders: dict[str, Any],
    report: list[dict[str, Any]],
) -> dict[str, Any]:
    executed_orders = orders.get("executed", []) if isinstance(orders, dict) else []
    order_history: dict[str, list[dict[str, Any]]] = {}
    normalized_orders = []

    for order in executed_orders:
        key = _instrument_key(order)
        normalized = {
            "id": order.get("id"),
            "instrument_token": order.get("instrumentToken"),
            "instrument_name": order.get("instrumentName"),
            "side": order.get("type"),
            "quantity": order.get("qty"),
            "lot_size": order.get("lotSize"),
            "duration": order.get("duration"),
            "order_type": order.get("orderType"),
            "execution_type": order.get("executionType"),
            "price": order.get("price"),
            "status": order.get("status"),
            "message": order.get("msg"),
            "created_at": _iso_timestamp(order.get("createdTimestamp")),
            "modified_at": _iso_timestamp(order.get("modifiedTimestamp")),
        }
        normalized_orders.append(normalized)
        if key:
            order_history.setdefault(key, []).append(normalized)

    normalized_holdings = []
    for holding in holdings:
        quantity = _number(holding.get("qty"))
        average = _number(holding.get("priceAvg"), _number(holding.get("avgBuyPrice")))
        pnl = _number(holding.get("pl"))
        matching_buys = [o for o in order_history.get(_instrument_key(holding), []) if str(o.get("side")).upper() == "BUY"]
        matching_buys.sort(key=lambda item: item.get("created_at") or "")
        invested = quantity * average
        normalized_holdings.append({
            "instrument_token": holding.get("instrumentToken"),
            "instrument_name": holding.get("instrumentName"),
            "holding_type": holding.get("type"),
            "quantity": holding.get("qty"),
            "lot_size": holding.get("lotSize"),
            "average_price": average,
            "average_buy_price": holding.get("avgBuyPrice"),
            "average_sell_price": holding.get("avgSellPrice"),
            "invested_value": invested,
            "current_value": invested + pnl,
            "pnl": pnl,
            "pnl_percent": (pnl / invested * 100) if invested else None,
            "first_bought_at": matching_buys[0]["created_at"] if matching_buys else None,
            "last_bought_at": matching_buys[-1]["created_at"] if matching_buys else None,
            "transactions": matching_buys,
        })

    def normalize_position(position: dict[str, Any]) -> dict[str, Any]:
        quantity = _number(position.get("qty"))
        average = _number(position.get("priceAvg"), _number(position.get("avgBuyPrice")))
        pnl = _number(position.get("pl"))
        return {
            "instrument_token": position.get("instrumentToken"),
            "instrument_name": position.get("instrumentName"),
            "duration": position.get("duration"),
            "side": position.get("type"),
            "quantity": position.get("qty"),
            "lot_size": position.get("lotSize"),
            "average_price": average,
            "average_buy_price": position.get("avgBuyPrice"),
            "average_sell_price": position.get("avgSellPrice"),
            "pnl": pnl,
        }

    total_invested = sum(item["invested_value"] for item in normalized_holdings)
    total_value = sum(item["current_value"] for item in normalized_holdings)
    total_pnl = sum(item["pnl"] for item in normalized_holdings)

    return {
        "connected": True,
        "account": {
            "name": " ".join(part for part in [user.get("firstName"), user.get("lastName")] if part).strip(),
            "email": user.get("emailId"),
            "virtual_money": user.get("virtualMoney"),
            "virtual_money_blocked": user.get("virtualMoneyBlocked"),
            "virtual_money_left": user.get("virtualMoneyLeft"),
            "brokerage": user.get("brokerage"),
            "premium_type": user.get("premiumType"),
            "premium_expiry": _iso_timestamp(user.get("premiumExpiry")),
            "notification_count": user.get("notificationCount"),
        },
        "summary": {
            "invested_value": total_invested,
            "current_value": total_value,
            "pnl": total_pnl,
            "pnl_percent": (total_pnl / total_invested * 100) if total_invested else None,
            "holding_count": len(normalized_holdings),
            "position_count": len(positions),
        },
        "holdings": normalized_holdings,
        "positions": [normalize_position(item) for item in positions],
        "orders": {
            "open": orders.get("open", []) if isinstance(orders, dict) else [],
            "executed": normalized_orders,
        },
        "reports": report,
    }
