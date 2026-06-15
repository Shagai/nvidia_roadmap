import type { MonthKnowledge } from "../../types";

export const knowledge202605: MonthKnowledge = {
    monthId: "2026-05",
    thesis:
      "This month is about turning a broad ambition into a credible target profile. The output is not code yet; it is positioning, evidence design, and a requirements map.",
    objectives: [
      "Translate NVIDIA job descriptions into repeated skill signals.",
      "Choose a primary target track and a secondary reinforcing track.",
      "Rewrite the public profile around C++ systems, CUDA, profiling, robotics, and vision.",
      "Start a preparation log that records decisions, not just study notes.",
    ],
    coreIdeas: [
      {
        title: "Role mining",
        body:
          "Read job descriptions as data. Extract repeated nouns, verbs, tools, and evidence words. A systems CUDA role usually rewards phrases like performance analysis, profiling, memory bandwidth, concurrent systems, Linux, debugging, and production-quality C++.",
        checkpoints: [
          "Separate required skills from nice-to-have skills.",
          "Track which requirements repeat across at least 3 roles.",
          "Mark which requirements can be proven by a portfolio artifact.",
        ],
      },
      {
        title: "Profile thesis",
        body:
          "The thesis should be short enough to fit in a CV headline: C++ systems engineer building CUDA and robotics/vision performance projects. This prevents the year from dissolving into generic AI study.",
        checkpoints: [
          "Primary track: GPU systems / CUDA.",
          "Secondary track: robotics / vision / edge AI.",
          "Avoid claiming deep ML research unless the artifacts support it.",
        ],
      },
      {
        title: "Evidence-first planning",
        body:
          "Every skill should eventually map to something inspectable: a benchmark table, an architecture diagram, a README, a bug report, a profiling trace, or a technical write-up.",
      },
    ],
    labs: [
      {
        title: "Requirements matrix",
        body:
          "Create a table with 10 target roles as rows and repeated requirements as columns. Put a confidence score beside each skill: already strong, learn, prove publicly, or ignore for now.",
      },
      {
        title: "CV headline rewrite",
        body:
          "Write three headline variants and pick the most specific one. Prefer a headline that names C++, CUDA, robotics/vision, and performance engineering.",
      },
      {
        title: "Preparation log template",
        body:
          "Use a weekly Markdown template with sections for experiment, benchmark, confusion, reading, artifact, and next action.",
        code: `# Week N

## Experiment
What did I build or measure?

## Result
What changed numerically or conceptually?

## Confusion
What still feels unclear?

## Artifact
What can someone inspect?

## Next action
What is the next concrete step?`,
      },
    ],
    pitfalls: [
      "Choosing too many target roles and making the profile vague.",
      "Optimizing LinkedIn wording before knowing what the portfolio will prove.",
      "Treating job descriptions as wish lists instead of prioritization data.",
    ],
    interviewPrompts: [
      "What NVIDIA role family am I targeting and why does my background fit it?",
      "What is the difference between knowing CUDA syntax and being useful on a GPU performance team?",
      "Which public artifact will prove the strongest part of my profile?",
    ],
    portfolioEvidence: [
      "A target-role requirements matrix.",
      "A revised CV headline and profile summary.",
      "A GitHub README or profile note that frames the year of projects.",
    ],
    diaryPrompts: [
      "Which requirements repeat most often?",
      "What part of my current background is already a strong signal?",
      "What would make my profile inspectable in five minutes?",
    ],
  };
