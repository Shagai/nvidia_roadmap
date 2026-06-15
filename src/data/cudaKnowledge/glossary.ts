import type { CudaGlossaryItem } from "./types";

export const cudaGlossary: CudaGlossaryItem[] = [
  {
    term: "Host",
    meaning: "The CPU side of a CUDA application.",
    whenItMatters: "Owns orchestration, allocation calls, launch decisions, I/O, and most control flow.",
  },
  {
    term: "Device",
    meaning: "The GPU side where CUDA kernels execute.",
    whenItMatters: "Determines memory spaces, synchronization behavior, and performance limits.",
  },
  {
    term: "Kernel",
    meaning: "A device function launched from host code across many CUDA threads.",
    whenItMatters: "The basic unit timed by Nsight Compute and CUDA events.",
  },
  {
    term: "Grid",
    meaning: "The full set of blocks created by one kernel launch.",
    whenItMatters: "Defines total logical parallel work for a launch.",
  },
  {
    term: "Block",
    meaning: "A group of threads that can synchronize and share block-local shared memory.",
    whenItMatters: "Controls shared memory scope, __syncthreads boundaries, and part of occupancy.",
  },
  {
    term: "Thread",
    meaning: "One logical CUDA execution lane in a launched kernel.",
    whenItMatters: "Usually owns one output element or a small strided loop of elements.",
  },
  {
    term: "Warp",
    meaning: "A hardware scheduling group of CUDA threads, commonly 32 lanes.",
    whenItMatters: "Coalescing, divergence, and instruction efficiency are often warp-level concerns.",
  },
  {
    term: "SM",
    meaning: "Streaming multiprocessor, the GPU hardware unit that schedules and executes warps.",
    whenItMatters: "Occupancy, shared memory, registers, and warp scheduling are SM-resource questions.",
  },
  {
    term: "Occupancy",
    meaning: "A measure of active warps relative to the hardware's possible active warps.",
    whenItMatters: "Useful for latency hiding, but not a standalone performance target.",
  },
  {
    term: "Grid-Stride Loop",
    meaning: "A kernel loop where each thread processes indexes separated by blockDim.x * gridDim.x.",
    whenItMatters: "Useful when the launch uses a fixed number of blocks while still covering very large inputs.",
  },
  {
    term: "Dynamic Shared Memory",
    meaning: "Per-block shared memory requested through the third kernel launch parameter and addressed through extern __shared__ declarations.",
    whenItMatters: "Important for reductions, tiles, and kernels whose shared-memory size depends on the launch shape.",
  },
  {
    term: "Coalescing",
    meaning: "Efficient global-memory access when neighboring threads access neighboring addresses.",
    whenItMatters: "Often the difference between using memory bandwidth well and wasting transactions.",
  },
  {
    term: "Shared Memory",
    meaning: "Fast block-local memory explicitly managed by the kernel.",
    whenItMatters: "Helps when threads in a block reuse a tile of global data.",
  },
  {
    term: "Bank Conflict",
    meaning: "A shared-memory access pattern where lanes contend for the same memory bank.",
    whenItMatters: "Can reduce the benefit of shared memory in tiled kernels.",
  },
  {
    term: "Pinned Memory",
    meaning: "Page-locked host memory that can improve transfer behavior.",
    whenItMatters: "Useful for transfer experiments and overlap, but it should be used deliberately.",
  },
  {
    term: "Unified Memory",
    meaning: "A CUDA memory model where CPU and GPU can access a managed allocation.",
    whenItMatters: "Simplifies code, but performance still depends on migration, locality, and access pattern.",
  },
  {
    term: "Stream",
    meaning: "An ordered queue of CUDA operations.",
    whenItMatters: "Controls overlap, dependency ordering, and timeline readability.",
  },
  {
    term: "Event",
    meaning: "A CUDA object used for synchronization and GPU-side timing in stream order.",
    whenItMatters: "Preferred for measuring H2D, kernel, and D2H segments in CUDA experiments.",
  },
  {
    term: "Compute Capability",
    meaning: "A versioned hardware capability level for an NVIDIA GPU.",
    whenItMatters: "Controls available CUDA features, target architecture flags, and tuning assumptions.",
  },
  {
    term: "PTX",
    meaning: "NVIDIA's virtual GPU instruction-set representation.",
    whenItMatters: "Relevant for compilation, forward compatibility, and understanding what nvcc emits before final machine code.",
  },
  {
    term: "SASS",
    meaning: "GPU machine instructions generated for a specific architecture.",
    whenItMatters: "Advanced profiling and instruction-level analysis may inspect SASS.",
  },
  {
    term: "Collective",
    meaning: "A multi-GPU or distributed communication operation involving a group of participants.",
    whenItMatters: "NCCL all-reduce, reduce, broadcast, and related operations are core multi-GPU vocabulary.",
  },
];
