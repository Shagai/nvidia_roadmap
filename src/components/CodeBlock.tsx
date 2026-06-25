import { Children, isValidElement, useState } from "react";
import type { ReactElement, ReactNode } from "react";

const keywords = new Set([
  "__global__",
  "__shared__",
  "__syncthreads",
  "auto",
  "bool",
  "break",
  "case",
  "catch",
  "class",
  "concept",
  "const",
  "constexpr",
  "continue",
  "delete",
  "dim3",
  "do",
  "double",
  "else",
  "false",
  "float",
  "for",
  "if",
  "int",
  "namespace",
  "new",
  "noexcept",
  "nullptr",
  "private",
  "protected",
  "public",
  "requires",
  "return",
  "static",
  "static_cast",
  "std",
  "struct",
  "switch",
  "template",
  "throw",
  "true",
  "try",
  "typename",
  "using",
  "void",
  "while",
]);

const types = new Set([
  "char",
  "cudaError_t",
  "size_t",
  "uchar3",
  "uint16_t",
  "uint32_t",
  "uint64_t",
  "uint8_t",
]);

const tokenPattern =
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?(?:f|u|ms)?\b|[{}()[\]<>;,.=+\-*/:&|!]+|\s+|.)/g;

type CodeToken = {
  text: string;
  className?: string;
};

export function CodeBlock({ children }: { children: ReactNode }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const code = childrenToCode(children);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  return (
    <div className="code-block-wrap">
      <button className="copy-code-button" type="button" onClick={copyCode}>
        {copyState === "copied" ? "Copied" : copyState === "failed" ? "Failed" : "Copy"}
      </button>
      <pre className="code-block">
        <code>
          {code.split("\n").map((line, lineIndex) => (
            <span className="code-line" key={`${line}-${lineIndex}`}>
              {tokenizeLine(line).map((token, tokenIndex) => (
                <span className={token.className} key={`${token.text}-${tokenIndex}`}>
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function childrenToCode(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement(child)) {
        const element = child as ReactElement<{ children?: ReactNode }>;
        return childrenToCode(element.props.children);
      }

      return "";
    })
    .join("");
}

function tokenizeLine(line: string): CodeToken[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//")) {
    return [{ text: line, className: "tok-comment" }];
  }

  if (trimmed.startsWith("#")) {
    const leadingSpaces = line.slice(0, line.length - trimmed.length);
    return [
      { text: leadingSpaces },
      { text: trimmed, className: "tok-preprocessor" },
    ];
  }

  const commentIndex = line.indexOf("//");
  const code = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  const comment = commentIndex >= 0 ? line.slice(commentIndex) : "";

  const rawTokens = Array.from(code.matchAll(tokenPattern), ([match]) => match);
  const tokens = rawTokens.map((match, index) => classifyToken(match, rawTokens, index));
  if (comment) {
    tokens.push({ text: comment, className: "tok-comment" });
  }

  return tokens.length > 0 ? tokens : [{ text: " " }];
}

function classifyToken(text: string, tokens: string[], index: number): CodeToken {
  if (/^\s+$/.test(text)) {
    return { text };
  }
  if (/^["']/.test(text)) {
    return { text, className: "tok-string" };
  }
  if (/^\d/.test(text)) {
    return { text, className: "tok-number" };
  }
  if (keywords.has(text)) {
    return { text, className: "tok-keyword" };
  }
  if (types.has(text)) {
    return { text, className: "tok-type" };
  }
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(text) && nextMeaningfulToken(tokens, index) === "(") {
    return { text, className: "tok-function" };
  }
  if (/^[A-Z_]{2,}$/.test(text) || /^cuda[A-Z]/.test(text)) {
    return { text, className: "tok-constant" };
  }
  if (/^[{}()[\]<>;,.=+\-*/:&|!]+$/.test(text)) {
    return { text, className: "tok-operator" };
  }
  return { text };
}

function nextMeaningfulToken(tokens: string[], index: number) {
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (!/^\s+$/.test(tokens[i])) {
      return tokens[i];
    }
  }
  return "";
}
