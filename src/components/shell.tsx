"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "./icon";
import { Avatar, Badge, IconButton, Kbd, MerchantLogo, Tile, brandOf, btnClass, type Tone } from "./ui";
import { useApp } from "./app-provider";
import { cx, timeAgo } from "@/lib/format";
import type { Notif, Thread } from "@/lib/data";
import { markNotificationsRead, resetDemoData, signOut } from "@/lib/actions";

const NAV: { group: string; items: [string, string, IconName][] }[] = [
  { group: "Main menu", items: [["Overview", "/", "home"], ["Transactions", "/transactions", "transactions"], ["Report", "/report", "report"], ["Loans & payments", "/loans", "loan"]] },
  { group: "Management", items: [["Billing & subscriptions", "/billing", "billing"], ["Cards", "/cards", "card"], ["Account", "/account", "account"]] },
  { group: "Support", items: [["Settings", "/settings", "settings"], ["Help center", "/help", "support"], ["Terms & privacy", "/terms", "terms"]] },
];
const TITLES: Record<string, string> = Object.fromEntries(NAV.flatMap((g) => g.items.map(([t, h]) => [h, t])));
TITLES["/notifications"] = "Notifications"; TITLES["/messages"] = "Messages";

export function Sidebar({ pending, name, plan, isDemo }: { pending: number; name: string; plan: string; isDemo: boolean }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [busy, start] = useTransition();
  const { toast } = useApp();
  const router = useRouter();
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside className="sticky top-0 flex h-dvh w-[240px] shrink-0 flex-col gap-2 overflow-y-auto px-4 pb-4 pt-5">
      <Link href="/" className="mb-1 flex items-center gap-2.5 px-1">
        <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(180deg,#4c4c4c,#000)] text-white shadow-sm"><Icon name="sparkle" /></span>
        <span><span className="block text-base font-medium leading-5">FinToe Banking</span><span className="block text-xs text-ink-2">Manage your money</span></span>
      </Link>
      <nav className="flex flex-col gap-1" aria-label="Main">
        {NAV.map((g, gi) => (
          <div key={g.group} className={cx("flex flex-col gap-0.5", gi > 0 && "mt-2 border-t border-line-subtle pt-3")}>
            <p className="eyebrow-sm px-3 pb-1.5 pt-1">{g.group}</p>
            {g.items.map(([label, href, icon]) => {
              const active = href === "/" ? path === "/" : path.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}
                  className={cx("focus-ring group relative flex h-10 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm transition-colors", active ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-2 hover:bg-hover hover:text-ink")}>
                  <Icon name={icon} className={cx("transition-transform group-hover:scale-110", active ? "text-ink" : "text-ink-2")} />
                  {label}
                  {href === "/transactions" && pending > 0 && <span className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-ink">{pending}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Link href="/cards" className="card lift block p-3">
          <p className="eyebrow-sm">Weekly limit</p>
          <div className="mt-2 flex items-center justify-between text-xs"><span className="num">$1,640 of $2,000</span><span className="num font-medium">82%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-chart-track"><div className="h-full w-[82%] origin-left animate-grow-x rounded-full bg-warning" /></div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenu((v) => !v)} aria-expanded={menu} className="focus-ring card flex w-full items-center gap-2.5 p-2.5 text-left transition-colors hover:bg-subtle">
            <Avatar initials={initials} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{name}</span><span className="block text-xs text-ink-2">Personal · {plan} plan</span></span>
            <Icon name="chevron-down" className={cx("text-ink-2 transition-transform", menu && "rotate-180")} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-line-subtle bg-surface p-1.5 shadow-lg">
                <Link href="/account" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-hover"><Icon name="account" />Account</Link>
                <Link href="/settings" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-hover"><Icon name="settings" />Settings</Link>
                {isDemo && <button disabled={busy} onClick={() => start(async () => { const r = await resetDemoData(); setMenu(false); toast(r.ok ? "Demo data restored" : "Couldn’t reset data", r.ok ? "success" : "error"); router.refresh(); })} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-hover"><Icon name="refresh" />{busy ? "Resetting…" : "Reset demo data"}</button>}
                <form action={signOut}><button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-t-error hover:bg-error-subtle"><Icon name="logout" />Sign out</button></form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

const NTONE: Record<string, Tone> = { warning: "warning", error: "error", info: "info", success: "success", neutral: "neutral" };
export function NotifLead({ n, size = 32 }: { n: Notif; size?: number }) {
  const b = brandOf(n.icon);
  return b ? <MerchantLogo brand={b} size={size} /> : <Tile icon={n.icon as IconName} tone={NTONE[n.tone] ?? "neutral"} size={size} />;
}

function Popover({ open, children, onClose, label }: { open: boolean; children: React.ReactNode; onClose: () => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as HTMLElement).closest("[data-pop-trigger]")) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={ref} role="dialog" aria-label={label} initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ type: "spring", stiffness: 460, damping: 34 }}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[400px] origin-top-right overflow-hidden rounded-xl border border-line-subtle bg-surface shadow-lg">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Topbar({ notifications, threads, unreadNotifs, unreadMsgs }: { notifications: Notif[]; threads: Thread[]; unreadNotifs: number; unreadMsgs: number }) {
  const path = usePathname();
  const { openPalette, panel, setPanel, toast } = useApp();
  const [, start] = useTransition();
  const [tab, setTab] = useState("All");
  const title = TITLES[path] ?? TITLES["/" + path.split("/")[1]] ?? "Overview";
  const list = notifications.filter((n) => tab === "All" || (tab === "Unread" ? !n.read_at : tab === "Alerts" ? ["warning", "error"].includes(n.tone) : n.icon === "laptop" || n.icon === "shield")).slice(0, 5);
  return (
    <header className="flex h-14 items-center gap-3">
      <p className="text-lg font-medium">{title}</p>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={openPalette} className="focus-ring flex h-9 w-[280px] items-center gap-2 rounded-lg border border-line-input bg-surface px-3 text-left text-sm text-ink-3 transition-colors hover:border-line-strong">
          <Icon name="search" className="text-ink" /><span className="flex-1 truncate">Search accounts, payees…</span><Kbd>⌘K</Kbd>
        </button>
        <div className="relative">
          <span data-pop-trigger><IconButton icon="messages" label="Messages" dot={unreadMsgs > 0} className={cx("border border-line-input bg-surface", panel === "messages" && "bg-pressed")} onClick={() => setPanel(panel === "messages" ? null : "messages")} /></span>
          <Popover open={panel === "messages"} onClose={() => setPanel(null)} label="Messages">
            <div className="flex items-center gap-2 px-4 pb-2.5 pt-3.5"><p className="font-medium">Messages</p>{unreadMsgs > 0 && <Badge tone="brand" dot={false}>{unreadMsgs} unread</Badge>}
              <Link href="/messages?new=1" onClick={() => setPanel(null)} className={btnClass("ghost", "sm", "ml-auto")}><Icon name="edit" size={16} />New message</Link></div>
            <div className="border-t border-line-subtle">
              {threads.slice(0, 4).map((t, i) => (
                <Link key={t.id} href={`/messages?t=${t.id}`} onClick={() => setPanel(null)} className={cx("row-hover flex items-center gap-3 px-4 py-3", i < 3 && "border-b border-line-subtle")}>
                  <Avatar icon={t.icon as IconName} />
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className={cx("flex-1 truncate text-xs", t.unread ? "font-medium" : "")}>{t.name}</span><span className="text-[11px] text-ink-3">{timeAgo(t.updated_at)}</span></span>
                    <span className="flex items-center gap-2"><span className={cx("flex-1 truncate text-[11px]", t.unread ? "text-ink" : "text-ink-2")}>{t.last}</span>{t.unread > 0 && <span className="grid size-[18px] place-items-center rounded-full bg-brand text-[11px] font-semibold">{t.unread}</span>}</span></span>
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line-subtle bg-subtle px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-ink-2"><span className="size-2 rounded-full bg-success" />Support online · replies in ~5 min</span>
              <Link href="/messages" onClick={() => setPanel(null)} className={btnClass("outline", "sm")}>Open inbox<Icon name="arrow-right" size={16} /></Link>
            </div>
          </Popover>
        </div>
        <div className="relative">
          <span data-pop-trigger><IconButton icon="bell" label="Notifications" dot={unreadNotifs > 0} className={cx("border border-line-input bg-surface", panel === "notifications" && "bg-pressed")} onClick={() => setPanel(panel === "notifications" ? null : "notifications")} /></span>
          <Popover open={panel === "notifications"} onClose={() => setPanel(null)} label="Notifications">
            <div className="flex items-center gap-2 px-4 pb-2.5 pt-3.5"><p className="font-medium">Notifications</p>{unreadNotifs > 0 && <Badge tone="brand" dot={false}>{unreadNotifs} new</Badge>}
              <button onClick={() => start(async () => { await markNotificationsRead(); toast("All caught up"); })} className={btnClass("ghost", "sm", "ml-auto")}><Icon name="check" size={16} />Mark all as read</button></div>
            <div className="flex gap-4 border-b border-line-subtle px-4">
              {["All", "Unread", "Alerts", "Security"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cx("relative -mb-px pb-2 text-sm", tab === t ? "font-medium" : "text-ink-2 hover:text-ink")}>{t === "Unread" ? `Unread (${unreadNotifs})` : t}{tab === t && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink" />}</button>
              ))}
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {list.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-2">You’re all caught up.</p>}
              {list.map((n) => (
                <button key={n.id} onClick={() => !n.read_at && start(async () => { await markNotificationsRead(n.id); })} className="row-hover flex w-full gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0">
                  <NotifLead n={n} />
                  <span className="min-w-0 flex-1"><span className={cx("block text-xs", !n.read_at && "font-medium")}>{n.title}</span><span className="mt-0.5 block text-[11px] text-ink-2">{n.body}</span></span>
                  <span className="flex flex-col items-end gap-1.5"><span className="text-[11px] text-ink-3">{timeAgo(n.created_at)}</span>{!n.read_at && <span className="size-2 rounded-full bg-brand" />}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line-subtle bg-subtle px-4 py-2.5">
              <Link href="/settings" onClick={() => setPanel(null)} className={btnClass("ghost", "sm")}><Icon name="settings" size={16} />Settings</Link>
              <Link href="/notifications" onClick={() => setPanel(null)} className={btnClass("outline", "sm")}>View all notifications<Icon name="arrow-right" size={16} /></Link>
            </div>
          </Popover>
        </div>
      </div>
    </header>
  );
}
