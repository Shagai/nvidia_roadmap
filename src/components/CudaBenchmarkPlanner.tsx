import { useMemo, useState } from "react";

type ImagePreset = "small" | "hd" | "uhd";
type KernelPreset = "grayscale" | "threshold" | "blur" | "sobel";

const imagePresets: Record<ImagePreset, { label: string; width: number; height: number }> = {
  small: { label: "Small test image", width: 640, height: 480 },
  hd: { label: "1080p image", width: 1920, height: 1080 },
  uhd: { label: "4K-style image", width: 3840, height: 2160 },
};

const kernelPresets: Record<
  KernelPreset,
  {
    label: string;
    inputBytesPerPixel: number;
    outputBytesPerPixel: number;
    memoryStory: string;
    correctnessCheck: string;
  }
> = {
  grayscale: {
    label: "RGB to grayscale",
    inputBytesPerPixel: 3,
    outputBytesPerPixel: 1,
    memoryStory: "One thread reads one RGB pixel and writes one grayscale byte.",
    correctnessCheck: "Exact match against the CPU grayscale reference.",
  },
  threshold: {
    label: "Threshold",
    inputBytesPerPixel: 1,
    outputBytesPerPixel: 1,
    memoryStory: "One thread reads one grayscale byte and writes one binary output byte.",
    correctnessCheck: "Exact match against the CPU threshold reference.",
  },
  blur: {
    label: "3x3 blur",
    inputBytesPerPixel: 9,
    outputBytesPerPixel: 1,
    memoryStory: "Each output pixel reads a 3x3 neighborhood before writing one byte.",
    correctnessCheck: "Exact match or documented border-policy comparison against CPU blur.",
  },
  sobel: {
    label: "Sobel edge",
    inputBytesPerPixel: 9,
    outputBytesPerPixel: 1,
    memoryStory: "Each output pixel reads a 3x3 neighborhood and computes horizontal and vertical gradients.",
    correctnessCheck: "Exact match or documented tolerance against CPU Sobel output.",
  },
};

export function CudaBenchmarkPlanner() {
  const [imagePreset, setImagePreset] = useState<ImagePreset>("hd");
  const [kernelPreset, setKernelPreset] = useState<KernelPreset>("grayscale");
  const [blockSize, setBlockSize] = useState(256);
  const [transferBandwidth, setTransferBandwidth] = useState(16);

  const image = imagePresets[imagePreset];
  const kernel = kernelPresets[kernelPreset];
  const stats = useMemo(() => {
    const pixels = image.width * image.height;
    const gridSize = Math.ceil(pixels / blockSize);
    const launchedThreads = gridSize * blockSize;
    const guardThreads = launchedThreads - pixels;
    const h2dBytes = pixels * kernel.inputBytesPerPixel;
    const d2hBytes = pixels * kernel.outputBytesPerPixel;
    const bandwidthBytesPerMs = transferBandwidth * 1_000_000;

    return {
      pixels,
      gridSize,
      launchedThreads,
      guardThreads,
      h2dBytes,
      d2hBytes,
      h2dMs: h2dBytes / bandwidthBytesPerMs,
      d2hMs: d2hBytes / bandwidthBytesPerMs,
      totalCopyMs: (h2dBytes + d2hBytes) / bandwidthBytesPerMs,
    };
  }, [blockSize, image.height, image.width, kernel.inputBytesPerPixel, kernel.outputBytesPerPixel, transferBandwidth]);

  return (
    <div className="interactive-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 2</p>
          <h3>CUDA lab benchmark planner</h3>
        </div>
        <div className="readiness-score">
          <span>{formatCount(stats.pixels)}</span>
          <small>output elements</small>
        </div>
      </div>

      <div className="control-grid benchmark-controls">
        <label>
          Image size
          <select value={imagePreset} onChange={(event) => setImagePreset(event.target.value as ImagePreset)}>
            {Object.entries(imagePresets).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kernel
          <select value={kernelPreset} onChange={(event) => setKernelPreset(event.target.value as KernelPreset)}>
            {Object.entries(kernelPresets).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Block size
          <input
            type="range"
            min="32"
            max="512"
            step="32"
            value={blockSize}
            onChange={(event) => setBlockSize(Number(event.target.value))}
          />
          <span>{blockSize} threads</span>
        </label>
      </div>

      <label className="bandwidth-slider">
        <span>
          Assumed copy bandwidth for planning
          <strong>{transferBandwidth} GB/s</strong>
        </span>
        <input
          type="range"
          min="4"
          max="32"
          step="1"
          value={transferBandwidth}
          onChange={(event) => setTransferBandwidth(Number(event.target.value))}
        />
      </label>

      <div className="cuda-stat-grid planner-stat-grid">
        <Stat label="Grid blocks" value={stats.gridSize.toLocaleString()} />
        <Stat label="Launched threads" value={formatCount(stats.launchedThreads)} />
        <Stat label="Guard threads" value={stats.guardThreads.toLocaleString()} />
        <Stat label="H2D bytes" value={formatMiB(stats.h2dBytes)} />
        <Stat label="D2H bytes" value={formatMiB(stats.d2hBytes)} />
        <Stat label="Copy lower bound" value={`${stats.totalCopyMs.toFixed(3)} ms`} />
      </div>

      <div className="copy-ledger" aria-label="Transfer planning ledger">
        <div style={{ width: percent(stats.h2dBytes, stats.h2dBytes + stats.d2hBytes) }}>
          <span>H2D {stats.h2dMs.toFixed(3)} ms</span>
        </div>
        <div style={{ width: percent(stats.d2hBytes, stats.h2dBytes + stats.d2hBytes) }}>
          <span>D2H {stats.d2hMs.toFixed(3)} ms</span>
        </div>
      </div>

      <div className="explanation-grid">
        <p>
          <strong>Kernel memory story:</strong> {kernel.memoryStory}
        </p>
        <p>
          <strong>Correctness check:</strong> {kernel.correctnessCheck}
        </p>
      </div>

      <div className="benchmark-template">
        <h4>Benchmark row to collect</h4>
        <code>
          image={image.width}x{image.height} kernel={kernelPreset} block={blockSize} cpu_ms=? h2d_ms=? kernel_ms=?
          d2h_ms=? total_gpu_ms=? max_abs_diff=?
        </code>
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
  return `${Math.max(8, (value / total) * 100)}%`;
}
