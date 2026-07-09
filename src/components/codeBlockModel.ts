import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import type { CodeLanguage } from "../types";

export const codeLanguageLabels: Record<CodeLanguage, string> = {
  bash: "Shell",
  cpp: "C++",
  cuda: "CUDA C++",
  text: "Plain text",
};

export function childrenToCode(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement(child)) {
        if (child.type === "br") {
          return "\n";
        }

        const element = child as ReactElement<{ children?: ReactNode }>;
        return childrenToCode(element.props.children);
      }

      return "";
    })
    .join("");
}

export function prismLanguage(language: CodeLanguage): string {
  if (language === "cuda") {
    return "cpp";
  }

  if (language === "text") {
    return "plain";
  }

  return language;
}
