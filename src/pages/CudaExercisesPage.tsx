import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { ExerciseTile } from "../components/ExerciseTile";
import { Section } from "../components/Section";
import { sections, shareUrl } from "../data/cudaExerciseNotebook";

export function CudaExercisesPage() {
  return (
    <EssayLayout
      eyebrow="CUDA exercise notebook"
      title="Solved CUDA exercises"
      dek="Questions and solutions are paired one after another so the problem statement is visible before each answer."
      toc={[
        { id: "overview", label: "Overview" },
        { id: "indexing", label: "Indexing" },
        { id: "runtime-api", label: "Runtime API" },
        { id: "matrix", label: "Matrix kernels" },
        { id: "geometry", label: "Geometry" },
        { id: "memory", label: "Memory model" },
        { id: "shared-memory-tiling", label: "Shared memory" },
        { id: "warps", label: "Warps" },
        { id: "occupancy", label: "Occupancy" },
      ]}
    >
      <Section id="overview" title="Format">
        <Callout title="Source">
          These notes are condensed from the shared CUDA exercise chat. The original transcript is
          available at{" "}
          <a href={shareUrl} target="_blank" rel="noreferrer">
            this ChatGPT share
          </a>
          .
        </Callout>
        <p>
          Each tile below is stacked full-width and follows the same order: question first, direct
          solution second, then the supporting calculation or code.
        </p>
      </Section>

      {sections.map((section) => (
        <Section id={section.id} title={section.title} key={section.id}>
          <div className="exercise-list">
            {section.exercises.map((exercise) => (
              <ExerciseTile exercise={exercise} key={exercise.title} />
            ))}
          </div>
        </Section>
      ))}

      <Section id="next" title="Related study page">
        <p>
          For the broader execution model behind these calculations, use the{" "}
          <Link to="/cuda-kb/execution-model">CUDA execution model guide</Link>.
        </p>
      </Section>
    </EssayLayout>
  );
}
