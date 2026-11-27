import type { Metadata } from "next";
import { getCards } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { PayButton } from "../loans/loans-client";
import { CardsView } from "./cards-view";

export const metadata: Metadata = { title: "Cards" };

export default async function CardsPage() {
  const cards = await getCards();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cards" subtitle={`${cards.length} cards · ${cards.filter((c) => c.frozen).length} frozen`}>
        <PayButton label="Order physical card" icon="card" message="Physical card ordered · arrives in 5–7 days" />
        <PayButton label="Create virtual card" variant="primary" icon="plus" message="Virtual card created" />
      </PageHeader>
      <CardsView cards={cards} />
    </div>
  );
}
