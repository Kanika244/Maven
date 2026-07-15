import { createFileRoute } from "@tanstack/react-router";
import { Brain, FileText, GitBranch, Layers, ShieldCheck } from "lucide-react";
import { explainability } from "@/lib/mock-data";
import { inr, pct } from "@/lib/format";
import { ActionBadge, ConfidenceBar, PageHeader, ScoreRing } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/explainability")({
  head: () => ({ meta: [{ title: "AI Explainability — MAVEN" }] }),
  component: ExplainabilityPage,
});

function ExplainabilityPage() {
  const { recommendation: r, agents, signals, retrieved } = explainability;
  return (
    <div>
      <PageHeader
        eyebrow="Glass-box reasoning"
        title="AI Explainability"
        subtitle={`How MAVEN generated its ${r.action} recommendation for ${r.name}.`}
      />

      {/* Decision summary */}
      <Card className="border-primary/25 [background:var(--gradient-surface)]">
        <CardContent className="grid gap-6 py-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-muted font-num text-sm font-bold">{r.symbol.slice(0, 4)}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{r.name}</span>
                <ActionBadge action={r.action} />
              </div>
              <div className="mt-1 font-num text-xs text-muted-foreground">
                {inr(r.currentPrice)} → {inr(r.targetPrice)} · {r.horizon} · {r.risk} risk
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <div className="mb-1.5 text-xs text-muted-foreground">Confidence score</div>
            <ConfidenceBar value={r.confidence} />
            <div className="mt-2 text-sm">
              Expected return{" "}
              <span className={`font-num font-semibold ${r.expectedReturn >= 0 ? "text-positive" : "text-negative"}`}>{pct(r.expectedReturn)}</span>
            </div>
          </div>
          <ScoreRing value={r.confidence} label="Confidence" />
        </CardContent>
      </Card>

      {/* Agent pipeline */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Multi-Agent Reasoning Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {agents.map((a, i) => (
              <div key={a.name} className="relative rounded-xl border border-border/60 bg-card/50 p-3">
                <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-num text-xs font-bold text-primary">{i + 1}</div>
                <div className="text-sm font-medium">{a.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.role}</div>
                <div className="mt-2 rounded-md bg-muted/50 px-2 py-1 text-[11px] text-foreground">{a.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Signal weighting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Signal Weighting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signals.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="font-num text-muted-foreground">{s.weight}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full [background:var(--gradient-brand)]" style={{ width: `${s.weight * 2.5}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Retrieved knowledge */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Retrieved Knowledge (RAG)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {retrieved.map((d) => (
                <div key={d.title} className="flex items-center justify-between rounded-lg border border-border/60 p-2.5">
                  <span className="text-sm">{d.title}</span>
                  <Badge variant="secondary">{d.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Final Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{r.thesis}</p>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Recommendation aligns with your Moderate risk profile and 8-year horizon. Evidence is corroborated across
                technical, fundamental and sentiment agents, yielding a {r.confidence}% confidence score.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}