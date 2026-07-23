import { extractWikiLinks } from "./wiki-links";
import type { NoteData } from "./types";

export function buildBacklinks(
  notes: NoteData[],
  byTitle: Map<string, NoteData>
): Map<string, string[]> {
  const published = notes.filter((note) => !note.draft).sort(compareNotesByTitle);
  const publishedByTitle = new Map(
    [...byTitle].filter(([, note]) => !note.draft)
  );
  const backlinks = new Map<string, Set<string>>();

  for (const note of published) {
    backlinks.set(note.slug, new Set());
  }

  for (const source of published) {
    for (const targetTitle of extractWikiLinks(source.body)) {
      const target = publishedByTitle.get(targetTitle);
      if (target && backlinks.has(target.slug)) {
        backlinks.get(target.slug)?.add(source.slug);
      }
    }
  }

  return new Map(
    [...backlinks].map(([slug, sources]) => [slug, [...sources].sort(compareText)])
  );
}

function compareNotesByTitle(left: NoteData, right: NoteData): number {
  return compareText(left.title, right.title) || compareText(left.slug, right.slug);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
