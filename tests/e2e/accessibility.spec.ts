import { expect, test } from "@playwright/test";

test("all pages contain one main landmark and one h1", async ({ page }) => {
  for (const route of ["/", "/notes", "/graph", "/projects", "/about"]) {
    await page.goto(route);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("main h1")).toHaveCount(1);
  }
});
