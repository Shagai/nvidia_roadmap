import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { CudaMentalModelBoundaryFigure } from "../components/CudaMentalModelBoundaryFigure";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaMentalModelGuide, cudaSources } from "../data/cudaKnowledgeBase";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

export function CudaMentalModelPage() {
  return (
    <EssayLayout
      eyebrow="CUDA knowledge pillar"
      title={cudaMentalModelGuide.title}
      dek={cudaMentalModelGuide.summary}
      toc={[
        { id: "frame", label: "Frame" },
        { id: "figure", label: "Figure" },
        { id: "know", label: "Know" },
        { id: "practice", label: "Practice" },
        { id: "traps", label: "Traps" },
        { id: "interview", label: "Interview" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="frame"
        title="The frame"
        note="Mental model first, syntax second. The page is about deciding and explaining before optimizing."
      >
        <p>
          The first CUDA mistake is treating the GPU as the whole program. It is not. The GPU is a
          powerful device inside a larger host-controlled system. The central question is where the
          ownership of work and data should live at each stage.
        </p>
        <Callout title="One sentence to keep nearby" tone="success">
          A good CUDA design moves enough regular work to the GPU, keeps data there long enough to
          amortize movement, proves correctness against a CPU reference, and reports both kernel-only
          and end-to-end timing.
        </Callout>
        <CodeBlock>{`// Mental-model sketch before writing a kernel
CPU owns: input loading, validation, allocation, launch choice, errors, final integration
GPU owns: repeated parallel operation over N elements
Boundary: H2D bytes=?, D2H bytes=?, synchronization points=?
Correctness: CPU reference, mismatch count, tolerance
Timing: CPU=?, H2D=?, kernel=?, D2H=?, total GPU=?`}</CodeBlock>
      </Section>

      <Section
        id="figure"
        title="Interactive CPU/GPU boundary"
        note="This is a planning model, not a benchmark. Use it to decide what to measure, then replace estimates with real numbers."
      >
        <CudaMentalModelBoundaryFigure />
      </Section>

      <Section id="know" title="Know">
        <div className="mental-model-section-grid">
          {cudaMentalModelGuide.know.map((section) => (
            <article className="mental-model-deep-card" key={section.title}>
              <h3>{section.title}</h3>
              <p className="short-answer">{section.thesis}</p>
              <ul>
                {section.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <p className="evidence-hook">
                <strong>Diagnostic:</strong> {section.diagnostic}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="practice" title="Practice">
        <div className="mental-model-practice-grid">
          {cudaMentalModelGuide.practice.map((practice) => (
            <article className="mental-model-practice-card" key={practice.title}>
              <h3>{practice.title}</h3>
              <p>{practice.purpose}</p>
              <DetailList title="Steps" items={practice.steps} ordered />
              <DetailList title="Evidence" items={practice.evidence} />
            </article>
          ))}
        </div>
      </Section>

      <Section id="traps" title="Traps">
        <div className="mental-model-trap-list">
          {cudaMentalModelGuide.traps.map((trap) => (
            <article className="mental-model-trap-card" key={trap.title}>
              <h3>{trap.title}</h3>
              <p>
                <strong>Symptom:</strong> {trap.symptom}
              </p>
              <p>
                <strong>Why it happens:</strong> {trap.whyItHappens}
              </p>
              <DetailList title="Correction" items={trap.correction} />
              {trap.deepDivePath ? (
                <Link className="cuda-kb-deep-link" to={trap.deepDivePath}>
                  Open deep dive
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section id="interview" title="Interview checks">
        <p>
          When this pillar is solid, these questions should be answerable from your own project
          evidence rather than from memory alone.
        </p>
        <div className="answer-grid">
          {cudaMentalModelGuide.interviewAnswers.map((answer) => (
            <article className="answer-card" key={answer.prompt}>
              <h3>{answer.prompt}</h3>
              <p className="short-answer">{answer.shortAnswer}</p>
              <ul>
                {answer.deepAnswer.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="evidence-hook">
                <strong>Evidence to collect:</strong> {answer.evidenceToCollect}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="Use these when correcting or extending this pillar."
      >
        <div className="reference-grid">
          {cudaMentalModelGuide.sourceIds.map((sourceId) => {
            const source = sourceById.get(sourceId);
            if (!source) return null;

            return (
              <a className="reference-card" href={source.url} key={source.id}>
                <strong>{source.label}</strong>
                <span>{source.scope}</span>
                <small>Checked {source.checked}</small>
              </a>
            );
          })}
        </div>
        <p className="month-nav">
          <Link to="/cuda-kb#pillars">Back to CUDA KB pillars</Link>
          <Link to="/cuda-lab">Open CUDA lab</Link>
          <Link to="/knowledge/2026-06">Open fundamentals month</Link>
        </p>
      </Section>
    </EssayLayout>
  );
}

function DetailList({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <div className="detail-list">
      <h4>{title}</h4>
      <ListTag>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
