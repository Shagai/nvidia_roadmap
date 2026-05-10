import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { PortfolioBoard } from "../components/PortfolioBoard";
import { Section } from "../components/Section";

export function PortfolioPage() {
  return (
    <EssayLayout
      eyebrow="Public evidence"
      title="Portfolio project board"
      dek="Five visible artifacts that make the target profile credible by April 2027."
      toc={[
        { id: "principle", label: "Principle" },
        { id: "board", label: "Board" },
        { id: "next", label: "Next action" },
      ]}
    >
      <Section id="principle" title="The five-minute inspection test">
        <p>
          The portfolio should be inspectable in five minutes: README, screenshots, benchmark table,
          architecture diagram, and reproducible build instructions.
        </p>
        <Callout title="Portfolio evidence" tone="success">
          A good CUDA project should show before/after performance, not just final code.
        </Callout>
      </Section>

      <Section id="board" title="Project board">
        <PortfolioBoard />
      </Section>

      <Section id="next" title="Next action">
        <p>
          Pick one repository to make unusually clear. Add one chart, one diagram, one command block,
          and one paragraph explaining the bottleneck.
        </p>
      </Section>
    </EssayLayout>
  );
}
