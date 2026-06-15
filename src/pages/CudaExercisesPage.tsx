import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";

const shareUrl = "https://chatgpt.com/share/6a2ffca3-15d4-83eb-9067-762b8e8378ac";

type Exercise = {
  answer: string;
  code?: string;
  explanation?: string[];
  facts?: Array<{ label: string; value: string }>;
  question: string;
  title: string;
};

const indexingExercises: Exercise[] = [
  {
    title: "Exercise 1 - Two adjacent elements per thread",
    question:
      "In a vector-addition kernel, each CUDA thread processes two adjacent elements. Which expression should compute the first array index i handled by the thread?",
    answer: "C. i = (blockIdx.x * blockDim.x + threadIdx.x) * 2",
    explanation: [
      "First compute the normal global thread id: blockIdx.x * blockDim.x + threadIdx.x.",
      "Because each thread owns two adjacent elements, multiply that thread id by 2.",
      "Thread 0 handles elements 0 and 1, thread 1 handles 2 and 3, and so on.",
    ],
    code: `int i = (blockIdx.x * blockDim.x + threadIdx.x) * 2;

if (i < n) {
    C[i] = A[i] + B[i];
}

if (i + 1 < n) {
    C[i + 1] = A[i + 1] + B[i + 1];
}`,
  },
  {
    title: "Exercise 2 - Two sections per block",
    question:
      "In a vector-addition kernel, each thread block processes 2 * blockDim.x consecutive elements, split into two sections. Which expression should compute the first-section index i for each thread?",
    answer: "D. i = blockIdx.x * blockDim.x * 2 + threadIdx.x",
    explanation: [
      "Each block covers twice as many elements as it has threads.",
      "The start of a block is blockIdx.x * blockDim.x * 2.",
      "threadIdx.x selects the element in the first section. The matching second-section element is i + blockDim.x.",
    ],
    code: `int i = blockIdx.x * blockDim.x * 2 + threadIdx.x;

if (i < n) {
    C[i] = A[i] + B[i];
}

if (i + blockDim.x < n) {
    C[i + blockDim.x] = A[i + blockDim.x] + B[i + blockDim.x];
}`,
  },
];

const runtimeExercises: Exercise[] = [
  {
    title: "Exercise 3 - cudaMalloc byte count",
    question:
      "Allocate an array of v integer elements in CUDA device global memory. What should the second argument of cudaMalloc be?",
    answer: "D. v * sizeof(int)",
    explanation: [
      "cudaMalloc receives the number of bytes to allocate, not the number of elements.",
      "For v integers, the byte count is v multiplied by sizeof(int).",
    ],
    code: `int *A_d;
cudaMalloc((void**)&A_d, v * sizeof(int));`,
  },
  {
    title: "Exercise 4 - cudaMalloc pointer argument",
    question:
      "Allocate an array of n floating-point elements on the GPU and make A_d point to it. What should the first argument of cudaMalloc be?",
    answer: "D. (void**)&A_d",
    explanation: [
      "cudaMalloc must write the allocated device address into A_d.",
      "That means it needs the address of the pointer variable, &A_d.",
      "The CUDA runtime API expects a generic pointer-to-pointer, so the argument is cast to (void**).",
    ],
    code: `float *A_d;
cudaMalloc((void**)&A_d, n * sizeof(float));`,
  },
  {
    title: "Exercise 5 - Host-to-device copy",
    question: "Copy 3000 bytes from host array A_h to device array A_d. Which cudaMemcpy call is correct?",
    answer: "C. cudaMemcpy(A_d, A_h, 3000, cudaMemcpyHostToDevice)",
    explanation: [
      "The cudaMemcpy argument order is destination, source, number of bytes, direction.",
      "Here the destination is A_d, the source is A_h, and the direction is cudaMemcpyHostToDevice.",
    ],
    code: `cudaMemcpy(A_d, A_h, 3000, cudaMemcpyHostToDevice);`,
  },
  {
    title: "Exercise 6 - CUDA error variable",
    question: "Declare a variable err that can receive the return value of a CUDA API call.",
    answer: "C. cudaError_t err",
    explanation: [
      "CUDA runtime API calls usually return cudaError_t.",
      "cudaSuccess is not a type. It is a value of type cudaError_t meaning no error.",
    ],
    code: `cudaError_t err;

err = cudaMalloc((void**)&A_d, n * sizeof(float));

if (err != cudaSuccess) {
    printf("CUDA error: %s\\n", cudaGetErrorString(err));
}`,
  },
];

const matrixExercises: Exercise[] = [
  {
    title: "Exercise 7 - Matrix multiplication: one thread per output row",
    question:
      "Assume A is M x K, B is K x N, C is M x N, and row-major storage uses C[row * N + col]. Write a matrix-matrix multiplication variant where one CUDA thread computes one complete output row of C.",
    answer: "Use M logical threads. Each thread chooses one row and loops over every output column.",
    explanation: [
      "This is correct but usually not the fastest CUDA design because it exposes only M threads.",
      "Each thread performs all N dot products for its row.",
    ],
    code: `__global__ void matmul_row_kernel(
    const float* A,
    const float* B,
    float* C,
    int M,
    int K,
    int N)
{
    int row = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < M) {
        for (int col = 0; col < N; ++col) {
            float sum = 0.0f;

            for (int k = 0; k < K; ++k) {
                sum += A[row * K + k] * B[k * N + col];
            }

            C[row * N + col] = sum;
        }
    }
}`,
  },
  {
    title: "Exercise 8 - Matrix multiplication: one thread per output column",
    question:
      "Write a matrix-matrix multiplication variant where one CUDA thread computes one complete output column of C.",
    answer: "Use N logical threads. Each thread chooses one column and loops over every output row.",
    explanation: [
      "This is also correct but exposes only N threads.",
      "In row-major memory, a single thread walking down a column uses strided output addresses.",
    ],
    code: `__global__ void matmul_col_kernel(
    const float* A,
    const float* B,
    float* C,
    int M,
    int K,
    int N)
{
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (col < N) {
        for (int row = 0; row < M; ++row) {
            float sum = 0.0f;

            for (int k = 0; k < K; ++k) {
                sum += A[row * K + k] * B[k * N + col];
            }

            C[row * N + col] = sum;
        }
    }
}`,
  },
  {
    title: "Exercise 9 - Matrix-vector multiplication",
    question:
      "Write a CUDA kernel for A[i] = sum over j of B[i][j] * C[j], where B is an n x n row-major matrix and A and C are vectors.",
    answer: "Use one thread per output vector element A[i].",
    explanation: [
      "Each thread chooses i, walks across row i of B, accumulates the dot product with C, and stores A[i].",
    ],
    code: `__global__ void matvec_kernel(
    float* A,
    const float* B,
    const float* C,
    int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;

    if (i < n) {
        float sum = 0.0f;

        for (int j = 0; j < n; ++j) {
            sum += B[i * n + j] * C[j];
        }

        A[i] = sum;
    }
}`,
  },
];

const geometryExercises: Exercise[] = [
  {
    title: "Exercise 10 - 2D launch geometry",
    question:
      "Given M = 150, N = 300, dim3 bd(16, 32), and dim3 gd((N - 1) / 16 + 1, (M - 1) / 32 + 1), find the threads per block, grid dimensions, total blocks, total launched threads, and threads that execute the guarded work.",
    answer: "512 threads per block, grid dimensions 19 x 5, 95 blocks, 48,640 launched threads, and 45,000 valid guarded threads.",
    facts: [
      { label: "Threads per block", value: "16 * 32 = 512" },
      { label: "gd.x", value: "(300 - 1) / 16 + 1 = 299 / 16 + 1 = 18 + 1 = 19" },
      { label: "gd.y", value: "(150 - 1) / 32 + 1 = 149 / 32 + 1 = 4 + 1 = 5" },
      { label: "Blocks in grid", value: "19 * 5 = 95" },
      { label: "Threads launched", value: "95 * 512 = 48,640" },
      { label: "Threads passing row < M && col < N", value: "150 * 300 = 45,000" },
    ],
    code: `unsigned int M = 150;
unsigned int N = 300;

dim3 bd(16, 32);
dim3 gd((N - 1) / 16 + 1, (M - 1) / 32 + 1);`,
  },
  {
    title: "Exercise 11 - 2D row-major flattening",
    question: "Given width = 400, height = 500, row = 20, and col = 10, compute the row-major flat index.",
    answer: "index = row * width + col = 20 * 400 + 10 = 8,010",
    explanation: ["In row-major 2D storage, the column is the fastest-changing index."],
  },
  {
    title: "Exercise 12 - 2D column-major flattening",
    question: "Given width = 400, height = 500, row = 20, and col = 10, compute the column-major flat index.",
    answer: "index = col * height + row = 10 * 500 + 20 = 5,020",
    explanation: ["In column-major 2D storage, rows are contiguous inside each column."],
  },
  {
    title: "Exercise 13 - 3D row-major flattening",
    question:
      "Given width = 400, height = 500, depth = 300, and point (x, y, z) = (10, 20, 5), compute the 3D row-major flat index for A[z][y][x].",
    answer: "index = z * height * width + y * width + x = 5 * 500 * 400 + 20 * 400 + 10 = 1,008,010",
    explanation: [
      "C/C++ row-major means the rightmost index changes fastest.",
      "For A[z][y][x], x is the fastest-changing coordinate, then y, then z.",
    ],
  },
];

const memoryExercises: Exercise[] = [
  {
    title: "Exercise 14 - Why CUDA sizes are in bytes",
    question:
      "Explain why CUDA functions such as cudaMalloc ask for a number of bytes instead of a number of elements.",
    answer:
      "Memory is a flat sequence of bytes. CUDA needs the exact byte count, so an element count must be multiplied by sizeof(element_type).",
    explanation: [
      "Each address refers to one byte.",
      "An int or float normally occupies 4 consecutive bytes, while a double normally occupies 8 bytes.",
      "If you allocate n floats, the requested memory size is n * sizeof(float), not just n.",
    ],
    code: `float *A_d;
cudaMalloc((void**)&A_d, n * sizeof(float));`,
  },
  {
    title: "Exercise 15 - Array addresses",
    question:
      "If float A[5] starts at byte address 1000 and sizeof(float) is 4, what address does A[3] start at?",
    answer: "A[3] starts at address 1012.",
    explanation: [
      "Arrays are stored consecutively.",
      "The address of A[i] is base_address + i * sizeof(float).",
      "For A[3], that is 1000 + 3 * 4 = 1012.",
    ],
  },
  {
    title: "Exercise 16 - Flattening a 2D matrix",
    question:
      "In row-major storage, how is matrix[row][col] mapped into a flat one-dimensional array when the matrix has width columns?",
    answer: "matrix[row][col] maps to matrix[row * width + col].",
    explanation: [
      "The computer memory is not really two-dimensional; it is one long sequence of bytes.",
      "For a 3 x 4 matrix, matrix[2][1] maps to flat index 2 * 4 + 1 = 9.",
      "CUDA kernels usually compute a flat index before reading or writing global memory.",
    ],
    code: `int row = blockIdx.y * blockDim.y + threadIdx.y;
int col = blockIdx.x * blockDim.x + threadIdx.x;
int i = row * width + col;`,
  },
  {
    title: "Exercise 17 - Correcting a 3D row-major formula",
    question:
      "In row-major order, should the 3D flat index for width = 400, height = 500, depth = 300, and point (x, y, z) be x * depth * width + y * height + z?",
    answer:
      "No. For the common CUDA convention A[z][y][x], the row-major index is z * height * width + y * width + x.",
    explanation: [
      "Row-major does not mean start with x. It means the rightmost index changes fastest.",
      "For A[z][y][x], x is the rightmost and fastest-changing coordinate.",
      "With x = 10, y = 20, z = 5, the index is 5 * 500 * 400 + 20 * 400 + 10 = 1,008,010.",
      "If the tensor were declared as A[x][y][z], then the row-major formula would be x * height * depth + y * depth + z.",
    ],
  },
];

const warpExercises: Exercise[] = [
  {
    title: "Exercise 18 - Warps per block and grid",
    question: "Given N = 1024 and block size = 128 threads, how many blocks, warps per block, and total warps are launched?",
    answer: "8 blocks, 4 warps per block, and 32 warps in the grid.",
    facts: [
      { label: "Blocks", value: "(1024 + 128 - 1) / 128 = 8" },
      { label: "Warps per block", value: "128 / 32 = 4" },
      { label: "Total warps", value: "8 * 4 = 32" },
    ],
  },
  {
    title: "Exercise 19 - Divergence for threadIdx.x < 40 || threadIdx.x >= 104",
    question:
      "For a 128-thread block and line 04 executing only when threadIdx.x < 40 || threadIdx.x >= 104, how many active and divergent warps are there in the grid?",
    answer: "24 active warps and 16 divergent warps.",
    explanation: [
      "Per block, warp 0 is fully active, warp 1 is partially active for lanes 32-39, warp 2 is inactive, and warp 3 is partially active for lanes 104-127.",
      "That gives 3 active warps per block and 2 divergent warps per block.",
      "Across 8 blocks, that is 24 active warps and 16 divergent warps.",
    ],
  },
  {
    title: "Exercise 20 - SIMD efficiency for line 04",
    question:
      "For line 04 in block 0, what is the SIMD efficiency of warp 0, warp 1, and warp 3?",
    answer: "Warp 0 = 100%, warp 1 = 25%, warp 3 = 75%.",
    facts: [
      { label: "Warp 0", value: "Threads 0-31 all execute: 32 / 32 = 100%" },
      { label: "Warp 1", value: "Threads 32-39 execute: 8 / 32 = 25%" },
      { label: "Warp 3", value: "Threads 104-127 execute: 24 / 32 = 75%" },
    ],
  },
  {
    title: "Exercise 21 - Divergence for i % 2 == 0",
    question:
      "For line 07 executing only when i % 2 == 0, how many active warps, divergent warps, and what SIMD efficiency does each warp have?",
    answer: "32 active warps, 32 divergent warps, and 50% SIMD efficiency.",
    explanation: [
      "Every warp contains even and odd indices.",
      "Only the even lanes execute, so every warp is active and every warp diverges.",
      "Half of each warp executes the statement: 16 / 32 = 50%.",
    ],
  },
  {
    title: "Exercise 22 - Loop divergence for j < 5 - (i % 3)",
    question:
      "For the loop for (unsigned int j = 0; j < 5 - (i % 3); ++j), how many iterations execute without divergence and how many have divergence?",
    answer: "3 iterations without divergence and 2 iterations with divergence.",
    explanation: [
      "If i % 3 == 0, the thread runs 5 iterations.",
      "If i % 3 == 1, the thread runs 4 iterations.",
      "If i % 3 == 2, the thread runs 3 iterations.",
      "Iterations j = 0, 1, and 2 execute for everyone. Iterations j = 3 and 4 execute only for some lanes.",
    ],
  },
];

const occupancyExercises: Exercise[] = [
  {
    title: "Exercise 23 - Vector addition launch size",
    question:
      "For vector addition with length 2000 and block size 512, how many threads are launched, and how many do useful work?",
    answer: "4 blocks launch 2048 threads. 2000 threads do useful work and 48 are guard threads.",
    facts: [
      { label: "Blocks", value: "ceil(2000 / 512) = 4" },
      { label: "Launched threads", value: "4 * 512 = 2048" },
      { label: "Useful threads", value: "2000" },
      { label: "Guard threads", value: "2048 - 2000 = 48" },
    ],
  },
  {
    title: "Exercise 24 - Boundary-check divergent warps",
    question:
      "For the same vector-addition kernel, how many warps diverge because of the boundary check?",
    answer: "1 divergent warp.",
    explanation: [
      "The final block covers indices 1536 to 2047.",
      "Valid indices end at 1999, so the final block has 464 valid threads and 48 invalid threads.",
      "That gives 14 full valid warps, 1 partially valid warp, and 1 fully invalid warp.",
      "Only the partially valid warp diverges.",
    ],
  },
  {
    title: "Exercise 25 - Barrier waiting time",
    question:
      "Given thread execution times 2.0, 2.3, 3.0, 2.8, 2.4, 1.9, 2.6, and 2.9 microseconds before a barrier, what percentage of the total barrier-aligned time is waiting?",
    answer: "About 17.1%.",
    facts: [
      { label: "Slowest thread", value: "3.0 microseconds" },
      { label: "Total aligned time", value: "8 * 3.0 = 24.0 microsecond-thread units" },
      { label: "Useful work time", value: "2.0 + 2.3 + 3.0 + 2.8 + 2.4 + 1.9 + 2.6 + 2.9 = 19.9" },
      { label: "Waiting time", value: "24.0 - 19.9 = 4.1" },
      { label: "Waiting percentage", value: "4.1 / 24.0 * 100 = 17.08%" },
    ],
  },
  {
    title: "Exercise 26 - Synchronization with 32-thread blocks",
    question: "Can __syncthreads() be omitted just because a block has only 32 threads?",
    answer: "No. Do not omit synchronization just because the block has one warp.",
    explanation: [
      "Relying on implicit warp lockstep is unsafe on modern NVIDIA GPUs with independent thread scheduling.",
      "If block threads communicate through shared memory, use __syncthreads().",
      "For warp-level synchronization, use __syncwarp().",
    ],
  },
  {
    title: "Exercise 27 - SM limit: 1536 threads and 4 blocks",
    question:
      "An SM can hold at most 1536 resident threads and 4 resident blocks. Which block size among 128, 256, 512, and 1024 gives the most resident threads?",
    answer: "512 threads per block.",
    facts: [
      { label: "128 threads/block", value: "4 blocks fit: 4 * 128 = 512 threads" },
      { label: "256 threads/block", value: "4 blocks fit: 4 * 256 = 1024 threads" },
      { label: "512 threads/block", value: "3 blocks fit: 3 * 512 = 1536 threads" },
      { label: "1024 threads/block", value: "1 block fits: 1 * 1024 = 1024 threads" },
    ],
  },
  {
    title: "Exercise 28 - SM limit: 64 blocks and 2048 threads",
    question:
      "An SM can hold at most 64 resident blocks and 2048 resident threads. Which listed resident-block/thread configurations reach full occupancy?",
    answer: "Cases d and e reach 100% occupancy.",
    facts: [
      { label: "a: 8 blocks, 128 threads/block", value: "1024 threads, 50% occupancy" },
      { label: "b: 16 blocks, 64 threads/block", value: "1024 threads, 50% occupancy" },
      { label: "c: 32 blocks, 32 threads/block", value: "1024 threads, 50% occupancy" },
      { label: "d: 64 blocks, 32 threads/block", value: "2048 threads, 100% occupancy" },
      { label: "e: 32 blocks, 64 threads/block", value: "2048 threads, 100% occupancy" },
    ],
  },
  {
    title: "Exercise 29 - Register limits and occupancy",
    question:
      "Given 2048 threads per SM, 32 blocks per SM, and 65536 registers per SM, decide whether each register/thread case can reach full occupancy.",
    answer: "128x30 can reach full occupancy; 32x29 is limited to 50%; 256x34 is limited to 87.5%.",
    facts: [
      { label: "128 threads/block, 30 registers/thread", value: "16 blocks need 61,440 registers, so full occupancy fits" },
      { label: "32 threads/block, 29 registers/thread", value: "64 blocks would be needed, but max blocks is 32, so occupancy is 1024 / 2048 = 50%" },
      { label: "256 threads/block, 34 registers/thread", value: "8 blocks need 69,632 registers, so only 7 blocks fit: 1792 / 2048 = 87.5%" },
    ],
  },
  {
    title: "Exercise 30 - Invalid 32 x 32 matrix block",
    question:
      "A student launches matrix multiplication with a 32 x 32 thread block on a device that supports only 512 threads per block. Is the launch valid?",
    answer: "No. A 32 x 32 block has 1024 threads, which exceeds the 512-thread device limit.",
    explanation: [
      "The launch should fail with an invalid configuration error.",
      "Use a shape such as 16 x 16 for 256 threads or 32 x 16 for 512 threads.",
    ],
    code: `dim3 blockDim(16, 16);  // 256 threads
// or
dim3 blockDim(32, 16);  // 512 threads`,
  },
];

const sections = [
  { id: "indexing", title: "Indexing", exercises: indexingExercises },
  { id: "runtime-api", title: "CUDA runtime API", exercises: runtimeExercises },
  { id: "matrix", title: "Matrix kernels", exercises: matrixExercises },
  { id: "geometry", title: "Launch geometry and flattening", exercises: geometryExercises },
  { id: "memory", title: "Memory model clarifications", exercises: memoryExercises },
  { id: "warps", title: "Warp divergence", exercises: warpExercises },
  { id: "occupancy", title: "Occupancy and synchronization", exercises: occupancyExercises },
];

export function CudaExercisesPage() {
  return (
    <EssayLayout
      eyebrow="CUDA exercise notebook"
      title="Solved CUDA exercises"
      dek="Questions and solutions are paired one after another so the problem statement is visible before each answer."
      toc={[
        { id: "overview", label: "Overview" },
        { id: "indexing", label: "Indexing" },
        { id: "runtime-api", label: "Runtime API" },
        { id: "matrix", label: "Matrix kernels" },
        { id: "geometry", label: "Geometry" },
        { id: "memory", label: "Memory model" },
        { id: "warps", label: "Warps" },
        { id: "occupancy", label: "Occupancy" },
      ]}
    >
      <Section id="overview" title="Format">
        <Callout title="Source">
          These notes are condensed from the shared CUDA exercise chat. The original transcript is
          available at{" "}
          <a href={shareUrl} target="_blank" rel="noreferrer">
            this ChatGPT share
          </a>
          .
        </Callout>
        <p>
          Each tile below is stacked full-width and follows the same order: question first, direct
          solution second, then the supporting calculation or code.
        </p>
      </Section>

      {sections.map((section) => (
        <Section id={section.id} title={section.title} key={section.id}>
          <div className="exercise-list">
            {section.exercises.map((exercise) => (
              <ExerciseTile exercise={exercise} key={exercise.title} />
            ))}
          </div>
        </Section>
      ))}

      <Section id="next" title="Related study page">
        <p>
          For the broader execution model behind these calculations, use the{" "}
          <Link to="/cuda-kb/execution-model">CUDA execution model guide</Link>.
        </p>
      </Section>
    </EssayLayout>
  );
}

function ExerciseTile({ exercise }: { exercise: Exercise }) {
  return (
    <article className="exercise-card">
      <header>
        <p>Question</p>
        <h3>{exercise.title}</h3>
      </header>
      <p className="exercise-question">{exercise.question}</p>
      <div className="exercise-solution">
        <p className="exercise-label">Solution</p>
        <p className="exercise-answer">{exercise.answer}</p>
        {exercise.explanation ? (
          <ul className="exercise-explanation">
            {exercise.explanation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {exercise.facts ? (
          <ul className="exercise-result-list">
            {exercise.facts.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.label}</strong>
                <span>{fact.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {exercise.code ? <CodeBlock>{exercise.code}</CodeBlock> : null}
      </div>
    </article>
  );
}
