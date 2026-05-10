import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { SkillMap } from "../components/SkillMap";

export function SkillMapPage() {
  return (
    <EssayLayout
      eyebrow="Readiness map"
      title="Interactive NVIDIA readiness skill map"
      dek="Set a current level for each skill from 0 to 5. The score is a planning aid, not a truth machine."
      toc={[
        { id: "intuition", label: "Intuition" },
        { id: "figure", label: "Skill map" },
        { id: "diary", label: "Diary prompt" },
      ]}
    >
      <Section id="intuition" title="What the score means">
        <p>
          A useful NVIDIA preparation score should reward the intersection: modern C++, CUDA,
          profiling, GPU architecture, and real robotics or vision systems.
        </p>
        <Callout title="Interview intuition">
          A slider at level 5 should mean I can explain tradeoffs, debug failure modes, and point to
          a concrete artifact. Reading notes alone is closer to level 1 or 2.
        </Callout>
      </Section>

      <Section id="figure" title="Skill map">
        <SkillMap />
      </Section>

      <Section id="diary" title="What to write in the diary">
        <p>
          When a score changes, write why. A good diary entry names the experiment, the benchmark,
          the confusing part, and the next action.
        </p>
      </Section>
    </EssayLayout>
  );
}
