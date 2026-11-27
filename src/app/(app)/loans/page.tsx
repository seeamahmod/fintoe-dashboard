import type { Metadata } from "next";
import { LOANS, LOAN_HISTORY, UPCOMING } from "@/lib/demo";
import { type IconName } from "@/components/icon";
import { Avatar, Badge, PageHeader, Progress, Shell, ShellLink } from "@/components/ui";
import { PayButton } from "./loans-client";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Loans & payments" };

export default function LoansPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Loans & payments" subtitle="2 active loans · next payment due Jul 28">
        <PayButton label="Apply for a loan" variant="outline" icon="plus-circle" message="Loan application started — we’ll email you" />
        <PayButton label="Make a payment" variant="primary" icon="send" message="Payment scheduled" />
      </PageHeader>
      <div className="grid grid-cols-2 gap-4">
        {LOANS.map((l, i) => {
          const paid = Math.round((1 - l.remaining / l.total) * 100);
          return (
            <Shell key={l.id} title={l.title} className="lift" style={{ animationDelay: `${i * 60}ms` }} action={<ShellLink href="/loans">Schedule</ShellLink>} bodyClass="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar icon={l.icon as IconName} size={48} />
                <div className="flex-1"><p className="text-xs text-ink-2">Remaining balance</p><p className="num text-2xl font-medium">{money(l.remaining)} <span className="text-xs font-normal text-ink-2">of {money(l.total)}</span></p></div>
                <Badge tone={l.autopay ? "success" : "neutral"}>{l.autopay ? "Autopay on" : "Autopay off"}</Badge>
              </div>
              <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-ink-2">Paid off</span><span className="num">{paid}%</span></div><Progress value={paid} color={l.color} /></div>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {[["APR", `${l.apr}%`], ["Monthly payment", money(l.monthly)], ["Next due", l.nextDue], ["Final payment", l.final]].map(([k, v]) => <div key={k}><p className="text-xs text-ink-2">{k}</p><p className="num mt-0.5">{v}</p></div>)}
              </div>
              <div className="flex justify-end gap-2">
                <PayButton label="Pay extra" size="sm" message="Extra payment added to principal" />
                <PayButton label={`Pay ${money(l.monthly)}`} size="sm" variant="primary" message={`${money(l.monthly)} payment scheduled`} />
              </div>
            </Shell>
          );
        })}
      </div>
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] gap-4">
        <Shell title="Upcoming payments" className="[animation-delay:120ms]" action={<ShellLink href="/loans">View calendar</ShellLink>}>
          {UPCOMING.map((u, i) => (
            <div key={i} className="row-hover flex items-center gap-4 border-b border-line-subtle px-4 py-3 last:border-0">
              <div className="grid w-12 place-items-center rounded-lg border border-line-subtle py-1 leading-tight"><span className="text-[11px] uppercase text-ink-2">{u.m}</span><span className="num text-lg">{u.d}</span></div>
              <div className="flex-1"><p className="text-sm">{u.title}</p><p className="text-xs text-ink-2">{u.from}</p></div>
              <Badge tone={u.autopay ? "success" : "warning"}>{u.autopay ? "Autopay" : "Manual"}</Badge>
              <p className="num w-24 text-right">{money(u.amount)}</p>
              <PayButton label={u.autopay ? "Edit" : "Pay now"} size="sm" variant={u.autopay ? "ghost" : "outline"} message={u.autopay ? "Autopay settings opened" : `${money(u.amount)} paid`} />
            </div>
          ))}
        </Shell>
        <Shell title="Payment history" className="[animation-delay:180ms]" action={<ShellLink href="/terms">Statements</ShellLink>}>
          {LOAN_HISTORY.map((h, i) => (
            <div key={i} className="row-hover flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0">
              <div className="flex-1"><p className="text-sm">{h.title}</p><p className="text-xs text-ink-2">{h.date}</p></div>
              <Badge tone={h.state === "Completed" ? "success" : "error"}>{h.state}</Badge>
              <p className="num w-20 text-right text-sm">{money(-h.amount)}</p>
            </div>
          ))}
        </Shell>
      </div>
    </div>
  );
}
