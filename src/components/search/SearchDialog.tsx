import { useEffect, useRef, useState } from "react";

export type SearchResult = { url: string; meta: { title: string }; excerpt: string };
export type SearchAdapter = (query: string) => Promise<SearchResult[]>;

type PagefindResult = { data: () => Promise<{ url: string; meta: { title?: string }; excerpt: string }> };
type PagefindModule = { search: (query: string) => Promise<{ results: PagefindResult[] }> };

async function pagefindSearch(query: string): Promise<SearchResult[]> {
  const modulePath = "/pagefind/pagefind.js";
  const pagefind = await import(/* @vite-ignore */ modulePath) as unknown as PagefindModule;
  const response = await pagefind.search(query);
  return Promise.all(response.results.map(async (result) => {
    const data = await result.data();
    return { url: data.url, meta: { title: data.meta.title ?? "제목 없음" }, excerpt: data.excerpt };
  }));
}

interface Props { search?: SearchAdapter; }

export function SearchDialog({ search = pagefindSearch }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const openerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    openerRef.current?.focus();
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = window.setTimeout(() => search(query).then((found) => { setResults(found); setActiveIndex(0); }).catch(() => setResults([])), 120);
    return () => window.clearTimeout(timer);
  }, [query, search]);

  return <>
    <button ref={openerRef} className="search-launcher" type="button" onClick={() => setOpen(true)} aria-label="검색 열기" aria-haspopup="dialog">검색 열기 <kbd aria-hidden="true">⌘/Ctrl K</kbd></button>
    {open && <div className="search-backdrop" onMouseDown={close}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="사이트 검색" onMouseDown={(event) => event.stopPropagation()}>
        <label htmlFor="site-search">노트와 프로젝트 검색</label>
        <input ref={inputRef} id="site-search" type="search" role="searchbox" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, results.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
          if (event.key === "Enter" && results[activeIndex]) window.location.assign(results[activeIndex].url);
        }} />
        {query && <ul className="search-results">{results.map((result, index) => <li key={result.url} data-active={index === activeIndex || undefined}><a href={result.url}><strong>{result.meta.title}</strong><span dangerouslySetInnerHTML={{ __html: result.excerpt }} /></a></li>)}</ul>}
        {query && results.length === 0 && <p>검색 결과가 없습니다.</p>}
        <button type="button" onClick={close}>검색 닫기</button>
      </section>
    </div>}
  </>;
}
