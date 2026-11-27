"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Kbd } from "@/components/ui";
import { FAQS } from "@/lib/demo";
import { useApp } from "@/components/app-provider";

export function HelpSearch() {
  const [q, setQ] = useState("");
  const { openPalette } = useApp();
  const hits = q.trim() ? FAQS.filter((f) => (f.q + f.a).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 3) : [];
  return (
    <div className="relative mx-auto mt-4 max-w-[560px] text-left">
      <label className="relative block">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value.slice(0, 80))} placeholder="Search “freeze card”, “dispute”, “limits”…" aria-label="Search help"
          className="focus-ring h-11 w-full rounded-lg border border-line-input bg-surface pl-10 pr-14 text-sm outline-none focus:border-brand" />
        <button type="button" onClick={openPalette} className="absolute right-3 top-1/2 -translate-y-1/2"><Kbd>⌘K</Kbd></button>
      </label>
      {hits.length > 0 && (
        <div className="absolute inset-x-0 top-12 z-20 rounded-xl border border-line-subtle bg-surface p-1.5 shadow-lg animate-pop">
          {hits.map((h) => <div key={h.q} className="rounded-md px-3 py-2 hover:bg-hover"><p className="text-sm font-medium">{h.q}</p><p className="line-clamp-1 text-xs text-ink-2">{h.a}</p></div>)}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-2">Popular:
        {["Freeze a card", "Dispute a charge", "Change weekly limit", "Add a payee"].map((p) => <button key={p} onClick={() => setQ(p.split(" ").slice(-1)[0])} className="rounded-full bg-muted px-3 py-1 font-medium text-ink hover:bg-[#2a2a2a29]">{p}</button>)}
      </div>
    </div>
  );
}
