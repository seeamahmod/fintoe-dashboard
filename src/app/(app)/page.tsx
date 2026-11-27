import { Suspense } from "react";
import Link from "next/link";
import { getProfile, getTransactions } from "@/lib/data";
import { JULY_DAILY_SPEND, WEEKLY_LIMIT } from "@/lib/demo";
import { Icon } from "@/components/icon";
import { PageHeader, Shell, ShellLink, StripeMeter, Trend, btnClass } from "@/components/ui";
import { Dismissible } from "@/components/client";
import { ExpensesChart, Gauge, MiniBars } from "@/components/charts";
import { TransactionsTable } from "@/components/transactions-table";
import { AddTxnButton, ExportButton, KpiValue, RangePicker } from "./overview-client";
import { money } from "@/lib/format";

function Kpi({ label, value, trend, good, visual, caption, cta, href, delay }: { label: string; value: number; trend?: string; good?: boolean; visual: React.ReactNode; caption: string; cta: string; href: string; delay: number }) {
  return (
    <section className="shell lift animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between"><p className="eyebrow-sm text-ink">{label}</p><Icon name="info" size={16} className="text-ink-2" /></div>
        <div className="flex flex-wrap items-center gap-2"><KpiValue value={value} />{trend && <Trend value={trend} good={!!good} />}{label === "Outstanding balance" && <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">Due Jul 28</span>}</div>
        {visual}
        <p className="truncate text-xs text-ink-2">{caption}</p>
      </div>
      <Link href={href} className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium hover:bg-hover">{cta}<Icon name="chevron-right" size={16} className="transition-transform group-hover:translate-x-0.5" /></Link>
    </section>
  );
}

export default async function OverviewPage() {
  const [profile, txns] = await Promise.all([getProfile(), getTransactions()]);
  const left = WEEKLY_LIMIT.limit - WEEKLY_LIMIT.spent;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Good morning, ${profile.first_name || "there"}`} subtitle="Here’s your money for July 2026 · Updated 2 min ago">
        <RangePicker />
        <ExportButton txns={txns} />
        <AddTxnButton />
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <Kpi delay={0} label="Total balance" value={19850} trend="+0.10%" good visual={<StripeMeter total={40} filled={25} color="var(--color-chart-1)" />} caption="$19,850 of $32,000 goal · 1 bar = $800" cta="View balance" href="/account" />
        <Kpi delay={60} label="Income · July" value={4750} trend="−1.80%" visual={<StripeMeter total={38} filled={12} color="var(--color-chart-2)" faint="#dd76ff40" delay={100} />} caption="$1,470 of $4,750 left · 1 bar = $125" cta="View income" href="/report" />
        <Kpi delay={120} label="Spending · July" value={3280} trend="+18.75%" visual={<MiniBars values={JULY_DAILY_SPEND} budget={200} />} caption="Daily spend · 6 days over $200 budget (red)" cta="View spending" href="/transactions" />
        <Kpi delay={180} label="Outstanding balance" value={250} visual={<StripeMeter total={35} filled={10} color="var(--color-chart-4)" delay={200} />} caption="$100 of $350 paid · 1 bar = $10" cta="Pay now" href="/loans" />
      </div>

      <div className="grid grid-cols-[minmax(340px,0.42fr)_minmax(0,1fr)] gap-4 2xl:grid-cols-[minmax(380px,0.34fr)_minmax(0,1fr)]">
        <Shell title="Weekly spending limit" className="[animation-delay:120ms]" bodyClass="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-4 text-xs text-ink-2"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-5" />Spent · {money(WEEKLY_LIMIT.spent, { cents: false })}</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-5-subtle" />Left · {money(left, { cents: false })}</span></div>
          <Gauge spent={WEEKLY_LIMIT.spent} limit={WEEKLY_LIMIT.limit} />
          <div className="grid grid-cols-3 divide-x divide-line-subtle rounded-xl border border-line-subtle">
            {[["Daily average", "$234"], ["Days left", "3 of 7"], ["Safe to spend", "$120 / day"]].map(([k, v]) => <div key={k} className="px-3 py-2.5"><p className="text-xs text-ink-2">{k}</p><p className="num mt-0.5 text-sm font-medium">{v}</p></div>)}
          </div>
          <Dismissible tone="warning" icon="warning" title={`${money(left, { cents: false })} left this week`} body="You’ve used 82% of your $2,000 limit. Resets Monday." />
        </Shell>
        <Shell title="Expenses · weekly" className="[animation-delay:180ms]">
          <ExpensesChart />
        </Shell>
      </div>

      <Shell title="Recent transactions" className="[animation-delay:240ms]" action={<ShellLink href="/transactions">View all</ShellLink>}>
        <Suspense><TransactionsTable txns={txns.slice(0, 7)} pageSize={7} compact /></Suspense>
        <div className="flex items-center justify-between border-t border-line-subtle px-4 py-3 text-xs text-ink-2">
          <span>Showing 7 of {txns.length} transactions · newest first</span>
          <Link href="/transactions" className={btnClass("outline", "sm")}>View all transactions<Icon name="arrow-right" size={16} /></Link>
        </div>
      </Shell>
    </div>
  );
}
