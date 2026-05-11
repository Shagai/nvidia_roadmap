import { useMemo, useState } from "react";

type BlockSize = 64 | 128 | 256 | 512 | 1024;
type OccupancyProfileId = "balanced" | "wide" | "large-smem";

const blockSizes: BlockSize[] = [64, 128, 256, 512, 1024];

const problemPresets = [
  { label: "1,000 elements", value: 1_000 },
  { label: "1M elements", value: 1_000_000 },
  { label: "1080p pixels", value: 1_920 * 1_080 },
  { label: "4K pixels", value: 3_840 * 2_160 },
];

const occupancyProfiles: Record<
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

export function CudaLaunchGeometryFigure() {
  const [problemSize, setProblemSize] = useState(problemPresets[1].value);
  const [threadsPerBlock, setThreadsPerBlock] = useState<BlockSize>(256);

  const stats = useMemo(() => {
    const gridBlocks = Math.ceil(problemSize / threadsPerBlock);
    const launchedThreads = gridBlocks * threadsPerBlock;
    const guardThreads = launchedThreads - problemSize;
    const usefulLastBlockThreads =
      problemSize % threadsPerBlock === 0 ? threadsPerBlock : problemSize % threadsPerBlock;

    return {
      gridBlocks,
      launchedThreads,
      guardThreads,
      usefulLastBlockThreads,
      warpsPerBlock: Math.ceil(threadsPerBlock / 32),
      totalWarps: gridBlocks * Math.ceil(threadsPerBlock / 32),
    };
  }, [problemSize, threadsPerBlock]);

  return (
    <div className="interactive-panel launch-figure-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Interactive figure</p>
          <h3>Grid and block coverage</h3>
        </div>
        <div className="readiness-score">
          <span>{stats.gridBlocks.toLocaleString()}</span>
          <small>blocks launched</small>
        </div>
      </div>

      <div className="control-grid launch-control-grid">
        <label>
          Problem size
          <select value={problemSize} onChange={(event) => setProblemSize(Number(event.target.value))}>
            {problemPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Threads per block
          <select
            value={threadsPerBlock}
            onChange={(event) => setThreadsPerBlock(Number(event.target.value) as BlockSize)}
          >
            {blockSizes.map((size) => (
              <option key={size} value={size}>
                {size} threads
              </option>
            ))}
          </select>
        </label>
        <div className="launch-equation" aria-label="Ceiling division formula">
          <span>grid = ceil(n / block)</span>
          <strong>
            {stats.gridBlocks.toLocaleString()} = ceil({problemSize.toLocaleString()} / {threadsPerBlock})
          </strong>
        </div>
      </div>

      <div className="cuda-stat-grid launch-stat-grid">
        <Stat label="Launched threads" value={stats.launchedThreads.toLocaleString()} />
        <Stat label="Useful threads" value={problemSize.toLocaleString()} />
        <Stat label="Guard threads" value={stats.guardThreads.toLocaleString()} />
        <Stat label="Warps per block" value={stats.warpsPerBlock.toString()} />
        <Stat label="Total warps" value={stats.totalWarps.toLocaleString()} />
        <Stat label="Last block useful" value={stats.usefulLastBlockThreads.toString()} />
      </div>

      <figure className="launch-shape-figure">
        <LaunchShapeSvg
          gridBlocks={stats.gridBlocks}
          threadsPerBlock={threadsPerBlock}
          usefulLastBlockThreads={stats.usefulLastBlockThreads}
        />
        <figcaption>
          The final block is allowed to be partially useful. The kernel guard handles the extra
          threads instead of special-casing every non-divisible input size.
        </figcaption>
      </figure>
    </div>
  );
}

export function CudaOccupancyExplorer() {
  const [profileId, setProfileId] = useState<OccupancyProfileId>("balanced");
  const [threadsPerBlock, setThreadsPerBlock] = useState<BlockSize>(256);
  const [registersPerThread, setRegistersPerThread] = useState(32);
  const [sharedMemoryKbPerBlock, setSharedMemoryKbPerBlock] = useState(0);

  const profile = occupancyProfiles[profileId];
  const result = useMemo(() => {
    const warpsPerBlock = Math.ceil(threadsPerBlock / 32);
    const byBlocks = profile.maxBlocksPerSm;
    const byThreads = Math.floor(profile.maxThreadsPerSm / threadsPerBlock);
    const byWarps = Math.floor(profile.maxWarpsPerSm / warpsPerBlock);
    const byRegisters = Math.floor(profile.registersPerSm / (threadsPerBlock * registersPerThread));
    const bySharedMemory =
      sharedMemoryKbPerBlock === 0
        ? profile.maxBlocksPerSm
        : Math.floor(profile.sharedMemoryKbPerSm / sharedMemoryKbPerBlock);
    const activeBlocksPerSm = Math.max(
      0,
      Math.min(byBlocks, byThreads, byWarps, byRegisters, bySharedMemory),
    );
    const activeWarpsPerSm = activeBlocksPerSm * warpsPerBlock;
    const activeThreadsPerSm = activeBlocksPerSm * threadsPerBlock;
    const occupancy = Math.min(1, activeWarpsPerSm / profile.maxWarpsPerSm);

    const limits = [
      { label: "resident blocks", value: byBlocks },
      { label: "resident threads", value: byThreads },
      { label: "resident warps", value: byWarps },
      { label: "register file", value: byRegisters },
      { label: "shared memory", value: bySharedMemory },
    ];

    return {
      activeBlocksPerSm,
      activeWarpsPerSm,
      activeThreadsPerSm,
      occupancy,
      warpsPerBlock,
      limits,
      limitingFactors: limits
        .filter((limit) => limit.value === activeBlocksPerSm)
        .map((limit) => limit.label),
    };
  }, [profile, registersPerThread, sharedMemoryKbPerBlock, threadsPerBlock]);

  return (
    <div className="interactive-panel launch-figure-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Interactive figure</p>
          <h3>Occupancy and resource fit</h3>
        </div>
        <div className={`quality-pill ${result.activeBlocksPerSm > 0 ? "quality-strong" : "quality-weak"}`}>
          {result.activeBlocksPerSm > 0 ? "Launch can fit" : "Launch cannot fit"}
        </div>
      </div>

      <div className="control-grid occupancy-control-grid">
        <label>
          SM resource profile
          <select value={profileId} onChange={(event) => setProfileId(event.target.value as OccupancyProfileId)}>
            {Object.entries(occupancyProfiles).map(([id, item]) => (
              <option key={id} value={id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Threads per block
          <select
            value={threadsPerBlock}
            onChange={(event) => setThreadsPerBlock(Number(event.target.value) as BlockSize)}
          >
            {blockSizes.map((size) => (
              <option key={size} value={size}>
                {size} threads
              </option>
            ))}
          </select>
        </label>
        <label>
          Registers per thread
          <input
            type="range"
            min="16"
            max="128"
            step="8"
            value={registersPerThread}
            onChange={(event) => setRegistersPerThread(Number(event.target.value))}
          />
          <span>{registersPerThread}</span>
        </label>
        <label>
          Dynamic shared memory per block
          <input
            type="range"
            min="0"
            max="128"
            step="4"
            value={sharedMemoryKbPerBlock}
            onChange={(event) => setSharedMemoryKbPerBlock(Number(event.target.value))}
          />
          <span>{sharedMemoryKbPerBlock} KB</span>
        </label>
      </div>

      <div className="cuda-stat-grid launch-stat-grid">
        <Stat label="Active blocks / SM" value={result.activeBlocksPerSm.toString()} />
        <Stat label="Active warps / SM" value={result.activeWarpsPerSm.toString()} />
        <Stat label="Active threads / SM" value={result.activeThreadsPerSm.toString()} />
        <Stat label="Warps per block" value={result.warpsPerBlock.toString()} />
        <Stat label="Achieved occupancy" value={`${Math.round(result.occupancy * 100)}%`} />
        <Stat label="Limiting resource" value={result.limitingFactors.join(", ")} />
      </div>

      <div className="occupancy-bars" aria-label="Active block limits by resource">
        {result.limits.map((limit) => (
          <div className="occupancy-bar-row" key={limit.label}>
            <span>{limit.label}</span>
            <div>
              <i style={{ width: percent(limit.value, profile.maxBlocksPerSm) }} />
            </div>
            <strong>{limit.value}</strong>
          </div>
        ))}
      </div>

      <div className="explanation-grid">
        <p>
          <strong>Resource rule:</strong> one block must fit entirely on one SM. The active block
          count is constrained by whichever resource runs out first.
        </p>
        <p>
          <strong>Performance rule:</strong> higher occupancy can hide latency, but memory access,
          register pressure, shared-memory reuse, and instruction mix still decide the benchmark.
        </p>
      </div>
    </div>
  );
}

function LaunchShapeSvg({
  gridBlocks,
  threadsPerBlock,
  usefulLastBlockThreads,
}: {
  gridBlocks: number;
  threadsPerBlock: number;
  usefulLastBlockThreads: number;
}) {
  const displayedBlocks =
    gridBlocks <= 6 ? Array.from({ length: gridBlocks }, (_, index) => index) : [0, 1, 2, -1, gridBlocks - 1];
  const width = 760;
  const rowHeight = 42;
  const height = displayedBlocks.length * rowHeight + 18;
  const barX = 128;
  const barWidth = 500;
  const barHeight = 18;
  const warpsPerBlock = Math.ceil(threadsPerBlock / 32);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img">
      <title>Grid blocks, block size, useful threads, and guard threads</title>
      {displayedBlocks.map((blockIndex, rowIndex) => {
        const y = rowIndex * rowHeight + 14;
        if (blockIndex === -1) {
          return (
            <text x={barX + barWidth / 2} y={y + 14} className="svg-label launch-ellipsis" key="ellipsis">
              ... scheduled in more waves ...
            </text>
          );
        }

        const isLastBlock = blockIndex === gridBlocks - 1;
        const usefulThreads = isLastBlock ? usefulLastBlockThreads : threadsPerBlock;
        const usefulWidth = (usefulThreads / threadsPerBlock) * barWidth;

        return (
          <g key={blockIndex}>
            <text x="0" y={y + 14} className="svg-label">
              block {blockIndex.toLocaleString()}
            </text>
            <rect x={barX} y={y} width={barWidth} height={barHeight} rx="4" className="launch-block-bg" />
            <rect x={barX} y={y} width={usefulWidth} height={barHeight} rx="4" className="launch-block-useful" />
            {isLastBlock && usefulThreads < threadsPerBlock ? (
              <rect
                x={barX + usefulWidth}
                y={y}
                width={barWidth - usefulWidth}
                height={barHeight}
                rx="4"
                className="launch-block-guard"
              />
            ) : null}
            {Array.from({ length: warpsPerBlock + 1 }).map((_, warpIndex) => (
              <line
                key={warpIndex}
                x1={barX + (warpIndex / warpsPerBlock) * barWidth}
                x2={barX + (warpIndex / warpsPerBlock) * barWidth}
                y1={y}
                y2={y + barHeight}
                className="launch-warp-line"
              />
            ))}
            <text x={barX + barWidth + 16} y={y + 14} className="svg-label">
              {usefulThreads}/{threadsPerBlock} useful
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function percent(value: number, total: number) {
  if (total <= 0 || value <= 0) {
    return "0%";
  }

  return `${Math.min(100, Math.max(4, (value / total) * 100))}%`;
}
