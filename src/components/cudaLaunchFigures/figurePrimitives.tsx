export function LaunchShapeSvg({
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

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function percent(value: number, total: number) {
  if (total <= 0 || value <= 0) {
    return "0%";
  }

  return `${Math.min(100, Math.max(4, (value / total) * 100))}%`;
}
