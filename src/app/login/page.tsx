import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Icon } from "@/components/icon";
import { WEEKS_THIS_YEAR } from "@/lib/demo";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const cols = WEEKS_THIS_YEAR.slice(-26);
  return (
    <div className="grid min-h-dvh grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col justify-between px-[max(48px,6vw)] py-12">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(180deg,#4c4c4c,#000)] text-white"><Icon name="sparkle" /></span>
          <span className="text-base font-medium">FinToe Banking</span>
        </div>
        <div className="mx-auto w-full max-w-[400px] animate-rise">
          <h1 className="text-[32px] font-medium leading-10 tracking-[-0.5px]">Welcome back</h1>
          <p className="mt-1 text-ink-2">Sign in to see your balances, cards and spending.</p>
          <LoginForm />
        </div>
        <p className="flex items-center gap-2 text-xs text-ink-2"><Icon name="lock" size={16} />Protected by row-level security. Each account only ever sees its own data.</p>
      </section>
      <section className="relative m-2 overflow-hidden rounded-3xl bg-shell">
        <div className="absolute inset-x-[8%] bottom-[10%] flex h-[56%] items-end gap-[6px]">
          {cols.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col-reverse gap-[6px]">
              {Array.from({ length: Math.round(v / 50) }, (_, k) => (
                <span key={k} className="aspect-square w-full animate-fade rounded-[4px] bg-brand" style={{ animationDelay: `${i * 30 + k * 40}ms`, opacity: k === Math.round(v / 50) - 1 ? 1 : 0.85 }} />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute left-[8%] top-[12%] max-w-[440px] animate-rise">
          <p className="eyebrow">Expenses · weekly</p>
          <p className="num mt-2 text-[40px] font-medium leading-[48px] tracking-[-0.5px]">$19,850</p>
          <p className="mt-1 text-sm text-ink-2">Every square is $50 you spent. Know exactly where your money goes, week by week.</p>
        </div>
      </section>
    </div>
  );
}
