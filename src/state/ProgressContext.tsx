import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { storageVersion } from "../data/learningPlan";
import type { DiaryEntry, ExportedProgress, PortfolioProgress, PortfolioStatus } from "../types";
import {
  makeDefaultDiary,
  makeDefaultPortfolio,
  makeDefaultSkills,
  sanitizeDiary,
  sanitizePortfolio,
  sanitizeRoadmapProgress,
  sanitizeSkills,
  sanitizeTheme,
} from "./progressData";

const storageKeys = {
  skills: "nvidia-plan-skills",
  roadmap: "nvidia-plan-roadmap-progress",
  diary: "nvidia-plan-diary",
  portfolio: "nvidia-plan-portfolio",
  theme: "nvidia-plan-theme",
  version: "nvidia-plan-version",
} as const;

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

function readJson(key: string, fallback: unknown): unknown {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing or when a quota is exhausted.
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>(() =>
    sanitizeSkills(readJson(storageKeys.skills, makeDefaultSkills())),
  );
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, boolean>>(() =>
    sanitizeRoadmapProgress(readJson(storageKeys.roadmap, {})),
  );
  const [diary, setDiary] = useState<Record<string, DiaryEntry>>(() =>
    sanitizeDiary(readJson(storageKeys.diary, makeDefaultDiary())),
  );
  const [portfolio, setPortfolio] = useState<Record<string, PortfolioProgress>>(() =>
    sanitizePortfolio(readJson(storageKeys.portfolio, makeDefaultPortfolio())),
  );
  const [theme, setThemeState] = useState<"light" | "dark">(() =>
    sanitizeTheme(readJson(storageKeys.theme, "light")),
  );

  useEffect(() => writeJson(storageKeys.skills, skillLevels), [skillLevels]);
  useEffect(() => writeJson(storageKeys.roadmap, roadmapProgress), [roadmapProgress]);
  useEffect(() => writeJson(storageKeys.diary, diary), [diary]);
  useEffect(() => writeJson(storageKeys.portfolio, portfolio), [portfolio]);
  useEffect(() => writeJson(storageKeys.theme, theme), [theme]);
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKeys.version, storageVersion);
    } catch {
      // Keep the in-memory app usable even when localStorage is unavailable.
    }
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
        setSkillLevels(sanitizeSkills(payload.skills));
        setRoadmapProgress(sanitizeRoadmapProgress(payload.roadmapProgress));
        setDiary(sanitizeDiary(payload.diary));
        setPortfolio(sanitizePortfolio(payload.portfolio));
        setThemeState(sanitizeTheme(payload.theme));
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
