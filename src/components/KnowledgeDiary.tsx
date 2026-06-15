import { useState } from "react";
import { roadmap } from "../data/learningPlan";
import { useProgress } from "../state/ProgressContext";

export function KnowledgeDiary() {
  const [monthId, setMonthId] = useState(roadmap[0].id);
  const { diary, setDiaryEntry } = useProgress();
  const month = roadmap.find((item) => item.id === monthId) ?? roadmap[0];
  const entry = diary[month.id];

  function update(field: keyof typeof entry, value: string) {
    setDiaryEntry(month.id, { ...entry, [field]: value });
  }

  return (
    <div className="interactive-panel diary-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 5</p>
          <h3>Knowledge diary</h3>
        </div>
        <label className="compact-select">
          Month
          <select value={monthId} onChange={(event) => setMonthId(event.target.value)}>
            {roadmap.map((item) => (
              <option key={item.id} value={item.id}>
                {item.month}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="diary-context">
        <strong>{month.title}</strong>
        <p>{month.goal}</p>
      </div>

      <div className="diary-fields">
        <DiaryField
          label="Notes"
          value={entry.notes}
          onChange={(value) => update("notes", value)}
          placeholder="Raw notes, commands, ideas, observations..."
        />
        <DiaryField
          label="What I learned"
          value={entry.learned}
          onChange={(value) => update("learned", value)}
          placeholder="New concepts, mental models, tradeoffs..."
        />
        <DiaryField
          label="What confused me"
          value={entry.confused}
          onChange={(value) => update("confused", value)}
          placeholder="Questions to resolve with docs, experiments, or interview drills..."
        />
        <DiaryField
          label="Links/resources"
          value={entry.links}
          onChange={(value) => update("links", value)}
          placeholder="Docs, papers, repos, articles, videos..."
        />
        <DiaryField
          label="Next actions"
          value={entry.nextActions}
          onChange={(value) => update("nextActions", value)}
          placeholder="Concrete tasks for the next study block..."
        />
      </div>
    </div>
  );
}

function DiaryField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="stacked-field">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
