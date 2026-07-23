export interface NoteData {
  kind: "note";
  title: string;
  slug: string;
  summary: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  topic: string;
  draft: boolean;
  body: string;
}

export interface ProjectData {
  kind: "project";
  title: string;
  slug: string;
  summary: string;
  status: "진행 중" | "완료";
  period: string;
  technologies: string[];
  relatedNotes: string[];
  featured: boolean;
  draft: boolean;
  body: string;
  demoUrl?: string;
  repositoryUrl?: string;
}

export type KnowledgeEntry = NoteData | ProjectData;
