import { Suspense } from "react";
import type { Metadata } from "next";
import { getTransactions } from "@/lib/data";
import { PageHeader, Shell, Tile } from "@/components/ui";
import { TransactionsTable } from "@/components/transactions-table";
import { AddTxnButton, ExportButton, RangePicker } from "../overview-client";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const txns = await getTransactions();
  const july = txns.filter((t) => t.occurred_at.startsWith("2026-07") && t.status !== "Failed");
  const inn = july.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const out = july.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);
  const pending = txns.filter((t) => t.status === "Pending");
  const stats: [string, string, "arrow-down-right" | "arrow-up-right" | "trend-up" | "clock", "success" | "brand" | "neutral" | "warning", string?][] = [
    ["Money in", money(inn, { sign: true }), "arrow-down-right", "success", "text-t-success"],
    ["Money out", money(out), "arrow-up-right", "brand"],
    ["Net cash flow", money(inn + out, { sign: true }), "trend-up", "neutral", inn + out >= 0 ? "text-t-success" : ""],
    ["Pending", `${pending.length} · ${money(Math.abs(pending.reduce((a, t) => a + t.amount, 0)))}`, "clock", "warning", "text-t-warning"],
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transactions" subtitle={`${txns.length} transactions · Jun 1 – Jul 31, 2026`}>
        <RangePicker /><ExportButton txns={txns} label="Export CSV" /><AddTxnButton />
      </PageHeader>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(([label, value, icon, tone, color], i) => (
          <div key={label} className="card lift flex items-center gap-3 p-4 animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
            <Tile icon={icon} tone={tone} size={36} />
            <div><p className="text-xs text-ink-2">{label}</p><p className={`num text-lg font-medium ${color ?? ""}`}>{value}</p></div>
          </div>
        ))}
      </div>
      <Shell title="All transactions" className="[animation-delay:150ms]">
        <Suspense><TransactionsTable txns={txns} /></Suspense>
      </Shell>
    </div>
  );
}
