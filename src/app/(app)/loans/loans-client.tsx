"use client";

import { Button } from "@/components/ui";
import { useApp } from "@/components/app-provider";
import type { IconName } from "@/components/icon";

export function PayButton({ label, message, variant = "outline", size = "md", icon }: { label: string; message: string; variant?: "primary" | "outline" | "ghost"; size?: "sm" | "md"; icon?: IconName }) {
  const { toast } = useApp();
  return <Button variant={variant} size={size} icon={icon} onClick={() => toast(message)}>{label}</Button>;
}
