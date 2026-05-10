import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { PortfolioBoard } from "../components/PortfolioBoard";
import { Section } from "../components/Section";
import { cudaFundamentalsPortfolioEvidence } from "../data/cudaFundamentals";

export function PortfolioPage() {
  return (
    <EssayLayout
      eyebrow="Public evidence"
      title="Portfolio project board"
      dek="Five visible artifacts that make the target profile credible by April 2027."
      toc={[
        { id: "principle", label: "Principle" },
        { id: "cuda-evidence", label: "CUDA evidence" },
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

      <Section
        id="cuda-evidence"
        title="CUDA fundamentals evidence blueprint"
        note="This is the concrete evidence package for the June CUDA fundamentals project."
      >
        <div className="evidence-grid">
          {cudaFundamentalsPortfolioEvidence.map((item) => (
            <article className="evidence-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.artifact}</p>
              <p>
                <strong>Proves:</strong> {item.proves}
              </p>
              <div className="detail-list">
                <h4>Must include</h4>
                <ul>
                  {item.mustInclude.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
              <p className="done-when">
                <strong>Done when:</strong> {item.doneWhen}
              </p>
            </article>
          ))}
        </div>
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
