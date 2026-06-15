import type { Exercise } from "./types";

export const memoryExercises: Exercise[] = [
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
