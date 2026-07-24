import { describe, expect, it } from "vitest";
import { siteConfig } from "../../src/config/site";

describe("siteConfig", () => {
  it("contains editable identity and SEO fields", () => {
    expect(siteConfig.name).toBeTruthy();
    expect(siteConfig.tagline).toBeTruthy();
    expect(siteConfig.interests.length).toBeGreaterThan(0);
    expect(siteConfig.links.github).toMatch(/^https:\/\//);
  });
});
