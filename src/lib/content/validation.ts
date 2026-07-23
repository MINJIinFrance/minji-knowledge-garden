import { noteSchema, projectSchema } from "./schemas";
import type { KnowledgeEntry, NoteData } from "./types";
import { extractWikiLinks } from "./wiki-links";

/**
 * Validates raw Astro collection entries as well as plain data fixtures. It
 * deliberately has no runtime dependency on Astro's virtual content module.
 */
export function validateContent(entries: unknown[]): { warnings: string[] } {
  const normalized = normalizeContentEntries(entries);
  assertUniqueSlugs(normalized);

  const publishedNoteTitles = new Set(
    normalized.filter(isNote).filter((entry) => !entry.draft).map((entry) => entry.title)
  );
  const warnings: string[] = [];

  for (const entry of normalized) {
    if (entry.draft) continue;
    for (const target of extractWikiLinks(entry.body)) {
      if (!publishedNoteTitles.has(target)) {
        warnings.push(`${entry.slug}: broken wiki link "${target}"`);
      }
    }
  }

  return { warnings };
}

export function normalizeContentEntries(entries: unknown[]): KnowledgeEntry[] {
  return entries.map(normalizeContentEntry);
}

function normalizeContentEntry(entry: unknown): KnowledgeEntry {
  const candidate = unwrapEntry(entry);
  if (candidate.kind === "note") {
    const parsed = noteSchema.safeParse(candidate.data);
    if (!parsed.success) throw new Error(`Invalid note metadata: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
    assertRequiredText("note", parsed.data);
    return { kind: "note", ...parsed.data, body: candidate.body };
  }

  if (candidate.kind === "project") {
    const parsed = projectSchema.safeParse(candidate.data);
    if (!parsed.success) throw new Error(`Invalid project metadata: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
    assertRequiredText("project", parsed.data);
    return { kind: "project", ...parsed.data, body: candidate.body };
  }

  throw new Error("Invalid content metadata: collection must be notes or projects");
}

function unwrapEntry(entry: unknown): { kind: "note" | "project" | undefined; data: unknown; body: string } {
  if (!isRecord(entry)) return { kind: undefined, data: entry, body: "" };

  if (entry.collection === "notes" || entry.collection === "projects") {
    return {
      kind: entry.collection === "notes" ? "note" : "project",
      data: entry.data,
      body: typeof entry.body === "string" ? entry.body : ""
    };
  }

  return {
    kind: entry.kind === "note" || entry.kind === "project" ? entry.kind : undefined,
    data: entry,
    body: typeof entry.body === "string" ? entry.body : ""
  };
}

function assertRequiredText(kind: "note" | "project", data: unknown): void {
  if (!isRecord(data)) throw new Error(`Invalid ${kind} metadata`);
  for (const field of ["title", "slug", "summary"]) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      throw new Error(`Invalid ${kind} metadata: ${field} must not be empty`);
    }
  }
}

function assertUniqueSlugs(entries: KnowledgeEntry[]): void {
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) throw new Error(`Duplicate slug "${entry.slug}"`);
    slugs.add(entry.slug);
  }
}

function isNote(entry: KnowledgeEntry): entry is NoteData {
  return entry.kind === "note";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
