import type { ExerciseSection } from "./types";
import { geometryExercises } from "./geometry";
import { indexingExercises } from "./indexing";
import { matrixExercises } from "./matrix";
import { memoryExercises } from "./memory";
import { occupancyExercises } from "./occupancy";
import { runtimeExercises } from "./runtimeApi";
import { warpExercises } from "./warps";

export const sections: ExerciseSection[] = [
  { id: "indexing", title: "Indexing", exercises: indexingExercises },
  { id: "runtime-api", title: "CUDA runtime API", exercises: runtimeExercises },
  { id: "matrix", title: "Matrix kernels", exercises: matrixExercises },
  { id: "geometry", title: "Launch geometry and flattening", exercises: geometryExercises },
  { id: "memory", title: "Memory model clarifications", exercises: memoryExercises },
  { id: "warps", title: "Warp divergence", exercises: warpExercises },
  { id: "occupancy", title: "Occupancy and synchronization", exercises: occupancyExercises },
];
