import type { KnowledgeEntry } from "./types";

export function buildEntryIndex(entries: KnowledgeEntry[]) {
  const published = entries.filter((entry) => !entry.draft);
  const bySlug = new Map<string, KnowledgeEntry>();
  const byTitle = new Map<string, KnowledgeEntry>();

  for (const entry of published) {
    if (bySlug.has(entry.slug)) {
      throw new Error(`Duplicate slug "${entry.slug}"`);
    }

    bySlug.set(entry.slug, entry);
    byTitle.set(entry.title, entry);
  }

  return { bySlug, byTitle, published };
}
