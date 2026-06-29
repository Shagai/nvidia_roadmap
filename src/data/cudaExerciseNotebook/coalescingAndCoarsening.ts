import type { Exercise } from "./types";

export const coalescingAndCoarseningExercises: Exercise[] = [
  {
    title: "Coalescing exercise 1 - Corner-turned tiled matrix multiplication",
    question:
      "Write a matrix-multiplication kernel that matches the Figure 6.4 design: A is row-major, B is stored column-major, C is row-major, and the B tile is corner-turned through shared memory so global loads remain coalesced.",
    answer:
      "Load the A tile normally, load the B tile with the thread x/y roles swapped for the column-major global layout, store that B tile transposed in shared memory, then compute C from the shared tiles.",
    explanation: [
      "For A, adjacent lanes load adjacent columns from the same output row.",
      "For column-major B, adjacent lanes should load adjacent rows from the same B column, so the load uses threadIdx.x for the B row and threadIdx.y for the B column.",
      "The shared-memory B tile is stored as Btile[threadIdx.x][threadIdx.y], which restores the usual Btile[k][threadIdx.x] access during the dot product.",
    ],
    code: `#define TILE_WIDTH 32

__global__ void matmul_corner_turn_kernel(
    const float* A,
    const float* B_col_major,
    float* C,
    int width)
{
    __shared__ float Atile[TILE_WIDTH][TILE_WIDTH];
    __shared__ float Btile[TILE_WIDTH][TILE_WIDTH];

    int tx = threadIdx.x;
    int ty = threadIdx.y;
    int row = blockIdx.y * TILE_WIDTH + ty;
    int col = blockIdx.x * TILE_WIDTH + tx;

    float sum = 0.0f;
    int phases = (width + TILE_WIDTH - 1) / TILE_WIDTH;

    for (int ph = 0; ph < phases; ++ph) {
        int aCol = ph * TILE_WIDTH + tx;
        int bRow = ph * TILE_WIDTH + tx;
        int bCol = blockIdx.x * TILE_WIDTH + ty;

        Atile[ty][tx] = (row < width && aCol < width)
            ? A[row * width + aCol]
            : 0.0f;

        Btile[tx][ty] = (bRow < width && bCol < width)
            ? B_col_major[bCol * width + bRow]
            : 0.0f;

        __syncthreads();

        for (int k = 0; k < TILE_WIDTH; ++k) {
            sum += Atile[ty][k] * Btile[k][tx];
        }

        __syncthreads();
    }

    if (row < width && col < width) {
        C[row * width + col] = sum;
    }
}`,
  },
  {
    title: "Coalescing exercise 2 - BLOCK_SIZE values that avoid uncoalesced global accesses",
    question:
      "For square-block tiled matrix multiplication, what values of BLOCK_SIZE completely avoid uncoalesced global-memory accesses?",
    answer:
      "For the normal square block range up to 32 x 32 threads, BLOCK_SIZE = 32 is the practical value that keeps every full warp on one contiguous row or column segment.",
    explanation: [
      "A square B x B block has B * B threads, so the usual 1024-thread block limit gives B <= 32.",
      "When B = 32, each warp maps to one tile row for row-major A and C, and one corner-turned column-major B segment in the Figure 6.4 design.",
      "When B < 32, a warp spans multiple tile rows. For a general matrix width, those row segments are separated in global memory, so the warp cannot be treated as one contiguous access pattern.",
    ],
    facts: [
      { label: "Allowed square range", value: "1 <= BLOCK_SIZE <= 32 under a 1024-thread block limit." },
      { label: "Fully coalesced practical choice", value: "BLOCK_SIZE = 32." },
      { label: "General rule", value: "The tile width must line up with the 32-thread warp width; within the usual range, that leaves only 32." },
    ],
  },
  {
    title: "Coalescing exercise 3 - Classifying each memory access",
    question:
      "For the CUDA kernel below, classify each listed access as coalesced, uncoalesced, or not applicable.",
    questionCode: `__global__ void foo_kernel(
    float* a,
    float* b,
    float* c,
    float* d,
    float* e)
{
    unsigned int i = blockIdx.x * blockDim.x + threadIdx.x;
    __shared__ float a_s[256];
    __shared__ float bc_s[4 * 256];

    a_s[threadIdx.x] = a[i];  // line 05

    for (unsigned int j = 0; j < 4; ++j) {
        bc_s[j * 256 + threadIdx.x] =
            b[j * blockDim.x * gridDim.x + i] + c[i * 4 + j];  // line 07
    }

    __syncthreads();

    d[i * 8] = a_s[threadIdx.x];  // line 10
    e[i * 8] = bc_s[threadIdx.x * 4];  // line 11
}`,
    answer:
      "The global accesses to a and b are coalesced; the global accesses to c, d, and e are uncoalesced; coalescing is not applicable to the shared-memory arrays a_s and bc_s.",
    explanation: [
      "Coalescing describes how a warp's global-memory addresses combine into transactions. Shared memory has a different issue: bank conflicts.",
      "The address expression i is contiguous across neighboring lanes, while i * 4 and i * 8 are strided across neighboring lanes.",
    ],
    facts: [
      { label: "a. a on line 05", value: "Coalesced: neighboring lanes read a[i], a[i + 1], a[i + 2], and so on." },
      { label: "b. a_s on line 05", value: "Not applicable: a_s is shared memory, not global memory." },
      { label: "c. b on line 07", value: "Coalesced: for a fixed j, the term j * blockDim.x * gridDim.x is constant and i is contiguous across the warp." },
      { label: "d. c on line 07", value: "Uncoalesced: c[i * 4 + j] has a stride of 4 floats between neighboring lanes for each fixed j." },
      { label: "e. bc_s on line 07", value: "Not applicable: bc_s is shared memory." },
      { label: "f. d on line 10", value: "Uncoalesced: d[i * 8] has a stride of 8 floats between neighboring lanes." },
      { label: "g. a_s on line 10", value: "Not applicable: a_s is shared memory." },
      { label: "h. bc_s on line 11", value: "Not applicable: bc_s is shared memory." },
      { label: "i. e on line 11", value: "Uncoalesced: e[i * 8] has a stride of 8 floats between neighboring lanes." },
    ],
  },
  {
    title: "Coalescing exercise 4 - OP/B for three matrix-multiplication kernels",
    question:
      "What is the floating-point operation to global-memory access ratio in OP/B for simple matrix multiplication, 32 x 32 shared-memory tiling, and 32 x 32 tiling with thread coarsening factor 4?",
    answer:
      "Using the standard large-matrix input-traffic convention, the three ratios are 0.25 OP/B, 8 OP/B, and 12.8 OP/B.",
    explanation: [
      "A multiply-add counts as 2 floating-point operations.",
      "The simple kernel gets no input reuse, so it performs about 2 operations for every 8 bytes of input loads.",
      "A T x T shared-memory tile reuses each loaded input value T times, raising the ratio to T / 4 OP/B.",
      "With coarsening factor C, one A tile is reused across C output tiles while C B tiles are loaded, so the ratio is C * T / (2 * (C + 1)) OP/B.",
    ],
    facts: [
      { label: "a. Simple Chapter 3 kernel", value: "2 OP / (2 floats * 4 B) = 2 / 8 = 0.25 OP/B." },
      { label: "b. 32 x 32 shared-memory tile", value: "T / 4 = 32 / 4 = 8 OP/B." },
      { label: "c. 32 x 32 tile, coarsening factor 4", value: "C * T / (2 * (C + 1)) = 4 * 32 / (2 * 5) = 12.8 OP/B." },
      { label: "Output stores", value: "If included exactly, output stores add one 4-byte store per output element; for large matrices, the book-style ratios above are the dominant input-traffic ratios." },
    ],
  },
];
