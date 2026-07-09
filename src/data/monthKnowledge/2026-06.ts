import type { MonthKnowledge } from "../../types";
import {
  cudaFundamentalsInterviewAnswers,
  cudaFundamentalsLabProjects,
  cudaFundamentalsPortfolioEvidence,
  cudaFundamentalsReferences,
} from "../cudaFundamentals";

export const knowledge202606: MonthKnowledge = {
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
        codeLanguage: "cuda",
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
        codeLanguage: "cuda",
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
        codeLanguage: "cuda",
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
        codeLanguage: "cuda",
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
  };
