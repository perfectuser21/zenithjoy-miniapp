import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterProfilePage() {
  return <StepPage data={copywriterSteps.profile} />;
}
