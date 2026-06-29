export type CudaKnowledgeSource = {
  id: string;
  label: string;
  url: string;
  scope: string;
  checked: string;
};

export type CudaKnowledgePillar = {
  id: string;
  title: string;
  guidingQuestion: string;
  summary: string;
  know: string[];
  practice: string[];
  traps: string[];
  sourceIds: string[];
  deepDivePath?: string;
};

export type CudaWorkflow = {
  title: string;
  purpose: string;
  steps: string[];
  evidence: string[];
};

export type CudaCommand = {
  command: string;
  use: string;
  proof: string;
};

export type CudaOptimizationChecklistItem = {
  optimization: string;
  computeBenefit: string;
  memoryBenefit: string;
  strategies: string[];
  explanationPath: string;
};

export type CudaGlossaryItem = {
  term: string;
  meaning: string;
  whenItMatters: string;
  explanationPath: string;
};

export type CudaStudyTrack = {
  title: string;
  outcome: string;
  sequence: string[];
};

export type CudaMentalModelKnowSection = {
  title: string;
  thesis: string;
  details: string[];
  diagnostic: string;
};

export type CudaMentalModelPractice = {
  title: string;
  purpose: string;
  steps: string[];
  evidence: string[];
};

export type CudaMentalModelTrap = {
  title: string;
  symptom: string;
  whyItHappens: string;
  correction: string[];
  deepDivePath?: string;
};

export type CudaMentalModelTrapDeepDiveSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  code?: string;
};

export type CudaMentalModelTrapDeepDive = {
  slug: string;
  title: string;
  summary: string;
  trapTitle: string;
  sections: CudaMentalModelTrapDeepDiveSection[];
  sourceIds: string[];
};

export type CudaMentalModelInterviewAnswer = {
  prompt: string;
  shortAnswer: string;
  deepAnswer: string[];
  evidenceToCollect: string;
};

export type CudaMentalModelGuide = {
  title: string;
  summary: string;
  know: CudaMentalModelKnowSection[];
  practice: CudaMentalModelPractice[];
  traps: CudaMentalModelTrap[];
  interviewAnswers: CudaMentalModelInterviewAnswer[];
  sourceIds: string[];
};
