import { cx } from "@/lib/format";

export function Brand({ compact, logoSrc }: { compact?: boolean; logoSrc?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl shadow-[var(--shadow-glow)]">
        {logoSrc ? (
          <img src={logoSrc} alt="MAVEN logo" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg font-bold text-primary-foreground">M</span>
        )}
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