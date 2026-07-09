import type { MonthKnowledge } from "../../types";

export const knowledge202608: MonthKnowledge = {
    monthId: "2026-08",
    thesis:
      "This month connects C++ systems skill to real-time pipelines. The goal is a concurrent frame pipeline that is correct under pressure, measurable, and sanitizer-tested.",
    objectives: [
      "Deepen C++ ownership, lifetime, move semantics, RAII, and undefined behavior knowledge.",
      "Understand atomics, memory ordering, mutexes, condition variables, and bounded queues.",
      "Build a producer/consumer pipeline with backpressure and latency metrics.",
      "Use CMake, tests, benchmarks, and sanitizers as part of the artifact.",
    ],
    coreIdeas: [
      {
        title: "Ownership and lifetime",
        body:
          "Real-time systems often fail through lifetime bugs, not missing algorithms. Prefer RAII for resources, explicit ownership for buffers, and clear move-only types for frame packets.",
        checkpoints: [
          "A frame object has one clear owner at a time.",
          "Device buffers are released deterministically.",
          "References and spans never outlive their backing storage.",
        ],
      },
      {
        title: "Backpressure",
        body:
          "A bounded queue makes overload visible. If a producer is faster than a consumer, the system must block, drop, or degrade deliberately. Unbounded queues hide latency until memory or responsiveness collapses.",
      },
      {
        title: "Atomics and memory model",
        body:
          "Use mutexes and condition variables first unless a lock-free structure is truly justified. Atomics require reasoning about ordering, visibility, and progress; they are not a magic faster mutex.",
      },
      {
        title: "Latency versus throughput",
        body:
          "Throughput asks how many frames per second finish. Latency asks how long one frame takes end-to-end. Robotics systems often care about tail latency, not only average throughput.",
      },
    ],
    labs: [
      {
        title: "Bounded queue",
        body:
          "Implement a blocking bounded queue with close semantics. Add tests for push/pop, full queue behavior, shutdown, and multiple producers or consumers.",
      },
      {
        title: "Frame pipeline",
        body:
          "Create stages: simulated camera, CPU preprocessing, CUDA processing placeholder or adapter, and output. Attach timestamps at each stage.",
      },
      {
        title: "Sanitizer matrix",
        body:
          "Add build presets or targets for AddressSanitizer, UndefinedBehaviorSanitizer, and ThreadSanitizer where supported.",
        codeLanguage: "bash",
        code: `cmake -S . -B build-asan -DCMAKE_BUILD_TYPE=RelWithDebInfo -DENABLE_ASAN=ON
cmake --build build-asan
ctest --test-dir build-asan --output-on-failure`,
      },
    ],
    pitfalls: [
      "Building a thread pool before defining pipeline semantics.",
      "Using lock-free structures without tests that prove correctness.",
      "Measuring only throughput and missing queueing latency.",
      "Letting frame buffers be copied accidentally between stages.",
    ],
    interviewPrompts: [
      "When would you use a mutex queue instead of a lock-free queue?",
      "What is backpressure and why does it matter?",
      "How do move semantics help in a frame pipeline?",
      "What do sanitizers catch and what do they not prove?",
    ],
    portfolioEvidence: [
      "Clean CMake project with test and benchmark targets.",
      "Pipeline diagram with queue boundaries.",
      "Latency histogram or percentile table.",
      "Sanitizer instructions in the README.",
    ],
    diaryPrompts: [
      "Where did queueing latency appear?",
      "Which bug would have been hard to catch without a sanitizer?",
      "What ownership rule did I enforce in code?",
    ],
  };
