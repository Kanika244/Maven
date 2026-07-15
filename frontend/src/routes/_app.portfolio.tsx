import { createFileRoute } from "@tanstack/react-router";
import { Download, PieChart, Plus } from "lucide-react";
import {
  allocation,
  growthSeries,
  holdings,
  portfolioSummary,
  sectorDistribution,
  withHoldingMetrics,
} from "@/lib/mock-data";
import { inr, pct } from "@/lib/format";
import { Delta, PageHeader, ScoreRing, StatCard } from "@/components/maven/primitives";
import { DonutChart, GrowthChart, SectorBars } from "@/components/maven/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

function PortfolioPage() {
  const rows = holdings.map(withHoldingMetrics);
  return (
    <div>
      <PageHeader
        eyebrow="Holdings & Analytics"
        title="Your Portfolio"
        subtitle="Detailed holdings, allocation and diversification analysis."
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button>
              <Plus className="h-4 w-4" /> Add Holding
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invested" value={inr(portfolioSummary.invested, { compact: true })} icon={PieChart} />
        <StatCard label="Current Value" value={inr(portfolioSummary.value, { compact: true })} delta={portfolioSummary.dayChangePct} accent />
        <StatCard label="Unrealised P&L" value={inr(portfolioSummary.totalReturn, { compact: true })} delta={portfolioSummary.totalReturnPct} />
        <StatCard label="XIRR" value={`${portfolioSummary.xirr}%`} hint="annualised" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Allocation Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={allocation} />
            <div className="mt-3 space-y-2 text-sm">
              {allocation.map((a, i) => (
                <div key={a.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--chart-${i + 1})` }} />
                    {a.name}
                  </span>
                  <span className="font-num text-muted-foreground">{a.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SectorBars data={sectorDistribution} height={280} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diversification & Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing value={portfolioSummary.healthScore} label="Health" />
            <div className="w-full space-y-3 text-sm">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-muted-foreground">Diversification</span>
                  <span className="font-num">{portfolioSummary.diversification}/100</span>
                </div>
                <Progress value={portfolioSummary.diversification} />
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sharpe ratio</span><span className="font-num">{portfolioSummary.sharpe}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Beta</span><span className="font-num">{portfolioSummary.beta}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Volatility</span><span className="font-num">{portfolioSummary.volatility}%</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Historical Growth</CardTitle>
          <p className="text-xs text-muted-foreground">Portfolio value over time (₹ thousands)</p>
        </CardHeader>
        <CardContent>
          <GrowthChart data={growthSeries} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg</TableHead>
                <TableHead className="text-right">LTP</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Day</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((h) => (
                <TableRow key={h.symbol}>
                  <TableCell>
                    <div className="font-medium">{h.symbol}</div>
                    <div className="text-xs text-muted-foreground">{h.sector}</div>
                  </TableCell>
                  <TableCell className="text-right font-num">{h.qty}</TableCell>
                  <TableCell className="text-right font-num text-muted-foreground">{inr(h.avg)}</TableCell>
                  <TableCell className="text-right font-num">{inr(h.ltp)}</TableCell>
                  <TableCell className="text-right font-num">{inr(h.current, { compact: true })}</TableCell>
                  <TableCell className="text-right">
                    <div className={`font-num text-sm ${h.pnl >= 0 ? "text-positive" : "text-negative"}`}>
                      {inr(h.pnl, { compact: true })}
                    </div>
                    <div className={`text-xs ${h.pnl >= 0 ? "text-positive" : "text-negative"}`}>{pct(h.pnlPct)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Delta value={h.dayPct} className="justify-end text-xs" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}