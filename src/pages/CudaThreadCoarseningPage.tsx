import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { DetailList } from "../components/DetailList";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

const sourceIds = [
  "programming-guide",
  "best-practices",
  "programming-guide-compute-capabilities",
  "runtime-api-occupancy",
  "nsight-compute",
];

export function CudaThreadCoarseningPage() {
  return (
    <EssayLayout
      eyebrow="CUDA optimization article"
      title="Thread Coarsening"
      dek="A practical guide to giving each CUDA thread more than one logical output, when that helps, and how to avoid trading away too much parallelism."
      toc={[
        { id: "model", label: "Model" },
        { id: "why", label: "Why coarsen" },
        { id: "indexing", label: "Indexing" },
        { id: "reduction", label: "Reductions" },
        { id: "costs", label: "Costs" },
        { id: "tuning", label: "Tuning" },
        { id: "practice", label: "Practice" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="model"
        title="The core model"
        note="Thread coarsening means one CUDA thread handles multiple pieces of logical work."
      >
        <p>
          The beginner CUDA shape is often one thread per output element. Thread coarsening changes
          the grain size: each launched thread computes two, four, eight, or some other small number
          of output elements. The total problem has the same logical work, but the launch exposes
          fewer logical CUDA threads and gives each thread a larger local loop.
        </p>
        <Callout title="Working definition" tone="success">
          Coarsening trades thread-level parallelism for more per-thread work. It is useful only
          when the extra work improves reuse, instruction-level parallelism, or overhead enough to
          offset the loss of exposed parallelism.
        </Callout>
        <div className="kernel-sync-grid">
          <article>
            <h3>Fine-grained</h3>
            <p>
              One thread owns one element. This maximizes exposed parallelism and keeps indexing
              simple.
            </p>
          </article>
          <article>
            <h3>Coarsened</h3>
            <p>
              One thread owns several elements. This reduces thread count and can give the compiler
              more independent instructions per thread.
            </p>
          </article>
          <article>
            <h3>Measured</h3>
            <p>
              The right coarsening factor is empirical. A factor of two may help while a factor of
              eight can spill registers or starve occupancy.
            </p>
          </article>
        </div>
      </Section>

      <Section
        id="why"
        title="Why it can be faster"
        note="The win is not that fewer threads are inherently better. The win is what the larger per-thread body enables."
      >
        <p>
          Coarsening is most plausible when a kernel has enough parallelism already but each thread
          is too small to make efficient use of the hardware. Giving each thread more work can
          reduce repeated address arithmetic, amortize boundary checks, reuse values already loaded
          into registers, and expose independent instructions that help cover latency inside the
          thread.
        </p>
        <div className="answer-grid">
          <article className="answer-card">
            <h3>More local reuse</h3>
            <p>
              A thread can load a shared coefficient, pointer base, or neighboring value once and
              apply it to several nearby outputs.
            </p>
          </article>
          <article className="answer-card">
            <h3>More ILP</h3>
            <p>
              Multiple independent accumulators can let the scheduler issue useful work while one
              instruction chain is waiting.
            </p>
          </article>
          <article className="answer-card">
            <h3>Less overhead</h3>
            <p>
              Index calculations, loop control, block scheduling pressure, and guard branches can
              be amortized over more useful work per thread.
            </p>
          </article>
        </div>
        <p>
          A grid-stride loop is the related general-purpose pattern: each thread repeatedly advances
          by <code>blockDim.x * gridDim.x</code>. Thread coarsening is a more explicit tuning knob:
          each thread handles a fixed local chunk before the next block of work begins.
        </p>
      </Section>

      <Section
        id="indexing"
        title="The indexing pattern that preserves coalescing"
        note="A coarsened loop should usually keep neighboring lanes touching neighboring addresses at each loop step."
      >
        <p>
          The safest first version keeps the block shape fixed and changes how much work each
          thread owns. For a one-dimensional elementwise kernel, launch enough blocks to cover
          <code> blockDim.x * COARSEN</code> elements per block.
        </p>
        <CodeBlock>{`template <int COARSEN>
__global__ void saxpyCoarsened(
    const float* __restrict__ x,
    float* __restrict__ y,
    float a,
    int n)
{
    int laneBase = blockIdx.x * blockDim.x * COARSEN + threadIdx.x;

    #pragma unroll
    for (int c = 0; c < COARSEN; ++c)
    {
        int i = laneBase + c * blockDim.x;
        if (i < n)
        {
            y[i] = a * x[i] + y[i];
        }
    }
}`}
        </CodeBlock>
        <CodeBlock>{`int blockSize = 256;
int coarsen = 4;
int blocks = (n + blockSize * coarsen - 1) / (blockSize * coarsen);

saxpyCoarsened<4><<<blocks, blockSize>>>(x, y, a, n);`}
        </CodeBlock>
        <p>
          Notice the index <code>i = laneBase + c * blockDim.x</code>. For a fixed value of
          <code> c</code>, adjacent lanes still access adjacent elements. That usually preserves
          coalesced global-memory traffic better than giving each thread a contiguous private run
          with <code>i = base + c</code>, where adjacent lanes can be separated by the coarsening
          factor.
        </p>
      </Section>

      <Section
        id="reduction"
        title="Coarsening before a reduction"
        note="A common use case is to let each thread accumulate several values before entering a block reduction."
      >
        <p>
          Reductions are a natural fit because each thread can combine several global-memory values
          into a private register before sharing one partial result with the block. This reduces the
          number of values that need to enter the shared-memory reduction tree.
        </p>
        <CodeBlock>{`template <int COARSEN>
__global__ void reduceCoarsened(const float* input, float* blockSums, int n)
{
    extern __shared__ float partial[];

    int tid = threadIdx.x;
    int laneBase = blockIdx.x * blockDim.x * COARSEN + tid;
    float local = 0.0f;

    #pragma unroll
    for (int c = 0; c < COARSEN; ++c)
    {
        int i = laneBase + c * blockDim.x;
        if (i < n)
        {
            local += input[i];
        }
    }

    partial[tid] = local;
    __syncthreads();

    // Continue with the usual block-level reduction over partial[tid].
}`}
        </CodeBlock>
        <p>
          This works because the private <code>local</code> accumulator is independent for each
          thread. The block still needs a correct reduction and the usual barrier discipline. For
          the barrier side of this pattern, read{" "}
          <Link to="/cuda-kb/syncthreads">Understanding __syncthreads()</Link>.
        </p>
      </Section>

      <Section
        id="costs"
        title="What coarsening can break"
        note="Thread coarsening is a pressure trade, not a universal upgrade."
      >
        <p>
          The larger per-thread body can increase register use, lengthen live ranges, create more
          branch work at the boundary, and reduce the number of warps available to hide latency.
          If the kernel was already latency-limited and needed many resident warps, aggressive
          coarsening can make it slower.
        </p>
        <div className="answer-grid">
          <article className="answer-card">
            <h3>Occupancy pressure</h3>
            <p>
              More registers per thread can reduce resident warps. This is the same kind of
              resource trade discussed in the shared-memory occupancy article.
            </p>
          </article>
          <article className="answer-card">
            <h3>Memory pattern damage</h3>
            <p>
              A careless indexing pattern can turn adjacent lane accesses into strided accesses and
              waste memory transactions.
            </p>
          </article>
          <article className="answer-card">
            <h3>Load imbalance</h3>
            <p>
              Boundary-heavy inputs or irregular work can leave some threads doing much more local
              work than their neighbors.
            </p>
          </article>
        </div>
        <p className="month-nav">
          <Link to="/cuda-kb/shared-memory-occupancy">Shared memory and occupancy</Link>
          <Link to="/cuda-kb/execution-model#occupancy">Execution model occupancy</Link>
        </p>
      </Section>

      <Section
        id="tuning"
        title="How to tune the coarsening factor"
        note="Start with a small sweep and let profiler evidence decide whether to keep the pattern."
      >
        <p>
          Keep the first experiment boring: use the same block size, sweep a small set of coarsening
          factors, and compare against the uncoarsened baseline. If the best result is only faster
          for one input size or one GPU, document that constraint instead of treating the factor as
          a law.
        </p>
        <DetailList
          title="Sweep ledger"
          ordered
          items={[
            "Run COARSEN = 1, 2, 4, and 8 with the same block size.",
            "Record kernel time, effective bandwidth or throughput, and output correctness.",
            "Record registers per thread from ptxas or Nsight Compute.",
            "Compare achieved occupancy, eligible warps per cycle, memory throughput, and stall reasons.",
            "Inspect global-memory coalescing metrics after any indexing change.",
            "Keep the smallest factor that gives a stable measured win.",
          ]}
        />
        <CodeBlock>{`# Evidence commands
nvcc --ptxas-options=-v ...
ncu --set full --target-processes all ./build/cuda_lab`}
        </CodeBlock>
      </Section>

      <Section id="practice" title="Practice path">
        <DetailList
          title="Add this to a CUDA lab"
          ordered
          items={[
            "Implement an uncoarsened elementwise kernel and a CPU reference.",
            "Add the coalescing-preserving COARSEN loop with factors 2, 4, and 8.",
            "Repeat the same idea for a reduction where each thread accumulates several inputs locally.",
            "Benchmark enough input sizes to see whether the result changes when the problem is small, medium, and large.",
            "Write one paragraph explaining the winning factor in terms of registers, occupancy, memory behavior, and elapsed time.",
          ]}
        />
        <Callout title="Interview phrasing" tone="success">
          Thread coarsening is a measured optimization where each thread performs multiple logical
          work items. It can improve reuse and instruction-level parallelism, but it can also reduce
          occupancy through register pressure or hurt coalescing if the indexing pattern is wrong.
        </Callout>
        <p className="month-nav">
          <Link to="/cuda-kb#glossary">Back to glossary</Link>
          <Link to="/cuda-kb/kernels#private-sum">Private per-thread work</Link>
          <Link to="/cuda-kb#workflows">Optimization workflow</Link>
        </p>
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="Use these for the programming model, occupancy-resource limits, and profiler-backed tuning checks."
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
