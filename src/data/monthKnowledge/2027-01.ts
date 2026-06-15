import type { MonthKnowledge } from "../../types";

export const knowledge202701: MonthKnowledge = {
    monthId: "2027-01",
    thesis:
      "This month converts knowledge into technical-screen performance. The target is speed, clarity, and calm explanations under time pressure.",
    objectives: [
      "Build a repeatable algorithm practice cadence.",
      "Prepare C++ systems and concurrency answers with code.",
      "Practice CUDA explanations without notes.",
      "Track mistakes by category instead of only counting solved problems.",
    ],
    coreIdeas: [
      {
        title: "Problem pattern recognition",
        body:
          "Most interview problems reward recognizing patterns: two pointers, sliding window, prefix sums, hash maps, heaps, graph traversal, dynamic programming, and cache design.",
      },
      {
        title: "C++ correctness in interviews",
        body:
          "Use simple, correct C++ first. Explain ownership, invalidation, complexity, and edge cases. Avoid clever template machinery unless the problem asks for it.",
      },
      {
        title: "Concurrency problem framing",
        body:
          "For producer-consumer or thread-safe structures, define invariants before code: what state is protected, when threads block, how shutdown works, and what happens under spurious wakeups.",
      },
      {
        title: "Mistake log",
        body:
          "Track mistakes as pattern, bug, complexity miss, edge case, C++ syntax issue, or explanation issue. The log is the training signal.",
      },
    ],
    labs: [
      {
        title: "Weekly drill set",
        body:
          "Solve 4 algorithm problems, 2 C++ systems problems, 1 concurrency problem, and 1 CUDA explanation drill each week.",
      },
      {
        title: "LRU cache",
        body:
          "Implement LRU cache with a list and unordered_map. Explain iterator validity, complexity, and ownership.",
      },
      {
        title: "Thread-safe queue",
        body:
          "Write a bounded blocking queue on a whiteboard. Include shutdown semantics and explain condition-variable predicates.",
        code: `cv.wait(lock, [&] {
  return closed || !queue.empty();
});`,
      },
    ],
    pitfalls: [
      "Solving many problems without reviewing mistakes.",
      "Skipping edge cases aloud.",
      "Using advanced C++ where simple code would be clearer.",
      "Knowing CUDA concepts but not being able to explain them verbally.",
    ],
    interviewPrompts: [
      "Explain the tradeoff between unordered_map and map.",
      "Implement producer-consumer with shutdown.",
      "Explain memory ownership in a returned container.",
      "Explain blocks, threads, warps, and coalescing without notes.",
    ],
    portfolioEvidence: [
      "Mistake log with recurring themes.",
      "A small folder of clean C++ drill solutions.",
      "A written CUDA explanation sheet linked from the diary.",
    ],
    diaryPrompts: [
      "Which pattern did I miss this week?",
      "What bug did I repeat?",
      "Which explanation became clearer after practice?",
    ],
  };
