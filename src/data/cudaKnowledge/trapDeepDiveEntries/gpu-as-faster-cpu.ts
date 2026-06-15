import type { CudaMentalModelTrapDeepDive } from "../types";

export const gpuAsFasterCpuDeepDive: CudaMentalModelTrapDeepDive = {
    slug: "gpu-as-faster-cpu",
    title: "The GPU Is Not A Faster CPU",
    trapTitle: "GPU as a faster CPU",
    summary:
      "CUDA is strongest when many lightweight threads own independent work. Moving a serial loop into one GPU thread keeps the CPU mental model and loses the GPU advantage.",
    sourceIds: ["programming-guide", "best-practices", "nsight-compute"],
    sections: [
      {
        title: "What the mistake looks like",
        paragraphs: [
          "The code technically launches a CUDA kernel, but the kernel behaves like a serial CPU function. One thread does most of the loop, or the host launches many tiny kernels that each do too little work.",
          "This can be seductive while learning because the kernel launch syntax appears correct. The problem is that the work ownership did not change. The GPU is being used as a remote scalar processor instead of a wide parallel device.",
        ],
        code: `__global__ void serial_on_gpu(const float* a,
                              const float* b,
                              float* c,
                              int n)
{
    if (blockIdx.x == 0 && threadIdx.x == 0) {
        for (int i = 0; i < n; ++i) {
            c[i] = a[i] + b[i];
        }
    }
}`,
      },
      {
        title: "Why it is wrong",
        paragraphs: [
          "The GPU path now pays launch overhead and still exposes almost no parallelism. One thread performs the loop while most GPU lanes sit idle.",
          "A second version of the same mistake is launching tiny kernels from the CPU for tiny fragments of work. The GPU can execute many threads, but kernel launches and synchronization are not free.",
        ],
        bullets: [
          "The CPU is good at scalar orchestration, branchy control flow, and small cached loops.",
          "The GPU is good at repeated work over many elements, pixels, particles, matrix entries, or tiles.",
          "CUDA syntax is not the goal; a clear parallel ownership rule is the goal.",
        ],
      },
      {
        title: "Better ownership model",
        paragraphs: [
          "The first correction is to define what one CUDA thread owns. For a vector add, one thread owns one output element. For an image transform, one thread usually owns one output pixel. For a tiled matrix kernel, one block may own one output tile.",
        ],
        code: `__global__ void vector_add_gpu(const float* a,
                               const float* b,
                               float* c,
                               int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}`,
      },
      {
        title: "Questions to ask",
        bullets: [
          "What repeated data-parallel dimension exists?",
          "What exactly does one thread own?",
          "Can different threads compute their outputs independently?",
          "Does the kernel launch enough useful threads to amortize launch overhead?",
          "Would this still be better if transfer and synchronization time are included?",
        ],
      },
      {
        title: "Short version",
        paragraphs: [
          "Wrong mental model: the GPU is a faster place to run my normal CPU loop.",
          "Correct mental model: the GPU needs a large repeated ownership rule that creates enough independent work.",
        ],
      },
    ],
  };
