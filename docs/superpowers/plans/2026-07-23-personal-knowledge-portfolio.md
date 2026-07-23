# Personal Knowledge Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a Korean-first editorial portfolio whose Markdown notes support wiki links, backlinks, full-text search, projects, and an interactive knowledge graph.

**Architecture:** Astro generates static pages from typed Markdown content collections. A build-time knowledge module validates content and derives links, backlinks, graph data, and Pagefind metadata; small React islands provide command search and the interactive graph while the reading experience remains static HTML.

**Tech Stack:** Node.js 22+, pnpm, Astro 6, TypeScript, React 19, Zod, unified/remark, Pagefind 1.5+, d3-force, Vitest, Testing Library, Playwright.

## Global Constraints

- Korean is the default language; English note titles must render and search correctly.
- Published content is static; there is no database, login, CMS, or web editor.
- `draft: true` notes and projects are absent from routes, search, backlinks, and graph data.
- Broken wiki links render visibly and emit build warnings; invalid frontmatter and duplicate slugs fail the build.
- Desktop note pages use left navigation, central reading content, and right contextual navigation; mobile uses a single reading column.
- The visual system uses an ivory background, ink text, restrained purple accents, serif display type, and sans-serif body type.
- Theme choice supports system preference and manual switching.
- All animation respects `prefers-reduced-motion`.
- Keyboard access, visible focus, semantic HTML, and WCAG AA color contrast are required.
- Personal data and example content remain replaceable through one config file and Markdown files.

---

## File Map

```text
.
├── astro.config.mjs                  # Astro, React, Markdown, and build integration
├── package.json                      # scripts and dependencies
├── playwright.config.ts              # browser test configuration
├── tsconfig.json                     # strict TypeScript settings
├── vitest.config.ts                  # unit/component test configuration
├── public/
│   ├── favicon.svg
│   └── fonts/                        # locally served font files if added
├── content/
│   ├── notes/                        # replaceable Markdown study notes
│   └── projects/                     # replaceable Markdown project case studies
├── scripts/
│   └── validate-content.ts           # CI/build validation entry point
├── src/
│   ├── content.config.ts             # Zod schemas and content loaders
│   ├── config/site.ts                # replaceable profile and site metadata
│   ├── lib/content/
│   │   ├── types.ts                  # shared content/graph types
│   │   ├── wiki-links.ts             # wiki-link parsing and rendering
│   │   ├── knowledge-index.ts        # public entry index and duplicate checks
│   │   ├── backlinks.ts              # reverse-link calculation
│   │   ├── graph.ts                  # graph node/edge generation
│   │   └── repository.ts             # page-facing content query API
│   ├── components/
│   │   ├── layout/                   # header, sidebars, mobile navigation
│   │   ├── notes/                    # note cards, metadata, backlinks, preview
│   │   ├── search/SearchDialog.tsx   # Cmd/Ctrl+K Pagefind client
│   │   ├── graph/KnowledgeGraph.tsx  # interactive d3-force graph
│   │   └── ThemeToggle.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── NoteLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── graph.astro
│   │   ├── notes/index.astro
│   │   ├── notes/[slug].astro
│   │   ├── projects/index.astro
│   │   └── projects/[slug].astro
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       └── prose.css
└── tests/
    ├── unit/content/                  # content pipeline tests
    ├── component/                    # React interaction tests
    ├── fixtures/content/             # valid and invalid Markdown fixtures
    └── e2e/                           # navigation, responsive, theme, search tests
```

### Task 1: Establish the typed Astro application

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/pages/index.astro`
- Create: `src/config/site.ts`
- Test: `tests/unit/site-config.test.ts`

**Interfaces:**
- Produces: `siteConfig: SiteConfig`, the single profile/configuration source used by all pages.
- Produces: `pnpm test`, `pnpm test:e2e`, `pnpm build`, and `pnpm check` scripts.

- [ ] **Step 1: Create the package manifest and install dependencies**

```json
{
  "name": "personal-knowledge-portfolio",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "check": "astro check && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "validate:content": "tsx scripts/validate-content.ts",
    "build": "pnpm validate:content && astro build && pagefind --site dist",
    "preview": "astro preview"
  }
}
```

Run:

```bash
pnpm add astro @astrojs/react react react-dom zod unified remark-parse remark-stringify unist-util-visit pagefind d3-force
pnpm add -D typescript @types/node @types/react @types/react-dom @types/d3-force vitest jsdom @testing-library/react @testing-library/user-event @playwright/test tsx
```

Expected: dependencies resolve and `pnpm-lock.yaml` is created.

- [ ] **Step 2: Write a failing configuration contract test**

```ts
// tests/unit/site-config.test.ts
import { describe, expect, it } from "vitest";
import { siteConfig } from "../../src/config/site";

describe("siteConfig", () => {
  it("contains editable identity and SEO fields", () => {
    expect(siteConfig.name).toBeTruthy();
    expect(siteConfig.tagline).toBeTruthy();
    expect(siteConfig.interests.length).toBeGreaterThan(0);
    expect(siteConfig.links.github).toMatch(/^https:\/\//);
  });
});
```

- [ ] **Step 3: Run the test and verify the missing module failure**

Run: `pnpm vitest run tests/unit/site-config.test.ts`

Expected: FAIL because `src/config/site.ts` does not exist.

- [ ] **Step 4: Implement the strict config and minimal home route**

```ts
// src/config/site.ts
export interface SiteConfig {
  name: string;
  title: string;
  tagline: string;
  description: string;
  interests: string[];
  email: string;
  links: { github: string; linkedin?: string };
}

export const siteConfig = {
  name: "김민재",
  title: "minjae.log",
  tagline: "배운 것을 연결하고, 만든 것으로 증명합니다.",
  description: "개발과 데이터에 관한 개인 지식 저장소이자 포트폴리오",
  interests: ["프론트엔드", "데이터 모델링", "생산성"],
  email: "hello@example.com",
  links: { github: "https://github.com/example" }
} satisfies SiteConfig;
```

```astro
--- // src/pages/index.astro
import { siteConfig } from "../config/site";
---
<html lang="ko">
  <head><title>{siteConfig.title}</title></head>
  <body><h1>{siteConfig.tagline}</h1></body>
</html>
```

Configure strict TypeScript, Astro React integration, `src/**/*.{test,spec}.{ts,tsx}` test discovery, and Playwright's `webServer.command` as `pnpm dev --host 127.0.0.1`.

- [ ] **Step 5: Verify the application foundation**

Run: `pnpm test && pnpm check && pnpm build`

Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts src/config/site.ts src/pages/index.astro tests/unit/site-config.test.ts
git commit -m "chore: establish Astro knowledge portfolio"
```

### Task 2: Define and validate Markdown content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/knowledge-index.ts`
- Create: `tests/unit/content/knowledge-index.test.ts`
- Create: `tests/fixtures/content/`
- Create: `content/notes/react-rendering.md`
- Create: `content/notes/state-machines.md`
- Create: `content/notes/sql-indexes.md`
- Create: `content/projects/knowledge-search.md`

**Interfaces:**
- Produces: `KnowledgeEntry`, `NoteData`, `ProjectData`, and `buildEntryIndex(entries)`.
- `buildEntryIndex` returns `{ bySlug: Map<string, KnowledgeEntry>; byTitle: Map<string, KnowledgeEntry>; published: KnowledgeEntry[] }`.

- [ ] **Step 1: Write failing schema/index tests**

```ts
// tests/unit/content/knowledge-index.test.ts
import { describe, expect, it } from "vitest";
import { buildEntryIndex } from "../../../src/lib/content/knowledge-index";

const note = (title: string, slug: string, draft = false) => ({
  kind: "note" as const, title, slug, summary: `${title} 요약`,
  publishedAt: new Date("2026-07-01"), tags: ["test"], topic: "개발",
  draft, body: ""
});

describe("buildEntryIndex", () => {
  it("excludes drafts from every public index", () => {
    const result = buildEntryIndex([note("공개", "public"), note("초안", "draft", true)]);
    expect(result.published.map((entry) => entry.slug)).toEqual(["public"]);
    expect(result.bySlug.has("draft")).toBe(false);
  });

  it("throws for duplicate slugs", () => {
    expect(() => buildEntryIndex([note("A", "same"), note("B", "same")]))
      .toThrow('Duplicate slug "same"');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run tests/unit/content/knowledge-index.test.ts`

Expected: FAIL because content types and index are missing.

- [ ] **Step 3: Implement content types, Zod collections, and index validation**

```ts
// src/lib/content/types.ts
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
```

```ts
// src/lib/content/knowledge-index.ts
import type { KnowledgeEntry } from "./types";

export function buildEntryIndex(entries: KnowledgeEntry[]) {
  const published = entries.filter((entry) => !entry.draft);
  const bySlug = new Map<string, KnowledgeEntry>();
  const byTitle = new Map<string, KnowledgeEntry>();
  for (const entry of published) {
    if (bySlug.has(entry.slug)) throw new Error(`Duplicate slug "${entry.slug}"`);
    bySlug.set(entry.slug, entry);
    byTitle.set(entry.title, entry);
  }
  return { bySlug, byTitle, published };
}
```

Define Astro content collections with Zod schemas matching these types. Add four example Markdown documents whose wiki links form at least one three-node chain and one project-to-note relationship.

- [ ] **Step 4: Verify schema parsing and draft exclusion**

Run: `pnpm test && pnpm check`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/lib/content content tests/fixtures tests/unit/content
git commit -m "feat: add typed Markdown content model"
```

### Task 3: Build wiki links, backlinks, and graph data

**Files:**
- Create: `src/lib/content/wiki-links.ts`
- Create: `src/lib/content/backlinks.ts`
- Create: `src/lib/content/graph.ts`
- Test: `tests/unit/content/wiki-links.test.ts`
- Test: `tests/unit/content/backlinks.test.ts`
- Test: `tests/unit/content/graph.test.ts`

**Interfaces:**
- Produces: `extractWikiLinks(markdown: string): string[]`.
- Produces: `renderWikiLinks(markdown, byTitle): { markdown: string; broken: string[] }`.
- Produces: `buildBacklinks(notes, byTitle): Map<string, string[]>`.
- Produces: `buildGraph(notes, byTitle): { nodes: GraphNode[]; edges: GraphEdge[] }`.

- [ ] **Step 1: Write failing behavior tests**

```ts
// tests/unit/content/wiki-links.test.ts
import { expect, it } from "vitest";
import { extractWikiLinks, renderWikiLinks } from "../../../src/lib/content/wiki-links";

it("extracts unique wiki targets and preserves Korean titles", () => {
  expect(extractWikiLinks("[[상태 머신]]과 [[SQL 인덱스|인덱스]] 및 [[상태 머신]]"))
    .toEqual(["상태 머신", "SQL 인덱스"]);
});

it("renders known targets and marks broken targets", () => {
  const byTitle = new Map([["상태 머신", { slug: "state-machines" }]]);
  const result = renderWikiLinks("[[상태 머신]] / [[없는 노트]]", byTitle);
  expect(result.markdown).toContain("[상태 머신](/notes/state-machines)");
  expect(result.markdown).toContain('<span class="broken-wiki-link">없는 노트</span>');
  expect(result.broken).toEqual(["없는 노트"]);
});
```

Add backlink and graph tests asserting that drafts are absent, duplicate links create one edge, and A→B makes A appear in B's backlinks.

- [ ] **Step 2: Run and confirm missing implementation failures**

Run: `pnpm vitest run tests/unit/content`

Expected: FAIL for the three missing modules.

- [ ] **Step 3: Implement the pure knowledge functions**

```ts
// src/lib/content/wiki-links.ts
const WIKI_LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function extractWikiLinks(markdown: string): string[] {
  return [...new Set([...markdown.matchAll(WIKI_LINK)].map((match) => match[1].trim()))];
}

export function renderWikiLinks(
  markdown: string,
  byTitle: Map<string, { slug: string }>
): { markdown: string; broken: string[] } {
  const broken = new Set<string>();
  const rendered = markdown.replace(WIKI_LINK, (_, rawTarget: string, rawLabel?: string) => {
    const target = rawTarget.trim();
    const label = rawLabel?.trim() ?? target;
    const entry = byTitle.get(target);
    if (!entry) {
      broken.add(target);
      return `<span class="broken-wiki-link" data-missing-note="${target}">${label}</span>`;
    }
    return `[${label}](/notes/${entry.slug})`;
  });
  return { markdown: rendered, broken: [...broken] };
}
```

Implement backlinks and graph as deterministic pure functions. Sort backlink slugs and graph nodes by title; use edge IDs `${source}->${target}` and deduplicate them with a `Set`.

- [ ] **Step 4: Verify the content graph**

Run: `pnpm vitest run tests/unit/content`

Expected: all content pipeline tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content tests/unit/content
git commit -m "feat: derive wiki links backlinks and graph"
```

### Task 4: Add repository queries and content validation

**Files:**
- Create: `src/lib/content/repository.ts`
- Create: `scripts/validate-content.ts`
- Test: `tests/unit/content/repository.test.ts`
- Test: `tests/unit/content/validation.test.ts`

**Interfaces:**
- Produces: `getPublishedNotes(): Promise<CollectionEntry<"notes">[]>` and `getPublishedProjects(): Promise<CollectionEntry<"projects">[]>`, both sorted and draft-free.
- Produces: `getNoteBySlug(slug): Promise<CollectionEntry<"notes"> | undefined>` and `getProjectBySlug(slug): Promise<CollectionEntry<"projects"> | undefined>`.
- Produces: `getKnowledgeGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>`.
- Produces: `validateContent(entries): { warnings: string[] }`; throws on invalid metadata or duplicate slugs.

- [ ] **Step 1: Write failing repository and validation tests**

```ts
it("reports broken wiki links without throwing", () => {
  const result = validateContent([note({ title: "A", slug: "a", body: "[[Missing]]" })]);
  expect(result.warnings).toEqual(['a: broken wiki link "Missing"']);
});

it("sorts notes by updated date then published date", async () => {
  const notes = await getPublishedNotes();
  expect(notes.map((note) => note.slug)).toEqual(["newly-updated", "newer", "older"]);
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run tests/unit/content/repository.test.ts tests/unit/content/validation.test.ts`

Expected: FAIL because repository and validation entry points are missing.

- [ ] **Step 3: Implement the repository facade and CLI**

```ts
// scripts/validate-content.ts
import { loadAllEntries, validateContent } from "../src/lib/content/repository";

const result = await validateContent(await loadAllEntries());
for (const warning of result.warnings) console.warn(`CONTENT WARNING: ${warning}`);
```

Keep Astro's `getCollection()` usage inside `repository.ts`; pages must not rebuild indexes independently. Cache one resolved repository snapshot per build process.

- [ ] **Step 4: Verify validation policy**

Run: `pnpm validate:content`

Expected: exit 0, with `CONTENT WARNING:` lines only for intentionally broken example links. Temporarily add a duplicate slug fixture and verify exit 1, then remove it.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/repository.ts scripts/validate-content.ts tests/unit/content
git commit -m "feat: add validated content repository"
```

### Task 5: Implement the editorial design system and application shell

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/prose.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/layout/SiteHeader.astro`
- Create: `src/components/layout/MobileNav.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `public/favicon.svg`
- Test: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces: `BaseLayout` props `{ title: string; description?: string; image?: string }`.
- Produces: persistent `data-theme="light|dark"` on `<html>`.

- [ ] **Step 1: Write the failing shell browser test**

```ts
// tests/e2e/shell.spec.ts
import { expect, test } from "@playwright/test";

test("navigation and theme work with keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.getByRole("button", { name: "테마 전환" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("navigation", { name: "주요 메뉴" })).toBeVisible();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `pnpm playwright test tests/e2e/shell.spec.ts`

Expected: FAIL because the shell and theme button are absent.

- [ ] **Step 3: Implement tokens, layout, navigation, and theme**

```css
/* src/styles/tokens.css */
:root {
  --paper: #f7f3ea;
  --surface: #fffdf8;
  --ink: #25221e;
  --muted: #746f67;
  --line: #d8d1c4;
  --accent: #7057d9;
  --focus: #4d35ba;
  --reading-width: 46rem;
  --font-display: "Iowan Old Style", "Noto Serif KR", Georgia, serif;
  --font-body: Inter, Pretendard, "Noto Sans KR", system-ui, sans-serif;
}
[data-theme="dark"] {
  --paper: #181714;
  --surface: #211f1b;
  --ink: #eee9df;
  --muted: #aaa399;
  --line: #3b3730;
  --accent: #ab99ff;
  --focus: #c1b4ff;
}
```

Place a blocking inline theme bootstrap in `<head>` to prevent a flash, then load global/prose styles. Add skip link, semantic header/nav/main/footer, canonical URL, description, Open Graph, and theme-color metadata.

- [ ] **Step 4: Verify responsive and reduced-motion behavior**

Run: `pnpm playwright test tests/e2e/shell.spec.ts --project=chromium`

Expected: PASS at configured desktop and mobile projects.

- [ ] **Step 5: Commit**

```bash
git add src/styles src/layouts src/components/layout src/components/ThemeToggle.astro public/favicon.svg tests/e2e/shell.spec.ts
git commit -m "feat: add editorial responsive application shell"
```

### Task 6: Build home, notes, projects, and about pages

**Files:**
- Create: `src/components/notes/NoteCard.astro`
- Create: `src/components/notes/NoteMeta.astro`
- Create: `src/components/notes/Backlinks.astro`
- Create: `src/layouts/NoteLayout.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[slug].astro`
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[slug].astro`
- Create: `src/pages/about.astro`
- Test: `tests/e2e/content-pages.spec.ts`

**Interfaces:**
- Consumes: repository query functions from Task 4 and `BaseLayout` from Task 5.
- Produces: all static content routes and `data-pagefind-*` search metadata.

- [ ] **Step 1: Write failing route and draft-exclusion tests**

```ts
test("note page exposes wiki links and backlinks", async ({ page }) => {
  await page.goto("/notes/state-machines");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("상태 머신");
  await expect(page.getByRole("link", { name: "React 렌더링" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "이 노트를 언급한 글" })).toBeVisible();
});

test("draft routes are not generated", async ({ request }) => {
  expect((await request.get("/notes/private-draft")).status()).toBe(404);
});
```

- [ ] **Step 2: Run and verify route failures**

Run: `pnpm playwright test tests/e2e/content-pages.spec.ts`

Expected: FAIL with 404 for unimplemented routes.

- [ ] **Step 3: Implement static paths and editorial page composition**

```astro
--- // src/pages/notes/[slug].astro
import { render } from "astro:content";
import NoteLayout from "../../layouts/NoteLayout.astro";
import { getNoteBySlug, getPublishedNotes } from "../../lib/content/repository";

export async function getStaticPaths() {
  return (await getPublishedNotes()).map((note) => ({
    params: { slug: note.slug },
    props: { slug: note.slug }
  }));
}

const { slug } = Astro.props;
const note = await getNoteBySlug(slug);
if (!note) return Astro.redirect("/404");
const { Content, headings } = await render(note);
---
<NoteLayout note={note} headings={headings}>
  <article data-pagefind-body><Content /></article>
</NoteLayout>
```

Implement the other routes through repository queries. Add explicit empty states for no notes, no projects, and no backlinks. Keep the note reading column at `--reading-width`.

- [ ] **Step 4: Verify routes, metadata, and internal links**

Run: `pnpm test && pnpm check && pnpm build && pnpm playwright test tests/e2e/content-pages.spec.ts`

Expected: PASS; build emits routes for public entries only.

- [ ] **Step 5: Commit**

```bash
git add src/components/notes src/layouts/NoteLayout.astro src/pages tests/e2e/content-pages.spec.ts
git commit -m "feat: publish portfolio and knowledge pages"
```

### Task 7: Add global Pagefind search

**Files:**
- Create: `src/components/search/SearchDialog.tsx`
- Create: `src/components/search/SearchLauncher.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/component/SearchDialog.test.tsx`
- Test: `tests/e2e/search.spec.ts`

**Interfaces:**
- Produces: `SearchDialog` with injected `search(query)` adapter for unit tests and Pagefind adapter in production.
- Supports `Ctrl+K`, `Meta+K`, Escape, arrow keys, Enter, and focus restoration.

- [ ] **Step 1: Write the failing keyboard interaction test**

```tsx
it("opens, searches Korean text, and restores focus", async () => {
  const user = userEvent.setup();
  const search = vi.fn().mockResolvedValue([
    { url: "/notes/state-machines", meta: { title: "상태 머신" }, excerpt: "상태를 명시적으로..." }
  ]);
  render(<SearchDialog search={search} />);
  await user.keyboard("{Control>}k{/Control}");
  await user.type(screen.getByRole("searchbox"), "상태");
  expect(await screen.findByRole("link", { name: /상태 머신/ })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify component failure**

Run: `pnpm vitest run tests/component/SearchDialog.test.tsx`

Expected: FAIL because `SearchDialog` is missing.

- [ ] **Step 3: Implement lazy Pagefind search and accessible dialog behavior**

```ts
export type SearchResult = {
  url: string;
  meta: { title: string };
  excerpt: string;
};
export type SearchAdapter = (query: string) => Promise<SearchResult[]>;
```

On first focus, dynamically import `/pagefind/pagefind.js`, call `search(query)`, load result data, and map it to `SearchResult`. Debounce input by 120 ms. Mark Pagefind's generated UI assets as build output, not source files.

- [ ] **Step 4: Verify built-index search**

Run: `pnpm build && pnpm playwright test tests/e2e/search.spec.ts`

Expected: Pagefind reports indexed pages; keyboard search finds the Korean example note.

- [ ] **Step 5: Commit**

```bash
git add src/components/search src/layouts/BaseLayout.astro tests/component tests/e2e/search.spec.ts
git commit -m "feat: add keyboard-first full-text search"
```

### Task 8: Add note previews and interactive knowledge graph

**Files:**
- Create: `src/components/notes/WikiPreview.tsx`
- Create: `src/components/graph/KnowledgeGraph.tsx`
- Create: `src/components/graph/graph-layout.ts`
- Create: `src/pages/graph.astro`
- Test: `tests/component/WikiPreview.test.tsx`
- Test: `tests/component/KnowledgeGraph.test.tsx`
- Test: `tests/e2e/graph.spec.ts`

**Interfaces:**
- Consumes: `GraphNode { id; title; topic; summary; href }` and `GraphEdge { source; target }`.
- Produces: accessible graph canvas plus a DOM details panel and keyboard-selectable node list fallback.

- [ ] **Step 1: Write failing preview and graph selection tests**

```tsx
it("reveals the selected node and its direct neighbors", async () => {
  const user = userEvent.setup();
  render(<KnowledgeGraph nodes={nodes} edges={edges} />);
  await user.click(screen.getByRole("button", { name: "상태 머신 노드 선택" }));
  expect(screen.getByRole("heading", { name: "상태 머신" })).toBeVisible();
  expect(screen.getByRole("link", { name: "React 렌더링" })).toBeVisible();
});
```

For `WikiPreview`, assert that pointer hover and keyboard focus both open the same summary card and Escape closes it.

- [ ] **Step 2: Run and verify failures**

Run: `pnpm vitest run tests/component/WikiPreview.test.tsx tests/component/KnowledgeGraph.test.tsx`

Expected: FAIL because graph and preview components are missing.

- [ ] **Step 3: Implement deterministic initial layout and interactive enhancement**

```ts
// src/components/graph/graph-layout.ts
import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";
import type { GraphEdge, GraphNode } from "../../lib/content/types";

export function layoutGraph(nodes: GraphNode[], edges: GraphEdge[]) {
  const cloned = nodes.map((node) => ({ ...node }));
  const links = edges.map((edge) => ({ ...edge }));
  const simulation = forceSimulation(cloned)
    .force("charge", forceManyBody().strength(-90))
    .force("center", forceCenter(400, 300))
    .force("link", forceLink(links).id((node: any) => node.id).distance(70))
    .stop();
  for (let index = 0; index < 160; index += 1) simulation.tick();
  return { nodes: cloned, edges: links };
}
```

Render graph edges and nodes in SVG for zoom, pan, pointer selection, and visible focus. Provide an adjacent searchable list so the graph remains usable without fine pointer control. Disable layout animation under reduced-motion.

- [ ] **Step 4: Verify graph interaction and fallback**

Run: `pnpm test && pnpm playwright test tests/e2e/graph.spec.ts`

Expected: PASS for pointer selection, keyboard list navigation, direct-neighbor highlighting, and note navigation.

- [ ] **Step 5: Commit**

```bash
git add src/components/notes/WikiPreview.tsx src/components/graph src/pages/graph.astro tests/component tests/e2e/graph.spec.ts
git commit -m "feat: add previews and interactive knowledge graph"
```

### Task 9: Complete accessibility, SEO, and responsive visual verification

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/NoteLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `src/styles/prose.css`
- Create: `src/pages/404.astro`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes all public routes.
- Produces validated metadata, focus order, responsive layout, and empty/error states.

- [ ] **Step 1: Write failing accessibility and responsive assertions**

```ts
test("note layout collapses to one column on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/notes/state-machines");
  await expect(page.locator("[data-note-grid]")).toHaveCSS("grid-template-columns", "358px");
  await expect(page.getByRole("button", { name: "노트 탐색 열기" })).toBeVisible();
});

test("all pages contain one main landmark and one h1", async ({ page }) => {
  for (const route of ["/", "/notes", "/graph", "/projects", "/about"]) {
    await page.goto(route);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});
```

- [ ] **Step 2: Run and record exact failures**

Run: `pnpm playwright test tests/e2e/accessibility.spec.ts tests/e2e/responsive.spec.ts`

Expected: initial failures identify remaining landmark, focus, or breakpoint gaps.

- [ ] **Step 3: Implement the missing states and metadata**

Add:

```css
@media (max-width: 52rem) {
  [data-note-grid] { grid-template-columns: minmax(0, 1fr); }
  [data-desktop-sidebar] { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
```

Add a useful 404 page, canonical URLs, Open Graph tags, article dates, and JSON-LD for the person/site. Confirm broken wiki links are focusable only when they offer a useful explanation; otherwise render them as noninteractive text.

- [ ] **Step 4: Run the complete local quality gate**

Run: `pnpm test && pnpm check && pnpm build && pnpm playwright test`

Expected: all unit, component, type, build, desktop, and mobile checks PASS.

- [ ] **Step 5: Commit**

```bash
git add src tests/e2e
git commit -m "fix: complete accessibility and responsive polish"
```

### Task 10: Prepare and deploy the production site

**Files:**
- Create or update: `.openai/hosting.json` only through the Sites workflow.
- Modify: `README.md`

**Interfaces:**
- Consumes: a clean, pushed commit whose SHA exactly matches the source archive/version.
- Produces: a saved Sites version and production deployment URL.

- [ ] **Step 1: Document the publishing workflow**

```md
## 새 글 올리기

1. `content/notes`에 Markdown 파일을 추가합니다.
2. `pnpm validate:content`로 메타데이터와 위키 링크를 확인합니다.
3. `pnpm build`로 정적 사이트와 검색 색인을 생성합니다.
4. 변경 사항을 커밋하고 배포합니다.

프로필은 `src/config/site.ts`, 프로젝트는 `content/projects`에서 수정합니다.
`draft: true` 콘텐츠는 공개 빌드에 포함되지 않습니다.
```

- [ ] **Step 2: Run final verification against the exact release state**

Run:

```bash
pnpm test
pnpm check
pnpm build
pnpm playwright test
git status --short
```

Expected: every verification command passes and `git status --short` lists only the intended README change before committing.

- [ ] **Step 3: Commit and push the exact release source**

```bash
git add README.md
git commit -m "docs: add Markdown publishing guide"
git push
git rev-parse HEAD
```

Expected: push succeeds and the printed SHA identifies the exact deployed source.

- [ ] **Step 4: Save and deploy through Sites**

Read `.openai/hosting.json` first. If it contains `project_id`, reuse that opaque ID. Otherwise call `create_site` exactly once, persist the returned ID through the Sites workflow, build the archive from the exact pushed commit, save a version with that commit SHA, and deploy only that saved version.

Expected: deployment reaches a terminal successful state and returns the production URL.

- [ ] **Step 5: Verify production**

Open the production URL and verify:

```text
/                       200, editorial home visible
/notes                  200, search and filters visible
/notes/state-machines   200, wiki link and backlinks visible
/graph                  200, graph and accessible node list visible
/projects               200, example project visible
/about                  200, replaceable example profile visible
```

Also verify theme persistence, `Ctrl/Cmd+K` search, mobile navigation, and one graph-to-note navigation flow.

- [ ] **Step 6: Commit any hosting metadata created by the Sites workflow**

```bash
git add .openai/hosting.json
git commit -m "chore: record Sites project configuration"
git push
```

Expected: hosting metadata is versioned and contains no runtime secrets.
