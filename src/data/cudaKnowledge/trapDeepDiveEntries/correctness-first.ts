import type { CudaMentalModelTrapDeepDive } from "../types";

export const correctnessFirstDeepDive: CudaMentalModelTrapDeepDive = {
    slug: "correctness-first",
    title: "Correctness Comes Before Optimization",
    trapTitle: "Correctness deferred until after optimization",
    summary:
      "A CUDA optimization is only meaningful after a CPU reference and a simple CUDA baseline prove what correct output means.",
    sourceIds: ["programming-guide", "best-practices", "compute-sanitizer"],
    sections: [
      {
        title: "What this mistake means",
        paragraphs: [
          "The mistake is starting with an optimized CUDA kernel before proving that the simple version is correct. It feels productive to add shared memory, tiling, streams, vectorized loads, loop unrolling, fused operations, complicated indexing, and multiple kernels.",
          "When the output is wrong, the debugging surface becomes too large. The bug could be in the algorithm, CUDA indexing, memory allocation, copies, shared-memory tile, synchronization, boundary conditions, floating-point tolerance, stream ordering, or race conditions.",
        ],
      },
      {
        title: "Correct order of development",
        bullets: [
          "Write the CPU reference.",
          "Write the naive CUDA kernel.",
          "Compare CUDA output against CPU output.",
          "Add timing.",
          "Optimize one thing at a time.",
          "Compare again after every optimization.",
        ],
      },
      {
        title: "CPU reference and naive CUDA baseline",
        paragraphs: [
          "The CPU reference is the contract. The naive CUDA kernel is the first GPU baseline. For vector addition, one thread owns one output element and uses a bounds guard.",
        ],
        codeLanguage: "cpp",
        code: `void vector_add_cpu(const float* a, const float* b, float* c, int n)
{
    for (int i = 0; i < n; ++i) {
        c[i] = a[i] + b[i];
    }
}

__global__ void vector_add_gpu(const float* a,
                               const float* b,
                               float* c,
                               int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}`,
      },
      {
        title: "Mismatch reporting",
        paragraphs: [
          "A correctness harness does not need to be elaborate at first. It needs to tell you where the first mismatch is and how large the difference is.",
        ],
        codeLanguage: "cpp",
        code: `for (int i = 0; i < n; ++i) {
    float diff = std::abs(c_cpu[i] - c_gpu[i]);
    if (diff > 1e-5f) {
        std::cout << "Mismatch at " << i
                  << ": CPU = " << c_cpu[i]
                  << ", GPU = " << c_gpu[i]
                  << ", diff = " << diff
                  << "\\n";
        break;
    }
}`,
      },
      {
        title: "Why the naive CUDA kernel matters",
        paragraphs: [
          "The optimized CUDA version should be compared against the CPU result for correctness and against the naive CUDA result for performance improvement.",
          "For matrix multiplication, the CPU reference defines C[i][j] as the sum over k. The naive CUDA version might assign one thread to one C[i][j] and read A and B directly from global memory. Only after that is correct should shared-memory tiling, coalesced loads, thread blocking, or Tensor Core paths enter the experiment.",
        ],
      },
      {
        title: "Floating-point warning",
        paragraphs: [
          "CPU and GPU results may not be bit-identical. This is especially true for reductions, matrix multiplication, and sums because floating-point addition is not associative.",
          "Do not usually compare floats with ==. Use an absolute and relative tolerance that matches the operation.",
        ],
        codeLanguage: "cpp",
        code: `bool close(float x, float y)
{
    float abs_err = std::abs(x - y);
    float scale = std::max(std::abs(x), std::abs(y));
    float rel_err = scale == 0.0f ? abs_err : abs_err / scale;

    return abs_err < 1e-5f || rel_err < 1e-5f;
}`,
      },
      {
        title: "Better development loop",
        codeLanguage: "text",
        code: `CPU reference correct?
        |
        v
Naive CUDA correct?
        |
        v
Naive CUDA timed?
        |
        v
One optimization added
        |
        v
Still correct?
        |
        v
Faster?
        |
        v
Keep or revert`,
        paragraphs: [
          "This prevents you from accumulating five optimizations and then discovering that the output has been wrong since the first change.",
          "The habit is simple: Make it correct. Make it measurable. Then make it fast.",
        ],
      },
    ],
  };
