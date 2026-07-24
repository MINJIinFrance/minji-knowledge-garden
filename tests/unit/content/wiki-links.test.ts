import { describe, expect, it } from "vitest";
import { extractWikiLinks, renderWikiLinks } from "../../../src/lib/content/wiki-links";

describe("wiki links", () => {
  it("extracts unique wiki targets and preserves Korean titles", () => {
    expect(extractWikiLinks("[[상태 머신]]과 [[SQL 인덱스|인덱스]] 및 [[상태 머신]]")).toEqual([
      "상태 머신",
      "SQL 인덱스"
    ]);
  });

  it("renders known targets and marks broken targets", () => {
    const byTitle = new Map([["상태 머신", { slug: "state-machines" }]]);
    const result = renderWikiLinks("[[상태 머신]] / [[없는 노트]]", byTitle);

    expect(result.markdown).toContain("[상태 머신](/notes/state-machines)");
    expect(result.markdown).toContain('<span class="broken-wiki-link">없는 노트</span>');
    expect(result.broken).toEqual(["없는 노트"]);
  });

  it("deduplicates broken targets in source order", () => {
    const result = renderWikiLinks("[[Zulu]] [[Alpha]] [[Zulu]]", new Map());

    expect(result.broken).toEqual(["Zulu", "Alpha"]);
  });
});
