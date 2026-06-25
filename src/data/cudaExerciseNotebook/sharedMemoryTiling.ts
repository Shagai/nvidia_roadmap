import type { Exercise } from "./types";

export const sharedMemoryTilingExercises: Exercise[] = [
  {
    title: "Shared memory exercise 1 - Matrix addition reuse",
    question:
      "Consider matrix addition. Can shared memory reduce the global memory bandwidth consumption?",
    answer:
      "No. For plain matrix addition, shared memory does not reduce global memory bandwidth.",
    explanation: [
      "Each thread usually computes one output element C[row][col] = A[row][col] + B[row][col].",
      "That thread reads exactly one A element and one B element, and those input elements are not reused by neighboring threads.",
      "Putting the values in shared memory would add extra shared-memory traffic without avoiding any global-memory loads.",
    ],
  },
  {
    title: "Shared memory exercise 2 - 8 x 8 tiled matrix multiplication",
    question:
      "For an 8 x 8 matrix multiplication, compare 2 x 2 tiling with 4 x 4 tiling and verify that global input-memory traffic falls in proportion to tile width.",
    answer:
      "A 2 x 2 tile reduces input traffic by 2x; a 4 x 4 tile reduces it by 4x.",
    explanation: [
      "Without tiling, each of the 64 output elements reads 8 M values and 8 N values, so the input traffic is 64 * 16 = 1024 32-bit input loads.",
      "For T x T tiling, each loaded M element is reused by T output columns and each loaded N element is reused by T output rows.",
      "The tiled input-load count is 2 * 8^3 / T, so the reduction factor is T.",
    ],
    facts: [
      {
        label: "2 x 2 tiling",
        value:
          "16 output tiles * 4 phases/tile * (4 M values + 4 N values) = 512 input loads.",
      },
      {
        label: "4 x 4 tiling",
        value:
          "4 output tiles * 2 phases/tile * (16 M values + 16 N values) = 256 input loads.",
      },
      { label: "Check", value: "1024 / 512 = 2 and 1024 / 256 = 4." },
    ],
    code: `8 x 8 output, T = 2
4 x 4 grid of output tiles
4 phases per tile
8 input values per phase
16 * 4 * 8 = 512 input loads

8 x 8 output, T = 4
2 x 2 grid of output tiles
2 phases per tile
32 input values per phase
4 * 2 * 32 = 256 input loads`,
  },
  {
    title: "Shared memory exercise 3 - Missing __syncthreads in tiled matmul",
    question:
      "What incorrect execution behavior can happen if one or both __syncthreads() calls are omitted in a tiled matrix-multiplication kernel?",
    answer:
      "The kernel can read incomplete, stale, or overwritten shared-memory tile data and produce nondeterministic wrong results.",
    explanation: [
      "The first barrier makes sure every thread has finished loading the current M and N tiles before any thread uses those tiles.",
      "The second barrier makes sure every thread has finished computing with the current tiles before any thread overwrites shared memory with the next phase.",
      "If either ordering is missing, the result depends on the relative progress of warps and blocks, which is not a valid correctness assumption.",
    ],
  },
  {
    title: "Shared memory exercise 4 - Registers versus shared memory",
    question:
      "If capacity is not an issue for registers or shared memory, why might shared memory still be preferable for values fetched from global memory?",
    answer:
      "Shared memory is visible to all threads in a block; registers are private to one thread.",
    explanation: [
      "A value kept only in a register can be reused by the same thread, but other threads cannot directly read it.",
      "A value loaded into shared memory can be cooperatively loaded once and then reused by neighboring threads in the block.",
      "That inter-thread reuse is the reason tiled matrix multiplication uses shared memory for input tiles.",
    ],
  },
  {
    title: "Shared memory exercise 5 - 32 x 32 tile bandwidth reduction",
    question:
      "For a tiled matrix-matrix multiplication kernel with a 32 x 32 tile, what is the reduction in memory bandwidth usage for input matrices M and N?",
    answer:
      "The input bandwidth demand for M and N is reduced by a factor of 32 compared with the untiled kernel.",
    explanation: [
      "With a T x T tile, each loaded M element is used by T threads that compute different output columns.",
      "Each loaded N element is also used by T threads that compute different output rows.",
      "For T = 32, the reuse factor is 32, so the ideal global input traffic is 1/32 of the untiled traffic.",
    ],
  },
  {
    title: "Shared memory exercise 6 - Local variable versions",
    question:
      "A CUDA kernel is launched with 1000 thread blocks, each with 512 threads. If a variable is declared as a local variable in the kernel, how many versions are created over the kernel execution?",
    answer: "512,000 versions.",
    facts: [
      { label: "Blocks", value: "1000" },
      { label: "Threads per block", value: "512" },
      { label: "Local variable instances", value: "1000 * 512 = 512,000" },
    ],
    explanation: [
      "A local variable declared inside a kernel has one logical instance per thread.",
    ],
  },
  {
    title: "Shared memory exercise 7 - Shared variable versions",
    question:
      "In the previous launch, if a variable is declared as a shared-memory variable, how many versions are created over the kernel execution?",
    answer: "1000 versions.",
    explanation: [
      "A shared-memory variable has one instance per thread block, not one instance per thread.",
      "With 1000 blocks, the kernel creates 1000 block-local shared-memory instances.",
    ],
  },
  {
    title: "Shared memory exercise 8 - Input requests with and without tiling",
    question:
      "For multiplication of two N x N input matrices, how many times is each input element requested from global memory with no tiling, and with T x T tiles?",
    answer:
      "Without tiling, each input element is requested N times. With T x T tiling, each input element is requested N/T times.",
    explanation: [
      "An element of M contributes to N output columns, so an untiled one-thread-per-output kernel reloads it for those N outputs.",
      "An element of N contributes to N output rows for the same reason.",
      "With T x T tiling, one global load can serve T threads inside an output tile, so the request count falls from N to N/T.",
    ],
  },
  {
    title: "Shared memory exercise 9 - Compute-bound or memory-bound",
    question:
      "A kernel performs 36 floating-point operations and seven 32-bit global-memory accesses per thread. Is it compute-bound or memory-bound on devices with (a) 200 GFLOP/s and 100 GB/s, and (b) 300 GFLOP/s and 250 GB/s?",
    answer:
      "The kernel is memory-bound on device (a) and compute-bound on device (b).",
    facts: [
      { label: "Kernel arithmetic intensity", value: "36 OP / (7 * 4 B) = 36 / 28 = 1.29 OP/B" },
      { label: "Device (a) balance", value: "200 GFLOP/s / 100 GB/s = 2.00 OP/B, so 1.29 < 2.00 and memory is limiting." },
      { label: "Device (b) balance", value: "300 GFLOP/s / 250 GB/s = 1.20 OP/B, so 1.29 > 1.20 and compute is limiting." },
    ],
  },
  {
    title: "Shared memory exercise 10 - In-place tile transpose race",
    question:
      "A block-transpose kernel stores a BLOCK_WIDTH x BLOCK_WIDTH tile in shared memory, then writes the transposed shared-memory element back to the same global tile. BLOCK_WIDTH can be 1 to 20. For which values does the unsynchronized kernel execute correctly, and how should it be fixed?",
    answer:
      "Under the warp-synchronous assumption used by this exercise, only BLOCK_WIDTH values 1 through 5 are safe by accident. The correct fix is to add a barrier after loading the shared tile.",
    explanation: [
      "For BLOCK_WIDTH <= 5, the whole block has at most 25 threads, so each transpose partner is in the same 32-thread warp.",
      "For BLOCK_WIDTH >= 6, at least one pair of transposed elements can be owned by different warps, so a thread can read blockA[threadIdx.x][threadIdx.y] before its partner has written it.",
      "The root cause is a shared-memory read-after-write race. The code should also use one tile-width macro consistently if BLOCK_SIZE and BLOCK_WIDTH were intended to mean the same value.",
    ],
    code: `__global__ void BlockTranspose(float* A_elements, int A_width, int A_height)
{
    __shared__ float blockA[BLOCK_WIDTH][BLOCK_WIDTH];

    int baseIdx = blockIdx.x * BLOCK_WIDTH + threadIdx.x;
    baseIdx += (blockIdx.y * BLOCK_WIDTH + threadIdx.y) * A_width;

    blockA[threadIdx.y][threadIdx.x] = A_elements[baseIdx];
    __syncthreads();

    A_elements[baseIdx] = blockA[threadIdx.x][threadIdx.y];
}`,
  },
  {
    title: "Shared memory exercise 11 - Variable versions and OP/B",
    question:
      "For a kernel launched with N = 1024 and 128 threads per block, count the versions of local variable i, local array x[4], shared scalar y_s, shared array b_s[128], then compute shared memory per block and floating-point operations per global-memory byte.",
    answer:
      "There are 1024 versions of i, 1024 versions of x[4], 8 versions of y_s, and 8 versions of b_s[128]. The kernel uses 516 bytes of shared memory per block and has an arithmetic intensity of about 0.42 OP/B.",
    facts: [
      { label: "Blocks", value: "ceil(1024 / 128) = 8" },
      { label: "Threads", value: "8 * 128 = 1024" },
      { label: "i", value: "Local scalar, so one per thread: 1024 versions." },
      { label: "x[4]", value: "Local array, so one array per thread: 1024 arrays, or 4096 float elements." },
      { label: "y_s", value: "Shared scalar, so one per block: 8 versions." },
      { label: "b_s[128]", value: "Shared array, so one array per block: 8 arrays, or 1024 float elements." },
      { label: "Shared memory per block", value: "4 B for y_s + 128 * 4 B for b_s = 516 B." },
      { label: "Global memory bytes per thread", value: "4 loads from a, 1 load from b, 1 store to b: 6 * 4 B = 24 B." },
      { label: "Floating-point work", value: "5 multiplies + 5 adds = 10 FP operations." },
      { label: "OP/B", value: "10 / 24 = 0.4167 OP/B." },
    ],
    code: `__global__ void foo_kernel(float* a, float* b) {
    unsigned int i = blockIdx.x * blockDim.x + threadIdx.x;
    float x[4];
    __shared__ float y_s;
    __shared__ float b_s[128];

    for (unsigned int j = 0; j < 4; ++j) {
        x[j] = a[j * blockDim.x * gridDim.x + i];
    }

    if (threadIdx.x == 0) {
        y_s = 7.4f;
    }

    b_s[threadIdx.x] = b[i];
    __syncthreads();

    b[i] = 2.5f * x[0] + 3.7f * x[1] + 6.3f * x[2] + 8.5f * x[3]
        + y_s * b_s[threadIdx.x] + b_s[(threadIdx.x + 3) % 128];
}

void foo(float* a_d, float* b_d) {
    unsigned int N = 1024;
    foo_kernel<<<(N + 128 - 1) / 128, 128>>>(a_d, b_d);
}`,
  },
  {
    title: "Shared memory exercise 12 - Full occupancy checks",
    question:
      "A GPU has 2048 threads/SM, 32 blocks/SM, 65,536 registers/SM, and 96 KB shared memory/SM. Can these kernels reach full occupancy: (a) 64 threads/block, 27 registers/thread, 4 KB shared memory per block; (b) 256 threads/block, 31 registers/thread, 8 KB shared memory per block?",
    answer:
      "Case (a) cannot reach full occupancy because shared memory limits it to 75%. Case (b) can reach full occupancy.",
    explanation: [
      "The screenshot labels the shared-memory quantities as per SM, but occupancy calculations need per-block resource use; the calculation here treats 4 KB and 8 KB as per-block values.",
    ],
    facts: [
      { label: "Case (a) blocks for full occupancy", value: "2048 / 64 = 32 blocks." },
      { label: "Case (a) registers", value: "32 * 64 * 27 = 55,296 registers, which fits." },
      { label: "Case (a) shared memory", value: "32 * 4 KB = 128 KB, which exceeds 96 KB. Only floor(96 / 4) = 24 blocks fit." },
      { label: "Case (a) occupancy", value: "24 * 64 / 2048 = 75%; limiting factor is shared memory." },
      { label: "Case (b) blocks for full occupancy", value: "2048 / 256 = 8 blocks." },
      { label: "Case (b) registers", value: "8 * 256 * 31 = 63,488 registers, which fits under 65,536." },
      { label: "Case (b) shared memory", value: "8 * 8 KB = 64 KB, which fits under 96 KB." },
      { label: "Case (b) occupancy", value: "8 * 256 / 2048 = 100%." },
    ],
  },
];
