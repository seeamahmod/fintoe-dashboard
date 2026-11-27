import "server-only";
import { cache } from "react";
import { requireUser } from "./supabase/server";

export type Txn = {
  id: string; merchant: string; description: string; account_mask: string; category: string;
  status: "Completed" | "Pending" | "Failed"; amount: number; note: string; occurred_at: string;
};
export type Notif = { id: string; tone: string; icon: string; title: string; body: string; action: string | null; created_at: string; read_at: string | null };
export type Thread = { id: string; name: string; icon: string; tag: string | null; unread: number; updated_at: string; last?: string };
export type Message = { id: string; thread_id: string; sender: "me" | "agent" | "system"; body: string; created_at: string };
export type Card = { id: string; label: string; mask: string; theme: string; kind: string; detail: string; frozen: boolean; online: boolean; contactless: boolean; atm: boolean; international: boolean; gambling: boolean };
export type Sub = { id: string; name: string; plan: string; amount: number; cycle: string; next_date: string; state: string; autopay: boolean };
export type Account = { id: string; name: string; mask: string; kind: string; detail: string; balance: number };
export type Profile = { first_name: string; last_name: string; phone: string; address: string; plan: string; created_at: string };

const num = <T extends Record<string, unknown>>(rows: T[] | null, keys: (keyof T)[]) =>
  (rows ?? []).map((r) => { const o = { ...r }; for (const k of keys) (o as Record<string, unknown>)[k as string] = Number(r[k]); return o; });

export const getProfile = cache(async () => {
  const { supabase, email } = await requireUser();
  const { data } = await supabase.from("profiles").select("first_name,last_name,phone,address,plan,created_at").single();
  return { ...(data as Profile), email };
});

export const getTransactions = cache(async (limit = 200) => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("transactions").select("id,merchant,description,account_mask,category,status,amount,note,occurred_at").order("occurred_at", { ascending: false }).limit(limit);
  return num(data, ["amount"]) as Txn[];
});

export const getAccounts = cache(async () => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("accounts").select("id,name,mask,kind,detail,balance").order("sort");
  return num(data, ["balance"]) as Account[];
});

export const getNotifications = cache(async () => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("notifications").select("id,tone,icon,title,body,action,created_at,read_at").order("created_at", { ascending: false }).limit(50);
  return (data ?? []) as Notif[];
});

export const getThreads = cache(async () => {
  const { supabase } = await requireUser();
  const { data: threads } = await supabase.from("threads").select("id,name,icon,tag,unread,updated_at").order("updated_at", { ascending: false });
  const { data: msgs } = await supabase.from("messages").select("thread_id,body,created_at,sender").neq("sender", "system").order("created_at", { ascending: false }).limit(200);
  const last = new Map<string, string>();
  for (const m of msgs ?? []) if (!last.has(m.thread_id)) last.set(m.thread_id, m.body);
  return ((threads ?? []) as Thread[]).map((t) => ({ ...t, last: last.get(t.id) ?? "" }));
});

export const getMessages = cache(async (threadId: string) => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("messages").select("id,thread_id,sender,body,created_at").eq("thread_id", threadId).order("created_at");
  return (data ?? []) as Message[];
});

export const getCards = cache(async () => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("cards").select("id,label,mask,theme,kind,detail,frozen,online,contactless,atm,international,gambling").order("sort");
  return (data ?? []) as Card[];
});

export const getSubscriptions = cache(async () => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("subscriptions").select("id,name,plan,amount,cycle,next_date,state,autopay").order("sort");
  return num(data, ["amount"]) as Sub[];
});

export const getPreferences = cache(async () => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("preferences").select("data").maybeSingle();
  return (data?.data ?? {}) as Record<string, boolean | string>;
});

/** Light-weight badge counts for the shell. */
export const getShellCounts = cache(async () => {
  const { supabase } = await requireUser();
  const [n, t, p] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
    supabase.from("threads").select("unread"),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "Pending"),
  ]);
  return { unreadNotifs: n.count ?? 0, unreadMsgs: (t.data ?? []).reduce((a, r) => a + (r.unread ?? 0), 0), pending: p.count ?? 0 };
});
