import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { DetailList } from "../components/DetailList";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

const sourceIds = ["programming-guide", "best-practices", "compute-sanitizer"];

export function CudaSyncthreadsPage() {
  return (
    <EssayLayout
      eyebrow="CUDA deep article"
      title="Understanding __syncthreads()"
      dek="A block-level synchronization article for the exact moment where CUDA stops being just many independent threads and becomes cooperative parallel code."
      toc={[
        { id: "definition", label: "Definition" },
        { id: "scope", label: "Scope" },
        { id: "shared-memory", label: "Shared memory" },
        { id: "tiled-gemm", label: "Tiled GEMM" },
        { id: "reduction", label: "Reduction" },
        { id: "rules", label: "Rules" },
        { id: "limits", label: "Limits" },
        { id: "debugging", label: "Debugging" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="definition"
        title="The definition"
        note="Think barrier first, memory visibility second, and always keep the block boundary in view."
      >
        <p>
          <code>__syncthreads()</code> is a CUDA C++ intrinsic that creates a barrier for the
          threads in one block. When a thread reaches the barrier, it waits there until the other
          threads in that same block have also reached it. After the barrier completes, the block can
          safely continue with the assumption that the earlier cooperative work is finished.
        </p>
        <Callout title="Working sentence" tone="success">
          Use <code>__syncthreads()</code> when threads in the same block write data that other
          threads in the same block must read before the kernel moves on.
        </Callout>
        <div className="sync-step-grid">
          <article>
            <h3>Before</h3>
            <p>Threads are loading, writing, or updating data at different speeds.</p>
          </article>
          <article>
            <h3>Barrier</h3>
            <p>No thread passes until the block reaches the same synchronization point.</p>
          </article>
          <article>
            <h3>After</h3>
            <p>Threads can read the data produced before the barrier inside that block.</p>
          </article>
        </div>
      </Section>

      <Section
        id="scope"
        title="The scope is one block"
        note="This is the most important limit: it is not a grid-wide synchronization primitive."
      >
        <p>
          CUDA blocks are independent units of work. A block can have shared memory and barriers,
          but those resources belong to that block only. If a kernel launches four blocks, a
          <code> __syncthreads()</code> call in block 0 waits for block 0's threads. It does not wait
          for block 1, block 2, or block 3.
        </p>
        <div className="kernel-sync-grid">
          <article>
            <h3>Synchronizes</h3>
            <p>Threads with the same <code>blockIdx</code> inside the current kernel launch.</p>
          </article>
          <article>
            <h3>Does not synchronize</h3>
            <p>Different blocks, different kernels, host code, streams, or other devices.</p>
          </article>
          <article>
            <h3>Grid-wide work</h3>
            <p>Use a second kernel, atomics, cooperative groups, or a library primitive when blocks must combine results.</p>
          </article>
        </div>
        <CodeBlock language="cuda">{`// One barrier per block, not one barrier for the whole grid.
myKernel<<<4, 256>>>();

// In block 0:
__syncthreads(); // waits for block 0 threads only

// In block 1:
__syncthreads(); // waits for block 1 threads only`}</CodeBlock>
      </Section>

      <Section
        id="shared-memory"
        title="Why shared memory needs it"
        note="Shared memory is fast because it is local to a block, but correctness still depends on timing."
      >
        <p>
          Threads in a block do not run in lockstep as one perfectly aligned group. Some lanes may
          execute earlier, later, or be delayed by memory operations. If one thread reads shared
          memory that another thread is supposed to write, a barrier is the point where the program
          says, "the write phase is complete; now the read phase can begin."
        </p>
        <CodeBlock language="cuda">{`__global__ void readNeighbor(const float* input, float* output, int n)
{
    extern __shared__ float s[];

    int tid = threadIdx.x;
    int globalId = blockIdx.x * blockDim.x + tid;

    s[tid] = (globalId < n) ? input[globalId] : 0.0f;

    __syncthreads();

    if (globalId < n)
    {
        float left = (tid > 0) ? s[tid - 1] : 0.0f;
        float center = s[tid];
        float right = (tid + 1 < blockDim.x) ? s[tid + 1] : 0.0f;
        output[globalId] = left + center + right;
    }
}`}</CodeBlock>
        <DetailList
          title="What the barrier protects"
          items={[
            "Thread tid reads s[tid - 1], which may have been written by another thread.",
            "Thread tid reads s[tid + 1], which may have been written by another thread.",
            "The barrier separates the cooperative load phase from the neighbor-read phase.",
          ]}
        />
      </Section>

      <Section
        id="tiled-gemm"
        title="The tiled multiplication pattern"
        note="Tiled matrix multiplication usually needs two barriers per tile step."
      >
        <p>
          In a tiled matrix multiplication kernel, threads in a block cooperatively load one tile of
          <code> A</code> and one tile of <code>B</code> into shared memory. Then every thread reuses
          those shared tiles to advance its own private sum. The first barrier protects reads from
          seeing incomplete tile loads. The second barrier protects the tile storage from being
          overwritten while another thread is still reading it.
        </p>
        <CodeBlock language="cuda">{`for (int tile = 0; tile < numberOfTiles; ++tile)
{
    As[ty][tx] = loadAOrZero(...);
    Bs[ty][tx] = loadBOrZero(...);

    __syncthreads(); // tile is fully loaded

    for (int k = 0; k < TILE; ++k)
    {
        sum += As[ty][k] * Bs[k][tx];
    }

    __syncthreads(); // nobody is still reading this tile
}`}</CodeBlock>
        <p>
          This does not make the private <code>sum</code> shared. The sum still belongs to one
          thread. The barrier only coordinates the shared-memory tile that all threads in the block
          reuse.
        </p>
      </Section>

      <Section
        id="reduction"
        title="The reduction pattern"
        note="A reduction has repeated phases where later work depends on earlier writes."
      >
        <p>
          Reductions are another place where the barrier is visible. Each stride reads values that
          were produced by the previous stride. Without the barrier, a thread could read a value
          before the earlier addition has completed.
        </p>
        <CodeBlock language="cuda">{`for (int stride = blockDim.x / 2; stride > 0; stride /= 2)
{
    if (threadIdx.x < stride)
    {
        s[threadIdx.x] += s[threadIdx.x + stride];
    }

    __syncthreads();
}`}</CodeBlock>
        <Callout title="Why this barrier is different from the GEMM barrier">
          GEMM barriers separate load, compute, and reuse phases. Reduction barriers separate
          dependent update phases inside the same shared array.
        </Callout>
      </Section>

      <Section
        id="rules"
        title="Rules for correctness"
        note="Most __syncthreads() bugs come from control flow, not from the intrinsic itself."
      >
        <div className="answer-grid">
          <article className="answer-card">
            <h3>All block threads must reach it</h3>
            <p>
              Do not put a barrier behind a condition that only some threads in the block execute.
              A conditional barrier is valid only when the condition is uniform for the whole block.
            </p>
          </article>
          <article className="answer-card">
            <h3>Do not return early</h3>
            <p>
              If later code has a barrier, out-of-bounds threads should usually write neutral values
              or skip stores with predicates, then still reach the barrier.
            </p>
          </article>
          <article className="answer-card">
            <h3>Place it at phase boundaries</h3>
            <p>
              Put barriers between cooperative write and read phases, or before shared memory is
              reused for another phase.
            </p>
          </article>
        </div>
        <CodeBlock language="cuda">{`// Dangerous: only some threads reach the barrier.
if (globalId < n)
{
    s[threadIdx.x] = input[globalId];
    __syncthreads();
}

// Safer: every thread reaches the barrier.
s[threadIdx.x] = (globalId < n) ? input[globalId] : 0.0f;
__syncthreads();

if (globalId < n)
{
    output[globalId] = s[threadIdx.x];
}`}</CodeBlock>
      </Section>

      <Section
        id="limits"
        title="What it does not solve"
        note="A barrier can make a shared-memory handoff correct, but it does not automatically make a kernel fast."
      >
        <DetailList
          title="Not guaranteed by __syncthreads()"
          items={[
            "It does not synchronize blocks with each other.",
            "It does not make a non-coalesced global-memory access efficient.",
            "It does not remove shared-memory bank conflicts.",
            "It does not make private variables visible to other threads.",
            "It does not replace atomic operations when multiple threads write the same global address.",
          ]}
        />
        <Callout title="Performance rule" tone="warning">
          Add a barrier only when there is a real dependency. A correct barrier can still cost time,
          and an unnecessary barrier can reduce throughput.
        </Callout>
      </Section>

      <Section id="debugging" title="Debugging checklist">
        <DetailList
          title="When a shared-memory kernel looks wrong"
          ordered
          items={[
            "Identify which shared-memory locations are written by one thread and read by another.",
            "Mark the write phase and the read phase; there should be a barrier between them.",
            "Check every branch before the barrier and prove all block threads reach it.",
            "For boundary cases, use neutral values instead of early returns before a later barrier.",
            "Run Compute Sanitizer before trusting timings or profiler conclusions.",
          ]}
        />
        <p className="month-nav">
          <Link to="/cuda-kb/kernels">Back to kernel guide</Link>
          <Link to="/cuda-kb#glossary">Open glossary</Link>
          <Link to="/cuda-lab">Open CUDA lab</Link>
        </p>
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="Use these when refining synchronization claims or adding more examples."
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
      </Section>
    </EssayLayout>
  );
}
