export type MonthPlan = {
  id: string;
  month: string;
  title: string;
  goal: string;
  tags: string[];
  topics: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
};

export type Skill = {
  id: string;
  label: string;
  category: string;
  weight: number;
};

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  checklist: string[];
};

export type DiaryEntry = {
  notes: string;
  learned: string;
  confused: string;
  links: string;
  nextActions: string;
};

export type PortfolioStatus = "not-started" | "in-progress" | "done";

export type PortfolioProgress = {
  status: PortfolioStatus;
  checklist: Record<string, boolean>;
  notes: string;
};

export type ExportedProgress = {
  version: string;
  exportedAt: string;
  skills: Record<string, number>;
  roadmapProgress: Record<string, boolean>;
  diary: Record<string, DiaryEntry>;
  portfolio: Record<string, PortfolioProgress>;
  theme: "light" | "dark";
};
