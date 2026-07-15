import { cx } from "@/lib/format";

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl [background:var(--gradient-brand)] font-display text-lg font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
        M
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">MAVEN</div>
          <div className={cx("text-[10px] uppercase tracking-[0.16em] text-muted-foreground")}>
            Wealth Navigator
          </div>
        </div>
      )}
    </div>
  );
}