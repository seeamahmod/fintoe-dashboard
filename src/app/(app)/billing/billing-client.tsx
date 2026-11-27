"use client";

import { useState } from "react";
import { Toggle } from "@/components/client";
import { toggleAutopay } from "@/lib/actions";
import { cx } from "@/lib/format";

export function AutopayToggle({ id, checked }: { id: string; checked: boolean }) {
  return <Toggle checked={checked} label="Autopay" onChange={(v) => toggleAutopay({ id, autopay: v })} />;
}
export function SubFilters({ total }: { total: number }) {
  const [f, setF] = useState("All");
  return (
    <div className="flex gap-2 border-b border-line-subtle px-4 py-3">
      {[`All · ${total}`, "Renewing soon · 3", "Unused · 2"].map((l) => (
        <button key={l} onClick={() => setF(l)} className={cx("h-7 rounded-full px-3 text-xs font-medium transition-colors", f === l || (f === "All" && l.startsWith("All")) ? "bg-inverse text-white" : "bg-muted hover:bg-[#2a2a2a29]")}>{l}</button>
      ))}
    </div>
  );
}
