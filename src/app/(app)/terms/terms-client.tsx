"use client";

import { useState } from "react";
import { Tabs, Toggle } from "@/components/client";
import { savePreference } from "@/lib/actions";
import { cx } from "@/lib/format";

export function TermsTabs() {
  const [t, setT] = useState("Terms of service");
  return <Tabs tabs={["Terms of service", "Privacy policy", "Cookie policy", "Fee schedule"]} active={t} onChange={setT} />;
}
export function PrivacyToggle({ k, def, label, sub, prefs, last }: { k: string; def: boolean; label: string; sub: string; prefs: Record<string, boolean | string>; last?: boolean }) {
  const v = typeof prefs[k] === "boolean" ? (prefs[k] as boolean) : def;
  return (
    <div className={cx("flex items-center gap-3 px-4 py-3.5", !last && "border-b border-line-subtle")}>
      <div className="flex-1"><p className="text-sm">{label}</p><p className="text-xs text-ink-2">{sub}</p></div>
      <Toggle checked={v} label={label} onChange={(nv) => savePreference({ key: k, value: nv })} />
    </div>
  );
}
