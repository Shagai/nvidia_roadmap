import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { ProgressSummary } from "../components/ProgressSummary";
import { ReadingCard } from "../components/ReadingCard";
import { Section } from "../components/Section";
import { weeklyRhythm } from "../data/learningPlan";

export function HomePage() {
  return (
    <EssayLayout
      eyebrow="One-year learning diary"
      title="Preparing for NVIDIA: A One-Year C++/CUDA/Robotics Learning Diary"
      dek="An explorable study plan for becoming visibly strong in C++ systems, CUDA, GPU performance, robotics, vision, and interview execution."
      toc={[
        { id: "snapshot", label: "Snapshot" },
        { id: "recommendation", label: "Recommendation" },
        { id: "study-loop", label: "Study loop" },
        { id: "next", label: "Next action" },
      ]}
    >
      <Section
        id="snapshot"
        title="Study dashboard"
        note="Treat this as a living instrument panel, not a static plan. The sliders, checkboxes, cards, and diary entries all save locally."
      >
        <ProgressSummary />
      </Section>

      <Section id="recommendation" title="Main recommendation">
        <p>
          Do not spend the year broadly learning AI. Spend it becoming visibly good at{" "}
          <strong>C++ + CUDA + profiling + robotics/vision systems</strong>.
        </p>
        <Callout title="Portfolio evidence" tone="success">
          NVIDIA will not only care that I know CUDA syntax. The stronger signal is that I can
          measure bottlenecks, explain tradeoffs, and improve a real pipeline.
        </Callout>
        <div className="card-grid">
          <ReadingCard to="/skill-map" title="Map the gaps">
            Set 0-5 levels and watch the weighted readiness score change.
          </ReadingCard>
          <ReadingCard to="/roadmap" title="Work month by month">
            Track deliverables from May 2026 through April 2027.
          </ReadingCard>
          <ReadingCard to="/knowledge" title="Study the curriculum">
            Open the concept, lab, interview, and evidence guide for each month.
          </ReadingCard>
          <ReadingCard to="/cuda-kb" title="Use the CUDA KB">
            Keep CUDA concepts, workflows, commands, glossary, and official sources in one place.
          </ReadingCard>
          <ReadingCard to="/cuda-lab" title="Build GPU intuition">
            Explore blocks, threads, warps, and memory access quality.
          </ReadingCard>
          <ReadingCard to="/portfolio" title="Make evidence visible">
            Shape projects an NVIDIA engineer can inspect in five minutes.
          </ReadingCard>
        </div>
      </Section>

      <Section id="study-loop" title="Weekly rhythm">
        <p>
          The plan assumes about <strong>9 hours per week</strong>. The loop is deliberately small:
          code, measure, write, and rehearse explanations.
        </p>
        <table className="rhythm-table">
          <tbody>
            {weeklyRhythm.map(([activity, time]) => (
              <tr key={activity}>
                <th scope="row">{activity}</th>
                <td>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="next" title="Next action">
        <p>
          Start with the <Link to="/why">target rationale</Link>, then set the baseline in the{" "}
          <Link to="/skill-map">skill map</Link>. The diary should record what changed after each
          focused work session.
        </p>
      </Section>
    </EssayLayout>
  );
}
