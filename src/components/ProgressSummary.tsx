import { portfolioProjects } from "../data/learningPlan";
import { useProgress } from "../state/ProgressContext";
import {
  diaryCompletion,
  portfolioCompletion,
  readinessScore,
  roadmapCompletion,
} from "../utils/progress";

export function ProgressSummary() {
  const { skillLevels, roadmapProgress, diary, portfolio } = useProgress();
  const readiness = readinessScore(skillLevels);
  const roadmapStats = roadmapCompletion(roadmapProgress);
  const diaryStats = diaryCompletion(diary);
  const portfolioStats = portfolioCompletion(portfolio);

  return (
    <section className="progress-grid" aria-label="Progress summary">
      <ProgressTile label="Readiness score" value={`${readiness}%`} detail="Weighted skill estimate" />
      <ProgressTile
        label="Roadmap"
        value={`${roadmapStats.percent}%`}
        detail={`${roadmapStats.done}/${roadmapStats.total} deliverables`}
      />
      <ProgressTile
        label="Portfolio"
        value={`${portfolioStats.done}/${portfolioProjects.length}`}
        detail={`${portfolioStats.checklistDone}/${portfolioStats.checklistTotal} checklist items`}
      />
      <ProgressTile
        label="Diary"
        value={`${diaryStats.done}/${diaryStats.total}`}
        detail={`${diaryStats.percent}% months with notes`}
      />
    </section>
  );
}

function ProgressTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="progress-tile">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}
