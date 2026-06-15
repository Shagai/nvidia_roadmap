import type { MonthKnowledge } from "../../types";

export const knowledge202607: MonthKnowledge = {
    monthId: "2026-07",
    thesis:
      "This month is the shift from CUDA syntax to performance engineering. The key habit is to identify the bottleneck before changing the code.",
    objectives: [
      "Explain memory coalescing, shared memory, occupancy, and bottlenecks.",
      "Use Nsight Compute to compare naive and optimized kernels.",
      "Optimize one kernel by at least 2x over a naive baseline.",
      "Write a performance narrative that connects measurement to code changes.",
    ],
    coreIdeas: [
      {
        title: "Coalesced global memory",
        body:
          "Coalescing means neighboring threads in a warp access neighboring memory addresses. When access is scattered or strided, the GPU may need more memory transactions, wasting bandwidth.",
        checkpoints: [
          "Map thread index to contiguous data where possible.",
          "Prefer structure-of-arrays when it improves contiguous access.",
          "Use profiler evidence rather than guessing.",
        ],
      },
      {
        title: "Shared memory",
        body:
          "Shared memory is a programmer-managed, block-local cache. It helps when neighboring threads reuse data, such as image stencils or tiled matrix operations. It can hurt if it adds synchronization without reuse.",
      },
      {
        title: "Occupancy is not the goal",
        body:
          "Occupancy estimates how many warps can be active on an SM. Higher occupancy can help hide latency, but maximum occupancy is not automatically maximum performance. Register pressure, shared memory use, memory bandwidth, and instruction mix all matter.",
      },
      {
        title: "Nsight Compute reading order",
        body:
          "Start with achieved occupancy, memory throughput, warp stalls, branch efficiency, and source counters. Ask whether the kernel is memory-bound, compute-bound, synchronization-bound, or launch/overhead-bound.",
      },
    ],
    labs: [
      {
        title: "Coalesced vs strided kernel",
        body:
          "Write two kernels that do the same arithmetic but use different memory access patterns. Benchmark both and capture profiler metrics.",
      },
      {
        title: "Shared-memory blur tile",
        body:
          "Optimize the blur kernel by loading a tile and halo into shared memory. Compare against the naive global-memory implementation.",
      },
      {
        title: "Performance write-up",
        body:
          "Write a short report: baseline, hypothesis, profiler evidence, optimization, result, and what still limits performance.",
        code: `Performance note structure:
1. Baseline timing and input size.
2. Profiler observation.
3. Hypothesis.
4. Code change.
5. New timing.
6. Remaining bottleneck.`,
      },
    ],
    pitfalls: [
      "Optimizing before measuring.",
      "Treating shared memory as always faster.",
      "Reporting speedup without input size, build type, or timing method.",
      "Chasing occupancy while ignoring memory throughput.",
    ],
    interviewPrompts: [
      "What is coalesced memory access and why does it matter?",
      "When does shared memory help?",
      "How would you decide whether a kernel is memory-bound or compute-bound?",
      "Why is occupancy not the only performance metric?",
    ],
    portfolioEvidence: [
      "Before/after benchmark table with at least one 2x improvement.",
      "Nsight Compute screenshots or exported metrics.",
      "A write-up explaining the limiting factor and the optimization.",
    ],
    diaryPrompts: [
      "Which metric surprised me?",
      "What did I think the bottleneck was before profiling?",
      "What still limits the optimized kernel?",
    ],
  };
