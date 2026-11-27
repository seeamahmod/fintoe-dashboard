"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "./icon";
import { Badge, Kbd, MerchantMark, Tile } from "./ui";
import { cx, money, shortDate } from "@/lib/format";
import type { Sub, Txn } from "@/lib/data";
import { useApp } from "./app-provider";

type Item = { id: string; group: string; title: string; sub: string; lead: ReactNode; meta?: ReactNode; run: () => void };

const PAGES: [string, string, IconName, string][] = [
  ["Overview", "/", "home", "Balances, limits and recent activity"],
  ["Transactions", "/transactions", "transactions", "All payments and transfers"],
  ["Report", "/report", "report", "Spending, income and trends"],
  ["Loans & payments", "/loans", "loan", "Car and student loans"],
  ["Billing & subscriptions", "/billing", "billing", "Recurring payments"],
  ["Cards", "/cards", "card", "Limits, PIN and card controls"],
  ["Account", "/account", "account", "Profile and linked accounts"],
  ["Settings", "/settings", "settings", "Notifications, security, preferences"],
  ["Help center", "/help", "support", "Guides and support"],
];

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<strong className="font-semibold">{text.slice(i, i + q.length)}</strong>{text.slice(i + q.length)}</>;
}

export function CommandPalette({ open, onClose, txns, subs }: { open: boolean; onClose: () => void; txns: Txn[]; subs: Sub[] }) {
  const router = useRouter();
  const { openAddTxn } = useApp();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  const go = (href: string) => { onClose(); router.push(href); };
  const items = useMemo<Item[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) {
      return [
        ...["Streamly", "Oakwood Rentals", "Brewhouse"].map((t) => ({ id: "r-" + t, group: "Recent searches", title: t, sub: "Search", lead: <Tile icon="clock" />, run: () => setQ(t) })),
        { id: "a-add", group: "Quick actions", title: "Add transaction", sub: "Record cash or an external payment", lead: <Tile icon="plus" />, meta: <Kbd>N</Kbd>, run: () => { onClose(); openAddTxn(); } },
        { id: "a-card", group: "Quick actions", title: "Freeze a card", sub: "Pause a card instantly", lead: <Tile icon="freeze" />, run: () => go("/cards") },
        { id: "a-msg", group: "Quick actions", title: "Message support", sub: "We usually reply in 5 minutes", lead: <Tile icon="messages" />, run: () => go("/messages") },
        ...PAGES.slice(1, 6).map(([t, href, icon, sub]) => ({ id: "p-" + href, group: "Go to", title: t, sub, lead: <Tile icon={icon} />, run: () => go(href) })),
      ];
    }
    const tx = txns.filter((t) => t.merchant.toLowerCase().includes(s) || t.category.toLowerCase().includes(s) || Math.abs(t.amount).toFixed(2).includes(s.replace(/[$,]/g, ""))).slice(0, 5)
      .map((t) => ({ id: t.id, group: "Transactions", title: t.merchant, sub: `${shortDate(t.occurred_at)} · ${t.category} · •••• ${t.account_mask}`, lead: <MerchantMark merchant={t.merchant} category={t.category} />, meta: <span className="num text-sm">{money(t.amount, { sign: true })}</span>, run: () => go(`/transactions?tx=${t.id}`) }));
    const sb = subs.filter((x) => x.name.toLowerCase().includes(s)).map((x) => ({ id: x.id, group: "Bills & subscriptions", title: `${x.name} ${x.plan}`, sub: `Next ${new Date(x.next_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${x.cycle}`, lead: <MerchantMark merchant={x.name} category="Subscription" />, meta: <Badge tone={x.state.includes("failed") ? "error" : "success"}>{x.state.includes("failed") ? "Failed" : "Active"}</Badge>, run: () => go("/billing") }));
    const pg = PAGES.filter(([t]) => t.toLowerCase().includes(s)).map(([t, href, icon, sub]) => ({ id: "p-" + href, group: "Pages", title: t, sub, lead: <Tile icon={icon} />, run: () => go(href) }));
    return [...tx, ...sb, ...pg];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, txns, subs]);

  const suggestion = useMemo(() => {
    const s = q.trim().toLowerCase(); if (!s || items.length) return null;
    const names = [...new Set(txns.map((t) => t.merchant))];
    const best = names.map((n) => [n, lev(s, n.toLowerCase().slice(0, Math.max(s.length, 3)))] as const).sort((a, b) => a[1] - b[1])[0];
    return best && best[1] <= 2 ? best[0] : null;
  }, [q, items.length, txns]);

  useEffect(() => setActive(0), [q]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === "Enter") { e.preventDefault(); items[active]?.run(); }
    if (e.key === "Escape") onClose();
  };

  let lastGroup = "";
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-start justify-center bg-overlay pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal aria-label="Search" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}
            initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="w-[640px] max-w-[calc(100vw-48px)] overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-lg">
            <div className="flex items-center gap-3 border-b border-line-subtle px-5 py-4">
              <Icon name="search" className="text-ink-2" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value.slice(0, 80))} placeholder="Search accounts, payees, transactions…" aria-label="Search" className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-3" />
              {q && <button onClick={() => setQ("")} className="rounded-md px-2 py-1 text-xs font-medium hover:bg-hover">Clear</button>}
              <Kbd>Esc</Kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {items.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-4 py-10 text-center animate-fade">
                  <span className="grid size-12 place-items-center rounded-xl bg-shell text-ink-2"><Icon name="search" /></span>
                  <div><p className="font-medium">No matches for “{q}”</p><p className="mt-1 text-sm text-ink-2">Check the spelling, or search by payee, amount or category.</p></div>
                  {suggestion && <div className="flex items-center gap-2 text-sm text-ink-2">Did you mean<button onClick={() => setQ(suggestion)} className="rounded-md border border-line px-3 py-1 text-xs font-medium text-ink hover:bg-subtle">{suggestion}</button></div>}
                </div>
              )}
              {items.map((it, i) => {
                const head = it.group !== lastGroup ? (lastGroup = it.group) : null;
                return (
                  <div key={it.id}>
                    {head && <p className="eyebrow-sm px-3 pb-1.5 pt-3">{head}</p>}
                    <button onMouseMove={() => setActive(i)} onClick={it.run}
                      className={cx("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors", i === active && "bg-hover")}>
                      {it.lead}
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm"><Highlight text={it.title} q={q.trim()} /></span><span className="block truncate text-xs text-ink-2">{it.sub}</span></span>
                      {it.meta}
                      {i === active && <Kbd>↵</Kbd>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-line-subtle bg-subtle px-5 py-2.5 text-xs text-ink-2">
              <span className="flex items-center gap-1.5"><Kbd>↑ ↓</Kbd>Navigate</span>
              <span className="flex items-center gap-1.5"><Kbd>↵</Kbd>Open</span>
              <span className="flex items-center gap-1.5"><Kbd>Esc</Kbd>Close</span>
              <span className="ml-auto">Search by payee, amount or category</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
