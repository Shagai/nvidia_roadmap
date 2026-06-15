import type { CudaStudyTrack } from "./types";

export const cudaStudyTracks: CudaStudyTrack[] = [
  {
    title: "Fundamentals Track",
    outcome: "Write correct kernels from scratch and explain launch geometry.",
    sequence: [
      "Mental Model",
      "Execution Model",
      "Memory And Data Movement",
      "Correctness And Debugging",
      "Start A CUDA Experiment workflow",
    ],
  },
  {
    title: "Performance Track",
    outcome: "Use measurements to improve one kernel and explain the bottleneck.",
    sequence: [
      "Measurement And Profiling",
      "Optimization Playbook",
      "Benchmark Honestly workflow",
      "Optimize With A Profiler workflow",
      "Nsight Compute source metrics",
    ],
  },
  {
    title: "Systems Track",
    outcome: "Build CUDA work into a reproducible project that another engineer can run.",
    sequence: [
      "Toolchain And Deployment",
      "Libraries And Ecosystem",
      "Portfolio Evidence",
      "Compatibility notes",
      "README and benchmark ledger",
    ],
  },
  {
    title: "Interview Track",
    outcome: "Turn CUDA projects into concise, evidence-backed explanations.",
    sequence: [
      "Grid/block/thread/warp explanation",
      "Kernel versus end-to-end timing",
      "Small input slowdown",
      "Coalescing and divergence",
      "Convert Learning Into Interview Material workflow",
    ],
  },
];
