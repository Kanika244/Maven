import { createFileRoute } from "@tanstack/react-router";
import { Download, PieChart, RefreshCw, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { inr, pct } from "@/lib/format";
import { Delta, PageHeader, StatCard } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — MAVEN" }] }),
  component: PortfolioPage,
});

type Transaction = {
  id: number | null;
  instrument_name?: string | null;
  side: string;
  quantity: number;
  price: number | null;
  created_at: string | null;
  duration: string | null;
  status: string | null;
};
type Holding = {
  instrument_name: string;
  quantity: number;
  average_price: number;
  invested_value: number;
  current_value: number;
  pnl: number;
  pnl_percent: number | null;
  first_bought_at: string | null;
  last_bought_at: string | null;
  transactions: Transaction[];
  holding_type: string | null;
};
type Portfolio = {
  account: {
    name: string;
    email: string;
    virtual_money: number;
    virtual_money_blocked: number;
    virtual_money_left: number;
    brokerage: number;
    premium_type: string | null;
  };
  summary: {
    invested_value: number;
    current_value: number;
    pnl: number;
    pnl_percent: number | null;
    holding_count: number;
    position_count: number;
  };
  holdings: Holding[];
  positions: Array<{
    instrument_name: string;
    quantity: number;
    average_price: number;
    pnl: number;
    duration: string;
    side: string;
  }>;
  orders: { open: unknown[]; executed: Transaction[] };
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPortfolio(await apiFetch("/api/portfolio"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your MegaBull portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function exportCsv() {
    if (!portfolio) return;
    const header = [
      "Stock",
      "Quantity",
      "Average price",
      "Invested",
      "Current value",
      "P&L",
      "First bought",
      "Last bought",
    ];
    const lines = portfolio.holdings.map((h) => [
      h.instrument_name,
      h.quantity,
      h.average_price,
      h.invested_value,
      h.current_value,
      h.pnl,
      h.first_bought_at ?? "",
      h.last_bought_at ?? "",
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "maven-megabull-portfolio.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !portfolio)
    return (
      <div className="py-16 text-center text-muted-foreground">Loading MegaBull portfolio…</div>
    );

  return (
    <div>
      <PageHeader
        eyebrow="MegaBull paper portfolio"
        title="Your Portfolio"
        subtitle={
          portfolio ? `Connected to ${portfolio.account.email}` : "Read-only portfolio connection"
        }
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={!portfolio}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </>
        }
      />

      {error && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="flex items-center justify-between gap-4 p-4 text-sm text-destructive">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {portfolio && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Invested"
              value={inr(portfolio.summary.invested_value, { compact: true })}
              icon={PieChart}
            />
            <StatCard
              label="Current value"
              value={inr(portfolio.summary.current_value, { compact: true })}
              accent
            />
            <StatCard
              label="Unrealised P&L"
              value={inr(portfolio.summary.pnl, { compact: true })}
              delta={portfolio.summary.pnl_percent ?? 0}
            />
            <StatCard
              label="Virtual funds left"
              value={inr(portfolio.account.virtual_money_left, { compact: true })}
              icon={Wallet}
              hint={`${portfolio.summary.holding_count} holdings · ${portfolio.summary.position_count} positions`}
            />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>MegaBull account</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-4">
              <div>
                <div className="text-muted-foreground">Virtual money</div>
                <div className="font-num mt-1">{inr(portfolio.account.virtual_money)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Blocked</div>
                <div className="font-num mt-1">{inr(portfolio.account.virtual_money_blocked)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Available</div>
                <div className="font-num mt-1">{inr(portfolio.account.virtual_money_left)}</div>
                <Progress
                  className="mt-2"
                  value={
                    portfolio.account.virtual_money
                      ? (portfolio.account.virtual_money_left / portfolio.account.virtual_money) *
                        100
                      : 0
                  }
                />
              </div>
              <div>
                <div className="text-muted-foreground">Plan</div>
                <div className="mt-1">{portfolio.account.premium_type || "Standard"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Delivery holdings</CardTitle>
              <p className="text-xs text-muted-foreground">
                Purchase dates are derived from executed MegaBull buy orders.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {portfolio.holdings.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No delivery holdings found in MegaBull.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead>First bought</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Avg buy</TableHead>
                      <TableHead className="text-right">Invested</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.holdings.map((holding) => (
                      <TableRow key={holding.instrument_name}>
                        <TableCell>
                          <div className="font-medium">{holding.instrument_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {holding.holding_type || "Delivery"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{formatDate(holding.first_bought_at)}</div>
                          <div className="text-xs text-muted-foreground">
                            Latest: {formatDate(holding.last_bought_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-num">{holding.quantity}</TableCell>
                        <TableCell className="text-right font-num">
                          {inr(holding.average_price)}
                        </TableCell>
                        <TableCell className="text-right font-num">
                          {inr(holding.invested_value, { compact: true })}
                        </TableCell>
                        <TableCell className="text-right font-num">
                          {inr(holding.current_value, { compact: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`font-num ${holding.pnl >= 0 ? "text-positive" : "text-negative"}`}
                          >
                            {inr(holding.pnl, { compact: true })}
                          </div>
                          <div
                            className={`text-xs ${holding.pnl >= 0 ? "text-positive" : "text-negative"}`}
                          >
                            {holding.pnl_percent == null ? "—" : pct(holding.pnl_percent)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Executed orders</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.orders.executed.map((order) => (
                    <TableRow key={order.id ?? `${order.created_at}-${order.side}`}>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.instrument_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={order.side === "BUY" ? "default" : "secondary"}>
                          {order.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-num">{order.quantity}</TableCell>
                      <TableCell className="text-right font-num">
                        {order.price == null ? "—" : inr(order.price)}
                      </TableCell>
                      <TableCell>{order.status || "Executed"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
