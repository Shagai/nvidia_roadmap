import type { CudaMentalModelGuide } from "./types";

export const cudaMentalModelGuide: CudaMentalModelGuide = {
  title: "CUDA Mental Model",
  summary:
    "The mental model is the decision layer before syntax. It answers what belongs on the CPU, what belongs on the GPU, where data lives, when work is actually finished, and which measurement proves the decision was useful.",
  know: [
    {
      title: "CUDA is heterogeneous, not GPU-only",
      thesis:
        "A CUDA program is a cooperation between host code and device code. The CPU remains responsible for orchestration, I/O, allocation decisions, launch decisions, error handling, and often final integration with the rest of the application.",
      details: [
        "Host code runs the ordinary C++ control flow: parse inputs, allocate buffers, choose sizes, select devices, call CUDA runtime APIs, launch kernels, handle errors, and decide what result is needed next.",
        "Device code runs inside kernels on the GPU. It should be shaped around large sets of independent or cooperatively parallel operations, not around serial control-heavy logic.",
        "The useful first diagram is not grid/block/thread. It is CPU stage, host memory, transfer boundary, device memory, kernel work, transfer boundary, and CPU stage again.",
        "Unified Memory can simplify address management, but it does not remove the need to reason about locality, migration, synchronization, and the cost of using data from the wrong processor at the wrong time.",
      ],
      diagnostic:
        "Before writing a kernel, state: the CPU owns these decisions; the GPU owns this repeated work; this data must cross the boundary this many times.",
    },
    {
      title: "The GPU wants ownership of a large repeated pattern",
      thesis:
        "A kernel should usually express one repeated ownership rule: one thread owns one output element, one row, one pixel, one particle, one tile, or one small loop over a regular slice.",
      details: [
        "The strongest beginner pattern is one thread produces one output element from input elements it can name directly from its global index.",
        "The ownership rule should be correct before it is clever. If the rule cannot be explained in one sentence, the first version is too complex.",
        "Irregular work can still run on the GPU, but it needs a stronger reason: enough elements, enough work per element, a library primitive, a preprocessing step that regularizes it, or a design that keeps data resident on the device.",
        "A good ownership rule also states what happens at the boundary: out-of-range threads, image borders, empty inputs, incomplete tiles, and non-divisible sizes.",
      ],
      diagnostic:
        "Write the sentence: each CUDA thread owns ____ and is allowed to read ____. If that sentence is vague, debug the mental model before debugging code.",
    },
    {
      title: "Launch geometry describes work, not performance",
      thesis:
        "Grid and block dimensions create logical threads. They do not guarantee that the GPU is busy, that memory is efficient, or that the kernel beats the CPU.",
      details: [
        "The launch shape answers coverage: how many logical workers exist, how they are grouped, and which built-in indices each thread uses.",
        "The performance story is a separate layer: warp scheduling, memory coalescing, register use, shared memory use, occupancy, divergence, synchronization, and launch overhead.",
        "Ceiling division intentionally creates guard threads. Guard threads are not a design failure; they are the price of clean launch geometry for arbitrary input sizes.",
        "Block size starts as a controlled variable, not a belief. 128 or 256 threads per block can be a reasonable first guess, but the final claim should come from measurement.",
      ],
      diagnostic:
        "For every launch, record useful elements, block size, grid size, launched threads, guard threads, and why that shape is acceptable for the first version.",
    },
    {
      title: "The CPU/GPU boundary is often the real cost",
      thesis:
        "A kernel can be fast while the application is slow. Data transfer, synchronization, allocation, format conversion, and CPU preprocessing can dominate the path the user actually experiences.",
      details: [
        "A one-shot GPU path usually pays host-to-device copy, launch overhead, kernel time, device-to-host copy, and synchronization before the CPU can use the result.",
        "A pipeline path can become much stronger if several kernels consume data while it remains on the GPU, or if output is only copied back after multiple stages.",
        "Transfers are not automatically bad. They are bad when they are repeated unnecessarily, larger than needed, poorly overlapped, or used to accelerate a tiny amount of computation.",
        "The mental model should distinguish kernel-only speedup from end-to-end speedup. Both are useful, but they answer different questions.",
      ],
      diagnostic:
        "Draw a ledger with CPU prep, H2D, kernel, D2H, CPU post. If the kernel is not the largest or most important segment, optimize the boundary before tuning instructions.",
    },
    {
      title: "Arithmetic intensity and reuse decide suitability",
      thesis:
        "The GPU is strongest when the amount of parallel computation and data reuse is large enough to amortize movement and launch costs.",
      details: [
        "A memory-light operation on a small input may be slower on GPU because the CPU can finish from cache before the GPU path has paid its setup costs.",
        "A stencil, convolution, simulation, matrix operation, reduction, sort, or transform pipeline can become attractive when it exposes many elements and enough repeated structure.",
        "Data reuse changes the decision. If several kernels reuse the same resident device data, the cost of the original transfer is amortized across more work.",
        "Library candidates need a separate decision: if the operation is a standard primitive or GEMM-like operation, the best mental model may be library-first, custom-kernel-second.",
      ],
      diagnostic:
        "Ask whether the candidate has enough elements, enough work per element, enough reuse, and a way to avoid bouncing data back to the CPU between stages.",
    },
    {
      title: "Correctness and measurement belong inside the model",
      thesis:
        "The mental model is incomplete if it only predicts speed. It must also predict how the result will be checked and which timing view will be trusted.",
      details: [
        "Parallel execution can change floating-point order, expose indexing mistakes, and hide asynchronous failures until a later synchronization point.",
        "The CPU reference is not just a test. It is the contract that defines what the GPU result means.",
        "CUDA errors, mismatch counts, tolerance rules, and benchmark columns should be designed before optimization begins.",
        "A measured speedup is only interpretable if it names the workload, build type, hardware, timing method, repeat count, and whether transfers are included.",
      ],
      diagnostic:
        "Do not publish a CUDA timing until the same run also produces correctness evidence and a timing table that separates kernel-only from end-to-end time.",
    },
  ],
  practice: [
    {
      title: "CPU/GPU boundary ledger",
      purpose:
        "Force every experiment to name ownership, data movement, synchronization, and the measured path before writing performance claims.",
      steps: [
        "Choose one operation and write a five-stage path: CPU prep, H2D transfer, GPU kernel or kernels, D2H transfer, CPU post.",
        "Mark which buffers exist only on the host, only on the device, or on both sides.",
        "For each boundary crossing, record the byte count and why the crossing is necessary.",
        "Decide whether the claim will be kernel-only, end-to-end, or both.",
        "After implementation, replace estimates with measured values and keep the original estimate for comparison.",
      ],
      evidence: [
        "A table with stage, owner, input bytes, output bytes, synchronization point, and timing column.",
        "One paragraph explaining whether the boundary or the kernel is the bottleneck.",
      ],
    },
    {
      title: "One-thread ownership statement",
      purpose:
        "Make indexing and correctness easier by reducing a kernel to a clear ownership rule.",
      steps: [
        "Write the ownership sentence before the kernel: each thread owns one output element at index i.",
        "List every input address that thread may read for normal elements and boundary elements.",
        "Add one non-divisible input size to force guard-thread reasoning.",
        "Implement the CPU reference and GPU path from the same ownership rule.",
        "Record mismatch count or maximum absolute error before benchmarking.",
      ],
      evidence: [
        "The ownership sentence in the README or lab notes.",
        "A correctness run showing ordinary and non-divisible sizes.",
      ],
    },
    {
      title: "Small, medium, large crossover run",
      purpose:
        "Build intuition for when GPU overhead is amortized and when CPU execution is the simpler answer.",
      steps: [
        "Run the same operation on a tiny input, a realistic input, and a stress input.",
        "Record CPU time, H2D time, kernel time, D2H time, total GPU time, and speedup with transfers included.",
        "Keep build type, input generation, and timing method identical between sizes.",
        "Identify the first size where total GPU time becomes competitive, if it does.",
        "Explain the result in terms of setup cost, transfer cost, parallel work, and memory behavior.",
      ],
      evidence: [
        "Benchmark rows for at least three sizes.",
        "A crossover statement that does not overgeneralize beyond the tested hardware and workload.",
      ],
    },
    {
      title: "Keep data resident for two more stages",
      purpose:
        "Practice designing a GPU path as a pipeline instead of isolated kernels with repeated copies.",
      steps: [
        "Start from a one-kernel path that copies input to the GPU and output back to the CPU.",
        "Add two downstream operations that consume the previous GPU output without returning to the host.",
        "Measure one-shot per-stage copies versus resident multi-kernel execution.",
        "Only copy the final artifact back to the CPU.",
        "Document what changed in the boundary ledger and what stayed resident.",
      ],
      evidence: [
        "Two diagrams: before and after residency.",
        "Timing table showing whether fewer crossings improved the end-to-end path.",
      ],
    },
    {
      title: "Library-first decision drill",
      purpose:
        "Avoid writing custom CUDA for problems that are standard primitives or better solved by existing NVIDIA libraries.",
      steps: [
        "Classify the operation as elementwise transform, reduction, scan, sort, stencil, GEMM, inference, or domain-specific logic.",
        "Name the likely library candidate: Thrust, CUB, cuBLAS, CUTLASS, TensorRT, NPP, or custom CUDA.",
        "Write the reason a custom kernel is or is not justified.",
        "If a library is used, benchmark setup, allocation, transfer, and call time separately enough to avoid misleading conclusions.",
      ],
      evidence: [
        "A decision note stating custom-kernel, library-first, or hybrid.",
        "A limitation section explaining what was not measured.",
      ],
    },
  ],
  traps: [
    {
      title: "GPU as a faster CPU",
      symptom:
        "The kernel is written like a serial loop moved into one thread, or the CPU repeatedly launches tiny kernels for tiny pieces of work.",
      whyItHappens:
        "The programmer focuses on CUDA syntax before identifying a repeated parallel ownership rule.",
      correction: [
        "Find the data-parallel dimension first.",
        "Make each thread own a meaningful independent output or tile.",
        "Keep serial orchestration on the host unless device-side control is specifically justified.",
      ],
      deepDivePath: "/cuda-kb/mental-model/traps/gpu-as-faster-cpu",
    },
    {
      title: "Kernel-only speedup presented as application speedup",
      symptom:
        "The benchmark shows a fast kernel, but users or downstream code still wait on transfers and synchronization.",
      whyItHappens:
        "Kernel timing is easier to collect than full-path timing, so it becomes the headline even when it answers a narrower question.",
      correction: [
        "Report kernel-only and end-to-end numbers in separate columns.",
        "Include H2D, D2H, allocation if relevant, CPU prep, and CPU post where the application pays for them.",
        "Use end-to-end time for product claims and kernel-only time for device-code tuning.",
      ],
      deepDivePath: "/cuda-kb/mental-model/traps/kernel-only-speedup",
    },
    {
      title: "Copy bounce pipeline",
      symptom:
        "Every stage copies data back to the CPU before the next GPU operation starts.",
      whyItHappens:
        "The implementation treats each kernel as a separate demo instead of designing device-resident dataflow.",
      correction: [
        "Group adjacent GPU stages while the data is still resident.",
        "Copy back only summary data or final output when possible.",
        "Draw the buffer ownership diagram before adding another transfer.",
      ],
      deepDivePath: "/cuda-kb/mental-model/traps/copy-bounce-pipeline",
    },
    {
      title: "Launch geometry confused with hardware utilization",
      symptom:
        "A large grid is assumed to mean the GPU is efficiently used.",
      whyItHappens:
        "The launch model is visible in source code, while warp scheduling, memory behavior, occupancy, and stalls require measurement.",
      correction: [
        "Use launch geometry to prove coverage, not speed.",
        "Measure achieved behavior with timing and profiler metrics.",
        "Explain performance through memory access, divergence, synchronization, register pressure, and occupancy together.",
      ],
      deepDivePath: "/cuda-kb/mental-model/traps/launch-geometry-utilization",
    },
    {
      title: "Unified Memory treated as free movement",
      symptom:
        "The code is simpler, but performance becomes unpredictable or the first access in the wrong processor pays migration cost.",
      whyItHappens:
        "A shared address space is mistaken for shared physical locality.",
      correction: [
        "Use Unified Memory deliberately for prototyping, porting, irregular structures, or simplifying ownership while learning the algorithm.",
        "Reason about who touches each allocation first: CPU initialize, GPU read, GPU write, CPU read result, or repeated CPU/GPU alternation.",
        "Synchronize before the CPU consumes GPU-written managed data.",
        "For performance learning, implement an explicit-copy version with cudaMalloc and cudaMemcpy so the movement and timing are visible.",
      ],
      deepDivePath: "/cuda-kb/mental-model/traps/unified-memory",
    },
    {
      title: "Correctness deferred until after optimization",
      symptom:
        "The code accumulates shared memory, tiling, streams, or fusion before a CPU reference comparison exists.",
      whyItHappens:
        "Optimization feels like progress, while correctness harnesses feel like overhead.",
      correction: [
        "Write the CPU reference and mismatch reporting first.",
        "Keep the naive CUDA kernel as the baseline before adding shared memory, tiling, streams, or fusion.",
        "Add timing only after correctness exists.",
        "Optimize one thing at a time and compare again after every optimization.",
        "Use absolute and relative tolerances for floating-point comparisons instead of exact equality.",
      ],
      deepDivePath: "/cuda-kb/mental-model/traps/correctness-first",
    },
  ],
  interviewAnswers: [
    {
      prompt: "What exactly does the CPU still do in your CUDA project?",
      shortAnswer:
        "The CPU owns orchestration: input loading, validation, memory allocation, choosing launch parameters, starting transfers, launching kernels, checking errors, synchronizing when the result is needed, and integrating the final output.",
      deepAnswer: [
        "In a CUDA project the GPU is not a replacement for the whole C++ program. The host still runs the control flow and decides when device work should happen.",
        "For an image-processing lab, the CPU might load or generate the image, allocate host and device buffers, copy input to the device, choose block and grid size, launch grayscale or blur kernels, check cudaGetLastError, synchronize for correctness or timing, copy the result back, compare against the CPU reference, and write benchmark output.",
        "The GPU owns the repeated data-parallel operation. For example, one kernel may map many threads over pixels, but the CPU still owns the experiment harness and the application boundary.",
        "A good answer names the boundary clearly instead of saying the GPU does the processing. The CPU is still part of the system and often part of the measured latency.",
      ],
      evidenceToCollect:
        "A README diagram or table listing CPU prep, H2D copy, kernel launch, D2H copy, CPU verification, and output writing for one project run.",
    },
    {
      prompt: "Which data crosses from host to device, and how many bytes is it?",
      shortAnswer:
        "The input buffers required by the kernel cross from host to device; the exact byte count is element_count multiplied by bytes_per_element, plus any extra metadata or auxiliary arrays that the kernel needs.",
      deepAnswer: [
        "For an RGB image grayscale kernel, the H2D payload is width * height * 3 bytes if each pixel is stored as three unsigned bytes. The D2H payload is width * height * 1 byte if the output is one grayscale byte per pixel.",
        "For a 1920x1080 image, that means 2,073,600 pixels. RGB input is 6,220,800 bytes, about 5.93 MiB. Grayscale output is 2,073,600 bytes, about 1.98 MiB.",
        "For a blur or Sobel kernel, the transfer size may be the same as grayscale input/output even though each output reads a 3x3 neighborhood. The extra reads are device memory traffic, not extra H2D transfer, unless the implementation copies each neighborhood from the host, which would be a design smell.",
        "The byte ledger matters because transfer time can dominate an otherwise fast kernel. In an interview, I would state both H2D and D2H bytes and say whether allocations or format conversions are included.",
      ],
      evidenceToCollect:
        "A benchmark row with width, height, input bytes, output bytes, H2D ms, D2H ms, and total GPU ms.",
    },
    {
      prompt: "What does one thread own in your first kernel?",
      shortAnswer:
        "In the first kernel, one CUDA thread should own one output element. It computes its global index, exits if the index is out of range, reads the input elements needed for that output, and writes exactly that output.",
      deepAnswer: [
        "For a grayscale kernel, thread i owns grayscale_output[i]. It reads rgb_input[i], computes a luminance value, and writes one byte.",
        "The ownership rule makes correctness easier because there is no hidden cross-thread dependency. If thread i owns output i, then the CPU reference can check the same output element directly.",
        "The bounds guard is part of ownership. A launch often creates more threads than useful elements because grid size is computed with ceiling division, so threads with i >= n must return without reading or writing.",
        "For stencil kernels such as blur and Sobel, the thread can still own one output pixel, but it reads neighboring input pixels according to a documented border policy.",
      ],
      evidenceToCollect:
        "A code comment or README line stating the ownership rule, plus a test where n is not divisible by the block size.",
    },
    {
      prompt: "Why can your GPU path lose to CPU on small inputs?",
      shortAnswer:
        "Small inputs often do not provide enough parallel work to amortize CUDA overhead: context setup, allocations, host/device copies, kernel launch overhead, synchronization, and copying results back.",
      deepAnswer: [
        "A CPU can run a small loop from cache with almost no setup. A GPU path may need cudaMalloc, cudaMemcpy, a kernel launch, cudaDeviceSynchronize, and another cudaMemcpy before the application has a usable result.",
        "Even if the kernel itself is fast, kernel-only timing hides the boundary cost. The end-to-end path can lose because transfer and launch overhead are larger than the saved computation.",
        "Small inputs may also fail to keep enough warps active to hide memory latency. The GPU is designed for many lightweight threads, so a tiny workload may underuse the hardware.",
        "The correct conclusion is not GPU bad. The correct conclusion is to find the crossover point for this workload and hardware, and to keep data resident across multiple stages when the application allows it.",
      ],
      evidenceToCollect:
        "A small/medium/large benchmark table showing CPU ms, kernel-only GPU ms, total GPU ms, and the first size where total GPU becomes competitive.",
    },
    {
      prompt: "Which number is kernel-only speedup and which number is end-to-end speedup?",
      shortAnswer:
        "Kernel-only speedup compares CPU compute time against only the measured CUDA kernel time. End-to-end speedup compares CPU total time against the full GPU path, including transfers, launches, synchronization, and any required CPU-side setup or postprocessing.",
      deepAnswer: [
        "Kernel-only speedup is useful when tuning device code. It helps answer whether the kernel body, memory access pattern, launch geometry, or resource use improved.",
        "End-to-end speedup is useful for application claims. It answers what the user or downstream pipeline actually pays for.",
        "For example, if CPU grayscale takes 4 ms, the CUDA kernel takes 0.4 ms, and H2D plus D2H plus synchronization takes 3 ms, the kernel-only speedup is 10x, but the transfer-inclusive speedup is about 4 / 3.4 = 1.18x.",
        "A credible report shows both columns and labels them explicitly. If only one is shown, the claim is incomplete.",
      ],
      evidenceToCollect:
        "A benchmark table with separate CPU, H2D, kernel, D2H, total GPU, kernel-only speedup, and end-to-end speedup columns.",
    },
    {
      prompt: "What would change if the data stayed resident for three GPU stages?",
      shortAnswer:
        "The GPU path would pay the boundary cost once, then amortize it across multiple kernels. Instead of copying after every stage, the intermediate buffers stay in device memory and only the final result or summary crosses back.",
      deepAnswer: [
        "A copy-bounce design does H2D, kernel, D2H for each stage. That makes the PCIe or host/device boundary part of every operation, even when the next operation also runs on the GPU.",
        "A resident design does H2D once, runs stage 1, stage 2, and stage 3 on device buffers, and then copies the final artifact back. This usually improves the end-to-end story when the intermediate outputs are large.",
        "The design also changes ownership. The CPU stops inspecting every intermediate array, so correctness checks need explicit debug modes, sampled validation, or occasional copied checkpoints.",
        "This is where the mental model becomes system design: fewer transfers can improve latency, but the program must now manage device buffer lifetime, memory pressure, error handling, and observability more carefully.",
      ],
      evidenceToCollect:
        "Before/after boundary diagrams and a timing table comparing copy-back-each-stage versus resident three-stage execution.",
    },
  ],
  sourceIds: ["programming-guide", "best-practices", "runtime-api"],
};
