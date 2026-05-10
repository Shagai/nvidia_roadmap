import type { MonthKnowledge } from "../types";
import {
  cudaFundamentalsInterviewAnswers,
  cudaFundamentalsLabProjects,
  cudaFundamentalsPortfolioEvidence,
  cudaFundamentalsReferences,
} from "./cudaFundamentals";

export const monthKnowledge: MonthKnowledge[] = [
  {
    monthId: "2026-05",
    thesis:
      "This month is about turning a broad ambition into a credible target profile. The output is not code yet; it is positioning, evidence design, and a requirements map.",
    objectives: [
      "Translate NVIDIA job descriptions into repeated skill signals.",
      "Choose a primary target track and a secondary reinforcing track.",
      "Rewrite the public profile around C++ systems, CUDA, profiling, robotics, and vision.",
      "Start a preparation log that records decisions, not just study notes.",
    ],
    coreIdeas: [
      {
        title: "Role mining",
        body:
          "Read job descriptions as data. Extract repeated nouns, verbs, tools, and evidence words. A systems CUDA role usually rewards phrases like performance analysis, profiling, memory bandwidth, concurrent systems, Linux, debugging, and production-quality C++.",
        checkpoints: [
          "Separate required skills from nice-to-have skills.",
          "Track which requirements repeat across at least 3 roles.",
          "Mark which requirements can be proven by a portfolio artifact.",
        ],
      },
      {
        title: "Profile thesis",
        body:
          "The thesis should be short enough to fit in a CV headline: C++ systems engineer building CUDA and robotics/vision performance projects. This prevents the year from dissolving into generic AI study.",
        checkpoints: [
          "Primary track: GPU systems / CUDA.",
          "Secondary track: robotics / vision / edge AI.",
          "Avoid claiming deep ML research unless the artifacts support it.",
        ],
      },
      {
        title: "Evidence-first planning",
        body:
          "Every skill should eventually map to something inspectable: a benchmark table, an architecture diagram, a README, a bug report, a profiling trace, or a technical write-up.",
      },
    ],
    labs: [
      {
        title: "Requirements matrix",
        body:
          "Create a table with 10 target roles as rows and repeated requirements as columns. Put a confidence score beside each skill: already strong, learn, prove publicly, or ignore for now.",
      },
      {
        title: "CV headline rewrite",
        body:
          "Write three headline variants and pick the most specific one. Prefer a headline that names C++, CUDA, robotics/vision, and performance engineering.",
      },
      {
        title: "Preparation log template",
        body:
          "Use a weekly Markdown template with sections for experiment, benchmark, confusion, reading, artifact, and next action.",
        code: `# Week N

## Experiment
What did I build or measure?

## Result
What changed numerically or conceptually?

## Confusion
What still feels unclear?

## Artifact
What can someone inspect?

## Next action
What is the next concrete step?`,
      },
    ],
    pitfalls: [
      "Choosing too many target roles and making the profile vague.",
      "Optimizing LinkedIn wording before knowing what the portfolio will prove.",
      "Treating job descriptions as wish lists instead of prioritization data.",
    ],
    interviewPrompts: [
      "What NVIDIA role family am I targeting and why does my background fit it?",
      "What is the difference between knowing CUDA syntax and being useful on a GPU performance team?",
      "Which public artifact will prove the strongest part of my profile?",
    ],
    portfolioEvidence: [
      "A target-role requirements matrix.",
      "A revised CV headline and profile summary.",
      "A GitHub README or profile note that frames the year of projects.",
    ],
    diaryPrompts: [
      "Which requirements repeat most often?",
      "What part of my current background is already a strong signal?",
      "What would make my profile inspectable in five minutes?",
    ],
  },
  {
    monthId: "2026-06",
    thesis:
      "This month builds CUDA muscle memory. The goal is to write kernels from scratch, move data correctly, launch work with a clear grid/block shape, verify results against CPU references, and benchmark CPU versus GPU honestly.",
    objectives: [
      "Understand host code, device code, kernels, launches, and CUDA error handling.",
      "Implement simple image kernels from scratch.",
      "Measure transfer time separately from kernel time.",
      "Build a correctness harness that compares CPU and GPU outputs before trusting speed.",
      "Sweep launch geometry and explain useful threads, guard threads, and block-size tradeoffs.",
      "Explain why small workloads may be slower on GPU even when the kernel is correct.",
    ],
    coreIdeas: [
      {
        title: "Execution model",
        body:
          "A CUDA kernel is launched as a grid of blocks. Each block contains threads. Threads execute in warps, commonly groups of 32 lanes. The launch shape defines parallel work; it does not guarantee performance by itself.",
        checkpoints: [
          "Compute a global thread index from blockIdx, blockDim, and threadIdx.",
          "Guard out-of-range threads.",
          "Choose block sizes such as 128 or 256 as reasonable starting points.",
        ],
        code: `__global__ void grayscale(const uchar3* input, unsigned char* output, int n) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;
  if (i >= n) return;

  uchar3 p = input[i];
  output[i] = static_cast<unsigned char>(0.299f * p.x + 0.587f * p.y + 0.114f * p.z);
}`,
      },
      {
        title: "Kernel anatomy",
        body:
          "A beginner CUDA kernel has a simple contract: one thread owns one or more output elements, computes an index, checks bounds, reads inputs, writes outputs, and avoids hidden cross-thread assumptions. Correctness starts with a clear ownership rule.",
        checkpoints: [
          "State what one thread owns before writing the kernel.",
          "Keep the first version branch-light and easy to compare with CPU code.",
          "Use a separate CPU reference implementation instead of assuming the GPU output is correct.",
        ],
      },
      {
        title: "Indexing and guard threads",
        body:
          "The common ceiling-division launch formula often creates more logical threads than useful elements. The out-of-range guard is not optional; it is what lets you choose clean block sizes while handling arbitrary input sizes.",
        checkpoints: [
          "Compute useful work count n explicitly.",
          "Record total launched threads as gridSize * blockSize.",
          "Explain guard threads as safety and launch-shape convenience, not wasted design by accident.",
        ],
        code: `int blockSize = 256;
int gridSize = (n + blockSize - 1) / blockSize;
int totalLaunched = gridSize * blockSize;

grayscale<<<gridSize, blockSize>>>(input, output, n);`,
      },
      {
        title: "Memory movement",
        body:
          "Host memory is CPU-visible. Device memory is GPU-visible. For a first project, make transfers explicit with cudaMalloc, cudaMemcpy, and cudaFree. Measure host-to-device copy, kernel time, and device-to-host copy separately.",
        checkpoints: [
          "Check every CUDA API call.",
          "Free device allocations on every path.",
          "Do not compare CPU time against kernel-only GPU time unless the claim explicitly excludes transfers.",
        ],
      },
      {
        title: "Asynchrony and error handling",
        body:
          "CUDA work is often asynchronous from the host point of view. A kernel launch can return control before the device work has finished, and triple-chevron launches do not return cudaError_t directly. During fundamentals work, check the launch and synchronize at deliberate boundaries so errors appear near the code that caused them.",
        checkpoints: [
          "Wrap every CUDA runtime call with a file-and-line helper.",
          "Check the launch error immediately after every kernel launch.",
          "Synchronize while learning and while measuring so asynchronous failures are not hidden.",
        ],
        code: `blur<<<grid, block>>>(input, output, width, height);
CUDA_CHECK(cudaGetLastError());
CUDA_CHECK(cudaDeviceSynchronize());`,
      },
      {
        title: "Correctness before speed",
        body:
          "A fast CUDA kernel that computes the wrong pixels is not an optimization. For image kernels, define border behavior, compare with a CPU reference, and report mismatch counts or maximum absolute error before publishing performance numbers.",
        checkpoints: [
          "Define border policy for blur and Sobel.",
          "Use exact comparison for integer outputs when possible.",
          "Use a documented tolerance for floating-point outputs.",
        ],
      },
      {
        title: "Benchmark honesty",
        body:
          "A good benchmark controls input size, warmup, repeated runs, build type, and timing method. Report median or best-of-N consistently, and say whether transfers are included. The useful report has two views: kernel-only for CUDA code analysis and end-to-end for application claims.",
        checkpoints: [
          "Warm up the CUDA context before recording steady-state numbers.",
          "Record CPU, H2D, kernel, D2H, total GPU, and speedup columns.",
          "Name GPU model, CUDA toolkit, compiler, build type, and command line.",
        ],
      },
    ],
    labs: [
      {
        title: "CPU vs CUDA grayscale",
        body:
          "Implement grayscale on CPU and GPU. Run it on at least three image sizes and report CPU time, H2D copy, kernel time, D2H copy, and total GPU time.",
      },
      {
        title: "Blur and Sobel",
        body:
          "Add a blur kernel and a Sobel edge kernel. Start with global memory only. Do not optimize until the naive version is correct and benchmarked.",
      },
      {
        title: "Launch geometry sweep",
        body:
          "Run one kernel with several block sizes. Record grid size, total launched threads, guard threads, kernel time, and total GPU time. Explain the observed best block size as a measurement, not a universal law.",
      },
      {
        title: "Transfer ledger",
        body:
          "Use CUDA events or another CUDA-aware method to measure host-to-device transfer, each kernel, and device-to-host transfer separately. Compare kernel-only speedup with end-to-end speedup.",
      },
      {
        title: "Error macro",
        body:
          "Create a small macro or function that checks CUDA errors with file and line information. Use it around every CUDA API call and after every kernel launch.",
        code: `inline void checkCuda(cudaError_t err, const char* file, int line) {
  if (err == cudaSuccess) return;
  throw std::runtime_error(
      std::string(file) + ":" + std::to_string(line) + " " + cudaGetErrorString(err));
}

#define CUDA_CHECK(call) checkCuda((call), __FILE__, __LINE__)`,
      },
      {
        title: "README as an engineering report",
        body:
          "Write the final README with problem, hardware, commands, correctness evidence, benchmark table, interpretation, limitations, and next optimization. This is the bridge from learning exercise to portfolio evidence.",
      },
    ],
    pitfalls: [
      "Forgetting that kernel launches are asynchronous.",
      "Benchmarking debug builds.",
      "Comparing CPU total time against GPU kernel-only time without saying so.",
      "Ignoring image boundary conditions in blur and Sobel kernels.",
      "Publishing a timing table without a correctness check.",
      "Treating a block-size sweep as proof that one block size is always best.",
    ],
    interviewPrompts: [
      "How do grid, block, thread, and warp relate?",
      "Why can a GPU implementation be slower than CPU for a small input?",
      "What is the difference between kernel time and end-to-end GPU time?",
      "How should CUDA errors be handled while learning?",
      "What makes a CUDA benchmark trustworthy?",
    ],
    portfolioEvidence: [
      "README table with CPU, H2D, kernel, D2H, and total GPU timings.",
      "At least three kernels with clear launch configuration.",
      "A short section explaining where the GPU wins and where it does not.",
      "Correctness output comparing CPU and GPU paths.",
      "Launch-geometry sweep with block size, grid size, and guard-thread counts.",
      "Interview answer sheet tied to project evidence.",
    ],
    practicalProjects: cudaFundamentalsLabProjects,
    interviewAnswers: cudaFundamentalsInterviewAnswers,
    portfolioArtifacts: cudaFundamentalsPortfolioEvidence,
    referenceLinks: cudaFundamentalsReferences,
    diaryPrompts: [
      "Which kernel was easiest to write correctly?",
      "What bug did error checking catch?",
      "What changed when input size increased?",
      "Where did transfer time dominate the story?",
      "Which benchmark claim needs more context before it is portfolio-ready?",
    ],
  },
  {
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
  },
  {
    monthId: "2026-08",
    thesis:
      "This month connects C++ systems skill to real-time pipelines. The goal is a concurrent frame pipeline that is correct under pressure, measurable, and sanitizer-tested.",
    objectives: [
      "Deepen C++ ownership, lifetime, move semantics, RAII, and undefined behavior knowledge.",
      "Understand atomics, memory ordering, mutexes, condition variables, and bounded queues.",
      "Build a producer/consumer pipeline with backpressure and latency metrics.",
      "Use CMake, tests, benchmarks, and sanitizers as part of the artifact.",
    ],
    coreIdeas: [
      {
        title: "Ownership and lifetime",
        body:
          "Real-time systems often fail through lifetime bugs, not missing algorithms. Prefer RAII for resources, explicit ownership for buffers, and clear move-only types for frame packets.",
        checkpoints: [
          "A frame object has one clear owner at a time.",
          "Device buffers are released deterministically.",
          "References and spans never outlive their backing storage.",
        ],
      },
      {
        title: "Backpressure",
        body:
          "A bounded queue makes overload visible. If a producer is faster than a consumer, the system must block, drop, or degrade deliberately. Unbounded queues hide latency until memory or responsiveness collapses.",
      },
      {
        title: "Atomics and memory model",
        body:
          "Use mutexes and condition variables first unless a lock-free structure is truly justified. Atomics require reasoning about ordering, visibility, and progress; they are not a magic faster mutex.",
      },
      {
        title: "Latency versus throughput",
        body:
          "Throughput asks how many frames per second finish. Latency asks how long one frame takes end-to-end. Robotics systems often care about tail latency, not only average throughput.",
      },
    ],
    labs: [
      {
        title: "Bounded queue",
        body:
          "Implement a blocking bounded queue with close semantics. Add tests for push/pop, full queue behavior, shutdown, and multiple producers or consumers.",
      },
      {
        title: "Frame pipeline",
        body:
          "Create stages: simulated camera, CPU preprocessing, CUDA processing placeholder or adapter, and output. Attach timestamps at each stage.",
      },
      {
        title: "Sanitizer matrix",
        body:
          "Add build presets or targets for AddressSanitizer, UndefinedBehaviorSanitizer, and ThreadSanitizer where supported.",
        code: `cmake -S . -B build-asan -DCMAKE_BUILD_TYPE=RelWithDebInfo -DENABLE_ASAN=ON
cmake --build build-asan
ctest --test-dir build-asan --output-on-failure`,
      },
    ],
    pitfalls: [
      "Building a thread pool before defining pipeline semantics.",
      "Using lock-free structures without tests that prove correctness.",
      "Measuring only throughput and missing queueing latency.",
      "Letting frame buffers be copied accidentally between stages.",
    ],
    interviewPrompts: [
      "When would you use a mutex queue instead of a lock-free queue?",
      "What is backpressure and why does it matter?",
      "How do move semantics help in a frame pipeline?",
      "What do sanitizers catch and what do they not prove?",
    ],
    portfolioEvidence: [
      "Clean CMake project with test and benchmark targets.",
      "Pipeline diagram with queue boundaries.",
      "Latency histogram or percentile table.",
      "Sanitizer instructions in the README.",
    ],
    diaryPrompts: [
      "Where did queueing latency appear?",
      "Which bug would have been hard to catch without a sanitizer?",
      "What ownership rule did I enforce in code?",
    ],
  },
  {
    monthId: "2026-09",
    thesis:
      "This month learns inference deployment as systems engineering. The target is not training a model; it is moving frames through preprocessing, TensorRT inference, postprocessing, and measurement.",
    objectives: [
      "Understand tensors, shapes, batch size, precision, and engine build basics.",
      "Run an ONNX model through TensorRT or a comparable local inference pipeline.",
      "Measure end-to-end FPS and latency, including copies and preprocessing.",
      "Explain FP32, FP16, and INT8 tradeoffs at a practical level.",
    ],
    coreIdeas: [
      {
        title: "Tensor and batch shape",
        body:
          "Inference pipelines move tensors, not images in the abstract. Know layout, dtype, dimensions, batch size, and whether preprocessing creates copies. Batch size can improve throughput while hurting per-frame latency.",
      },
      {
        title: "TensorRT engine thinking",
        body:
          "TensorRT builds an optimized engine for a model, shapes, precision constraints, and hardware target. The useful mental model is compile once for a deployment scenario, then run repeatedly with predictable buffers.",
      },
      {
        title: "Precision tradeoffs",
        body:
          "FP32 is usually easiest to reason about. FP16 often improves speed and memory bandwidth on modern GPUs. INT8 can be faster but needs calibration and accuracy checks. Report accuracy or output sanity when changing precision.",
      },
      {
        title: "End-to-end pipeline",
        body:
          "The true product path includes video decode, preprocessing, host/device movement, inference, postprocessing, visualization, and output. A fast engine is only one segment of the pipeline.",
      },
    ],
    labs: [
      {
        title: "Model path",
        body:
          "Pick a small object detection model available as ONNX. Document input shape, preprocessing, output tensors, and postprocessing steps.",
      },
      {
        title: "TensorRT timing",
        body:
          "Measure engine build time separately from inference runtime. Report warmup runs, steady-state latency, and FPS.",
      },
      {
        title: "Pipeline timeline",
        body:
          "Create a table with preprocessing, H2D copy, inference, postprocessing, D2H copy if needed, and output time.",
        code: `Frame N timing:
decode_ms
preprocess_ms
h2d_ms
inference_ms
postprocess_ms
render_or_output_ms
total_ms`,
      },
    ],
    pitfalls: [
      "Optimizing model inference while preprocessing dominates total latency.",
      "Ignoring tensor layout conversion costs.",
      "Changing precision without checking output quality.",
      "Reporting FPS without latency distribution.",
    ],
    interviewPrompts: [
      "Why can larger batch size increase throughput but hurt latency?",
      "What is an ONNX model used for in deployment?",
      "What does TensorRT optimize?",
      "How would you profile an inference pipeline?",
    ],
    portfolioEvidence: [
      "End-to-end FPS and latency table.",
      "Timeline screenshot or table from Nsight Systems or manual instrumentation.",
      "README explaining bottlenecks and precision choices.",
      "Optional PyTorch versus TensorRT comparison.",
    ],
    diaryPrompts: [
      "Which stage dominates total latency?",
      "What tensor shape or layout issue confused me?",
      "What changed when batch size or precision changed?",
    ],
  },
  {
    monthId: "2026-10",
    thesis:
      "This month attaches GPU work to robotics and perception. The artifact should show messages, launch files, GPU acceleration points, and latency in a robotics-style architecture.",
    objectives: [
      "Understand ROS 2 node, topic, message, launch, and package basics.",
      "Connect camera input to GPU inference or CUDA processing.",
      "Explain where Isaac ROS, Isaac Sim, DeepStream, GStreamer, and Jetson fit.",
      "Produce a demo with an architecture diagram and latency notes.",
    ],
    coreIdeas: [
      {
        title: "ROS 2 graph",
        body:
          "A ROS 2 system is a graph of nodes communicating through topics, services, and actions. For perception, typical nodes include camera input, preprocessing, inference, tracking, visualization, and downstream planning consumers.",
      },
      {
        title: "GPU acceleration boundary",
        body:
          "Name the CPU/GPU boundary explicitly. Data format conversion and memory copies can erase gains if every stage bounces between CPU and GPU.",
      },
      {
        title: "Isaac and DeepStream positioning",
        body:
          "Isaac ROS and Isaac Sim are robotics-focused NVIDIA tools. DeepStream is a video analytics pipeline stack. GStreamer is the media pipeline substrate. Jetson is edge deployment hardware. The month is about knowing where each tool belongs.",
      },
      {
        title: "Robotics latency",
        body:
          "Robotics cares about time-aligned perception. Measure capture-to-detection latency, not just inference. Consider dropped frames, stale detections, and synchronization with sensor timestamps.",
      },
    ],
    labs: [
      {
        title: "ROS 2 perception skeleton",
        body:
          "Create a package with camera input or simulated frames, a GPU processing node, and a detection or processed-image output topic.",
      },
      {
        title: "Launch and parameters",
        body:
          "Add a launch file and parameters for model path, input topic, output topic, precision, and visualization toggle.",
      },
      {
        title: "Architecture diagram",
        body:
          "Draw the node graph and annotate CPU/GPU boundaries, message types, queue depth, and measured latency.",
      },
    ],
    pitfalls: [
      "Showing a robotics demo without a launch file.",
      "Not documenting hardware and driver assumptions.",
      "Ignoring timestamp freshness and queue depth.",
      "Claiming GPU acceleration without naming which stage runs on GPU.",
    ],
    interviewPrompts: [
      "How does a ROS 2 perception pipeline move data?",
      "Where can GPU acceleration help in robotics vision?",
      "What is the danger of stale perception data?",
      "How would you debug a latency spike in a camera-to-detection pipeline?",
    ],
    portfolioEvidence: [
      "ROS 2 package and launch file.",
      "Demo video or GIF.",
      "Architecture diagram with topics and GPU boundaries.",
      "Latency table and README deployment notes.",
    ],
    diaryPrompts: [
      "Which ROS 2 concept was new or confusing?",
      "Where did data cross the CPU/GPU boundary?",
      "What would need to change for Jetson deployment?",
    ],
  },
  {
    monthId: "2026-11",
    thesis:
      "This month learns when not to write custom CUDA. NVIDIA ecosystem engineers know libraries, primitives, and communication patterns well enough to choose the right abstraction.",
    objectives: [
      "Use Thrust and CUB for common parallel primitives.",
      "Understand CCCL as the CUDA C++ Core Libraries direction.",
      "Explain cuBLAS and CUTLASS at a GEMM-concept level.",
      "Understand NCCL collectives and basic multi-GPU communication vocabulary.",
    ],
    coreIdeas: [
      {
        title: "Raw CUDA versus libraries",
        body:
          "Write custom CUDA when the operation is domain-specific or fusion avoids memory traffic. Use libraries when the operation is standard, heavily optimized, and not the differentiating part of the project.",
      },
      {
        title: "Parallel primitives",
        body:
          "Many GPU algorithms are built from transform, reduce, scan, sort, select, histogram, and prefix-sum primitives. Thrust gives a high-level C++ interface; CUB gives lower-level building blocks.",
      },
      {
        title: "GEMM and CUTLASS",
        body:
          "GEMM is matrix multiplication in the form C = alpha A B + beta C. cuBLAS gives production GEMM routines. CUTLASS exposes templated building blocks and examples for understanding tiled GPU matrix operations.",
      },
      {
        title: "NCCL collectives",
        body:
          "Collectives coordinate data across GPUs or nodes. Broadcast sends one source to many. Reduce combines many into one. All-reduce combines and shares the result with all participants. Topology matters.",
      },
    ],
    labs: [
      {
        title: "Transform benchmark",
        body:
          "Implement vector transform with raw CUDA and Thrust. Compare code complexity, runtime, and memory behavior.",
      },
      {
        title: "Reduction benchmark",
        body:
          "Compare a simple custom reduction against CUB. Focus the write-up on why production primitives are hard to beat.",
      },
      {
        title: "GEMM reading exercise",
        body:
          "Read a CUTLASS example and annotate the concepts: tile, threadblock, warp-level operation, memory layout, and epilogue.",
      },
    ],
    pitfalls: [
      "Writing custom CUDA for a standard primitive without a reason.",
      "Treating templates as magic instead of reading type aliases and examples slowly.",
      "Ignoring memory allocation overhead in library benchmarks.",
      "Discussing NCCL without understanding basic collective semantics.",
    ],
    interviewPrompts: [
      "When would you use Thrust or CUB instead of custom CUDA?",
      "What is a parallel scan and where is it useful?",
      "What does all-reduce do?",
      "Why is GEMM so central to GPU computing?",
    ],
    portfolioEvidence: [
      "Raw CUDA versus Thrust/CUB benchmark.",
      "Short note on when libraries beat custom kernels.",
      "Annotated CUTLASS or cuBLAS experiment.",
      "Optional NCCL toy example if hardware allows.",
    ],
    diaryPrompts: [
      "Which primitive appears in more algorithms than I expected?",
      "Where did library setup cost affect the benchmark?",
      "What part of CUTLASS still feels opaque?",
    ],
  },
  {
    monthId: "2026-12",
    thesis:
      "This month turns private learning into public signal. A small, high-quality contribution with a reproducer can be more credible than a large unfinished side project.",
    objectives: [
      "Select an open-source target that matches the NVIDIA path.",
      "Learn how to reproduce, minimize, document, and communicate a technical issue.",
      "Submit either a merged PR, two strong issues, or a substantial forked demo.",
      "Make the public artifact easy for an engineer to inspect quickly.",
    ],
    coreIdeas: [
      {
        title: "Contribution types",
        body:
          "Useful contributions include bug fixes, docs improvements, reproducible issue reports, minimal failing examples, benchmark fixes, sample updates, and compatibility notes.",
      },
      {
        title: "Reproducer quality",
        body:
          "A good issue states environment, exact commands, expected behavior, actual behavior, logs, and a minimal input. It removes irrelevant complexity so maintainers can act.",
        code: `Issue structure:
Environment:
Steps to reproduce:
Expected:
Actual:
Minimal input:
Logs:
Bisect or suspected cause:
Workaround, if any:`,
      },
      {
        title: "PR hygiene",
        body:
          "Keep the diff small, follow project style, include tests or validation steps, explain the problem before the solution, and respond clearly to review.",
      },
    ],
    labs: [
      {
        title: "Repository shortlist",
        body:
          "Pick three possible repositories and score each by setup difficulty, issue quality, relevance, maintainer activity, and chance of a focused contribution.",
      },
      {
        title: "Minimal reproducer",
        body:
          "Before opening an issue or PR, create the smallest local case that demonstrates the behavior.",
      },
      {
        title: "Public artifact polish",
        body:
          "If a PR is unrealistic, create a forked demo with README, exact commands, screenshots, and a clear explanation of why it matters.",
      },
    ],
    pitfalls: [
      "Trying to contribute to a project before it builds locally.",
      "Opening vague issues without commands or environment details.",
      "Making a first PR too broad.",
      "Confusing public activity with public evidence.",
    ],
    interviewPrompts: [
      "How did you reduce the problem to a minimal reproducer?",
      "What did you learn from maintainer feedback?",
      "How do you decide whether a behavior is a bug, documentation gap, or unsupported use case?",
    ],
    portfolioEvidence: [
      "Merged PR, high-quality issue, or inspectable forked demo.",
      "Short portfolio note explaining the contribution and why it matters.",
      "Link from GitHub profile or project README.",
    ],
    diaryPrompts: [
      "Which repository was most approachable and why?",
      "What setup friction did I remove?",
      "What feedback changed my understanding?",
    ],
  },
  {
    monthId: "2027-01",
    thesis:
      "This month converts knowledge into technical-screen performance. The target is speed, clarity, and calm explanations under time pressure.",
    objectives: [
      "Build a repeatable algorithm practice cadence.",
      "Prepare C++ systems and concurrency answers with code.",
      "Practice CUDA explanations without notes.",
      "Track mistakes by category instead of only counting solved problems.",
    ],
    coreIdeas: [
      {
        title: "Problem pattern recognition",
        body:
          "Most interview problems reward recognizing patterns: two pointers, sliding window, prefix sums, hash maps, heaps, graph traversal, dynamic programming, and cache design.",
      },
      {
        title: "C++ correctness in interviews",
        body:
          "Use simple, correct C++ first. Explain ownership, invalidation, complexity, and edge cases. Avoid clever template machinery unless the problem asks for it.",
      },
      {
        title: "Concurrency problem framing",
        body:
          "For producer-consumer or thread-safe structures, define invariants before code: what state is protected, when threads block, how shutdown works, and what happens under spurious wakeups.",
      },
      {
        title: "Mistake log",
        body:
          "Track mistakes as pattern, bug, complexity miss, edge case, C++ syntax issue, or explanation issue. The log is the training signal.",
      },
    ],
    labs: [
      {
        title: "Weekly drill set",
        body:
          "Solve 4 algorithm problems, 2 C++ systems problems, 1 concurrency problem, and 1 CUDA explanation drill each week.",
      },
      {
        title: "LRU cache",
        body:
          "Implement LRU cache with a list and unordered_map. Explain iterator validity, complexity, and ownership.",
      },
      {
        title: "Thread-safe queue",
        body:
          "Write a bounded blocking queue on a whiteboard. Include shutdown semantics and explain condition-variable predicates.",
        code: `cv.wait(lock, [&] {
  return closed || !queue.empty();
});`,
      },
    ],
    pitfalls: [
      "Solving many problems without reviewing mistakes.",
      "Skipping edge cases aloud.",
      "Using advanced C++ where simple code would be clearer.",
      "Knowing CUDA concepts but not being able to explain them verbally.",
    ],
    interviewPrompts: [
      "Explain the tradeoff between unordered_map and map.",
      "Implement producer-consumer with shutdown.",
      "Explain memory ownership in a returned container.",
      "Explain blocks, threads, warps, and coalescing without notes.",
    ],
    portfolioEvidence: [
      "Mistake log with recurring themes.",
      "A small folder of clean C++ drill solutions.",
      "A written CUDA explanation sheet linked from the diary.",
    ],
    diaryPrompts: [
      "Which pattern did I miss this week?",
      "What bug did I repeat?",
      "Which explanation became clearer after practice?",
    ],
  },
  {
    monthId: "2027-02",
    thesis:
      "This month practices architecture for GPU/software roles. The emphasis is CPU/GPU boundaries, throughput, latency, memory ownership, observability, and failure modes.",
    objectives: [
      "Write five short design documents with diagrams.",
      "Practice requirements before architecture.",
      "Name bottlenecks and observability signals explicitly.",
      "Explain tradeoffs for real-time, batch, and distributed GPU systems.",
    ],
    coreIdeas: [
      {
        title: "Requirements first",
        body:
          "Start every design with workload shape, latency target, throughput target, hardware assumptions, failure tolerance, and data size. Architecture without requirements is decoration.",
      },
      {
        title: "CPU/GPU boundary",
        body:
          "Define what stays on CPU, what moves to GPU, when copies occur, and who owns buffers. Avoid designs that repeatedly convert formats or cross the bus unnecessarily.",
      },
      {
        title: "Observability",
        body:
          "A production GPU system needs stage latency, queue depth, GPU utilization, memory usage, dropped frames, error rates, model version, and input/output counters.",
      },
      {
        title: "Failure modes",
        body:
          "Design for camera disconnects, corrupt frames, GPU OOM, slow consumers, model load failure, version mismatch, thermal throttling, and partial service degradation.",
      },
    ],
    labs: [
      {
        title: "Camera pipeline design",
        body:
          "Design a real-time camera processing pipeline. Include capture, preprocessing, GPU inference, postprocessing, output, queues, and metrics.",
      },
      {
        title: "GPU inference server",
        body:
          "Design request batching, memory pools, model loading, backpressure, timeouts, and observability for a GPU inference server.",
      },
      {
        title: "Design document template",
        body:
          "Use the same structure for all five documents so practice compounds.",
        code: `# Design
## Requirements
## Data model
## CPU/GPU boundary
## Architecture
## Memory ownership
## Bottlenecks
## Failure modes
## Observability
## Tests`,
      },
    ],
    pitfalls: [
      "Drawing components before naming latency and throughput targets.",
      "Ignoring queue growth and backpressure.",
      "Treating GPU utilization as the only metric.",
      "Skipping failure modes because the project is a demo.",
    ],
    interviewPrompts: [
      "Design a GPU inference server for variable-size requests.",
      "Design a multi-camera robotics perception system.",
      "How would you detect and respond to rising end-to-end latency?",
      "Where would you put batching and why?",
    ],
    portfolioEvidence: [
      "Five 2-3 page design documents.",
      "One diagram per document.",
      "A summary page linking designs to portfolio projects.",
    ],
    diaryPrompts: [
      "Which design tradeoff was hardest?",
      "Which metric would catch the first production failure?",
      "Where did memory ownership need to be clearer?",
    ],
  },
  {
    monthId: "2027-03",
    thesis:
      "This month packages the work for applications. The task is to make the strongest evidence easy to find, easy to run, and easy to discuss.",
    objectives: [
      "Rewrite CV and LinkedIn around measurable systems work.",
      "Polish GitHub pinned projects and README structure.",
      "Create a one-page portfolio with three technical write-ups.",
      "Prepare target roles, referrals, and application materials.",
    ],
    coreIdeas: [
      {
        title: "Evidence hierarchy",
        body:
          "Recruiters need the headline. Engineers need the artifact. Hiring managers need the narrative. The application package should serve all three without forcing them to dig.",
      },
      {
        title: "CV bullets",
        body:
          "Good bullets name the system, action, measurement, and technical tools. Avoid vague claims like worked on AI. Prefer implemented, profiled, optimized, measured, debugged, and shipped.",
        code: `Implemented CUDA image-processing kernels and optimized memory access patterns,
improving throughput by Xx over CPU baseline on N-sized inputs.`,
      },
      {
        title: "README structure",
        body:
          "Each pinned repository should answer: what it does, why it matters, how to build, how to run, what was measured, what the result means, and what the next improvement would be.",
      },
      {
        title: "Referral strategy",
        body:
          "A useful referral message is short, specific, and linked to evidence. It names the role family and one artifact that matches it.",
      },
    ],
    labs: [
      {
        title: "One-page portfolio",
        body:
          "Create a page with target profile, three projects, three write-ups, open-source artifact, and contact links.",
      },
      {
        title: "Pinned project pass",
        body:
          "For each pinned repo, add a screenshot or diagram, benchmark table, build command, run command, and key tradeoff paragraph.",
      },
      {
        title: "Application packet",
        body:
          "Prepare CV, LinkedIn summary, GitHub profile README, 3-5 target roles, and referral message variants.",
      },
    ],
    pitfalls: [
      "Adding every project instead of the strongest three.",
      "Leaving benchmark claims without reproduction details.",
      "Writing CV bullets without numbers or technical specifics.",
      "Waiting until applications are open to assemble the material.",
    ],
    interviewPrompts: [
      "Walk me through your CUDA performance project.",
      "What does your robotics/vision pipeline prove?",
      "Which project best shows production-quality C++?",
      "What role are you targeting and why?",
    ],
    portfolioEvidence: [
      "NVIDIA-focused CV.",
      "Polished GitHub pinned projects.",
      "One-page portfolio.",
      "Three technical write-ups.",
      "Target role list and outreach drafts.",
    ],
    diaryPrompts: [
      "Which artifact is strongest and why?",
      "What claim on the CV needs better evidence?",
      "What would an engineer inspect first?",
    ],
  },
  {
    monthId: "2027-04",
    thesis:
      "This month is final rehearsal. The goal is to explain all projects without notes, solve under time pressure, and discuss performance tradeoffs clearly.",
    objectives: [
      "Rehearse technical stories with situation, tradeoff, action, result, and lesson.",
      "Run mock interviews across C++, algorithms, system design, CUDA/performance, and behavioral topics.",
      "Close weak explanations in CUDA memory hierarchy, divergence, streams, TensorRT latency, and concurrency.",
      "Prepare concise project walkthroughs for recruiter, engineer, and hiring manager audiences.",
    ],
    coreIdeas: [
      {
        title: "Story structure",
        body:
          "A strong technical story has context, constraint, decision, tradeoff, measured result, and reflection. Avoid chronological wandering. Lead with the engineering problem.",
      },
      {
        title: "Project walkthrough",
        body:
          "Every portfolio project needs a two-minute version and a ten-minute version. The short version states the problem, architecture, bottleneck, and result. The long version can go into code, profiling, and failures.",
      },
      {
        title: "Performance explanation",
        body:
          "For CUDA and pipeline questions, speak in terms of memory access, occupancy, divergence, synchronization, transfer costs, batching, queueing, and measurement methodology.",
      },
      {
        title: "Behavioral alignment",
        body:
          "Behavioral answers should still sound like engineering. Show how you debug, communicate tradeoffs, handle ambiguity, and learn from mistakes.",
      },
    ],
    labs: [
      {
        title: "Mock interview schedule",
        body:
          "Complete 4 C++ interviews, 4 algorithms interviews, 3 system design interviews, 3 CUDA/performance interviews, and 2 behavioral interviews.",
      },
      {
        title: "Project whiteboard",
        body:
          "Draw each project architecture from memory. Include data flow, CPU/GPU boundary, bottleneck, and what you would improve next.",
      },
      {
        title: "Explanation speed drill",
        body:
          "Answer each core CUDA/performance topic in 90 seconds, then again in 5 minutes with deeper tradeoffs.",
        code: `90-second answer:
1. Definition.
2. Why it matters.
3. Example from my project.
4. Measurement or tradeoff.`,
      },
    ],
    pitfalls: [
      "Only practicing coding and neglecting project storytelling.",
      "Overexplaining background before reaching the tradeoff.",
      "Claiming expertise where the artifact is weak.",
      "Not rehearsing failure stories and debugging stories.",
    ],
    interviewPrompts: [
      "Explain warp divergence and how it can affect performance.",
      "How did you profile your GPU pipeline?",
      "Tell me about the hardest C++ bug you fixed.",
      "Design a real-time perception pipeline and name the bottlenecks.",
      "When would you choose a mutex queue over a lock-free queue?",
    ],
    portfolioEvidence: [
      "Rehearsed story notes for six technical stories.",
      "Mock interview feedback log.",
      "Final project walkthrough notes.",
      "A readiness checklist before applications or interviews.",
    ],
    diaryPrompts: [
      "Which answer still sounds vague?",
      "What question caused the longest pause?",
      "What project detail should I refresh before interviews?",
    ],
  },
];

export function getMonthKnowledge(monthId: string) {
  return monthKnowledge.find((month) => month.monthId === monthId);
}
