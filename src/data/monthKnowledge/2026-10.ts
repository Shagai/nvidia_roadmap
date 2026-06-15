import type { MonthKnowledge } from "../../types";

export const knowledge202610: MonthKnowledge = {
    monthId: "2026-10",
    thesis:
      "This month attaches GPU work to robotics and perception. The artifact should show messages, launch files, GPU acceleration points, and latency in a robotics-style architecture.",
    objectives: [
      "Understand ROS 2 node, topic, message, launch, and package basics.",
      "Connect camera input to GPU inference or CUDA processing.",
      "Explain where Isaac ROS, Isaac Sim, DeepStream, GStreamer, and Jetson fit.",
      "Produce a demo with an architecture diagram and latency notes.",
    ],
    coreIdeas: [
      {
        title: "ROS 2 graph",
        body:
          "A ROS 2 system is a graph of nodes communicating through topics, services, and actions. For perception, typical nodes include camera input, preprocessing, inference, tracking, visualization, and downstream planning consumers.",
      },
      {
        title: "GPU acceleration boundary",
        body:
          "Name the CPU/GPU boundary explicitly. Data format conversion and memory copies can erase gains if every stage bounces between CPU and GPU.",
      },
      {
        title: "Isaac and DeepStream positioning",
        body:
          "Isaac ROS and Isaac Sim are robotics-focused NVIDIA tools. DeepStream is a video analytics pipeline stack. GStreamer is the media pipeline substrate. Jetson is edge deployment hardware. The month is about knowing where each tool belongs.",
      },
      {
        title: "Robotics latency",
        body:
          "Robotics cares about time-aligned perception. Measure capture-to-detection latency, not just inference. Consider dropped frames, stale detections, and synchronization with sensor timestamps.",
      },
    ],
    labs: [
      {
        title: "ROS 2 perception skeleton",
        body:
          "Create a package with camera input or simulated frames, a GPU processing node, and a detection or processed-image output topic.",
      },
      {
        title: "Launch and parameters",
        body:
          "Add a launch file and parameters for model path, input topic, output topic, precision, and visualization toggle.",
      },
      {
        title: "Architecture diagram",
        body:
          "Draw the node graph and annotate CPU/GPU boundaries, message types, queue depth, and measured latency.",
      },
    ],
    pitfalls: [
      "Showing a robotics demo without a launch file.",
      "Not documenting hardware and driver assumptions.",
      "Ignoring timestamp freshness and queue depth.",
      "Claiming GPU acceleration without naming which stage runs on GPU.",
    ],
    interviewPrompts: [
      "How does a ROS 2 perception pipeline move data?",
      "Where can GPU acceleration help in robotics vision?",
      "What is the danger of stale perception data?",
      "How would you debug a latency spike in a camera-to-detection pipeline?",
    ],
    portfolioEvidence: [
      "ROS 2 package and launch file.",
      "Demo video or GIF.",
      "Architecture diagram with topics and GPU boundaries.",
      "Latency table and README deployment notes.",
    ],
    diaryPrompts: [
      "Which ROS 2 concept was new or confusing?",
      "Where did data cross the CPU/GPU boundary?",
      "What would need to change for Jetson deployment?",
    ],
  };
