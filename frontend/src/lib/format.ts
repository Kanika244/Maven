export const inr = (v: number, opts: { compact?: boolean; decimals?: number } = {}) => {
  const { compact = false, decimals = 0 } = opts;
  if (compact) {
    const abs = Math.abs(v);
    if (abs >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  }
  return `₹${v.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const pct = (v: number, withSign = true) =>
  `${withSign && v > 0 ? "+" : ""}${v.toFixed(2)}%`;

export const signColor = (v: number) =>
  v > 0 ? "text-positive" : v < 0 ? "text-negative" : "text-muted-foreground";

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");