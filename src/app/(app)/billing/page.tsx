import type { Metadata } from "next";
import { getSubscriptions } from "@/lib/data";
import { Badge, MerchantMark, PageHeader, Shell, ShellLink, Tile } from "@/components/ui";
import { Dismissible } from "@/components/client";
import { AutopayToggle, SubFilters } from "./billing-client";
import { PayButton } from "../loans/loans-client";
import { Icon } from "@/components/icon";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Billing & subscriptions" };

const INVOICES = [["Daily Ledger", "Jul 24, 2026", 4.25, "Failed"], ["Canvas Studio", "Jul 21, 2026", 59.99, "Paid"], ["City Gym", "Jul 18, 2026", 45, "Paid"], ["Cloudvault+", "Jul 10, 2026", 1.99, "Paid"], ["Tuneful", "Jul 9, 2026", 16.99, "Paid"]] as const;

export default async function BillingPage() {
  const subs = await getSubscriptions();
  const monthly = subs.filter((s) => s.cycle === "monthly").reduce((a, s) => a + s.amount, 0) + subs.filter((s) => s.plan.includes("yearly")).reduce((a, s) => a + s.amount / 12, 0);
  const unused = subs.filter((s) => s.state.startsWith("Not used"));
  const tone = (s: string) => (s.startsWith("Renews") ? "warning" : s.startsWith("Not used") ? "neutral" : s.includes("failed") ? "error" : "success") as "warning" | "neutral" | "error" | "success";
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing & subscriptions" subtitle={`${subs.length} active subscriptions · ${money(monthly)} / month`}>
        <PayButton label="Payment methods" icon="card" message="Payment methods opened" />
        <PayButton label="Add bill" variant="primary" icon="plus" message="Bill added" />
      </PageHeader>
      <div className="grid grid-cols-4 gap-4">
        {([["Monthly total", money(monthly), "subscription", "neutral"], ["Due in next 7 days", `3 · ${money(41.97)}`, "clock", "warning"], ["Yearly cost", money(monthly * 12), "calendar", "neutral"], ["Potential savings", `${money(unused.reduce((a, s) => a + s.amount, 0))} / mo`, "sparkle", "success"]] as const).map(([l, v, ic, t], i) => (
          <div key={l} className="card lift flex items-center gap-3 p-4 animate-rise" style={{ animationDelay: `${i * 50}ms` }}><Tile icon={ic} tone={t} size={36} /><div><p className="text-xs text-ink-2">{l}</p><p className="num text-lg font-medium">{v}</p></div></div>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
        <Shell title="Subscriptions" className="[animation-delay:120ms]" action={<ShellLink href="/billing">Manage</ShellLink>}>
          <SubFilters total={subs.length} />
          {subs.map((s, i) => (
            <div key={s.id} className="row-hover flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0 animate-fade" style={{ animationDelay: `${i * 30}ms` }}>
              <MerchantMark merchant={s.name} category="Subscription" />
              <div className="min-w-0 flex-1"><p className="text-sm">{s.name}</p><p className="text-xs text-ink-2">{s.plan} · {s.cycle}</p></div>
              <Badge tone={tone(s.state)}>{s.state}</Badge>
              <div className="w-28 text-right"><p className="num text-sm">{money(s.amount)}{s.plan.includes("yearly") ? "/yr" : ""}</p><p className="text-xs text-ink-2">Next · {new Date(s.next_date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</p></div>
              <span className="flex items-center gap-2"><AutopayToggle id={s.id} checked={s.autopay} /><span className="whitespace-nowrap text-sm">Autopay</span></span>
              <button aria-label="More" className="grid size-8 place-items-center rounded-md hover:bg-hover"><Icon name="more" /></button>
            </div>
          ))}
        </Shell>
        <div className="flex flex-col gap-4">
          <Dismissible tone="error" icon="error" title="Daily Ledger payment failed" body="Nova •••• 4402 was declined on Jul 24. Update the card to keep access." />
          <Dismissible tone="info" icon="info" delay={60} title={`Save ${money(unused.reduce((a, s) => a + s.amount, 0))} / month`} body={`${unused.map((u) => u.name).join(" and ")} haven’t been used in 40+ days. Review or cancel.`} />
          <Shell title="Recent invoices" className="[animation-delay:180ms]" action={<ShellLink href="/billing">View all</ShellLink>}>
            {INVOICES.map(([n, d, a, st]) => (
              <div key={n} className="row-hover flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0">
                <div className="flex-1"><p className="text-sm">{n}</p><p className="text-xs text-ink-2">{d}</p></div>
                <Badge tone={st === "Paid" ? "success" : "error"}>{st}</Badge>
                <p className="num w-16 text-right text-sm">{money(a)}</p>
                <button aria-label={`Download ${n} invoice`} className="grid size-8 place-items-center rounded-md hover:bg-hover"><Icon name="download" /></button>
              </div>
            ))}
          </Shell>
        </div>
      </div>
    </div>
  );
}
