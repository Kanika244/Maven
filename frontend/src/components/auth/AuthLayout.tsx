import { type ReactNode } from "react";
import { Brain, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Brand } from "@/components/layout/Brand";

const highlights = [
  { icon: Sparkles, title: "Multi-agent intelligence", body: "Profile, market, news & portfolio agents working together." },
  { icon: Brain, title: "Explainable by design", body: "Every recommendation shows the reasoning and evidence." },
  { icon: TrendingUp, title: "Built for Nifty 50", body: "India-focused analytics, sentiment and rebalancing." },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-10 lg:flex [background:var(--gradient-surface)]">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-brand)" }}
        />
        <Brand />
        <div className="relative z-10 max-w-md">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Multi-Agent Wealth & Equity Navigator
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            AI portfolio intelligence you can actually{" "}
            <span className="text-gradient-brand">understand</span>.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            MAVEN analyses your profile, live markets and financial news to deliver personalised,
            explainable investment guidance.
          </p>
          <div className="mt-8 space-y-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <h.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{h.title}</div>
                  <div className="text-xs text-muted-foreground">{h.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">
          For educational purposes. Not investment advice.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className={wide ? "w-full max-w-xl" : "w-full max-w-sm"}>
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}