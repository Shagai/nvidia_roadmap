import type { CudaCommand } from "./types";

export const cudaCommands: CudaCommand[] = [
  {
    command: "nvidia-smi",
    use: "Check visible GPUs, driver version, memory use, clocks, and whether another process is occupying the device.",
    proof: "Paste the GPU model and driver context into the benchmark environment section.",
  },
  {
    command: "nvcc --version",
    use: "Check the CUDA compiler version used to build the project.",
    proof: "Record the version beside benchmark tables and build logs.",
  },
  {
    command: "cmake -S . -B build -DCMAKE_BUILD_TYPE=Release",
    use: "Configure a reproducible release build for performance measurements.",
    proof: "README has the exact configure command and build type.",
  },
  {
    command: "cmake --build build -j",
    use: "Build the configured CUDA/C++ project without relying on IDE state.",
    proof: "A reviewer can rebuild from a clean checkout.",
  },
  {
    command: "compute-sanitizer --tool memcheck ./build/cuda_lab",
    use: "Catch invalid memory access and related runtime errors before trusting output or speed.",
    proof: "Optimization notes include a clean sanitizer run or explain any unsupported case.",
  },
  {
    command: "compute-sanitizer --tool racecheck ./build/cuda_lab",
    use: "Inspect shared-memory and synchronization hazards in kernels that communicate within a block.",
    proof: "Shared-memory optimization notes include racecheck evidence.",
  },
  {
    command: "nsys profile -o reports/timeline ./build/cuda_lab",
    use: "Capture CPU/GPU timeline, CUDA API calls, copies, kernels, waits, and stream behavior.",
    proof: "The report supports the end-to-end bottleneck statement.",
  },
  {
    command: "ncu --set full --target-processes all ./build/cuda_lab",
    use: "Collect kernel-level metrics for occupancy, memory behavior, stalls, source correlation, and roofline-style analysis.",
    proof: "The optimization write-up cites a metric that motivated the code change.",
  },
  {
    command: "ncu --query-metrics",
    use: "Find metric names before scripting Nsight Compute CLI collection.",
    proof: "Automated profiling scripts request metrics intentionally instead of copying unknown names.",
  },
  {
    command: "cuda-gdb ./build/cuda_lab",
    use: "Debug device code when a small repro needs source-level inspection.",
    proof: "Use only after correctness shrinkage and sanitizer runs narrow the failure.",
  },
];
