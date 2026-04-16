import { secondaryRoutes, primaryRoutes } from "@/lib/routes";

test("includes the four primary routes", () => {
  expect(primaryRoutes.map((route) => route.href)).toEqual([
    "/",
    "/workflow",
    "/assistant",
    "/me"
  ]);
});

test("includes the secondary routes from the Pencil logic board", () => {
  expect(secondaryRoutes.map((route) => route.href)).toEqual(
    expect.arrayContaining([
      "/copywriter/start",
      "/copywriter/keywords",
      "/copywriter/ideas",
      "/copywriter/profile",
      "/copywriter/topics",
      "/copywriter/articles",
      "/copywriter/detail",
      "/title/generate",
      "/title/library",
      "/moments/generate",
      "/moments/editor",
      "/ranking/detail",
      "/reading/detail"
    ])
  );
});
