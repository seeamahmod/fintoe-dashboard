"use client";

import { useState, useTransition } from "react";
import { Avatar, Button } from "@/components/ui";
import { Field, inputClass } from "@/components/add-transaction";
import { useApp } from "@/components/app-provider";
import { updateProfile } from "@/lib/actions";
import { cx } from "@/lib/format";

type P = { first_name: string; last_name: string; phone: string; address: string; plan: string; created_at: string; email: string };

export function ProfileForm({ profile }: { profile: P }) {
  const [form, setForm] = useState({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone, address: profile.address });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useApp();
  const dirty = Object.entries(form).some(([k, v]) => v !== profile[k as keyof P]);
  const since = new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const bind = (k: keyof typeof form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(null); start(async () => { const r = await updateProfile(form); if (!r.ok) setError(r.error); else toast("Profile saved"); }); }} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar initials={`${form.first_name[0] ?? ""}${form.last_name[0] ?? ""}`.toUpperCase()} size={48} />
        <div className="flex-1"><p className="text-base font-medium">{form.first_name} {form.last_name}</p><p className="text-xs text-ink-2">Member since {since} · {profile.plan} plan</p></div>
        <Button type="submit" variant="primary" icon="check" disabled={!dirty || pending}>{pending ? "Saving…" : "Save changes"}</Button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <Field label="First name"><input {...bind("first_name")} required maxLength={60} className={inputClass} /></Field>
        <Field label="Last name"><input {...bind("last_name")} required maxLength={60} className={inputClass} /></Field>
        <Field label="Email" hint="Sign-in email · contact support to change"><input value={profile.email} readOnly className={cx(inputClass, "bg-shell text-ink-2")} /></Field>
        <Field label="Phone"><input {...bind("phone")} maxLength={30} inputMode="tel" className={inputClass} /></Field>
        <Field label="Date of birth" hint="Contact support to change"><input value="Mar 14, 1996" readOnly className={cx(inputClass, "bg-shell text-ink-2")} /></Field>
        <Field label="Country" hint="Contact support to change"><input value="United States" readOnly className={cx(inputClass, "bg-shell text-ink-2")} /></Field>
      </div>
      <Field label="Address"><input {...bind("address")} maxLength={160} className={inputClass} /></Field>
      {error && <p role="alert" className="rounded-lg bg-error-subtle px-3 py-2 text-xs text-t-error">{error}</p>}
    </form>
  );
}
