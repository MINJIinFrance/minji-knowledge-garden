import type { KnowledgeEntry } from "./types";

export function buildEntryIndex(entries: KnowledgeEntry[]) {
  const seenSlugs = new Set<string>();
  for (const entry of entries) {
    if (seenSlugs.has(entry.slug)) {
      throw new Error(`Duplicate slug "${entry.slug}"`);
    }

    seenSlugs.add(entry.slug);
  }

  const published = entries.filter((entry) => !entry.draft);
  const bySlug = new Map<string, KnowledgeEntry>();
  const byTitle = new Map<string, KnowledgeEntry>();

  for (const entry of published) {
    bySlug.set(entry.slug, entry);
    byTitle.set(entry.title, entry);
  }

  return { bySlug, byTitle, published };
}
