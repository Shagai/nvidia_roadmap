import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { PipelineLatencySimulator } from "../components/PipelineLatencySimulator";
import { Section } from "../components/Section";

export function ProfilingLabPage() {
  return (
    <EssayLayout
      eyebrow="Profiling and latency"
      title="GPU pipeline latency simulator"
      dek="A practical model for thinking about end-to-end latency across CPU, copies, CUDA kernels, inference, and output."
      toc={[
        { id: "why", label: "Why it matters" },
        { id: "simulator", label: "Simulator" },
        { id: "method", label: "Method" },
      ]}
    >
      <Section id="why" title="Why end-to-end latency matters">
        <p>
          For robotics and vision roles, end-to-end latency is often more important than isolated
          model accuracy. A fast kernel is not enough if preprocessing, memory copies, batching, or
          output handling dominate the frame budget.
        </p>
      </Section>

      <Section id="simulator" title="Pipeline simulator">
        <PipelineLatencySimulator />
      </Section>

      <Section id="method" title="Profiling method">
        <Callout title="What to write in the diary">
          Record the timeline, the bottleneck, the hypothesis, the change, and the before/after
          number. That turns profiling into evidence instead of a screenshot collection.
        </Callout>
        <CodeBlock>{`profiling loop:
1. Measure the whole pipeline.
2. Find the dominant stage.
3. Form one hypothesis.
4. Change one thing.
5. Re-measure and write the result.`}</CodeBlock>
      </Section>
    </EssayLayout>
  );
}
