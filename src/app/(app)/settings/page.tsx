import type { Metadata } from "next";
import { getPreferences } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { SettingsView } from "./settings-view";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [prefs, sp] = await Promise.all([getPreferences(), searchParams]);
  const tab = ["Notifications", "Security", "Preferences", "Connected apps"].includes(sp.tab ?? "") ? sp.tab! : "Notifications";
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Notifications, security and app preferences" />
      <SettingsView prefs={prefs} initialTab={tab} />
    </div>
  );
}
