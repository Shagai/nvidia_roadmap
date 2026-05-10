import { portfolioProjects } from "../data/plan";
import { useProgress } from "../state/ProgressContext";
import type { PortfolioStatus } from "../types";

const statusLabels: Record<PortfolioStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  done: "Done",
};

export function PortfolioBoard() {
  const { portfolio, setPortfolioStatus, setPortfolioChecklistItem, setPortfolioNotes } = useProgress();

  return (
    <div className="portfolio-board">
      {portfolioProjects.map((project, index) => {
        const progress = portfolio[project.id];
        return (
          <article className="portfolio-card" key={project.id}>
            <header>
              <span>{index + 1}</span>
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </header>
            <label className="status-control">
              Status
              <select
                value={progress.status}
                onChange={(event) => setPortfolioStatus(project.id, event.target.value as PortfolioStatus)}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="checklist">
              {project.checklist.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={Boolean(progress.checklist[item])}
                    onChange={(event) =>
                      setPortfolioChecklistItem(project.id, item, event.target.checked)
                    }
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <label className="stacked-field">
              Notes
              <textarea
                value={progress.notes}
                onChange={(event) => setPortfolioNotes(project.id, event.target.value)}
                placeholder="Evidence, repo links, benchmark targets, next commits..."
              />
            </label>
          </article>
        );
      })}
    </div>
  );
}
