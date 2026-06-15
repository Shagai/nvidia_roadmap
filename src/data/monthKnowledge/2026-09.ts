import type { MonthKnowledge } from "../../types";

export const knowledge202609: MonthKnowledge = {
    monthId: "2026-09",
    thesis:
      "This month learns inference deployment as systems engineering. The target is not training a model; it is moving frames through preprocessing, TensorRT inference, postprocessing, and measurement.",
    objectives: [
      "Understand tensors, shapes, batch size, precision, and engine build basics.",
      "Run an ONNX model through TensorRT or a comparable local inference pipeline.",
      "Measure end-to-end FPS and latency, including copies and preprocessing.",
      "Explain FP32, FP16, and INT8 tradeoffs at a practical level.",
    ],
    coreIdeas: [
      {
        title: "Tensor and batch shape",
        body:
          "Inference pipelines move tensors, not images in the abstract. Know layout, dtype, dimensions, batch size, and whether preprocessing creates copies. Batch size can improve throughput while hurting per-frame latency.",
      },
      {
        title: "TensorRT engine thinking",
        body:
          "TensorRT builds an optimized engine for a model, shapes, precision constraints, and hardware target. The useful mental model is compile once for a deployment scenario, then run repeatedly with predictable buffers.",
      },
      {
        title: "Precision tradeoffs",
        body:
          "FP32 is usually easiest to reason about. FP16 often improves speed and memory bandwidth on modern GPUs. INT8 can be faster but needs calibration and accuracy checks. Report accuracy or output sanity when changing precision.",
      },
      {
        title: "End-to-end pipeline",
        body:
          "The true product path includes video decode, preprocessing, host/device movement, inference, postprocessing, visualization, and output. A fast engine is only one segment of the pipeline.",
      },
    ],
    labs: [
      {
        title: "Model path",
        body:
          "Pick a small object detection model available as ONNX. Document input shape, preprocessing, output tensors, and postprocessing steps.",
      },
      {
        title: "TensorRT timing",
        body:
          "Measure engine build time separately from inference runtime. Report warmup runs, steady-state latency, and FPS.",
      },
      {
        title: "Pipeline timeline",
        body:
          "Create a table with preprocessing, H2D copy, inference, postprocessing, D2H copy if needed, and output time.",
        code: `Frame N timing:
decode_ms
preprocess_ms
h2d_ms
inference_ms
postprocess_ms
render_or_output_ms
total_ms`,
      },
    ],
    pitfalls: [
      "Optimizing model inference while preprocessing dominates total latency.",
      "Ignoring tensor layout conversion costs.",
      "Changing precision without checking output quality.",
      "Reporting FPS without latency distribution.",
    ],
    interviewPrompts: [
      "Why can larger batch size increase throughput but hurt latency?",
      "What is an ONNX model used for in deployment?",
      "What does TensorRT optimize?",
      "How would you profile an inference pipeline?",
    ],
    portfolioEvidence: [
      "End-to-end FPS and latency table.",
      "Timeline screenshot or table from Nsight Systems or manual instrumentation.",
      "README explaining bottlenecks and precision choices.",
      "Optional PyTorch versus TensorRT comparison.",
    ],
    diaryPrompts: [
      "Which stage dominates total latency?",
      "What tensor shape or layout issue confused me?",
      "What changed when batch size or precision changed?",
    ],
  };
