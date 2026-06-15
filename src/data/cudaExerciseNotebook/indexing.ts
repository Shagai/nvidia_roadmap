import type { Exercise } from "./types";

export const indexingExercises: Exercise[] = [
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
