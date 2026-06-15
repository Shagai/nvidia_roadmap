import { Link, Navigate, useParams } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaMentalModelTrapDeepDives, cudaSources } from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

export function CudaMentalModelTrapPage() {
  const { trapSlug } = useParams();
  const deepDive = cudaMentalModelTrapDeepDives.find((item) => item.slug === trapSlug);

  if (!deepDive) {
    return <Navigate to="/cuda-kb/mental-model#traps" replace />;
  }

  return (
    <EssayLayout
      eyebrow="CUDA mental model trap"
      title={deepDive.title}
      dek={deepDive.summary}
      toc={[
        { id: "trap", label: "Trap" },
        ...deepDive.sections.map((section) => ({
          id: sectionId(section.title),
          label: section.title,
        })),
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="trap"
        title={deepDive.trapTitle}
        note="This page keeps the long explanation out of the main trap list while preserving the full reasoning."
      >
        <Callout title="Mental model correction" tone="success">
          {deepDive.summary}
        </Callout>
      </Section>

      {deepDive.sections.map((section) => (
        <Section id={sectionId(section.title)} title={section.title} key={section.title}>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets ? <DetailList items={section.bullets} /> : null}
          {section.code ? <CodeBlock>{section.code}</CodeBlock> : null}
        </Section>
      ))}

      <Section id="sources" title="Source anchors">
        <div className="reference-grid">
          {deepDive.sourceIds.map((sourceId) => {
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
          <Link to="/cuda-kb/mental-model#traps">Back to mental model traps</Link>
          <Link to="/cuda-kb/mental-model">Open mental model</Link>
          <Link to="/cuda-kb">Open CUDA KB</Link>
        </p>
      </Section>
    </EssayLayout>
  );
}

function DetailList({ items }: { items: string[] }) {
  return (
    <div className="detail-list">
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
