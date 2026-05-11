import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import {
  CudaLaunchGeometryFigure,
  CudaOccupancyExplorer,
} from "../components/CudaLaunchConfigurationFigures";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledgeBase";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

const firstChoices = [
  {
    kernel: "Simple 1D element-wise",
    choice: "128 or 256",
    reason: "Low register pressure and usually memory-bound; coverage and coalescing matter first.",
  },
  {
    kernel: "Memory copy / transform",
    choice: "256",
    reason: "Bandwidth and adjacent-thread access dominate more than exotic launch shapes.",
  },
  {
    kernel: "2D image / matrix element-wise",
    choice: "16x16 or 32x8",
    reason: "Both launch 256 threads; 32x8 keeps threadIdx.x aligned with row-major memory.",
  },
  {
    kernel: "3D volume / stencil",
    choice: "8x8x4 or 8x8x8",
    reason: "Balance locality, halo reads, shared-memory tile size, and occupancy.",
  },
  {
    kernel: "Reduction",
    choice: "256 or 512",
    reason: "More threads can help per-block reduction work, but shared memory and registers decide fit.",
  },
  {
    kernel: "Scan, histogram, sort-like",
    choice: "128, 256, or library",
    reason: "Algorithm details dominate; prefer CUB or Thrust unless the goal is learning.",
  },
  {
    kernel: "Tiled matrix multiply",
    choice: "16x16 beginner tile",
    reason: "A clear baseline where one block owns one output tile and shared memory is visible.",
  },
  {
    kernel: "Tensor Core GEMM",
    choice: "cuBLAS or CUTLASS",
    reason: "The best launch shapes are architecture-specific and already encoded in mature libraries.",
  },
  {
    kernel: "Register-heavy",
    choice: "64 or 128",
    reason: "Smaller blocks may leave enough register file for more resident blocks.",
  },
  {
    kernel: "Shared-memory-heavy",
    choice: "Tile-determined",
    reason: "A larger tile can be faster even when occupancy is lower.",
  },
];

const generationGuidance = [
  {
    architecture: "Turing, CC 7.5",
    examples: "T4, RTX 20",
    advice: "Start with 128 or 256. Avoid very tiny blocks unless the kernel has a specific reason.",
  },
  {
    architecture: "Ampere data center, CC 8.0",
    examples: "A100, A30",
    advice: "256 is a strong default; compare 512 for reductions or heavy streaming kernels.",
  },
  {
    architecture: "Ampere workstation / consumer, CC 8.6",
    examples: "RTX 30, A40, A10",
    advice: "Try 128, 256, and 512. Treat 1024 as a measured choice, not a default.",
  },
  {
    architecture: "Ada, CC 8.9",
    examples: "RTX 40, L4, L40/L40S",
    advice: "Use the same ordinary launch logic: 256 first, then benchmark nearby powers of two.",
  },
  {
    architecture: "Hopper, CC 9.0",
    examples: "H100, H200, GH200",
    advice: "Normal kernels still start well at 256; advanced kernels may depend more on clusters, TMA, and Tensor Cores.",
  },
  {
    architecture: "Blackwell data center, CC 10.x",
    examples: "B200, GB200, B300, GB300",
    advice: "Generic kernels still benchmark 128/256/512; GEMM and AI kernels should start from cuBLAS or CUTLASS.",
  },
  {
    architecture: "Blackwell workstation / consumer, CC 12.x",
    examples: "RTX 50, RTX PRO Blackwell",
    advice: "Start with 256, compare 128 and 512, and avoid assuming the maximum block size is best.",
  },
];

export function CudaLaunchConfigurationPage() {
  return (
    <EssayLayout
      eyebrow="CUDA knowledge pillar"
      title="CUDA Launch Configuration"
      dek="How to choose the triple-chevron grid and block dimensions, why 256 threads is a common first guess, when to use grid-stride loops, and how occupancy limits turn launch syntax into hardware behavior."
      toc={[
        { id: "syntax", label: "Syntax" },
        { id: "coverage", label: "Coverage" },
        { id: "sms", label: "Blocks vs SMs" },
        { id: "warps", label: "Why 256" },
        { id: "occupancy", label: "Occupancy" },
        { id: "choices", label: "First choices" },
        { id: "patterns", label: "Patterns" },
        { id: "generations", label: "Generations" },
        { id: "workflow", label: "Workflow" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="syntax"
        title="Triple-chevron syntax"
        note="Most beginner code only needs the first two launch parameters. The third and fourth matter when dynamic shared memory or streams enter the design."
      >
        <p>
          A CUDA kernel launch uses an execution configuration before the argument list. In everyday
          code, the first value controls how many blocks are launched and the second value controls
          how many threads each block contains.
        </p>
        <CodeBlock>{`kernel<<<gridDim, blockDim, dynamicSharedMemoryBytes, stream>>>(args...);

vecAddKernel<<<ceil(n / 256.0), 256>>>(A_d, B_d, C_d, n);

// Equivalent launch intent:
gridDim  = ceil(n / 256.0); // number of blocks
blockDim = 256;             // threads per block`}</CodeBlock>
        <Callout title="Mental model" tone="success">
          gridDim is how many independent blocks of work exist. blockDim is how many threads
          cooperate inside each block.
        </Callout>
      </Section>

      <Section
        id="coverage"
        title="Covering all elements"
        note="The last block often contains extra threads. That is normal; the bounds guard makes the launch work for arbitrary sizes."
      >
        <p>
          For a simple vector kernel, each thread owns one output element. The launch therefore needs
          at least <code>n</code> logical threads, plus a guard because <code>n</code> is rarely an
          exact multiple of the block size.
        </p>
        <CodeBlock>{`__global__ void vecAddKernel(const float* A,
                             const float* B,
                             float* C,
                             int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        C[i] = A[i] + B[i];
    }
}

int block = 256;
int grid  = (n + block - 1) / block;
vecAddKernel<<<grid, block>>>(A_d, B_d, C_d, n);`}</CodeBlock>
        <CudaLaunchGeometryFigure />
      </Section>

      <Section
        id="sms"
        title="Blocks are not SMs"
        note="Only persistent kernels and some work-queue designs usually tie grid size intentionally to SM count."
      >
        <p>
          A common beginner mistake is launching one block per streaming multiprocessor. Ordinary
          data-parallel kernels usually launch many more blocks than the GPU has SMs. The scheduler
          places blocks onto SMs in waves, and different thread blocks do not have a guaranteed order.
        </p>
        <div className="two-column-list">
          <div>
            <h3>Normal data-parallel kernel</h3>
            <p>
              Make enough independent blocks to cover the data. Millions of blocks are valid if the
              problem size demands it.
            </p>
          </div>
          <div>
            <h3>Persistent kernel</h3>
            <p>
              Sometimes launch <code>SM_count * k</code> blocks and let each block pull work from a
              queue. This is a deliberate advanced pattern, not the default.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="warps"
        title="Why 256 is common"
        note="NVIDIA hardware executes threads in warps. The current compute-capability tables still list a warp size of 32, while other resource limits vary by architecture."
      >
        <p>
          A thread block is partitioned into warps, and a warp contains 32 lanes on current CUDA
          architectures. Choose block sizes that are multiples of 32 so the final warp is not partly
          unused. Common 1D starting points are 64, 128, 256, 512, and sometimes 1024.
        </p>
        <Callout title="Why 256 survives as a baseline" tone="success">
          256 threads per block is 8 warps. That is usually enough warps to help hide latency while
          leaving room for more than one block per SM when registers and shared memory allow it.
        </Callout>
        <CodeBlock>{`// First CUDA baseline for a 1D data-parallel kernel:
int block = 256;
int grid  = (n + block - 1) / block;
kernel<<<grid, block>>>(...);

// First CUDA baseline for row-major 2D data:
dim3 block(16, 16); // 256 threads
dim3 grid((width  + block.x - 1) / block.x,
          (height + block.y - 1) / block.y);
kernel2D<<<grid, block>>>(...);`}</CodeBlock>
      </Section>

      <Section
        id="occupancy"
        title="Occupancy and resource fit"
        note="This figure is a teaching model. For exact values, use the real kernel's registers, shared memory, target architecture, and CUDA occupancy APIs."
      >
        <p>
          A block must fit on one SM. Resident blocks are limited by threads, warps, registers, shared
          memory, resident-block limits, and other architecture-specific resources. If no block fits,
          the launch fails. If only one block fits, the GPU may have too little independent work per
          SM to hide latency.
        </p>
        <CodeBlock>{`activeBlocksPerSM = min(
    maxBlocksPerSM,
    maxThreadsPerSM / threadsPerBlock,
    maxWarpsPerSM / warpsPerBlock,
    registerLimit,
    sharedMemoryLimit,
    otherHardwareLimits
);

activeWarpsPerSM = activeBlocksPerSM * warpsPerBlock;
occupancy        = activeWarpsPerSM / maxWarpsPerSM;`}</CodeBlock>
        <CudaOccupancyExplorer />
        <Callout title="Why 1024 is not automatically better" tone="warning">
          A 1024-thread block contains 32 warps. On an SM profile with a 1536 resident-thread limit,
          the thread limit alone allows only one such block per SM. With 256-thread blocks, the same
          thread limit can allow six blocks and 48 resident warps before other resources are counted.
        </Callout>
      </Section>

      <Section
        id="choices"
        title="Good first choices by kernel type"
        note="These are starting points for the first correct benchmark, not universal optima."
      >
        <div className="cuda-command-table-wrap">
          <table className="cuda-command-table launch-choice-table">
            <thead>
              <tr>
                <th scope="col">Kernel type</th>
                <th scope="col">Good first choice</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {firstChoices.map((row) => (
                <tr key={row.kernel}>
                  <th scope="row">{row.kernel}</th>
                  <td>{row.choice}</td>
                  <td>{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="patterns" title="Modern launch patterns">
        <div className="launch-pattern-grid">
          <article className="launch-pattern-card">
            <h3>Grid-stride loop</h3>
            <p>
              A grid-stride loop decouples total data size from the number of launched blocks. It is
              useful when you want a controlled number of blocks while still covering very large
              inputs.
            </p>
            <CodeBlock>{`__global__ void vecAddKernel(const float* A,
                             const float* B,
                             float* C,
                             int n)
{
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    int stride = blockDim.x * gridDim.x;
    for (int i = tid; i < n; i += stride) {
        C[i] = A[i] + B[i];
    }
}

cudaDeviceProp prop{};
cudaGetDeviceProperties(&prop, 0);
int block = 256;
int grid = 4 * prop.multiProcessorCount;
vecAddKernel<<<grid, block>>>(A_d, B_d, C_d, n);`}</CodeBlock>
          </article>

          <article className="launch-pattern-card">
            <h3>Row-major 2D mapping</h3>
            <p>
              For row-major arrays, keep consecutive <code>threadIdx.x</code> values on consecutive
              memory addresses when possible.
            </p>
            <CodeBlock>{`int x = blockIdx.x * blockDim.x + threadIdx.x;
int y = blockIdx.y * blockDim.y + threadIdx.y;
int idx = y * width + x;

if (x < width && y < height) {
    output[idx] = transform(input[idx]);
}`}</CodeBlock>
          </article>

          <article className="launch-pattern-card">
            <h3>Dynamic shared memory</h3>
            <p>
              Kernels that declare <code>extern __shared__</code> receive the per-block allocation
              through the third launch parameter. Large allocations above the default per-block limit
              require explicit opt-in with a function attribute.
            </p>
            <CodeBlock>{`extern __shared__ float smem[];

int block = 256;
int grid = (n + block * 2 - 1) / (block * 2);
size_t sharedBytes = block * sizeof(float);

reduceKernel<<<grid, block, sharedBytes>>>(input, partial, n);`}</CodeBlock>
          </article>

          <article className="launch-pattern-card">
            <h3>Occupancy helper APIs</h3>
            <p>
              CUDA can estimate a launch configuration that reaches high occupancy. Treat that result
              as a guide and benchmark it against nearby block sizes.
            </p>
            <CodeBlock>{`int minGridSize = 0;
int blockSize = 0;
cudaOccupancyMaxPotentialBlockSize(
    &minGridSize,
    &blockSize,
    vecAddKernel,
    0,
    0
);

int gridSize = (n + blockSize - 1) / blockSize;
vecAddKernel<<<gridSize, blockSize>>>(A_d, B_d, C_d, n);`}</CodeBlock>
          </article>
        </div>
      </Section>

      <Section
        id="generations"
        title="Generation-specific guidance"
        note="The basic launch rule stays stable; the resource envelope and advanced hardware features change."
      >
        <p>
          The ordinary workflow remains: use multiples of 32, start with 128 or 256, benchmark 512
          where it makes sense, and avoid 1024 unless measurement supports it. What changes across
          compute capabilities is the resident-resource envelope and availability of advanced
          features such as clusters, distributed shared memory, Tensor Memory Accelerator, and Tensor
          Cores.
        </p>
        <div className="cuda-command-table-wrap">
          <table className="cuda-command-table generation-table">
            <thead>
              <tr>
                <th scope="col">Architecture / CC</th>
                <th scope="col">Examples</th>
                <th scope="col">Practical launch advice</th>
              </tr>
            </thead>
            <tbody>
              {generationGuidance.map((row) => (
                <tr key={row.architecture}>
                  <th scope="row">{row.architecture}</th>
                  <td>{row.examples}</td>
                  <td>{row.advice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="workflow" title="Practical tuning workflow">
        <ol className="launch-workflow-list">
          <li>
            Pick the simple baseline: <code>block = 256</code>,{" "}
            <code>grid = (n + block - 1) / block</code>.
          </li>
          <li>Make consecutive threads access consecutive memory addresses when the data layout allows it.</li>
          <li>Benchmark 128, 256, and 512 threads per block under the same correctness harness.</li>
          <li>For register-heavy kernels, add 64. For reductions, consider 512 and 1024.</li>
          <li>
            Use Nsight Compute to inspect achieved occupancy, memory throughput, register count,
            shared memory per block, warp stalls, divergence, and coalescing.
          </li>
          <li>
            Use CUDA occupancy APIs as a guide, then keep the launch shape that wins the measured
            workload on the target GPU.
          </li>
        </ol>
        <p className="month-nav">
          <Link to="/cuda-kb#pillars">Back to CUDA KB pillars</Link>
          <Link to="/cuda-lab">Open CUDA lab</Link>
          <Link to="/profiling-lab">Open profiling lab</Link>
        </p>
      </Section>

      <Section
        id="sources"
        title="Official source anchors"
        note="Recheck these before updating generation-specific claims or architecture tables."
      >
        <div className="reference-grid">
          {[
            "programming-guide",
            "programming-guide-compute-capabilities",
            "cuda-gpus",
            "best-practices",
            "runtime-api-occupancy",
            "nsight-compute",
            "cublas",
            "cutlass",
          ].map((sourceId) => {
            const source = sourceById.get(sourceId);
            if (!source) return null;

            return (
              <a className="reference-card" href={source.url} key={source.id}>
                <strong>{source.label}</strong>
                <span>{source.scope}</span>
                <small>Checked {source.checked}</small>
              </a>
            );
          })}
        </div>
      </Section>
    </EssayLayout>
  );
}
