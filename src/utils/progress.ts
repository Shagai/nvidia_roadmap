import { portfolioProjects, roadmap, skills } from "../data/plan";
import type { DiaryEntry, PortfolioProgress } from "../types";

export function roadmapItemKey(monthId: string, deliverable: string) {
  return `${monthId}:${deliverable}`;
}

export function readinessScore(skillLevels: Record<string, number>) {
  const totalWeight = skills.reduce((sum, skill) => sum + skill.weight, 0);
  const weighted = skills.reduce((sum, skill) => {
    return sum + (skillLevels[skill.id] ?? 0) * skill.weight;
  }, 0);

  return Math.round((weighted / (totalWeight * 5)) * 100);
}

export function roadmapCompletion(roadmapProgress: Record<string, boolean>) {
  const total = roadmap.reduce((sum, month) => sum + month.deliverables.length, 0);
  const done = roadmap.reduce((sum, month) => {
    return (
      sum +
      month.deliverables.filter((deliverable) =>
        Boolean(roadmapProgress[roadmapItemKey(month.id, deliverable)]),
      ).length
    );
  }, 0);

  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function portfolioCompletion(portfolio: Record<string, PortfolioProgress>) {
  const done = portfolioProjects.filter((project) => portfolio[project.id]?.status === "done").length;
  const checklistItems = portfolioProjects.flatMap((project) =>
    project.checklist.map((item) => ({ projectId: project.id, item })),
  );
  const checklistDone = checklistItems.filter(({ projectId, item }) =>
    Boolean(portfolio[projectId]?.checklist[item]),
  ).length;

  return {
    done,
    total: portfolioProjects.length,
    checklistDone,
    checklistTotal: checklistItems.length,
  };
}

export function diaryCompletion(diary: Record<string, DiaryEntry>) {
  const monthsWithNotes = roadmap.filter((month) => {
    const entry = diary[month.id];
    return entry && Object.values(entry).some((value) => value.trim().length > 0);
  }).length;

  return {
    done: monthsWithNotes,
    total: roadmap.length,
    percent: Math.round((monthsWithNotes / roadmap.length) * 100),
  };
}
