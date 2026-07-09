import type { MonthKnowledge } from "../../types";

export const knowledge202704: MonthKnowledge = {
    monthId: "2027-04",
    thesis:
      "This month is final rehearsal. The goal is to explain all projects without notes, solve under time pressure, and discuss performance tradeoffs clearly.",
    objectives: [
      "Rehearse technical stories with situation, tradeoff, action, result, and lesson.",
      "Run mock interviews across C++, algorithms, system design, CUDA/performance, and behavioral topics.",
      "Close weak explanations in CUDA memory hierarchy, divergence, streams, TensorRT latency, and concurrency.",
      "Prepare concise project walkthroughs for recruiter, engineer, and hiring manager audiences.",
    ],
    coreIdeas: [
      {
        title: "Story structure",
        body:
          "A strong technical story has context, constraint, decision, tradeoff, measured result, and reflection. Avoid chronological wandering. Lead with the engineering problem.",
      },
      {
        title: "Project walkthrough",
        body:
          "Every portfolio project needs a two-minute version and a ten-minute version. The short version states the problem, architecture, bottleneck, and result. The long version can go into code, profiling, and failures.",
      },
      {
        title: "Performance explanation",
        body:
          "For CUDA and pipeline questions, speak in terms of memory access, occupancy, divergence, synchronization, transfer costs, batching, queueing, and measurement methodology.",
      },
      {
        title: "Behavioral alignment",
        body:
          "Behavioral answers should still sound like engineering. Show how you debug, communicate tradeoffs, handle ambiguity, and learn from mistakes.",
      },
    ],
    labs: [
      {
        title: "Mock interview schedule",
        body:
          "Complete 4 C++ interviews, 4 algorithms interviews, 3 system design interviews, 3 CUDA/performance interviews, and 2 behavioral interviews.",
      },
      {
        title: "Project whiteboard",
        body:
          "Draw each project architecture from memory. Include data flow, CPU/GPU boundary, bottleneck, and what you would improve next.",
      },
      {
        title: "Explanation speed drill",
        body:
          "Answer each core CUDA/performance topic in 90 seconds, then again in 5 minutes with deeper tradeoffs.",
        codeLanguage: "text",
        code: `90-second answer:
1. Definition.
2. Why it matters.
3. Example from my project.
4. Measurement or tradeoff.`,
      },
    ],
    pitfalls: [
      "Only practicing coding and neglecting project storytelling.",
      "Overexplaining background before reaching the tradeoff.",
      "Claiming expertise where the artifact is weak.",
      "Not rehearsing failure stories and debugging stories.",
    ],
    interviewPrompts: [
      "Explain warp divergence and how it can affect performance.",
      "How did you profile your GPU pipeline?",
      "Tell me about the hardest C++ bug you fixed.",
      "Design a real-time perception pipeline and name the bottlenecks.",
      "When would you choose a mutex queue over a lock-free queue?",
    ],
    portfolioEvidence: [
      "Rehearsed story notes for six technical stories.",
      "Mock interview feedback log.",
      "Final project walkthrough notes.",
      "A readiness checklist before applications or interviews.",
    ],
    diaryPrompts: [
      "Which answer still sounds vague?",
      "What question caused the longest pause?",
      "What project detail should I refresh before interviews?",
    ],
  };
