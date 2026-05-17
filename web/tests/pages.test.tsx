import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import WorkflowPage from "@/app/workflow/page";
import MomentsGeneratePage from "@/app/moments/generate/page";

test("home includes entry to workflow", () => {
  render(<HomePage />);
  expect(screen.getByText("进入工作流")).toBeInTheDocument();
});

test("workflow includes the three major creation paths", () => {
  render(<WorkflowPage />);
  expect(screen.getByText("自媒体创作")).toBeInTheDocument();
  expect(screen.getByText("标题创作")).toBeInTheDocument();
  expect(screen.getByText("朋友圈文案")).toBeInTheDocument();
});

test("moments page renders its title", () => {
  render(<MomentsGeneratePage />);
  expect(screen.getByText("朋友圈文案 / 生成页")).toBeInTheDocument();
});
