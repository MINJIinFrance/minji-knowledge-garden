import { describe, expect, it } from "vitest";
import { buildEntryIndex } from "../../../src/lib/content/knowledge-index";

const note = (title: string, slug: string, draft = false) => ({
  kind: "note" as const,
  title,
  slug,
  summary: `${title} 요약`,
  publishedAt: new Date("2026-07-01"),
  tags: ["test"],
  topic: "개발",
  draft,
  body: ""
});

describe("buildEntryIndex", () => {
  it("excludes drafts from every public index", () => {
    const result = buildEntryIndex([
      note("공개", "public"),
      note("초안", "draft", true)
    ]);

    expect(result.published.map((entry) => entry.slug)).toEqual(["public"]);
    expect(result.bySlug.has("draft")).toBe(false);
    expect(result.byTitle.has("초안")).toBe(false);
  });

  it("throws for duplicate slugs", () => {
    expect(() => buildEntryIndex([note("A", "same"), note("B", "same")])).toThrow(
      'Duplicate slug "same"'
    );
  });

  it("throws when a draft and published entry share a slug", () => {
    expect(() => buildEntryIndex([note("Public", "same"), note("Draft", "same", true)])).toThrow(
      'Duplicate slug "same"'
    );
  });
});
