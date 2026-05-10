import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  note?: ReactNode;
};

export function Section({ id, title, children, note }: SectionProps) {
  return (
    <section id={id} className="essay-section">
      <div className="section-content">
        <h2>{title}</h2>
        {children}
      </div>
      {note ? <aside className="margin-note">{note}</aside> : null}
    </section>
  );
}
