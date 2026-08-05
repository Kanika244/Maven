import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge, Loader2, Search, Sparkles, TrendingUp } from "lucide-react";
import { inr, pct } from "@/lib/format";
import { Delta, PageHeader, SentimentBadge, StatCard } from "@/components/maven/primitives";
import { SectorBars } from "@/components/maven/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/format";
import { API_BASE_URL } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/market")({
  head: () => ({ meta: [{ title: "Market Intelligence — MAVEN" }] }),
  component: MarketPage,
});

// ---------- Shapes returned by the backend (market_agent/market_router.py) ----------

type MarketOverview = {
  level: number | null;
  change: number | null;
  changePct: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  pe: number | null;
  advances: number | null;
  declines: number | null;
  vix: number | null;
};

type MarketCompany = {
  symbol: string;
  name: string;
  sector: string | null;
  ltp: number | null;
  change: number | null;
  pct_change: number | null;
  day_high: number | null;
  day_low: number | null;
  pe: number | null;
  sector_pe: number | null;
  rsi14: number | null;
  sentiment: "Positive" | "Neutral" | "Negative" | null;
  analysis_summary: string | null;
  updated_at: string | null;
};

function heatColor(value: number) {
  if (value >= 1.5) return "bg-positive text-positive-foreground";
  if (value >= 0.5) return "bg-positive/60 text-positive-foreground";
  if (value >= 0) return "bg-positive/25 text-foreground";
  if (value >= -0.5) return "bg-negative/25 text-foreground";
  if (value >= -1.5) return "bg-negative/60 text-negative-foreground";
  return "bg-negative text-negative-foreground";
}

// yfinance's trailingPE comes back with 4-6 decimal places raw — this is
// the only place that needs rounding; RSI is already rounded server-side
// (technicals.py) and nsetools' index-level P/E already comes pre-formatted.
function formatPE(pe: number | null) {
  return pe != null ? pe.toFixed(2) : "—";
}

function timeAgo(iso: string | null) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hr ago`;
}

function MarketPage() {
  const [q, setQ] = useState("");
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [companies, setCompanies] = useState<MarketCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [overviewRes, companiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/market/overview`),
          fetch(`${API_BASE_URL}/api/market/companies`),
        ]);
        if (!overviewRes.ok || !companiesRes.ok) throw new Error("Could not load market data");
        setOverview(await overviewRes.json());
        setCompanies(await companiesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load market data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // sectorPerformance isn't its own endpoint — derived from whatever
  // companies came back, same as everything else on this page.
  const sectorPerformance = useMemo(() => {
    const groups: Record<string, number[]> = {};
    for (const c of companies) {
      if (!c.sector || c.pct_change == null) continue;
      (groups[c.sector] ??= []).push(c.pct_change);
    }
    return Object.entries(groups)
      .map(([name, values]) => ({ name, pct: values.reduce((a, b) => a + b, 0) / values.length }))
      .sort((a, b) => b.pct - a.pct);
  }, [companies]);

  const overallSentiment =
    overview?.advances != null && overview?.declines != null
      ? overview.advances > overview.declines
        ? { label: "Bullish", cls: "text-positive" }
        : overview.advances < overview.declines
          ? { label: "Bearish", cls: "text-negative" }
          : { label: "Neutral", cls: "text-foreground" }
      : null;

  // Freshest updated_at across all rows — tells you how stale this view is,
  // since the whole page is only ever as current as the last scheduler run.
  const lastUpdated = useMemo(() => {
    const timestamps = companies.map((c) => c.updated_at).filter((t): t is string => !!t);
    if (timestamps.length === 0) return null;
    return timestamps.reduce((latest, t) => (t > latest ? t : latest));
  }, [companies]);

  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.symbol.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Markets workspace"
        title="Market Intelligence"
        subtitle="Nifty 50 companies, sector trends, technical indicators and overall market sentiment."
      />

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Nifty 50"
              value={overview?.level != null ? overview.level.toLocaleString("en-IN") : "—"}
              delta={overview?.changePct ?? undefined}
              icon={TrendingUp}
              accent
            />
            <StatCard label="Nifty P/E" value={overview?.pe ?? "—"} hint="trailing" icon={Gauge} />
            <StatCard label="India VIX" value={overview?.vix ?? "—"} hint="volatility index" icon={Activity} />
            <StatCard
              label="Market Breadth"
              value={overview?.advances != null && overview?.declines != null ? `${overview.advances}/${overview.declines}` : "—"}
              hint="adv / dec"
              icon={Activity}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
                <p className="text-xs text-muted-foreground">Today's change by sector (%)</p>
              </CardHeader>
              <CardContent>
                {sectorPerformance.length > 0 ? (
                  <SectorBars data={sectorPerformance} height={300} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No sector data yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Market Heatmap</CardTitle>
                {overallSentiment && (
                  <span className="text-xs text-muted-foreground">
                    Overall sentiment: <span className={cx("font-medium", overallSentiment.cls)}>{overallSentiment.label}</span>
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
                  {companies.map((c) => (
                    <div
                      key={c.symbol}
                      title={`${c.name}${c.sector ? ` • ${c.sector}` : ""}`}
                      className={cx(
                        "min-w-0 rounded-lg p-2.5 text-center transition-transform hover:z-10 hover:scale-105 hover:shadow-md",
                        heatColor(c.pct_change ?? 0),
                      )}
                    >
                      <div className="truncate text-xs font-bold">{c.symbol}</div>
                      <div className="font-num text-xs">{c.pct_change != null ? pct(c.pct_change) : "—"}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Nifty 50 Companies</CardTitle>
                {lastUpdated && (
                  <p className="mt-0.5 text-xs text-muted-foreground">Updated {timeAgo(lastUpdated)}</p>
                )}
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stocks…" className="h-9 pl-9" />
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">LTP</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">P/E</TableHead>
                    <TableHead className="text-right">RSI</TableHead>
                    <TableHead className="text-right">Sentiment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const isExpanded = expanded === c.symbol;
                    const hasAnalysis = !!c.analysis_summary;
                    return (
                      <>
                        <TableRow
                          key={c.symbol}
                          onClick={() => hasAnalysis && setExpanded(isExpanded ? null : c.symbol)}
                          className={hasAnalysis ? "cursor-pointer" : undefined}
                        >
                          <TableCell>
                            <div className="font-medium">{c.symbol}</div>
                            <div className="text-xs text-muted-foreground">{c.name}</div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{c.sector ?? "—"}</TableCell>
                          <TableCell className="text-right font-num">{c.ltp != null ? inr(c.ltp) : "—"}</TableCell>
                          <TableCell className="text-right">
                            {c.pct_change != null ? <Delta value={c.pct_change} className="justify-end text-xs" /> : "—"}
                          </TableCell>
                          <TableCell className="text-right font-num text-muted-foreground">{formatPE(c.pe)}</TableCell>
                          <TableCell className="text-right">
                            {c.rsi14 != null ? (
                              <span className={cx("font-num", c.rsi14 >= 70 ? "text-negative" : c.rsi14 <= 40 ? "text-info" : "text-foreground")}>
                                {c.rsi14}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.sentiment ? <SentimentBadge sentiment={c.sentiment} /> : "—"}
                              {hasAnalysis && (
                                <Sparkles className={cx("h-3 w-3", isExpanded ? "text-info" : "text-muted-foreground")} />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && c.analysis_summary && (
                          <TableRow key={`${c.symbol}-analysis`} className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={7} className="py-3 text-sm">
                              <div className="flex gap-2">
                                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                                <p className="text-muted-foreground">{c.analysis_summary}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        {companies.length === 0 ? "No market data yet — check the backend is running." : `No companies match "${q}".`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}