import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CodeLanguage } from "../types";
import { tokenClassName, tokenizeCode } from "./codeBlockHighlighter";
import { childrenToCode, codeLanguageLabels } from "./codeBlockModel";

type CopyState = "copied" | "failed" | "idle" | "selected";

export type CodeBlockProps = {
  children: ReactNode;
  highlightLines?: readonly number[];
  language?: CodeLanguage;
  showLineNumbers?: boolean;
  title?: string;
  wrap?: boolean;
};

export function CodeBlock({
  children,
  highlightLines = [],
  language = "text",
  showLineNumbers = false,
  title,
  wrap = false,
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const fallbackCopyRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(true);
  const resetTimerRef = useRef<number | null>(null);
  const code = useMemo(() => childrenToCode(children), [children]);
  const highlightedLineKey = highlightLines.join(",");

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  function scheduleStateReset() {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyState("idle");
      resetTimerRef.current = null;
    }, 1800);
  }

  async function copyCode() {
    let nextState: CopyState;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(code);
      nextState = "copied";
    } catch {
      nextState = selectFallbackSource(fallbackCopyRef.current) ? "selected" : "failed";
    }

    if (!mountedRef.current) {
      return;
    }

    setCopyState(nextState);
    scheduleStateReset();
  }

  const copyLabel = {
    copied: "Copied",
    failed: "Copy failed",
    idle: "Copy",
    selected: "Selected",
  }[copyState];

  const copyStatus = {
    copied: "Code copied to the clipboard.",
    failed: "Copy failed. Select the code and use your copy shortcut.",
    idle: "",
    selected: "Clipboard access is unavailable. The code is selected; use your copy shortcut.",
  }[copyState];

  return (
    <div className="code-block-wrap">
      <div className="code-block-toolbar">
        <div className="code-block-meta">
          {title ? <span className="code-block-title">{title}</span> : null}
          <span className="code-block-language">{codeLanguageLabels[language]}</span>
        </div>
        <button
          aria-label="Copy code"
          className="copy-code-button"
          type="button"
          onClick={copyCode}
        >
          {copyLabel}
        </button>
      </div>
      <span aria-live="polite" className="code-block-status" role="status">
        {copyStatus}
      </span>
      <textarea
        aria-hidden="true"
        className="code-block-copy-source"
        readOnly
        ref={fallbackCopyRef}
        tabIndex={-1}
        value={code}
      />
      <pre className={`code-block${wrap ? " code-block--wrap" : ""}`}>
        <code>
          <HighlightedCode
            code={code}
            highlightLinesKey={highlightedLineKey}
            language={language}
            showLineNumbers={showLineNumbers}
          />
        </code>
      </pre>
    </div>
  );
}

const HighlightedCode = memo(function HighlightedCode({
  code,
  highlightLinesKey,
  language,
  showLineNumbers,
}: {
  code: string;
  highlightLinesKey: string;
  language: CodeLanguage;
  showLineNumbers: boolean;
}) {
  const highlightedLines = useMemo(
    () => new Set(highlightLinesKey.split(",").map(Number).filter(Number.isInteger)),
    [highlightLinesKey],
  );
  const lines = useMemo(() => tokenizeCode(code, language), [code, language]);

  return (
    <>
      {lines.map((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const lineClassName = [
          "code-line",
          showLineNumbers ? "code-line--numbered" : "",
          highlightedLines.has(lineNumber) ? "code-line--highlighted" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const renderedTokens = line.map((token, tokenIndex) => (
          <span className={tokenClassName(token.types)} key={tokenIndex}>
            {token.content}
          </span>
        ));

        return (
          <span
            className={lineClassName}
            data-line-number={showLineNumbers ? lineNumber : undefined}
            key={lineIndex}
          >
            {showLineNumbers ? (
              <span className="code-line-content">{renderedTokens}</span>
            ) : (
              renderedTokens
            )}
          </span>
        );
      })}
    </>
  );
});

function selectFallbackSource(source: HTMLTextAreaElement | null) {
  if (!source) {
    return false;
  }

  source.focus({ preventScroll: true });
  source.select();
  return source.selectionStart === 0 && source.selectionEnd === source.value.length;
}
