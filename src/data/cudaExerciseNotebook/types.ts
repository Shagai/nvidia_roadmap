export type Exercise = {
  answer: string;
  code?: string;
  explanation?: string[];
  facts?: Array<{ label: string; value: string }>;
  question: string;
  title: string;
};

export type ExerciseSection = {
  id: string;
  title: string;
  exercises: Exercise[];
};
