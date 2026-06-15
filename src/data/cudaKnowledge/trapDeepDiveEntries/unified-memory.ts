import type { CudaMentalModelTrapDeepDive } from "../types";

export const unifiedMemoryDeepDive: CudaMentalModelTrapDeepDive = {
    slug: "unified-memory",
    title: "Unified Memory Is Not Free Movement",
    trapTitle: "Unified Memory treated as free movement",
    summary:
      "cudaMallocManaged gives CPU and GPU code one pointer, but the pages still have locality, migration cost, and synchronization rules.",
    sourceIds: ["programming-guide", "runtime-api", "best-practices"],
    sections: [
      {
        title: "What Unified Memory is",
        paragraphs: [
          "cudaMallocManaged gives you a pointer that can be used from both CPU code and GPU kernels. That makes ownership and porting simpler because the source code no longer needs separate host and device pointer names for the same logical allocation.",
          "The important point is that unified address space does not mean the data is physically everywhere for free. The CPU and GPU can see the same pointer, but the memory pages still have to be located in CPU RAM, GPU memory, or migrated between them.",
        ],
        code: `float* x;
cudaMallocManaged(&x, n * sizeof(float));

x[0] = 1.0f;          // CPU can touch it
kernel<<<grid, block>>>(x); // GPU can touch it`,
      },
      {
        title: "The mistake",
        paragraphs: [
          "The wrong mental model is: since CPU and GPU can both access this pointer, I no longer need to think about data movement. CUDA still moves memory; it just may do it automatically and later than you expected.",
        ],
        code: `cudaMallocManaged(&x, n * sizeof(float));

for (int i = 0; i < n; ++i) {
    x[i] = static_cast<float>(i); // CPU initializes x
}

kernel<<<blocks, threads>>>(x);
cudaDeviceSynchronize();

std::cout << x[0] << "\\n";`,
        bullets: [
          "CPU writes x, so pages can be resident on the CPU side.",
          "The GPU kernel starts and touches x.",
          "The GPU may fault on those pages.",
          "CUDA migrates pages to the GPU.",
          "The CPU later reads x, so pages may need to migrate back.",
        ],
      },
      {
        title: "Why performance becomes unpredictable",
        paragraphs: [
          "The cost depends on the access pattern. A simple CPU initialize, GPU compute for a long time, CPU read final result pattern is usually reasonable.",
          "The suspicious pattern is repeated alternation: CPU touches data, GPU touches data, CPU touches data, GPU touches data. The same pages can bounce between processors, which is page migration thrashing.",
          "Unified Memory also does not remove the need for synchronization. Kernel launches are asynchronous. If the CPU reads a value that the GPU is still writing, the shared pointer does not make that access legal.",
        ],
        code: `kernel<<<blocks, threads>>>(x);
cudaDeviceSynchronize(); // required before the CPU reads GPU-written data

std::cout << x[0] << "\\n";`,
      },
      {
        title: "Better mental model",
        paragraphs: [
          "Think of Unified Memory as: CUDA will help me manage movement, but movement still exists. Do not think: movement disappeared.",
          "Unified Memory is useful for prototyping, porting CPU code to CUDA, simplifying ownership, irregular data structures, and learning the algorithm first. For performance learning, compare it with explicit copies so the movement is visible.",
        ],
        code: `// Unified Memory version:
cudaMallocManaged(&x, bytes);
kernel<<<grid, block>>>(x);
cudaDeviceSynchronize();

// Explicit-copy version:
float* h_x = new float[n];
float* d_x = nullptr;

cudaMalloc(&d_x, bytes);
cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);
kernel<<<grid, block>>>(d_x);
cudaMemcpy(h_x, d_x, bytes, cudaMemcpyDeviceToHost);`,
      },
      {
        title: "Questions to ask",
        bullets: [
          "Does the CPU initialize the data?",
          "Does the GPU read it first?",
          "Does the GPU write the result?",
          "Does the CPU need the result?",
          "Is there repeated CPU/GPU alternation?",
          "Which synchronization point makes the CPU access legal?",
        ],
      },
      {
        title: "Short version",
        paragraphs: [
          "Wrong mental model: same pointer means free data sharing.",
          "Correct mental model: same pointer means easier programming, but data still moves.",
        ],
      },
    ],
  };
