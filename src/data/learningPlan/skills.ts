import type { Skill } from "../../types";

export const skills: Skill[] = [
  { id: "modern-cpp", label: "Modern C++", category: "systems", weight: 1.15 },
  { id: "cuda-fundamentals", label: "CUDA fundamentals", category: "gpu", weight: 1.3 },
  { id: "gpu-architecture", label: "GPU architecture", category: "gpu", weight: 1.2 },
  { id: "nsight-profiling", label: "Profiling with Nsight", category: "performance", weight: 1.25 },
  { id: "cpp-concurrency", label: "C++ concurrency", category: "systems", weight: 1.1 },
  { id: "tensorrt", label: "AI inference / TensorRT", category: "ai-inference", weight: 0.95 },
  { id: "robotics", label: "Robotics / ROS 2 / Isaac", category: "robotics", weight: 1.0 },
  { id: "gpu-libraries", label: "Thrust, CUB, CUTLASS, NCCL", category: "gpu", weight: 0.95 },
  { id: "system-design", label: "System design", category: "architecture", weight: 0.85 },
  { id: "interview-algorithms", label: "Interview algorithms", category: "interview", weight: 0.8 },
];
