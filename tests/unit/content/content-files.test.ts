import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

async function findNonMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const invalid = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return findNonMarkdownFiles(path);
      return entry.isFile() && !entry.name.endsWith(".md") ? [path] : [];
    })
  );
  return invalid.flat();
}

describe("content files", () => {
  test("all note files use the .md extension", async () => {
    const invalidFiles = await findNonMarkdownFiles(resolve("content/notes"));

    expect(invalidFiles).toEqual([]);
  });
});
