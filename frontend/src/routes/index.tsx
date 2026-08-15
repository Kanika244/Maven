import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAVEN — Understand your portfolio" },
      {
        name: "description",
        content:
          "MAVEN brings explainable AI, Indian market intelligence and paper portfolio tracking into one investor workspace.",
      },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: BrainCircuit,
    eyebrow: "Know yourself",
    title: "A profile built around your goals.",
    body: "A guided onboarding experience turns your time horizon, behaviour and ambitions into a clear investor profile.",
  },
  {
    icon: BarChart3,
    eyebrow: "Read the market",
    title: "Indian market intelligence, in context.",
    body: "Track Nifty 50 companies, fundamentals, technicals, announcements and sentiment without the noise.",
  },
  {
    icon: Sparkles,
    eyebrow: "Act with clarity",
    title: "Recommendations you can explain.",
    body: "MAVEN connects signals across your portfolio and the market, then shows the reasoning behind every insight.",
  },
];

function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 -z-0 h-[42rem] bg-[radial-gradient(circle_at_70%_5%,oklch(0.78_0.16_165_/_0.16),transparent_32%),radial-gradient(circle_at_15%_10%,oklch(0.72_0.13_240_/_0.12),transparent_28%)]" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Brand logoSrc="/logo-light.png" />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#platform" className="transition-colors hover:text-foreground">
            Platform
          </a>
          <a href="#approach" className="transition-colors hover:text-foreground">
            Approach
          </a>
          <a href="#paper-trading" className="transition-colors hover:text-foreground">
            Paper trading
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/register">
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div>
          <Badge
            variant="outline"
            className="gap-2 border-primary/30 bg-primary/10 px-3 py-1.5 text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI portfolio intelligence for India
          </Badge>
          <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Invest with a clearer view of <span className="text-gradient-brand">what matters.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            MAVEN brings your investor profile, live Indian market signals, explainable AI and
            MegaBull paper portfolio into one calm, intelligent workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link to="/register">
                Start your investor profile <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/login">Sign in to MAVEN</Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> India-focused market data
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Explainable recommendations
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Paper trading ready
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
          <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
          <Card className="relative overflow-hidden border-primary/20 bg-card/90 shadow-[var(--shadow-elegant)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  MAVEN overview
                </div>
                <div className="mt-1 font-display text-lg font-semibold">
                  Your portfolio, in context
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" /> Live signals
              </span>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric
                  label="Portfolio value"
                  value={inr(284700, { compact: true })}
                  change="+8.4%"
                />
                <Metric label="Health score" value="78/100" change="Strong" />
                <Metric label="Risk profile" value="Balanced" change="Moderate" />
              </div>
              <div className="mt-5 rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Portfolio growth</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      12 month view · compared with Nifty 50
                    </div>
                  </div>
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <GrowthPreview />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Insight
                  icon={TrendingUp}
                  title="Diversification"
                  body="Your IT exposure is above your target range."
                  color="text-primary"
                />
                <Insight
                  icon={ShieldCheck}
                  title="Next best action"
                  body="Review concentration before adding to TCS."
                  color="text-accent"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="platform" className="relative z-10 border-y border-border/70 bg-card/25">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              One investor workspace
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Less scattered research. More considered decisions.
            </h2>
            <p className="mt-4 text-muted-foreground">
              MAVEN is designed to help you understand the relationship between your goals, your
              holdings and the market around them.
            </p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/70 bg-background/45">
                <CardContent className="p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {feature.eyebrow}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.body}</p>
                  <Link
                    to="/register"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Explore MAVEN <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="approach"
        className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"
      >
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Built for understanding
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Intelligence should feel useful, not mysterious.
          </h2>
        </div>
        <div className="space-y-5 text-muted-foreground">
          <p>
            Start with a guided investor onboarding that turns your personal context into a
            practical risk and goal profile.
          </p>
          <p>
            Then connect the dots: company fundamentals, technical signals, corporate announcements,
            news sentiment and your own portfolio.
          </p>
          <p className="text-foreground">
            The result is a focused view of what deserves your attention next.
          </p>
        </div>
      </section>

      <section
        id="paper-trading"
        className="relative z-10 mx-6 mb-20 overflow-hidden rounded-3xl border border-primary/20 bg-[var(--gradient-surface)] px-6 py-12 sm:px-12 lg:mx-auto lg:max-w-7xl lg:py-16"
      >
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Practice before you commit
            </div>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
              Connect your MegaBull paper portfolio and see every position clearly.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Track holdings, average buy price, P&L, order history and derived purchase dates in
              one read-only view.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/register">
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-border/70 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <Brand logoSrc="/logo-light.png" />
        <div className="flex items-center gap-5">
          <Link to="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <Link to="/register" className="hover:text-foreground">
            Register
          </Link>
          <span>For educational purposes. Not investment advice.</span>
        </div>
      </footer>
    </main>
  );
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs text-primary">{change}</div>
    </div>
  );
}

function Insight({
  icon: Icon,
  title,
  body,
  color,
}: {
  icon: typeof TrendingUp;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border/70 bg-background/45 p-3">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function GrowthPreview() {
  return (
    <div className="mt-4 h-32 w-full">
      <svg
        viewBox="0 0 560 130"
        className="h-full w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Illustrative portfolio growth chart"
      >
        <defs>
          <linearGradient id="landing-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.16 165 / 0.32)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 165 / 0)" />
          </linearGradient>
        </defs>
        <path
          d="M0 111 C52 103 70 108 105 91 S160 78 190 84 S242 59 275 67 S327 55 360 61 S410 37 450 45 S505 18 560 25 V130 H0 Z"
          fill="url(#landing-area)"
        />
        <path
          d="M0 111 C52 103 70 108 105 91 S160 78 190 84 S242 59 275 67 S327 55 360 61 S410 37 450 45 S505 18 560 25"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
