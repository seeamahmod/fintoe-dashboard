"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { CountUp } from "@/components/client";
import { useApp } from "@/components/app-provider";
import { downloadCsv } from "@/components/transactions-table";
import { money } from "@/lib/format";
import type { Txn } from "@/lib/data";

const fmt = (n: number) => money(n);
export function KpiValue({ value }: { value: number }) {
  return <CountUp value={value} format={fmt} className="num text-2xl font-medium tracking-[-0.25px]" />;
}

export function AddTxnButton() {
  const { openAddTxn } = useApp();
  return <Button variant="primary" icon="plus" onClick={openAddTxn}>Add transaction</Button>;
}

export function ExportButton({ txns, label = "Export report" }: { txns: Txn[]; label?: string }) {
  const { toast } = useApp();
  return <Button icon="export" onClick={() => { downloadCsv(txns, "fintoe-july-2026.csv"); toast("Report exported as CSV"); }}>{label}</Button>;
}

const RANGES = ["Jul 1 – Jul 31, 2026", "Jun 1 – Jun 30, 2026", "Last 90 days", "Year to date"];
export function RangePicker() {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(RANGES[0]);
  return (
    <div className="relative">
      <Button icon="calendar" iconRight="chevron-down" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{v}</Button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-line-subtle bg-surface p-1.5 shadow-lg animate-pop">
          {RANGES.map((r) => <button key={r} onClick={() => { setV(r); setOpen(false); }} className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-hover">{r}{r === v && <span className="size-1.5 rounded-full bg-brand" />}</button>)}
        </div>
      )}
    </div>
  );
}
