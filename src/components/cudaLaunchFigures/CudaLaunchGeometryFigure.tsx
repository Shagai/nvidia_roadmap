import { useMemo, useState } from "react";
import { blockSizes, problemPresets, type BlockSize } from "./data";
import { LaunchShapeSvg, Stat } from "./figurePrimitives";

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
