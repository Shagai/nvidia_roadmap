import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { PipelineLatencySimulator } from "../components/PipelineLatencySimulator";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledgeBase";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));
const variableStorageShareUrl = "https://chatgpt.com/share/6a300f52-ebc8-83eb-a300-0806afdf9eaa";
const rooflineShareUrl = "https://chatgpt.com/share/6a300c8f-2988-83ed-b184-463a4348da2e";

const cudaMemoryTypes = [
  {
    declaration: "Automatic scalar variables",
    example: "int i; float x;",
    memory: "Register",
    scope: "Thread",
    lifetime: "Kernel launch",
    note: "Normal per-thread locals usually live in registers. Every thread has its own copy.",
  },
  {
    declaration: "Automatic array variables",
    example: "float temp[16];",
    memory: "Local",
    scope: "Thread",
    lifetime: "Kernel launch",
    note: "Local memory is still private to one thread. It is not shared memory and may be backed by device memory.",
  },
  {
    declaration: "Shared variables",
    example: "__shared__ float tile[256];",
    memory: "Shared",
    scope: "Block",
    lifetime: "Block execution",
    note: "Threads in the same block can cooperate through this storage, usually with __syncthreads().",
  },
  {
    declaration: "Device global variables",
    example: "__device__ int counter;",
    memory: "Global",
    scope: "Grid",
    lifetime: "Application",
    note: "All blocks can see the same object. Concurrent writes need atomics or a safer reduction pattern.",
  },
  {
    declaration: "Constant variables",
    example: "__constant__ float coeff[64];",
    memory: "Constant",
    scope: "Grid",
    lifetime: "Application",
    note: "Kernels read it, the host initializes it, and broadcasts are efficient when many lanes read the same address.",
  },
];

const memoryScopeCards = [
  {
    label: "Thread",
    title: "Private copies",
    explanation:
      "Registers and local memory belong to one thread. Other threads cannot use that thread's automatic variables.",
  },
  {
    label: "Block",
    title: "Cooperative scratchpad",
    explanation:
      "Shared memory is allocated per block. It is the right place for tiles that neighboring threads reuse.",
  },
  {
    label: "Grid",
    title: "Whole-kernel visibility",
    explanation:
      "Global and constant variables are visible across blocks, so they need a stricter plan for writes, lifetime, and reuse.",
  },
];

const rooflineCases = [
  {
    label: "A1",
    title: "Memory-bound but efficient",
    explanation:
      "Low computational intensity places it on the bandwidth side. It sits close to the diagonal roof, so memory bandwidth is being used well.",
    nextMove: "Increase reuse or algorithmic intensity; bandwidth tuning alone has little headroom.",
  },
  {
    label: "A2",
    title: "Memory-bound and inefficient",
    explanation:
      "It is also on the bandwidth side, but far below the diagonal roof. The code is not reaching the memory bandwidth the hardware could provide.",
    nextMove: "Inspect coalescing, cache behavior, memory layout, active warps, shared-memory bank conflicts, and unnecessary traffic.",
  },
  {
    label: "A3",
    title: "Compute-bound",
    explanation:
      "Higher computational intensity places it past the knee, where peak math throughput is the dominant roof.",
    nextMove: "Improve instruction mix, reduce divergence, use specialized math paths where applicable, and remove unnecessary operations.",
  },
];

export function ProfilingLabPage() {
  return (
    <EssayLayout
      eyebrow="Profiling and latency"
      title="GPU pipeline latency simulator"
      dek="A practical model for thinking about end-to-end latency, CUDA memory placement, kernel bottlenecks, and output."
      toc={[
        { id: "why", label: "Why it matters" },
        { id: "simulator", label: "Simulator" },
        { id: "memory-types", label: "Memory types" },
        { id: "roofline", label: "Roofline" },
        { id: "method", label: "Method" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section id="why" title="Why end-to-end latency matters">
        <p>
          For robotics and vision roles, end-to-end latency is often more important than isolated
          model accuracy. A fast kernel is not enough if preprocessing, memory copies, batching, or
          output handling dominate the frame budget.
        </p>
      </Section>

      <Section id="simulator" title="Pipeline simulator">
        <PipelineLatencySimulator />
      </Section>

      <Section
        id="memory-types"
        title="CUDA memory types"
        note="A CUDA variable declaration is also a placement and visibility decision: private to a thread, shared inside a block, or visible across the grid."
      >
        <p>
          The table is a compact way to answer three questions for any CUDA variable: where does it
          live, who can see it, and how long does it exist? That distinction matters because the
          same kernel can use registers for private state, shared memory for block cooperation, and
          global or constant memory for data visible across blocks.
        </p>
        <p className="source-note">
          Source note:{" "}
          <a href={variableStorageShareUrl}>ChatGPT share, CUDA Variable Storage</a>
        </p>
        <div className="memory-type-table-wrap">
          <table className="memory-type-table">
            <thead>
              <tr>
                <th>Variable declaration</th>
                <th>Example</th>
                <th>Memory</th>
                <th>Scope</th>
                <th>Lifetime</th>
                <th>Practical meaning</th>
              </tr>
            </thead>
            <tbody>
              {cudaMemoryTypes.map((type) => (
                <tr key={type.declaration}>
                  <th>{type.declaration}</th>
                  <td>
                    <code>{type.example}</code>
                  </td>
                  <td>{type.memory}</td>
                  <td>{type.scope}</td>
                  <td>{type.lifetime}</td>
                  <td>{type.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="memory-scope-grid">
          {memoryScopeCards.map((item) => (
            <article className="memory-scope-card" key={item.label}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.explanation}</p>
            </article>
          ))}
        </div>
        <CodeBlock>{`__constant__ float c_coeff[64];  // constant memory, grid-visible reads
__device__ int g_counter;       // global memory, grid-visible state

__global__ void kernel(float* data) {
    int tx = threadIdx.x;          // register, private to this thread
    float scratch[8];              // local memory if it cannot stay in registers
    __shared__ float tile[256];    // shared memory, one tile per block

    tile[tx] = data[tx];
    __syncthreads();
}`}</CodeBlock>
        <Callout title="Learning rule" tone="success">
          Do not read the word local as shared with nearby threads. In CUDA, local memory is
          thread-private. If threads need to cooperate, the declaration you are looking for is
          <code> __shared__</code>, and the cooperation boundary is the block.
        </Callout>
      </Section>

      <Section
        id="roofline"
        title="Roofline model"
        note="Use Roofline when a single kernel needs a bottleneck story: memory bandwidth, compute throughput, or inefficient use of one of those ceilings."
      >
        <p>
          The Roofline Model compares the performance a kernel achieves against two hardware limits:
          peak memory bandwidth and peak compute throughput. It answers the practical profiling
          question: is this kernel slow because it cannot move data fast enough, because it has hit
          the math ceiling, or because it is far below the relevant roof?
        </p>
        <p className="source-note">
          Source note:{" "}
          <a href={rooflineShareUrl}>ChatGPT share, Roofline Model Explanation</a>
        </p>
        <RooflineFigure />
        <div className="two-column-list">
          <div>
            <h3>Axes</h3>
            <p>
              The x-axis is computational intensity: FLOPs per byte moved. The y-axis is achieved
              throughput, commonly GFLOPS. More work per byte moves a kernel to the right.
            </p>
          </div>
          <div>
            <h3>Roofs</h3>
            <p>
              The diagonal roof is bandwidth times intensity. The horizontal roof is peak compute
              throughput. The achievable limit is the lower of those two values.
            </p>
          </div>
        </div>
        <CodeBlock>{`computational_intensity = FLOPs / bytes_moved
bandwidth_limit         = peak_bandwidth * computational_intensity
roofline_limit          = min(peak_compute, bandwidth_limit)
knee_intensity          = peak_compute / peak_bandwidth

// Vector add rough estimate for float:
// reads A[i], reads B[i], writes C[i] = 12 bytes
// one floating-point add = 1 FLOP
intensity = 1.0 / 12.0; // about 0.083 FLOP/B, usually memory-bound`}</CodeBlock>
        <div className="roofline-case-grid">
          {rooflineCases.map((item) => (
            <article className="roofline-case-card" key={item.label}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.explanation}</p>
              <p className="evidence-hook">
                <strong>Next move:</strong> {item.nextMove}
              </p>
            </article>
          ))}
        </div>
        <Callout title="How to use this in a CUDA write-up" tone="success">
          A point close to its roof means the code is near the relevant hardware limit. A point far
          below the roof means there is likely an implementation problem or another bottleneck.
          Crossing the knee changes the optimization question from bandwidth use to compute-unit use.
        </Callout>
      </Section>

      <Section id="method" title="Profiling method">
        <Callout title="What to write in the diary">
          Record the timeline, the bottleneck, the hypothesis, the change, and the before/after
          number. That turns profiling into evidence instead of a screenshot collection.
        </Callout>
        <CodeBlock>{`profiling loop:
1. Measure the whole pipeline.
2. Find the dominant stage.
3. Form one hypothesis.
4. Change one thing.
5. Re-measure and write the result.`}</CodeBlock>
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="Keep the shared explanation links with the page so the teaching sources stay visible beside the official CUDA and profiling references."
      >
        <div className="reference-grid">
          {["programming-guide", "best-practices", "nsight-systems", "nsight-compute"].map((sourceId) => {
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
          <a className="reference-card" href={variableStorageShareUrl}>
            <strong>ChatGPT share: CUDA Variable Storage</strong>
            <span>User-shared explanation used for the CUDA memory type table and notes.</span>
            <small>Checked 2026-06-15</small>
          </a>
          <a className="reference-card" href={rooflineShareUrl}>
            <strong>ChatGPT share: Roofline Model Explanation</strong>
            <span>User-shared explanation used for the Roofline model notes and figure.</span>
            <small>Checked 2026-06-15</small>
          </a>
        </div>
      </Section>
    </EssayLayout>
  );
}

function RooflineFigure() {
  return (
    <figure className="interactive-panel roofline-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Visual model</p>
          <h3>Compute roof, bandwidth roof, and the knee</h3>
        </div>
        <div className="quality-pill quality-mixed">bottleneck map</div>
      </div>
      <svg className="roofline-svg" viewBox="0 0 760 430" role="img" aria-labelledby="roofline-title">
        <title id="roofline-title">Roofline model with memory-bound and compute-bound regions</title>
        <line x1="90" y1="345" x2="690" y2="345" className="roofline-axis" />
        <line x1="90" y1="345" x2="90" y2="55" className="roofline-axis" />
        <text x="390" y="392" className="roofline-axis-label">
          Computational intensity (FLOP/B)
        </text>
        <text x="28" y="240" className="roofline-axis-label roofline-y-label">
          Throughput (GFLOPS)
        </text>

        <line x1="90" y1="345" x2="330" y2="145" className="roofline-bandwidth" />
        <line x1="330" y1="145" x2="690" y2="145" className="roofline-compute" />
        <line x1="330" y1="345" x2="330" y2="145" className="roofline-knee" />
        <text x="135" y="286" className="roofline-line-label roofline-slope-label">
          peak bandwidth x intensity
        </text>
        <text x="470" y="129" className="roofline-line-label">
          peak compute throughput
        </text>
        <text x="340" y="365" className="roofline-line-label">
          knee
        </text>

        <text x="160" y="90" className="roofline-region-label">
          memory-bound side
        </text>
        <text x="500" y="90" className="roofline-region-label">
          compute-bound side
        </text>

        <g className="roofline-point-group">
          <circle cx="255" cy="212" r="8" className="roofline-point roofline-point-a1" />
          <text x="286" y="205" className="roofline-point-label">
            A1
          </text>
        </g>
        <g className="roofline-point-group">
          <circle cx="255" cy="278" r="8" className="roofline-point roofline-point-a2" />
          <text x="272" y="284" className="roofline-point-label">
            A2
          </text>
        </g>
        <g className="roofline-point-group">
          <circle cx="445" cy="188" r="8" className="roofline-point roofline-point-a3" />
          <text x="462" y="194" className="roofline-point-label">
            A3
          </text>
        </g>
      </svg>
      <figcaption>
        Points below the roof are measured kernels. Their location tells you which hardware limit is
        relevant and whether the implementation is close to that limit.
      </figcaption>
    </figure>
  );
}
