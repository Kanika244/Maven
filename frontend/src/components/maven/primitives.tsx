import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cx, pct } from "@/lib/format";
import { Card } from "@/components/ui/card";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="truncate text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Delta({ value, className }: { value: number; className?: string }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-0.5 font-num text-sm font-medium",
        up ? "text-positive" : "text-negative",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {pct(value, false)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card
      className={cx(
        "gap-0 p-5",
        accent && "border-primary/30 [background:var(--gradient-surface)] shadow-[var(--shadow-glow)]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 font-num text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {delta !== undefined && <Delta value={delta} className="text-xs" />}
        {hint && <span>{hint}</span>}
      </div>
    </Card>
  );
}

const sentimentStyles: Record<string, string> = {
  Positive: "bg-positive/15 text-positive border-positive/25",
  Negative: "bg-negative/15 text-negative border-negative/25",
  Neutral: "bg-muted text-muted-foreground border-border",
};

export function SentimentBadge({ sentiment }: { sentiment: "Positive" | "Negative" | "Neutral" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        sentimentStyles[sentiment],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {sentiment}
    </span>
  );
}

const actionStyles: Record<string, string> = {
  Buy: "bg-positive text-positive-foreground",
  Sell: "bg-negative text-negative-foreground",
  Hold: "bg-gold text-accent-foreground",
};

export function ActionBadge({ action }: { action: "Buy" | "Hold" | "Sell" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        actionStyles[action],
      )}
    >
      {action}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full [background:var(--gradient-brand)]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-num text-xs font-semibold text-foreground">{value}%</span>
    </div>
  );
}

export function ScoreRing({ value, label }: { value: number; label?: string }) {
  const deg = (value / 100) * 360;
  const tone =
    value >= 75 ? "var(--positive)" : value >= 50 ? "var(--gold)" : "var(--negative)";
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(${tone} ${deg}deg, var(--muted) ${deg}deg)` }}
      />
      <div className="absolute inset-[10px] grid place-items-center rounded-full bg-card">
        <span className="font-num text-2xl font-semibold">{value}</span>
        {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}