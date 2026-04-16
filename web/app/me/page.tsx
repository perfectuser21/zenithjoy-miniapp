import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { meData } from "@/lib/mock-data";

export default function MePage() {
  return (
    <AppShell activeTab="me" subtitle={meData.subtitle} title={meData.title}>
      {meData.cards.map((item, index) => (
        <SectionCard
          key={item.title}
          description={item.description}
          emphasis={index === 0 ? "primary" : "secondary"}
          eyebrow="account"
          title={item.title}
        />
      ))}
    </AppShell>
  );
}
