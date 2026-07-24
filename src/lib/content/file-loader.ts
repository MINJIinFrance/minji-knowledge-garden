import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import matter from "gray-matter";
import { normalizeContentEntries } from "./validation";
import type { KnowledgeEntry, NoteData, ProjectData } from "./types";

export type ContentKind = "note" | "project";

export interface ContentDirectories {
  notesDirectory: string;
  projectsDirectory: string;
}

const defaultContentRoot = resolve(process.cwd(), "content");

export async function loadRawContentEntries(
  directories: ContentDirectories = {
    notesDirectory: resolve(defaultContentRoot, "notes"),
    projectsDirectory: resolve(defaultContentRoot, "projects")
  }
): Promise<KnowledgeEntry[]> {
  const [notes, projects] = await Promise.all([
    loadContentDirectory("note", directories.notesDirectory),
    loadContentDirectory("project", directories.projectsDirectory)
  ]);
  return [...notes, ...projects];
}

export async function loadContentDirectory(kind: "note", directory: string): Promise<NoteData[]>;
export async function loadContentDirectory(kind: "project", directory: string): Promise<ProjectData[]>;
export async function loadContentDirectory(
  kind: ContentKind,
  directory: string
): Promise<KnowledgeEntry[]> {
  const files = await findMarkdownFiles(directory);
  const entries = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, "utf8");
      const parsed = matter(source);
      try {
        return normalizeContentEntries([
          { kind, ...parsed.data, body: parsed.content }
        ])[0];
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        throw new Error(`Invalid ${kind} metadata in ${file}: ${message}`);
      }
    })
  );

  return entries;
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const directoryEntries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    directoryEntries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) return findMarkdownFiles(path);
        return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
      })
  );
  return files.flat();
}
