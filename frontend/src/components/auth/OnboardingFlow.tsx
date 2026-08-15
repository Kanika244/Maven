import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bot, CheckCircle2, Loader2, Send, User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/format";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Persona = {
  persona_name?: string;
  investment_style?: string;
  human_readable_explanation?: string;
};
type HistoryItem = { role: "user" | "assistant"; content: string };

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [confirming, setConfirming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = () =>
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const accessToken = token();
        if (!accessToken) {
          navigate({ to: "/login" });
          return;
        }
        const res = await fetch(`${API_URL}/api/onboarding/status`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.onboarding_completed) {
          navigate({ to: "/dashboard" });
          return;
        }
        setMessages(
          data.history?.length
            ? data.history.map((m: HistoryItem, i: number) => ({
                id: i.toString(),
                role: m.role,
                content: m.content,
              }))
            : [
                {
                  id: "welcome",
                  role: "assistant",
                  content:
                    "Hi! I'm your MAVEN AI Advisor. To build your personalized investment profile, I just have a few quick questions about your finances, goals, and risk appetite. How old are you, and what's your rough annual income?",
                },
              ],
        );
        if (data.persona?.persona_name) setPersona(data.persona);
      } catch (err) {
        console.error(err);
      }
    };
    void fetchStatus();
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, persona]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const accessToken = token();
      if (!accessToken) {
        navigate({ to: "/login" });
        return;
      }
      const res = await fetch(`${API_URL}/api/onboarding/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ message: userMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: data.reply },
        ]);
        if (data.persona) setPersona(data.persona);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function confirmPersona() {
    setConfirming(true);
    try {
      const accessToken = token();
      if (!accessToken) {
        navigate({ to: "/login" });
        return;
      }
      const res = await fetch(`${API_URL}/api/onboarding/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <AuthLayout
      wide
      title="Build your investor profile"
      subtitle="A short conversation to personalise MAVEN for you."
    >
      <div className="flex h-[min(36rem,calc(100vh-12rem))] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">MAVEN AI Advisor</h2>
            <p className="text-xs text-muted-foreground">
              Your answers stay focused on your goals and risk.
            </p>
          </div>
        </div>
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cx(
                "flex items-start gap-3",
                msg.role === "user" ? "flex-row-reverse" : "",
              )}
            >
              <div
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-sidebar-accent text-foreground",
                )}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={cx(
                  "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6",
                  msg.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-muted text-foreground",
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-4">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          {persona && (
            <div className="mx-auto max-w-lg rounded-xl border border-primary/25 bg-background p-5">
              <h3 className="text-lg font-bold">Your profile is ready</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">Persona</span>
                  <span className="font-semibold">{persona.persona_name}</span>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <span className="block text-xs text-muted-foreground">Investment style</span>
                  <span className="font-semibold">{persona.investment_style}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {persona.human_readable_explanation}
              </p>
              <Button onClick={confirmPersona} disabled={confirming} className="mt-5 w-full">
                {confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}{" "}
                Confirm & enter dashboard
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                If anything looks incorrect, tell me in the chat.
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-border bg-background p-3">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer here..."
              className="h-11 rounded-full bg-muted/50 pl-5 pr-12"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading}
              className="absolute right-1.5 h-8 w-8 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
