import type { Exercise } from "./types";

export const geometryExercises: Exercise[] = [
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
