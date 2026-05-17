import { StepPage } from "@/components/step-page";
import { copywriterSteps } from "@/lib/mock-data";

export default function CopywriterArticlesPage() {
  return <StepPage data={copywriterSteps.articles} />;
}
