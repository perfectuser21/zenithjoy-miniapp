import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterTopicsPage() {
  return <StepPage data={copywriterSteps.topics} />;
}
