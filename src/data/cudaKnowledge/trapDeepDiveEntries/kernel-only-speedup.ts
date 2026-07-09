import type { CudaMentalModelTrapDeepDive } from "../types";

export const kernelOnlySpeedupDeepDive: CudaMentalModelTrapDeepDive = {
    slug: "kernel-only-speedup",
    title: "Kernel-Only Speedup Is Not Application Speedup",
    trapTitle: "Kernel-only speedup presented as application speedup",
    summary:
      "A fast kernel is only one line in the latency ledger. Application speedup must include the host work, transfers, launch overhead, synchronization, and postprocessing the user actually pays for.",
    sourceIds: ["best-practices", "runtime-api", "nsight-systems", "nsight-compute"],
    sections: [
      {
        title: "What the mistake looks like",
        paragraphs: [
          "A benchmark reports that the CUDA kernel is much faster than the CPU loop, but the measured number excludes host-to-device copies, device-to-host copies, allocation, synchronization, format conversion, and CPU-side setup.",
          "That kernel-only number is useful for device-code tuning. It is not the same as the speedup a user sees when running the whole application path.",
        ],
        codeLanguage: "cuda",
        code: `// Narrow timing question: only the kernel body.
start_cuda_event();
kernel<<<grid, block>>>(d_input, d_output, n);
stop_cuda_event();

// Broader timing question: the path the application pays for.
timer.start();
cudaMemcpy(d_input, h_input, bytes, cudaMemcpyHostToDevice);
kernel<<<grid, block>>>(d_input, d_output, n);
cudaMemcpy(h_output, d_output, bytes, cudaMemcpyDeviceToHost);
timer.stop();`,
      },
      {
        title: "Why the headline can mislead",
        paragraphs: [
          "The kernel can be fast and the full GPU path can still be slow. This happens when the operation is small, transfer volume is large, allocation is inside the hot path, synchronization is excessive, or CPU preprocessing dominates the run.",
          "The honest report names which speedup is being discussed. Kernel-only speedup asks whether the device code improved. End-to-end speedup asks whether the whole path improved.",
        ],
        bullets: [
          "Kernel-only timing is useful for tuning kernel internals.",
          "Transfer-inclusive timing is useful for application claims.",
          "A good CUDA project reports both when both are relevant.",
        ],
      },
      {
        title: "Timing ledger to collect",
        paragraphs: [
          "For learning, write the benchmark row so it cannot hide boundary costs. A simple table with separate stages prevents accidental overclaiming.",
        ],
        codeLanguage: "text",
        code: `input       cpu_ms  h2d_ms  kernel_ms  d2h_ms  total_gpu_ms  speedup_e2e
1080p       4.00    1.20    0.40       1.80    3.40          1.18x

kernel_only_speedup = cpu_ms / kernel_ms;
end_to_end_speedup  = cpu_ms / total_gpu_ms;`,
      },
      {
        title: "Profiler view",
        paragraphs: [
          "Nsight Systems is the right first tool for this mistake because it shows the CPU/GPU timeline: API calls, memory copies, kernels, waits, and gaps. Nsight Compute is the next tool when one specific kernel needs deeper analysis.",
        ],
        bullets: [
          "Use Nsight Systems to see whether copies, waits, launches, or CPU work dominate.",
          "Use Nsight Compute to explain why the target kernel behaves the way it does.",
          "Do not optimize kernel instructions before confirming that the kernel is the relevant bottleneck.",
        ],
      },
      {
        title: "Short version",
        paragraphs: [
          "Wrong mental model: my kernel is 10x faster, so my application is 10x faster.",
          "Correct mental model: kernel-only speedup and end-to-end speedup answer different questions and both must be labeled.",
        ],
      },
    ],
  };
