import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterDetailPage() {
  return <StepPage data={copywriterSteps.detail} />;
}
