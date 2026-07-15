import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { BookOpen, CornerDownLeft, FileText, Sparkles } from "lucide-react";
import { chatHistory, suggestedPrompts, type ChatMessage } from "@/lib/mock-data";
import { Brand } from "@/components/layout/Brand";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cx } from "@/lib/format";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — MAVEN" }] }),
  component: AssistantPage,
});

const followUps = ["Show me a rebalancing plan", "Which sectors am I underweight?", "Explain XIRR vs absolute return"];

const cannedReply =
  "Based on your current holdings and a Moderate risk profile, here's my read: your portfolio is healthy (78/100) with a slight tilt toward IT and Financials. Recent momentum is favourable, but concentration in a few large-caps is your main risk. Consider adding a defensive allocation and trimming stretched valuations. Ask me to draft a specific rebalancing plan any time.";

function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: cannedReply,
          sources: ["Portfolio holdings", "Nifty 50 sector weights", "Risk profile: Moderate", "Market sentiment feed"],
        },
      ]);
      setThinking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }));
    }, 900);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Card className="flex h-[calc(100vh-9rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
          <Brand compact />
          <div>
            <div className="text-sm font-semibold">MAVEN Financial Assistant</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" /> RAG-powered · grounded in your data
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {messages.length === 1 && (
            <div className="text-sm text-muted-foreground">Ask anything about your portfolio, the markets, or investing concepts.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cx("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              {m.role === "assistant" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg [background:var(--gradient-brand)] text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div className={cx("max-w-[80%] space-y-2", m.role === "user" && "text-right")}>
                <div
                  className={cx(
                    "inline-block whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
                {m.sources && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                        <FileText className="h-3 w-3" /> {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" /> MAVEN is thinking…
            </div>
          )}
          {messages.length > 1 && !thinking && (
            <div className="flex flex-wrap gap-2 pt-2">
              {followUps.map((f) => (
                <button key={f} onClick={() => send(f)} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/60 p-3">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask MAVEN about your portfolio, a stock, or an investing concept…"
              className="min-h-[52px] resize-none pr-12"
            />
            <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8" onClick={() => send(input)}>
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Suggested Prompts
            </div>
            <div className="space-y-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="w-full rounded-lg border border-border/60 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 [background:var(--gradient-surface)]">
          <CardContent className="py-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4 text-primary" /> How it works
            </div>
            <p className="text-xs text-muted-foreground">
              The assistant retrieves your holdings, live market data and financial news, then reasons over them with an
              LLM to give grounded, explainable answers — always citing its sources.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}