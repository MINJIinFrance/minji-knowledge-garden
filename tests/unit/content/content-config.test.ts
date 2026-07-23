import { describe, expect, it } from "vitest";
import { noteSchema, projectSchema } from "../../../src/lib/content/schemas";

describe("content schemas", () => {
  it("parses valid note frontmatter", () => {
    const result = noteSchema.safeParse({
      title: "React rendering",
      slug: "react-rendering",
      summary: "How React updates the UI.",
      publishedAt: "2026-07-01",
      tags: ["react"],
      topic: "frontend",
      draft: false
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishedAt).toBeInstanceOf(Date);
    }
  });

  it("rejects note frontmatter without a title", () => {
    expect(
      noteSchema.safeParse({
        slug: "react-rendering",
        summary: "How React updates the UI.",
        publishedAt: "2026-07-01",
        tags: ["react"],
        topic: "frontend",
        draft: false
      }).success
    ).toBe(false);
  });

  it("exports the project schema used by the collection", () => {
    expect(projectSchema).toBeDefined();
  });
});
