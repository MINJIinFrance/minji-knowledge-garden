const WIKI_LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function extractWikiLinks(markdown: string): string[] {
  const targets = new Set<string>();

  for (const match of markdown.matchAll(WIKI_LINK)) {
    targets.add(match[1].trim());
  }

  return [...targets];
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
      return `<span class="broken-wiki-link">${label}</span>`;
    }

    return `[${label}](/notes/${entry.slug})`;
  });

  return { markdown: rendered, broken: [...broken] };
}
