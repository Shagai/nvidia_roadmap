import { Link, Navigate, useParams } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { roadmap } from "../data/learningPlan";
import { getMonthKnowledge, monthKnowledge } from "../data/monthKnowledge";
import type { InterviewPromptAnswer, KnowledgeBlock, PortfolioEvidenceDetail, PracticalLabProject } from "../types";

export function MonthKnowledgePage() {
  const { monthId } = useParams();
  const guide = monthId ? getMonthKnowledge(monthId) : undefined;

  if (!guide) {
    return <Navigate to="/knowledge" replace />;
  }

  const month = roadmap.find((item) => item.id === guide.monthId);
  const currentIndex = monthKnowledge.findIndex((item) => item.monthId === guide.monthId);
  const previous = monthKnowledge[currentIndex - 1];
  const next = monthKnowledge[currentIndex + 1];
  const toc = [
    { id: "objectives", label: "Objectives" },
    { id: "concepts", label: "Core ideas" },
    { id: "labs", label: "Labs" },
    ...(guide.practicalProjects ? [{ id: "project-labs", label: "Projects" }] : []),
    { id: "traps", label: "Traps" },
    { id: "interview", label: "Interview" },
    { id: "evidence", label: "Evidence" },
    ...(guide.referenceLinks ? [{ id: "references", label: "References" }] : []),
    { id: "diary", label: "Diary" },
  ];

  return (
    <EssayLayout
      eyebrow={month?.month}
      title={month?.title ?? "Month guide"}
      dek={guide.thesis}
      toc={toc}
    >
      <Section id="objectives" title="Learning objectives">
        <ul className="check-list strong">
          {guide.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </Section>

      <Section id="concepts" title="Core ideas">
        <BlockList blocks={guide.coreIdeas} />
      </Section>

      <Section id="labs" title="Practical labs">
        <BlockList blocks={guide.labs} />
      </Section>

      {guide.practicalProjects ? (
        <Section
          id="project-labs"
          title="Practical lab projects"
          note="These turn the month into concrete work packages with measurements, acceptance criteria, and portfolio outputs."
        >
          <LabProjectList projects={guide.practicalProjects} />
        </Section>
      ) : null}

      <Section id="traps" title="Common traps">
        <Callout title="Use this as a pre-flight check" tone="warning">
          Review these before starting the month and again before publishing the artifact.
        </Callout>
        <ul className="check-list">
          {guide.pitfalls.map((pitfall) => (
            <li key={pitfall}>{pitfall}</li>
          ))}
        </ul>
      </Section>

      <Section id="interview" title="Interview prompts">
        {guide.interviewAnswers ? (
          <InterviewAnswerList answers={guide.interviewAnswers} />
        ) : (
          <div className="prompt-grid">
            {guide.interviewPrompts.map((prompt) => (
              <article className="prompt-card" key={prompt}>
                {prompt}
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section id="evidence" title="Portfolio evidence">
        <ul className="check-list strong">
          {guide.portfolioEvidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {guide.portfolioArtifacts ? <PortfolioEvidenceList items={guide.portfolioArtifacts} /> : null}
      </Section>

      {guide.referenceLinks ? (
        <Section id="references" title="Reference links">
          <div className="reference-grid">
            {guide.referenceLinks.map((reference) => (
              <a className="reference-card" href={reference.url} key={reference.url}>
                <strong>{reference.label}</strong>
                <span>{reference.note}</span>
              </a>
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="diary" title="Diary prompts">
        <ul className="check-list">
          {guide.diaryPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
        <div className="month-nav">
          {previous ? <Link to={`/knowledge/${previous.monthId}`}>Previous month</Link> : <span />}
          <Link to="/knowledge">All month guides</Link>
          {next ? <Link to={`/knowledge/${next.monthId}`}>Next month</Link> : <span />}
        </div>
      </Section>
    </EssayLayout>
  );
}

function BlockList({ blocks }: { blocks: KnowledgeBlock[] }) {
  return (
    <div className="knowledge-blocks">
      {blocks.map((block) => (
        <article className="knowledge-block" key={block.title}>
          <h3>{block.title}</h3>
          <p>{block.body}</p>
          {block.checkpoints ? (
            <ul>
              {block.checkpoints.map((checkpoint) => (
                <li key={checkpoint}>{checkpoint}</li>
              ))}
            </ul>
          ) : null}
          {block.code ? <CodeBlock>{block.code}</CodeBlock> : null}
        </article>
      ))}
    </div>
  );
}

function LabProjectList({ projects }: { projects: PracticalLabProject[] }) {
  return (
    <div className="lab-project-grid">
      {projects.map((project) => (
        <article className="lab-project-card" key={project.title}>
          <header>
            <p>{project.purpose}</p>
            <h3>{project.title}</h3>
          </header>
          <p>{project.projectBrief}</p>
          <DetailList title="Build steps" items={project.steps} />
          <DetailList title="Measure" items={project.measurements} />
          <DetailList title="Deliver" items={project.deliverables} />
          <DetailList title="Done when" items={project.acceptanceCriteria} />
          {project.stretchGoals ? <DetailList title="Stretch" items={project.stretchGoals} /> : null}
          {project.code ? <CodeBlock>{project.code}</CodeBlock> : null}
        </article>
      ))}
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
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

function InterviewAnswerList({ answers }: { answers: InterviewPromptAnswer[] }) {
  return (
    <div className="answer-grid">
      {answers.map((answer) => (
        <article className="answer-card" key={answer.prompt}>
          <h3>{answer.prompt}</h3>
          <p className="short-answer">{answer.shortAnswer}</p>
          <ul>
            {answer.deepAnswer.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="evidence-hook">
            <strong>Evidence hook:</strong> {answer.evidenceHook}
          </p>
        </article>
      ))}
    </div>
  );
}

function PortfolioEvidenceList({ items }: { items: PortfolioEvidenceDetail[] }) {
  return (
    <div className="evidence-grid">
      {items.map((item) => (
        <article className="evidence-card" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.artifact}</p>
          <p>
            <strong>Proves:</strong> {item.proves}
          </p>
          <DetailList title="Must include" items={item.mustInclude} />
          <p className="done-when">
            <strong>Done when:</strong> {item.doneWhen}
          </p>
        </article>
      ))}
    </div>
  );
}
