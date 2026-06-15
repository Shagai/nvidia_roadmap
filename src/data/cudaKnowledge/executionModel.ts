export const sharedExplanationSources = [
  {
    id: "chatgpt-thread-divergence",
    label: "ChatGPT share: Thread Divergence in CUDA",
    url: "https://chatgpt.com/share/6a300586-5dfc-83eb-b328-4120004d4fc2",
    scope: "User-shared explanation used for the thread-divergence notes and visual model.",
    checked: "2026-06-15",
  },
  {
    id: "chatgpt-warp-scheduling",
    label: "ChatGPT share: Warp Scheduling and Latency",
    url: "https://chatgpt.com/share/6a30089d-1fd4-83eb-a09c-0cc5286ff763",
    scope: "User-shared explanation used for the warp-scheduling and latency-tolerance notes.",
    checked: "2026-06-15",
  },
];

export const firstChoices = [
  {
    kernel: "Simple 1D element-wise",
    choice: "128 or 256",
    reason: "Low register pressure and usually memory-bound; coverage and coalescing matter first.",
  },
  {
    kernel: "Memory copy / transform",
    choice: "256",
    reason: "Bandwidth and adjacent-thread access dominate more than exotic launch shapes.",
  },
  {
    kernel: "2D image / matrix element-wise",
    choice: "16x16 or 32x8",
    reason: "Both launch 256 threads; 32x8 keeps threadIdx.x aligned with row-major memory.",
  },
  {
    kernel: "3D volume / stencil",
    choice: "8x8x4 or 8x8x8",
    reason: "Balance locality, halo reads, shared-memory tile size, and occupancy.",
  },
  {
    kernel: "Reduction",
    choice: "256 or 512",
    reason: "More threads can help per-block reduction work, but shared memory and registers decide fit.",
  },
  {
    kernel: "Scan, histogram, sort-like",
    choice: "128, 256, or library",
    reason: "Algorithm details dominate; prefer CUB or Thrust unless the goal is learning.",
  },
  {
    kernel: "Tiled matrix multiply",
    choice: "16x16 beginner tile",
    reason: "A clear baseline where one block owns one output tile and shared memory is visible.",
  },
  {
    kernel: "Tensor Core GEMM",
    choice: "cuBLAS or CUTLASS",
    reason: "The best launch shapes are architecture-specific and already encoded in mature libraries.",
  },
  {
    kernel: "Register-heavy",
    choice: "64 or 128",
    reason: "Smaller blocks may leave enough register file for more resident blocks.",
  },
  {
    kernel: "Shared-memory-heavy",
    choice: "Tile-determined",
    reason: "A larger tile can be faster even when occupancy is lower.",
  },
];

export const generationGuidance = [
  {
    architecture: "Turing, CC 7.5",
    examples: "T4, RTX 20",
    advice: "Start with 128 or 256. Avoid very tiny blocks unless the kernel has a specific reason.",
  },
  {
    architecture: "Ampere data center, CC 8.0",
    examples: "A100, A30",
    advice: "256 is a strong default; compare 512 for reductions or heavy streaming kernels.",
  },
  {
    architecture: "Ampere workstation / consumer, CC 8.6",
    examples: "RTX 30, A40, A10",
    advice: "Try 128, 256, and 512. Treat 1024 as a measured choice, not a default.",
  },
  {
    architecture: "Ada, CC 8.9",
    examples: "RTX 40, L4, L40/L40S",
    advice: "Use the same ordinary launch logic: 256 first, then benchmark nearby powers of two.",
  },
  {
    architecture: "Hopper, CC 9.0",
    examples: "H100, H200, GH200",
    advice: "Normal kernels still start well at 256; advanced kernels may depend more on clusters, TMA, and Tensor Cores.",
  },
  {
    architecture: "Blackwell data center, CC 10.x",
    examples: "B200, GB200, B300, GB300",
    advice: "Generic kernels still benchmark 128/256/512; GEMM and AI kernels should start from cuBLAS or CUTLASS.",
  },
  {
    architecture: "Blackwell workstation / consumer, CC 12.x",
    examples: "RTX 50, RTX PRO Blackwell",
    advice: "Start with 256, compare 128 and 512, and avoid assuming the maximum block size is best.",
  },
];

export const executionKnowSections = [
  {
    title: "Launch geometry is the logical work shape",
    thesis:
      "Grid and block dimensions define how much logical CUDA work exists before the hardware scheduler starts assigning blocks to SMs.",
    details: [
      "The grid is the full set of blocks created by one kernel launch.",
      "A block is a group of threads that can cooperate through shared memory and block-level synchronization.",
      "The launch shape must cover the data shape, but it does not by itself prove the kernel is fast.",
      "For a simple 1D kernel, the first accounting line is useful elements, launched threads, and guard threads.",
    ],
    diagnostic:
      "Before running the kernel, calculate grid blocks, total launched threads, useful threads, and the final block's guard threads.",
  },
  {
    title: "Indexing is the correctness contract",
    thesis:
      "blockIdx, blockDim, and threadIdx are the first CUDA built-ins to master because they decide which data each thread owns.",
    details: [
      "For 1D data, the standard index is blockIdx.x * blockDim.x + threadIdx.x.",
      "For row-major 2D data, x should usually come from threadIdx.x so adjacent lanes touch adjacent addresses.",
      "Ceiling division intentionally launches extra threads; the bounds guard is part of the contract.",
      "Correctness tests should include sizes that are not divisible by the chosen block size.",
    ],
    diagnostic:
      "If a kernel is wrong, inspect the global index formula and boundary guard before changing performance code.",
  },
  {
    title: "Warps make hardware behavior visible",
    thesis:
      "CUDA exposes threads, but hardware schedules them in warps. That is where coalescing, inactive lanes, and branch divergence become visible.",
    details: [
      "Current CUDA compute-capability tables list warp size as 32 threads.",
      "Block sizes that are multiples of 32 avoid a partly unused final warp for ordinary 1D launches.",
      "Consecutive threadIdx.x lanes should usually access consecutive memory addresses.",
      "When lanes in the same warp take different branches, the warp serializes those paths.",
    ],
    diagnostic:
      "Ask whether adjacent lanes read adjacent addresses and whether lanes in the same warp follow the same branch path.",
  },
  {
    title: "Blocks are the cooperation boundary",
    thesis:
      "Threads in the same block can share block-local shared memory and synchronize with __syncthreads; threads in different blocks usually cannot coordinate during a normal launch.",
    details: [
      "Every block is placed on one SM and normally runs to completion there.",
      "Shared memory is allocated per block, not per grid.",
      "__syncthreads only synchronizes threads inside the same block.",
      "Different blocks must be independent unless the kernel uses a specialized cooperative or clustered design.",
    ],
    diagnostic:
      "If the algorithm needs cross-block communication inside one launch, redesign the work split or use a specialized CUDA feature deliberately.",
  },
  {
    title: "Occupancy is useful, not absolute",
    thesis:
      "Occupancy helps hide latency by keeping resident warps available, but the fastest kernel also depends on memory access, registers, shared memory, instruction mix, and algorithm design.",
    details: [
      "A block must fit within an SM's thread, warp, register, shared-memory, and resident-block limits.",
      "Large blocks can reduce the number of resident blocks and expose tail effects.",
      "High occupancy cannot repair scattered memory access or unnecessary global memory traffic.",
      "Use the occupancy APIs and Nsight Compute as guides, then keep the launch shape that wins the benchmark.",
    ],
    diagnostic:
      "When tuning, record achieved occupancy beside memory throughput, register count, shared memory per block, and the dominant stall reason.",
  },
];

export const divergenceChecks = [
  {
    title: "Uniform decisions do not split a warp",
    thesis:
      "A condition that has the same truth value for every lane in a warp does not create intra-warp divergence.",
    details: [
      "Constants, kernel arguments, and block-level choices can be uniform for all lanes.",
      "A condition can mention threadIdx.x and still be warp-uniform if it changes only at warp boundaries.",
      "For example, threadIdx.x < 32 is uniform for warp 0 and uniform for later warps in a normal 1D block.",
    ],
    diagnostic:
      "Evaluate the predicate for lanes 0 through 31 inside one warp before calling it divergent.",
  },
  {
    title: "Lane-dependent predicates can diverge",
    thesis:
      "Raw comparisons against threadIdx.x, global thread id, or per-thread data often produce different answers inside the same warp.",
    details: [
      "if (threadIdx.x > 2) splits the first warp because lanes 0, 1, and 2 disagree with lanes 3 through 31.",
      "if (i % 2 == 0) splits every ordinary warp into even and odd lanes.",
      "Data-dependent tests such as if (a[i] > threshold) can diverge whenever neighboring elements differ.",
    ],
    diagnostic:
      "Look for predicates that depend on lane id or on values loaded through a lane-specific index.",
  },
  {
    title: "Boundary guards are normal",
    thesis:
      "The common if (i < n) guard may diverge in the final partial block, but it is usually the cleanest correctness tradeoff.",
    details: [
      "Ceiling division launches enough threads to cover arbitrary input sizes.",
      "Extra threads in the final block must skip memory accesses outside the valid range.",
      "With n = 1003 and block = 256, the final block has 235 useful threads and 21 guard threads.",
    ],
    diagnostic:
      "Treat final-block divergence as expected unless profiling shows it matters for the workload.",
  },
  {
    title: "Loops diverge through their exit condition",
    thesis:
      "A loop can diverge when its trip count is based on thread index or data owned by each lane.",
    details: [
      "int limit = a[threadIdx.x] gives each lane a potentially different number of loop iterations.",
      "The warp continues until the largest active trip count finishes.",
      "Lanes with smaller trip counts become inactive for the remaining iterations.",
    ],
    diagnostic:
      "Inspect the loop condition the same way you inspect an if condition: ask whether every lane sees the same answer.",
  },
];

export const schedulingChecks = [
  {
    title: "The scheduler issues warps",
    thesis:
      "CUDA code exposes threads, but the SM scheduler chooses ready warps as the unit of issue.",
    details: [
      "A 256-thread block contributes 8 warps to the resident warp pool.",
      "The scheduler does not pick an arbitrary individual thread; it issues the next instruction for a ready warp.",
      "A warp is ready when its next instruction has no unresolved dependency, wait, or synchronization block.",
    ],
    diagnostic:
      "When explaining a stall, ask which resident warps were still eligible to issue.",
  },
  {
    title: "A stalled warp is skipped temporarily",
    thesis:
      "When a warp waits on global memory, an instruction dependency, or a barrier, the scheduler can issue another ready warp.",
    details: [
      "The stalled warp remains resident on the SM.",
      "The SM does not need to save and restore a CPU-style heavyweight thread context.",
      "When the dependency resolves, that warp can become eligible again.",
    ],
    diagnostic:
      "A memory load hurts most when many resident warps stall at the same time and no ready warp remains.",
  },
  {
    title: "Latency tolerance hides waiting",
    thesis:
      "Latency tolerance means doing other warp work while one warp waits; it does not make the slow operation itself faster.",
    details: [
      "Global memory can take far longer than simple arithmetic.",
      "The GPU tolerates that delay by keeping many independent warps available.",
      "If there is no other eligible warp, the SM still goes idle.",
    ],
    diagnostic:
      "Separate the latency of one operation from the throughput of the whole SM.",
  },
  {
    title: "Occupancy supplies choices",
    thesis:
      "Occupancy matters because resident warps are the scheduler's menu for hiding stalls.",
    details: [
      "Higher occupancy can improve latency hiding when the workload has long waits.",
      "Occupancy can be limited by threads, warps, block slots, registers, or shared memory.",
      "Beyond enough eligible warps, more occupancy may add no benefit if another bottleneck dominates.",
    ],
    diagnostic:
      "Read achieved occupancy together with eligible-warps, stall reasons, memory throughput, and instruction mix.",
  },
];

export const executionPractice = [
  {
    title: "Create a launch ledger",
    purpose: "Make every simple kernel explainable before profiling it.",
    steps: [
      "Write the global index formula beside the kernel.",
      "Compute useful elements, grid blocks, launched threads, guard threads, and warps per block.",
      "Add at least one test size that is smaller than a block and one that is not divisible by the block size.",
    ],
    evidence: [
      "A comment, README row, or benchmark row with n, block, grid, launched threads, and guard threads.",
      "A correctness run for a non-divisible input size.",
    ],
  },
  {
    title: "Run a block-size sweep",
    purpose: "Treat block size as a measured variable instead of a belief.",
    steps: [
      "Run the same release build with 64, 128, 256, and 512 threads per block.",
      "Keep input size, data layout, timing method, and correctness checks unchanged.",
      "Add 1024 only when the kernel type gives a reason, such as a reduction experiment.",
    ],
    evidence: [
      "A table with block size, grid size, kernel time, achieved bandwidth or throughput, and correctness status.",
      "One sentence explaining which launch shape won and why the result is plausible.",
    ],
  },
  {
    title: "Annotate one profiler report",
    purpose: "Connect the launch shape to the hardware behavior Nsight reports.",
    steps: [
      "Capture a Nsight Compute report for the target kernel.",
      "Record launch dimensions, registers per thread, shared memory per block, achieved occupancy, and dominant stall reason.",
      "Decide whether the next experiment should change block size, memory access, shared memory, or algorithm structure.",
    ],
    evidence: [
      "A profiler screenshot or exported metric set tied to one code decision.",
      "A short note that names the bottleneck instead of only reporting elapsed time.",
    ],
  },
];

export const executionTraps = [
  {
    title: "Forgetting the bounds guard",
    symptom: "The kernel works for some input sizes and fails or corrupts memory for sizes that are not divisible by the block size.",
    whyItHappens:
      "Ceiling division launches enough threads to cover the input, which means the final block often contains extra logical threads.",
    correction: [
      "Use if (i < n) for 1D kernels and x/y bounds checks for 2D kernels.",
      "Keep a non-divisible input size in the correctness test set.",
    ],
  },
  {
    title: "Assuming the largest block size is best",
    symptom: "A 1024-thread block looks more parallel but performs worse or leaves fewer resident blocks per SM.",
    whyItHappens:
      "A larger block consumes more threads, warps, registers, and shared memory as one scheduling unit.",
    correction: [
      "Start at 128 or 256 and benchmark nearby choices.",
      "Use 1024 only when measurement and kernel structure justify it.",
    ],
  },
  {
    title: "Treating occupancy as the final score",
    symptom: "A higher-occupancy launch does not improve the benchmark, or it regresses performance.",
    whyItHappens:
      "Occupancy helps latency hiding, but it does not measure coalescing, cache locality, instruction count, or useful work per memory access.",
    correction: [
      "Read occupancy beside memory throughput, register pressure, shared memory use, and stall reasons.",
      "Prefer the measured fastest correct kernel, not the launch with the prettiest occupancy number.",
    ],
  },
  {
    title: "Ignoring branch divergence",
    symptom: "The launch has many threads, but warps spend time serializing different branch paths.",
    whyItHappens:
      "Threads are exposed individually, but warp lanes execute together when they are active on the same instruction path.",
    correction: [
      "Inspect whether each branch or loop condition is uniform across lanes in the same warp.",
      "Keep common branch decisions aligned across neighboring lanes when possible.",
      "Use profiler stall and branch metrics before rewriting the algorithm.",
    ],
  },
];

export const executionInterviewAnswers = [
  {
    prompt: "Explain grid, block, thread, warp, and SM in one answer.",
    shortAnswer:
      "A kernel launch creates a grid of blocks; each block contains threads. The hardware groups threads into warps, and SMs schedule resident blocks and warps subject to resource limits.",
    deepAnswer: [
      "Grid and block dimensions are the logical execution configuration chosen by host code.",
      "threadIdx, blockIdx, and blockDim let each thread compute the data it owns.",
      "Warps make coalescing and divergence visible because lanes execute together.",
      "Blocks are scheduled onto SMs in waves; a grid can contain far more blocks than the GPU has SMs.",
    ],
    evidenceToCollect:
      "A launch ledger for one kernel plus a profiler report showing launch dimensions and achieved occupancy.",
  },
  {
    prompt: "Why is 256 threads per block a common starting point?",
    shortAnswer:
      "It is 8 warps: usually enough to expose latency-hiding opportunities without making each block so large that only one resident block fits.",
    deepAnswer: [
      "It is a multiple of the 32-thread warp size.",
      "It works well for many simple memory-bound kernels with low register and shared-memory pressure.",
      "It is still only a baseline; benchmark 128 and 512 before making a performance claim.",
    ],
    evidenceToCollect: "A block-size sweep with 128, 256, and 512 under the same benchmark harness.",
  },
  {
    prompt: "Why is 1024 not automatically better?",
    shortAnswer:
      "1024 threads is the maximum per-block size on many architectures, but a block that large can reduce resident blocks, expose resource pressure, and create coarse scheduling.",
    deepAnswer: [
      "A 1024-thread block contains 32 warps.",
      "On an SM with a 1536 resident-thread limit, the thread limit alone permits only one 1024-thread block.",
      "If registers or shared memory are high, a large block may reduce occupancy further or fail to fit.",
    ],
    evidenceToCollect:
      "An occupancy calculation or Nsight Compute report comparing 256 and 1024 for the same kernel.",
  },
  {
    prompt: "When would you use a grid-stride loop?",
    shortAnswer:
      "Use it when you want a controlled number of launched blocks while still covering a large or variable-size input.",
    deepAnswer: [
      "Each thread starts at its global index and advances by blockDim.x * gridDim.x.",
      "It is useful for persistent-style work distribution, very large inputs, and reusable kernels.",
      "For first beginner examples, ceil(n / block) is still the simpler baseline.",
    ],
    evidenceToCollect: "A kernel variant that logs grid size, stride, and total elements covered.",
  },
  {
    prompt: "How do you tell whether a branch or loop can cause thread divergence?",
    shortAnswer:
      "Inspect the decision condition. If lanes in the same warp can evaluate it differently, the warp may have to serialize multiple paths or loop masks.",
    deepAnswer: [
      "Predicates based directly on threadIdx.x, global thread id, or per-thread data can be lane-dependent.",
      "A boundary guard such as if (i < n) is expected and usually only affects the last partially useful warp.",
      "Loops diverge when different lanes have different exit iterations, so the warp runs until the longest active lane finishes.",
    ],
    evidenceToCollect:
      "A small lane table for one warp plus branch-efficiency or warp-state metrics from a profiler report.",
  },
  {
    prompt: "What are warp scheduling and latency tolerance?",
    shortAnswer:
      "Warp scheduling is the SM choosing a ready resident warp to issue next. Latency tolerance is hiding a stalled warp's wait by issuing other ready warps.",
    deepAnswer: [
      "A warp can be not ready because it is waiting on global memory, a dependency, or synchronization.",
      "The stalled warp remains resident; when its dependency resolves, it can become ready again.",
      "Occupancy matters because more resident warps give the scheduler more chances to find useful work.",
    ],
    evidenceToCollect:
      "Nsight Compute warp-state and occupancy metrics showing whether the scheduler had eligible warps during stalls.",
  },
];
