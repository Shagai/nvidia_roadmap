import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { roadmap } from "../data/learningPlan";
import { useProgress } from "../state/ProgressContext";
import { roadmapCompletion, roadmapItemKey } from "../utils/progress";

const filters = ["CUDA", "C++", "Robotics", "AI inference", "Interview", "Portfolio"];

export function RoadmapTimeline() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { roadmapProgress, setRoadmapItem } = useProgress();
  const stats = roadmapCompletion(roadmapProgress);
  const visibleMonths = useMemo(() => {
    if (activeFilter === "All") {
      return roadmap;
    }
    return roadmap.filter((month) => month.tags.includes(activeFilter));
  }, [activeFilter]);

  return (
    <div className="interactive-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 2</p>
          <h3>12-month roadmap timeline</h3>
        </div>
        <div className="readiness-score">
          <span>{stats.percent}%</span>
          <small>{stats.done}/{stats.total} deliverables</small>
        </div>
      </div>

      <div className="filter-row" role="group" aria-label="Roadmap filters">
        {["All", ...filters].map((filter) => (
          <button
            key={filter}
            aria-pressed={filter === activeFilter}
            className={filter === activeFilter ? "chip active" : "chip"}
            type="button"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="timeline">
        {visibleMonths.map((month) => (
          <article className="month-card" key={month.id}>
            <header>
              <p>{month.month}</p>
              <h4>{month.title}</h4>
              <span>{month.goal}</span>
            </header>
            <div className="tag-row">
              {month.tags.map((tag) => (
                <small key={tag}>{tag}</small>
              ))}
            </div>
            <div className="month-columns">
              <div>
                <h5>Topics</h5>
                <ul>
                  {month.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5>Deliverables</h5>
                <div className="checklist">
                  {month.deliverables.map((deliverable) => {
                    const key = roadmapItemKey(month.id, deliverable);
                    return (
                      <label key={deliverable}>
                        <input
                          type="checkbox"
                          checked={Boolean(roadmapProgress[key])}
                          onChange={(event) => setRoadmapItem(key, event.target.checked)}
                        />
                        <span>{deliverable}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <details>
              <summary>Acceptance criteria</summary>
              <ul>
                {month.acceptanceCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
            <Link className="month-guide-link" to={`/knowledge/${month.id}`}>
              Open month knowledge guide
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
