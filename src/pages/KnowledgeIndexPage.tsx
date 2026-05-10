import { Link } from "react-router-dom";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { monthKnowledge } from "../data/knowledge";
import { roadmap } from "../data/plan";

export function KnowledgeIndexPage() {
  return (
    <EssayLayout
      eyebrow="Curriculum"
      title="Monthly knowledge base"
      dek="A deep-linkable curriculum for each month of the NVIDIA preparation roadmap: concepts, labs, traps, interview prompts, portfolio evidence, and diary prompts."
      toc={[
        { id: "how-to-use", label: "How to use" },
        { id: "months", label: "Month guides" },
        { id: "principle", label: "Principle" },
      ]}
    >
      <Section
        id="how-to-use"
        title="How to use this section"
        note="Use the roadmap for schedule tracking. Use these guides when sitting down to study or build."
      >
        <p>
          Each month guide is intentionally practical. It tells you what to understand, what to build,
          what to measure, what traps to avoid, and what evidence should exist by the end of the month.
        </p>
        <p>
          Use the <Link to="/cuda-kb">CUDA field guide</Link> as the central reference for CUDA
          concepts, workflows, commands, glossary terms, and official source links.
        </p>
      </Section>

      <Section id="months" title="Month guides">
        <div className="knowledge-grid">
          {monthKnowledge.map((guide) => {
            const month = roadmap.find((item) => item.id === guide.monthId);
            return (
              <Link className="knowledge-card" to={`/knowledge/${guide.monthId}`} key={guide.monthId}>
                <span>{month?.month}</span>
                <strong>{month?.title}</strong>
                <p>{guide.thesis}</p>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section id="principle" title="The operating principle">
        <p>
          Knowledge only counts when it changes what you can build, measure, debug, or explain. Treat
          each page as a study contract: read enough to act, run the lab, write the result, and update
          the diary.
        </p>
      </Section>
    </EssayLayout>
  );
}
