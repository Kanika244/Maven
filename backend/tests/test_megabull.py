import unittest

from portfolio.megabull import normalize_portfolio


class MegaBullNormalizationTests(unittest.TestCase):
    def test_holding_uses_executed_buy_orders_for_purchase_dates(self):
        result = normalize_portfolio(
            {"emailId": "user@example.com", "virtualMoney": 500000, "virtualMoneyLeft": 450000},
            [{"instrumentToken": "123", "instrumentName": "TCS", "qty": 10, "priceAvg": 100, "pl": 25}],
            [],
            {"open": [], "executed": [
                {"id": 1, "instrumentToken": "123", "instrumentName": "TCS", "type": "BUY", "qty": 5, "price": 95, "createdTimestamp": "2026-01-02T09:15:00Z", "status": "COMPLETE"},
                {"id": 2, "instrumentToken": "123", "instrumentName": "TCS", "type": "BUY", "qty": 5, "price": 105, "createdTimestamp": "2026-02-02T09:15:00Z", "status": "COMPLETE"},
            ]},
            [],
        )

        holding = result["holdings"][0]
        self.assertEqual(holding["first_bought_at"], "2026-01-02T09:15:00+00:00")
        self.assertEqual(holding["last_bought_at"], "2026-02-02T09:15:00+00:00")
        self.assertEqual(holding["invested_value"], 1000)
        self.assertEqual(holding["current_value"], 1025)
        self.assertEqual(holding["pnl_percent"], 2.5)
        self.assertEqual(len(holding["transactions"]), 2)

    def test_holding_without_matching_orders_has_unknown_purchase_date(self):
        result = normalize_portfolio(
            {"emailId": "user@example.com"},
            [{"instrumentToken": "123", "instrumentName": "TCS", "qty": 1, "priceAvg": 100, "pl": 0}],
            [],
            {"open": [], "executed": []},
            [],
        )
        self.assertIsNone(result["holdings"][0]["first_bought_at"])


if __name__ == "__main__":
    unittest.main()
