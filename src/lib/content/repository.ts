import type { CollectionEntry } from "astro:content";
import { buildBacklinks } from "./backlinks";
import { buildGraph, type GraphEdge, type GraphNode } from "./graph";
import { buildEntryIndex } from "./knowledge-index";
import type { KnowledgeEntry, NoteData } from "./types";
import { normalizeContentEntries, validateContent } from "./validation";

export type RepositoryEntry<CollectionName extends "notes" | "projects"> = CollectionEntry<CollectionName>;
export type NoteEntry = RepositoryEntry<"notes">;
export type ProjectEntry = RepositoryEntry<"projects">;

export interface ContentRepository {
  getPublishedNotes(): Promise<NoteEntry[]>;
  getPublishedProjects(): Promise<ProjectEntry[]>;
  getNoteBySlug(slug: string): Promise<NoteEntry | undefined>;
  getProjectBySlug(slug: string): Promise<ProjectEntry | undefined>;
  getKnowledgeGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  getBacklinks(slug: string): Promise<string[]>;
  loadAllEntries(): Promise<Array<NoteEntry | ProjectEntry>>;
}

export interface RepositoryLoaders {
  loadNotes: () => Promise<NoteEntry[]>;
  loadProjects: () => Promise<ProjectEntry[]>;
}

interface RepositorySnapshot {
  allEntries: Array<NoteEntry | ProjectEntry>;
  publishedNotes: NoteEntry[];
  publishedProjects: ProjectEntry[];
  notesBySlug: Map<string, NoteEntry>;
  projectsBySlug: Map<string, ProjectEntry>;
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  backlinks: Map<string, string[]>;
}

/**
 * Creates a page-facing content facade. Loaders are injected so the data rules
 * remain testable without Astro's virtual content module.
 */
export function createContentRepository(loaders: RepositoryLoaders): ContentRepository {
  let snapshot: Promise<RepositorySnapshot> | undefined;

  const getSnapshot = (): Promise<RepositorySnapshot> => {
    snapshot ??= buildSnapshot(loaders);
    return snapshot;
  };

  return {
    async getPublishedNotes() {
      return (await getSnapshot()).publishedNotes;
    },
    async getPublishedProjects() {
      return (await getSnapshot()).publishedProjects;
    },
    async getNoteBySlug(slug) {
      return (await getSnapshot()).notesBySlug.get(slug);
    },
    async getProjectBySlug(slug) {
      return (await getSnapshot()).projectsBySlug.get(slug);
    },
    async getKnowledgeGraph() {
      return (await getSnapshot()).graph;
    },
    async getBacklinks(slug) {
      return (await getSnapshot()).backlinks.get(slug) ?? [];
    },
    async loadAllEntries() {
      return (await getSnapshot()).allEntries;
    }
  };
}

async function buildSnapshot(loaders: RepositoryLoaders): Promise<RepositorySnapshot> {
  const [notes, projects] = await Promise.all([loaders.loadNotes(), loaders.loadProjects()]);
  const allEntries = [...notes, ...projects];
  const entries = normalizeContentEntries(allEntries);

  validateContent(entries);
  buildEntryIndex(entries);

  const publishedNotes = notes.filter((entry) => !entry.data.draft).sort(compareNotes);
  const publishedProjects = projects.filter((entry) => !entry.data.draft).sort(compareProjects);
  const notesBySlug = new Map(publishedNotes.map((entry) => [entry.data.slug, entry]));
  const projectsBySlug = new Map(publishedProjects.map((entry) => [entry.data.slug, entry]));
  const noteEntries = entries.filter(isNote);
  const publishedNotesByTitle = new Map(
    noteEntries.filter((entry) => !entry.draft).map((entry) => [entry.title, entry])
  );

  return {
    allEntries,
    publishedNotes,
    publishedProjects,
    notesBySlug,
    projectsBySlug,
    graph: buildGraph(noteEntries, publishedNotesByTitle),
    backlinks: buildBacklinks(noteEntries, publishedNotesByTitle)
  };
}

function isNote(entry: KnowledgeEntry): entry is NoteData {
  return entry.kind === "note";
}

function compareNotes(left: NoteEntry, right: NoteEntry): number {
  return (
    compareDate(right.data.updatedAt ?? right.data.publishedAt, left.data.updatedAt ?? left.data.publishedAt) ||
    compareDate(right.data.publishedAt, left.data.publishedAt) ||
    compareText(left.data.slug, right.data.slug)
  );
}

function compareProjects(left: ProjectEntry, right: ProjectEntry): number {
  return Number(right.data.featured) - Number(left.data.featured) || compareText(left.data.title, right.data.title) || compareText(left.data.slug, right.data.slug);
}

function compareDate(left: Date, right: Date): number {
  return left.getTime() - right.getTime();
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const defaultRepository = createContentRepository({
  async loadNotes() {
    const { getCollection } = await import("astro:content");
    return getCollection("notes") as Promise<NoteEntry[]>;
  },
  async loadProjects() {
    const { getCollection } = await import("astro:content");
    return getCollection("projects") as Promise<ProjectEntry[]>;
  }
});

export const getPublishedNotes = defaultRepository.getPublishedNotes;
export const getPublishedProjects = defaultRepository.getPublishedProjects;
export const getNoteBySlug = defaultRepository.getNoteBySlug;
export const getProjectBySlug = defaultRepository.getProjectBySlug;
export const getKnowledgeGraph = defaultRepository.getKnowledgeGraph;
export const getBacklinks = defaultRepository.getBacklinks;
export const loadAllEntries = defaultRepository.loadAllEntries;
export { validateContent } from "./validation";
