import type { Exercise } from "./types";

export const matrixExercises: Exercise[] = [
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
