import { describe, expect, it } from "vitest";
import { buildBacklinks } from "../../../src/lib/content/backlinks";
import type { NoteData } from "../../../src/lib/content/types";

const note = (title: string, slug: string, body: string, draft = false): NoteData => ({
  kind: "note",
  title,
  slug,
  summary: `${title} 요약`,
  publishedAt: new Date("2026-07-01"),
  tags: [],
  topic: "개발",
  draft,
  body
});

describe("backlinks", () => {
  it("places a source in its target's backlinks and excludes drafts", () => {
    const alpha = note("알파", "alpha", "[[베타]]");
    const beta = note("베타", "beta", "");
    const draft = note("초안", "draft", "[[베타]]", true);
    const byTitle = new Map([
      [alpha.title, alpha],
      [beta.title, beta]
    ]);

    const backlinks = buildBacklinks([draft, beta, alpha], byTitle);

    expect(backlinks.get("beta")).toEqual(["alpha"]);
    expect(backlinks.has("draft")).toBe(false);
  });

  it("sorts and deduplicates source slugs", () => {
    const alpha = note("알파", "alpha", "[[베타]] [[베타]]");
    const zulu = note("줄루", "zulu", "[[베타]]");
    const beta = note("베타", "beta", "");
    const byTitle = new Map([
      [alpha.title, alpha],
      [beta.title, beta],
      [zulu.title, zulu]
    ]);

    expect(buildBacklinks([zulu, beta, alpha], byTitle).get("beta")).toEqual(["alpha", "zulu"]);
  });
});
