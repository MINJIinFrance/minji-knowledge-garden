import { expect, test } from "@playwright/test";

test("navigation and theme work with keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.getByRole("button", { name: "테마 전환" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const isMobile = (page.viewportSize()?.width ?? 1280) <= 768;
  if (isMobile) {
    await page.locator('summary[aria-label="주요 메뉴 열기"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("navigation", { name: "모바일 주요 메뉴" })).toBeVisible();
  } else {
    await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeVisible();
  }
});
