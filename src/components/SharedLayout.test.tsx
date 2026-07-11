/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import { lazy, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "../state/ProgressContext";
import { SharedLayout } from "./SharedLayout";

const storageValues = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return storageValues.size;
  },
  clear: () => storageValues.clear(),
  getItem: (key) => storageValues.get(key) ?? null,
  key: (index) => Array.from(storageValues.keys())[index] ?? null,
  removeItem: (key) => storageValues.delete(key),
  setItem: (key, value) => storageValues.set(key, value),
};

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: localStorageMock,
});

afterEach(() => {
  cleanup();
  localStorageMock.clear();
});

describe("SharedLayout", () => {
  it("keeps brand navigation inside the router and respects its basename", () => {
    renderShell(<p>Inner page</p>, <p>Home page</p>);

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");

    const brand = screen.getByRole("link", { name: "Preparing for NVIDIA" });
    expect(brand).toHaveAttribute("href", "/learning-path");

    fireEvent.click(brand);

    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("keeps the header available while announcing a lazy route load", () => {
    const PendingPage = lazy(() => new Promise<{ default: () => null }>(() => undefined));

    renderShell(<PendingPage />, <p>Home page</p>);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading page…");
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });
});

function renderShell(routeElement: ReactNode, homeElement: ReactNode) {
  return render(
    <MemoryRouter basename="/learning-path" initialEntries={["/learning-path/route"]}>
      <ProgressProvider>
        <Routes>
          <Route element={<SharedLayout />}>
            <Route index element={homeElement} />
            <Route path="route" element={routeElement} />
          </Route>
        </Routes>
      </ProgressProvider>
    </MemoryRouter>,
  );
}
