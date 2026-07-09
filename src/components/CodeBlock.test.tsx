/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";
import { childrenToCode, prismLanguage } from "./codeBlockModel";

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();

  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

describe("childrenToCode", () => {
  it("normalizes nested React children and preserves explicit line breaks", () => {
    const children = createElement(
      "span",
      null,
      createElement("strong", null, "alpha"),
      createElement("br"),
      createElement("em", null, "beta"),
    );

    expect(childrenToCode(children)).toBe("alpha\nbeta");
  });

  it("maps the supported teaching languages to Prism grammars", () => {
    expect(prismLanguage("cuda")).toBe("cpp");
    expect(prismLanguage("cpp")).toBe("cpp");
    expect(prismLanguage("bash")).toBe("bash");
    expect(prismLanguage("text")).toBe("plain");
  });
});

describe("CodeBlock", () => {
  it("renders metadata, line numbers, wrapping, and highlighted lines", () => {
    const { container } = render(
      <CodeBlock
        highlightLines={[2]}
        language="cuda"
        showLineNumbers
        title="network.cu"
        wrap
      >
        {'const char* url = "https://example.com";\n// real comment'}
      </CodeBlock>,
    );

    expect(screen.getByText("network.cu")).toBeInTheDocument();
    expect(screen.getByText("CUDA C++")).toBeInTheDocument();
    expect(container.querySelector(".code-block--wrap")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-line-number]")).toHaveLength(2);
    expect(container.querySelector('[data-line-number="2"]')).toHaveTextContent("real comment");
    expect(container.querySelector(".code-line--highlighted")).toHaveTextContent("real comment");
    expect(container.querySelector(".token.string")).toHaveTextContent("https://example.com");
    expect(container.querySelector(".token.comment")).toHaveTextContent("real comment");
  });

  it("uses the Bash grammar for command comments and variables", () => {
    const { container } = render(
      <CodeBlock language="bash">{'# build the target\necho "$BUILD_DIR"'}</CodeBlock>,
    );

    expect(container.querySelector(".token.comment")).toHaveTextContent("build the target");
    expect(container.querySelector(".token.variable")).toHaveTextContent("BUILD_DIR");
  });

  it("copies the normalized source and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    render(<CodeBlock language="bash">{"echo ready"}</CodeBlock>);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("echo ready"));
    expect(screen.getByRole("button", { name: "Copy code" })).toHaveTextContent("Copied");
    expect(screen.getByRole("status")).toHaveTextContent("Code copied to the clipboard.");
  });

  it("selects the code and announces a manual fallback when clipboard access fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("not allowed"));
    const selectSpy = vi.spyOn(HTMLTextAreaElement.prototype, "select");
    setClipboard(writeText);

    render(<CodeBlock language="text">{"select me"}</CodeBlock>);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(selectSpy).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Copy code" })).toHaveTextContent("Selected");
    expect(screen.getByRole("status")).toHaveTextContent("use your copy shortcut");
    expect(document.activeElement).toHaveValue("select me");
  });

  it("clears the pending feedback timer when it unmounts", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    setClipboard(writeText);
    const { unmount } = render(<CodeBlock language="text">{"timer"}</CodeBlock>);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      await Promise.resolve();
    });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });
});

function setClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}
