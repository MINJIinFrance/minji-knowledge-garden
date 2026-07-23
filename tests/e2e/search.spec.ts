import { expect, test } from "@playwright/test";

test("keyboard search finds the Korean example note", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("astro-island").first()).not.toHaveAttribute("ssr", "");
  await page.keyboard.press("ControlOrMeta+K");
  await page.getByRole("searchbox").fill("상태 머신");
  await expect(page.getByRole("link", { name: /상태 머신/ })).toBeVisible();
});
