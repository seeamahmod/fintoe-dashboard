import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import { BRANDS, LOGOS, type Brand } from "@/lib/logos-data";
import { cx } from "@/lib/format";

/* ---------------- Buttons ---------------- */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
const V: Record<Variant, string> = {
  primary: "text-white bg-[linear-gradient(180deg,#4c4c4c,#000)] shadow-[0_1px_2px_#0003,inset_0_1px_0_#ffffff24] hover:brightness-125 active:brightness-95",
  secondary: "bg-muted text-ink hover:bg-[#2a2a2a29] active:bg-[#2a2a2a38]",
  outline: "bg-surface text-ink border border-line shadow-sm hover:bg-subtle active:bg-shell",
  ghost: "text-ink hover:bg-hover active:bg-pressed",
  destructive: "bg-error-subtle text-t-error hover:bg-[#ffd6d6]",
};
export function btnClass(variant: Variant = "outline", size: "sm" | "md" = "md", extra?: string) {
  return cx(
    "focus-ring inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[background-color,filter,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none",
    size === "md" ? "h-10 rounded-md px-4 text-sm" : "h-8 rounded-md px-3 text-xs",
    V[variant], extra);
}
type BtnProps = ComponentProps<"button"> & { variant?: Variant; size?: "sm" | "md"; icon?: IconName; iconRight?: IconName };
export function Button({ variant = "outline", size = "md", icon, iconRight, className, children, ...rest }: BtnProps) {
  const is = size === "md" ? 18 : 16;
  return (
    <button className={btnClass(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} size={is} />}
      {children}
      {iconRight && <Icon name={iconRight} size={is} />}
    </button>
  );
}
export function LinkButton({ href, variant = "outline", size = "md", icon, iconRight, className, children }: { href: string; variant?: Variant; size?: "sm" | "md"; icon?: IconName; iconRight?: IconName; className?: string; children: ReactNode }) {
  const is = size === "md" ? 18 : 16;
  return (
    <Link href={href} className={btnClass(variant, size, className)}>
      {icon && <Icon name={icon} size={is} />}{children}{iconRight && <Icon name={iconRight} size={is} />}
    </Link>
  );
}
export function IconButton({ icon, label, className, dot, ...rest }: ComponentProps<"button"> & { icon: IconName; label: string; dot?: boolean }) {
  return (
    <button aria-label={label} title={label} className={cx("focus-ring relative grid size-8 place-items-center rounded-md text-ink transition-colors hover:bg-hover active:bg-pressed", className)} {...rest}>
      <Icon name={icon} size={18} />
      {dot && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand ring-2 ring-surface" />}
    </button>
  );
}

/* ---------------- Badges ---------------- */
export type Tone = "neutral" | "success" | "warning" | "error" | "info" | "brand";
const TONE: Record<Tone, [string, string, string]> = {
  neutral: ["bg-[#2a2a2a12]", "text-ink-2", "bg-ink-3"],
  success: ["bg-success-subtle", "text-t-success", "bg-t-success"],
  warning: ["bg-warning-subtle", "text-t-warning", "bg-warning"],
  error: ["bg-error-subtle", "text-t-error", "bg-error"],
  info: ["bg-info-subtle", "text-t-info", "bg-info"],
  brand: ["bg-brand-subtle", "text-t-brand", "bg-brand"],
};
export function Badge({ tone = "neutral", dot = true, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  const [bg, fg, d] = TONE[tone];
  return (
    <span className={cx("inline-flex h-5 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium", bg, fg, className)}>
      {dot && <span className={cx("size-1.5 rounded-full", d)} />}{children}
    </span>
  );
}
export const statusTone = (s: string): Tone => (s === "Completed" ? "success" : s === "Pending" ? "warning" : s === "Failed" ? "error" : "neutral");

export function Trend({ value, good }: { value: string; good: boolean }) {
  const up = !value.startsWith("−") && !value.startsWith("-");
  return (
    <span className={cx("inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-xs num font-medium", good ? "bg-success-subtle text-t-success" : "bg-error-subtle text-t-error")}>
      <Icon name={up ? "trend-up" : "trend-down"} size={14} />{value}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-input bg-surface px-1.5 text-[11px] font-medium text-ink-2 shadow-[0_1px_0_#0000000f]">{children}</kbd>;
}

/* ---------------- Containers ---------------- */
export function Shell({ title, info = true, action, children, className, bodyClass, style }: { title: ReactNode; info?: boolean; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; style?: React.CSSProperties }) {
  return (
    <section className={cx("shell animate-rise", className)} style={style}>
      <header className="shell-head">
        <h2 className="eyebrow">{title}</h2>
        {info && <span className="text-ink-2" title="About this card"><Icon name="info" size={16} /></span>}
        <div className="ml-auto flex items-center gap-2">{action}</div>
      </header>
      <div className={cx("card flex-1", bodyClass)}>{children}</div>
    </section>
  );
}
export function ShellLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="focus-ring group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink hover:bg-hover">{children}<Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" /></Link>;
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <h1 className="text-[32px] font-medium leading-10 tracking-[-0.5px]">{title}</h1>
        <p className="mt-1 text-base text-ink-2">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* ---------------- Checkbox (16px, r4) ---------------- */
const CHECK = "M9.778 2.186a.5.5 0 0 1 .777.628L4.889 9.814a.5.5 0 0 1-.78-.002L1.443 6.48a.5.5 0 1 1 .781-.625l2.278 2.848z";
export function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) {
  const on = checked || indeterminate;
  return (
    <span className="relative grid size-4 shrink-0 place-items-center">
      <input type="checkbox" aria-label={label} checked={checked} onChange={onChange} ref={(el) => { if (el) el.indeterminate = !!indeterminate && !checked; }}
        className={cx("focus-ring absolute inset-0 m-0 cursor-pointer appearance-none rounded-[4px] transition-colors", on ? "bg-inverse hover:bg-[#4b4b4b]" : "border border-line-strong bg-surface")} />
      {on && <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden className="pointer-events-none relative animate-pop">{checked ? <path d={CHECK} fill="#fff" /> : <rect x={1.667} y={5.5} width={8.667} height={1} rx={0.5} fill="#fff" />}</svg>}
    </span>
  );
}

/* ---------------- Visual atoms ---------------- */
export function Tile({ icon, tone = "neutral", size = 32, round }: { icon: IconName; tone?: Tone; size?: number; round?: boolean }) {
  const map: Record<Tone, string> = { neutral: "bg-shell text-ink-2", success: "bg-success-subtle text-t-success", warning: "bg-warning-subtle text-warning", error: "bg-error-subtle text-t-error", info: "bg-info-subtle text-info", brand: "bg-brand-subtle text-brand" };
  return <span className={cx("grid shrink-0 place-items-center", round ? "rounded-full" : "rounded-lg", map[tone])} style={{ width: size, height: size }}><Icon name={icon} size={round ? (size >= 48 ? 24 : size <= 24 ? 12 : 18) : 18} /></span>;
}

const BRAND_RE = new RegExp(`^(${BRANDS.join("|")})\\b`);
export function brandOf(name: string): Brand | null { const m = name.match(BRAND_RE); return m ? (m[1] as Brand) : null; }

/** Fictional merchant mark: an 18px glyph in a 32px tile (scales with size), matching the Figma Merchant Logo set. */
export function MerchantLogo({ brand, size = 32 }: { brand: Brand; size?: number }) {
  const l = LOGOS[brand];
  const inner = size * 0.5625;
  return (
    <span className="grid shrink-0 place-items-center overflow-hidden rounded-[8px]" style={{ width: size, height: size, background: l.bg, boxShadow: l.border ? "inset 0 0 0 1px #00000014" : undefined }} aria-label={brand} role="img">
      <svg viewBox="0 0 18 18" width={inner} height={inner} style={{ color: l.fg }} strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: l.svg }} />
    </span>
  );
}

const CAT_ICON: Record<string, [IconName, Tone]> = {
  Refund: ["refresh", "success"], Shopping: ["shopping", "brand"], Subscription: ["subscription", "info"], Salary: ["dollar", "success"],
  Bills: ["bolt", "warning"], Transfer: ["send", "info"], Entertainment: ["entertainment", "error"], "Food & drink": ["food", "warning"],
  Transport: ["car", "info"], Health: ["health", "error"], Housing: ["bank", "neutral"], Other: ["wallet", "neutral"],
};
export function MerchantMark({ merchant, category, size = 32 }: { merchant: string; category: string; size?: number }) {
  const b = brandOf(merchant);
  if (b) return <MerchantLogo brand={b} size={size} />;
  const [icon, tone] = CAT_ICON[category] ?? CAT_ICON.Other;
  return <Tile icon={icon} tone={tone} size={size} round />;
}

export function Avatar({ initials = "SA", size = 32, icon }: { initials?: string; size?: number; icon?: IconName }) {
  if (icon) return <span className="grid shrink-0 place-items-center rounded-full bg-shell text-ink" style={{ width: size, height: size }}><Icon name={icon} size={18} /></span>;
  return <span className="grid shrink-0 place-items-center rounded-full bg-inverse font-medium text-white" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</span>;
}

/** Stripe meter: n bars, `filled` solid. Unit is always stated in a caption next to it. */
export function StripeMeter({ total, filled, color, faint, height = 24, delay = 0 }: { total: number; filled: number; color: string; faint?: string; height?: number; delay?: number }) {
  return (
    <div className="flex w-full items-stretch gap-[2px]" style={{ height }} role="img" aria-label={`${filled} of ${total} bars`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="flex-1 origin-bottom animate-grow-y rounded-full" style={{ background: i < filled ? color : faint ?? "var(--color-chart-track)", animationDelay: `${delay + i * 12}ms` }} />
      ))}
    </div>
  );
}

export function Progress({ value, color = "var(--color-chart-primary)", height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-chart-track" style={{ height }}>
      <div className="h-full origin-left animate-grow-x rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

export function Row({ children, className, last }: { children: ReactNode; className?: string; last?: boolean }) {
  return <div className={cx("flex items-center gap-3 px-4 py-3", !last && "border-b border-line-subtle", className)}>{children}</div>;
}
