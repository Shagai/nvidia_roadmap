import type { MonthKnowledge } from "../../types";

export const knowledge202702: MonthKnowledge = {
    monthId: "2027-02",
    thesis:
      "This month practices architecture for GPU/software roles. The emphasis is CPU/GPU boundaries, throughput, latency, memory ownership, observability, and failure modes.",
    objectives: [
      "Write five short design documents with diagrams.",
      "Practice requirements before architecture.",
      "Name bottlenecks and observability signals explicitly.",
      "Explain tradeoffs for real-time, batch, and distributed GPU systems.",
    ],
    coreIdeas: [
      {
        title: "Requirements first",
        body:
          "Start every design with workload shape, latency target, throughput target, hardware assumptions, failure tolerance, and data size. Architecture without requirements is decoration.",
      },
      {
        title: "CPU/GPU boundary",
        body:
          "Define what stays on CPU, what moves to GPU, when copies occur, and who owns buffers. Avoid designs that repeatedly convert formats or cross the bus unnecessarily.",
      },
      {
        title: "Observability",
        body:
          "A production GPU system needs stage latency, queue depth, GPU utilization, memory usage, dropped frames, error rates, model version, and input/output counters.",
      },
      {
        title: "Failure modes",
        body:
          "Design for camera disconnects, corrupt frames, GPU OOM, slow consumers, model load failure, version mismatch, thermal throttling, and partial service degradation.",
      },
    ],
    labs: [
      {
        title: "Camera pipeline design",
        body:
          "Design a real-time camera processing pipeline. Include capture, preprocessing, GPU inference, postprocessing, output, queues, and metrics.",
      },
      {
        title: "GPU inference server",
        body:
          "Design request batching, memory pools, model loading, backpressure, timeouts, and observability for a GPU inference server.",
      },
      {
        title: "Design document template",
        body:
          "Use the same structure for all five documents so practice compounds.",
        codeLanguage: "text",
        code: `# Design
## Requirements
## Data model
## CPU/GPU boundary
## Architecture
## Memory ownership
## Bottlenecks
## Failure modes
## Observability
## Tests`,
      },
    ],
    pitfalls: [
      "Drawing components before naming latency and throughput targets.",
      "Ignoring queue growth and backpressure.",
      "Treating GPU utilization as the only metric.",
      "Skipping failure modes because the project is a demo.",
    ],
    interviewPrompts: [
      "Design a GPU inference server for variable-size requests.",
      "Design a multi-camera robotics perception system.",
      "How would you detect and respond to rising end-to-end latency?",
      "Where would you put batching and why?",
    ],
    portfolioEvidence: [
      "Five 2-3 page design documents.",
      "One diagram per document.",
      "A summary page linking designs to portfolio projects.",
    ],
    diaryPrompts: [
      "Which design tradeoff was hardest?",
      "Which metric would catch the first production failure?",
      "Where did memory ownership need to be clearer?",
    ],
  };
