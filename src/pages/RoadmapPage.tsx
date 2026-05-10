import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { RoadmapTimeline } from "../components/RoadmapTimeline";
import { Section } from "../components/Section";

export function RoadmapPage() {
  return (
    <EssayLayout
      eyebrow="May 2026 to April 2027"
      title="12-month roadmap timeline"
      dek="Each month has a goal, topics, deliverables, and acceptance criteria. Checkboxes are saved locally."
      toc={[
        { id: "flow", label: "Learning flow" },
        { id: "timeline", label: "Timeline" },
        { id: "measure", label: "What to measure" },
      ]}
    >
      <Section id="flow" title="Learning flow">
        <p>
          The plan moves from target definition to CUDA fundamentals, optimization, C++ systems,
          inference, robotics, libraries, public evidence, interview drills, system design, and final
          application readiness.
        </p>
      </Section>

      <Section id="timeline" title="Timeline">
        <RoadmapTimeline />
      </Section>

      <Section id="measure" title="What to measure">
        <Callout title="What to measure" tone="success">
          For every technical month, capture baseline performance, optimized performance, bottleneck
          explanation, and reproducible build or run steps.
        </Callout>
      </Section>
    </EssayLayout>
  );
}
