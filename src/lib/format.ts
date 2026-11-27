const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** $1,234.56 — negatives use a true minus sign, never green. */
export function money(n: number, opts: { cents?: boolean; sign?: boolean } = {}) {
  const { cents = true, sign = false } = opts;
  const s = (cents ? usd : usd0).format(Math.abs(n));
  if (n < 0) return "−" + s;
  if (sign && n > 0) return "+" + s;
  return s;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });
}
export function dateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).toLowerCase();
  return `${date} · ${time}`;
}
export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(1, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return "now";
  const m = Math.round(s / 60); if (m < 60) return `${m}m`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h`;
  const d = Math.round(h / 24); if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
