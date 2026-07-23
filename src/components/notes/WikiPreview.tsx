import { useState, type FocusEvent, type MouseEvent } from "react";

interface Props {
  href: string;
  title: string;
  summary: string;
}

export function WikiPreview({ href, title, summary }: Props) {
  const [open, setOpen] = useState(false);
  const closeOnBlur = (event: FocusEvent<HTMLAnchorElement>) => {
    if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setOpen(false);
  };
  const closeOnLeave = (event: MouseEvent<HTMLSpanElement>) => {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) setOpen(false);
  };

  return (
    <span className="wiki-preview" onMouseLeave={closeOnLeave}>
      <a href={href} onFocus={() => setOpen(true)} onBlur={closeOnBlur} onMouseEnter={() => setOpen(true)} onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
        }
      }}>{title}</a>
      {open && <span className="wiki-preview__card" role="status">{summary}</span>}
    </span>
  );
}
