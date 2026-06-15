export type BlockSize = 64 | 128 | 256 | 512 | 1024;
export type OccupancyProfileId = "balanced" | "wide" | "large-smem";

export const blockSizes: BlockSize[] = [64, 128, 256, 512, 1024];
export const warpLanes = Array.from({ length: 32 }, (_, lane) => lane);
export const divergentLoopTripCounts = [8, 6, 7, 4, 5, 6, 8, 7];
export const schedulerTimeline = [
  {
    cycle: "Cycle 0",
    warp: "Warp 0",
    instruction: "global load",
    state: "Stalls waiting for memory",
    tone: "stall",
  },
  {
    cycle: "Cycle 1",
    warp: "Warp 1",
    instruction: "integer math",
    state: "Ready, so it issues",
    tone: "ready",
  },
  {
    cycle: "Cycle 2",
    warp: "Warp 2",
    instruction: "FP32 math",
    state: "Ready, so it issues",
    tone: "ready",
  },
  {
    cycle: "Cycle 3",
    warp: "Warp 3",
    instruction: "global load",
    state: "Also stalls on memory",
    tone: "stall",
  },
  {
    cycle: "Later",
    warp: "Warp 0",
    instruction: "use loaded value",
    state: "Memory returned; warp is ready again",
    tone: "return",
  },
];

export const problemPresets = [
  { label: "1,000 elements", value: 1_000 },
  { label: "1M elements", value: 1_000_000 },
  { label: "1080p pixels", value: 1_920 * 1_080 },
  { label: "4K pixels", value: 3_840 * 2_160 },
];

export const occupancyProfiles: Record<
  OccupancyProfileId,
  {
    label: string;
    maxThreadsPerSm: number;
    maxWarpsPerSm: number;
    maxBlocksPerSm: number;
    registersPerSm: number;
    sharedMemoryKbPerSm: number;
  }
> = {
  balanced: {
    label: "1536-thread SM profile",
    maxThreadsPerSm: 1536,
    maxWarpsPerSm: 48,
    maxBlocksPerSm: 16,
    registersPerSm: 65_536,
    sharedMemoryKbPerSm: 100,
  },
  wide: {
    label: "2048-thread SM profile",
    maxThreadsPerSm: 2048,
    maxWarpsPerSm: 64,
    maxBlocksPerSm: 32,
    registersPerSm: 65_536,
    sharedMemoryKbPerSm: 164,
  },
  "large-smem": {
    label: "Large shared-memory profile",
    maxThreadsPerSm: 2048,
    maxWarpsPerSm: 64,
    maxBlocksPerSm: 32,
    registersPerSm: 131_072,
    sharedMemoryKbPerSm: 228,
  },
};
