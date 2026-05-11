import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { CudaBenchmarkPlanner } from "../components/CudaBenchmarkPlanner";
import { CudaExecutionVisualizer } from "../components/CudaExecutionVisualizer";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import {
  cudaFundamentalsInterviewAnswers,
  cudaFundamentalsLabProjects,
  cudaFundamentalsPortfolioEvidence,
} from "../data/cudaFundamentals";

export function CudaLabPage() {
  return (
    <EssayLayout
      eyebrow="CUDA intuition lab"
      title="CUDA fundamentals practical lab"
      dek="Interactive planning figures, lab projects, benchmark structure, interview answers, and portfolio evidence for the CUDA fundamentals month."
      toc={[
        { id: "mental-model", label: "Mental model" },
        { id: "planner", label: "Planner" },
        { id: "visualizer", label: "Visualizer" },
        { id: "projects", label: "Projects" },
        { id: "code", label: "Code shape" },
        { id: "interview", label: "Interview" },
        { id: "evidence", label: "Evidence" },
      ]}
    >
      <Section id="mental-model" title="Mental model">
        <p>
          CUDA starts to feel less mysterious when I separate the launch shape from the performance
          story. Blocks and threads define the work shape. Warps, memory access, divergence,
          synchronization, and resource use determine how efficiently the GPU runs it.
        </p>
        <p>
          For the full launch-configuration and occupancy explanation, use the{" "}
          <Link to="/cuda-kb/execution-model">CUDA execution model guide</Link> before running
          block-size sweeps in this lab.
        </p>
      </Section>

      <Section
        id="planner"
        title="Interactive benchmark planner"
        note="Use this before coding each lab. It makes image size, launch geometry, transfer bytes, and benchmark rows explicit."
      >
        <CudaBenchmarkPlanner />
      </Section>

      <Section id="visualizer" title="Interactive execution visualizer">
        <CudaExecutionVisualizer />
      </Section>

      <Section id="projects" title="Practical lab projects">
        <div className="lab-project-grid compact-labs">
          {cudaFundamentalsLabProjects.map((project) => (
            <article className="lab-project-card" key={project.title}>
              <header>
                <p>{project.purpose}</p>
                <h3>{project.title}</h3>
              </header>
              <p>{project.projectBrief}</p>
              <MiniList title="Deliver" items={project.deliverables} />
              <MiniList title="Done when" items={project.acceptanceCriteria} />
            </article>
          ))}
        </div>
      </Section>

      <Section id="code" title="Code shape">
        <CodeBlock>{`dim3 block(threads_per_block);
dim3 grid((n + block.x - 1) / block.x);

kernel<<<grid, block>>>(input, output, n);
CUDA_CHECK(cudaGetLastError());
CUDA_CHECK(cudaDeviceSynchronize());

// Interview question:
// Are the accesses coalesced? Did I time kernel-only or end-to-end?
// What limits the result: transfer cost, launch overhead, memory bandwidth,
// compute, occupancy, divergence, or synchronization?`}</CodeBlock>
      </Section>

      <Section id="interview" title="Answered interview prompts">
        <div className="answer-grid compact-answers">
          {cudaFundamentalsInterviewAnswers.map((answer) => (
            <article className="answer-card" key={answer.prompt}>
              <h3>{answer.prompt}</h3>
              <p className="short-answer">{answer.shortAnswer}</p>
              <p className="evidence-hook">
                <strong>Evidence hook:</strong> {answer.evidenceHook}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="evidence" title="Portfolio evidence">
        <Callout title="Five-minute inspection test" tone="success">
          The CUDA fundamentals repo should let a reviewer understand the problem, build the code,
          verify correctness, read the benchmark, and see the learning narrative without opening every
          source file.
        </Callout>
        <div className="evidence-grid">
          {cudaFundamentalsPortfolioEvidence.map((item) => (
            <article className="evidence-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.artifact}</p>
              <p>
                <strong>Done when:</strong> {item.doneWhen}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </EssayLayout>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="detail-list">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
