import type { CudaMentalModelTrapDeepDive } from "../types";

export const launchGeometryUtilizationDeepDive: CudaMentalModelTrapDeepDive = {
    slug: "launch-geometry-utilization",
    title: "Launch Geometry Is Not Hardware Utilization",
    trapTitle: "Launch geometry confused with hardware utilization",
    summary:
      "Grid and block dimensions prove coverage. They do not prove that memory access is efficient, warps are active, occupancy is useful, or the SMs are spending time on productive work.",
    sourceIds: [
      "programming-guide",
      "programming-guide-compute-capabilities",
      "best-practices",
      "runtime-api-occupancy",
      "nsight-compute",
    ],
    sections: [
      {
        title: "What the mistake looks like",
        paragraphs: [
          "The launch looks big enough, so it is assumed to use the GPU well. For example, a grid may contain many blocks and a block may contain 256 threads, but performance is still poor.",
          "The launch configuration answers how many logical threads exist. It does not answer whether those threads access memory efficiently, avoid divergence, use resources well, or keep SMs busy with useful work.",
        ],
        codeLanguage: "cuda",
        code: `int block = 256;
int grid = (n + block - 1) / block;
kernel<<<grid, block>>>(...);

// This proves coverage when the indexing and guard are correct.
// It does not prove high bandwidth, high occupancy, or good scheduling behavior.`,
      },
      {
        title: "What launch geometry proves",
        paragraphs: [
          "Launch geometry is still important. It proves that the kernel has enough logical workers to cover the problem and that the indexing math can map each worker to the correct output.",
        ],
        bullets: [
          "Grid size tells you how many blocks were launched.",
          "Block size tells you how many threads each block contains.",
          "Ceiling division plus a bounds guard handles non-divisible problem sizes.",
          "For correctness, record useful threads, launched threads, and guard threads.",
        ],
      },
      {
        title: "What launch geometry does not prove",
        paragraphs: [
          "After coverage is correct, the performance story moves to hardware behavior. That requires measurement and profiler evidence.",
        ],
        bullets: [
          "Adjacent lanes may not access adjacent memory addresses.",
          "Warps may diverge on branch paths.",
          "Register or shared-memory use may reduce resident blocks.",
          "High occupancy may still be limited by memory throughput or instruction mix.",
          "A large grid may still suffer from small per-thread work, bad locality, or excessive synchronization.",
        ],
      },
      {
        title: "Better diagnostic loop",
        paragraphs: [
          "Use the launch calculation to make the kernel correct, then use timing and profiler metrics to explain performance.",
        ],
        codeLanguage: "cuda",
        code: `// Coverage ledger:
useful_elements  = n;
threads_per_block = 256;
grid_blocks = ceil(n / threads_per_block);
launched_threads = grid_blocks * threads_per_block;
guard_threads = launched_threads - useful_elements;

// Performance ledger:
// achieved occupancy = ?
// memory throughput = ?
// registers per thread = ?
// shared memory per block = ?
// dominant stall reason = ?
// branch divergence = ?
// global memory coalescing = ?`,
      },
      {
        title: "Short version",
        paragraphs: [
          "Wrong mental model: a large launch means the GPU is efficiently used.",
          "Correct mental model: launch geometry proves coverage; profiler evidence explains utilization.",
        ],
      },
    ],
  };
