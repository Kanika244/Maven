import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Gauge, Search, TrendingUp } from "lucide-react";
import { niftyCompanies, niftyOverview, sectorPerformance } from "@/lib/mock-data";
import { inr, pct } from "@/lib/format";
import { Delta, PageHeader, SentimentBadge, StatCard } from "@/components/maven/primitives";
import { SectorBars } from "@/components/maven/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/format";
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

function heatColor(pct: number) {
  if (pct >= 1.5) return "bg-positive text-positive-foreground";
  if (pct >= 0.5) return "bg-positive/60 text-positive-foreground";
  if (pct >= 0) return "bg-positive/25 text-foreground";
  if (pct >= -0.5) return "bg-negative/25 text-foreground";
  if (pct >= -1.5) return "bg-negative/60 text-negative-foreground";
  return "bg-negative text-negative-foreground";
}

function MarketPage() {
  const [q, setQ] = useState("");
  const filtered = niftyCompanies.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.symbol.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        eyebrow="Markets workspace"
        title="Market Intelligence"
        subtitle="Nifty 50 companies, sector trends, technical indicators and overall market sentiment."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Nifty 50" value={niftyOverview.level.toLocaleString("en-IN")} delta={niftyOverview.changePct} icon={TrendingUp} accent />
        <StatCard label="Nifty P/E" value={niftyOverview.pe} hint="trailing" icon={Gauge} />
        <StatCard label="India VIX" value={niftyOverview.vix} hint="low volatility" icon={Activity} />
        <StatCard label="Market Breadth" value={`${niftyOverview.advances}/${niftyOverview.declines}`} hint="adv / dec" icon={Activity} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
            <p className="text-xs text-muted-foreground">Today's change by sector (%)</p>
          </CardHeader>
          <CardContent>
            <SectorBars data={sectorPerformance} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Market Heatmap</CardTitle>
            <span className="text-xs text-muted-foreground">Overall sentiment: <span className="font-medium text-positive">Bullish</span></span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {niftyCompanies.map((c) => (
                <div key={c.symbol} className={cx("rounded-lg p-2.5 text-center", heatColor(c.pct))}>
                  <div className="text-xs font-bold">{c.symbol}</div>
                  <div className="font-num text-xs">{pct(c.pct)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>Nifty 50 Companies</CardTitle>
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
              {filtered.map((c) => (
                <TableRow key={c.symbol}>
                  <TableCell>
                    <div className="font-medium">{c.symbol}</div>
                    <div className="text-xs text-muted-foreground">{c.name}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.sector}</TableCell>
                  <TableCell className="text-right font-num">{inr(c.ltp)}</TableCell>
                  <TableCell className="text-right"><Delta value={c.pct} className="justify-end text-xs" /></TableCell>
                  <TableCell className="text-right font-num text-muted-foreground">{c.pe}</TableCell>
                  <TableCell className="text-right">
                    <span className={cx("font-num", c.rsi >= 70 ? "text-negative" : c.rsi <= 40 ? "text-info" : "text-foreground")}>{c.rsi}</span>
                  </TableCell>
                  <TableCell className="text-right"><SentimentBadge sentiment={c.sentiment} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No companies match “{q}”.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}