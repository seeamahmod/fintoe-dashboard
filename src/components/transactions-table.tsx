"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./icon";
import { Badge, Button, MerchantMark, statusTone } from "./ui";
import { useApp } from "./app-provider";
import { cx, dateTime, money } from "@/lib/format";
import type { Txn } from "@/lib/data";
import { deleteTransaction } from "@/lib/actions";

const FILTERS = ["All", "Income", "Expenses", "Pending"] as const;

function toCsv(rows: Txn[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`; // guards against CSV formula injection
  return ["Date,Merchant,Description,Account,Category,Status,Amount", ...rows.map((t) => [t.occurred_at, esc(t.merchant), esc(t.description), t.account_mask, esc(t.category), t.status, t.amount.toFixed(2)].join(","))].join("\n");
}
export function downloadCsv(rows: Txn[], name = "transactions.csv") {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export function TransactionsTable({ txns, pageSize = 10, compact = false }: { txns: Txn[]; pageSize?: number; compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<string | null>(null);
  const [, start] = useTransition();
  const openId = params.get("tx");
  const open = txns.find((t) => t.id === openId) ?? null;

  const rows = useMemo(() => txns.filter((t) =>
    (filter === "All" || (filter === "Income" ? t.amount > 0 : filter === "Expenses" ? t.amount < 0 : t.status === "Pending")) &&
    (!query || `${t.merchant} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()))), [txns, filter, query]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const view = rows.slice(page * pageSize, page * pageSize + pageSize);
  useEffect(() => setPage(0), [filter, query]);
  useEffect(() => { const c = () => setMenu(null); window.addEventListener("click", c); return () => window.removeEventListener("click", c); }, []);

  const setOpen = (id: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (id) sp.set("tx", id); else sp.delete("tx");
    router.replace(`?${sp.toString()}`, { scroll: false });
  };
  const allOnPage = view.length > 0 && view.every((t) => selected.has(t.id));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <>
      <div className="flex items-center gap-2 border-b border-line-subtle px-4 py-3">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cx("focus-ring h-7 rounded-full px-3 text-xs font-medium transition-colors", filter === f ? "bg-inverse text-white" : "bg-muted text-ink hover:bg-[#2a2a2a29]")}>{f}</button>
        ))}
        <label className="relative ml-auto w-[260px]">
          <Icon name="filter" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
          <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 60))} placeholder="Filter transactions" aria-label="Filter transactions"
            className="focus-ring h-9 w-full rounded-lg border border-line-input bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-ink-3 focus:border-brand" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line-subtle bg-subtle text-left">
              <th className="w-10 py-2.5 pl-4"><input type="checkbox" aria-label="Select page" checked={allOnPage} onChange={() => setSelected((s) => { const n = new Set(s); view.forEach((t) => (allOnPage ? n.delete(t.id) : n.add(t.id))); return n; })} className="size-4 accent-[#2a2a2a]" /></th>
              {["Transaction", "Account", "Date", "Category", "Status"].map((h) => <th key={h} className={cx("eyebrow-sm py-2.5 font-medium", h === "Account" && "hidden xl:table-cell")}>{h}</th>)}
              <th className="eyebrow-sm py-2.5 pr-4 text-right">Amount</th><th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {view.map((t, i) => (
              <tr key={t.id} onClick={() => setOpen(t.id)} className={cx("group cursor-pointer border-b border-line-subtle transition-colors last:border-0 animate-fade", selected.has(t.id) ? "bg-selected" : "hover:bg-subtle")} style={{ animationDelay: `${i * 25}ms` }}>
                <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${t.merchant}`} checked={selected.has(t.id)} onChange={() => toggle(t.id)} className="size-4 accent-[#2a2a2a]" /></td>
                <td className="py-3"><div className="flex items-center gap-3"><MerchantMark merchant={t.merchant} category={t.category} /><div className="min-w-0"><p className="truncate">{t.merchant}</p><p className="truncate text-xs text-ink-2">{t.description}</p></div></div></td>
                <td className="num hidden py-3 text-ink-2 xl:table-cell">•••• {t.account_mask}</td>
                <td className="py-3 text-ink-2 whitespace-nowrap">{dateTime(t.occurred_at)}</td>
                <td className="py-3">{t.category}</td>
                <td className="py-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                <td className={cx("num py-3 pr-4 text-right font-medium whitespace-nowrap", t.amount > 0 && "text-t-success")}>{money(t.amount, { sign: true })}</td>
                <td className="relative py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                  <button aria-label="More actions" onClick={(e) => { e.stopPropagation(); setMenu(menu === t.id ? null : t.id); }} className="focus-ring grid size-8 place-items-center rounded-md text-ink hover:bg-hover"><Icon name="more" /></button>
                  <AnimatePresence>{menu === t.id && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-3 top-11 z-20 w-48 rounded-xl border border-line-subtle bg-surface p-1.5 text-left shadow-lg">
                      <button onClick={() => { setMenu(null); setOpen(t.id); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 hover:bg-hover"><Icon name="eye" />View details</button>
                      <button onClick={() => { setMenu(null); downloadCsv([t], `${t.merchant}-receipt.csv`); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 hover:bg-hover"><Icon name="download" />Download receipt</button>
                      <button onClick={() => { setMenu(null); start(async () => { const r = await deleteTransaction(t.id); toast(r.ok ? "Transaction deleted" : r.error, r.ok ? "success" : "error"); }); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-t-error hover:bg-error-subtle"><Icon name="trash" />Delete transaction</button>
                    </motion.div>)}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
            {view.length === 0 && <tr><td colSpan={8} className="py-14 text-center"><p className="font-medium">No transactions match</p><p className="mt-1 text-sm text-ink-2">Try a different filter or clear the search.</p></td></tr>}
          </tbody>
        </table>
      </div>
      {!compact && (
        <div className="flex items-center justify-between border-t border-line-subtle px-4 py-3 text-xs text-ink-2">
          <span>Showing {rows.length ? page * pageSize + 1 : 0}–{Math.min(rows.length, (page + 1) * pageSize)} of {rows.length} transactions · newest first</span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" icon="chevron-left" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
            {Array.from({ length: pages }, (_, i) => <button key={i} onClick={() => setPage(i)} className={cx("focus-ring grid size-8 place-items-center rounded-md text-sm", i === page ? "border border-line bg-surface font-medium text-ink shadow-sm" : "hover:bg-hover")}>{i + 1}</button>)}
            <Button size="sm" variant="ghost" iconRight="chevron-right" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed bottom-6 left-[calc(50%+120px)] z-40 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-line-subtle bg-surface p-2 pl-4 shadow-lg">
            <span className="mr-2 text-sm font-medium">{selected.size} selected</span>
            <Button size="sm" icon="export" onClick={() => downloadCsv(txns.filter((t) => selected.has(t.id)))}>Export</Button>
            <Button size="sm" variant="primary" icon="check" onClick={() => { toast(`${selected.size} marked as reviewed`); setSelected(new Set()); }}>Mark as reviewed</Button>
            <button aria-label="Clear selection" onClick={() => setSelected(new Set())} className="grid size-8 place-items-center rounded-md hover:bg-hover"><Icon name="close" /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <TxnDrawer txn={open} onClose={() => setOpen(null)} />
    </>
  );
}

function TxnDrawer({ txn, onClose }: { txn: Txn | null; onClose: () => void }) {
  const { toast } = useApp();
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <AnimatePresence>
      {txn && (
        <motion.div className="fixed inset-0 z-50 bg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside role="dialog" aria-modal aria-label={`${txn.merchant} details`} onClick={(e) => e.stopPropagation()}
            initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute inset-y-0 right-0 flex w-[480px] max-w-full flex-col bg-surface shadow-lg">
            <header className="flex items-start justify-between border-b border-line-subtle px-6 pb-4 pt-5">
              <div><h2 className="text-lg font-medium">{txn.merchant}</h2><p className="text-xs text-ink-2">{txn.description} · {dateTime(txn.occurred_at)}</p></div>
              <button onClick={onClose} aria-label="Close" className="focus-ring rounded-md p-1 hover:bg-hover"><Icon name="close" /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center gap-4"><MerchantMark merchant={txn.merchant} category={txn.category} size={48} />
                <div><p className={cx("num text-[32px] font-medium leading-10", txn.amount > 0 && "text-t-success")}>{money(txn.amount, { sign: true })}</p><Badge tone={statusTone(txn.status)}>{txn.status}</Badge></div></div>
              <dl className="mt-6 divide-y divide-line-subtle rounded-xl border border-line-subtle text-sm">
                {[["Account", `Everyday •••• ${txn.account_mask}`], ["Category", txn.category], ["Reference", `FT-${txn.id.slice(0, 8).toUpperCase()}`], ["Note", txn.note || "—"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-4 py-3"><dt className="text-xs text-ink-2">{k}</dt><dd className="num">{v}</dd></div>
                ))}
              </dl>
              <p className="eyebrow-sm mt-6">Activity</p>
              <ol className="mt-3 space-y-3 text-sm">
                <li className="flex gap-3"><span className={cx("mt-1.5 size-2 rounded-full", txn.status === "Failed" ? "bg-error" : txn.status === "Pending" ? "bg-warning" : "bg-success")} /><div><p>{txn.status === "Completed" ? "Posted to account" : txn.status === "Pending" ? "Awaiting settlement" : "Declined"}</p><p className="text-xs text-ink-2">{dateTime(txn.occurred_at)}</p></div></li>
                <li className="flex gap-3"><span className="mt-1.5 size-2 rounded-full bg-success" /><div><p>Authorized</p><p className="text-xs text-ink-2">{dateTime(txn.occurred_at)}</p></div></li>
              </ol>
            </div>
            <footer className="flex justify-end gap-2 border-t border-line-subtle px-6 py-4">
              <Button variant="ghost" icon="warning" onClick={() => toast("Report started — we’ll message you", "info")}>Report an issue</Button>
              <Button variant="primary" icon="download" onClick={() => downloadCsv([txn], `${txn.merchant}-receipt.csv`)}>Download receipt</Button>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
