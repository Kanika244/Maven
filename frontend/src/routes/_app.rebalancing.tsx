import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Scale, ShieldCheck, TrendingUp } from "lucide-react";
import { rebalancing } from "@/lib/mock-data";
import { PageHeader } from "@/components/maven/primitives";
import { DonutChart } from "@/components/maven/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cx } from "@/lib/format";

export const Route = createFileRoute("/_app/rebalancing")({
  head: () => ({ meta: [{ title: "Rebalancing — MAVEN" }] }),
  component: RebalancingPage,
});

const actionColor: Record<string, string> = {
  Add: "bg-positive/15 text-positive",
  Trim: "bg-negative/15 text-negative",
  Deploy: "bg-info/15 text-info",
};

function RebalancingPage() {
  const imp = rebalancing.expectedImprovement;
  return (
    <div>
      <PageHeader
        eyebrow="Optimization engine"
        title="Portfolio Rebalancing"
        subtitle="MAVEN compares your current allocation with an AI-optimised target for your risk profile."
        actions={
          <Button>
            <Check className="h-4 w-4" /> Apply Suggestions
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Current Allocation</CardTitle>
            <Badge variant="outline">Now</Badge>
          </CardHeader>
          <CardContent>
            <DonutChart data={rebalancing.current} />
            <div className="mt-3 space-y-2 text-sm">
              {rebalancing.current.map((a, i) => (
                <div key={a.name} className="flex justify-between">
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

        <Card className="border-primary/30">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Suggested Allocation</CardTitle>
            <Badge className="gap-1"><TrendingUp className="h-3 w-3" /> AI-optimised</Badge>
          </CardHeader>
          <CardContent>
            <DonutChart data={rebalancing.suggested} />
            <div className="mt-3 space-y-2 text-sm">
              {rebalancing.suggested.map((a, i) => {
                const cur = rebalancing.current.find((c) => c.name === a.name)?.value ?? 0;
                const diff = a.value - cur;
                return (
                  <div key={a.name} className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--chart-${i + 1})` }} />
                      {a.name}
                    </span>
                    <span className="font-num">
                      {a.value}%{" "}
                      <span className={cx("text-xs", diff > 0 ? "text-positive" : diff < 0 ? "text-negative" : "text-muted-foreground")}>
                        ({diff > 0 ? "+" : ""}{diff})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {[
          { label: "Expected return", value: `+${imp.return}%`, tone: "text-positive" },
          { label: "Risk reduction", value: `${imp.risk}%`, tone: "text-positive" },
          { label: "Diversification", value: `+${imp.diversification} pts`, tone: "text-positive" },
          { label: "Sharpe ratio", value: `+${imp.sharpe}`, tone: "text-positive" },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
            <div className={cx("mt-1 font-num text-2xl font-semibold", m.tone)}>{m.value}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Rebalancing Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rebalancing.actions.map((a) => (
            <div key={a.symbol} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 p-3">
              <span className={cx("rounded-md px-2.5 py-1 text-xs font-bold uppercase", actionColor[a.action])}>{a.action}</span>
              <span className="font-medium">{a.symbol}</span>
              <span className="flex items-center gap-1.5 font-num text-sm text-muted-foreground">
                {a.from}% <ArrowRight className="h-3.5 w-3.5" /> <span className="text-foreground">{a.to}%</span>
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{a.reason}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4 border-primary/20 [background:var(--gradient-surface)]">
        <CardContent className="flex items-start gap-3 py-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <div className="text-sm font-semibold">Why these changes reduce your risk</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Trimming an overvalued, high-beta position (Titan) and increasing your Gold ETF hedge lowers portfolio
              volatility from 14.2% to ~11.9% while improving diversification. Redeploying idle cash into a
              high-conviction IT name lifts expected return without materially raising drawdown risk for a Moderate profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}