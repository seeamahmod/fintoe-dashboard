"use client";

import { useActionState, useTransition } from "react";
import { demoSignIn, signIn } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Field, inputClass } from "@/components/add-transaction";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  const [demoPending, start] = useTransition();
  const error = state && !state.ok ? state.error : null;
  return (
    <div className="mt-8 flex flex-col gap-5">
      <Button variant="primary" className="h-11 w-full" icon="sparkle" disabled={demoPending} onClick={() => start(async () => { await demoSignIn(); })}>
        {demoPending ? "Opening the demo…" : "Try the demo"}
      </Button>
      <div className="flex items-center gap-3 text-xs text-ink-3"><span className="h-px flex-1 bg-line-subtle" />or sign in with email<span className="h-px flex-1 bg-line-subtle" /></div>
      <form action={action} className="flex flex-col gap-4">
        <Field label="Email"><input name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} /></Field>
        <Field label="Password"><input name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} className={inputClass} /></Field>
        {error && <p role="alert" className="rounded-lg bg-error-subtle px-3 py-2 text-xs text-t-error animate-fade">{error}</p>}
        <Button type="submit" variant="outline" className="h-11 w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="text-xs text-ink-2">New accounts are invite-only in this demo. The demo account resets from the account menu.</p>
    </div>
  );
}
