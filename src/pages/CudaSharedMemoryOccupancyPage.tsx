import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { DetailList } from "../components/DetailList";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

const sourceIds = [
  "best-practices",
  "ampere-tuning-guide",
  "programming-guide-compute-capabilities",
  "runtime-api-occupancy",
  "nsight-compute",
];

export function CudaSharedMemoryOccupancyPage() {
  return (
    <EssayLayout
      eyebrow="CUDA deep article"
      title="Shared Memory And Occupancy"
      dek="A practical explanation of why shared memory can make a kernel faster while also reducing the number of blocks and warps that can live on an SM at the same time."
      toc={[
        { id: "model", label: "Model" },
        { id: "budget", label: "SM budget" },
        { id: "average", label: "Bytes/thread" },
        { id: "tiled-gemm", label: "Tiled GEMM" },
        { id: "large-block", label: "32 KiB block" },
        { id: "tradeoff", label: "Tradeoff" },
        { id: "practice", label: "Practice" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="model"
        title="The core model"
        note="Shared memory is a per-block resource. Occupancy is about how many warps can be resident on an SM."
      >
        <p>
          The useful sentence is: shared memory can improve performance, but using too much shared
          memory per block can reduce occupancy. Shared memory helps when a block reuses data that
          would otherwise be fetched repeatedly from global memory. It hurts occupancy when each
          block consumes enough of the SM's limited shared-memory budget that fewer blocks can be
          resident at once.
        </p>
        <Callout title="Working intuition" tone="success">
          All launched blocks eventually run. Occupancy describes how much work can be resident on
          one SM at the same time, not whether the rest of the launch disappears.
        </Callout>
        <div className="kernel-sync-grid">
          <article>
            <h3>The SM owns the budget</h3>
            <p>
              An SM has limited resident warps, resident threads, resident block slots, registers,
              and shared memory.
            </p>
          </article>
          <article>
            <h3>Each block spends it</h3>
            <p>
              A block consumes threads, registers, and shared memory before it can be placed on an
              SM.
            </p>
          </article>
          <article>
            <h3>Occupancy is the result</h3>
            <p>
              The limiting resource decides how many blocks and warps can be resident for that
              kernel.
            </p>
          </article>
        </div>
      </Section>

      <Section
        id="budget"
        title="A back-of-the-envelope SM budget"
        note="Use this for intuition first; use the CUDA occupancy API or Nsight Compute for exact answers."
      >
        <p>
          Suppose an A100-style SM is configured with 164 KiB of shared memory and can hold 2048
          resident threads. If a kernel uses 32 KiB of shared memory per block, shared memory alone
          allows only five such blocks to be resident on that SM.
        </p>
        <CodeBlock language="text" title="Occupancy estimate" wrap>{`resident_blocks_by_smem = floor(shared_memory_per_sm / shared_memory_per_block)
resident_threads = resident_blocks * threads_per_block
occupancy_estimate = resident_threads / max_resident_threads`}</CodeBlock>
        <p>
          With 256 threads per block, the estimate is:
        </p>
        <CodeBlock language="text" title="Worked occupancy estimate" wrap>{`resident_blocks_by_smem = floor(164 KiB / 32 KiB) = 5
resident_threads = 5 blocks * 256 threads/block = 1280
occupancy_estimate = 1280 / 2048 = 62.5%`}</CodeBlock>
        <p>
          This is intentionally simplified. Real occupancy also depends on warp slots, block slots,
          register allocation, shared-memory carveout, static versus dynamic shared memory, and
          architecture-specific allocation granularity.
        </p>
      </Section>

      <Section
        id="average"
        title="The bytes-per-thread shortcut"
        note="This is only an average pressure calculation. Shared memory is not privately owned by each thread."
      >
        <p>
          A quick way to reason about shared-memory pressure is to divide the SM shared-memory
          budget by the maximum resident threads. For the A100-style numbers above:
        </p>
        <CodeBlock language="text" wrap>{`164 KiB / 2048 resident threads = 82 bytes/thread`}</CodeBlock>
        <p>
          That does not mean every thread owns 82 bytes. Shared memory belongs to the block. The
          average is a mental check: if a kernel needs far more shared memory per resident thread
          than the SM can support at full occupancy, shared memory may become the occupancy limiter.
        </p>
      </Section>

      <Section
        id="tiled-gemm"
        title="Tiled matrix multiplication"
        note="A standard tiled matrix multiplication kernel usually uses shared memory because data reuse is high."
      >
        <p>
          In the common learning kernel, each block has <code>TILE_WIDTH * TILE_WIDTH</code> threads
          and stages two square tiles in shared memory:
        </p>
        <CodeBlock language="cuda">{`__shared__ float Mds[TILE_WIDTH][TILE_WIDTH];
__shared__ float Nds[TILE_WIDTH][TILE_WIDTH];`}</CodeBlock>
        <p>
          Each tile has <code>TILE_WIDTH * TILE_WIDTH</code> floats, and each float is four bytes.
          Two tiles therefore cost:
        </p>
        <CodeBlock language="text" title="Tiled-kernel shared memory" wrap>{`shared_memory_per_block = 2 * TILE_WIDTH * TILE_WIDTH * 4
                        = 8 * TILE_WIDTH * TILE_WIDTH bytes

threads_per_block = TILE_WIDTH * TILE_WIDTH

average_shared_memory_per_thread =
  (8 * TILE_WIDTH * TILE_WIDTH) / (TILE_WIDTH * TILE_WIDTH)
  = 8 bytes/thread`}</CodeBlock>
        <p>
          In this simple tiled GEMM shape, shared-memory pressure is much lower than the 82
          bytes/thread full-occupancy average from the A100-style example. That means shared memory
          is probably not the occupancy limiter. Registers, block limits, memory bandwidth, or the
          instruction mix may still be limiting factors.
        </p>
        <p>
          For the synchronization side of this same pattern, read{" "}
          <Link to="/cuda-kb/syncthreads">Understanding __syncthreads()</Link>.
        </p>
      </Section>

      <Section
        id="large-block"
        title="The 32 KiB per block example"
        note="This is the example where shared memory becomes visibly expensive."
      >
        <p>
          Now compare a kernel with 256 threads per block and 32 KiB of shared memory per block. The
          average shared-memory pressure is:
        </p>
        <CodeBlock language="text" wrap>{`32 KiB / 256 threads = 128 bytes/thread`}</CodeBlock>
        <p>
          Since 128 bytes/thread is higher than the 82 bytes/thread full-occupancy average, this
          kernel cannot reach full occupancy under the simplified A100-style budget. Fewer blocks
          can live on the SM at once because each block reserves a large shared-memory allocation.
        </p>
        <Callout title="Small arithmetic note" tone="warning">
          If a source says 132 bytes/thread for 32 KiB divided by 256 threads, treat it as an
          approximation or typo. Using 32 KiB, the exact value is 128 bytes/thread.
        </Callout>
      </Section>

      <Section
        id="tradeoff"
        title="The real optimization tradeoff"
        note="Maximum occupancy and maximum performance are not the same target."
      >
        <p>
          Higher occupancy gives the warp scheduler more resident warps to choose from while other
          warps are waiting on memory or dependencies. That is useful. It is not the final score.
          A kernel that uses more shared memory can have lower occupancy and still be faster if the
          shared memory removes enough global-memory traffic or improves access patterns enough to
          pay for the lost resident warps.
        </p>
        <div className="answer-grid">
          <article className="answer-card">
            <h3>When shared memory helps</h3>
            <p>
              Data is reused by multiple threads, global loads become coalesced, redundant global
              traffic disappears, or a tile can be processed with fewer slow memory transactions.
            </p>
          </article>
          <article className="answer-card">
            <h3>When shared memory hurts</h3>
            <p>
              The tile is too large, reuse is weak, bank conflicts dominate, barriers are excessive,
              or the per-block allocation leaves too few resident warps to hide latency.
            </p>
          </article>
          <article className="answer-card">
            <h3>How to decide</h3>
            <p>
              Benchmark the correct kernel, then read achieved occupancy beside memory throughput,
              eligible warps, stall reasons, register count, and shared memory per block.
            </p>
          </article>
        </div>
      </Section>

      <Section id="practice" title="Practice ledger">
        <DetailList
          title="Record these for every shared-memory experiment"
          ordered
          items={[
            "Threads per block and warps per block.",
            "Static shared memory plus dynamic shared memory per block.",
            "Registers per thread from ptxas or Nsight Compute.",
            "Estimated resident blocks per SM from the occupancy API or Nsight Compute occupancy calculator.",
            "Achieved occupancy, memory throughput, eligible warps, dominant stall reason, and benchmark time.",
            "A conclusion that says whether shared memory improved reuse enough to justify its occupancy cost.",
          ]}
        />
        <CodeBlock language="bash" title="Evidence commands">{`# Useful evidence commands
nvcc --ptxas-options=-v ...
ncu --set full --target-processes all ./build/cuda_lab`}</CodeBlock>
        <p className="month-nav">
          <Link to="/cuda-kb#glossary">Back to glossary</Link>
          <Link to="/cuda-kb/execution-model#occupancy">Execution model occupancy</Link>
          <Link to="/cuda-kb/kernels#tiling">Tiled matrix multiplication</Link>
        </p>
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="Use these when turning the mental arithmetic into device-specific claims or profiler-backed tuning decisions."
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
