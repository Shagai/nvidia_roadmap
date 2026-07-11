import { describe, expect, it } from "vitest";
import { portfolioProjects, roadmap, skills, storageVersion } from "../data/learningPlan";
import type { DiaryEntry } from "../types";
import { diaryCompletion } from "../utils/progress";
import {
  parseProgressImport,
  sanitizeDiary,
  sanitizePortfolio,
  sanitizeRoadmapProgress,
  sanitizeSkills,
} from "./progressData";

const firstSkill = skills[0];
const firstMonth = roadmap[0];
const firstProject = portfolioProjects[0];
const firstRoadmapKey = `${firstMonth.id}:${firstMonth.deliverables[0]}`;

function validBackup(overrides: Record<string, unknown> = {}) {
  return {
    version: storageVersion,
    exportedAt: "2026-07-11T12:00:00.000Z",
    skills: {},
    roadmapProgress: {},
    diary: {},
    portfolio: {},
    theme: "light",
    ...overrides,
  };
}

describe("persisted progress sanitizers", () => {
  it("defaults malformed storage values instead of trusting their runtime shape", () => {
    expect(sanitizeSkills(null)[firstSkill.id]).toBe(0);
    expect(sanitizeDiary({ [firstMonth.id]: { notes: 42, learned: "valid" } })[
      firstMonth.id
    ]).toMatchObject({ notes: "", learned: "valid" });
    expect(
      sanitizePortfolio({
        [firstProject.id]: {
          status: "shipped",
          checklist: { [firstProject.checklist[0]]: "yes" },
          notes: 17,
        },
      })[firstProject.id],
    ).toMatchObject({ status: "not-started", notes: "" });
  });

  it("clamps skill levels and keeps only known boolean roadmap items", () => {
    expect(sanitizeSkills({ [firstSkill.id]: 99 })[firstSkill.id]).toBe(5);
    expect(
      sanitizeRoadmapProgress({ [firstRoadmapKey]: true, unexpected: true, ignored: "yes" }),
    ).toEqual({ [firstRoadmapKey]: true });
  });

  it("keeps summary calculations defensive if malformed data reaches them", () => {
    const malformedDiary = {
      [firstMonth.id]: { notes: 17, learned: "a real note" },
    } as unknown as Record<string, DiaryEntry>;

    expect(diaryCompletion(malformedDiary).done).toBe(1);
  });
});

describe("progress import validation", () => {
  it("rejects non-object, incompatible, and malformed backups with useful messages", () => {
    expect(parseProgressImport(null)).toMatchObject({ ok: false });
    expect(parseProgressImport(validBackup({ version: "old-version" }))).toMatchObject({
      ok: false,
      message: expect.stringContaining("not compatible"),
    });
    expect(
      parseProgressImport(
        validBackup({ diary: { [firstMonth.id]: { notes: 42 } } }),
      ),
    ).toMatchObject({
      ok: false,
      message: expect.stringContaining("must be text"),
    });
  });

  it("accepts a compatible backup and returns normalized application data", () => {
    const result = parseProgressImport(
      validBackup({
        skills: { [firstSkill.id]: 7 },
        roadmapProgress: { [firstRoadmapKey]: true, unknown: false },
        diary: { [firstMonth.id]: { notes: "restored" } },
        portfolio: {
          [firstProject.id]: {
            status: "done",
            checklist: { [firstProject.checklist[0]]: true },
            notes: "evidence ready",
          },
        },
        theme: "dark",
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.skills[firstSkill.id]).toBe(5);
    expect(result.value.roadmapProgress).toEqual({ [firstRoadmapKey]: true });
    expect(result.value.diary[firstMonth.id].notes).toBe("restored");
    expect(result.value.portfolio[firstProject.id]).toMatchObject({
      status: "done",
      notes: "evidence ready",
    });
    expect(result.value.theme).toBe("dark");
  });
});
