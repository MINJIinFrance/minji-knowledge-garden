import { describe, expect, it } from "vitest";
import {
  createContentRepository,
  type RepositoryEntry
} from "../../../src/lib/content/repository";

const note = (
  slug: string,
  title: string,
  publishedAt: string,
  options: { updatedAt?: string; draft?: boolean; body?: string } = {}
): RepositoryEntry<"notes"> => ({
  id: slug,
  collection: "notes",
  data: {
    title,
    slug,
    summary: `${title} summary`,
    publishedAt: new Date(publishedAt),
    updatedAt: options.updatedAt ? new Date(options.updatedAt) : undefined,
    tags: [],
    topic: "testing",
    draft: options.draft ?? false
  },
  body: options.body ?? ""
});

const project = (
  slug: string,
  title: string,
  draft = false
): RepositoryEntry<"projects"> => ({
  id: slug,
  collection: "projects",
  data: {
    title,
    slug,
    summary: `${title} summary`,
    status: "진행 중",
    period: "2026",
    technologies: [],
    relatedNotes: [],
    featured: false,
    draft
  },
  body: ""
});

describe("content repository", () => {
  it("sorts published notes by updated date, then published date", async () => {
    const repository = createContentRepository({
      loadNotes: async () => [
        note("older", "Older", "2026-07-01"),
        note("newer", "Newer", "2026-07-02"),
        note("newly-updated", "Updated", "2026-07-01", {
          updatedAt: "2026-07-03"
        }),
        note("draft", "Draft", "2026-07-10", { draft: true })
      ],
      loadProjects: async () => []
    });

    expect((await repository.getPublishedNotes()).map((entry) => entry.data.slug)).toEqual([
      "newly-updated",
      "newer",
      "older"
    ]);
  });

  it("returns only published entries by slug", async () => {
    const visible = note("visible", "Visible", "2026-07-01");
    const repository = createContentRepository({
      loadNotes: async () => [visible, note("draft", "Draft", "2026-07-02", { draft: true })],
      loadProjects: async () => [project("published-project", "Published"), project("draft-project", "Draft", true)]
    });

    await expect(repository.getNoteBySlug("visible")).resolves.toBe(visible);
    await expect(repository.getNoteBySlug("draft")).resolves.toBeUndefined();
    expect((await repository.getPublishedProjects()).map((entry) => entry.data.slug)).toEqual(["published-project"]);
    await expect(repository.getProjectBySlug("draft-project")).resolves.toBeUndefined();
  });

  it("rejects a snapshot with duplicate published note titles", async () => {
    const repository = createContentRepository({
      loadNotes: async () => [
        note("first", "Same title", "2026-07-01"),
        note("second", "Same title", "2026-07-02")
      ],
      loadProjects: async () => []
    });

    await expect(repository.getPublishedNotes()).rejects.toThrow(
      'Duplicate published note title "Same title"'
    );
  });

  it("keeps wiki links pointed at a published title when a draft shares it", async () => {
    const source = note("source", "Source", "2026-07-01", { body: "[[Target]]" });
    const publishedTarget = note("target", "Target", "2026-07-02");
    const draftTarget = note("draft-target", "Target", "2026-07-03", { draft: true });

    for (const entries of [
      [source, publishedTarget, draftTarget],
      [draftTarget, source, publishedTarget]
    ]) {
      const repository = createContentRepository({
        loadNotes: async () => entries,
        loadProjects: async () => []
      });

      expect((await repository.getKnowledgeGraph()).edges).toContainEqual({
        source: "source",
        target: "target"
      });
      expect(await repository.getBacklinks("target")).toEqual(["source"]);
    }
  });

  it("shares one loaded snapshot across queries and derives the knowledge graph", async () => {
    let noteLoads = 0;
    const alpha = note("alpha", "Alpha", "2026-07-01", { body: "[[Beta]]" });
    const beta = note("beta", "Beta", "2026-07-02");
    const repository = createContentRepository({
      loadNotes: async () => {
        noteLoads += 1;
        return [beta, alpha];
      },
      loadProjects: async () => []
    });

    expect(await repository.getKnowledgeGraph()).toEqual({
      nodes: [
        { id: "alpha", title: "Alpha", topic: "testing", summary: "Alpha summary", href: "/notes/alpha" },
        { id: "beta", title: "Beta", topic: "testing", summary: "Beta summary", href: "/notes/beta" }
      ],
      edges: [{ source: "alpha", target: "beta" }]
    });
    expect(await repository.getBacklinks("beta")).toEqual(["alpha"]);
    await repository.getPublishedNotes();
    expect(noteLoads).toBe(1);
  });
});
