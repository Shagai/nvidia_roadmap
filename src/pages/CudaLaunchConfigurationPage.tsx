import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import {
  CudaLaunchGeometryFigure,
  CudaOccupancyExplorer,
  CudaWarpDivergenceFigure,
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

const executionKnowSections = [
  {
    title: "Launch geometry is the logical work shape",
    thesis:
      "Grid and block dimensions define how much logical CUDA work exists before the hardware scheduler starts assigning blocks to SMs.",
    details: [
      "The grid is the full set of blocks created by one kernel launch.",
      "A block is a group of threads that can cooperate through shared memory and block-level synchronization.",
      "The launch shape must cover the data shape, but it does not by itself prove the kernel is fast.",
      "For a simple 1D kernel, the first accounting line is useful elements, launched threads, and guard threads.",
    ],
    diagnostic:
      "Before running the kernel, calculate grid blocks, total launched threads, useful threads, and the final block's guard threads.",
  },
  {
    title: "Indexing is the correctness contract",
    thesis:
      "blockIdx, blockDim, and threadIdx are the first CUDA built-ins to master because they decide which data each thread owns.",
    details: [
      "For 1D data, the standard index is blockIdx.x * blockDim.x + threadIdx.x.",
      "For row-major 2D data, x should usually come from threadIdx.x so adjacent lanes touch adjacent addresses.",
      "Ceiling division intentionally launches extra threads; the bounds guard is part of the contract.",
      "Correctness tests should include sizes that are not divisible by the chosen block size.",
    ],
    diagnostic:
      "If a kernel is wrong, inspect the global index formula and boundary guard before changing performance code.",
  },
  {
    title: "Warps make hardware behavior visible",
    thesis:
      "CUDA exposes threads, but hardware schedules them in warps. That is where coalescing, inactive lanes, and branch divergence become visible.",
    details: [
      "Current CUDA compute-capability tables list warp size as 32 threads.",
      "Block sizes that are multiples of 32 avoid a partly unused final warp for ordinary 1D launches.",
      "Consecutive threadIdx.x lanes should usually access consecutive memory addresses.",
      "When lanes in the same warp take different branches, the warp serializes those paths.",
    ],
    diagnostic:
      "Ask whether adjacent lanes read adjacent addresses and whether lanes in the same warp follow the same branch path.",
  },
  {
    title: "Blocks are the cooperation boundary",
    thesis:
      "Threads in the same block can share block-local shared memory and synchronize with __syncthreads; threads in different blocks usually cannot coordinate during a normal launch.",
    details: [
      "Every block is placed on one SM and normally runs to completion there.",
      "Shared memory is allocated per block, not per grid.",
      "__syncthreads only synchronizes threads inside the same block.",
      "Different blocks must be independent unless the kernel uses a specialized cooperative or clustered design.",
    ],
    diagnostic:
      "If the algorithm needs cross-block communication inside one launch, redesign the work split or use a specialized CUDA feature deliberately.",
  },
  {
    title: "Occupancy is useful, not absolute",
    thesis:
      "Occupancy helps hide latency by keeping resident warps available, but the fastest kernel also depends on memory access, registers, shared memory, instruction mix, and algorithm design.",
    details: [
      "A block must fit within an SM's thread, warp, register, shared-memory, and resident-block limits.",
      "Large blocks can reduce the number of resident blocks and expose tail effects.",
      "High occupancy cannot repair scattered memory access or unnecessary global memory traffic.",
      "Use the occupancy APIs and Nsight Compute as guides, then keep the launch shape that wins the benchmark.",
    ],
    diagnostic:
      "When tuning, record achieved occupancy beside memory throughput, register count, shared memory per block, and the dominant stall reason.",
  },
];

const divergenceChecks = [
  {
    title: "Uniform decisions do not split a warp",
    thesis:
      "A condition that has the same truth value for every lane in a warp does not create intra-warp divergence.",
    details: [
      "Constants, kernel arguments, and block-level choices can be uniform for all lanes.",
      "A condition can mention threadIdx.x and still be warp-uniform if it changes only at warp boundaries.",
      "For example, threadIdx.x < 32 is uniform for warp 0 and uniform for later warps in a normal 1D block.",
    ],
    diagnostic:
      "Evaluate the predicate for lanes 0 through 31 inside one warp before calling it divergent.",
  },
  {
    title: "Lane-dependent predicates can diverge",
    thesis:
      "Raw comparisons against threadIdx.x, global thread id, or per-thread data often produce different answers inside the same warp.",
    details: [
      "if (threadIdx.x > 2) splits the first warp because lanes 0, 1, and 2 disagree with lanes 3 through 31.",
      "if (i % 2 == 0) splits every ordinary warp into even and odd lanes.",
      "Data-dependent tests such as if (a[i] > threshold) can diverge whenever neighboring elements differ.",
    ],
    diagnostic:
      "Look for predicates that depend on lane id or on values loaded through a lane-specific index.",
  },
  {
    title: "Boundary guards are normal",
    thesis:
      "The common if (i < n) guard may diverge in the final partial block, but it is usually the cleanest correctness tradeoff.",
    details: [
      "Ceiling division launches enough threads to cover arbitrary input sizes.",
      "Extra threads in the final block must skip memory accesses outside the valid range.",
      "With n = 1003 and block = 256, the final block has 235 useful threads and 21 guard threads.",
    ],
    diagnostic:
      "Treat final-block divergence as expected unless profiling shows it matters for the workload.",
  },
  {
    title: "Loops diverge through their exit condition",
    thesis:
      "A loop can diverge when its trip count is based on thread index or data owned by each lane.",
    details: [
      "int limit = a[threadIdx.x] gives each lane a potentially different number of loop iterations.",
      "The warp continues until the largest active trip count finishes.",
      "Lanes with smaller trip counts become inactive for the remaining iterations.",
    ],
    diagnostic:
      "Inspect the loop condition the same way you inspect an if condition: ask whether every lane sees the same answer.",
  },
];

const executionPractice = [
  {
    title: "Create a launch ledger",
    purpose: "Make every simple kernel explainable before profiling it.",
    steps: [
      "Write the global index formula beside the kernel.",
      "Compute useful elements, grid blocks, launched threads, guard threads, and warps per block.",
      "Add at least one test size that is smaller than a block and one that is not divisible by the block size.",
    ],
    evidence: [
      "A comment, README row, or benchmark row with n, block, grid, launched threads, and guard threads.",
      "A correctness run for a non-divisible input size.",
    ],
  },
  {
    title: "Run a block-size sweep",
    purpose: "Treat block size as a measured variable instead of a belief.",
    steps: [
      "Run the same release build with 64, 128, 256, and 512 threads per block.",
      "Keep input size, data layout, timing method, and correctness checks unchanged.",
      "Add 1024 only when the kernel type gives a reason, such as a reduction experiment.",
    ],
    evidence: [
      "A table with block size, grid size, kernel time, achieved bandwidth or throughput, and correctness status.",
      "One sentence explaining which launch shape won and why the result is plausible.",
    ],
  },
  {
    title: "Annotate one profiler report",
    purpose: "Connect the launch shape to the hardware behavior Nsight reports.",
    steps: [
      "Capture a Nsight Compute report for the target kernel.",
      "Record launch dimensions, registers per thread, shared memory per block, achieved occupancy, and dominant stall reason.",
      "Decide whether the next experiment should change block size, memory access, shared memory, or algorithm structure.",
    ],
    evidence: [
      "A profiler screenshot or exported metric set tied to one code decision.",
      "A short note that names the bottleneck instead of only reporting elapsed time.",
    ],
  },
];

const executionTraps = [
  {
    title: "Forgetting the bounds guard",
    symptom: "The kernel works for some input sizes and fails or corrupts memory for sizes that are not divisible by the block size.",
    whyItHappens:
      "Ceiling division launches enough threads to cover the input, which means the final block often contains extra logical threads.",
    correction: [
      "Use if (i < n) for 1D kernels and x/y bounds checks for 2D kernels.",
      "Keep a non-divisible input size in the correctness test set.",
    ],
  },
  {
    title: "Assuming the largest block size is best",
    symptom: "A 1024-thread block looks more parallel but performs worse or leaves fewer resident blocks per SM.",
    whyItHappens:
      "A larger block consumes more threads, warps, registers, and shared memory as one scheduling unit.",
    correction: [
      "Start at 128 or 256 and benchmark nearby choices.",
      "Use 1024 only when measurement and kernel structure justify it.",
    ],
  },
  {
    title: "Treating occupancy as the final score",
    symptom: "A higher-occupancy launch does not improve the benchmark, or it regresses performance.",
    whyItHappens:
      "Occupancy helps latency hiding, but it does not measure coalescing, cache locality, instruction count, or useful work per memory access.",
    correction: [
      "Read occupancy beside memory throughput, register pressure, shared memory use, and stall reasons.",
      "Prefer the measured fastest correct kernel, not the launch with the prettiest occupancy number.",
    ],
  },
  {
    title: "Ignoring branch divergence",
    symptom: "The launch has many threads, but warps spend time serializing different branch paths.",
    whyItHappens:
      "Threads are exposed individually, but warp lanes execute together when they are active on the same instruction path.",
    correction: [
      "Inspect whether each branch or loop condition is uniform across lanes in the same warp.",
      "Keep common branch decisions aligned across neighboring lanes when possible.",
      "Use profiler stall and branch metrics before rewriting the algorithm.",
    ],
  },
];

const executionInterviewAnswers = [
  {
    prompt: "Explain grid, block, thread, warp, and SM in one answer.",
    shortAnswer:
      "A kernel launch creates a grid of blocks; each block contains threads. The hardware groups threads into warps, and SMs schedule resident blocks and warps subject to resource limits.",
    deepAnswer: [
      "Grid and block dimensions are the logical execution configuration chosen by host code.",
      "threadIdx, blockIdx, and blockDim let each thread compute the data it owns.",
      "Warps make coalescing and divergence visible because lanes execute together.",
      "Blocks are scheduled onto SMs in waves; a grid can contain far more blocks than the GPU has SMs.",
    ],
    evidenceToCollect:
      "A launch ledger for one kernel plus a profiler report showing launch dimensions and achieved occupancy.",
  },
  {
    prompt: "Why is 256 threads per block a common starting point?",
    shortAnswer:
      "It is 8 warps: usually enough to expose latency-hiding opportunities without making each block so large that only one resident block fits.",
    deepAnswer: [
      "It is a multiple of the 32-thread warp size.",
      "It works well for many simple memory-bound kernels with low register and shared-memory pressure.",
      "It is still only a baseline; benchmark 128 and 512 before making a performance claim.",
    ],
    evidenceToCollect: "A block-size sweep with 128, 256, and 512 under the same benchmark harness.",
  },
  {
    prompt: "Why is 1024 not automatically better?",
    shortAnswer:
      "1024 threads is the maximum per-block size on many architectures, but a block that large can reduce resident blocks, expose resource pressure, and create coarse scheduling.",
    deepAnswer: [
      "A 1024-thread block contains 32 warps.",
      "On an SM with a 1536 resident-thread limit, the thread limit alone permits only one 1024-thread block.",
      "If registers or shared memory are high, a large block may reduce occupancy further or fail to fit.",
    ],
    evidenceToCollect:
      "An occupancy calculation or Nsight Compute report comparing 256 and 1024 for the same kernel.",
  },
  {
    prompt: "When would you use a grid-stride loop?",
    shortAnswer:
      "Use it when you want a controlled number of launched blocks while still covering a large or variable-size input.",
    deepAnswer: [
      "Each thread starts at its global index and advances by blockDim.x * gridDim.x.",
      "It is useful for persistent-style work distribution, very large inputs, and reusable kernels.",
      "For first beginner examples, ceil(n / block) is still the simpler baseline.",
    ],
    evidenceToCollect: "A kernel variant that logs grid size, stride, and total elements covered.",
  },
  {
    prompt: "How do you tell whether a branch or loop can cause thread divergence?",
    shortAnswer:
      "Inspect the decision condition. If lanes in the same warp can evaluate it differently, the warp may have to serialize multiple paths or loop masks.",
    deepAnswer: [
      "Predicates based directly on threadIdx.x, global thread id, or per-thread data can be lane-dependent.",
      "A boundary guard such as if (i < n) is expected and usually only affects the last partially useful warp.",
      "Loops diverge when different lanes have different exit iterations, so the warp runs until the longest active lane finishes.",
    ],
    evidenceToCollect:
      "A small lane table for one warp plus branch-efficiency or warp-state metrics from a profiler report.",
  },
];

export function CudaLaunchConfigurationPage() {
  return (
    <EssayLayout
      eyebrow="CUDA knowledge pillar"
      title="CUDA Execution Model"
      dek="The programming model exposes grids, blocks, and threads. Hardware executes threads in warps on streaming multiprocessors. Correct indexing makes the kernel right; understanding warps, occupancy, scheduling, and divergence explains why the kernel is fast or slow."
      toc={[
        { id: "frame", label: "Frame" },
        { id: "syntax", label: "Syntax" },
        { id: "coverage", label: "Coverage" },
        { id: "know", label: "Know" },
        { id: "sms", label: "Blocks vs SMs" },
        { id: "warps", label: "Why 256" },
        { id: "divergence", label: "Divergence" },
        { id: "occupancy", label: "Occupancy" },
        { id: "practice", label: "Practice" },
        { id: "traps", label: "Traps" },
        { id: "choices", label: "First choices" },
        { id: "patterns", label: "Patterns" },
        { id: "generations", label: "Generations" },
        { id: "workflow", label: "Workflow" },
        { id: "interview", label: "Interview" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="frame"
        title="The frame"
        note="This is the execution-model layer: first make the work correct, then explain what the scheduler and hardware resources are likely doing."
      >
        <p>
          The execution model connects CUDA syntax to GPU behavior. The triple-chevron launch
          describes the logical work shape. Built-in indices make each thread responsible for a
          precise slice of data. Warps, blocks, SM resources, and memory access patterns explain why
          one correct launch shape can outperform another.
        </p>
        <Callout title="One sentence to keep nearby" tone="success">
          Start with blockDim = 256 and gridDim = ceil(problem_size / 256), prove the indexing and
          guard are correct, then tune with block-size sweeps, occupancy evidence, and profiler
          metrics.
        </Callout>
      </Section>

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

      <Section id="know" title="Know">
        <div className="mental-model-section-grid">
          {executionKnowSections.map((section) => (
            <article className="mental-model-deep-card" key={section.title}>
              <h3>{section.title}</h3>
              <p className="short-answer">{section.thesis}</p>
              <ul>
                {section.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <p className="evidence-hook">
                <strong>Diagnostic:</strong> {section.diagnostic}
              </p>
            </article>
          ))}
        </div>
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
        id="divergence"
        title="Thread divergence"
        note="Divergence is a warp-level question. Inspect one warp's lanes, not only the source line."
      >
        <p>
          A control construct can cause thread divergence when its decision condition can evaluate
          differently for lanes in the same warp. Branches are the obvious case, but loops follow the
          same rule: if the loop condition depends on a lane-varying value, some lanes can keep
          iterating while others become inactive.
        </p>
        <CodeBlock>{`// Diverges in the first warp: lanes 0, 1, and 2 disagree with lanes 3..31.
if (threadIdx.x > 2) {
    do_taken_path();
} else {
    do_other_path();
}

// Common boundary guard. Usually only the final partial warp diverges.
int i = blockIdx.x * blockDim.x + threadIdx.x;
if (i < n) {
    C[i] = A[i] + B[i];
}

// Loop divergence: each lane can have a different trip count.
int limit = a[threadIdx.x];
for (int k = 0; k < limit; ++k) {
    do_work(k);
}`}</CodeBlock>
        <CudaWarpDivergenceFigure />
        <div className="mental-model-section-grid">
          {divergenceChecks.map((check) => (
            <article className="mental-model-deep-card" key={check.title}>
              <h3>{check.title}</h3>
              <p className="short-answer">{check.thesis}</p>
              <ul>
                {check.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <p className="evidence-hook">
                <strong>Diagnostic:</strong> {check.diagnostic}
              </p>
            </article>
          ))}
        </div>
        <Callout title="Boundary divergence is often the right tradeoff" tone="success">
          For vector addition with <code>n = 1003</code> and <code>block = 256</code>, the launch
          creates 1024 logical threads. The final block has 235 useful threads and 21 guard threads,
          so only the last warp in that block is partially active. That small amount of divergence is
          usually better than writing special-case launch code for every input length.
        </Callout>
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

      <Section id="practice" title="Practice">
        <div className="mental-model-practice-grid">
          {executionPractice.map((practice) => (
            <article className="mental-model-practice-card" key={practice.title}>
              <h3>{practice.title}</h3>
              <p>{practice.purpose}</p>
              <DetailList title="Steps" items={practice.steps} ordered />
              <DetailList title="Evidence" items={practice.evidence} />
            </article>
          ))}
        </div>
      </Section>

      <Section id="traps" title="Traps">
        <div className="mental-model-trap-list">
          {executionTraps.map((trap) => (
            <article className="mental-model-trap-card" key={trap.title}>
              <h3>{trap.title}</h3>
              <p>
                <strong>Symptom:</strong> {trap.symptom}
              </p>
              <p>
                <strong>Why it happens:</strong> {trap.whyItHappens}
              </p>
              <DetailList title="Correction" items={trap.correction} />
            </article>
          ))}
        </div>
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

      <Section id="interview" title="Interview checks">
        <p>
          When the execution model is solid, these answers should come from one kernel's launch
          ledger and profiler evidence instead of from CUDA vocabulary alone.
        </p>
        <div className="answer-grid">
          {executionInterviewAnswers.map((answer) => (
            <article className="answer-card" key={answer.prompt}>
              <h3>{answer.prompt}</h3>
              <p className="short-answer">{answer.shortAnswer}</p>
              <ul>
                {answer.deepAnswer.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="evidence-hook">
                <strong>Evidence to collect:</strong> {answer.evidenceToCollect}
              </p>
            </article>
          ))}
        </div>
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

function DetailList({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <div className="detail-list">
      <h4>{title}</h4>
      <ListTag>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
