import type { Exercise } from "./types";

export const runtimeExercises: Exercise[] = [
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
