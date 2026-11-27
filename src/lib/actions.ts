"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "./supabase/server";

type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
const refresh = () => revalidatePath("/", "layout");

/* ---------------- Auth ---------------- */
const Credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});

export async function signIn(_: unknown, form: FormData): Promise<Result> {
  const parsed = Credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return fail("Enter a valid email and a password of at least 8 characters.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return fail("Email or password is incorrect.");
  redirect("/");
}

export async function demoSignIn(): Promise<Result> {
  const email = process.env.DEMO_EMAIL, password = process.env.DEMO_PASSWORD;
  if (!email || !password) return fail("Demo is not configured.");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail("Demo sign-in is unavailable right now.");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/* ---------------- Transactions ---------------- */
const CATEGORIES = ["Refund","Shopping","Subscription","Salary","Bills","Transfer","Entertainment","Food & drink","Transport","Health","Housing","Other"] as const;
const NewTxn = z.object({
  kind: z.enum(["Expense", "Income", "Transfer"]),
  amount: z.coerce.number().positive().max(50000),
  merchant: z.string().trim().min(1).max(80),
  category: z.enum(CATEGORIES),
  account: z.enum(["1233", "2345", "4402"]),
  date: z.iso.date(),
  status: z.enum(["Completed", "Pending"]),
  note: z.string().trim().max(200).optional().default(""),
});

export async function addTransaction(input: unknown): Promise<Result> {
  const parsed = NewTxn.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form and try again.");
  const { supabase, userId } = await requireUser();
  const d = parsed.data;
  const signed = d.kind === "Income" ? d.amount : -d.amount;
  const { error } = await supabase.from("transactions").insert({
    user_id: userId, merchant: d.merchant, description: d.note || `${d.category} · added manually`,
    account_mask: d.account, category: d.category, status: d.status, amount: Math.round(signed * 100) / 100,
    note: d.note, occurred_at: new Date(`${d.date}T12:00:00Z`).toISOString(),
  });
  if (error) return fail("Couldn’t save the transaction.");
  refresh();
  return { ok: true };
}

const Id = z.uuid();
export async function deleteTransaction(id: string): Promise<Result> {
  if (!Id.safeParse(id).success) return fail("Invalid id.");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return fail("Couldn’t delete the transaction.");
  refresh();
  return { ok: true };
}

/* ---------------- Notifications ---------------- */
export async function markNotificationsRead(id?: string): Promise<Result> {
  if (id && !Id.safeParse(id).success) return fail("Invalid id.");
  const { supabase } = await requireUser();
  let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  if (id) q = q.eq("id", id);
  const { error } = await q;
  if (error) return fail("Couldn’t update notifications.");
  refresh();
  return { ok: true };
}

/* ---------------- Messages ---------------- */
const NewMsg = z.object({ threadId: z.uuid(), body: z.string().trim().min(1).max(1000) });
const REPLIES = [
  "Thanks for the update — I’ve added that to your case notes.",
  "Got it. I’ll check with the payments team and get back to you shortly.",
  "Thanks! Is there anything else I can help you with today?",
];

export async function sendMessage(input: unknown): Promise<Result & { reply?: string }> {
  const parsed = NewMsg.safeParse(input);
  if (!parsed.success) return fail("Message can’t be empty.");
  const { supabase, userId } = await requireUser();
  const { threadId, body } = parsed.data;
  const now = Date.now();
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  const { error } = await supabase.from("messages").insert([
    { user_id: userId, thread_id: threadId, sender: "me", body, created_at: new Date(now).toISOString() },
    { user_id: userId, thread_id: threadId, sender: "agent", body: reply, created_at: new Date(now + 1500).toISOString() },
  ]);
  if (error) return fail("Couldn’t send the message.");
  await supabase.from("threads").update({ updated_at: new Date(now + 1500).toISOString(), unread: 0 }).eq("id", threadId);
  refresh();
  return { ok: true, reply };
}

const NewThread = z.object({ topic: z.enum(["Card issue", "Dispute a payment", "Loans & payments", "Billing & plan"]), body: z.string().trim().min(1).max(1000) });
const TOPIC_META: Record<string, [string, string]> = { "Card issue": ["Card services", "card"], "Dispute a payment": ["FinToe Support", "support"], "Loans & payments": ["Loans team", "loan"], "Billing & plan": ["Billing", "invoice"] };
export async function createThread(input: unknown): Promise<Result & { id?: string }> {
  const parsed = NewThread.safeParse(input);
  if (!parsed.success) return fail("Pick a topic and write a message.");
  const { supabase, userId } = await requireUser();
  const [name, icon] = TOPIC_META[parsed.data.topic];
  const now = Date.now();
  const { data: t, error } = await supabase.from("threads").insert({ user_id: userId, name: `${name} · ${parsed.data.topic}`, icon, updated_at: new Date(now + 1500).toISOString() }).select("id").single();
  if (error || !t) return fail("Couldn’t start the conversation.");
  await supabase.from("messages").insert([
    { user_id: userId, thread_id: t.id, sender: "me", body: parsed.data.body, created_at: new Date(now).toISOString() },
    { user_id: userId, thread_id: t.id, sender: "agent", body: "Thanks for reaching out! A specialist has picked this up and will reply here shortly.", created_at: new Date(now + 1500).toISOString() },
  ]);
  refresh();
  return { ok: true, id: t.id };
}

export async function markThreadRead(threadId: string): Promise<Result> {
  if (!Id.safeParse(threadId).success) return fail("Invalid id.");
  const { supabase } = await requireUser();
  await supabase.from("threads").update({ unread: 0 }).eq("id", threadId).gt("unread", 0);
  refresh();
  return { ok: true };
}

/* ---------------- Cards ---------------- */
const CardToggle = z.object({ id: z.uuid(), field: z.enum(["frozen", "online", "contactless", "atm", "international", "gambling"]), value: z.boolean() });
export async function toggleCard(input: unknown): Promise<Result> {
  const parsed = CardToggle.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const { supabase } = await requireUser();
  const { id, field, value } = parsed.data;
  const { error } = await supabase.from("cards").update({ [field]: value }).eq("id", id);
  if (error) return fail("Couldn’t update the card.");
  refresh();
  return { ok: true };
}

const SubToggle = z.object({ id: z.uuid(), autopay: z.boolean() });
export async function toggleAutopay(input: unknown): Promise<Result> {
  const parsed = SubToggle.safeParse(input);
  if (!parsed.success) return fail("Invalid request.");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("subscriptions").update({ autopay: parsed.data.autopay }).eq("id", parsed.data.id);
  if (error) return fail("Couldn’t update autopay.");
  refresh();
  return { ok: true };
}

/* ---------------- Profile & preferences ---------------- */
const ProfileForm = z.object({
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  phone: z.string().trim().max(30).regex(/^[0-9+() .-]*$/, "Phone can contain digits, spaces and + ( ) - only"),
  address: z.string().trim().max(160),
});
export async function updateProfile(input: unknown): Promise<Result> {
  const parsed = ProfileForm.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", userId);
  if (error) return fail("Couldn’t save your profile.");
  refresh();
  return { ok: true };
}

const Pref = z.object({ key: z.string().regex(/^[a-z][a-zA-Z0-9_.]{0,48}$/), value: z.union([z.boolean(), z.string().max(80)]) });
export async function savePreference(input: unknown): Promise<Result> {
  const parsed = Pref.safeParse(input);
  if (!parsed.success) return fail("Invalid preference.");
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("preferences").select("data").maybeSingle();
  const next = { ...((data?.data as Record<string, unknown>) ?? {}), [parsed.data.key]: parsed.data.value };
  if (Object.keys(next).length > 60) return fail("Too many preferences.");
  const { error } = await supabase.from("preferences").upsert({ user_id: userId, data: next, updated_at: new Date().toISOString() });
  if (error) return fail("Couldn’t save the setting.");
  return { ok: true };
}

const PasswordChange = z.object({
  current: z.string().min(8).max(128),
  next: z.string().min(12, "Use at least 12 characters").max(128).regex(/[a-z]/, "Add a lowercase letter").regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9\W_]/, "Add a number or symbol"),
});
export async function changePassword(input: unknown): Promise<Result> {
  const parsed = PasswordChange.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the password rules.");
  const { supabase, email } = await requireUser();
  if (email === process.env.DEMO_EMAIL) return fail("The shared demo account’s password can’t be changed.");
  const { error: authErr } = await supabase.auth.signInWithPassword({ email, password: parsed.data.current });
  if (authErr) return fail("Current password is incorrect.");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
  if (error) return fail("Couldn’t update the password.");
  return { ok: true };
}

export async function resetDemoData(): Promise<Result> {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("reset_my_demo_data");
  if (error) return fail("Couldn’t reset the data.");
  refresh();
  return { ok: true };
}
