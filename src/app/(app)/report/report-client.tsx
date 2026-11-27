"use client";

import { useState } from "react";
import { Tabs } from "@/components/client";
import { Button } from "@/components/ui";
import { useApp } from "@/components/app-provider";

export function ReportTabs() {
  const [t, setT] = useState("Overview");
  const { toast } = useApp();
  return <Tabs tabs={["Overview", "Income", "Spending", "Cash flow", "Net worth"]} active={t} onChange={(v) => { setT(v); if (v !== "Overview") toast(`${v} view uses the same data in this demo`, "info"); }} />;
}
export function PdfButton() {
  return <Button icon="export" onClick={() => window.print()}>Export PDF</Button>;
}
