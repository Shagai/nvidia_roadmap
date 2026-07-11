/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportImportPanel } from "./ExportImportPanel";

const progressMocks = vi.hoisted(() => ({
  importProgress: vi.fn(),
  resetProgress: vi.fn(),
}));

vi.mock("../state/ProgressContext", () => ({
  useProgress: () => ({
    exportProgress: () => ({
      version: "2026.05.nvidia-learning-diary.v1",
      exportedAt: "2026-07-11T12:00:00.000Z",
      skills: {},
      roadmapProgress: {},
      diary: {},
      portfolio: {},
      theme: "light",
    }),
    importProgress: progressMocks.importProgress,
    resetProgress: progressMocks.resetProgress,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ExportImportPanel", () => {
  it("imports the generated JSON that is visibly present before the user edits it", () => {
    render(<ExportImportPanel />);

    expect(
      (screen.getByRole("textbox", { name: "Progress JSON" }) as HTMLTextAreaElement).value,
    ).toContain("2026.05.nvidia-learning-diary.v1");

    fireEvent.click(screen.getByRole("button", { name: "Import pasted JSON" }));

    expect(progressMocks.importProgress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Progress imported.");
  });

  it("keeps an intentionally cleared editor empty and reports invalid JSON", () => {
    render(<ExportImportPanel />);
    const editor = screen.getByRole("textbox", { name: "Progress JSON" });

    fireEvent.change(editor, { target: { value: "" } });
    expect(editor).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "Import pasted JSON" }));

    expect(progressMocks.importProgress).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Paste valid exported JSON");
  });
});
