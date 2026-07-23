import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const notes = defineCollection({
  loader: glob({ base: "./content/notes", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()),
    topic: z.string(),
    draft: z.boolean().default(false)
  })
});

const projects = defineCollection({
  loader: glob({ base: "./content/projects", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    status: z.enum(["진행 중", "완료"]),
    period: z.string(),
    technologies: z.array(z.string()),
    relatedNotes: z.array(z.string()),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demoUrl: z.url().optional(),
    repositoryUrl: z.url().optional()
  })
});

export const collections = { notes, projects };
