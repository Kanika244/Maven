import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Brain, Newspaper, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { news, recommendations } from "@/lib/mock-data";
import { inr, pct } from "@/lib/format";
import { ActionBadge, ConfidenceBar, PageHeader } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({ meta: [{ title: "AI Recommendations — MAVEN" }] }),
  component: RecommendationsPage,
});

const signalStyle: Record<string, string> = {
  bullish: "text-positive",
  bearish: "text-negative",
  neutral: "text-muted-foreground",
};

function RecommendationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Multi-agent intelligence"
        title="AI Recommendations"
        subtitle="Personalised, explainable calls generated from your profile, live markets and news sentiment."
        actions={
          <Badge variant="secondary" className="gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-positive" /> Updated 12 min ago
          </Badge>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4 text-positive" /> Buy signals</div>
          <div className="mt-1 font-num text-2xl font-semibold">{recommendations.filter((r) => r.action === "Buy").length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="h-4 w-4 text-gold" /> Hold signals</div>
          <div className="mt-1 font-num text-2xl font-semibold">{recommendations.filter((r) => r.action === "Hold").length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown className="h-4 w-4 text-negative" /> Sell signals</div>
          <div className="mt-1 font-num text-2xl font-semibold">{recommendations.filter((r) => r.action === "Sell").length}</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {recommendations.map((r) => (
          <Card key={r.id} className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted font-num text-xs font-bold">
                  {r.symbol.slice(0, 4)}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {r.name} <ActionBadge action={r.action} />
                  </CardTitle>
                  <div className="mt-1 font-num text-xs text-muted-foreground">
                    {inr(r.currentPrice)} → <span className="text-foreground">{inr(r.targetPrice)}</span> · {r.horizon}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Exp. return</div>
                <div className={`font-num text-lg font-semibold ${r.expectedReturn >= 0 ? "text-positive" : "text-negative"}`}>
                  {pct(r.expectedReturn)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="text-muted-foreground">Risk: {r.risk}</span>
                </div>
                <ConfidenceBar value={r.confidence} />
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Brain className="h-3.5 w-3.5" /> AI Explanation
                </div>
                <p className="text-sm text-muted-foreground">{r.thesis}</p>
              </div>

              <div>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Supporting indicators</div>
                <div className="grid grid-cols-2 gap-2">
                  {r.indicators.map((ind) => (
                    <div key={ind.label} className="flex items-center justify-between rounded-md border border-border/60 px-2.5 py-1.5 text-xs">
                      <span className="text-muted-foreground">{ind.label}</span>
                      <span className={`font-num font-medium ${signalStyle[ind.signal]}`}>{ind.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {r.supportingNews.map((id) => {
                const n = news.find((x) => x.id === id);
                if (!n) return null;
                return (
                  <div key={id} className="flex items-start gap-2 rounded-md border border-border/60 p-2.5 text-xs">
                    <Newspaper className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{n.title}</span>
                  </div>
                );
              })}

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/explainability">
                    <Brain className="h-4 w-4" /> Why this call?
                  </Link>
                </Button>
                <Button className="flex-1">
                  Act on it <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
