import { expect, test } from "@playwright/test";

test("note layout collapses to one column on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/notes/state-machines");
  await expect(page.locator("[data-note-grid]")).toHaveCSS("grid-template-columns", "358px");
  await expect(page.getByRole("button", { name: "노트 탐색 열기" })).toBeVisible();
});
