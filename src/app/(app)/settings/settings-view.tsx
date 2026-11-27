"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Icon, type IconName } from "@/components/icon";
import { Badge, Button, MerchantLogo, Shell, StripeMeter, Tile } from "@/components/ui";
import { Segmented, Tabs, Toggle } from "@/components/client";
import { Field, SelectBox, inputClass } from "@/components/add-transaction";
import { useApp } from "@/components/app-provider";
import { changePassword, savePreference } from "@/lib/actions";
import { cx } from "@/lib/format";

type Prefs = Record<string, boolean | string>;

function PrefToggle({ k, prefs, def, label }: { k: string; prefs: Prefs; def: boolean; label: string }) {
  const v = typeof prefs[k] === "boolean" ? (prefs[k] as boolean) : def;
  return <Toggle checked={v} label={label} onChange={(nv) => savePreference({ key: k, value: nv })} />;
}
function Item({ icon, title, sub, children, last }: { icon?: IconName; title: string; sub?: string; children?: React.ReactNode; last?: boolean }) {
  return (
    <div className={cx("flex items-center gap-3 px-4 py-3.5", !last && "border-b border-line-subtle")}>
      {icon && <Tile icon={icon} />}
      <div className="min-w-0 flex-1"><p className="text-sm">{title}</p>{sub && <p className="text-xs text-ink-2">{sub}</p>}</div>
      {children}
    </div>
  );
}

export function SettingsView({ prefs, initialTab }: { prefs: Prefs; initialTab: string }) {
  const [tab, setTab] = useState(initialTab);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={["Notifications", "Security", "Preferences", "Connected apps"]} active={tab} onChange={(t) => { setTab(t); router.replace(`/settings?tab=${encodeURIComponent(t)}`, { scroll: false }); }} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
          {tab === "Notifications" && <NotificationsTab prefs={prefs} />}
          {tab === "Security" && <SecurityTab />}
          {tab === "Preferences" && <PreferencesTab prefs={prefs} />}
          {tab === "Connected apps" && <AppsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function NotificationsTab({ prefs }: { prefs: Prefs }) {
  const alerts: [string, string, string, boolean][] = [
    ["alert.large", "Large transaction alerts", "Notify me when a single payment is over $500.", true],
    ["alert.limit", "Spending limit warnings", "Alert at 80% and 100% of my weekly limit.", true],
    ["alert.bills", "Bill reminders", "3 days before a bill or subscription renews.", true],
    ["alert.lowbal", "Low balance", "When Everyday Checking drops below $500.", false],
    ["alert.weekly", "Weekly summary", "A Monday email with last week’s spending.", true],
  ];
  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
      <div className="flex flex-col gap-4">
        <Shell title="Alerts">{alerts.map(([k, t, s, d], i) => <Item key={k} title={t} sub={s} last={i === alerts.length - 1}><PrefToggle k={k} prefs={prefs} def={d} label={t} /></Item>)}</Shell>
        <Shell title="Delivery channels">
          <Item icon="mobile" title="Push notifications"><PrefToggle k="ch.push" prefs={prefs} def label="Push" /></Item>
          <Item icon="mail" title="Email · s•••m@example.com"><PrefToggle k="ch.email" prefs={prefs} def label="Email" /></Item>
          <Item icon="phone" title="SMS · +1 (415) •••-0132" last><PrefToggle k="ch.sms" prefs={prefs} def={false} label="SMS" /></Item>
        </Shell>
      </div>
      <Shell title="Quiet hours" bodyClass="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3"><Tile icon="clock" /><div className="flex-1"><p className="num text-sm font-medium">10:00 pm – 7:00 am</p><p className="text-xs text-ink-2">Every day · your local time</p></div><PrefToggle k="quiet" prefs={prefs} def label="Quiet hours" /></div>
        <p className="text-xs text-ink-2">Security alerts and payments over $500 still come through during quiet hours.</p>
      </Shell>
    </div>
  );
}

function SecurityTab() {
  const [pw, setPw] = useState(false);
  const { toast } = useApp();
  const checks: [string, true | string][] = [["Strong password", true], ["Two-factor authentication", true], ["Face ID for payments", true], ["Recovery codes saved", true], ["Passkey on every device", "iPhone 15 and iPad have none"]];
  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
      <div className="flex flex-col gap-4">
        <Shell title="Sign-in & verification">
          <Item icon="key" title="Password" sub="Last changed Apr 12, 2026 · 3 months ago"><Button size="sm" onClick={() => setPw(true)}>Change password</Button></Item>
          <Item icon="shield" title="Two-factor authentication" sub="Authenticator app · backup by SMS to •••-0132"><Badge tone="success">On</Badge><Button size="sm" onClick={() => toast("2FA settings opened", "info")}>Manage</Button></Item>
          <Item icon="lock" title="Face ID for payments" sub="Required for any payment over $500"><Toggle checked label="Face ID" /></Item>
          <Item icon="laptop" title="Passkeys" sub="1 passkey · MacBook Pro · added May 2, 2026"><Button size="sm" icon="plus" onClick={() => toast("Follow the prompt on your device", "info")}>Add passkey</Button></Item>
          <Item icon="copy" title="Recovery codes" sub="8 of 10 unused · generated Jan 3, 2026" last><Button size="sm" variant="ghost" onClick={() => toast("Codes hidden — verify to view", "info")}>View codes</Button></Item>
        </Shell>
        <Shell title="Active sessions">
          <Item icon="laptop" title="MacBook Pro · Chrome" sub="San Francisco, CA · this device · active now"><Badge tone="success">This device</Badge></Item>
          <Item icon="mobile" title="iPhone 15 · FinToe app" sub="San Francisco, CA · 2 h ago"><Button size="sm" variant="ghost" onClick={() => toast("Signed out iPhone 15")}>Sign out</Button></Item>
          <Item icon="mobile" title="iPad · Safari" sub="Oakland, CA · Jul 13 · first seen 3 days ago" last><Badge tone="warning">New</Badge><Button size="sm" variant="ghost" onClick={() => toast("Signed out iPad")}>Sign out</Button></Item>
        </Shell>
      </div>
      <Shell title="Security checkup" bodyClass="p-4 flex flex-col gap-3">
        <div className="flex items-end justify-between"><div><p className="num text-[32px] font-medium leading-10">4 of 5</p><p className="text-xs text-ink-2">steps done · 1 bar = 1 step</p></div><Badge tone="success">Good</Badge></div>
        <StripeMeter total={5} filled={4} color="var(--color-success)" height={8} />
        <div className="flex flex-col gap-2 pt-1">{checks.map(([l, ok]) => <div key={l} className="flex items-start gap-2 text-sm"><Icon name={ok === true ? "success" : "warning"} className={ok === true ? "text-t-success" : "text-warning"} /><div>{l}{ok !== true && <p className="text-xs text-t-warning">{ok}</p>}</div></div>)}</div>
        <Button variant="primary" iconRight="arrow-right" className="w-full" onClick={() => toast("Open FinToe on your iPhone to finish", "info")}>Add a passkey on iPhone</Button>
      </Shell>
      <ChangePassword open={pw} onClose={() => setPw(false)} />
    </div>
  );
}

function ChangePassword({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const { toast } = useApp();
  const rules = [[next.length >= 12, "At least 12 characters"], [/[a-z]/.test(next) && /[A-Z]/.test(next), "Upper and lower case letters"], [/[0-9\W_]/.test(next), "At least one number or symbol"]] as const;
  const met = rules.filter((r) => r[0]).length;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.form role="dialog" aria-modal aria-label="Change password" onMouseDown={(e) => e.stopPropagation()} initial={{ y: 16, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 8, opacity: 0 }}
            onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setError(null); if (next !== confirm) { setError("Passwords don’t match."); return; }
              start(async () => { const r = await changePassword({ current: f.get("current"), next }); if (!r.ok) setError(r.error); else { toast("Password updated"); onClose(); } }); }}
            className="w-[480px] max-w-full overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-lg">
            <header className="flex items-start justify-between border-b border-line-subtle px-6 pb-4 pt-5"><div><h2 className="text-lg font-medium">Change password</h2><p className="text-xs text-ink-2">Use at least 12 characters you don’t use anywhere else</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-hover"><Icon name="close" /></button></header>
            <div className="flex flex-col gap-4 px-6 py-5">
              <Field label="Current password"><input name="current" type="password" autoComplete="current-password" required className={inputClass} /></Field>
              <Field label="New password"><input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required maxLength={128} className={inputClass} /></Field>
              <div><StripeMeter total={3} filled={met} color={met === 3 ? "var(--color-success)" : "var(--color-warning)"} height={6} /><div className="mt-2 flex flex-col gap-1">{rules.map(([ok, l]) => <p key={l} className={cx("flex items-center gap-2 text-xs", ok ? "text-t-success" : "text-ink-2")}><Icon name={ok ? "check" : "minus"} size={14} />{l}</p>)}</div></div>
              <Field label="Confirm new password" error={confirm && confirm !== next ? "Passwords don’t match" : undefined}><input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputClass} /></Field>
              {error && <p role="alert" className="rounded-lg bg-error-subtle px-3 py-2 text-xs text-t-error">{error}</p>}
            </div>
            <footer className="flex justify-end gap-2 border-t border-line-subtle px-6 py-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={pending || met < 3}>{pending ? "Updating…" : "Update password"}</Button></footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PreferencesTab({ prefs }: { prefs: Prefs }) {
  const sel = (k: string, def: string, opts: string[], icon?: IconName) => (
    <div className="w-[260px]"><SelectBox icon={icon} defaultValue={(prefs[k] as string) ?? def} onChange={(e) => savePreference({ key: k, value: e.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</SelectBox></div>
  );
  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
      <div className="flex flex-col gap-4">
        <Shell title="Language & region">
          <Item icon="globe" title="Language" sub="Used for menus, emails and statements">{sel("lang", "English (US)", ["English (US)", "English (UK)", "Español", "বাংলা"], "globe")}</Item>
          <Item icon="dollar" title="Currency" sub="Primary display currency for all accounts">{sel("currency", "USD · US Dollar", ["USD · US Dollar", "EUR · Euro", "GBP · Pound", "BDT · Taka"], "dollar")}</Item>
          <Item icon="clock" title="Time zone" sub="Detected from this device">{sel("tz", "Pacific Time (UTC−07:00)", ["Pacific Time (UTC−07:00)", "Eastern Time (UTC−04:00)", "Dhaka (UTC+06:00)"], "clock")}</Item>
          <Item icon="calendar" title="Week starts on" sub="Used by weekly limits and reports" last>{sel("week", "Monday", ["Monday", "Sunday"])}</Item>
        </Shell>
        <Shell title="Appearance" bodyClass="p-4 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-3">
            {[["Light", "Default", true, false], ["Match system", "Follows your OS", false, false], ["Dark", "Coming soon", false, true]].map(([n, s, on, dis]) => (
              <div key={n as string} className={cx("rounded-xl border p-2", on ? "border-ink ring-1 ring-ink" : "border-line", dis && "opacity-60")}>
                <div className={cx("flex h-20 gap-1.5 rounded-lg p-2", n === "Dark" ? "bg-inverse" : "bg-shell")}><div className={cx("w-9 rounded", n === "Dark" ? "bg-black" : "bg-surface")} /><div className={cx("flex-1 rounded", n === "Dark" ? "bg-black" : "bg-surface")} /></div>
                <div className="flex items-center justify-between px-1 pt-2"><div><p className="text-xs font-medium">{n as string}</p><p className="text-[11px] text-ink-2">{s as string}</p></div>{on && <Icon name="success" />}{dis && <Badge dot={false}>Soon</Badge>}</div>
              </div>
            ))}
          </div>
          <div className="-mx-4"><Item title="Hide balances when the app opens" sub="Tap the eye icon to reveal · useful in public"><PrefToggle k="hideBal" prefs={prefs} def={false} label="Hide balances" /></Item><Item title="Reduce motion" sub="Turn off chart and panel animations" last><PrefToggle k="reduceMotion" prefs={prefs} def={false} label="Reduce motion" /></Item></div>
        </Shell>
      </div>
      <div className="flex flex-col gap-4">
        <Shell title="Budgets & goals" bodyClass="p-4 flex flex-col gap-4">
          <Field label="Weekly spending limit" hint="Resets every Monday · you’ve used $1,640 this week"><input defaultValue="$2,000.00" className={cx(inputClass, "num")} /></Field>
          <Field label="Savings goal" hint="$19,850 saved · 62% · 1 bar = $800 on Overview"><input defaultValue="$32,000.00" className={cx(inputClass, "num")} /></Field>
        </Shell>
        <Shell title="Statements & export">
          <Item title="Monthly statement email" sub="Sent on the 1st"><PrefToggle k="stmtEmail" prefs={prefs} def label="Statement email" /></Item>
          <Item title="Default export format" sub="Used by Export report" last><Segmented size="sm" options={["CSV", "PDF"]} value={(prefs.exportFmt as string) ?? "CSV"} onChange={(v) => savePreference({ key: "exportFmt", value: v })} /></Item>
        </Shell>
      </div>
    </div>
  );
}

function AppsTab() {
  const { toast } = useApp();
  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)] items-start gap-4">
      <Shell title="Apps with access">
        {[["QuickBooks", "Bookkeeping", ["Read transactions", "Export statements"], "2 days ago"], ["Splitwise", "Shared expenses", ["Read transactions"], "Jul 12"], ["Sheets budget sync", "Spreadsheet add-on", ["Read balances"], "Jun 30"]].map(([n, c, scopes, last], i) => (
          <div key={n as string} className={cx("flex items-center gap-3 px-4 py-3.5", i < 2 && "border-b border-line-subtle")}>
            {n === "QuickBooks" ? <MerchantLogo brand="QuickBooks" size={36} /> : <Tile icon="link" size={36} />}
            <div className="flex-1"><p className="text-sm">{n as string} <span className="ml-1 text-xs text-ink-3">{c as string}</span></p><div className="mt-1 flex gap-1.5">{(scopes as string[]).map((s) => <span key={s} className="rounded-full bg-shell px-2 py-0.5 text-[11px] text-ink-2">{s}</span>)}</div></div>
            <div className="text-right text-xs"><p className="text-ink-3">Last used</p><p>{last as string}</p></div>
            <Button size="sm" onClick={() => toast("Access settings opened", "info")}>Manage</Button>
            <Button size="sm" variant="ghost" onClick={() => toast(`${n} access revoked`)}>Revoke</Button>
          </div>
        ))}
      </Shell>
      <Shell title="What apps can see" bodyClass="p-4 flex flex-col gap-2.5">
        {[["success", "Balances and transactions you approve", true], ["success", "Statements, if you allow exports", true], ["block", "Your password or PIN — never", false], ["block", "Moving money — needs Face ID every time", false]].map(([ic, t, ok]) => <p key={t as string} className="flex items-center gap-2 text-sm"><Icon name={ic as IconName} className={ok ? "text-t-success" : "text-error"} />{t as string}</p>)}
      </Shell>
    </div>
  );
}
