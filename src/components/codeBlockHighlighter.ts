import type { Token, TokenStream } from "prismjs";
import type { CodeLanguage } from "../types";
import { prismLanguage } from "./codeBlockModel";
import { Prism } from "./prism";

export type HighlightedToken = {
  content: string;
  types: string[];
};

export function tokenizeCode(code: string, language: CodeLanguage): HighlightedToken[][] {
  const grammarName = prismLanguage(language);
  const grammar = Prism.languages[grammarName];
  const tokens = grammar
    ? flattenTokenStream(Prism.tokenize(code, grammar))
    : [{ content: code, types: ["plain"] }];

  return splitTokensIntoLines(tokens);
}

export function tokenClassName(types: string[]): string {
  const safeTypes = types.filter((type) => /^[a-z0-9_-]+$/i.test(type));
  return ["token", ...safeTypes].join(" ");
}

function flattenTokenStream(stream: TokenStream, inheritedTypes: string[] = []): HighlightedToken[] {
  if (typeof stream === "string") {
    return [{ content: stream, types: inheritedTypes.length > 0 ? inheritedTypes : ["plain"] }];
  }

  if (Array.isArray(stream)) {
    return stream.flatMap((token) => flattenTokenStream(token, inheritedTypes));
  }

  const token = stream as Token;
  const aliases = Array.isArray(token.alias) ? token.alias : token.alias ? [token.alias] : [];
  return flattenTokenStream(token.content, [...inheritedTypes, token.type, ...aliases]);
}

function splitTokensIntoLines(tokens: HighlightedToken[]): HighlightedToken[][] {
  const lines: HighlightedToken[][] = [[]];

  tokens.forEach((token) => {
    const parts = token.content.split("\n");
    parts.forEach((part, partIndex) => {
      if (part) {
        lines[lines.length - 1].push({ ...token, content: part });
      }

      if (partIndex < parts.length - 1) {
        lines.push([]);
      }
    });
  });

  return lines.map((line) =>
    line.length > 0 ? line : [{ content: " ", types: ["plain"] }],
  );
}
