"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Badge, Button } from "@/components/ui";
import { Icon, type IconName } from "@/components/icon";
import { inputClass } from "@/components/add-transaction";
import { useApp } from "@/components/app-provider";
import { createThread, markThreadRead, sendMessage } from "@/lib/actions";
import { clock, cx, timeAgo } from "@/lib/format";
import type { Message, Thread } from "@/lib/data";

const TOPICS: { topic: "Card issue" | "Dispute a payment" | "Loans & payments" | "Billing & plan"; icon: IconName; sub: string }[] = [
  { topic: "Card issue", icon: "card", sub: "Lost, frozen or declined cards" },
  { topic: "Dispute a payment", icon: "support", sub: "A charge you don’t recognise" },
  { topic: "Loans & payments", icon: "loan", sub: "Schedules, payoffs and rates" },
  { topic: "Billing & plan", icon: "invoice", sub: "Your FinToe plan and invoices" },
];

export function NewMessageButton() {
  const router = useRouter();
  return <Button variant="primary" icon="edit" onClick={() => router.push("/messages?new=1", { scroll: false })}>New message</Button>;
}

function dayLabel(iso: string) {
  const d = new Date(iso), now = new Date();
  const days = Math.floor((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function Chat({ threads, active, messages, openNew }: { threads: Thread[]; active: Thread | null; messages: Message[]; openNew: boolean }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const router = useRouter();
  const path = usePathname();
  const list = threads.filter((t) => (filter === "All" || (filter === "Unread" ? t.unread > 0 : t.icon === "support")) && (t.name + " " + (t.last ?? "")).toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] gap-4 2xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="card flex min-h-0 flex-col overflow-hidden animate-rise">
        <div className="flex flex-col gap-3 border-b border-line-subtle p-3">
          <label className="relative block">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" className={cx(inputClass, "pl-9")} />
          </label>
          <div className="flex gap-1.5">
            {["All", "Unread", "Support"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cx("focus-ring rounded-full border px-3 py-1 text-xs transition-colors", filter === f ? "border-ink bg-inverse text-white" : "border-line-input text-ink-2 hover:bg-hover")}>{f}</button>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-2">No conversations match.</p>}
          {list.map((t) => (
            <Link key={t.id} href={`/messages?t=${t.id}`} scroll={false} className={cx("relative flex items-center gap-3 border-b border-line-subtle px-4 py-3 transition-colors", t.id === active?.id ? "bg-selected" : "hover:bg-hover")}>
              {t.id === active?.id && <motion.span layoutId="thread-active" className="absolute inset-y-0 left-0 w-0.5 bg-brand" />}
              <Avatar icon={t.icon as IconName} size={36} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><span className={cx("flex-1 truncate text-sm", t.unread ? "font-medium" : "")}>{t.name}</span><span className="shrink-0 text-[11px] text-ink-3">{timeAgo(t.updated_at)}</span></span>
                <span className="flex items-center gap-2"><span className={cx("flex-1 truncate text-xs", t.unread ? "text-ink" : "text-ink-2")}>{t.last}</span>{t.unread > 0 && <span className="grid size-[18px] place-items-center rounded-full bg-brand text-[11px] font-semibold">{t.unread}</span>}</span>
              </span>
            </Link>
          ))}
        </div>
      </aside>
      {active ? <Conversation key={active.id} thread={active} messages={messages} /> : (
        <section className="card grid place-items-center text-center"><div><p className="font-medium">No conversations yet</p><p className="mt-1 text-sm text-ink-2">Start one with the New message button.</p></div></section>
      )}
      <NewMessage open={openNew} onClose={() => router.replace(active ? `${path}?t=${active.id}` : path, { scroll: false })} />
    </div>
  );
}

function Conversation({ thread, messages }: { thread: Thread; messages: Message[] }) {
  const { toast } = useApp();
  const [draft, setDraft] = useState("");
  const [optimistic, setOptimistic] = useState<{ body: string; meBefore: number } | null>(null);
  const [typing, setTyping] = useState<{ agentBefore: number } | null>(null);
  const [, start] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { if (thread.unread > 0) markThreadRead(thread.id); }, [thread.id, thread.unread]);

  const shown = useMemo(() => {
    let agents = 0;
    const out = messages.filter((m) => { if (m.sender !== "agent") return true; agents++; return !typing || agents <= typing.agentBefore; });
    const meCount = messages.filter((m) => m.sender === "me").length;
    if (optimistic && meCount <= optimistic.meBefore) out.push({ id: "optimistic", thread_id: thread.id, sender: "me", body: optimistic.body, created_at: new Date().toISOString() });
    return out;
  }, [messages, typing, optimistic, thread.id]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [shown.length, typing]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const meBefore = messages.filter((m) => m.sender === "me").length;
    const agentBefore = messages.filter((m) => m.sender === "agent").length;
    setOptimistic({ body, meBefore });
    setTyping({ agentBefore });
    start(async () => {
      const r = await sendMessage({ threadId: thread.id, body });
      if (!r.ok) { toast(r.error); setTyping(null); setOptimistic(null); setDraft(body); return; }
      setTimeout(() => { setTyping(null); setOptimistic(null); }, 1200);
    });
  };

  const isSupport = thread.icon === "support";
  const firstOfDay = new Set(shown.filter((m, i) => i === 0 || dayLabel(m.created_at) !== dayLabel(shown[i - 1].created_at)).map((m) => m.id));
  return (
    <section className="card flex min-h-0 flex-col overflow-hidden animate-rise" style={{ animationDelay: "60ms" }}>
      <header className="flex items-center gap-3 border-b border-line-subtle px-5 py-3.5">
        <Avatar icon={thread.icon as IconName} size={40} />
        <div className="min-w-0 flex-1"><p className="truncate font-medium">{thread.name}</p><p className="flex items-center gap-1.5 text-xs text-ink-2"><span className="size-2 rounded-full bg-success" />Online · usually replies in ~5 min</p></div>
        {thread.tag && <Badge tone="warning">{thread.tag}</Badge>}
        <Button size="sm" icon="phone" onClick={() => toast("Callback requested — we’ll ring you shortly")}>Request call</Button>
      </header>
      {isSupport && (
        <div className="flex items-center gap-2 border-b border-line-subtle bg-subtle px-5 py-2.5 text-xs">
          <span className="eyebrow-sm">Case #FT-20931</span>
          {["Opened", "Under review", "Merchant contacted", "Resolved"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className={cx("flex items-center gap-1.5", i < 2 ? "text-ink" : "text-ink-3")}>
                <span className={cx("grid size-4 place-items-center rounded-full", i < 1 ? "bg-success text-white" : i === 1 ? "bg-brand text-ink" : "border border-line-strong")}>{i < 1 && <Icon name="check" size={10} />}</span>{s}
              </span>
              {i < 3 && <span className="h-px w-6 bg-line-strong" />}
            </span>
          ))}
        </div>
      )}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-5 py-4" aria-live="polite">
        <div className="mx-auto flex max-w-[880px] flex-col gap-2">
          <AnimatePresence initial={false}>
            {shown.map((m) => {
              const day = dayLabel(m.created_at);
              const divider = firstOfDay.has(m.id) ? <div key={`d-${day}`} className="my-2 flex items-center gap-3 text-[11px] text-ink-3"><span className="h-px flex-1 bg-line-subtle" />{day}<span className="h-px flex-1 bg-line-subtle" /></div> : null;
              if (m.sender === "system") return [divider, <motion.p key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto my-1 rounded-full bg-shell px-3 py-1 text-[11px] text-ink-2">{m.body}</motion.p>];
              const me = m.sender === "me";
              return [divider, (
                <motion.div key={m.id === "optimistic" ? "optimistic" : m.id} layout="position" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className={cx("flex items-end gap-2", me && "flex-row-reverse")}>
                  {!me && <Avatar icon={thread.icon as IconName} size={28} />}
                  <div className={cx("max-w-[68%] rounded-2xl px-3.5 py-2.5 text-sm", me ? "rounded-br-md bg-inverse text-white" : "rounded-bl-md bg-shell text-ink")}>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={cx("mt-1 text-right text-[10px]", me ? "text-white/70" : "text-ink-3")}>{m.id === "optimistic" ? "Sending…" : clock(m.created_at)}</p>
                  </div>
                </motion.div>
              )];
            })}
            {typing && (
              <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
                <Avatar icon={thread.icon as IconName} size={28} />
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-shell px-3.5 py-3" aria-label="Agent is typing">
                  {[0, 1, 2].map((i) => <motion.span key={i} className="size-1.5 rounded-full bg-ink-3" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t border-line-subtle p-3">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} rows={1} placeholder={`Message ${thread.name.split(" · ")[0]}…`} aria-label="Message"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          className={cx(inputClass, "h-auto max-h-32 min-h-10 resize-none py-2.5")} />
        <Button type="submit" variant="primary" icon="send" disabled={!draft.trim()}>Send</Button>
      </form>
    </section>
  );
}

function NewMessage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["topic"]>("Card issue");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { toast } = useApp();
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); if (open) window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, onClose]);

  const submit = () => start(async () => {
    setError(null);
    const r = await createThread({ topic, body });
    if (!r.ok || !r.id) { setError(r.ok ? "Couldn’t start the conversation." : r.error); return; }
    setBody("");
    toast("Conversation started");
    router.replace(`/messages?t=${r.id}`, { scroll: false });
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.form onSubmit={(e) => { e.preventDefault(); submit(); }} role="dialog" aria-modal aria-labelledby="new-msg-title" onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="w-[560px] max-w-full overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-lg">
            <header className="flex items-start justify-between border-b border-line-subtle px-6 pb-4 pt-5">
              <div><h2 id="new-msg-title" className="text-lg font-medium">New message</h2><p className="text-xs text-ink-2">Pick a topic so we can route you to the right team.</p></div>
              <button type="button" onClick={onClose} aria-label="Close" className="focus-ring rounded-md p-1 hover:bg-hover"><Icon name="close" /></button>
            </header>
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Topic">
                {TOPICS.map((t) => (
                  <button type="button" role="radio" aria-checked={topic === t.topic} key={t.topic} onClick={() => setTopic(t.topic)}
                    className={cx("focus-ring flex items-start gap-3 rounded-xl border p-3 text-left transition-colors", topic === t.topic ? "border-brand bg-selected" : "border-line-input hover:bg-hover")}>
                    <Icon name={t.icon} className="mt-0.5" /><span><span className="block text-sm font-medium">{t.topic}</span><span className="block text-xs text-ink-2">{t.sub}</span></span>
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Message</span>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={1000} placeholder="Tell us what’s going on…" className={cx(inputClass, "h-auto resize-none py-2.5")} /></label>
              {error && <p role="alert" className="text-xs text-t-error">{error}</p>}
            </div>
            <footer className="flex justify-end gap-2 border-t border-line-subtle bg-subtle px-6 py-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" icon="send" disabled={pending || !body.trim()}>{pending ? "Sending…" : "Send message"}</Button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
