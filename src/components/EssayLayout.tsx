import type { ReactNode } from "react";

type TocItem = {
  id: string;
  label: string;
};

type EssayLayoutProps = {
  eyebrow?: string;
  title: string;
  dek?: string;
  toc: TocItem[];
  children: ReactNode;
};

export function EssayLayout({ eyebrow, title, dek, toc, children }: EssayLayoutProps) {
  return (
    <div className="essay-shell">
      <article className="essay-article">
        <header className="essay-hero">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {dek ? <p className="dek">{dek}</p> : null}
        </header>
        <details className="mobile-toc">
          <summary>On this page</summary>
          <TocList toc={toc} />
        </details>
        {children}
      </article>
      <aside className="side-toc" aria-label="Table of contents">
        <p>On this page</p>
        <TocList toc={toc} />
      </aside>
    </div>
  );
}

function TocList({ toc }: { toc: TocItem[] }) {
  return (
    <ol>
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.label}</a>
        </li>
      ))}
    </ol>
  );
}
