import { Suspense, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useProgress } from "../state/ProgressContext";

const navItems = [
  { to: "/", label: "Overview", end: true },
  { to: "/why", label: "Why this path" },
  { to: "/knowledge", label: "Knowledge" },
  { to: "/cuda-kb", label: "CUDA KB" },
  { to: "/skill-map", label: "Skill map" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/cuda-lab", label: "CUDA lab" },
  { to: "/profiling-lab", label: "Profiling lab" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/diary", label: "Diary" },
  { to: "/interview-prep", label: "Interview" },
  { to: "/export", label: "Export" },
];

export function SharedLayout() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useProgress();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            NV
          </span>
          <span>Preparing for NVIDIA</span>
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((current) => !current)}
        >
          Menu
        </button>
        <nav id="primary-navigation" className={open ? "primary-nav is-open" : "primary-nav"}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-busy="true">
      <span className="route-loading-indicator" aria-hidden="true" />
      <span>Loading page…</span>
    </div>
  );
}
