import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Brain, Loader2, LogIn, Newspaper, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { inr, pct } from "@/lib/format";
import { ActionBadge, ConfidenceBar, PageHeader } from "@/components/maven/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({ meta: [{ title: "AI Recommendations — MAVEN" }] }),
  component: RecommendationsPage,
});

// ---------- Shapes returned by the backend ----------

type RawAction = "BUY" | "HOLD" | "SELL" | "TRIM";

type RecommendationRaw = {
  id: string;
  symbol: string;
  name: string | null;
  action: RawAction;
  thesis: string;
  confidence: number;
  expected_return_pct: number;
};

type MarketCompany = {
  symbol: string;
  ltp: number | null;
  pe: number | null;
  rsi14: number | null;
  sentiment: "Positive" | "Neutral" | "Negative" | null;
};

type NewsItem = {
  id: string;
  title: string;
  related: string[];
};

// ActionBadge's exact supported values weren't visible to me (don't have
// primitives.tsx) — mapping to the same "Buy"/"Hold"/"Sell" casing the old
// mock data used, since that's confirmed to work. TRIM maps to "Sell" as
// the closest visual analog — worth checking this renders how you'd want.
function displayAction(a: RawAction): "Buy" | "Hold" | "Sell" {
  if (a === "BUY") return "Buy";
  if (a === "HOLD") return "Hold";
  return "Sell"; // SELL or TRIM
}

function getToken() {
  return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
}

function RecommendationsPage() {
  const [recs, setRecs] = useState<RecommendationRaw[]>([]);
  const [companies, setCompanies] = useState<MarketCompany[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    const token = getToken();
    if (!token) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }

    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [recsRes, companiesRes, newsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recommendations${refresh ? "?refresh=true" : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/market/companies`),
        fetch(`${API_BASE_URL}/api/news/feed`),
      ]);

      if (recsRes.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!recsRes.ok) throw new Error("Could not load recommendations");

      setRecs(await recsRes.json());
      if (companiesRes.ok) setCompanies(await companiesRes.json());
      if (newsRes.ok) setNews(await newsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const companyBySymbol = useMemo(() => {
    const map = new Map<string, MarketCompany>();
    for (const c of companies) map.set(c.symbol, c);
    return map;
  }, [companies]);

  const newsBySymbol = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    for (const n of news) {
      for (const sym of n.related ?? []) {
        if (!map.has(sym)) map.set(sym, []);
        map.get(sym)!.push(n);
      }
    }
    return map;
  }, [news]);

  const counts = useMemo(() => {
    const c = { Buy: 0, Hold: 0, Sell: 0 };
    for (const r of recs) c[displayAction(r.action)] += 1;
    return c;
  }, [recs]);

  if (needsLogin) {
    return (
      <div>
        <PageHeader
          eyebrow="Multi-agent intelligence"
          title="AI Recommendations"
          subtitle="Personalised, explainable calls generated from your profile, live markets and news sentiment."
        />
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <LogIn className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Log in to see recommendations personalized to your risk profile and portfolio.</p>
            <Button asChild className="mt-1">
              <Link to="/login">Log in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Multi-agent intelligence"
        title="AI Recommendations"
        subtitle="Personalised, explainable calls generated from your profile, live markets and news sentiment."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-positive" /> Live
            </Badge>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : recs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No recommendations yet — complete your investor profile under Settings to get personalized picks, or check back
            after the market data has had a chance to refresh.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-positive" /> Buy signals
              </div>
              <div className="mt-1 font-num text-2xl font-semibold">{counts.Buy}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-gold" /> Hold signals
              </div>
              <div className="mt-1 font-num text-2xl font-semibold">{counts.Hold}</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4 text-negative" /> Sell signals
              </div>
              <div className="mt-1 font-num text-2xl font-semibold">{counts.Sell}</div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {recs.map((r) => {
              const company = companyBySymbol.get(r.symbol);
              const relatedNews = (newsBySymbol.get(r.symbol) ?? []).slice(0, 2);
              const targetPrice = company?.ltp != null ? company.ltp * (1 + r.expected_return_pct / 100) : null;

              return (
                <Card key={r.id} className="overflow-hidden">
                  <CardHeader className="flex-row items-start justify-between border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted font-num text-xs font-bold">
                        {r.symbol.slice(0, 4)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {r.name ?? r.symbol} <ActionBadge action={displayAction(r.action)} />
                        </CardTitle>
                        <div className="mt-1 font-num text-xs text-muted-foreground">
                          {company?.ltp != null ? inr(company.ltp) : "—"}
                          {targetPrice != null && <> → <span className="text-foreground">{inr(targetPrice)}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Exp. return</div>
                      <div className={`font-num text-lg font-semibold ${r.expected_return_pct >= 0 ? "text-positive" : "text-negative"}`}>
                        {pct(r.expected_return_pct)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <div className="mb-1.5 text-xs text-muted-foreground">Confidence</div>
                      <ConfidenceBar value={r.confidence} />
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Brain className="h-3.5 w-3.5" /> AI Explanation
                      </div>
                      <p className="text-sm text-muted-foreground">{r.thesis}</p>
                    </div>

                    {company && (
                      <div>
                        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Supporting indicators</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between rounded-md border border-border/60 px-2.5 py-1.5 text-xs">
                            <span className="text-muted-foreground">P/E</span>
                            <span className="font-num font-medium">{company.pe != null ? company.pe.toFixed(2) : "—"}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border border-border/60 px-2.5 py-1.5 text-xs">
                            <span className="text-muted-foreground">RSI</span>
                            <span className="font-num font-medium">{company.rsi14 ?? "—"}</span>
                          </div>
                          <div className="col-span-2 flex items-center justify-between rounded-md border border-border/60 px-2.5 py-1.5 text-xs">
                            <span className="text-muted-foreground">Sentiment</span>
                            <span className="font-num font-medium">{company.sentiment ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {relatedNews.map((n) => (
                      <div key={n.id} className="flex items-start gap-2 rounded-md border border-border/60 p-2.5 text-xs">
                        <Newspaper className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{n.title}</span>
                      </div>
                    ))}

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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}