import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { portfolioProjects, roadmap, skills, storageVersion } from "../data/learningPlan";
import type { DiaryEntry, ExportedProgress, PortfolioProgress, PortfolioStatus } from "../types";

const storageKeys = {
  skills: "nvidia-plan-skills",
  roadmap: "nvidia-plan-roadmap-progress",
  diary: "nvidia-plan-diary",
  portfolio: "nvidia-plan-portfolio",
  theme: "nvidia-plan-theme",
  version: "nvidia-plan-version",
} as const;

const blankDiaryEntry: DiaryEntry = {
  notes: "",
  learned: "",
  confused: "",
  links: "",
  nextActions: "",
};

type ProgressContextValue = {
  skillLevels: Record<string, number>;
  setSkillLevel: (id: string, value: number) => void;
  roadmapProgress: Record<string, boolean>;
  setRoadmapItem: (key: string, checked: boolean) => void;
  diary: Record<string, DiaryEntry>;
  setDiaryEntry: (monthId: string, entry: DiaryEntry) => void;
  portfolio: Record<string, PortfolioProgress>;
  setPortfolioStatus: (projectId: string, status: PortfolioStatus) => void;
  setPortfolioChecklistItem: (projectId: string, item: string, checked: boolean) => void;
  setPortfolioNotes: (projectId: string, notes: string) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  exportProgress: () => ExportedProgress;
  importProgress: (payload: ExportedProgress) => void;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeDefaultSkills() {
  return Object.fromEntries(skills.map((skill) => [skill.id, 0]));
}

function makeDefaultDiary() {
  return Object.fromEntries(roadmap.map((month) => [month.id, blankDiaryEntry]));
}

function makeDefaultPortfolio() {
  return Object.fromEntries(
    portfolioProjects.map((project) => [
      project.id,
      {
        status: "not-started" as PortfolioStatus,
        checklist: Object.fromEntries(project.checklist.map((item) => [item, false])),
        notes: "",
      },
    ]),
  );
}

function sanitizeSkills(value: Record<string, number>) {
  const defaults = makeDefaultSkills();
  for (const skill of skills) {
    const raw = Number(value[skill.id] ?? 0);
    defaults[skill.id] = Number.isFinite(raw) ? Math.min(5, Math.max(0, raw)) : 0;
  }
  return defaults;
}

function sanitizeDiary(value: Record<string, DiaryEntry>) {
  const defaults = makeDefaultDiary();
  for (const month of roadmap) {
    defaults[month.id] = {
      ...blankDiaryEntry,
      ...(value[month.id] ?? {}),
    };
  }
  return defaults;
}

function sanitizePortfolio(value: Record<string, PortfolioProgress>) {
  const defaults = makeDefaultPortfolio();
  for (const project of portfolioProjects) {
    const existing = value[project.id];
    defaults[project.id] = {
      status: existing?.status ?? "not-started",
      checklist: {
        ...defaults[project.id].checklist,
        ...(existing?.checklist ?? {}),
      },
      notes: existing?.notes ?? "",
    };
  }
  return defaults;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>(() =>
    sanitizeSkills(readJson(storageKeys.skills, makeDefaultSkills())),
  );
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, boolean>>(() =>
    readJson(storageKeys.roadmap, {}),
  );
  const [diary, setDiary] = useState<Record<string, DiaryEntry>>(() =>
    sanitizeDiary(readJson(storageKeys.diary, makeDefaultDiary())),
  );
  const [portfolio, setPortfolio] = useState<Record<string, PortfolioProgress>>(() =>
    sanitizePortfolio(readJson(storageKeys.portfolio, makeDefaultPortfolio())),
  );
  const [theme, setThemeState] = useState<"light" | "dark">(() =>
    readJson(storageKeys.theme, "light"),
  );

  useEffect(() => writeJson(storageKeys.skills, skillLevels), [skillLevels]);
  useEffect(() => writeJson(storageKeys.roadmap, roadmapProgress), [roadmapProgress]);
  useEffect(() => writeJson(storageKeys.diary, diary), [diary]);
  useEffect(() => writeJson(storageKeys.portfolio, portfolio), [portfolio]);
  useEffect(() => writeJson(storageKeys.theme, theme), [theme]);
  useEffect(() => {
    window.localStorage.setItem(storageKeys.version, storageVersion);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      skillLevels,
      setSkillLevel: (id, value) => {
        setSkillLevels((current) => ({
          ...current,
          [id]: Math.min(5, Math.max(0, value)),
        }));
      },
      roadmapProgress,
      setRoadmapItem: (key, checked) => {
        setRoadmapProgress((current) => ({ ...current, [key]: checked }));
      },
      diary,
      setDiaryEntry: (monthId, entry) => {
        setDiary((current) => ({
          ...current,
          [monthId]: entry,
        }));
      },
      portfolio,
      setPortfolioStatus: (projectId, status) => {
        setPortfolio((current) => ({
          ...current,
          [projectId]: { ...current[projectId], status },
        }));
      },
      setPortfolioChecklistItem: (projectId, item, checked) => {
        setPortfolio((current) => ({
          ...current,
          [projectId]: {
            ...current[projectId],
            checklist: { ...current[projectId].checklist, [item]: checked },
          },
        }));
      },
      setPortfolioNotes: (projectId, notes) => {
        setPortfolio((current) => ({
          ...current,
          [projectId]: { ...current[projectId], notes },
        }));
      },
      theme,
      setTheme: setThemeState,
      exportProgress: () => ({
        version: storageVersion,
        exportedAt: new Date().toISOString(),
        skills: skillLevels,
        roadmapProgress,
        diary,
        portfolio,
        theme,
      }),
      importProgress: (payload) => {
        setSkillLevels(sanitizeSkills(payload.skills ?? {}));
        setRoadmapProgress(payload.roadmapProgress ?? {});
        setDiary(sanitizeDiary(payload.diary ?? {}));
        setPortfolio(sanitizePortfolio(payload.portfolio ?? {}));
        setThemeState(payload.theme === "dark" ? "dark" : "light");
      },
      resetProgress: () => {
        setSkillLevels(makeDefaultSkills());
        setRoadmapProgress({});
        setDiary(makeDefaultDiary());
        setPortfolio(makeDefaultPortfolio());
        setThemeState("light");
      },
    }),
    [diary, portfolio, roadmapProgress, skillLevels, theme],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }
  return context;
}
