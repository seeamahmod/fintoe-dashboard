"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { animate, useInView } from "motion/react";
import { Icon, type IconName } from "./icon";
import { cx } from "@/lib/format";
import { useApp } from "./app-provider";

/* Count-up number for KPI values */
export function CountUp({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [text, setText] = useState(format(value));
  useEffect(() => {
    if (!inView) return;
    const c = animate(value * 0.6, value, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setText(format(v)) });
    return () => c.stop();
  }, [inView, value, format]);
  return <span ref={ref} className={className}>{text}</span>;
}

/* Toggle switch; optional async commit with optimistic UI + rollback */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => Promise<{ ok: boolean; error?: string } | void> | void; label: string; disabled?: boolean }) {
  const [on, setOn] = useState(checked);
  const [pending, start] = useTransition();
  const { toast } = useApp();
  useEffect(() => setOn(checked), [checked]);
  return (
    <button
      role="switch" aria-checked={on} aria-label={label} disabled={disabled || pending}
      onClick={() => {
        const next = !on; setOn(next);
        start(async () => {
          const r = await onChange?.(next);
          if (r && !r.ok) { setOn(!next); toast(r.error ?? "Something went wrong", "error"); }
        });
      }}
      className={cx("focus-ring relative block h-[18px] w-8 shrink-0 rounded-full p-0.5 transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-disabled", on ? "bg-inverse" : "bg-[#2a2a2a29] enabled:hover:bg-[#2a2a2a38]")}
    >
      <span className={cx("block size-3.5 rounded-full bg-white shadow-[0_1px_3px_#0000001f] transition-transform duration-200 ease-out", on ? "translate-x-3.5" : "translate-x-0")} />
    </button>
  );
}

/* Segmented control with sliding thumb */
export function Segmented({ options, value, onChange, size = "md" }: { options: string[]; value?: string; onChange?: (v: string) => void; size?: "sm" | "md" }) {
  const [v, setV] = useState(value ?? options[0]);
  const idx = Math.max(0, options.indexOf(v));
  return (
    <div className={cx("relative inline-grid rounded-lg bg-muted p-0.5", size === "md" ? "h-9" : "h-8")} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }} role="tablist">
      <span className="absolute inset-y-0.5 left-0.5 rounded-md bg-surface shadow-sm transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }} />
      {options.map((o) => (
        <button key={o} role="tab" aria-selected={o === v} onClick={() => { setV(o); onChange?.(o); }}
          className={cx("focus-ring relative z-10 rounded-md px-3 text-sm transition-colors", o === v ? "font-medium text-ink" : "text-ink-3 hover:text-ink")}>{o}</button>
      ))}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-4 border-b border-line-subtle" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={t === active} onClick={() => onChange(t)}
          className={cx("focus-ring relative -mb-px px-1 pb-2.5 pt-1 text-sm transition-colors", t === active ? "font-medium text-ink" : "text-ink-2 hover:text-ink")}>
          {t}
          {t === active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ink animate-fade" />}
        </button>
      ))}
    </div>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {items.map((it, i) => (
        <div key={it.q} className={cx("border-b border-line-subtle last:border-0 transition-colors", open === i && "bg-subtle")}>
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="focus-ring flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium">
            {it.q}<Icon name="chevron-down" className={cx("shrink-0 transition-transform duration-300", open === i && "rotate-180")} />
          </button>
          <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
            <p className="overflow-hidden px-4 text-sm leading-6 text-ink-2"><span className="block pb-4">{it.a}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dismissible({ tone, icon, title, body, delay = 0 }: { tone: "info" | "success" | "warning" | "error"; icon: IconName; title: string; body: string; delay?: number }) {
  const [shown, setShown] = useState(true);
  const map = { info: "bg-info-subtle text-t-info", success: "bg-success-subtle text-t-success", warning: "bg-warning-subtle text-t-warning", error: "bg-error-subtle text-t-error" };
  const ic = { info: "text-info", success: "text-t-success", warning: "text-warning", error: "text-error" };
  return (
    <div className="grid transition-[grid-template-rows,opacity] duration-300" style={{ gridTemplateRows: shown ? "1fr" : "0fr", opacity: shown ? 1 : 0 }}>
      <div className="overflow-hidden">
        <div className={cx("flex gap-3 rounded-lg px-4 py-3 animate-rise", map[tone])} style={{ animationDelay: `${delay}ms` }}>
          <Icon name={icon} className={cx("mt-0.5 shrink-0", ic[tone])} />
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink">{title}</p><p className="mt-0.5 text-xs text-ink-2">{body}</p></div>
          <button aria-label="Dismiss" onClick={() => setShown(false)} className="focus-ring h-fit rounded p-0.5 text-ink-2 hover:bg-hover"><Icon name="close" size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={cx("animate-rise", className)} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}
