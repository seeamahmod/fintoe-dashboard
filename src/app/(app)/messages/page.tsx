import type { Metadata } from "next";
import { getMessages, getThreads } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { Chat, NewMessageButton } from "./chat";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ t?: string; new?: string }> }) {
  const sp = await searchParams;
  const threads = await getThreads();
  const active = threads.find((t) => t.id === sp.t) ?? threads[0];
  const messages = active ? await getMessages(active.id) : [];
  return (
    <div className="flex h-[calc(100dvh-140px)] min-h-[640px] flex-col gap-6">
      <PageHeader title="Messages" subtitle="Chat with FinToe support and your account team"><NewMessageButton /></PageHeader>
      <Chat threads={threads} active={active ?? null} messages={messages} openNew={sp.new === "1"} />
    </div>
  );
}
