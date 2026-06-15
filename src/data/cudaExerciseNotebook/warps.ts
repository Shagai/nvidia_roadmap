import type { Exercise } from "./types";

export const warpExercises: Exercise[] = [
  {
    title: "Exercise 18 - Warps per block and grid",
    question: "Given N = 1024 and block size = 128 threads, how many blocks, warps per block, and total warps are launched?",
    answer: "8 blocks, 4 warps per block, and 32 warps in the grid.",
    facts: [
      { label: "Blocks", value: "(1024 + 128 - 1) / 128 = 8" },
      { label: "Warps per block", value: "128 / 32 = 4" },
      { label: "Total warps", value: "8 * 4 = 32" },
    ],
  },
  {
    title: "Exercise 19 - Divergence for threadIdx.x < 40 || threadIdx.x >= 104",
    question:
      "For a 128-thread block and line 04 executing only when threadIdx.x < 40 || threadIdx.x >= 104, how many active and divergent warps are there in the grid?",
    answer: "24 active warps and 16 divergent warps.",
    explanation: [
      "Per block, warp 0 is fully active, warp 1 is partially active for lanes 32-39, warp 2 is inactive, and warp 3 is partially active for lanes 104-127.",
      "That gives 3 active warps per block and 2 divergent warps per block.",
      "Across 8 blocks, that is 24 active warps and 16 divergent warps.",
    ],
  },
  {
    title: "Exercise 20 - SIMD efficiency for line 04",
    question:
      "For line 04 in block 0, what is the SIMD efficiency of warp 0, warp 1, and warp 3?",
    answer: "Warp 0 = 100%, warp 1 = 25%, warp 3 = 75%.",
    facts: [
      { label: "Warp 0", value: "Threads 0-31 all execute: 32 / 32 = 100%" },
      { label: "Warp 1", value: "Threads 32-39 execute: 8 / 32 = 25%" },
      { label: "Warp 3", value: "Threads 104-127 execute: 24 / 32 = 75%" },
    ],
  },
  {
    title: "Exercise 21 - Divergence for i % 2 == 0",
    question:
      "For line 07 executing only when i % 2 == 0, how many active warps, divergent warps, and what SIMD efficiency does each warp have?",
    answer: "32 active warps, 32 divergent warps, and 50% SIMD efficiency.",
    explanation: [
      "Every warp contains even and odd indices.",
      "Only the even lanes execute, so every warp is active and every warp diverges.",
      "Half of each warp executes the statement: 16 / 32 = 50%.",
    ],
  },
  {
    title: "Exercise 22 - Loop divergence for j < 5 - (i % 3)",
    question:
      "For the loop for (unsigned int j = 0; j < 5 - (i % 3); ++j), how many iterations execute without divergence and how many have divergence?",
    answer: "3 iterations without divergence and 2 iterations with divergence.",
    explanation: [
      "If i % 3 == 0, the thread runs 5 iterations.",
      "If i % 3 == 1, the thread runs 4 iterations.",
      "If i % 3 == 2, the thread runs 3 iterations.",
      "Iterations j = 0, 1, and 2 execute for everyone. Iterations j = 3 and 4 execute only for some lanes.",
    ],
  },
];
