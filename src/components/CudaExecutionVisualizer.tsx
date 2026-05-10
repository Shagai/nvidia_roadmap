import { useMemo, useState } from "react";

type MemoryPattern = "coalesced" | "strided" | "random";

const memoryQuality: Record<MemoryPattern, { label: string; className: string; explanation: string }> = {
  coalesced: {
    label: "Strong",
    className: "quality-strong",
    explanation: "Adjacent threads read adjacent addresses, so memory transactions are efficient.",
  },
  strided: {
    label: "Mixed",
    className: "quality-mixed",
    explanation: "Threads touch regular but separated addresses, often wasting memory bandwidth.",
  },
  random: {
    label: "Weak",
    className: "quality-weak",
    explanation: "Threads scatter across memory, so cache behavior and memory transactions become harder to predict.",
  },
};

export function CudaExecutionVisualizer() {
  const [blocks, setBlocks] = useState(4);
  const [threadsPerBlock, setThreadsPerBlock] = useState(128);
  const [pattern, setPattern] = useState<MemoryPattern>("coalesced");
  const totalThreads = blocks * threadsPerBlock;
  const warps = Math.ceil(totalThreads / 32);
  const occupancy = useMemo(() => {
    if (totalThreads < 256) {
      return "Low parallelism: useful for learning, but likely too little work to hide memory latency.";
    }
    if (totalThreads < 1024) {
      return "Moderate parallelism: enough threads to start hiding latency on many simple kernels.";
    }
    return "High parallelism: many lightweight threads, but register use, shared memory, and block size still decide real occupancy.";
  }, [totalThreads]);

  return (
    <div className="interactive-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 3</p>
          <h3>CUDA execution visualizer</h3>
        </div>
        <div className={`quality-pill ${memoryQuality[pattern].className}`}>
          {memoryQuality[pattern].label} memory pattern
        </div>
      </div>

      <div className="control-grid">
        <label>
          Blocks
          <input
            type="range"
            min="1"
            max="6"
            value={blocks}
            onChange={(event) => setBlocks(Number(event.target.value))}
          />
          <span>{blocks}</span>
        </label>
        <label>
          Threads per block
          <input
            type="range"
            min="32"
            max="256"
            step="32"
            value={threadsPerBlock}
            onChange={(event) => setThreadsPerBlock(Number(event.target.value))}
          />
          <span>{threadsPerBlock}</span>
        </label>
        <label>
          Memory access pattern
          <select value={pattern} onChange={(event) => setPattern(event.target.value as MemoryPattern)}>
            <option value="coalesced">Coalesced</option>
            <option value="strided">Strided</option>
            <option value="random">Random</option>
          </select>
        </label>
      </div>

      <div className="cuda-stat-grid">
        <Stat label="Total threads" value={totalThreads.toString()} />
        <Stat label="Warp size" value="32" />
        <Stat label="Warps" value={warps.toString()} />
      </div>

      <figure className="thread-figure" aria-label="Threads grouped into blocks and warps">
        <ThreadSvg blocks={blocks} threadsPerBlock={threadsPerBlock} pattern={pattern} />
        <figcaption>
          The GPU likes many lightweight threads. Performance depends not only on thread count but also
          on memory access, occupancy, divergence, and synchronization.
        </figcaption>
      </figure>

      <div className="explanation-grid">
        <p>
          <strong>Occupancy-style intuition:</strong> {occupancy}
        </p>
        <p>
          <strong>Memory access quality:</strong> {memoryQuality[pattern].explanation}
        </p>
      </div>
    </div>
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

function ThreadSvg({
  blocks,
  threadsPerBlock,
  pattern,
}: {
  blocks: number;
  threadsPerBlock: number;
  pattern: MemoryPattern;
}) {
  const cell = 8;
  const gap = 2;
  const columns = 32;
  const rowsPerBlock = threadsPerBlock / 32;
  const blockHeight = rowsPerBlock * (cell + gap) + 24;
  const width = columns * (cell + gap) + 90;
  const height = blocks * blockHeight + 12;

  function fillFor(index: number) {
    const warp = Math.floor(index / 32);
    if (pattern === "coalesced") {
      return warp % 2 === 0 ? "var(--accent)" : "var(--success)";
    }
    if (pattern === "strided") {
      return index % 4 === 0 ? "var(--warning)" : "var(--accent-soft)";
    }
    return ["var(--warning)", "var(--success)", "var(--accent)", "var(--muted)"][(index * 7) % 4];
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img">
      <title>CUDA blocks, threads, and warps</title>
      {Array.from({ length: blocks }).map((_, blockIndex) => {
        const yBase = blockIndex * blockHeight + 10;
        return (
          <g key={blockIndex}>
            <text x="0" y={yBase + 12} className="svg-label">
              block {blockIndex}
            </text>
            {Array.from({ length: threadsPerBlock }).map((__, threadIndex) => {
              const row = Math.floor(threadIndex / columns);
              const column = threadIndex % columns;
              const warp = Math.floor(threadIndex / 32);
              return (
                <rect
                  key={threadIndex}
                  x={78 + column * (cell + gap)}
                  y={yBase + row * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx="1"
                  fill={fillFor(threadIndex)}
                  opacity={0.35 + (warp % 2) * 0.25}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
