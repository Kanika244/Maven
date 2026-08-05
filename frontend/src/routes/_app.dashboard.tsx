import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  Gauge,
  IndianRupee,
  Newspaper,
  ShieldHalf,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  allocation,
  marketInsights,
  news,
  performanceSeries,
  portfolioSummary,
  recommendations,
} from "@/lib/mock-data";
import { inr, pct } from "@/lib/format";
import {
  ActionBadge,
  ConfidenceBar,
  Delta,
  PageHeader,
  ScoreRing,
  SentimentBadge,
  StatCard,
} from "@/components/maven/primitives";
import { DonutChart, PerformanceChart } from "@/components/maven/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MAVEN" }] }),
  component: Dashboard,
});

// ---------- Shapes returned by the backend (market_agent/market_router.py) ----------
// Same shapes as _app.market.tsx — only the fields this card actually uses.

type MarketOverview = {
  level: number | null;
  changePct: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  advances: number | null;
  declines: number | null;
  vix: number | null;
};

type MarketCompany = {
  symbol: string;
  pct_change: number | null;
};

function Dashboard() {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [companies, setCompanies] = useState<MarketCompany[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, companiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/market/overview`),
          fetch(`${API_BASE_URL}/api/market/companies`),
        ]);
        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (companiesRes.ok) setCompanies(await companiesRes.json());
      } catch {
        // Card falls back to "—" placeholders below — rest of the
        // dashboard doesn't depend on this, so no page-level error state.
      } finally {
        setMarketLoading(false);
      }
    }
    load();
  }, []);

  const { gainers, losers } = useMemo(() => {
    const ranked = companies.filter((c) => c.pct_change != null) as { symbol: string; pct_change: number }[];
    const sorted = [...ranked].sort((a, b) => b.pct_change - a.pct_change);
    return { gainers: sorted.slice(0, 3), losers: sorted.slice(-3).reverse() };
  }, [companies]);

  return (
    <div>
      <PageHeader
        eyebrow="Good morning, Aarav"
        title="Portfolio Command Center"
        subtitle="A unified view of your wealth, powered by MAVEN's multi-agent intelligence."
        actions={
          <Button asChild>
            <Link to="/recommendations">
              <Sparkles className="h-4 w-4" /> View AI Picks
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Portfolio Value"
          value={inr(portfolioSummary.value)}
          delta={portfolioSummary.dayChangePct}
          hint="today"
          icon={IndianRupee}
          accent
        />
        <StatCard
          label="Total Returns"
          value={inr(portfolioSummary.totalReturn, { compact: true })}
          delta={portfolioSummary.totalReturnPct}
          hint={`XIRR ${portfolioSummary.xirr}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Health Score"
          value={`${portfolioSummary.healthScore}/100`}
          hint="Good standing"
          icon={Gauge}
        />
        <StatCard
          label="Risk Level"
          value={portfolioSummary.riskLevel}
          hint={`β ${portfolioSummary.beta} · vol ${portfolioSummary.volatility}%`}
          icon={ShieldHalf}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Portfolio Performance</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Portfolio vs Nifty 50 · last 12 months (₹ thousands)</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" /> Outperforming +4.2%
            </Badge>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={performanceSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={allocation} />
            <div className="mt-3 space-y-2">
              {allocation.map((a, i) => (
                <div key={a.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: `var(--chart-${i + 1})` }}
                    />
                    {a.name}
                  </span>
                  <span className="font-num text-muted-foreground">
                    {a.value}% · {inr(a.amount, { compact: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Recent AI Recommendations
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/recommendations">
                All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                to="/explainability"
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/50 p-3 transition-colors hover:border-primary/40 hover:bg-card"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted font-num text-xs font-bold">
                  {r.symbol.slice(0, 4)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{r.name}</span>
                    <ActionBadge action={r.action} />
                  </div>
                  <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">{r.thesis}</div>
                </div>
                <div className="hidden w-36 shrink-0 sm:block">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </div>
                  <ConfidenceBar value={r.confidence} />
                </div>
                <div className="w-16 shrink-0 text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Exp.</div>
                  <span className={`font-num text-sm font-semibold ${r.expectedReturn >= 0 ? "text-positive" : "text-negative"}`}>
                    {pct(r.expectedReturn)}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Health */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing value={portfolioSummary.healthScore} label="Score" />
            <div className="w-full space-y-2 text-sm">
              {[
                { k: "Diversification", v: portfolioSummary.diversification },
                { k: "Sharpe ratio", v: portfolioSummary.sharpe, raw: true },
                { k: "Volatility", v: portfolioSummary.volatility, suffix: "%" },
              ].map((m) => (
                <div key={m.k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{m.k}</span>
                  <span className="font-num font-medium">
                    {m.v}
                    {m.suffix ?? (m.raw ? "" : "/100")}
                  </span>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/rebalancing">
                <Sparkles className="h-4 w-4" /> Optimize with AI
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Market summary — live from market_agent, not mock data */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Nifty 50 Overview</CardTitle>
            <div className="flex items-center gap-2">
              {overview?.changePct != null && <Delta value={overview.changePct} />}
              <Button asChild variant="ghost" size="sm">
                <Link to="/market">
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {marketLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <div className="font-num text-3xl font-semibold">
                  {overview?.level != null ? overview.level.toLocaleString("en-IN") : "—"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  H {overview?.dayHigh != null ? overview.dayHigh.toLocaleString("en-IN") : "—"} · L{" "}
                  {overview?.dayLow != null ? overview.dayLow.toLocaleString("en-IN") : "—"}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-positive/10 p-2">
                    <div className="font-num text-lg font-semibold text-positive">{overview?.advances ?? "—"}</div>
                    <div className="text-muted-foreground">Advances</div>
                  </div>
                  <div className="rounded-lg bg-negative/10 p-2">
                    <div className="font-num text-lg font-semibold text-negative">{overview?.declines ?? "—"}</div>
                    <div className="text-muted-foreground">Declines</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className="font-num text-lg font-semibold">{overview?.vix ?? "—"}</div>
                    <div className="text-muted-foreground">India VIX</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-positive">Top Gainers</div>
                    {gainers.length > 0 ? (
                      gainers.map((g) => (
                        <div key={g.symbol} className="flex justify-between py-0.5 text-xs">
                          <span className="font-medium">{g.symbol}</span>
                          <span className="font-num text-positive">{pct(g.pct_change)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-negative">Top Losers</div>
                    {losers.length > 0 ? (
                      losers.map((l) => (
                        <div key={l.symbol} className="flex justify-between py-0.5 text-xs">
                          <span className="font-medium">{l.symbol}</span>
                          <span className="font-num text-negative">{pct(l.pct_change)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* News */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" /> Latest News
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/news">
                All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {news.slice(0, 3).map((n) => (
              <Link key={n.id} to="/news" className="block rounded-lg p-2 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <SentimentBadge sentiment={n.sentiment} />
                  <span>· {n.source} · {n.time}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* AI insights */}
        <Card className="border-primary/20 [background:var(--gradient-surface)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {marketInsights.map((m) => (
              <div key={m.title} className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{m.title}</span>
                  <SentimentBadge sentiment={m.tone} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{m.body}</p>
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/assistant">
                <Sparkles className="h-4 w-4" /> Ask MAVEN Assistant
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}