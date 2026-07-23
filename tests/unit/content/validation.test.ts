import { describe, expect, it } from "vitest";
import { validateContent } from "../../../src/lib/content/validation";

const note = (overrides: Partial<Record<string, unknown>> = {}) => ({
  kind: "note" as const,
  title: "A",
  slug: "a",
  summary: "A summary",
  publishedAt: new Date("2026-07-01"),
  tags: ["test"],
  topic: "testing",
  draft: false,
  body: "",
  ...overrides
});

const project = (overrides: Partial<Record<string, unknown>> = {}) => ({
  kind: "project" as const,
  title: "Project",
  slug: "project",
  summary: "Project summary",
  status: "진행 중",
  period: "2026",
  technologies: ["TypeScript"],
  relatedNotes: [],
  featured: false,
  draft: false,
  body: "",
  ...overrides
});

describe("validateContent", () => {
  it("reports broken wiki links without throwing", () => {
    const result = validateContent([note({ body: "[[Missing]]" })]);

    expect(result.warnings).toEqual(['a: broken wiki link "Missing"']);
  });

  it("treats links to draft notes as broken public links", () => {
    const result = validateContent([
      note({ body: "[[Draft]]" }),
      note({ title: "Draft", slug: "draft", draft: true })
    ]);

    expect(result.warnings).toEqual(['a: broken wiki link "Draft"']);
  });

  it("rejects duplicate slugs across published and draft entries", () => {
    expect(() => validateContent([note(), project({ slug: "a", draft: true })])).toThrow('Duplicate slug "a"');
  });

  it("rejects invalid metadata before deriving links", () => {
    expect(() => validateContent([note({ title: "" })])).toThrow(/Invalid note metadata/);
  });
});
