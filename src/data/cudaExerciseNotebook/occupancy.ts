import type { Exercise } from "./types";

export const occupancyExercises: Exercise[] = [
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
