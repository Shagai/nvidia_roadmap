import type { CudaKnowledgePillar } from "./types";

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
    deepDivePath: "/cuda-kb/execution-model",
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
