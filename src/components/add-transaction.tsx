"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "./icon";
import { Button } from "./ui";
import { Segmented } from "./client";
import { addTransaction } from "@/lib/actions";
import { useApp } from "./app-provider";
import { cx } from "@/lib/format";

export const inputClass = "focus-ring h-10 w-full rounded-lg border border-line-input bg-surface px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-ink-3 hover:border-line-strong focus:border-brand focus:shadow-[0_0_0_3px_#ff870f33]";

export function Field({ label, children, hint, error }: { label: string; children: React.ReactNode; hint?: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink">{label}</span>
      {children}
      {(error || hint) && <span className={cx("text-xs", error ? "text-t-error" : "text-ink-2")}>{error ?? hint}</span>}
    </label>
  );
}
export function SelectBox({ icon, children, ...rest }: React.ComponentProps<"select"> & { icon?: IconName }) {
  return (
    <span className="relative block">
      {icon && <Icon name={icon} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink" />}
      <select {...rest} className={cx(inputClass, "appearance-none pr-9", icon && "pl-10")}>{children}</select>
      <Icon name="chevron-down" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-2" />
    </span>
  );
}

const CATS = ["Shopping", "Food & drink", "Transport", "Bills", "Subscription", "Entertainment", "Health", "Housing", "Salary", "Transfer", "Refund", "Other"];
const today = () => new Date().toISOString().slice(0, 10);

export function AddTransaction({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp();
  const [kind, setKind] = useState("Expense");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setError(null); setTimeout(() => first.current?.focus(), 60); } }, [open]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); if (open) window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, onClose]);

  const submit = (f: FormData) => {
    setError(null);
    start(async () => {
      const r = await addTransaction({
        kind, amount: f.get("amount"), merchant: f.get("merchant"), category: f.get("category"),
        account: f.get("account"), date: f.get("date"), status: f.get("status"), note: f.get("note") ?? "",
      });
      if (!r.ok) { setError(r.error); return; }
      toast(`${kind} saved`);
      onClose();
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.form action={submit} role="dialog" aria-modal aria-labelledby="add-txn-title" onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="w-[560px] max-w-full overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-lg">
            <header className="flex items-start justify-between border-b border-line-subtle px-6 pb-4 pt-5">
              <div><h2 id="add-txn-title" className="text-lg font-medium">Add transaction</h2><p className="text-xs text-ink-2">Record a cash or external payment. It won’t move money.</p></div>
              <button type="button" onClick={onClose} aria-label="Close" className="focus-ring rounded-md p-1 hover:bg-hover"><Icon name="close" /></button>
            </header>
            <div className="flex flex-col gap-4 px-6 py-5">
              <Segmented options={["Expense", "Income", "Transfer"]} value={kind} onChange={setKind} />
              <Field label="Amount" hint="Max $50,000 per transaction">
                <span className="relative block"><Icon name="dollar" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
                  <input ref={first} name="amount" required inputMode="decimal" type="number" step="0.01" min="0.01" max="50000" placeholder="0.00" className={cx(inputClass, "pl-10 num")} /></span>
              </Field>
              <Field label="Merchant or payee"><input name="merchant" required maxLength={80} placeholder="e.g. Uniqlo" className={inputClass} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category"><SelectBox name="category" icon="shopping" defaultValue={kind === "Income" ? "Salary" : "Shopping"}>{CATS.map((c) => <option key={c}>{c}</option>)}</SelectBox></Field>
                <Field label="Account"><SelectBox name="account" icon="bank" defaultValue="1233"><option value="1233">Checking •••• 1233</option><option value="2345">Savings •••• 2345</option><option value="4402">Visa •••• 4402</option></SelectBox></Field>
                <Field label="Date"><input name="date" type="date" required defaultValue={today()} max={today()} className={inputClass} /></Field>
                <Field label="Status"><SelectBox name="status" defaultValue="Completed"><option>Completed</option><option>Pending</option></SelectBox></Field>
              </div>
              <Field label="Note (optional)"><input name="note" maxLength={200} placeholder="e.g. Gift for Sam" className={inputClass} /></Field>
              {error && <p className="rounded-lg bg-error-subtle px-3 py-2 text-xs text-t-error animate-fade" role="alert">{error}</p>}
            </div>
            <footer className="flex justify-end gap-2 border-t border-line-subtle px-6 py-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Save transaction"}</Button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
