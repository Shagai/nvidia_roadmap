import type { ExerciseSection } from "./types";
import { coalescingAndCoarseningExercises } from "./coalescingAndCoarsening";
import { geometryExercises } from "./geometry";
import { indexingExercises } from "./indexing";
import { matrixExercises } from "./matrix";
import { memoryExercises } from "./memory";
import { occupancyExercises } from "./occupancy";
import { runtimeExercises } from "./runtimeApi";
import { sharedMemoryTilingExercises } from "./sharedMemoryTiling";
import { warpExercises } from "./warps";

export const sections: ExerciseSection[] = [
  { id: "indexing", title: "Indexing", exercises: indexingExercises },
  { id: "runtime-api", title: "CUDA runtime API", exercises: runtimeExercises },
  { id: "matrix", title: "Matrix kernels", exercises: matrixExercises },
  { id: "geometry", title: "Launch geometry and flattening", exercises: geometryExercises },
  { id: "memory", title: "Memory model clarifications", exercises: memoryExercises },
  {
    id: "shared-memory-tiling",
    title: "Shared memory, tiling, and occupancy",
    exercises: sharedMemoryTilingExercises,
  },
  {
    id: "coalescing-coarsening",
    title: "Coalescing and thread coarsening",
    exercises: coalescingAndCoarseningExercises,
  },
  { id: "warps", title: "Warp divergence", exercises: warpExercises },
  { id: "occupancy", title: "Occupancy and synchronization", exercises: occupancyExercises },
];
