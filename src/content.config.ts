import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { noteSchema, projectSchema } from "./lib/content/schemas";

const notes = defineCollection({
  loader: glob({ base: "./content/notes", pattern: "**/*.md" }),
  schema: noteSchema
});

const projects = defineCollection({
  loader: glob({ base: "./content/projects", pattern: "**/*.md" }),
  schema: projectSchema
});

export const collections = { notes, projects };
