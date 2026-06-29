import type { CudaOptimizationChecklistItem } from "./types";

export const cudaOptimizationChecklist: CudaOptimizationChecklistItem[] = [
  {
    optimization: "Maximizing occupancy",
    computeBenefit: "More resident work is available to hide pipeline latency.",
    memoryBenefit: "More parallel memory requests are available to hide DRAM latency.",
    explanationPath: "/cuda-kb/execution-model#occupancy",
    strategies: [
      "Tune SM resource use, including threads per block, shared memory per block, and registers per thread.",
    ],
  },
  {
    optimization: "Enabling coalesced global-memory accesses",
    computeBenefit: "Fewer pipeline stalls occur while waiting on global-memory accesses.",
    memoryBenefit: "Global-memory traffic falls and cache lines are used more effectively.",
    explanationPath: "/cuda-kb/execution-model#coalescing",
    strategies: [
      "Move data between global memory and shared memory in coalesced patterns.",
      "Rearrange the mapping from threads to data.",
      "Rearrange the data layout.",
    ],
  },
  {
    optimization: "Minimizing control divergence",
    computeBenefit: "SIMD efficiency improves because fewer lanes sit idle during divergent execution.",
    memoryBenefit: "No direct memory benefit.",
    explanationPath: "/cuda-kb/execution-model#divergence",
    strategies: [
      "Rearrange the mapping from threads to work or data.",
      "Rearrange the data layout.",
    ],
  },
  {
    optimization: "Tiling of reused data",
    computeBenefit: "Fewer pipeline stalls occur while waiting on global-memory accesses.",
    memoryBenefit: "Repeated global-memory traffic is reduced.",
    explanationPath: "/cuda-kb/kernels#tiling",
    strategies: [
      "Place reused data in shared memory or registers so it is transferred from global memory to the SM only once.",
    ],
  },
  {
    optimization: "Privatization",
    computeBenefit: "Fewer pipeline stalls occur while waiting for atomic updates.",
    memoryBenefit: "Contention and serialization around atomic updates are reduced.",
    explanationPath: "/cuda-kb/kernels#private-sum",
    strategies: [
      "Give each thread or block a private copy of the data, update the private copy, then combine the results.",
    ],
  },
  {
    optimization: "Thread coarsening",
    computeBenefit: "Redundant work, divergence, and synchronization can be reduced.",
    memoryBenefit: "Redundant global-memory traffic can be reduced.",
    explanationPath: "/cuda-kb/thread-coarsening",
    strategies: [
      "Assign multiple work units to each thread when the extra parallelism would mostly add overhead.",
    ],
  },
];
