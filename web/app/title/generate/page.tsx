import { StepPage } from "@/components/step-page";
import { titlePages } from "@/lib/mock-data";

export default function TitleGeneratePage() {
  return <StepPage data={titlePages.generate} />;
}
