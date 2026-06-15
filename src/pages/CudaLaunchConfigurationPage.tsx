import { EssayLayout } from "../components/EssayLayout";
import {
  ExecutionModelFoundations,
  ExecutionModelPatterns,
  ExecutionModelPractice,
  ExecutionModelScheduling,
  ExecutionModelSources,
} from "../features/cudaExecutionModel";

const toc = [
  { id: "frame", label: "Mental model" },
  { id: "syntax", label: "Launch syntax" },
  { id: "coverage", label: "Indexing" },
  { id: "know", label: "Vocabulary" },
  { id: "sms", label: "Blocks vs SMs" },
  { id: "warps", label: "Warp lens" },
  { id: "scheduling", label: "Scheduling" },
  { id: "divergence", label: "Divergence" },
  { id: "occupancy", label: "Occupancy" },
  { id: "practice", label: "Lab path" },
  { id: "traps", label: "Mistakes" },
  { id: "choices", label: "First choices" },
  { id: "patterns", label: "Patterns" },
  { id: "generations", label: "Generation lens" },
  { id: "workflow", label: "Workflow" },
  { id: "interview", label: "Checklist" },
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
