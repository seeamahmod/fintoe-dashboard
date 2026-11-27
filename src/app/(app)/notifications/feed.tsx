"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button, Shell } from "@/components/ui";
import { Tabs } from "@/components/client";
import { NotifLead } from "@/components/shell";
import { useApp } from "@/components/app-provider";
import { markNotificationsRead } from "@/lib/actions";
import { cx, timeAgo } from "@/lib/format";
import type { Notif } from "@/lib/data";

const ACTIONS: Record<string, [string, string]> = { limit: ["Adjust limit", "/settings?tab=Preferences"], verify: ["Report this payment", "/messages"], sessions: ["Review sessions", "/settings?tab=Security"], statement: ["Download PDF", ""], retry: ["Retry payment", "/billing"] };

export function MarkAllButton({ disabled }: { disabled: boolean }) {
  const [p, start] = useTransition();
  const { toast } = useApp();
  return <Button icon="check" disabled={disabled || p} onClick={() => start(async () => { await markNotificationsRead(); toast("All caught up"); })}>Mark all as read</Button>;
}

export function NotificationFeed({ items }: { items: Notif[] }) {
  const [tab, setTab] = useState("All");
  const [, start] = useTransition();
  const router = useRouter();
  const { toast } = useApp();
  const [now] = useState(() => Date.now());
  const filtered = items.filter((n) => tab === "All" || (tab.startsWith("Unread") ? !n.read_at : tab === "Alerts" ? ["warning", "error"].includes(n.tone) : tab === "Security" ? ["shield", "laptop"].includes(n.icon) : ["invoice", "loan", "Dropbox", "dollar"].includes(n.icon)));
  const groups = useMemo(() => {
    const g: Record<string, Notif[]> = { Today: [], "This week": [], Earlier: [] };
    for (const n of filtered) { const h = (now - new Date(n.created_at).getTime()) / 36e5; (h < 24 ? g.Today : h < 168 ? g["This week"] : g.Earlier).push(n); }
    return Object.entries(g).filter(([, v]) => v.length);
  }, [filtered, now]);
  const unread = items.filter((n) => !n.read_at).length;
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={["All", `Unread (${unread})`, "Alerts", "Bills & payments", "Security"]} active={tab.startsWith("Unread") ? `Unread (${unread})` : tab} onChange={setTab} />
      {groups.length === 0 && <div className="card py-16 text-center"><p className="font-medium">You’re all caught up</p><p className="mt-1 text-sm text-ink-2">New alerts will show up here.</p></div>}
      {groups.map(([label, list], gi) => (
        <Shell key={label} title={label} info={false} style={{ animationDelay: `${gi * 60}ms` }}>
          <AnimatePresence initial={false}>
            {list.map((n, i) => {
              const act = n.action ? ACTIONS[n.action] : null;
              return (
                <motion.div layout key={n.id} className={cx("flex gap-3 px-4 py-3.5", i < list.length - 1 && "border-b border-line-subtle")}>
                  <span className={cx("mt-3.5 size-2 shrink-0 rounded-full transition-colors", n.read_at ? "bg-transparent" : "bg-brand")} />
                  <NotifLead n={n} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className={cx("text-sm", !n.read_at && "font-medium")}>{n.title}</p>
                    <p className="text-xs text-ink-2">{n.body}</p>
                    {act && <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => { start(async () => { await markNotificationsRead(n.id); }); if (act[1]) router.push(act[1]); else toast("Statement downloaded"); }}>{act[0]}</Button>
                      {n.action === "verify" && <Button size="sm" variant="ghost" onClick={() => start(async () => { await markNotificationsRead(n.id); toast("Thanks — marked as yours"); })}>Yes, it was me</Button>}</div>}
                  </div>
                  <div className="flex items-start gap-1"><span className="pt-0.5 text-xs text-ink-3">{timeAgo(n.created_at, now)}</span>
                    {!n.read_at && <button onClick={() => start(async () => { await markNotificationsRead(n.id); })} className="rounded-md px-2 py-0.5 text-xs text-ink-2 hover:bg-hover">Mark read</button>}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Shell>
      ))}
    </div>
  );
}
