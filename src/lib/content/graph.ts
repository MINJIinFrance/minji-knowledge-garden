import { extractWikiLinks } from "./wiki-links";
import type { NoteData } from "./types";

export interface GraphNode {
  id: string;
  title: string;
  topic: string;
  summary: string;
  href: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export function buildGraph(
  notes: NoteData[],
  byTitle: Map<string, NoteData>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const published = notes.filter((note) => !note.draft).sort(compareNotesByTitle);
  const publishedByTitle = new Map(
    [...byTitle].filter(([, note]) => !note.draft)
  );
  const publishedSlugs = new Set(published.map((note) => note.slug));
  const edgeIds = new Set<string>();

  for (const source of published) {
    for (const targetTitle of extractWikiLinks(source.body)) {
      const target = publishedByTitle.get(targetTitle);
      if (target && publishedSlugs.has(target.slug)) {
        edgeIds.add(`${source.slug}->${target.slug}`);
      }
    }
  }

  return {
    nodes: published.map((note) => ({
      id: note.slug,
      title: note.title,
      topic: note.topic,
      summary: note.summary,
      href: `/notes/${note.slug}`
    })),
    edges: [...edgeIds]
      .sort(compareText)
      .map((edgeId) => {
        const [source, target] = edgeId.split("->");
        return { source, target };
      })
  };
}

function compareNotesByTitle(left: NoteData, right: NoteData): number {
  return compareText(left.title, right.title) || compareText(left.slug, right.slug);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
