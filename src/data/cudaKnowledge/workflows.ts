import type { CudaWorkflow } from "./types";

export const cudaWorkflows: CudaWorkflow[] = [
  {
    title: "Start A CUDA Experiment",
    purpose: "Create a small artifact that can survive debugging, profiling, and review.",
    steps: [
      "State the workload, input shape, expected output, and why GPU acceleration might help.",
      "Implement the CPU reference and the CUDA version behind the same input/output contract.",
      "Check every CUDA runtime call and check each kernel launch immediately.",
      "Run correctness before recording any timing.",
      "Record environment, command line, build type, and hardware in the output or README.",
    ],
    evidence: [
      "CPU reference path.",
      "CUDA_CHECK helper.",
      "Mismatch count or maximum error output.",
      "One reproducible run command.",
    ],
  },
  {
    title: "Debug A Wrong Kernel",
    purpose: "Move from vague wrong output to a small cause.",
    steps: [
      "Shrink the input until the wrong element can be inspected manually.",
      "Check indexing math, bounds guard, and border policy first.",
      "Run Compute Sanitizer before changing performance code.",
      "Compare GPU output against CPU output at the first point where results diverge.",
      "Add the failing size to the test set before fixing the code.",
    ],
    evidence: [
      "Minimal failing input.",
      "Compute Sanitizer output or clean rerun.",
      "Regression test for non-divisible launch sizes.",
      "Short note explaining the bug class.",
    ],
  },
  {
    title: "Benchmark Honestly",
    purpose: "Separate kernel quality from application-level speed.",
    steps: [
      "Use release or RelWithDebInfo build settings.",
      "Warm up the CUDA context and the specific kernel path.",
      "Measure CPU reference, H2D, kernel, D2H, and total GPU path separately.",
      "Repeat runs and report a consistent statistic.",
      "State exactly what each speedup includes.",
    ],
    evidence: [
      "Benchmark table or CSV.",
      "GPU model, toolkit, driver, compiler, and command line.",
      "Transfer-inclusive speedup column.",
      "Interpretation of the crossover point.",
    ],
  },
  {
    title: "Optimize With A Profiler",
    purpose: "Make one code change because one measured bottleneck justifies it.",
    steps: [
      "Use Nsight Systems to see the end-to-end timeline before choosing a kernel.",
      "Use Nsight Compute on the target kernel to inspect memory, occupancy, stalls, and source metrics.",
      "Write the optimization hypothesis in one sentence.",
      "Make one change and rerun the same benchmark.",
      "Document the remaining bottleneck instead of declaring the project finished.",
    ],
    evidence: [
      "Before and after timings.",
      "Profiler report, exported metrics, or screenshot.",
      "Code diff linked to the bottleneck.",
      "Remaining limitation or next experiment.",
    ],
  },
  {
    title: "Convert Learning Into Interview Material",
    purpose: "Turn a lab into language that can be defended under time pressure.",
    steps: [
      "Write a 90-second answer for the concept.",
      "Write a deeper answer with one project example and one tradeoff.",
      "Point to the exact benchmark, profiler result, or code section that supports the answer.",
      "Practice the answer without notes.",
      "Update the answer after the next experiment changes the evidence.",
    ],
    evidence: [
      "Short answer.",
      "Detailed answer.",
      "Evidence hook.",
      "Known limitation or caveat.",
    ],
  },
];
