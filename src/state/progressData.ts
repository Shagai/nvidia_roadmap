import { portfolioProjects, roadmap, skills, storageVersion } from "../data/learningPlan";
import type {
  DiaryEntry,
  ExportedProgress,
  PortfolioProgress,
  PortfolioStatus,
} from "../types";

const diaryFields = ["notes", "learned", "confused", "links", "nextActions"] as const;
const portfolioStatuses = new Set<PortfolioStatus>(["not-started", "in-progress", "done"]);

type UnknownRecord = Record<string, unknown>;

export const blankDiaryEntry: DiaryEntry = {
  notes: "",
  learned: "",
  confused: "",
  links: "",
  nextActions: "",
};

export type ProgressImportResult =
  | { ok: true; value: ExportedProgress }
  | { ok: false; message: string };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPortfolioStatus(value: unknown): value is PortfolioStatus {
  return typeof value === "string" && portfolioStatuses.has(value as PortfolioStatus);
}

export function makeDefaultSkills(): Record<string, number> {
  return Object.fromEntries(skills.map((skill) => [skill.id, 0]));
}

export function makeDefaultDiary(): Record<string, DiaryEntry> {
  return Object.fromEntries(roadmap.map((month) => [month.id, { ...blankDiaryEntry }]));
}

export function makeDefaultPortfolio(): Record<string, PortfolioProgress> {
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

export function sanitizeSkills(value: unknown): Record<string, number> {
  const defaults = makeDefaultSkills();
  if (!isRecord(value)) return defaults;

  for (const skill of skills) {
    const raw = value[skill.id];
    defaults[skill.id] =
      typeof raw === "number" && Number.isFinite(raw) ? Math.min(5, Math.max(0, raw)) : 0;
  }
  return defaults;
}

export function sanitizeRoadmapProgress(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {};

  const sanitized: Record<string, boolean> = {};
  for (const month of roadmap) {
    for (const deliverable of month.deliverables) {
      const key = `${month.id}:${deliverable}`;
      if (typeof value[key] === "boolean") {
        sanitized[key] = value[key];
      }
    }
  }
  return sanitized;
}

export function sanitizeDiary(value: unknown): Record<string, DiaryEntry> {
  const defaults = makeDefaultDiary();
  if (!isRecord(value)) return defaults;

  for (const month of roadmap) {
    const existing = value[month.id];
    if (!isRecord(existing)) continue;

    const entry = { ...blankDiaryEntry };
    for (const field of diaryFields) {
      if (typeof existing[field] === "string") {
        entry[field] = existing[field];
      }
    }
    defaults[month.id] = entry;
  }
  return defaults;
}

export function sanitizePortfolio(value: unknown): Record<string, PortfolioProgress> {
  const defaults = makeDefaultPortfolio();
  if (!isRecord(value)) return defaults;

  for (const project of portfolioProjects) {
    const existing = value[project.id];
    if (!isRecord(existing)) continue;

    const checklist = { ...defaults[project.id].checklist };
    if (isRecord(existing.checklist)) {
      for (const item of project.checklist) {
        if (typeof existing.checklist[item] === "boolean") {
          checklist[item] = existing.checklist[item];
        }
      }
    }

    defaults[project.id] = {
      status: isPortfolioStatus(existing.status) ? existing.status : "not-started",
      checklist,
      notes: typeof existing.notes === "string" ? existing.notes : "",
    };
  }
  return defaults;
}

export function sanitizeTheme(value: unknown): "light" | "dark" {
  return value === "dark" ? "dark" : "light";
}

export function parseProgressImport(value: unknown): ProgressImportResult {
  if (!isRecord(value)) {
    return { ok: false, message: "Import failed. The backup must be a JSON object." };
  }

  if (value.version !== storageVersion) {
    return {
      ok: false,
      message: "Import failed. This backup version is not compatible with the current diary.",
    };
  }

  if (typeof value.exportedAt !== "string" || Number.isNaN(Date.parse(value.exportedAt))) {
    return { ok: false, message: "Import failed. The backup has an invalid export date." };
  }

  if (
    !isRecord(value.skills) ||
    !isRecord(value.roadmapProgress) ||
    !isRecord(value.diary) ||
    !isRecord(value.portfolio) ||
    (value.theme !== "light" && value.theme !== "dark")
  ) {
    return { ok: false, message: "Import failed. The backup is missing required progress data." };
  }

  if (!Object.values(value.skills).every((level) => typeof level === "number" && Number.isFinite(level))) {
    return { ok: false, message: "Import failed. Skill levels must be numbers." };
  }

  if (!Object.values(value.roadmapProgress).every((checked) => typeof checked === "boolean")) {
    return { ok: false, message: "Import failed. Roadmap progress must use true or false values." };
  }

  for (const entry of Object.values(value.diary)) {
    if (!isRecord(entry)) {
      return { ok: false, message: "Import failed. Diary entries must be objects." };
    }
    for (const field of diaryFields) {
      if (field in entry && typeof entry[field] !== "string") {
        return { ok: false, message: `Import failed. Diary field “${field}” must be text.` };
      }
    }
  }

  for (const project of Object.values(value.portfolio)) {
    if (!isRecord(project)) {
      return { ok: false, message: "Import failed. Portfolio entries must be objects." };
    }
    if ("status" in project && !isPortfolioStatus(project.status)) {
      return { ok: false, message: "Import failed. A portfolio item has an invalid status." };
    }
    if ("notes" in project && typeof project.notes !== "string") {
      return { ok: false, message: "Import failed. Portfolio notes must be text." };
    }
    if ("checklist" in project) {
      if (!isRecord(project.checklist)) {
        return { ok: false, message: "Import failed. Portfolio checklists must be objects." };
      }
      if (!Object.values(project.checklist).every((checked) => typeof checked === "boolean")) {
        return { ok: false, message: "Import failed. Portfolio checklist values must be true or false." };
      }
    }
  }

  return {
    ok: true,
    value: {
      version: storageVersion,
      exportedAt: value.exportedAt,
      skills: sanitizeSkills(value.skills),
      roadmapProgress: sanitizeRoadmapProgress(value.roadmapProgress),
      diary: sanitizeDiary(value.diary),
      portfolio: sanitizePortfolio(value.portfolio),
      theme: value.theme,
    },
  };
}
