import type { Metadata } from "next";
import { getNotifications, getPreferences } from "@/lib/data";
import { PageHeader, Shell, ShellLink, Tile } from "@/components/ui";
import { NotificationFeed, MarkAllButton } from "./feed";
import { PrivacyToggle } from "../terms/terms-client";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const [items, prefs] = await Promise.all([getNotifications(), getPreferences()]);
  const unread = items.filter((n) => !n.read_at).length;
  const action = items.filter((n) => !n.read_at && n.tone === "error").length;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notifications" subtitle="Alerts, reminders and account activity"><MarkAllButton disabled={unread === 0} /></PageHeader>
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
        <NotificationFeed items={items} />
        <div className="flex flex-col gap-4">
          <Shell title="Summary" bodyClass="p-4 grid grid-cols-3 gap-3">
            {[[String(unread), "Unread", "text-ink"], [String(action), "Needs action", "text-t-error"], [String(items.length), "Total", "text-ink"]].map(([n, l, c]) => <div key={l} className="rounded-lg bg-subtle px-3 py-2.5"><p className={`num text-2xl font-medium ${c}`}>{n}</p><p className="text-xs text-ink-2">{l}</p></div>)}
          </Shell>
          <Shell title="Delivery" action={<ShellLink href="/settings">Settings</ShellLink>}>
            <PrivacyToggle k="ch.push" def label="Push notifications" sub="iPhone 15 · FinToe app" prefs={prefs} />
            <PrivacyToggle k="ch.email" def label="Email" sub="s•••m@example.com" prefs={prefs} />
            <PrivacyToggle k="ch.sms" def={false} label="SMS" sub="+1 (415) •••-0132" prefs={prefs} last />
          </Shell>
          <Shell title="Quiet hours" bodyClass="p-4 flex items-center gap-3"><Tile icon="clock" /><div><p className="num text-sm font-medium">10:00 pm – 7:00 am</p><p className="text-xs text-ink-2">Security alerts and payments over $500 still come through.</p></div></Shell>
        </div>
      </div>
    </div>
  );
}
