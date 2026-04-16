import { StepPage } from "@/components/step-page";
import { titlePages } from "@/lib/mock-data";

export default function TitleLibraryPage() {
  return <StepPage data={titlePages.library} />;
}
