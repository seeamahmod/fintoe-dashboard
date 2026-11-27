import type { Metadata } from "next";
import { getAccounts, getProfile } from "@/lib/data";
import { Badge, PageHeader, Shell, ShellLink, Tile } from "@/components/ui";
import { Icon } from "@/components/icon";
import { ProfileForm } from "./profile-form";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const [profile, accounts] = await Promise.all([getProfile(), getAccounts()]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Account" subtitle="Profile, linked accounts and security" />
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
        <Shell title="Personal details" className="[animation-delay:60ms]" bodyClass="p-4">
          <ProfileForm profile={profile} />
        </Shell>
        <div className="flex flex-col gap-4">
          <Shell title="Linked accounts" className="[animation-delay:120ms]" action={<ShellLink href="/settings">Link account</ShellLink>}>
            {accounts.map((a) => (
              <div key={a.id} className="row-hover flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0">
                <Tile icon={a.kind === "savings" ? "savings" : a.kind === "credit" ? "card" : "bank"} />
                <div className="flex-1"><p className="text-sm">{a.name}</p><p className="num text-xs text-ink-2">•••• {a.mask} · {a.detail}</p></div>
                <p className="num text-sm font-medium">{money(a.balance)}</p>
              </div>
            ))}
          </Shell>
          <Shell title="Verification" className="[animation-delay:180ms]" bodyClass="p-4 flex flex-col gap-3">
            {[["Identity (ID + selfie)", true], ["Proof of address", true], ["Tax ID (SSN)", false]].map(([l, ok]) => (
              <div key={l as string} className="flex items-center gap-2.5 text-sm">
                <Icon name={ok ? "success" : "warning"} className={ok ? "text-t-success" : "text-warning"} /><span className="flex-1">{l}</span>
                <Badge tone={ok ? "success" : "warning"}>{ok ? "Verified" : "Required for >$10k transfers"}</Badge>
              </div>
            ))}
          </Shell>
        </div>
      </div>
    </div>
  );
}
