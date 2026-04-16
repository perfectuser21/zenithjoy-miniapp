import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterIdeasPage() {
  return <StepPage data={copywriterSteps.ideas} />;
}
