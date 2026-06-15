import type { MonthKnowledge } from "../../types";

export const knowledge202611: MonthKnowledge = {
    monthId: "2026-11",
    thesis:
      "This month learns when not to write custom CUDA. NVIDIA ecosystem engineers know libraries, primitives, and communication patterns well enough to choose the right abstraction.",
    objectives: [
      "Use Thrust and CUB for common parallel primitives.",
      "Understand CCCL as the CUDA C++ Core Libraries direction.",
      "Explain cuBLAS and CUTLASS at a GEMM-concept level.",
      "Understand NCCL collectives and basic multi-GPU communication vocabulary.",
    ],
    coreIdeas: [
      {
        title: "Raw CUDA versus libraries",
        body:
          "Write custom CUDA when the operation is domain-specific or fusion avoids memory traffic. Use libraries when the operation is standard, heavily optimized, and not the differentiating part of the project.",
      },
      {
        title: "Parallel primitives",
        body:
          "Many GPU algorithms are built from transform, reduce, scan, sort, select, histogram, and prefix-sum primitives. Thrust gives a high-level C++ interface; CUB gives lower-level building blocks.",
      },
      {
        title: "GEMM and CUTLASS",
        body:
          "GEMM is matrix multiplication in the form C = alpha A B + beta C. cuBLAS gives production GEMM routines. CUTLASS exposes templated building blocks and examples for understanding tiled GPU matrix operations.",
      },
      {
        title: "NCCL collectives",
        body:
          "Collectives coordinate data across GPUs or nodes. Broadcast sends one source to many. Reduce combines many into one. All-reduce combines and shares the result with all participants. Topology matters.",
      },
    ],
    labs: [
      {
        title: "Transform benchmark",
        body:
          "Implement vector transform with raw CUDA and Thrust. Compare code complexity, runtime, and memory behavior.",
      },
      {
        title: "Reduction benchmark",
        body:
          "Compare a simple custom reduction against CUB. Focus the write-up on why production primitives are hard to beat.",
      },
      {
        title: "GEMM reading exercise",
        body:
          "Read a CUTLASS example and annotate the concepts: tile, threadblock, warp-level operation, memory layout, and epilogue.",
      },
    ],
    pitfalls: [
      "Writing custom CUDA for a standard primitive without a reason.",
      "Treating templates as magic instead of reading type aliases and examples slowly.",
      "Ignoring memory allocation overhead in library benchmarks.",
      "Discussing NCCL without understanding basic collective semantics.",
    ],
    interviewPrompts: [
      "When would you use Thrust or CUB instead of custom CUDA?",
      "What is a parallel scan and where is it useful?",
      "What does all-reduce do?",
      "Why is GEMM so central to GPU computing?",
    ],
    portfolioEvidence: [
      "Raw CUDA versus Thrust/CUB benchmark.",
      "Short note on when libraries beat custom kernels.",
      "Annotated CUTLASS or cuBLAS experiment.",
      "Optional NCCL toy example if hardware allows.",
    ],
    diaryPrompts: [
      "Which primitive appears in more algorithms than I expected?",
      "Where did library setup cost affect the benchmark?",
      "What part of CUTLASS still feels opaque?",
    ],
  };
