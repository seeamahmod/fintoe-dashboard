import type { Metadata } from "next";
import Link from "next/link";
import { FAQS } from "@/lib/demo";
import { getProfile } from "@/lib/data";
import { Icon, type IconName } from "@/components/icon";
import { Badge, LinkButton, PageHeader, Shell, ShellLink, Tile } from "@/components/ui";
import { Accordion } from "@/components/client";
import { HelpSearch } from "./help-search";
import { PayButton } from "../loans/loans-client";

export const metadata: Metadata = { title: "Help center" };

const TOPICS: [IconName, string, string, number, string][] = [
  ["card", "Cards", "Freeze, replace, PINs and limits", 14, "/cards"], ["send", "Payments & transfers", "Send money, payees, timing", 22, "/transactions"], ["refresh", "Disputes & refunds", "Report fraud, chargebacks", 9, "/messages"],
  ["loan", "Loans", "Schedules, early payoff, statements", 11, "/loans"], ["shield", "Account & security", "Login, 2FA, verification", 17, "/settings?tab=Security"], ["billing", "Billing & subscriptions", "Autopay, failed payments", 8, "/billing"],
];

export default async function HelpPage() {
  const profile = await getProfile();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Help center" subtitle="Guides, answers and 24/7 support">
        <LinkButton href="/messages" icon="messages">My tickets</LinkButton>
        <LinkButton href="/messages?new=1" variant="primary" icon="support">Contact support</LinkButton>
      </PageHeader>
      <section className="rounded-2xl bg-shell px-6 py-10 text-center animate-rise">
        <h2 className="text-xl font-medium">How can we help, {profile.first_name || "there"}?</h2>
        <HelpSearch />
      </section>
      <div className="grid grid-cols-3 gap-4">
        {TOPICS.map(([ic, t, s, n, href], i) => (
          <Link key={t} href={href} className="card lift group flex items-start gap-3 p-4 animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
            <Tile icon={ic} /><div className="flex-1"><p className="text-sm font-medium">{t}</p><p className="text-xs text-ink-2">{s}</p><p className="mt-1 text-xs text-ink-2">{n} articles</p></div>
            <Icon name="chevron-right" className="text-ink-2 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
        <Shell title="Frequently asked" action={<ShellLink href="/help">All FAQs</ShellLink>}><Accordion items={FAQS} /></Shell>
        <div className="flex flex-col gap-4">
          <Shell title="Contact us" bodyClass="p-4 flex flex-col gap-4">
            {([["messages", "Live chat", "Avg. reply in 2 min", "Start chat", "primary"], ["phone", "Call us", "+1 (800) 555-0199 · 24/7", "Call", "outline"], ["mail", "Email", "Reply within 1 business day", "Write", "outline"]] as const).map(([ic, t, s, cta, v]) => (
              <div key={t} className="flex items-center gap-3"><Tile icon={ic} /><div className="flex-1"><p className="text-sm">{t}</p><p className="text-xs text-ink-2">{s}</p></div>
                {t === "Live chat" ? <LinkButton href="/messages" size="sm" variant="primary">{cta}</LinkButton> : <PayButton label={cta} size="sm" variant={v} message={t === "Call us" ? "Calling support…" : "Email draft opened"} />}</div>
            ))}
          </Shell>
          <Shell title="Your tickets">
            <Link href="/messages" className="row-hover flex items-center gap-3 border-b border-line-subtle px-4 py-3"><div className="flex-1"><p className="text-sm">Oakwood Rentals payment dispute</p><p className="text-xs text-ink-2">#48213 · updated 20 min ago</p></div><Badge tone="info">In progress</Badge></Link>
            <div className="flex items-center gap-3 px-4 py-3"><div className="flex-1"><p className="text-sm">Card replacement</p><p className="text-xs text-ink-2">#47990 · Jun 30</p></div><Badge tone="success">Resolved</Badge></div>
          </Shell>
        </div>
      </div>
    </div>
  );
}
