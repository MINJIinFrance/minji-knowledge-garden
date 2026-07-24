import { expect, test } from "@playwright/test";

test("graph list selects nodes and offers note navigation", async ({ page }) => {
  await page.goto("/graph");
  await expect(page.locator("astro-island").last()).not.toHaveAttribute("ssr", "");
  const noteList = page.getByRole("list", { name: "그래프 노트 목록" });
  await noteList
    .getByRole("button", { name: "상태 머신으로 UI 설계하기 노드 선택" })
    .click();
  await expect(
    page.getByRole("heading", { name: "상태 머신으로 UI 설계하기" })
  ).toBeVisible();
  await page
    .getByRole("link", { name: "상태 머신으로 UI 설계하기 노트 열기" })
    .click();
  await expect(page).toHaveURL(/\/notes\/state-machines\/?$/);
});
