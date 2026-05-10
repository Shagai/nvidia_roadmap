export type CudaKnowledgeSource = {
  id: string;
  label: string;
  url: string;
  scope: string;
  checked: string;
};

export type CudaKnowledgePillar = {
  id: string;
  title: string;
  guidingQuestion: string;
  summary: string;
  know: string[];
  practice: string[];
  traps: string[];
  sourceIds: string[];
};

export type CudaWorkflow = {
  title: string;
  purpose: string;
  steps: string[];
  evidence: string[];
};

export type CudaCommand = {
  command: string;
  use: string;
  proof: string;
};

export type CudaGlossaryItem = {
  term: string;
  meaning: string;
  whenItMatters: string;
};

export type CudaStudyTrack = {
  title: string;
  outcome: string;
  sequence: string[];
};

export const cudaSources: CudaKnowledgeSource[] = [
  {
    id: "cuda-toolkit",
    label: "CUDA Toolkit Documentation",
    url: "https://docs.nvidia.com/cuda/index.html",
    scope: "Top-level map for installation guides, programming guides, APIs, tools, libraries, samples, and compatibility notes.",
    checked: "2026-05-10",
  },
  {
    id: "programming-guide",
    label: "CUDA Programming Guide",
    url: "https://docs.nvidia.com/cuda/cuda-programming-guide/index.html",
    scope: "Canonical CUDA programming model, CUDA C++ basics, advanced CUDA features, and technical appendices.",
    checked: "2026-05-10",
  },
  {
    id: "best-practices",
    label: "CUDA C++ Best Practices Guide",
    url: "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html",
    scope: "Performance workflow, correctness checks, timing, bandwidth, memory optimization, occupancy, and deployment guidance.",
    checked: "2026-05-10",
  },
  {
    id: "runtime-api",
    label: "CUDA Runtime API",
    url: "https://docs.nvidia.com/cuda/cuda-runtime-api/index.html",
    scope: "Reference for cudaMalloc, cudaMemcpy, streams, events, error codes, device management, and runtime behavior.",
    checked: "2026-05-10",
  },
  {
    id: "nvcc",
    label: "NVCC documentation",
    url: "https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html",
    scope: "Compiler driver flags, architecture targets, separate compilation, PTX, cubin, and build-system integration.",
    checked: "2026-05-10",
  },
  {
    id: "compute-sanitizer",
    label: "Compute Sanitizer",
    url: "https://docs.nvidia.com/compute-sanitizer/ComputeSanitizer/index.html",
    scope: "Runtime checking for memory access errors, race conditions, initialization issues, and synchronization bugs.",
    checked: "2026-05-10",
  },
  {
    id: "nsight-compute",
    label: "Nsight Compute",
    url: "https://docs.nvidia.com/nsight-compute/NsightCompute/index.html",
    scope: "Kernel-level profiler for launch details, memory metrics, occupancy, source counters, rooflines, and reports.",
    checked: "2026-05-10",
  },
  {
    id: "nsight-systems",
    label: "Nsight Systems",
    url: "https://docs.nvidia.com/nsight-systems/",
    scope: "System timeline profiler for CPU/GPU overlap, CUDA API calls, streams, copies, kernels, and application latency.",
    checked: "2026-05-10",
  },
  {
    id: "compatibility",
    label: "CUDA Compatibility",
    url: "https://docs.nvidia.com/deploy/cuda-compatibility/",
    scope: "Driver, toolkit, runtime, binary compatibility, forward compatibility, and deployment constraints.",
    checked: "2026-05-10",
  },
  {
    id: "cccl",
    label: "CUDA C++ Core Libraries",
    url: "https://nvidia.github.io/cccl/",
    scope: "Umbrella documentation for Thrust, CUB, libcu++, and common CUDA C++ library direction.",
    checked: "2026-05-10",
  },
  {
    id: "cublas",
    label: "cuBLAS",
    url: "https://docs.nvidia.com/cuda/cublas/index.html",
    scope: "Production BLAS routines, especially GEMM, batched GEMM, and library-first matrix-compute decisions.",
    checked: "2026-05-10",
  },
  {
    id: "cutlass",
    label: "CUTLASS",
    url: "https://docs.nvidia.com/cutlass/",
    scope: "Template examples and building blocks for understanding tiled matrix multiplication and modern GPU kernels.",
    checked: "2026-05-10",
  },
  {
    id: "nccl",
    label: "NCCL",
    url: "https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/",
    scope: "Collective communication patterns such as broadcast, reduce, all-reduce, and multi-GPU topology vocabulary.",
    checked: "2026-05-10",
  },
  {
    id: "samples",
    label: "CUDA Samples",
    url: "https://docs.nvidia.com/cuda/cuda-samples/index.html",
    scope: "Runnable examples for toolkit features, common patterns, and compatibility checks.",
    checked: "2026-05-10",
  },
];

export const cudaKnowledgePillars: CudaKnowledgePillar[] = [
  {
    id: "mental-model",
    title: "Mental Model",
    guidingQuestion: "What work belongs on the GPU, and what does the CPU still own?",
    summary:
      "CUDA applications are heterogeneous systems. The CPU orchestrates memory allocation, data movement, kernel launches, synchronization, I/O, and control flow; the GPU executes massive parallel work where enough arithmetic or data-parallel structure exists to amortize overhead.",
    know: [
      "Host code runs on the CPU; device code runs on the GPU.",
      "A kernel launch creates many logical CUDA threads, but launch shape alone does not guarantee speed.",
      "The useful first decision is whether the workload has enough independent work and enough arithmetic intensity to justify GPU overhead.",
      "A production explanation should include CPU time, transfer time, kernel time, and total application time.",
    ],
    practice: [
      "Write a CPU reference first, then a CUDA implementation for exactly the same operation.",
      "For every experiment, record what stays on CPU, what moves to GPU, and where synchronization happens.",
      "Explain one small-input case where CPU wins and one larger-input case where GPU wins.",
    ],
    traps: [
      "Calling a program GPU-accelerated when most latency is still CPU preprocessing or transfers.",
      "Comparing CPU total time against GPU kernel-only time.",
      "Moving data to the GPU for a workload that has little parallelism or too little reuse.",
    ],
    sourceIds: ["programming-guide", "best-practices"],
  },
  {
    id: "execution",
    title: "Execution Model",
    guidingQuestion: "How is work decomposed into grid, block, thread, warp, and SM behavior?",
    summary:
      "The programming model exposes grids, blocks, and threads. Hardware executes threads in warps on streaming multiprocessors. Correct indexing makes the kernel right; understanding warps, occupancy, scheduling, and divergence explains why the kernel is fast or slow.",
    know: [
      "Grid and block dimensions define the logical launch configuration.",
      "blockIdx, blockDim, and threadIdx are the first indexing tools to master.",
      "Warps are the scheduling unit that make memory coalescing and branch divergence visible.",
      "Blocks are the boundary for shared memory and block-level synchronization.",
      "Occupancy helps hide latency, but it is one metric among registers, shared memory, memory throughput, and instruction mix.",
    ],
    practice: [
      "Compute global index, useful threads, total launched threads, and guard threads for every simple kernel.",
      "Run block-size sweeps with 64, 128, 256, and 512 threads per block.",
      "Annotate a profiler report with launch dimensions, achieved occupancy, and dominant stall reason.",
    ],
    traps: [
      "Forgetting the out-of-range guard when using ceiling division.",
      "Assuming the largest block size is best.",
      "Treating maximum occupancy as the same thing as maximum performance.",
      "Ignoring branch divergence inside a warp.",
    ],
    sourceIds: ["programming-guide", "best-practices", "nsight-compute"],
  },
  {
    id: "memory",
    title: "Memory And Data Movement",
    guidingQuestion: "Where is data stored, how does it move, and which access pattern does the GPU see?",
    summary:
      "CUDA performance is often memory performance. You need a working map of host memory, device global memory, registers, local memory, shared memory, constant memory, texture memory, pinned memory, unified memory, streams, and cache behavior.",
    know: [
      "Global memory is large and high-latency; adjacent threads should usually access adjacent addresses.",
      "Shared memory is block-local and useful when a tile of data is reused by neighboring threads.",
      "Registers are fastest but too much register use can reduce active warps.",
      "Pinned host memory can improve transfer behavior but is a constrained resource.",
      "Unified memory simplifies address handling, but explicit copies are often clearer while learning performance.",
    ],
    practice: [
      "Measure H2D, kernel, and D2H separately with CUDA events.",
      "Write coalesced and strided versions of the same kernel and compare effective bandwidth.",
      "Optimize one stencil kernel with a shared-memory tile and halo.",
      "Add a pageable-versus-pinned transfer experiment after the basic path is correct.",
    ],
    traps: [
      "Using shared memory without proving data reuse.",
      "Creating hidden host/device copies through convenience abstractions.",
      "Ignoring alignment, pitch, and layout when handling images or tensors.",
      "Assuming unified memory removes the need to reason about migration and locality.",
    ],
    sourceIds: ["best-practices", "runtime-api", "programming-guide"],
  },
  {
    id: "correctness",
    title: "Correctness And Debugging",
    guidingQuestion: "How do I prove the kernel is right before trusting the timing?",
    summary:
      "A CUDA program can fail through runtime API errors, launch errors, asynchronous execution errors, races, wrong indexing, undefined boundary behavior, and numerical differences. The first reusable asset is a correctness harness.",
    know: [
      "Check every CUDA runtime API call and include file and line in failures.",
      "A triple-chevron kernel launch does not return cudaError_t; check the launch separately.",
      "Synchronize deliberately during learning so asynchronous errors appear near the cause.",
      "A clean CUDA error state does not prove numerical correctness.",
      "Integer image kernels can often use exact comparison; floating-point kernels need documented tolerances.",
    ],
    practice: [
      "Use a CPU reference implementation and fail the process on mismatches.",
      "Run Compute Sanitizer before publishing benchmark numbers.",
      "Define border policy for stencil kernels before coding.",
      "Add a test case whose size is not divisible by the block size.",
    ],
    traps: [
      "Benchmarking an output that was never compared against a reference.",
      "Checking cudaGetLastError only at the end of the program.",
      "Letting boundary pixels be accidentally uninitialized.",
      "Treating floating-point reductions as bit-identical across CPU and GPU.",
    ],
    sourceIds: ["runtime-api", "compute-sanitizer", "best-practices"],
  },
  {
    id: "profiling",
    title: "Measurement And Profiling",
    guidingQuestion: "Which measurement tells me what to optimize next?",
    summary:
      "Profiling begins with the application timeline, then narrows into kernel metrics. Nsight Systems answers where time goes across CPU, GPU, streams, copies, launches, and waits. Nsight Compute answers why one kernel behaves the way it does.",
    know: [
      "Use warmup runs before steady-state timings.",
      "Report build type, GPU model, CUDA toolkit, driver context, input size, command line, and repeat count.",
      "CUDA events are appropriate for device-side timing in stream order.",
      "Nsight Systems is the timeline view; Nsight Compute is the kernel microscope.",
      "A good bottleneck statement names the limiting stage, not only the slowest line of code.",
    ],
    practice: [
      "Create one benchmark table with CPU, H2D, kernel, D2H, total GPU, and speedup columns.",
      "Profile one end-to-end run with Nsight Systems before optimizing any kernel.",
      "Profile the slowest kernel with Nsight Compute and capture the report or exported metrics.",
      "Write one paragraph explaining whether the workload is memory-bound, compute-bound, launch-bound, or transfer-bound.",
    ],
    traps: [
      "Optimizing from intuition before collecting a profile.",
      "Mixing debug builds and release builds in the same performance table.",
      "Reporting average latency without tail latency when a pipeline cares about responsiveness.",
      "Using a profiler screenshot without explaining the decision it supports.",
    ],
    sourceIds: ["best-practices", "nsight-systems", "nsight-compute"],
  },
  {
    id: "optimization",
    title: "Optimization Playbook",
    guidingQuestion: "Which code change follows from the measured bottleneck?",
    summary:
      "CUDA optimization is a sequence of measured hypotheses. The usual levers are memory coalescing, shared-memory tiling, occupancy and register pressure, divergence reduction, stream overlap, library replacement, and algorithm redesign.",
    know: [
      "Coalesced global memory access is a first-order performance habit.",
      "Shared memory helps when it reduces repeated global memory traffic enough to justify synchronization and complexity.",
      "Register pressure can reduce active warps and expose latency.",
      "Streams can overlap transfers and kernels when the hardware and dependencies allow it.",
      "Libraries are often the correct optimization for standard primitives and matrix operations.",
    ],
    practice: [
      "For each optimization, record baseline, hypothesis, profiler evidence, code change, new result, and remaining bottleneck.",
      "Optimize one naive blur or stencil kernel with shared memory and compare against the baseline.",
      "Replace a hand-written reduction with CUB and explain the result.",
      "Use cuBLAS or CUTLASS for GEMM learning rather than treating a naive GEMM as a portfolio performance claim.",
    ],
    traps: [
      "Adding shared memory, streams, or templates because they sound advanced.",
      "Fusing kernels without checking whether memory traffic or launch overhead is the real problem.",
      "Chasing micro-optimizations while the algorithm or data layout is wrong.",
      "Writing custom CUDA for a standard library primitive without a strong reason.",
    ],
    sourceIds: ["best-practices", "nsight-compute", "cccl", "cublas", "cutlass"],
  },
  {
    id: "toolchain",
    title: "Toolchain And Deployment",
    guidingQuestion: "Can I build, run, profile, and explain this on the intended machine?",
    summary:
      "CUDA work depends on a compatible GPU, driver, toolkit, compiler flags, runtime libraries, architecture targets, and operating-system assumptions. A project is not complete until these are written down.",
    know: [
      "The CUDA Toolkit contains the compiler, libraries, runtime, tools, and documentation for development.",
      "The NVIDIA driver is a separate compatibility boundary for running CUDA applications.",
      "nvcc steers host and device compilation and needs architecture-target choices.",
      "Compute capability determines which hardware features and instruction targets are available.",
      "Deployment can require bundling or pinning library versions and documenting the tested environment.",
    ],
    practice: [
      "Print GPU name and compute capability at program start.",
      "Record nvcc version, driver version, build type, and compiler command in benchmark output.",
      "Use CMake presets or a Makefile so builds are reproducible.",
      "Add a compatibility note for Linux, WSL, container, or remote-GPU assumptions.",
    ],
    traps: [
      "Assuming code that compiles on one CUDA Toolkit version will rebuild unchanged forever.",
      "Leaving architecture flags implicit in a benchmark project.",
      "Publishing run instructions that skip driver, toolkit, or GPU assumptions.",
      "Confusing toolkit version, runtime version, and kernel-mode driver version.",
    ],
    sourceIds: ["cuda-toolkit", "nvcc", "compatibility", "runtime-api"],
  },
  {
    id: "ecosystem",
    title: "Libraries And Ecosystem",
    guidingQuestion: "When should I stop writing kernels and use NVIDIA's existing stack?",
    summary:
      "CUDA knowledge includes knowing the ecosystem. Thrust and CUB cover parallel primitives. cuBLAS covers BLAS and GEMM. CUTLASS exposes modern matrix-kernel structure. NCCL handles collectives. NPP, TensorRT, DeepStream, Isaac, and domain libraries matter when the project moves into imaging, inference, or robotics.",
    know: [
      "Raw CUDA is best when the operation is custom, fused, or domain-specific.",
      "Parallel primitives such as transform, reduce, scan, sort, and select are often better delegated to libraries.",
      "GEMM is central enough that cuBLAS and CUTLASS should be studied early.",
      "NCCL vocabulary matters for multi-GPU discussions even before owning multi-GPU hardware.",
      "Ecosystem tools turn CUDA from syntax into deployable systems.",
    ],
    practice: [
      "Compare raw CUDA and Thrust or CUB for one transform and one reduction.",
      "Read one CUTLASS example and annotate tile, threadblock, warp, layout, and epilogue concepts.",
      "Write an interview answer that explains when a custom kernel is justified.",
      "Map one portfolio project stage to a library-first alternative.",
    ],
    traps: [
      "Treating libraries as less serious than custom kernels.",
      "Benchmarking library calls without accounting for allocations and data movement.",
      "Discussing all-reduce without knowing what is reduced and who receives the result.",
      "Reading CUTLASS templates from the top down without first finding the example's dataflow.",
    ],
    sourceIds: ["cccl", "cublas", "cutlass", "nccl", "samples"],
  },
  {
    id: "evidence",
    title: "Portfolio Evidence",
    guidingQuestion: "What can another engineer inspect in five minutes?",
    summary:
      "The knowledge base should feed public artifacts. Every topic should leave a trace: source code, correctness output, benchmark CSV, profiler report, README explanation, architecture diagram, or interview answer.",
    know: [
      "Evidence beats claimed familiarity.",
      "A CUDA README should say what was measured, what was included, and what remains limited.",
      "Profiler artifacts are only useful when tied to a decision.",
      "Interview answers should point back to a concrete line, table, or report.",
    ],
    practice: [
      "Keep a benchmark ledger for every CUDA project.",
      "Write one project-specific Q&A after each lab.",
      "Attach Nsight reports or exported metrics to optimization notes.",
      "Maintain a limitations section so claims stay credible.",
    ],
    traps: [
      "Publishing a large repo with no short path for review.",
      "Making performance claims without reproduction commands.",
      "Keeping the most important learning only in local memory or informal notes.",
      "Letting the diary become private reflection without public evidence.",
    ],
    sourceIds: ["best-practices", "nsight-compute", "samples"],
  },
];

export const cudaWorkflows: CudaWorkflow[] = [
  {
    title: "Start A CUDA Experiment",
    purpose: "Create a small artifact that can survive debugging, profiling, and review.",
    steps: [
      "State the workload, input shape, expected output, and why GPU acceleration might help.",
      "Implement the CPU reference and the CUDA version behind the same input/output contract.",
      "Check every CUDA runtime call and check each kernel launch immediately.",
      "Run correctness before recording any timing.",
      "Record environment, command line, build type, and hardware in the output or README.",
    ],
    evidence: [
      "CPU reference path.",
      "CUDA_CHECK helper.",
      "Mismatch count or maximum error output.",
      "One reproducible run command.",
    ],
  },
  {
    title: "Debug A Wrong Kernel",
    purpose: "Move from vague wrong output to a small cause.",
    steps: [
      "Shrink the input until the wrong element can be inspected manually.",
      "Check indexing math, bounds guard, and border policy first.",
      "Run Compute Sanitizer before changing performance code.",
      "Compare GPU output against CPU output at the first point where results diverge.",
      "Add the failing size to the test set before fixing the code.",
    ],
    evidence: [
      "Minimal failing input.",
      "Compute Sanitizer output or clean rerun.",
      "Regression test for non-divisible launch sizes.",
      "Short note explaining the bug class.",
    ],
  },
  {
    title: "Benchmark Honestly",
    purpose: "Separate kernel quality from application-level speed.",
    steps: [
      "Use release or RelWithDebInfo build settings.",
      "Warm up the CUDA context and the specific kernel path.",
      "Measure CPU reference, H2D, kernel, D2H, and total GPU path separately.",
      "Repeat runs and report a consistent statistic.",
      "State exactly what each speedup includes.",
    ],
    evidence: [
      "Benchmark table or CSV.",
      "GPU model, toolkit, driver, compiler, and command line.",
      "Transfer-inclusive speedup column.",
      "Interpretation of the crossover point.",
    ],
  },
  {
    title: "Optimize With A Profiler",
    purpose: "Make one code change because one measured bottleneck justifies it.",
    steps: [
      "Use Nsight Systems to see the end-to-end timeline before choosing a kernel.",
      "Use Nsight Compute on the target kernel to inspect memory, occupancy, stalls, and source metrics.",
      "Write the optimization hypothesis in one sentence.",
      "Make one change and rerun the same benchmark.",
      "Document the remaining bottleneck instead of declaring the project finished.",
    ],
    evidence: [
      "Before and after timings.",
      "Profiler report, exported metrics, or screenshot.",
      "Code diff linked to the bottleneck.",
      "Remaining limitation or next experiment.",
    ],
  },
  {
    title: "Convert Learning Into Interview Material",
    purpose: "Turn a lab into language that can be defended under time pressure.",
    steps: [
      "Write a 90-second answer for the concept.",
      "Write a deeper answer with one project example and one tradeoff.",
      "Point to the exact benchmark, profiler result, or code section that supports the answer.",
      "Practice the answer without notes.",
      "Update the answer after the next experiment changes the evidence.",
    ],
    evidence: [
      "Short answer.",
      "Detailed answer.",
      "Evidence hook.",
      "Known limitation or caveat.",
    ],
  },
];

export const cudaCommands: CudaCommand[] = [
  {
    command: "nvidia-smi",
    use: "Check visible GPUs, driver version, memory use, clocks, and whether another process is occupying the device.",
    proof: "Paste the GPU model and driver context into the benchmark environment section.",
  },
  {
    command: "nvcc --version",
    use: "Check the CUDA compiler version used to build the project.",
    proof: "Record the version beside benchmark tables and build logs.",
  },
  {
    command: "cmake -S . -B build -DCMAKE_BUILD_TYPE=Release",
    use: "Configure a reproducible release build for performance measurements.",
    proof: "README has the exact configure command and build type.",
  },
  {
    command: "cmake --build build -j",
    use: "Build the configured CUDA/C++ project without relying on IDE state.",
    proof: "A reviewer can rebuild from a clean checkout.",
  },
  {
    command: "compute-sanitizer --tool memcheck ./build/cuda_lab",
    use: "Catch invalid memory access and related runtime errors before trusting output or speed.",
    proof: "Optimization notes include a clean sanitizer run or explain any unsupported case.",
  },
  {
    command: "compute-sanitizer --tool racecheck ./build/cuda_lab",
    use: "Inspect shared-memory and synchronization hazards in kernels that communicate within a block.",
    proof: "Shared-memory optimization notes include racecheck evidence.",
  },
  {
    command: "nsys profile -o reports/timeline ./build/cuda_lab",
    use: "Capture CPU/GPU timeline, CUDA API calls, copies, kernels, waits, and stream behavior.",
    proof: "The report supports the end-to-end bottleneck statement.",
  },
  {
    command: "ncu --set full --target-processes all ./build/cuda_lab",
    use: "Collect kernel-level metrics for occupancy, memory behavior, stalls, source correlation, and roofline-style analysis.",
    proof: "The optimization write-up cites a metric that motivated the code change.",
  },
  {
    command: "ncu --query-metrics",
    use: "Find metric names before scripting Nsight Compute CLI collection.",
    proof: "Automated profiling scripts request metrics intentionally instead of copying unknown names.",
  },
  {
    command: "cuda-gdb ./build/cuda_lab",
    use: "Debug device code when a small repro needs source-level inspection.",
    proof: "Use only after correctness shrinkage and sanitizer runs narrow the failure.",
  },
];

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
