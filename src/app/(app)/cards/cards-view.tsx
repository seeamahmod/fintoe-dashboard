"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Icon, type IconName } from "@/components/icon";
import { Badge, Shell, ShellLink, StripeMeter, btnClass } from "@/components/ui";
import { Toggle } from "@/components/client";
import { useApp } from "@/components/app-provider";
import { toggleCard } from "@/lib/actions";
import { cx } from "@/lib/format";
import type { Card } from "@/lib/data";

const THEME: Record<string, string> = {
  black: "bg-[linear-gradient(135deg,#4c4c4c,#000)]",
  orange: "bg-[linear-gradient(135deg,#b85a00,#8a4300)]",
  grey: "bg-[linear-gradient(135deg,#9aa3ad,#6b7480)]",
};

function PaymentCard({ c }: { c: Card }) {
  return (
    <div className={cx("relative aspect-[1.586] w-full overflow-hidden rounded-2xl p-5 text-white shadow-md", THEME[c.theme] ?? THEME.black)}>
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/10" />
      <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-lg font-medium"><Icon name="sparkle" />FinToe</span><span className="text-[11px] uppercase tracking-wider opacity-90">{c.kind}</span></div>
      <div className="mt-5 h-7 w-9 rounded-md bg-[#f2dc9a]" />
      <p className="num mt-4 text-xl tracking-[0.15em]">•••• •••• •••• {c.mask}</p>
      <div className="mt-3 flex items-end justify-between"><span className="text-[11px] tracking-wider">SEEAM AHMOD</span><span className="num text-xs">09/29</span><span className="text-xl font-bold italic">NOVA</span></div>
      {c.frozen && <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-t-info"><Icon name="freeze" size={14} />Frozen</span>}
    </div>
  );
}

const CONTROLS: [keyof Card, string, string][] = [
  ["online", "Online payments", "Allow purchases on websites and in apps."],
  ["contactless", "Contactless payments", "Tap to pay up to $250 without a PIN."],
  ["atm", "ATM withdrawals", "Up to $500 per day."],
  ["international", "International payments", "Block purchases outside the US."],
  ["gambling", "Gambling merchants", "Block payments to betting and casino sites."],
];

export function CardsView({ cards }: { cards: Card[] }) {
  const [sel, setSel] = useState(cards[0]?.id);
  const card = cards.find((c) => c.id === sel) ?? cards[0];
  const { toast } = useApp();
  const [, start] = useTransition();
  if (!card) return null;
  const set = (field: keyof Card, value: boolean) => toggleCard({ id: card.id, field, value });
  const actions: [IconName, string, string, () => void][] = [
    ["freeze", card.frozen ? "Unfreeze card" : "Freeze card", card.frozen ? "Resume payments instantly" : "Instantly block new payments", () => start(async () => { const r = await set("frozen", !card.frozen); toast(r.ok ? (card.frozen ? "Card unfrozen" : "Card frozen") : "Couldn’t update the card", r.ok ? "success" : "error"); })],
    ["eye", "Show details", "Number, expiry, CVC (Face ID)", () => toast("Verify with Face ID to reveal details", "info")],
    ["key", "Change PIN", "Takes effect immediately", () => toast("PIN change started", "info")],
    ["refresh", "Replace card", "Lost, stolen or damaged", () => toast("Replacement ordered")],
  ];
  return (
    <div className="grid grid-cols-[minmax(300px,0.38fr)_minmax(0,1fr)] gap-4 2xl:grid-cols-[minmax(340px,0.3fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        {cards.map((c, i) => (
          <motion.button key={c.id} onClick={() => setSel(c.id)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -2 }}
            className={cx("focus-ring rounded-2xl border bg-surface p-2.5 text-left transition-shadow", c.id === card.id ? "border-ink shadow-md ring-1 ring-ink" : "border-line-subtle hover:shadow-md")}>
            <PaymentCard c={c} />
            <div className="flex items-center justify-between px-1.5 pb-0.5 pt-2.5"><div><p className="text-sm">{c.label}</p><p className="text-xs text-ink-2">{c.detail}</p></div>
              <span className={cx("grid size-4 place-items-center rounded-full border", c.id === card.id ? "border-ink" : "border-line-strong")}>{c.id === card.id && <span className="size-2 rounded-full bg-ink" />}</span></div>
          </motion.button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-3">
          {actions.map(([ic, t, s, fn], i) => (
            <button key={t} onClick={fn} className="focus-ring card lift p-4 text-left animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="grid size-8 place-items-center rounded-full bg-shell"><Icon name={ic} /></span>
              <p className="mt-3 text-sm font-medium">{t}</p><p className="mt-1 text-xs text-ink-2">{s}</p>
            </button>
          ))}
        </div>
        <Shell title={`Spending limit · ${card.label}`} action={<ShellLink href="/settings">Edit limit</ShellLink>} bodyClass="p-4">
          <div className="flex items-baseline justify-between"><p><span className="num text-2xl font-medium">$1,640</span><span className="ml-2 text-xs text-ink-2">spent of $2,000 weekly limit · 1 bar = $25</span></p><span className="text-xs text-ink-2">Resets Mon, Jul 20</span></div>
          <div className="mt-3"><StripeMeter total={80} filled={66} color="var(--color-chart-5)" faint="var(--color-chart-5-subtle)" height={22} /></div>
        </Shell>
        <Shell title="Card controls" bodyClass="divide-y divide-line-subtle">
          {CONTROLS.map(([k, t, s]) => (
            <div key={k} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1"><p className="text-sm">{t}</p><p className="text-xs text-ink-2">{s}</p></div>
              <Toggle checked={Boolean(card[k])} label={t} onChange={(v) => set(k, v)} />
            </div>
          ))}
        </Shell>
        <div className="flex items-center gap-3 rounded-xl border border-error p-4">
          <div className="flex-1"><p className="text-sm font-medium">Cancel this card</p><p className="text-xs text-ink-2">Permanently closes Nova •••• {card.mask}. Recurring payments on it will fail.</p></div>
          {card.frozen && <Badge tone="info">Frozen</Badge>}
          <button onClick={() => toast("For safety, cancelling needs a confirmation from support", "info")} className={btnClass("destructive", "sm")}><Icon name="trash" size={16} />Cancel card</button>
        </div>
      </div>
    </div>
  );
}
