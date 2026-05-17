import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterKeywordsPage() {
  return <StepPage data={copywriterSteps.keywords} />;
}
