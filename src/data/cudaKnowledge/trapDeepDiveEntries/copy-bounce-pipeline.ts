import type { CudaMentalModelTrapDeepDive } from "../types";

export const copyBouncePipelineDeepDive: CudaMentalModelTrapDeepDive = {
    slug: "copy-bounce-pipeline",
    title: "Avoid The Copy-Bounce Pipeline",
    trapTitle: "Copy bounce pipeline",
    summary:
      "If every GPU stage copies data back to the CPU before the next GPU stage, the boundary cost becomes part of every operation. Keep intermediate data resident when the pipeline allows it.",
    sourceIds: ["programming-guide", "best-practices", "runtime-api", "nsight-systems"],
    sections: [
      {
        title: "What the mistake looks like",
        paragraphs: [
          "The program treats each kernel as a separate demo. Stage 1 copies input to the GPU, runs a kernel, copies output back to the CPU. Stage 2 then copies that output back to the GPU, runs another kernel, and copies back again.",
          "This is easy to inspect and debug, but it can destroy the application-level speedup when intermediate buffers are large.",
        ],
        codeLanguage: "cuda",
        code: `// Copy-bounce shape:
cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice);
stage1<<<grid, block>>>(d_a, d_b);
cudaMemcpy(h_b, d_b, bytes, cudaMemcpyDeviceToHost);

cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice);
stage2<<<grid, block>>>(d_b, d_c);
cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost);`,
      },
      {
        title: "Why it is expensive",
        paragraphs: [
          "The CPU/GPU boundary is often the real cost. If every stage crosses the boundary twice, then the pipeline pays transfer cost even when the next operation also belongs on the GPU.",
          "Copying every intermediate result can also force synchronization. That makes it harder to overlap work and easier to accidentally benchmark waiting instead of computation.",
        ],
        bullets: [
          "Large intermediate arrays should usually stay on the device if the next stage is also a GPU stage.",
          "Copying back is still useful for final output, summaries, debug checkpoints, and validation modes.",
          "The mental model is buffer residency, not just individual kernel speed.",
        ],
      },
      {
        title: "Resident pipeline shape",
        paragraphs: [
          "A stronger design copies input once, runs multiple dependent kernels over device buffers, then copies only the final result or a small summary back to the CPU.",
        ],
        codeLanguage: "cuda",
        code: `// Device-resident shape:
cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice);

stage1<<<grid, block>>>(d_a, d_b);
stage2<<<grid, block>>>(d_b, d_c);
stage3<<<grid, block>>>(d_c, d_out);

cudaMemcpy(h_out, d_out, out_bytes, cudaMemcpyDeviceToHost);`,
      },
      {
        title: "What changes in the design",
        paragraphs: [
          "Keeping data resident is not only a performance change. It changes ownership, observability, memory lifetime, error handling, and correctness strategy.",
          "The CPU no longer gets every intermediate array for free inspection. That means you may need debug modes that copy selected checkpoints, sampled validation, or CPU references for individual stages.",
        ],
        bullets: [
          "Name which buffers are host-only, device-only, or mirrored.",
          "Record when each buffer becomes valid.",
          "Copy back final outputs by default and intermediate outputs only when debugging or validating.",
          "Measure the copy-bounce and resident shapes with the same workload before claiming the improvement.",
        ],
      },
      {
        title: "Short version",
        paragraphs: [
          "Wrong mental model: every kernel should return its result to the CPU immediately.",
          "Correct mental model: a GPU pipeline should keep intermediate data resident until the CPU actually needs it.",
        ],
      },
    ],
  };
