import type { Metadata } from "next";
import { TERMS } from "@/lib/demo";
import { getPreferences } from "@/lib/data";
import { PageHeader, Shell } from "@/components/ui";
import { Dismissible } from "@/components/client";
import { PayButton } from "../loans/loans-client";
import { TermsTabs, PrivacyToggle } from "./terms-client";

export const metadata: Metadata = { title: "Terms & privacy" };

export default async function TermsPage() {
  const prefs = await getPreferences();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Terms & privacy" subtitle="Last updated Jun 1, 2026 · Effective Jul 1, 2026"><PayButton label="Download PDF" icon="download" message="Terms PDF downloaded" /></PageHeader>
      <TermsTabs />
      <div className="grid grid-cols-[240px_minmax(0,1fr)] items-start gap-8 2xl:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="sticky top-6 flex flex-col gap-1" aria-label="On this page">
          <p className="eyebrow-sm px-3 pb-2">On this page</p>
          {TERMS.map((t, i) => <a key={t.h} href={`#s${i + 1}`} className="rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink">{i + 1}. {t.h}</a>)}
        </nav>
        <article className="card flex max-w-[960px] flex-col gap-6 p-8 animate-rise">
          <Dismissible tone="info" icon="info" title="What changed on Jul 1, 2026" body="International card fees drop from 3% to 1.5%. Disputes can now be opened up to 120 days after a charge." />
          {TERMS.map((t, i) => (
            <section key={t.h} id={`s${i + 1}`} className="scroll-mt-6"><h2 className="text-lg font-medium">{i + 1}. {t.h}</h2><p className="mt-2 text-base leading-7 text-ink-2">{t.p}</p></section>
          ))}
          <Shell title="Your privacy choices">
            <PrivacyToggle k="privacy.insights" def label="Personalized insights" sub="Use my transactions to suggest budgets and savings." prefs={prefs} />
            <PrivacyToggle k="privacy.marketing" def={false} label="Marketing emails" sub="Product news and offers. Never sold to third parties." prefs={prefs} />
            <PrivacyToggle k="privacy.bureau" def label="Share on-time payments with credit bureaus" sub="Helps build your credit history." prefs={prefs} last />
          </Shell>
        </article>
      </div>
    </div>
  );
}
