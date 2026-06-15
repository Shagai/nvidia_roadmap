import type { PortfolioProject } from "../../types";

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "cuda-performance",
    title: "CUDA performance repo",
    description: "CPU vs CUDA image-processing kernels with profiling, optimization notes, charts, and reproducible build instructions.",
    checklist: [
      "At least 3 CUDA kernels",
      "CPU baseline and GPU implementation",
      "Benchmark table across input sizes",
      "Naive vs optimized comparison",
      "Nsight evidence or exported report",
      "README with build and run steps",
    ],
  },
  {
    id: "cpp-concurrent-pipeline",
    title: "C++ concurrent pipeline repo",
    description: "A frame-processing pipeline with bounded queues, backpressure, latency metrics, tests, and sanitizer builds.",
    checklist: [
      "Clean CMake project",
      "Thread-safe bounded queue",
      "Backpressure behavior",
      "Unit tests",
      "Sanitizer target",
      "Throughput and latency documentation",
    ],
  },
  {
    id: "robotics-vision-gpu",
    title: "Robotics/vision GPU repo",
    description: "ROS 2, GStreamer, TensorRT, Isaac, or DeepStream demo showing GPU acceleration in a perception pipeline.",
    checklist: [
      "Runnable ROS 2 or video pipeline",
      "TensorRT or CUDA acceleration",
      "End-to-end latency measurement",
      "Architecture diagram",
      "Demo video or GIF",
      "README explains deployment assumptions",
    ],
  },
  {
    id: "open-source-contribution",
    title: "Open-source contribution",
    description: "A merged PR, strong issue with reproducer, or substantial forked demo in CUDA, Isaac ROS, CUTLASS, CCCL, or RAPIDS.",
    checklist: [
      "Pick target repository",
      "Reproduce issue or identify improvement",
      "Submit PR or high-quality issue",
      "Document public artifact",
      "Link artifact in portfolio",
    ],
  },
  {
    id: "technical-writeups",
    title: "Three technical write-ups",
    description: "Short, inspectable essays that prove measurement, optimization, and systems reasoning.",
    checklist: [
      "How I optimized a CUDA kernel",
      "How I profiled a GPU video pipeline",
      "Lessons from building a C++ real-time processing pipeline",
      "Each write-up has screenshots or tables",
      "Each write-up has a clear conclusion",
    ],
  },
];
