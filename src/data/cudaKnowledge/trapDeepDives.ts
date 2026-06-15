import type { CudaMentalModelTrapDeepDive } from "./types";
import { gpuAsFasterCpuDeepDive } from "./trapDeepDiveEntries/gpu-as-faster-cpu";
import { kernelOnlySpeedupDeepDive } from "./trapDeepDiveEntries/kernel-only-speedup";
import { copyBouncePipelineDeepDive } from "./trapDeepDiveEntries/copy-bounce-pipeline";
import { launchGeometryUtilizationDeepDive } from "./trapDeepDiveEntries/launch-geometry-utilization";
import { unifiedMemoryDeepDive } from "./trapDeepDiveEntries/unified-memory";
import { correctnessFirstDeepDive } from "./trapDeepDiveEntries/correctness-first";

export const cudaMentalModelTrapDeepDives: CudaMentalModelTrapDeepDive[] = [
  gpuAsFasterCpuDeepDive,
  kernelOnlySpeedupDeepDive,
  copyBouncePipelineDeepDive,
  launchGeometryUtilizationDeepDive,
  unifiedMemoryDeepDive,
  correctnessFirstDeepDive,
];
