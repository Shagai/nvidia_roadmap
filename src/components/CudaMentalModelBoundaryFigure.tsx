import { useMemo, useState } from "react";

type SizePreset = "tiny" | "camera" | "batch";
type WorkPreset = "copy" | "stencil" | "simulation";
type ResidencyPreset = "roundtrip" | "chained" | "resident";

const sizePresets: Record<SizePreset, { label: string; elements: number; description: string }> = {
  tiny: {
    label: "Tiny test",
    elements: 65_536,
    description: "Good for correctness and debugging; usually too little work for a speedup claim.",
  },
  camera: {
    label: "1080p frame",
    elements: 2_073_600,
    description: "Realistic image scale where transfer cost and per-pixel work both start to matter.",
  },
  batch: {
    label: "Large batch",
    elements: 16_777_216,
    description: "Enough parallel work to expose memory bandwidth, occupancy, and reuse decisions.",
  },
};

const workPresets: Record<WorkPreset, { label: string; operationsPerElement: number; bytesPerElement: number }> = {
  copy: {
    label: "Light transform",
    operationsPerElement: 4,
    bytesPerElement: 8,
  },
  stencil: {
    label: "Stencil / blur",
    operationsPerElement: 40,
    bytesPerElement: 20,
  },
  simulation: {
    label: "Simulation step",
    operationsPerElement: 180,
    bytesPerElement: 32,
  },
};

const residencyPresets: Record<
  ResidencyPreset,
  { label: string; kernels: number; h2dCopies: number; d2hCopies: number; explanation: string }
> = {
  roundtrip: {
    label: "Copy back every stage",
    kernels: 1,
    h2dCopies: 1,
    d2hCopies: 1,
    explanation: "The safest first experiment, but every stage pays the boundary cost.",
  },
  chained: {
    label: "Three chained kernels",
    kernels: 3,
    h2dCopies: 1,
    d2hCopies: 1,
    explanation: "Data crosses once in each direction while three GPU stages reuse it.",
  },
  resident: {
    label: "Resident pipeline",
    kernels: 5,
    h2dCopies: 1,
    d2hCopies: 0.2,
    explanation: "Most output remains on device; only a summary or final compact result returns.",
  },
};

export function CudaMentalModelBoundaryFigure() {
  const [sizePreset, setSizePreset] = useState<SizePreset>("camera");
  const [workPreset, setWorkPreset] = useState<WorkPreset>("stencil");
  const [residencyPreset, setResidencyPreset] = useState<ResidencyPreset>("roundtrip");
  const [copyBandwidth, setCopyBandwidth] = useState(16);

  const size = sizePresets[sizePreset];
  const work = workPresets[workPreset];
  const residency = residencyPresets[residencyPreset];

  const estimate = useMemo(() => {
    const totalOps = size.elements * work.operationsPerElement * residency.kernels;
    const totalBytes = size.elements * work.bytesPerElement;
    const copyBytes = totalBytes * (residency.h2dCopies + residency.d2hCopies);
    const copyMs = copyBytes / (copyBandwidth * 1_000_000);
    const launchMs = residency.kernels * 0.025;
    const gpuComputeMs = totalOps / 55_000_000;
    const gpuMs = copyMs + launchMs + gpuComputeMs;
    const cpuMs = totalOps / 4_500_000;
    const arithmeticIntensity = work.operationsPerElement / work.bytesPerElement;
    const score = Math.round((cpuMs / Math.max(gpuMs, 0.001)) * 10) / 10;
    const recommendation = getRecommendation({
      arithmeticIntensity,
      copyShare: copyMs / Math.max(gpuMs, 0.001),
      score,
      sizePreset,
      residencyPreset,
    });

    return {
      arithmeticIntensity,
      copyMs,
      gpuComputeMs,
      gpuMs,
      launchMs,
      cpuMs,
      score,
      totalBytes,
      totalOps,
      recommendation,
    };
  }, [copyBandwidth, residency, residencyPreset, size.elements, sizePreset, work]);

  const totalGpu = estimate.copyMs + estimate.launchMs + estimate.gpuComputeMs;

  return (
    <div className="interactive-panel mental-model-figure">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Interactive figure</p>
          <h3>CPU/GPU boundary explorer</h3>
        </div>
        <div className="readiness-score">
          <span>{estimate.score}x</span>
          <small>planning ratio</small>
        </div>
      </div>

      <div className="control-grid">
        <label>
          Workload size
          <select value={sizePreset} onChange={(event) => setSizePreset(event.target.value as SizePreset)}>
            {Object.entries(sizePresets).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Work per element
          <select value={workPreset} onChange={(event) => setWorkPreset(event.target.value as WorkPreset)}>
            {Object.entries(workPresets).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data residency
          <select
            value={residencyPreset}
            onChange={(event) => setResidencyPreset(event.target.value as ResidencyPreset)}
          >
            {Object.entries(residencyPresets).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="bandwidth-slider">
        <span>
          Planning copy bandwidth
          <strong>{copyBandwidth} GB/s</strong>
        </span>
        <input
          type="range"
          min="4"
          max="32"
          step="1"
          value={copyBandwidth}
          onChange={(event) => setCopyBandwidth(Number(event.target.value))}
        />
      </label>

      <div className="cuda-stat-grid mental-model-stat-grid">
        <Stat label="Elements" value={formatCount(size.elements)} />
        <Stat label="Data touched" value={formatMiB(estimate.totalBytes)} />
        <Stat label="Arithmetic intensity" value={estimate.arithmeticIntensity.toFixed(2)} />
        <Stat label="CPU estimate" value={`${estimate.cpuMs.toFixed(3)} ms`} />
        <Stat label="GPU estimate" value={`${estimate.gpuMs.toFixed(3)} ms`} />
        <Stat label="Kernels" value={residency.kernels.toString()} />
      </div>

      <div className="boundary-diagram" aria-label="CPU and GPU boundary estimate">
        <Stage label="CPU reference" value={estimate.cpuMs} total={Math.max(estimate.cpuMs, estimate.gpuMs)} tone="cpu" />
        <div className="gpu-path">
          <Stage label="Transfer boundary" value={estimate.copyMs} total={totalGpu} tone="copy" />
          <Stage label="Launch overhead" value={estimate.launchMs} total={totalGpu} tone="launch" />
          <Stage label="GPU work" value={estimate.gpuComputeMs} total={totalGpu} tone="gpu" />
        </div>
      </div>

      <div className="explanation-grid">
        <p>
          <strong>Workload:</strong> {size.description}
        </p>
        <p>
          <strong>Residency:</strong> {residency.explanation}
        </p>
        <p className="mental-model-recommendation">
          <strong>Read:</strong> {estimate.recommendation}
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

function Stage({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "cpu" | "copy" | "launch" | "gpu";
}) {
  return (
    <div className={`boundary-stage boundary-stage-${tone}`}>
      <span>{label}</span>
      <div>
        <i style={{ width: percent(value, total) }} />
      </div>
      <strong>{value.toFixed(3)} ms</strong>
    </div>
  );
}

function getRecommendation({
  arithmeticIntensity,
  copyShare,
  score,
  sizePreset,
  residencyPreset,
}: {
  arithmeticIntensity: number;
  copyShare: number;
  score: number;
  sizePreset: SizePreset;
  residencyPreset: ResidencyPreset;
}) {
  if (sizePreset === "tiny") {
    return "Use this size for correctness, sanitizer runs, and indexing checks. Do not use it as the headline speedup case.";
  }
  if (copyShare > 0.55 && residencyPreset === "roundtrip") {
    return "The boundary dominates. Try keeping data resident for multiple kernels before tuning the kernel body.";
  }
  if (arithmeticIntensity < 1 && score < 1.5) {
    return "This is a weak custom-kernel candidate unless it is part of a larger resident pipeline or a library primitive.";
  }
  if (score >= 2.5 && residencyPreset !== "roundtrip") {
    return "This is a strong GPU mental-model candidate: enough work, amortized transfers, and a clear boundary story.";
  }
  return "Build the CPU reference and naive CUDA baseline, then let the measured boundary ledger decide the next move.";
}

function formatMiB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function formatCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

function percent(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }
  return `${Math.max(4, Math.min(100, (value / total) * 100))}%`;
}
