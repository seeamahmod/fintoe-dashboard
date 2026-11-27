"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./icon";
import { cx } from "@/lib/format";
import type { Notif, Sub, Thread, Txn } from "@/lib/data";
import { CommandPalette } from "./command-palette";
import { AddTransaction } from "./add-transaction";

type ToastTone = "success" | "error" | "info";
type Panel = "notifications" | "messages" | null;
type Ctx = {
  toast: (msg: string, tone?: ToastTone) => void;
  openPalette: () => void;
  openAddTxn: () => void;
  panel: Panel;
  setPanel: (p: Panel) => void;
};
const AppCtx = createContext<Ctx>({ toast: () => {}, openPalette: () => {}, openAddTxn: () => {}, panel: null, setPanel: () => {} });
export const useApp = () => useContext(AppCtx);

export type ShellData = { txns: Txn[]; subs: Sub[]; notifications: Notif[]; threads: Thread[] };

export function AppProvider({ children, data }: { children: ReactNode; data: ShellData }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string; tone: ToastTone }[]>([]);
  const [palette, setPalette] = useState(false);
  const [addTxn, setAddTxn] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  const toast = useCallback((msg: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPanel(null); setPalette((v) => !v); }
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<Ctx>(() => ({ toast, openPalette: () => { setPanel(null); setPalette(true); }, openAddTxn: () => { setPalette(false); setAddTxn(true); }, panel, setPanel }), [toast, panel]);

  return (
    <AppCtx.Provider value={value}>
      {children}
      <CommandPalette open={palette} onClose={() => setPalette(false)} txns={data.txns} subs={data.subs} />
      <AddTransaction open={addTxn} onClose={() => setAddTxn(false)} />
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-inverse px-4 py-3 text-sm text-white shadow-lg">
              <Icon name={t.tone === "error" ? "error" : t.tone === "info" ? "info" : "success"} className={cx(t.tone === "error" ? "text-[#ff8a8a]" : t.tone === "info" ? "text-info" : "text-success")} />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppCtx.Provider>
  );
}
