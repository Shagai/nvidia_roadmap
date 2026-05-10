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

export type KnowledgeBlock = {
  title: string;
  body: string;
  checkpoints?: string[];
  code?: string;
};

export type PracticalLabProject = {
  title: string;
  purpose: string;
  projectBrief: string;
  steps: string[];
  measurements: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  stretchGoals?: string[];
  code?: string;
};

export type InterviewPromptAnswer = {
  prompt: string;
  shortAnswer: string;
  deepAnswer: string[];
  evidenceHook: string;
};

export type PortfolioEvidenceDetail = {
  title: string;
  artifact: string;
  proves: string;
  mustInclude: string[];
  doneWhen: string;
};

export type ReferenceLink = {
  label: string;
  url: string;
  note: string;
};

export type MonthKnowledge = {
  monthId: string;
  thesis: string;
  objectives: string[];
  coreIdeas: KnowledgeBlock[];
  labs: KnowledgeBlock[];
  pitfalls: string[];
  interviewPrompts: string[];
  portfolioEvidence: string[];
  diaryPrompts: string[];
  practicalProjects?: PracticalLabProject[];
  interviewAnswers?: InterviewPromptAnswer[];
  portfolioArtifacts?: PortfolioEvidenceDetail[];
  referenceLinks?: ReferenceLink[];
};
