import type { MonthKnowledge } from "../../types";

export const knowledge202612: MonthKnowledge = {
    monthId: "2026-12",
    thesis:
      "This month turns private learning into public signal. A small, high-quality contribution with a reproducer can be more credible than a large unfinished side project.",
    objectives: [
      "Select an open-source target that matches the NVIDIA path.",
      "Learn how to reproduce, minimize, document, and communicate a technical issue.",
      "Submit either a merged PR, two strong issues, or a substantial forked demo.",
      "Make the public artifact easy for an engineer to inspect quickly.",
    ],
    coreIdeas: [
      {
        title: "Contribution types",
        body:
          "Useful contributions include bug fixes, docs improvements, reproducible issue reports, minimal failing examples, benchmark fixes, sample updates, and compatibility notes.",
      },
      {
        title: "Reproducer quality",
        body:
          "A good issue states environment, exact commands, expected behavior, actual behavior, logs, and a minimal input. It removes irrelevant complexity so maintainers can act.",
        codeLanguage: "text",
        code: `Issue structure:
Environment:
Steps to reproduce:
Expected:
Actual:
Minimal input:
Logs:
Bisect or suspected cause:
Workaround, if any:`,
      },
      {
        title: "PR hygiene",
        body:
          "Keep the diff small, follow project style, include tests or validation steps, explain the problem before the solution, and respond clearly to review.",
      },
    ],
    labs: [
      {
        title: "Repository shortlist",
        body:
          "Pick three possible repositories and score each by setup difficulty, issue quality, relevance, maintainer activity, and chance of a focused contribution.",
      },
      {
        title: "Minimal reproducer",
        body:
          "Before opening an issue or PR, create the smallest local case that demonstrates the behavior.",
      },
      {
        title: "Public artifact polish",
        body:
          "If a PR is unrealistic, create a forked demo with README, exact commands, screenshots, and a clear explanation of why it matters.",
      },
    ],
    pitfalls: [
      "Trying to contribute to a project before it builds locally.",
      "Opening vague issues without commands or environment details.",
      "Making a first PR too broad.",
      "Confusing public activity with public evidence.",
    ],
    interviewPrompts: [
      "How did you reduce the problem to a minimal reproducer?",
      "What did you learn from maintainer feedback?",
      "How do you decide whether a behavior is a bug, documentation gap, or unsupported use case?",
    ],
    portfolioEvidence: [
      "Merged PR, high-quality issue, or inspectable forked demo.",
      "Short portfolio note explaining the contribution and why it matters.",
      "Link from GitHub profile or project README.",
    ],
    diaryPrompts: [
      "Which repository was most approachable and why?",
      "What setup friction did I remove?",
      "What feedback changed my understanding?",
    ],
  };
