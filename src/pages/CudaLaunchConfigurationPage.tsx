import { EssayLayout } from "../components/EssayLayout";
import {
  ExecutionModelFoundations,
  ExecutionModelPatterns,
  ExecutionModelPractice,
  ExecutionModelScheduling,
  ExecutionModelSources,
} from "../features/cudaExecutionModel";

const toc = [
  { id: "frame", label: "Frame" },
  { id: "syntax", label: "Syntax" },
  { id: "coverage", label: "Coverage" },
  { id: "know", label: "Know" },
  { id: "sms", label: "Blocks vs SMs" },
  { id: "warps", label: "Why 256" },
  { id: "scheduling", label: "Scheduling" },
  { id: "divergence", label: "Divergence" },
  { id: "occupancy", label: "Occupancy" },
  { id: "practice", label: "Practice" },
  { id: "traps", label: "Traps" },
  { id: "choices", label: "First choices" },
  { id: "patterns", label: "Patterns" },
  { id: "generations", label: "Generations" },
  { id: "workflow", label: "Workflow" },
  { id: "interview", label: "Interview" },
  { id: "sources", label: "Sources" },
];

export function CudaLaunchConfigurationPage() {
  return (
    <EssayLayout
      eyebrow="CUDA knowledge pillar"
      title="CUDA Execution Model"
      dek="The programming model exposes grids, blocks, and threads. Hardware executes threads in warps on streaming multiprocessors. Correct indexing makes the kernel right; understanding warps, occupancy, scheduling, and divergence explains why the kernel is fast or slow."
      toc={toc}
    >
      <ExecutionModelFoundations />
      <ExecutionModelScheduling />
      <ExecutionModelPractice />
      <ExecutionModelPatterns />
      <ExecutionModelSources />
    </EssayLayout>
  );
}
