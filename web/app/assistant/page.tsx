import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { assistantData } from "@/lib/mock-data";

export default function AssistantPage() {
  return (
    <AppShell activeTab="assistant" subtitle={assistantData.subtitle} title={assistantData.title}>
      {assistantData.cards.map((item, index) => (
        <SectionCard
          key={item.title}
          description={item.description}
          emphasis={index === 0 ? "primary" : "secondary"}
          eyebrow="assistant"
          title={item.title}
        />
      ))}
    </AppShell>
  );
}
