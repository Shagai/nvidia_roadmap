import { Section } from "../../components/Section";
import { cudaSources, sharedExplanationSources } from "../../data/cudaKnowledge";
const sourceById = new Map(cudaSources.map((source) => [source.id, source]));
export function ExecutionModelSources() {
  return (
    <>
      <Section
        id="sources"
        title="Source anchors"
        note="Official references cover stable CUDA behavior. The shared ChatGPT notes are included because they were used as the teaching-source prompts for these page additions."
      >
        <h3>Official references</h3>
        <div className="reference-grid">
          {[
            "programming-guide",
            "programming-guide-compute-capabilities",
            "cuda-gpus",
            "best-practices",
            "runtime-api-occupancy",
            "nsight-compute",
            "cublas",
            "cutlass",
          ].map((sourceId) => {
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
        <h3>Shared explanation notes</h3>
        <div className="reference-grid">
          {sharedExplanationSources.map((source) => (
            <a className="reference-card" href={source.url} key={source.id}>
              <strong>{source.label}</strong>
              <span>{source.scope}</span>
              <small>Checked {source.checked}</small>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
