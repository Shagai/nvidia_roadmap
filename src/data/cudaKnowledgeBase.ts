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
  deepDivePath?: string;
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

export type CudaMentalModelKnowSection = {
  title: string;
  thesis: string;
  details: string[];
  diagnostic: string;
};

export type CudaMentalModelPractice = {
  title: string;
  purpose: string;
  steps: string[];
  evidence: string[];
};

export type CudaMentalModelTrap = {
  title: string;
  symptom: string;
  whyItHappens: string;
  correction: string[];
};

export type CudaMentalModelInterviewAnswer = {
  prompt: string;
  shortAnswer: string;
  deepAnswer: string[];
  evidenceToCollect: string;
};

export type CudaMentalModelGuide = {
  title: string;
  summary: string;
  know: CudaMentalModelKnowSection[];
  practice: CudaMentalModelPractice[];
  traps: CudaMentalModelTrap[];
  interviewAnswers: CudaMentalModelInterviewAnswer[];
  sourceIds: string[];
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
    id: "programming-guide-compute-capabilities",
    label: "CUDA Programming Guide: Compute Capabilities",
    url: "https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html",
    scope: "Feature and technical specification tables for compute capabilities, including warp size, resident resources, and architecture limits.",
    checked: "2026-05-11",
  },
  {
    id: "cuda-gpus",
    label: "CUDA GPU Compute Capability",
    url: "https://developer.nvidia.com/cuda-gpus",
    scope: "NVIDIA-maintained product-to-compute-capability mapping for data-center, workstation, and consumer GPUs.",
    checked: "2026-05-11",
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
    id: "runtime-api-occupancy",
    label: "CUDA Runtime API: Occupancy",
    url: "https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__OCCUPANCY.html",
    scope: "Reference for occupancy helper APIs such as cudaOccupancyMaxActiveBlocksPerMultiprocessor and cudaOccupancyMaxPotentialBlockSize.",
    checked: "2026-05-11",
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
    deepDivePath: "/cuda-kb/mental-model",
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
    sourceIds: [
      "programming-guide",
      "programming-guide-compute-capabilities",
      "best-practices",
      "runtime-api-occupancy",
      "nsight-compute",
    ],
    deepDivePath: "/cuda-kb/launch-configuration",
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

export const cudaMentalModelGuide: CudaMentalModelGuide = {
  title: "CUDA Mental Model",
  summary:
    "The mental model is the decision layer before syntax. It answers what belongs on the CPU, what belongs on the GPU, where data lives, when work is actually finished, and which measurement proves the decision was useful.",
  know: [
    {
      title: "CUDA is heterogeneous, not GPU-only",
      thesis:
        "A CUDA program is a cooperation between host code and device code. The CPU remains responsible for orchestration, I/O, allocation decisions, launch decisions, error handling, and often final integration with the rest of the application.",
      details: [
        "Host code runs the ordinary C++ control flow: parse inputs, allocate buffers, choose sizes, select devices, call CUDA runtime APIs, launch kernels, handle errors, and decide what result is needed next.",
        "Device code runs inside kernels on the GPU. It should be shaped around large sets of independent or cooperatively parallel operations, not around serial control-heavy logic.",
        "The useful first diagram is not grid/block/thread. It is CPU stage, host memory, transfer boundary, device memory, kernel work, transfer boundary, and CPU stage again.",
        "Unified Memory can simplify address management, but it does not remove the need to reason about locality, migration, synchronization, and the cost of using data from the wrong processor at the wrong time.",
      ],
      diagnostic:
        "Before writing a kernel, state: the CPU owns these decisions; the GPU owns this repeated work; this data must cross the boundary this many times.",
    },
    {
      title: "The GPU wants ownership of a large repeated pattern",
      thesis:
        "A kernel should usually express one repeated ownership rule: one thread owns one output element, one row, one pixel, one particle, one tile, or one small loop over a regular slice.",
      details: [
        "The strongest beginner pattern is one thread produces one output element from input elements it can name directly from its global index.",
        "The ownership rule should be correct before it is clever. If the rule cannot be explained in one sentence, the first version is too complex.",
        "Irregular work can still run on the GPU, but it needs a stronger reason: enough elements, enough work per element, a library primitive, a preprocessing step that regularizes it, or a design that keeps data resident on the device.",
        "A good ownership rule also states what happens at the boundary: out-of-range threads, image borders, empty inputs, incomplete tiles, and non-divisible sizes.",
      ],
      diagnostic:
        "Write the sentence: each CUDA thread owns ____ and is allowed to read ____. If that sentence is vague, debug the mental model before debugging code.",
    },
    {
      title: "Launch geometry describes work, not performance",
      thesis:
        "Grid and block dimensions create logical threads. They do not guarantee that the GPU is busy, that memory is efficient, or that the kernel beats the CPU.",
      details: [
        "The launch shape answers coverage: how many logical workers exist, how they are grouped, and which built-in indices each thread uses.",
        "The performance story is a separate layer: warp scheduling, memory coalescing, register use, shared memory use, occupancy, divergence, synchronization, and launch overhead.",
        "Ceiling division intentionally creates guard threads. Guard threads are not a design failure; they are the price of clean launch geometry for arbitrary input sizes.",
        "Block size starts as a controlled variable, not a belief. 128 or 256 threads per block can be a reasonable first guess, but the final claim should come from measurement.",
      ],
      diagnostic:
        "For every launch, record useful elements, block size, grid size, launched threads, guard threads, and why that shape is acceptable for the first version.",
    },
    {
      title: "The CPU/GPU boundary is often the real cost",
      thesis:
        "A kernel can be fast while the application is slow. Data transfer, synchronization, allocation, format conversion, and CPU preprocessing can dominate the path the user actually experiences.",
      details: [
        "A one-shot GPU path usually pays host-to-device copy, launch overhead, kernel time, device-to-host copy, and synchronization before the CPU can use the result.",
        "A pipeline path can become much stronger if several kernels consume data while it remains on the GPU, or if output is only copied back after multiple stages.",
        "Transfers are not automatically bad. They are bad when they are repeated unnecessarily, larger than needed, poorly overlapped, or used to accelerate a tiny amount of computation.",
        "The mental model should distinguish kernel-only speedup from end-to-end speedup. Both are useful, but they answer different questions.",
      ],
      diagnostic:
        "Draw a ledger with CPU prep, H2D, kernel, D2H, CPU post. If the kernel is not the largest or most important segment, optimize the boundary before tuning instructions.",
    },
    {
      title: "Arithmetic intensity and reuse decide suitability",
      thesis:
        "The GPU is strongest when the amount of parallel computation and data reuse is large enough to amortize movement and launch costs.",
      details: [
        "A memory-light operation on a small input may be slower on GPU because the CPU can finish from cache before the GPU path has paid its setup costs.",
        "A stencil, convolution, simulation, matrix operation, reduction, sort, or transform pipeline can become attractive when it exposes many elements and enough repeated structure.",
        "Data reuse changes the decision. If several kernels reuse the same resident device data, the cost of the original transfer is amortized across more work.",
        "Library candidates need a separate decision: if the operation is a standard primitive or GEMM-like operation, the best mental model may be library-first, custom-kernel-second.",
      ],
      diagnostic:
        "Ask whether the candidate has enough elements, enough work per element, enough reuse, and a way to avoid bouncing data back to the CPU between stages.",
    },
    {
      title: "Correctness and measurement belong inside the model",
      thesis:
        "The mental model is incomplete if it only predicts speed. It must also predict how the result will be checked and which timing view will be trusted.",
      details: [
        "Parallel execution can change floating-point order, expose indexing mistakes, and hide asynchronous failures until a later synchronization point.",
        "The CPU reference is not just a test. It is the contract that defines what the GPU result means.",
        "CUDA errors, mismatch counts, tolerance rules, and benchmark columns should be designed before optimization begins.",
        "A measured speedup is only interpretable if it names the workload, build type, hardware, timing method, repeat count, and whether transfers are included.",
      ],
      diagnostic:
        "Do not publish a CUDA timing until the same run also produces correctness evidence and a timing table that separates kernel-only from end-to-end time.",
    },
  ],
  practice: [
    {
      title: "CPU/GPU boundary ledger",
      purpose:
        "Force every experiment to name ownership, data movement, synchronization, and the measured path before writing performance claims.",
      steps: [
        "Choose one operation and write a five-stage path: CPU prep, H2D transfer, GPU kernel or kernels, D2H transfer, CPU post.",
        "Mark which buffers exist only on the host, only on the device, or on both sides.",
        "For each boundary crossing, record the byte count and why the crossing is necessary.",
        "Decide whether the claim will be kernel-only, end-to-end, or both.",
        "After implementation, replace estimates with measured values and keep the original estimate for comparison.",
      ],
      evidence: [
        "A table with stage, owner, input bytes, output bytes, synchronization point, and timing column.",
        "One paragraph explaining whether the boundary or the kernel is the bottleneck.",
      ],
    },
    {
      title: "One-thread ownership statement",
      purpose:
        "Make indexing and correctness easier by reducing a kernel to a clear ownership rule.",
      steps: [
        "Write the ownership sentence before the kernel: each thread owns one output element at index i.",
        "List every input address that thread may read for normal elements and boundary elements.",
        "Add one non-divisible input size to force guard-thread reasoning.",
        "Implement the CPU reference and GPU path from the same ownership rule.",
        "Record mismatch count or maximum absolute error before benchmarking.",
      ],
      evidence: [
        "The ownership sentence in the README or lab notes.",
        "A correctness run showing ordinary and non-divisible sizes.",
      ],
    },
    {
      title: "Small, medium, large crossover run",
      purpose:
        "Build intuition for when GPU overhead is amortized and when CPU execution is the simpler answer.",
      steps: [
        "Run the same operation on a tiny input, a realistic input, and a stress input.",
        "Record CPU time, H2D time, kernel time, D2H time, total GPU time, and speedup with transfers included.",
        "Keep build type, input generation, and timing method identical between sizes.",
        "Identify the first size where total GPU time becomes competitive, if it does.",
        "Explain the result in terms of setup cost, transfer cost, parallel work, and memory behavior.",
      ],
      evidence: [
        "Benchmark rows for at least three sizes.",
        "A crossover statement that does not overgeneralize beyond the tested hardware and workload.",
      ],
    },
    {
      title: "Keep data resident for two more stages",
      purpose:
        "Practice designing a GPU path as a pipeline instead of isolated kernels with repeated copies.",
      steps: [
        "Start from a one-kernel path that copies input to the GPU and output back to the CPU.",
        "Add two downstream operations that consume the previous GPU output without returning to the host.",
        "Measure one-shot per-stage copies versus resident multi-kernel execution.",
        "Only copy the final artifact back to the CPU.",
        "Document what changed in the boundary ledger and what stayed resident.",
      ],
      evidence: [
        "Two diagrams: before and after residency.",
        "Timing table showing whether fewer crossings improved the end-to-end path.",
      ],
    },
    {
      title: "Library-first decision drill",
      purpose:
        "Avoid writing custom CUDA for problems that are standard primitives or better solved by existing NVIDIA libraries.",
      steps: [
        "Classify the operation as elementwise transform, reduction, scan, sort, stencil, GEMM, inference, or domain-specific logic.",
        "Name the likely library candidate: Thrust, CUB, cuBLAS, CUTLASS, TensorRT, NPP, or custom CUDA.",
        "Write the reason a custom kernel is or is not justified.",
        "If a library is used, benchmark setup, allocation, transfer, and call time separately enough to avoid misleading conclusions.",
      ],
      evidence: [
        "A decision note stating custom-kernel, library-first, or hybrid.",
        "A limitation section explaining what was not measured.",
      ],
    },
  ],
  traps: [
    {
      title: "GPU as a faster CPU",
      symptom:
        "The kernel is written like a serial loop moved into one thread, or the CPU repeatedly launches tiny kernels for tiny pieces of work.",
      whyItHappens:
        "The programmer focuses on CUDA syntax before identifying a repeated parallel ownership rule.",
      correction: [
        "Find the data-parallel dimension first.",
        "Make each thread own a meaningful independent output or tile.",
        "Keep serial orchestration on the host unless device-side control is specifically justified.",
      ],
    },
    {
      title: "Kernel-only speedup presented as application speedup",
      symptom:
        "The benchmark shows a fast kernel, but users or downstream code still wait on transfers and synchronization.",
      whyItHappens:
        "Kernel timing is easier to collect than full-path timing, so it becomes the headline even when it answers a narrower question.",
      correction: [
        "Report kernel-only and end-to-end numbers in separate columns.",
        "Include H2D, D2H, allocation if relevant, CPU prep, and CPU post where the application pays for them.",
        "Use end-to-end time for product claims and kernel-only time for device-code tuning.",
      ],
    },
    {
      title: "Copy bounce pipeline",
      symptom:
        "Every stage copies data back to the CPU before the next GPU operation starts.",
      whyItHappens:
        "The implementation treats each kernel as a separate demo instead of designing device-resident dataflow.",
      correction: [
        "Group adjacent GPU stages while the data is still resident.",
        "Copy back only summary data or final output when possible.",
        "Draw the buffer ownership diagram before adding another transfer.",
      ],
    },
    {
      title: "Launch geometry confused with hardware utilization",
      symptom:
        "A large grid is assumed to mean the GPU is efficiently used.",
      whyItHappens:
        "The launch model is visible in source code, while warp scheduling, memory behavior, occupancy, and stalls require measurement.",
      correction: [
        "Use launch geometry to prove coverage, not speed.",
        "Measure achieved behavior with timing and profiler metrics.",
        "Explain performance through memory access, divergence, synchronization, register pressure, and occupancy together.",
      ],
    },
    {
      title: "Unified Memory treated as free movement",
      symptom:
        "The code is simpler, but performance becomes unpredictable or the first access in the wrong processor pays migration cost.",
      whyItHappens:
        "A shared address space is mistaken for shared physical locality.",
      correction: [
        "Use Unified Memory deliberately, especially while porting or simplifying ownership.",
        "Still reason about who touches the data first, where it is reused, and when synchronization makes access legal.",
        "For performance learning, compare against an explicit-copy version so the movement is visible.",
      ],
    },
    {
      title: "Correctness deferred until after optimization",
      symptom:
        "The code accumulates shared memory, tiling, streams, or fusion before a CPU reference comparison exists.",
      whyItHappens:
        "Optimization feels like progress, while correctness harnesses feel like overhead.",
      correction: [
        "Write the CPU reference and mismatch reporting first.",
        "Keep the naive CUDA kernel as the baseline.",
        "Optimize only after the baseline is correct and timed.",
      ],
    },
  ],
  interviewAnswers: [
    {
      prompt: "What exactly does the CPU still do in your CUDA project?",
      shortAnswer:
        "The CPU owns orchestration: input loading, validation, memory allocation, choosing launch parameters, starting transfers, launching kernels, checking errors, synchronizing when the result is needed, and integrating the final output.",
      deepAnswer: [
        "In a CUDA project the GPU is not a replacement for the whole C++ program. The host still runs the control flow and decides when device work should happen.",
        "For an image-processing lab, the CPU might load or generate the image, allocate host and device buffers, copy input to the device, choose block and grid size, launch grayscale or blur kernels, check cudaGetLastError, synchronize for correctness or timing, copy the result back, compare against the CPU reference, and write benchmark output.",
        "The GPU owns the repeated data-parallel operation. For example, one kernel may map many threads over pixels, but the CPU still owns the experiment harness and the application boundary.",
        "A good answer names the boundary clearly instead of saying the GPU does the processing. The CPU is still part of the system and often part of the measured latency.",
      ],
      evidenceToCollect:
        "A README diagram or table listing CPU prep, H2D copy, kernel launch, D2H copy, CPU verification, and output writing for one project run.",
    },
    {
      prompt: "Which data crosses from host to device, and how many bytes is it?",
      shortAnswer:
        "The input buffers required by the kernel cross from host to device; the exact byte count is element_count multiplied by bytes_per_element, plus any extra metadata or auxiliary arrays that the kernel needs.",
      deepAnswer: [
        "For an RGB image grayscale kernel, the H2D payload is width * height * 3 bytes if each pixel is stored as three unsigned bytes. The D2H payload is width * height * 1 byte if the output is one grayscale byte per pixel.",
        "For a 1920x1080 image, that means 2,073,600 pixels. RGB input is 6,220,800 bytes, about 5.93 MiB. Grayscale output is 2,073,600 bytes, about 1.98 MiB.",
        "For a blur or Sobel kernel, the transfer size may be the same as grayscale input/output even though each output reads a 3x3 neighborhood. The extra reads are device memory traffic, not extra H2D transfer, unless the implementation copies each neighborhood from the host, which would be a design smell.",
        "The byte ledger matters because transfer time can dominate an otherwise fast kernel. In an interview, I would state both H2D and D2H bytes and say whether allocations or format conversions are included.",
      ],
      evidenceToCollect:
        "A benchmark row with width, height, input bytes, output bytes, H2D ms, D2H ms, and total GPU ms.",
    },
    {
      prompt: "What does one thread own in your first kernel?",
      shortAnswer:
        "In the first kernel, one CUDA thread should own one output element. It computes its global index, exits if the index is out of range, reads the input elements needed for that output, and writes exactly that output.",
      deepAnswer: [
        "For a grayscale kernel, thread i owns grayscale_output[i]. It reads rgb_input[i], computes a luminance value, and writes one byte.",
        "The ownership rule makes correctness easier because there is no hidden cross-thread dependency. If thread i owns output i, then the CPU reference can check the same output element directly.",
        "The bounds guard is part of ownership. A launch often creates more threads than useful elements because grid size is computed with ceiling division, so threads with i >= n must return without reading or writing.",
        "For stencil kernels such as blur and Sobel, the thread can still own one output pixel, but it reads neighboring input pixels according to a documented border policy.",
      ],
      evidenceToCollect:
        "A code comment or README line stating the ownership rule, plus a test where n is not divisible by the block size.",
    },
    {
      prompt: "Why can your GPU path lose to CPU on small inputs?",
      shortAnswer:
        "Small inputs often do not provide enough parallel work to amortize CUDA overhead: context setup, allocations, host/device copies, kernel launch overhead, synchronization, and copying results back.",
      deepAnswer: [
        "A CPU can run a small loop from cache with almost no setup. A GPU path may need cudaMalloc, cudaMemcpy, a kernel launch, cudaDeviceSynchronize, and another cudaMemcpy before the application has a usable result.",
        "Even if the kernel itself is fast, kernel-only timing hides the boundary cost. The end-to-end path can lose because transfer and launch overhead are larger than the saved computation.",
        "Small inputs may also fail to keep enough warps active to hide memory latency. The GPU is designed for many lightweight threads, so a tiny workload may underuse the hardware.",
        "The correct conclusion is not GPU bad. The correct conclusion is to find the crossover point for this workload and hardware, and to keep data resident across multiple stages when the application allows it.",
      ],
      evidenceToCollect:
        "A small/medium/large benchmark table showing CPU ms, kernel-only GPU ms, total GPU ms, and the first size where total GPU becomes competitive.",
    },
    {
      prompt: "Which number is kernel-only speedup and which number is end-to-end speedup?",
      shortAnswer:
        "Kernel-only speedup compares CPU compute time against only the measured CUDA kernel time. End-to-end speedup compares CPU total time against the full GPU path, including transfers, launches, synchronization, and any required CPU-side setup or postprocessing.",
      deepAnswer: [
        "Kernel-only speedup is useful when tuning device code. It helps answer whether the kernel body, memory access pattern, launch geometry, or resource use improved.",
        "End-to-end speedup is useful for application claims. It answers what the user or downstream pipeline actually pays for.",
        "For example, if CPU grayscale takes 4 ms, the CUDA kernel takes 0.4 ms, and H2D plus D2H plus synchronization takes 3 ms, the kernel-only speedup is 10x, but the transfer-inclusive speedup is about 4 / 3.4 = 1.18x.",
        "A credible report shows both columns and labels them explicitly. If only one is shown, the claim is incomplete.",
      ],
      evidenceToCollect:
        "A benchmark table with separate CPU, H2D, kernel, D2H, total GPU, kernel-only speedup, and end-to-end speedup columns.",
    },
    {
      prompt: "What would change if the data stayed resident for three GPU stages?",
      shortAnswer:
        "The GPU path would pay the boundary cost once, then amortize it across multiple kernels. Instead of copying after every stage, the intermediate buffers stay in device memory and only the final result or summary crosses back.",
      deepAnswer: [
        "A copy-bounce design does H2D, kernel, D2H for each stage. That makes the PCIe or host/device boundary part of every operation, even when the next operation also runs on the GPU.",
        "A resident design does H2D once, runs stage 1, stage 2, and stage 3 on device buffers, and then copies the final artifact back. This usually improves the end-to-end story when the intermediate outputs are large.",
        "The design also changes ownership. The CPU stops inspecting every intermediate array, so correctness checks need explicit debug modes, sampled validation, or occasional copied checkpoints.",
        "This is where the mental model becomes system design: fewer transfers can improve latency, but the program must now manage device buffer lifetime, memory pressure, error handling, and observability more carefully.",
      ],
      evidenceToCollect:
        "Before/after boundary diagrams and a timing table comparing copy-back-each-stage versus resident three-stage execution.",
    },
  ],
  sourceIds: ["programming-guide", "best-practices", "runtime-api"],
};
