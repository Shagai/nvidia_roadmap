import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import {
  cudaCommands,
  cudaGlossary,
  cudaKnowledgePillars,
  cudaOptimizationChecklist,
  cudaSources,
  cudaStudyTracks,
  cudaWorkflows,
} from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

export function CudaKnowledgeBasePage() {
  return (
    <EssayLayout
      eyebrow="CUDA knowledge base"
      title="CUDA field guide"
      dek="A centralized reference for CUDA concepts, official sources, workflows, commands, glossary terms, and portfolio evidence."
      toc={[
        { id: "map", label: "Map" },
        { id: "pillars", label: "Pillars" },
        { id: "optimization-checklist", label: "Optimization checklist" },
        { id: "workflows", label: "Workflows" },
        { id: "commands", label: "Commands" },
        { id: "glossary", label: "Glossary" },
        { id: "sources", label: "Sources" },
        { id: "next", label: "Next" },
      ]}
    >
      <Section
        id="map"
        title="Knowledge map"
        note="Source cards include per-reference checked dates. Recheck source pages before making version-specific claims."
      >
        <p>
          The CUDA study surface is split into fundamentals, performance, systems, and interview
          tracks. Each track points back to the same source-linked pillars so notes, labs, and
          explanations stay connected.
        </p>
        <div className="cuda-kb-track-grid">
          {cudaStudyTracks.map((track) => (
            <article className="cuda-kb-track-card" key={track.title}>
              <h3>{track.title}</h3>
              <p>{track.outcome}</p>
              <ol>
                {track.sequence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        <article className="cuda-kb-feature-link">
          <div>
            <p>Kernel deep page</p>
            <h3>Tiling multiplication, kernel ownership, and synchronization</h3>
            <span>
              Start from tiled matrix multiplication to see how blocks, threads, shared memory,
              private registers, and barriers fit together in one concrete kernel. Then open the
              focused __syncthreads() article for barrier rules and mistakes.
            </span>
          </div>
          <div className="cuda-kb-feature-actions">
            <Link className="cuda-kb-deep-link" to="/cuda-kb/kernels">
              Kernel guide
            </Link>
            <Link className="cuda-kb-deep-link" to="/cuda-kb/syncthreads">
              __syncthreads()
            </Link>
          </div>
        </article>
        <article className="cuda-kb-feature-link">
          <div>
            <p>Occupancy deep page</p>
            <h3>Shared memory, resident blocks, and occupancy pressure</h3>
            <span>
              Use the A100-style shared-memory arithmetic to see why tiled matrix multiplication
              can use shared memory cheaply, while a 32 KiB-per-block kernel can reduce resident
              blocks and drop occupancy.
            </span>
          </div>
          <div className="cuda-kb-feature-actions">
            <Link className="cuda-kb-deep-link" to="/cuda-kb/shared-memory-occupancy">
              Occupancy guide
            </Link>
            <Link className="cuda-kb-deep-link" to="/cuda-kb/execution-model#occupancy">
              Execution model
            </Link>
          </div>
        </article>
        <article className="cuda-kb-feature-link">
          <div>
            <p>Optimization deep page</p>
            <h3>Thread coarsening, local work, and measured granularity</h3>
            <span>
              Use the coarsening pattern to see when giving each thread multiple logical outputs
              can improve reuse and instruction-level parallelism, and when it instead damages
              occupancy, coalescing, or load balance.
            </span>
          </div>
          <div className="cuda-kb-feature-actions">
            <Link className="cuda-kb-deep-link" to="/cuda-kb/thread-coarsening">
              Coarsening guide
            </Link>
            <Link className="cuda-kb-deep-link" to="/cuda-kb#workflows">
              Tuning workflow
            </Link>
          </div>
        </article>
        <Callout title="Working rule" tone="success">
          Every CUDA note should eventually connect to a runnable command, a measured result, a
          profiler observation, or an interview answer backed by project evidence.
        </Callout>
      </Section>

      <Section
        id="pillars"
        title="Knowledge pillars"
        note="Use these as the canonical buckets for new CUDA notes and experiments."
      >
        <div className="cuda-kb-pillar-list">
          {cudaKnowledgePillars.map((pillar) => (
            <article className="cuda-kb-pillar" key={pillar.id}>
              <header>
                <p>{pillar.guidingQuestion}</p>
                <h3>{pillar.title}</h3>
              </header>
              <p>{pillar.summary}</p>
              <DetailList title="Know" items={pillar.know} />
              <DetailList title="Practice" items={pillar.practice} />
              <DetailList title="Traps" items={pillar.traps} />
              <SourceLinks ids={pillar.sourceIds} />
              {pillar.deepDivePath ? (
                <Link className="cuda-kb-deep-link" to={pillar.deepDivePath}>
                  Open deep page
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="optimization-checklist"
        title="Optimization checklist"
        note="Use this as a first-pass map from observed bottleneck to plausible CUDA tuning levers."
      >
        <div className="cuda-optimization-table-wrap">
          <table className="cuda-optimization-table">
            <thead>
              <tr>
                <th scope="col">Optimization</th>
                <th scope="col">Benefit to compute cores</th>
                <th scope="col">Benefit to memory</th>
                <th scope="col">Strategies</th>
              </tr>
            </thead>
            <tbody>
              {cudaOptimizationChecklist.map((item) => (
                <tr key={item.optimization}>
                  <th scope="row">
                    <Link className="cuda-optimization-link" to={item.explanationPath}>
                      {item.optimization}
                    </Link>
                  </th>
                  <td>{item.computeBenefit}</td>
                  <td>{item.memoryBenefit}</td>
                  <td>
                    <ul>
                      {item.strategies.map((strategy) => (
                        <li key={strategy}>{strategy}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout title="How to use the checklist" tone="success">
          Pick the row that matches the profiler symptom, make one code change, then compare the
          benchmark and Nsight metrics against the baseline before stacking another optimization.
        </Callout>
      </Section>

      <Section
        id="workflows"
        title="Reusable workflows"
        note="These are the repeatable operating procedures for labs, debugging, benchmarking, optimization, and interview prep."
      >
        <div className="cuda-kb-workflow-grid">
          {cudaWorkflows.map((workflow) => (
            <article className="cuda-kb-workflow" key={workflow.title}>
              <h3>{workflow.title}</h3>
              <p>{workflow.purpose}</p>
              <DetailList title="Steps" items={workflow.steps} ordered />
              <DetailList title="Evidence" items={workflow.evidence} />
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="commands"
        title="Command ledger"
        note="Keep commands close to their proof obligation so benchmarking and profiling remain reproducible."
      >
        <div className="cuda-command-table-wrap">
          <table className="cuda-command-table">
            <thead>
              <tr>
                <th scope="col">Command</th>
                <th scope="col">Use</th>
                <th scope="col">Proof</th>
              </tr>
            </thead>
            <tbody>
              {cudaCommands.map((command) => (
                <tr key={command.command}>
                  <th scope="row">
                    <code>{command.command}</code>
                  </th>
                  <td>{command.use}</td>
                  <td>{command.proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock>{`# Minimum CUDA project evidence
nvidia-smi
nvcc --version
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j
compute-sanitizer --tool memcheck ./build/cuda_lab
nsys profile -o reports/timeline ./build/cuda_lab
ncu --set full --target-processes all ./build/cuda_lab`}</CodeBlock>
      </Section>

      <Section
        id="glossary"
        title="Glossary"
        note="Terms are phrased for project explanations, not dictionary completeness."
      >
        <div className="cuda-glossary-grid">
          {cudaGlossary.map((item) => (
            <article className="cuda-glossary-card" key={item.term}>
              <h3>{item.term}</h3>
              <p>{item.meaning}</p>
              <span>{item.whenItMatters}</span>
              <Link
                aria-label={`Open explanation for ${item.term}`}
                className="cuda-glossary-link"
                reloadDocument
                to={item.explanationPath}
              >
                Open explanation
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="sources"
        title="Official source shelf"
        note="Prefer these pages over blog summaries when adding or correcting technical claims."
      >
        <div className="reference-grid">
          {cudaSources.map((source) => (
            <a className="reference-card" href={source.url} key={source.id}>
              <strong>{source.label}</strong>
              <span>{source.scope}</span>
              <small>Checked {source.checked}</small>
            </a>
          ))}
        </div>
      </Section>

      <Section id="next" title="Next study move">
        <p>
          The central reference now links back to the month-by-month learning plan. Start with{" "}
          <Link to="/knowledge/2026-06">CUDA fundamentals</Link>, then use the command ledger and
          workflows above to turn each lab into reproducible evidence.
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
    <div className="cuda-kb-detail-list">
      <h4>{title}</h4>
      <ListTag>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}

function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <div className="cuda-kb-source-row" aria-label="Source links">
      {ids.map((id) => {
        const source = sourceById.get(id);
        if (!source) return null;

        return (
          <a href={source.url} key={source.id}>
            {source.label}
          </a>
        );
      })}
    </div>
  );
}
