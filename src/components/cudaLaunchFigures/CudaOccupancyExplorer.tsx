import { useMemo, useState } from "react";
import { blockSizes, occupancyProfiles, type BlockSize, type OccupancyProfileId } from "./data";
import { percent, Stat } from "./figurePrimitives";

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
