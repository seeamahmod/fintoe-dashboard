"use client";

import { useMemo, useState } from "react";
import { WEEKS_LAST_YEAR, WEEKS_THIS_YEAR, WEEK0, WEEK_NOTES, REPORT_MONTHS } from "@/lib/demo";
import { Segmented } from "./client";
import { Trend } from "./ui";
import { Icon } from "./icon";
import { cx, money } from "@/lib/format";

/* ---------- Weekly spending gauge: 48 bars, 1 bar ≈ 2.08% of the limit ---------- */
export function Gauge({ spent, limit }: { spent: number; limit: number }) {
  const n = 48, pct = spent / limit, on = Math.round(pct * n);
  const R = 150, r = 112, cx0 = 170, cy0 = 170;
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <svg viewBox="0 0 340 190" className="w-full" role="img" aria-label={`${Math.round(pct * 100)}% of weekly limit used`}>
        {Array.from({ length: n }, (_, i) => {
          const a = Math.PI * (1 - i / (n - 1));
          const f = (v: number) => Math.round(v * 100) / 100;
          const x1 = f(cx0 + Math.cos(a) * r), y1 = f(cy0 - Math.sin(a) * r), x2 = f(cx0 + Math.cos(a) * R), y2 = f(cy0 - Math.sin(a) * R);
          const filled = i < on;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={7} strokeLinecap="round"
            stroke={filled ? "var(--color-chart-5)" : "var(--color-chart-5-subtle)"} style={{ opacity: 0, animation: `fade .25s ease ${i * 18}ms forwards` }} />;
        })}
        {(() => { const a = Math.PI * (1 - (on - 0.5) / (n - 1)); return <text x={Math.round(cx0 + Math.cos(a) * (R + 16))} y={Math.round(cy0 - Math.sin(a) * (R + 16) + 4)} fontSize="12" textAnchor="start" fill="var(--color-ink)" className="num">{Math.round(pct * 100)}%</text>; })()}
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <p className="eyebrow-sm">Spent this week</p>
        <p className="num text-[40px] font-medium leading-[48px] tracking-[-0.5px]">{money(spent, { cents: false })}</p>
        <p className="text-xs text-ink-2">of {money(limit, { cents: false })} limit</p>
      </div>
    </div>
  );
}

/* ---------- Daily mini bars (spend vs $200 budget, or income dots) ---------- */
export function MiniBars({ values, budget, color = "var(--color-chart-primary)", over = "var(--color-error)", dots = false }: { values: number[]; budget?: number; color?: string; over?: string; dots?: boolean }) {
  const max = Math.max(...values, budget ?? 0, 1);
  return (
    <div className="flex h-6 w-full items-end gap-[3px]" role="img" aria-label="Daily values for July">
      {values.map((v, i) => {
        const h = v === 0 ? 3 : Math.max(5, (v / max) * 24);
        const bad = budget !== undefined && v > budget;
        return <span key={i} title={v ? `Jul ${i + 1}: ${money(v, { cents: false })}` : `Jul ${i + 1}`} className="flex-1 origin-bottom animate-grow-y rounded-full"
          style={{ height: dots && v === 0 ? 3 : h, background: v === 0 ? "var(--color-chart-track)" : bad ? over : color, animationDelay: `${i * 18}ms` }} />;
      })}
    </div>
  );
}

/* ---------- Weekly expenses dot matrix, grouped by month ---------- */
const MONTHS: [string, number][] = [["Aug ’25", 5], ["Sep", 4], ["Oct", 4], ["Nov", 5], ["Dec", 4], ["Jan ’26", 4], ["Feb", 4], ["Mar", 5], ["Apr", 4], ["May", 5], ["Jun", 4], ["Jul", 4]];
const ROWS = 16; // $0–$800 at $50 per square

export function ExpensesChart() {
  const [mode, setMode] = useState("Weekly");
  const [hover, setHover] = useState<number | null>(45);
  const groups = useMemo(() => { return MONTHS.map(([m, n], mi) => { const w = MONTHS.slice(0, mi).reduce((a, [, c]) => a + c, 0); const idx = Array.from({ length: n }, (_, k) => w + k); return { m, idx, total: idx.reduce((a, i) => a + WEEKS_THIS_YEAR[i], 0), last: idx.reduce((a, i) => a + WEEKS_LAST_YEAR[i], 0) }; }); }, []);
  const total = WEEKS_THIS_YEAR.reduce((a, b) => a + b, 0), lastTotal = WEEKS_LAST_YEAR.reduce((a, b) => a + b, 0);
  const delta = ((total - lastTotal) / lastTotal) * 100;
  const weekDate = (i: number) => new Date(WEEK0.getTime() + i * 7 * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between">
        <div><p className="text-xs text-ink-2">Total expenses</p><div className="mt-1 flex items-center gap-2"><span className="num text-2xl font-medium">{money(total, { cents: false })}</span><Trend value={`${delta.toFixed(1).replace("-", "−")}% vs prior year`} good={delta < 0} /></div></div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 eyebrow-sm text-ink"><span className="size-2.5 rounded-[3px] bg-chart-primary" />This year</span>
          <span className="flex items-center gap-1.5 eyebrow-sm text-ink"><span className="size-2.5 rounded-[3px] bg-chart-secondary" />Last year</span>
          <Segmented size="sm" options={["Weekly", "Monthly"]} value={mode} onChange={setMode} />
        </div>
      </div>

      {mode === "Weekly" ? (
        <div className="relative mt-5 flex flex-1 gap-3" onMouseLeave={() => setHover(45)}>
          <div className="flex flex-col justify-between pb-10 text-right text-xs text-ink-2 num">{["$800", "$600", "$400", "$200", "$0"].map((l) => <span key={l} className="leading-none">{l}</span>)}</div>
          <div className="flex min-w-0 flex-1 gap-[clamp(4px,0.6vw,10px)]">
            {groups.map((g) => (
              <div key={g.m} className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-1 gap-[2px]">
                  {g.idx.map((i) => {
                    const v = WEEKS_THIS_YEAR[i] / 50, l = WEEKS_LAST_YEAR[i] / 50;
                    return (
                      <button key={i} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} aria-label={`Week of ${weekDate(i)}: ${money(WEEKS_THIS_YEAR[i], { cents: false })}`}
                        className={cx("relative flex min-w-0 flex-1 flex-col-reverse gap-[2px] rounded-[3px] outline-none transition-opacity", hover !== null && hover !== i && "opacity-70")}>
                        {Array.from({ length: ROWS }, (_, k) => (
                          <span key={k} className="aspect-square w-full rounded-[3px] animate-fade"
                            style={{ background: k < v ? "var(--color-chart-primary)" : k < l ? "var(--color-chart-secondary)" : "#2a2a2a0d", animationDelay: `${i * 8 + k * 6}ms` }} />
                        ))}
                        {hover === i && <span className="pointer-events-none absolute -top-2 bottom-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-ink" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-center"><p className="text-xs text-ink-2">{g.m}</p><p className="num text-xs font-medium">{money(g.total, { cents: false })}</p></div>
              </div>
            ))}
          </div>
          {hover !== null && (() => {
            const t = WEEKS_THIS_YEAR[hover], l = WEEKS_LAST_YEAR[hover], d = Math.round(((t - l) / l) * 100);
            const left = `calc(48px + (100% - 48px) * ${((hover + 0.5) / 52).toFixed(4)})`;
            return (
              <div className="pointer-events-none absolute top-0 z-10" style={{ left, transform: `translateX(${hover > 26 ? "calc(-100% - 12px)" : "12px"})` }}>
              <div className="w-[230px] rounded-xl bg-inverse p-3 text-white shadow-lg animate-pop">
                <p className="text-xs">Week of {weekDate(hover)}</p>
                <p className="num mt-1 flex items-center gap-2 text-lg font-medium"><span className="size-2.5 rounded-[3px] bg-chart-primary" />{money(t, { cents: false })}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-white/80"><span className="size-2.5 rounded-[3px] bg-chart-secondary" />{money(l, { cents: false })} same week last year</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80"><Icon name={d >= 0 ? "arrow-up-right" : "arrow-down-right"} size={14} />{Math.abs(d)}%{WEEK_NOTES[hover] ? ` · ${WEEK_NOTES[hover]}` : ""}</p>
              </div></div>
            );
          })()}
        </div>
      ) : (
        <div className="mt-5 flex flex-1 gap-3">
          <div className="flex flex-col justify-between pb-10 text-right text-xs text-ink-2 num">{["$2,500", "$2,000", "$1,500", "$1,000", "$500", "$0"].map((l) => <span key={l} className="leading-none">{l}</span>)}</div>
          <div className="flex flex-1 items-end gap-3">
            {groups.map((g, gi) => (
              <div key={g.m} className="flex flex-1 flex-col items-center">
                <div className="flex h-[240px] w-full items-end justify-center gap-1">
                  {[g.last, g.total].map((v, k) => (
                    <div key={k} className="flex w-[42%] flex-col-reverse gap-[2px]">
                      {Array.from({ length: Math.round(v / 250) }, (_, s) => <span key={s} className="h-[10px] w-full rounded-[3px] animate-fade" style={{ background: k ? "var(--color-chart-primary)" : "var(--color-chart-secondary)", animationDelay: `${gi * 30 + s * 25}ms` }} />)}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center"><p className="text-xs text-ink-2">{g.m}</p><p className="num text-xs font-medium">{money(g.total, { cents: false })}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-ink-2">{mode === "Weekly" ? "Each square = $50 spent · each column = 1 week" : "Each block = $250 · left = last year, right = this year"}</p>
    </div>
  );
}

/* ---------- Report: income vs spending, 1 block = $250 ---------- */
export function IncomeSpendingChart() {
  const [mode, setMode] = useState("Month");
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-chart-3" />Income</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-chart-primary" />Spending</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px] bg-inverse" />Net saved</span>
        <span className="ml-auto"><Segmented size="sm" options={["Month", "Year"]} value={mode} onChange={setMode} /></span>
      </div>
      <div className="mt-4 flex flex-1 gap-3">
        <div className="flex flex-col justify-between pb-7 text-right text-xs text-ink-2 num">{["$5k", "$4k", "$3k", "$2k", "$1k", "$0"].map((l) => <span key={l} className="leading-none">{l}</span>)}</div>
        <div className="flex flex-1 items-end justify-around border-b border-line-input">
          {REPORT_MONTHS.map((r, i) => (
            <div key={r.m} className="group flex flex-col items-center">
              <span className="num mb-1 text-xs font-medium text-t-success opacity-90 transition-transform group-hover:-translate-y-0.5">+{money(r.income - r.spending, { cents: false })}</span>
              <div className="flex items-end gap-1">
                {[r.income, r.spending].map((v, k) => (
                  <div key={k} className="flex w-[18px] flex-col-reverse gap-[3px]">
                    {Array.from({ length: Math.round(v / 250) }, (_, s) => <span key={s} className="h-[8px] w-full rounded-[3px] animate-fade" style={{ background: k ? "var(--color-chart-primary)" : "var(--color-chart-3)", animationDelay: `${i * 50 + s * 20}ms` }} />)}
                  </div>
                ))}
              </div>
              <span className="mt-2 pb-1 text-xs text-ink-2">{r.m}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-2">Each block = $250 · label = amount saved that month</p>
    </div>
  );
}
