import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";

export function WhyFitPage() {
  return (
    <EssayLayout
      eyebrow="Target positioning"
      title="Why this NVIDIA path fits me"
      dek="The strongest path combines existing C++/Qt/systems depth with CUDA performance work and robotics or vision projects."
      toc={[
        { id: "target", label: "Target role" },
        { id: "strength", label: "Strongest path" },
        { id: "trap", label: "Common trap" },
        { id: "evidence", label: "Evidence" },
      ]}
    >
      <Section id="target" title="Best NVIDIA target">
        <p>
          The best target is a <strong>Senior Software Engineer</strong> or{" "}
          <strong>System Software Engineer</strong> role focused on C++, CUDA, GPU performance,
          robotics/vision, or AI infrastructure.
        </p>
        <p>
          This is a sharper positioning than generic machine learning. It makes the profile legible:
          systems engineer, performance engineer, and robotics/vision builder.
        </p>
      </Section>

      <Section id="strength" title="Primary and secondary tracks">
        <div className="two-column-list">
          <div>
            <h3>Primary: GPU systems / CUDA</h3>
            <ul>
              <li>Kernels, blocks, warps, occupancy</li>
              <li>Global, shared, and register memory</li>
              <li>Coalesced memory access</li>
              <li>Streams, events, async copies, CUDA Graphs</li>
              <li>Atomics, synchronization, and multi-GPU basics</li>
            </ul>
          </div>
          <div>
            <h3>Secondary: robotics / vision / edge AI</h3>
            <ul>
              <li>ROS 2, Isaac ROS, and Isaac Sim</li>
              <li>DeepStream and GStreamer GPU pipelines</li>
              <li>TensorRT inference on video streams</li>
              <li>Jetson deployment basics</li>
              <li>Latency, throughput, and failure modes</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="trap" title="Common trap">
        <Callout title="Do not optimize for vague AI familiarity" tone="warning">
          A broad AI year can produce scattered notes but little public evidence. A good CUDA or
          robotics pipeline project should show before/after performance, not just final code.
        </Callout>
        <p>
          The stronger habit is to ask: what did I measure, what was the bottleneck, what tradeoff
          did I choose, and what changed after the optimization?
        </p>
      </Section>

      <Section id="evidence" title="What should be visible">
        <p>
          The portfolio should be inspectable in five minutes: README, screenshots, benchmark table,
          architecture diagram, and reproducible build instructions.
        </p>
        <CodeBlock language="text" title="CV headline direction" wrap>{`CV headline direction:
C++ / CUDA / Robotics Software Engineer

Signal to build:
performance measurement > API familiarity
end-to-end latency > isolated demo speed
clear architecture > pile of experiments`}</CodeBlock>
      </Section>
    </EssayLayout>
  );
}
