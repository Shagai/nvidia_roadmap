import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function ReadingCard({
  to,
  title,
  children,
}: {
  to: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Link className="reading-card" to={to}>
      <strong>{title}</strong>
      <span>{children}</span>
    </Link>
  );
}
