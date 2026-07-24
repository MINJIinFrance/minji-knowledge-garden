import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadContentDirectory } from "../../../src/lib/content/file-loader";

const fixtureDirectory = (name: string) =>
  resolve(process.cwd(), "tests", "fixtures", "content-loader", name);

describe("raw Markdown content loader", () => {
  it("loads recursively parsed note frontmatter and Markdown bodies", async () => {
    const entries = await loadContentDirectory("note", fixtureDirectory("valid-notes"));

    expect(entries).toEqual([
      expect.objectContaining({
        kind: "note",
        title: "Nested note",
        slug: "nested-note",
        body: expect.stringContaining("Markdown body")
      })
    ]);
  });

  it("rejects Markdown whose frontmatter does not satisfy the note schema", async () => {
    await expect(loadContentDirectory("note", fixtureDirectory("invalid-notes"))).rejects.toThrow(
      /Invalid note metadata/
    );
  });
});
