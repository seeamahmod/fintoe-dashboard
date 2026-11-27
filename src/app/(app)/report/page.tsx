import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/demo";
import { Icon, type IconName } from "@/components/icon";
import { PageHeader, Shell, ShellLink, StripeMeter, Tile, Trend } from "@/components/ui";
import { Dismissible } from "@/components/client";
import { IncomeSpendingChart } from "@/components/charts";
import { KpiValue } from "../overview-client";
import { ReportTabs, PdfButton } from "./report-client";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Report" };

function Kpi({ label, value, pct, trend, visual, caption, cta, href, delay }: { label: string; value: number; pct?: boolean; trend: string; visual: React.ReactNode; caption: string; cta: string; href: string; delay: number }) {
  return (
    <section className="shell lift animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between"><p className="eyebrow-sm text-ink">{label}</p><Icon name="info" size={16} className="text-ink-2" /></div>
        <div className="flex items-center gap-2">{pct ? <span className="num text-2xl font-medium">{value}%</span> : <KpiValue value={value} />}<Trend value={trend} good /></div>
        {visual}<p className="text-xs text-ink-2">{caption}</p>
      </div>
      <Link href={href} className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium hover:bg-hover">{cta}<Icon name="chevron-right" size={16} className="transition-transform group-hover:translate-x-0.5" /></Link>
    </section>
  );
}

export default function ReportPage() {
  const total = CATEGORIES.reduce((a, c) => a + c.amount, 0) + 675; // remaining categories
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Report" subtitle="Income & spending analysis · Jan – Jul 2026"><PdfButton /></PageHeader>
      <ReportTabs />
      <div className="grid grid-cols-3 gap-4">
        <Kpi delay={0} label="Avg monthly income" value={4690} trend="+2.1%" visual={<StripeMeter total={40} filled={37} color="var(--color-chart-3)" />} caption="$4,690 of $5,000 goal · 1 bar = $125" cta="View income" href="/transactions" />
        <Kpi delay={60} label="Avg monthly spending" value={3060} trend="−4.0%" visual={<StripeMeter total={40} filled={31} color="var(--color-chart-primary)" delay={80} />} caption="$3,060 of $4,000 budget · 1 bar = $100" cta="View spending" href="/transactions" />
        <Kpi delay={120} label="Savings rate" value={34.8} pct trend="+3.2 pts" visual={<StripeMeter total={40} filled={14} color="var(--color-chart-5)" faint="var(--color-chart-5-subtle)" delay={160} />} caption="34.8% saved · light bars = gap to 50% target · 1 bar = 2.5%" cta="Adjust goal" href="/settings" />
      </div>
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(380px,1fr)] gap-4">
        <Shell title="Income vs spending" className="[animation-delay:120ms]"><IncomeSpendingChart /></Shell>
        <Shell title="Spending by category" className="[animation-delay:180ms]" action={<ShellLink href="/transactions">Details</ShellLink>} bodyClass="p-4">
          <p className="mb-3 text-xs text-ink-2">July total · {money(3280)} · 1 bar = $50</p>
          <div className="flex flex-col gap-4">
            {CATEGORIES.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <Tile icon={c.icon as IconName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between"><p className="text-sm">{c.name}</p><p className="num text-sm">{money(c.amount)} <span className="ml-2 text-xs text-ink-2">{Math.round((c.amount / total) * 100)}%</span></p></div>
                  <div className="mt-1.5 w-full max-w-[220px] 2xl:max-w-[320px]"><StripeMeter total={33} filled={Math.round(c.amount / 50) > 33 ? 33 : Math.max(1, Math.round(c.amount / 50))} color={c.color} height={12} delay={i * 60} /></div>
                </div>
              </div>
            ))}
          </div>
        </Shell>
      </div>
      <Shell title="Insights" className="[animation-delay:240ms]" bodyClass="p-4 flex flex-col gap-2">
        <Dismissible tone="info" icon="info" title="Dining is up 22% vs June" body="$520 on food & drink — mostly weekends. Set a $450 category budget?" />
        <Dismissible tone="success" icon="success" delay={60} title="You saved $1,470 in July" body="That’s 31% of income, above your 6-month average of 29%." />
        <Dismissible tone="warning" icon="warning" delay={120} title="3 subscriptions renew next week" body="Streamly, Tuneful and Cloudvault · $41.97 total on Aug 8–10." />
      </Shell>
    </div>
  );
}
