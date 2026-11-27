import { AppProvider } from "@/components/app-provider";
import { Sidebar, Topbar } from "@/components/shell";
import { requireUser } from "@/lib/supabase/server";
import { getNotifications, getProfile, getShellCounts, getSubscriptions, getThreads, getTransactions } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireUser();
  const [profile, counts, notifications, threads, txns, subs] = await Promise.all([
    getProfile(), getShellCounts(), getNotifications(), getThreads(), getTransactions(), getSubscriptions(),
  ]);
  const name = `${profile.first_name} ${profile.last_name}`.trim() || email;
  return (
    <AppProvider data={{ txns, subs, notifications, threads }}>
      <div className="flex min-h-dvh">
        <Sidebar pending={counts.pending} name={name} plan={profile.plan} isDemo={email === process.env.DEMO_EMAIL} />
        <div className="min-w-0 flex-1 py-2 pr-2">
          <main className="min-h-[calc(100dvh-16px)] rounded-3xl border border-line-subtle bg-surface px-6 pb-10 shadow-sm 2xl:px-8">
            <div className="mx-auto w-full max-w-[1840px]">
              <Topbar notifications={notifications} threads={threads} unreadNotifs={counts.unreadNotifs} unreadMsgs={counts.unreadMsgs} />
              <div className="pt-4">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
