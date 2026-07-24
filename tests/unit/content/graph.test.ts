import { describe, expect, it } from "vitest";
import { buildGraph } from "../../../src/lib/content/graph";
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

describe("knowledge graph", () => {
  it("excludes drafts and creates one edge for duplicate logical links", () => {
    const alpha = note("Alpha", "alpha", "[[Beta]] [[Beta|different label]]");
    const beta = note("Beta", "beta", "");
    const draft = note("Draft", "draft", "[[Beta]]", true);
    const byTitle = new Map([
      [alpha.title, alpha],
      [beta.title, beta]
    ]);

    const graph = buildGraph([draft, beta, alpha], byTitle);

    expect(graph.nodes.map((node) => node.id)).toEqual(["alpha", "beta"]);
    expect(graph.edges).toEqual([{ source: "alpha", target: "beta" }]);
  });

  it("sorts nodes by title and omits links to unknown targets", () => {
    const zulu = note("줄루", "zulu", "[[없는 노트]]");
    const alpha = note("알파", "alpha", "");
    const byTitle = new Map([
      [zulu.title, zulu],
      [alpha.title, alpha]
    ]);

    const graph = buildGraph([zulu, alpha], byTitle);

    expect(graph.nodes.map((node) => node.title)).toEqual(["알파", "줄루"]);
    expect(graph.edges).toEqual([]);
  });
});
