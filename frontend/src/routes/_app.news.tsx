import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Link2, Loader2 } from "lucide-react";
import { PageHeader, SentimentBadge } from "@/components/maven/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cx } from "@/lib/format";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app/news")({
  head: () => ({ meta: [{ title: "News & Sentiment — MAVEN" }] }),
  component: NewsPage,
});

const filters = ["All", "Positive", "Neutral", "Negative"] as const;

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  link: string;
  summary: string | null;
  sentiment: "Positive" | "Neutral" | "Negative" | null;
  score: number | null;
  related: string[];
  published_at: string | null;
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NewsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/news/feed`);
        if (!res.ok) throw new Error("Could not load news feed");
        setNews(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load news feed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const list = filter === "All" ? news : news.filter((n) => n.sentiment === filter);
  const counts = {
    Positive: news.filter((n) => n.sentiment === "Positive").length,
    Neutral: news.filter((n) => n.sentiment === "Neutral").length,
    Negative: news.filter((n) => n.sentiment === "Negative").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sentiment engine"
        title="Financial News & Sentiment"
        subtitle="AI-summarised market news with sentiment scoring and related stocks."
      />

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Positive</div><div className="mt-1 font-num text-2xl font-semibold text-positive">{counts.Positive}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Neutral</div><div className="mt-1 font-num text-2xl font-semibold">{counts.Neutral}</div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground">Negative</div><div className="mt-1 font-num text-2xl font-semibold text-negative">{counts.Negative}</div></Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f ? "border-primary bg-primary/12 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((n) => (
            <Card key={n.id}>
              <CardContent className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a href={n.link} target="_blank" rel="noreferrer">
                      <h3 className="text-base font-semibold leading-snug hover:underline">{n.title}</h3>
                    </a>
                    <div className="mt-1 text-xs text-muted-foreground">{n.source} · {timeAgo(n.published_at)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {n.sentiment && <SentimentBadge sentiment={n.sentiment} />}
                    {n.score != null && (
                      <span className="font-num text-xs text-muted-foreground">score {n.score.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {n.summary && (
                  <div className="mt-3 rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Brain className="h-3.5 w-3.5" /> AI Summary
                    </div>
                    <p className="text-sm text-muted-foreground">{n.summary}</p>
                  </div>
                )}

                {n.related.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Related:</span>
                    {n.related.map((r) => (
                      <Badge key={r} variant="secondary" className="font-num">{r}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}