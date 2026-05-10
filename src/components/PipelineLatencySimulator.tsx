import { useMemo, useState } from "react";

type Stage = {
  id: string;
  label: string;
  defaultMs: number;
};

const stages: Stage[] = [
  { id: "camera", label: "Camera/Input", defaultMs: 6 },
  { id: "cpu", label: "CPU preprocessing", defaultMs: 8 },
  { id: "h2d", label: "Host-to-device copy", defaultMs: 3 },
  { id: "kernel", label: "CUDA kernel", defaultMs: 5 },
  { id: "trt", label: "TensorRT inference", defaultMs: 12 },
  { id: "d2h", label: "Device-to-host copy", defaultMs: 2 },
  { id: "output", label: "Output", defaultMs: 4 },
];

export function PipelineLatencySimulator() {
  const [latencies, setLatencies] = useState<Record<string, number>>(() =>
    Object.fromEntries(stages.map((stage) => [stage.id, stage.defaultMs])),
  );
  const total = stages.reduce((sum, stage) => sum + latencies[stage.id], 0);
  const fps = total > 0 ? 1000 / total : 0;
  const bottleneck = useMemo(
    () => stages.reduce((max, stage) => (latencies[stage.id] > latencies[max.id] ? stage : max), stages[0]),
    [latencies],
  );

  return (
    <div className="interactive-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 4</p>
          <h3>GPU pipeline latency simulator</h3>
        </div>
        <div className="readiness-score">
          <span>{fps.toFixed(1)} FPS</span>
          <small>{total.toFixed(1)} ms total</small>
        </div>
      </div>

      <div className="pipeline-bar" aria-label="Pipeline latency timeline">
        {stages.map((stage) => {
          const width = total === 0 ? 0 : (latencies[stage.id] / total) * 100;
          return (
            <div
              key={stage.id}
              className={stage.id === bottleneck.id ? "pipeline-stage bottleneck" : "pipeline-stage"}
              style={{ width: `${width}%` }}
              title={`${stage.label}: ${latencies[stage.id]} ms`}
            >
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="latency-grid">
        {stages.map((stage) => (
          <label key={stage.id}>
            <span>
              {stage.label}
              <strong>{latencies[stage.id]} ms</strong>
            </span>
            <input
              type="range"
              min="0"
              max="60"
              value={latencies[stage.id]}
              onChange={(event) =>
                setLatencies((current) => ({ ...current, [stage.id]: Number(event.target.value) }))
              }
            />
          </label>
        ))}
      </div>

      <div className="explanation-grid">
        <p>
          <strong>Bottleneck:</strong> {bottleneck.label} is the slowest stage right now. Optimizing a fast
          CUDA kernel will not move the end-to-end number if this stage dominates the timeline.
        </p>
        <p>
          <strong>Interview intuition:</strong> for robotics and vision roles, end-to-end latency is often
          more important than isolated model accuracy or isolated kernel speed.
        </p>
      </div>
    </div>
  );
}
