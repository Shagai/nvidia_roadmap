import type {
  InterviewPromptAnswer,
  PortfolioEvidenceDetail,
  PracticalLabProject,
  ReferenceLink,
} from "../types";

export const cudaFundamentalsLabProjects: PracticalLabProject[] = [
  {
    title: "Lab 1: error-checked CUDA skeleton",
    purpose:
      "Build the smallest reusable CUDA program shape you will trust for every later experiment.",
    projectBrief:
      "Create a CMake or Make-based project that allocates device memory, launches one vector kernel, verifies output against CPU code, and reports CUDA errors with file and line information.",
    steps: [
      "Create a host entry point, one .cu file, and one small CPU reference implementation.",
      "Allocate input and output buffers explicitly with cudaMalloc and release them with cudaFree.",
      "Copy host input to device, launch the kernel, check the launch error, synchronize, and copy output back.",
      "Compare every output element against the CPU reference and return a nonzero exit code on mismatch.",
      "Print device name, compute capability, input size, block size, grid size, and elapsed timing fields.",
    ],
    measurements: [
      "Build type and compiler command.",
      "Input elements, bytes copied, block size, grid size, and guard threads.",
      "H2D copy time, kernel time, D2H copy time, total GPU path time, and CPU reference time.",
    ],
    deliverables: [
      "A reusable CUDA_CHECK helper.",
      "A passing correctness run.",
      "A README section called Skeleton contract explaining the launch and error-checking sequence.",
    ],
    acceptanceCriteria: [
      "Every CUDA runtime call is checked.",
      "The kernel launch is followed by cudaGetLastError or cudaPeekAtLastError and a synchronization point while learning.",
      "The program fails loudly on wrong results instead of only printing timings.",
    ],
    code: `inline void checkCuda(cudaError_t err, const char* file, int line) {
  if (err == cudaSuccess) return;
  throw std::runtime_error(
      std::string(file) + ":" + std::to_string(line) + " " + cudaGetErrorString(err));
}

#define CUDA_CHECK(call) checkCuda((call), __FILE__, __LINE__)

vectorAdd<<<grid, block>>>(aDevice, bDevice, outDevice, n);
CUDA_CHECK(cudaGetLastError());
CUDA_CHECK(cudaDeviceSynchronize());`,
  },
  {
    title: "Lab 2: CPU vs CUDA image-processing pipeline",
    purpose:
      "Turn CUDA syntax into a visible project with correctness tests, real inputs, and benchmarkable kernels.",
    projectBrief:
      "Implement grayscale, threshold, blur, and Sobel on CPU first, then implement CUDA versions. Keep the image loader and benchmark harness separate from the kernels.",
    steps: [
      "Load or generate images at several sizes: small, 1080p, and 4K-style dimensions.",
      "Implement CPU grayscale and threshold as exact references.",
      "Implement GPU grayscale and threshold with one output element per thread.",
      "Add blur and Sobel with explicit boundary behavior: clamp, mirror, zero, or skip border. Document the choice.",
      "Write output images to disk so correctness is inspectable without reading code.",
      "Benchmark CPU and GPU paths with enough repeated runs to avoid one-off noise.",
    ],
    measurements: [
      "CPU stage time for each kernel.",
      "GPU H2D, kernel, D2H, and total time.",
      "Maximum absolute difference or exact-match count versus CPU reference.",
      "Image size, pixel count, bytes transferred, and build type.",
    ],
    deliverables: [
      "Four CPU kernels and at least three CUDA kernels.",
      "Side-by-side output images or thumbnails.",
      "Benchmark table that separates transfer time from kernel time.",
      "A short note explaining why the smallest image may not benefit from the GPU.",
    ],
    acceptanceCriteria: [
      "CPU and GPU outputs agree within the documented tolerance.",
      "The README has one command to reproduce benchmark output.",
      "The benchmark does not compare CPU total time against GPU kernel-only time without labeling it.",
    ],
    stretchGoals: [
      "Use pinned host memory for a transfer experiment after the basic pageable path is correct.",
      "Add a command-line flag for block size so launch geometry can be swept without recompiling.",
    ],
  },
  {
    title: "Lab 3: launch-geometry and guard-thread sweep",
    purpose:
      "Learn that block size is a controlled experiment, not a magic number.",
    projectBrief:
      "Run the same image kernel with several block sizes and report grid size, total launched threads, inactive guard threads, and runtime.",
    steps: [
      "Add a block-size argument with values such as 64, 128, 256, and 512.",
      "Compute grid size with ceiling division and keep the out-of-range guard in the kernel.",
      "Record how many launched threads do no useful work because n is not divisible by block size.",
      "Run each block size several times after a warmup and report the selected statistic consistently.",
      "Explain the result without assuming the largest or smallest block size must be best.",
    ],
    measurements: [
      "Block size, grid size, total launched threads, useful threads, and guard threads.",
      "Kernel median time and end-to-end GPU time.",
      "Whether the chosen kernel is memory-bound, compute-bound, or overhead-bound at the tested size.",
    ],
    deliverables: [
      "A launch-sweep table.",
      "A plot or short paragraph describing the best observed block size for each input size.",
      "A note connecting block size to occupancy, register use, and memory behavior without claiming occupancy is the only goal.",
    ],
    acceptanceCriteria: [
      "The sweep is repeatable from the command line.",
      "The write-up distinguishes observed performance from general CUDA law.",
      "At least one result is explained in terms of overhead, memory access, or occupancy-style latency hiding.",
    ],
    code: `int blockSize = 256;
int gridSize = (n + blockSize - 1) / blockSize;
int launchedThreads = gridSize * blockSize;
int guardThreads = launchedThreads - n;

grayscale<<<gridSize, blockSize>>>(input, output, n);`,
  },
  {
    title: "Lab 4: transfer-cost ledger",
    purpose:
      "Make host/device movement visible so the project does not accidentally optimize the wrong thing.",
    projectBrief:
      "Instrument transfers and kernels separately with CUDA events. Compare a kernel-only story with the full application path.",
    steps: [
      "Create timing scopes for host-to-device copy, each kernel launch, device-to-host copy, and CPU reference code.",
      "Warm up the CUDA context before recording benchmark numbers.",
      "Synchronize only at measurement boundaries so timing is honest and understandable.",
      "Run with at least three image sizes and report both kernel-only and end-to-end GPU totals.",
      "Write one paragraph about whether the project is dominated by copies, kernel work, or launch overhead.",
    ],
    measurements: [
      "H2D milliseconds.",
      "Each kernel's elapsed milliseconds.",
      "D2H milliseconds.",
      "Total GPU path milliseconds.",
      "CPU reference milliseconds.",
    ],
    deliverables: [
      "A CSV or Markdown table emitted by the benchmark.",
      "A README explanation of what is included in each timing column.",
      "A bottleneck statement for each image size.",
    ],
    acceptanceCriteria: [
      "Kernel timing uses CUDA events or another explicitly documented CUDA-aware method.",
      "Total GPU time includes transfers when claiming application speedup.",
      "The project explains at least one case where kernel time and end-to-end time tell different stories.",
    ],
    code: `cudaEventRecord(start);
CUDA_CHECK(cudaMemcpy(deviceInput, hostInput, bytes, cudaMemcpyHostToDevice));
cudaEventRecord(stop);
CUDA_CHECK(cudaEventSynchronize(stop));
CUDA_CHECK(cudaEventElapsedTime(&h2dMs, start, stop));`,
  },
  {
    title: "Lab 5: portfolio-grade report",
    purpose:
      "Convert implementation work into evidence that an interviewer can inspect quickly.",
    projectBrief:
      "Write the README as an engineering report: problem, hardware, commands, correctness, benchmark table, interpretation, and next optimization.",
    steps: [
      "Document the hardware, OS, compiler, CUDA toolkit, build type, and GPU model.",
      "Add exact build, run, and benchmark commands.",
      "Include output images or links to generated artifacts.",
      "Add one table for correctness and one table for performance.",
      "Write a short section called What I learned that answers the interview prompts in project-specific language.",
    ],
    measurements: [
      "One table row per image size and kernel.",
      "CPU time, H2D, kernel, D2H, total GPU time, and speedup with transfers included.",
      "Correctness tolerance and mismatch count.",
    ],
    deliverables: [
      "README that passes the five-minute inspection test.",
      "Benchmark artifact checked into the repo or generated by one command.",
      "A short architecture diagram or data-flow diagram.",
    ],
    acceptanceCriteria: [
      "A reviewer can build and run the demo without reading source files first.",
      "Every performance claim names what was measured.",
      "The README has at least one honest limitation or next step.",
    ],
  },
];

export const cudaFundamentalsInterviewAnswers: InterviewPromptAnswer[] = [
  {
    prompt: "How do grid, block, thread, and warp relate?",
    shortAnswer:
      "A kernel launch creates a grid. The grid is made of blocks. A block is made of threads. Hardware schedules threads inside a block in warps, commonly groups of 32 lanes executing in a SIMT style.",
    deepAnswer: [
      "The grid and block dimensions are part of the launch configuration. They define how many logical CUDA threads are created and how those threads are grouped.",
      "Inside the kernel, blockIdx, blockDim, and threadIdx let each thread compute which element of the input it owns. For a one-dimensional image buffer, index = blockIdx.x * blockDim.x + threadIdx.x is the usual first pattern.",
      "Blocks are important because threads in the same block can synchronize and share block-local shared memory. Threads in different blocks cannot assume an execution order unless the algorithm uses a separate kernel launch or a more advanced synchronization feature.",
      "Warps matter for performance. Adjacent threads in a warp should usually access adjacent memory so global memory transactions are efficient. Branch divergence inside a warp can serialize paths and reduce useful parallel work.",
    ],
    evidenceHook:
      "In the CUDA image-processing README, show the launch formula, block-size sweep, total launched threads, and guard-thread count for each input size.",
  },
  {
    prompt: "Why can a GPU implementation be slower than CPU for a small input?",
    shortAnswer:
      "The GPU has overheads that small inputs cannot amortize: CUDA context setup, kernel launch overhead, host/device transfers, synchronization, and not enough parallel work to hide memory latency.",
    deepAnswer: [
      "A CPU can run small loops from cache with almost no setup. A GPU path may need allocation, copies, a launch, synchronization, and a copy back before the application gets a result.",
      "Kernel-only timing can look good while end-to-end timing loses. That is why the benchmark table must separate H2D, kernel, D2H, and total GPU time.",
      "Small images may launch many fewer useful threads than the GPU needs to keep many SMs busy. If the kernel is also memory-bound, extra parallelism may not translate into speedup.",
      "The right answer is not GPU good or GPU bad. The right answer is to report the crossover point where the GPU path starts winning for this workload and hardware.",
    ],
    evidenceHook:
      "Include small, medium, and large images in the benchmark and explicitly point to the size where total GPU time becomes competitive.",
  },
  {
    prompt: "What is the difference between kernel time and end-to-end GPU time?",
    shortAnswer:
      "Kernel time measures only the device work inside one or more launched kernels. End-to-end GPU time includes the whole GPU path the application pays for: copies, launches, synchronization, kernels, and output movement.",
    deepAnswer: [
      "Kernel time is useful for optimizing device code, but it can hide transfer costs and launch overhead.",
      "End-to-end timing is what the user or robotics pipeline experiences. For image processing, that usually includes loading or preparing host data, H2D copy, CUDA kernels, D2H copy, and any output formatting.",
      "Because CUDA work is often asynchronous, host timers can lie if the code does not synchronize at measurement boundaries. CUDA events are a common way to time GPU operations in stream order.",
      "A credible report shows both views: kernel-only for low-level optimization and total GPU path for product-level speedup.",
    ],
    evidenceHook:
      "Use two speedup columns in the README: kernel-only speedup and end-to-end speedup with transfers included.",
  },
  {
    prompt: "How should CUDA errors be handled while learning?",
    shortAnswer:
      "Check every runtime API call, check the launch error immediately after each kernel launch, and synchronize during early development so asynchronous execution errors are surfaced close to the code that caused them.",
    deepAnswer: [
      "Most CUDA runtime calls return cudaError_t, so they should be wrapped by a helper that reports file and line information.",
      "Triple-chevron kernel launches do not return cudaError_t directly. A call such as cudaGetLastError or cudaPeekAtLastError after launch catches launch-configuration errors and previously surfaced asynchronous errors.",
      "A successful launch check does not prove the kernel executed correctly. During learning, follow it with cudaDeviceSynchronize or an event synchronization so invalid memory access and similar asynchronous errors are reported before the program continues.",
      "Correctness checking still matters. A clean CUDA error state only says the runtime did not report an execution error; it does not say the math is right.",
    ],
    evidenceHook:
      "The skeleton lab should fail both on CUDA runtime errors and on CPU/GPU output mismatch.",
  },
  {
    prompt: "What makes a CUDA benchmark trustworthy?",
    shortAnswer:
      "It names the hardware and build type, warms up first, repeats runs, separates timing stages, validates correctness, and states exactly what each reported speedup includes.",
    deepAnswer: [
      "Use release or RelWithDebInfo builds for performance claims. Debug builds are useful for development but not performance conclusions.",
      "Warmup avoids mixing one-time setup with steady-state performance. Repetition reduces noise and makes median or best-of-N choices explicit.",
      "Correctness comes before speed. A fast kernel that disagrees with the CPU reference is not a performance result.",
      "Report enough context for reproduction: GPU model, CUDA toolkit, driver if relevant, compiler, command line, input size, block size, and timing method.",
    ],
    evidenceHook:
      "Publish the benchmark CSV and the exact command that generated it, then mirror the key rows in the README.",
  },
];

export const cudaFundamentalsPortfolioEvidence: PortfolioEvidenceDetail[] = [
  {
    title: "CUDA image-processing repository",
    artifact:
      "A public repo containing CPU and CUDA versions of grayscale, threshold, blur, and Sobel with reproducible build instructions.",
    proves:
      "You can write CUDA kernels from scratch, structure host/device code, and keep correctness visible.",
    mustInclude: [
      "Build and run commands.",
      "Input image generation or sample assets.",
      "CPU reference path.",
      "At least three CUDA kernels.",
      "Correctness comparison output.",
    ],
    doneWhen:
      "A reviewer can clone the repo, run one command, and see both output images and benchmark rows.",
  },
  {
    title: "Benchmark and transfer ledger",
    artifact:
      "A Markdown or CSV table with CPU, H2D, kernel, D2H, total GPU, and speedup columns across multiple image sizes.",
    proves:
      "You understand the difference between device-code speed and application-level speed.",
    mustInclude: [
      "Hardware and build type.",
      "Warmup and repeat count.",
      "Timing method.",
      "Input dimensions and byte counts.",
      "One paragraph interpreting the crossover point.",
    ],
    doneWhen:
      "The README has no ambiguous speedup claim; every number says whether transfers are included.",
  },
  {
    title: "Launch-geometry study",
    artifact:
      "A short report or README section comparing block sizes and guard-thread counts for one kernel.",
    proves:
      "You can reason from launch configuration to useful work, overhead, and performance observations.",
    mustInclude: [
      "Block sizes tested.",
      "Grid sizes.",
      "Total launched and inactive guard threads.",
      "Kernel timing for each input size.",
      "Conclusion that avoids treating one block size as universal.",
    ],
    doneWhen:
      "The report explains why the selected block size was reasonable for this project.",
  },
  {
    title: "Interview answer sheet",
    artifact:
      "A project-specific Q&A page answering grid/block/warp, small-input slowdown, kernel versus end-to-end timing, error handling, and benchmark trust.",
    proves:
      "You can translate the implementation into interview language.",
    mustInclude: [
      "Short answer.",
      "Detailed answer.",
      "Pointer to the line, table, or artifact in the repo that supports the answer.",
    ],
    doneWhen:
      "Every answer can be defended by a concrete part of the CUDA project.",
  },
];

export const cudaFundamentalsReferences: ReferenceLink[] = [
  {
    label: "CUDA Programming Guide: programming model",
    url: "https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html",
    note:
      "Official reference for grids, thread blocks, built-in indices, warps, SIMT, and the high-level CUDA execution model.",
  },
  {
    label: "CUDA Programming Guide: intro to CUDA C++",
    url: "https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/intro-to-cuda-cpp.html",
    note:
      "Official reference for dim3 launch configuration, thread/grid index intrinsics, kernel launch checks, and asynchronous error handling.",
  },
  {
    label: "CUDA C++ Best Practices Guide",
    url: "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html",
    note:
      "Official performance guide for transfer costs, pinned memory, asynchronous transfers, coalescing, and measurement discipline.",
  },
  {
    label: "Nsight Compute user guide",
    url: "https://docs.nvidia.com/nsight-compute/NsightCompute/index.html",
    note:
      "Official reference for the CUDA kernel profiler used later when moving from fundamentals to optimization.",
  },
];
