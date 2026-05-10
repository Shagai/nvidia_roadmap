import type { ReactNode } from "react";

type CalloutProps = {
  title: string;
  children: ReactNode;
  tone?: "default" | "success" | "warning";
};

export function Callout({ title, children, tone = "default" }: CalloutProps) {
  return (
    <aside className={`callout callout-${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}
