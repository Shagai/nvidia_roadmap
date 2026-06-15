import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaFundamentalsInterviewAnswers } from "../data/cudaFundamentals";
import { explanationDrills, interviewStories } from "../data/learningPlan";

const algorithmTopics = [
  "Arrays/strings",
  "Hash maps",
  "Trees/graphs",
  "Dynamic programming basics",
  "Sliding window",
  "Heaps",
  "LRU cache",
  "Bit operations",
];

const systemsTopics = [
  "Ownership and lifetime",
  "Move semantics",
  "Undefined behavior",
  "Atomics and memory model",
  "Thread-safe queue",
  "Producer-consumer pipeline",
  "Cache locality",
  "CMake and sanitizers",
];

export function InterviewPrepPage() {
  return (
    <EssayLayout
      eyebrow="Interview readiness"
      title="Interview preparation"
      dek="Translate the year of work into technical stories, coding speed, systems clarity, and CUDA performance explanations."
      toc={[
        { id: "cadence", label: "Cadence" },
        { id: "topics", label: "Topics" },
        { id: "stories", label: "Stories" },
        { id: "drills", label: "Drills" },
        { id: "cuda-fundamentals", label: "CUDA answers" },
      ]}
    >
      <Section id="cadence" title="Weekly cadence">
        <p>
          January through April should feel like rehearsal, not discovery. Keep the rhythm simple:
          algorithm problems, C++ systems problems, concurrency problems, and CUDA explanation drills.
        </p>
        <Callout title="Interview intuition">
          The goal is not to recite definitions. The goal is to connect a concept to a bug,
          bottleneck, design decision, or portfolio artifact.
        </Callout>
      </Section>

      <Section id="topics" title="Coding and systems topics">
        <div className="two-column-list">
          <div>
            <h3>Algorithms</h3>
            <ul>
              {algorithmTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>C++ systems</h3>
            <ul>
              {systemsTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="stories" title="Technical stories">
        <div className="card-grid compact">
          {interviewStories.map((story) => (
            <article className="mini-card" key={story}>
              <strong>{story}</strong>
              <span>Situation, tradeoff, action, measured result, lesson.</span>
            </article>
          ))}
        </div>
      </Section>

      <Section id="drills" title="CUDA/performance explanation drills">
        <ul className="pill-list">
          {explanationDrills.map((drill) => (
            <li key={drill}>{drill}</li>
          ))}
        </ul>
        <CodeBlock>{`mock loop:
4 C++ interviews
4 algorithms interviews
3 system design interviews
3 CUDA/performance interviews
2 behavioral interviews`}</CodeBlock>
      </Section>

      <Section
        id="cuda-fundamentals"
        title="CUDA fundamentals prompt answers"
        note="Use the short answer first, then tie it back to measured project evidence."
      >
        <div className="answer-grid compact-answers">
          {cudaFundamentalsInterviewAnswers.map((answer) => (
            <article className="answer-card" key={answer.prompt}>
              <h3>{answer.prompt}</h3>
              <p className="short-answer">{answer.shortAnswer}</p>
              <ul>
                {answer.deepAnswer.slice(0, 2).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="evidence-hook">
                <strong>Evidence hook:</strong> {answer.evidenceHook}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </EssayLayout>
  );
}
