import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterStartPage() {
  return <StepPage data={copywriterSteps.start} />;
}
