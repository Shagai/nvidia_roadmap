import type { Exercise } from "../data/cudaExerciseNotebook";
import { CodeBlock } from "./CodeBlock";

export function ExerciseTile({ exercise }: { exercise: Exercise }) {
  return (
    <article className="exercise-card">
      <header>
        <p>Question</p>
        <h3>{exercise.title}</h3>
      </header>
      <p className="exercise-question">{exercise.question}</p>
      <div className="exercise-solution">
        <p className="exercise-label">Solution</p>
        <p className="exercise-answer">{exercise.answer}</p>
        {exercise.explanation ? (
          <ul className="exercise-explanation">
            {exercise.explanation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {exercise.facts ? (
          <ul className="exercise-result-list">
            {exercise.facts.map((fact) => (
              <li key={fact.label}>
                <strong>{fact.label}</strong>
                <span>{fact.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {exercise.code ? <CodeBlock>{exercise.code}</CodeBlock> : null}
      </div>
    </article>
  );
}
