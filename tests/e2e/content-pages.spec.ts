import { expect, test } from "@playwright/test";

test("note page exposes wiki links and backlinks", async ({ page }) => {
  await page.goto("/notes/state-machines");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("상태 머신");
  await expect(page.getByRole("link", { name: "React 렌더링" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "이 노트를 언급한 글" })).toBeVisible();
});

test("draft routes are not generated", async ({ request }) => {
  expect((await request.get("/notes/private-draft")).status()).toBe(404);
});
