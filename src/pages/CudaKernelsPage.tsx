import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { DetailList } from "../components/DetailList";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

const sourceIds = ["programming-guide", "best-practices", "cutlass", "compute-sanitizer"];

export function CudaKernelsPage() {
  return (
    <EssayLayout
      eyebrow="CUDA knowledge subpage"
      title="Kernels, Tiling, And __syncthreads()"
      dek="A kernel-first explanation anchored in tiled matrix multiplication: what a block owns, what a thread owns, why shared memory needs barriers, and where the parallelism actually comes from."
      toc={[
        { id: "tiling", label: "Tiling" },
        { id: "kernel-shape", label: "Kernel shape" },
        { id: "private-sum", label: "Private sum" },
        { id: "syncthreads", label: "__syncthreads" },
        { id: "mistakes", label: "Mistakes" },
        { id: "practice", label: "Practice" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="tiling"
        title="Tiling multiplication"
        note="Start here: tiled GEMM is the easiest concrete place to see kernels, blocks, threads, shared memory, and barriers working together."
      >
        <p>
          Matrix multiplication computes one output element as a dot product:
          <code> C[row][col] = sum_k A[row][k] * B[k][col]</code>. A basic CUDA
          tiled kernel usually assigns one block to one tile of <code>C</code> and one
          thread to one element inside that tile.
        </p>
        <div className="kernel-tile-flow" aria-label="Tiled matrix multiplication data flow">
          <article>
            <h3>A tile</h3>
            <TileGrid active="row" />
            <p>Rows needed by this block are loaded from global memory into shared memory.</p>
          </article>
          <span aria-hidden="true">x</span>
          <article>
            <h3>B tile</h3>
            <TileGrid active="column" />
            <p>Columns needed by this block are loaded once, then reused by many threads.</p>
          </article>
          <span aria-hidden="true">=</span>
          <article>
            <h3>C tile</h3>
            <TileGrid active="result" />
            <p>Each thread owns one output element and accumulates its own register sum.</p>
          </article>
        </div>
        <Callout title="Conversation takeaway" tone="success">
          The tile loop is not distributed across blocks. Every thread in the block runs through
          every <code>K</code>-tile for the <code>C[row][col]</code> element it owns.
        </Callout>
        <p>
          The synchronization parts of this kernel have their own deeper article:{" "}
          <Link to="/cuda-kb/syncthreads">Understanding __syncthreads()</Link>.
        </p>
      </Section>

      <Section
        id="kernel-shape"
        title="Kernel shape"
        note="This is the standard learning shape, not the final form of a production GEMM."
      >
        <p>
          A kernel is device code launched by the host across a grid of blocks. In this example,
          <code> blockIdx</code> selects the output tile, <code>threadIdx</code> selects the element
          inside the tile, shared memory holds reusable input tiles, and a private register holds the
          accumulating sum.
        </p>
        <CodeBlock language="cuda" showLineNumbers title="matmul_tiled.cu">{`#define TILE 16

__global__ void matmulTiled(
    const float* A,
    const float* B,
    float* C,
    int M, // rows of A and C
    int N, // columns of B and C
    int K) // columns of A, rows of B
{
    __shared__ float As[TILE][TILE];
    __shared__ float Bs[TILE][TILE];

    int tx = threadIdx.x;
    int ty = threadIdx.y;
    int row = blockIdx.y * TILE + ty;
    int col = blockIdx.x * TILE + tx;

    float sum = 0.0f;
    int numberOfTiles = (K + TILE - 1) / TILE;

    for (int tile = 0; tile < numberOfTiles; ++tile)
    {
        int aCol = tile * TILE + tx;
        int bRow = tile * TILE + ty;

        As[ty][tx] = (row < M && aCol < K) ? A[row * K + aCol] : 0.0f;
        Bs[ty][tx] = (bRow < K && col < N) ? B[bRow * N + col] : 0.0f;

        __syncthreads();

        for (int k = 0; k < TILE; ++k)
        {
            sum += As[ty][k] * Bs[k][tx];
        }

        __syncthreads();
    }

    if (row < M && col < N)
    {
        C[row * N + col] = sum;
    }
}`}</CodeBlock>
        <DetailList
          title="Launch interpretation"
          items={[
            "grid.x covers C columns by tiles; grid.y covers C rows by tiles.",
            "blockDim is TILE x TILE, so TILE=16 creates 256 threads per block.",
            "Every thread loads one A element and one B element per tile step when the indexes are in bounds.",
            "The bounds checks protect memory accesses, but all threads still reach the barriers.",
          ]}
        />
      </Section>

      <Section
        id="private-sum"
        title="The private sum"
        note="This was the central confusion in the shared conversation."
      >
        <p>
          The <code>sum</code> variable is not shared memory. It belongs to one thread, usually in a
          register. If a block has 256 threads, then that block has 256 independent sums in flight.
          Each one eventually writes a different element of <code>C</code>.
        </p>
        <div className="answer-grid">
          <article className="answer-card">
            <h3>What is parallel?</h3>
            <p>
              The <code>M x N</code> output space. Thousands or millions of independent
              <code> C[row][col]</code> elements can be computed at the same time.
            </p>
          </article>
          <article className="answer-card">
            <h3>What is serial?</h3>
            <p>
              The basic per-thread dot product over <code>K</code>. One thread accumulates tile 0,
              then tile 1, then tile 2 for its own output element.
            </p>
          </article>
          <article className="answer-card">
            <h3>Why not split the sum?</h3>
            <p>
              Splitting one output element across blocks requires an atomic update, a second
              reduction kernel, or a cooperative-group design. Libraries may use split-K, but it adds
              coordination work.
            </p>
          </article>
        </div>
      </Section>

      <Section
        id="syncthreads"
        title="What __syncthreads() means"
        note="A block-wide barrier is about cooperation inside one block, not global kernel coordination."
      >
        <p>
          <code>__syncthreads()</code> stops each thread in the current block until the other threads
          in that block reach the same barrier. It also makes memory operations before the barrier
          visible to the threads in that block after the barrier. It does not synchronize separate
          blocks.
        </p>
        <p>
          For a full treatment of barrier scope, shared-memory handoff, reductions, and unsafe
          branch patterns, open{" "}
          <Link to="/cuda-kb/syncthreads">the dedicated __syncthreads() article</Link>.
        </p>
        <div className="kernel-sync-grid">
          <article>
            <h3>Barrier after load</h3>
            <p>
              After threads cooperatively load <code>As</code> and <code>Bs</code>, the block waits
              so no thread reads a tile entry before its neighbor has written it.
            </p>
          </article>
          <article>
            <h3>Barrier before reuse</h3>
            <p>
              After the inner multiply loop, the block waits again so no thread overwrites
              <code> As</code> or <code>Bs</code> for the next tile while another thread is still
              reading the current tile.
            </p>
          </article>
          <article>
            <h3>Block scope only</h3>
            <p>
              Block <code>(0, 0)</code> and block <code>(1, 0)</code> have separate shared memory
              and separate barriers. Normal kernels have no simple grid-wide barrier inside the same
              launch.
            </p>
          </article>
        </div>
        <CodeBlock language="cuda" title="Barrier-safe tile loop">{`// Safe shape: all threads reach both barriers.
As[ty][tx] = inBoundsA ? A[row * K + aCol] : 0.0f;
Bs[ty][tx] = inBoundsB ? B[bRow * N + col] : 0.0f;

__syncthreads();

for (int k = 0; k < TILE; ++k)
{
    sum += As[ty][k] * Bs[k][tx];
}

__syncthreads();`}</CodeBlock>
      </Section>

      <Section id="mistakes" title="Mistakes to avoid">
        <div className="answer-grid">
          <article className="answer-card">
            <h3>Returning before a barrier</h3>
            <p>
              Do not let out-of-bounds threads return before a later <code>__syncthreads()</code>.
              Use predicates around loads and stores, while keeping all block threads on the same
              barrier path.
            </p>
          </article>
          <article className="answer-card">
            <h3>Expecting cross-block sync</h3>
            <p>
              <code>__syncthreads()</code> cannot combine partial sums from different blocks. Use a
              separate kernel, atomics, or a deliberate split-K/reduction strategy.
            </p>
          </article>
          <article className="answer-card">
            <h3>Using barriers as decoration</h3>
            <p>
              A barrier is useful when threads communicate through shared memory or reuse shared
              storage. It is not a performance hint and is not needed at the end of a kernel.
            </p>
          </article>
        </div>
      </Section>

      <Section id="practice" title="Practice path">
        <DetailList
          title="Build this in order"
          ordered
          items={[
            "Write a CPU matrix multiply reference and a naive one-thread-per-C-element CUDA kernel.",
            "Add the tiled kernel with TILE=16 and prove it matches the CPU reference on non-multiple sizes.",
            "Run Compute Sanitizer before timing; barrier mistakes often show up as race or invalid-memory bugs.",
            "Benchmark naive versus tiled with H2D, kernel, D2H, and total time separated.",
            "Explain in the README which values are global, shared, and private for one output tile.",
          ]}
        />
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="The shared conversation supplied the learning path; these are the canonical references to keep the technical claims grounded."
      >
        <div className="reference-grid">
          {sourceIds.map((sourceId) => {
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
        <p className="month-nav">
          <Link to="/cuda-kb#pillars">Back to CUDA KB</Link>
          <Link to="/cuda-kb/execution-model">Execution model</Link>
          <Link to="/cuda-lab">Open CUDA lab</Link>
        </p>
      </Section>
    </EssayLayout>
  );
}

function TileGrid({ active }: { active: "row" | "column" | "result" }) {
  return (
    <div className={`kernel-mini-matrix kernel-mini-matrix-${active}`}>
      {Array.from({ length: 16 }, (_, index) => {
        const highlighted =
          (active === "row" && index < 4) ||
          (active === "column" && index % 4 === 1) ||
          (active === "result" && index === 1);

        return <span className={highlighted ? "is-highlighted" : undefined} key={index} />;
      })}
    </div>
  );
}
