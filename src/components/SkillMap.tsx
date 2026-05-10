import { skills } from "../data/plan";
import { useProgress } from "../state/ProgressContext";
import { readinessScore } from "../utils/progress";

const categoryColors: Record<string, string> = {
  systems: "var(--skill-systems)",
  gpu: "var(--skill-gpu)",
  performance: "var(--skill-performance)",
  "ai-inference": "var(--skill-ai)",
  robotics: "var(--skill-robotics)",
  architecture: "var(--skill-architecture)",
  interview: "var(--skill-interview)",
};

export function SkillMap() {
  const { skillLevels, setSkillLevel } = useProgress();
  const score = readinessScore(skillLevels);

  return (
    <div className="interactive-panel skill-map-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 1</p>
          <h3>Interactive NVIDIA readiness skill map</h3>
        </div>
        <div className="readiness-score" aria-label={`NVIDIA readiness score ${score} percent`}>
          <span>{score}%</span>
          <small>NVIDIA readiness</small>
        </div>
      </div>

      <div className="skill-map-grid">
        <RadarChart levels={skillLevels} />
        <div className="slider-stack">
          {skills.map((skill) => (
            <label key={skill.id} className="skill-slider">
              <span>
                <strong>{skill.label}</strong>
                <em>{skillLevels[skill.id] ?? 0}/5</em>
              </span>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={skillLevels[skill.id] ?? 0}
                onChange={(event) => setSkillLevel(skill.id, Number(event.target.value))}
              />
              <i
                aria-hidden="true"
                style={{
                  width: `${((skillLevels[skill.id] ?? 0) / 5) * 100}%`,
                  background: categoryColors[skill.category],
                }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function RadarChart({ levels }: { levels: Record<string, number> }) {
  const center = 140;
  const radius = 110;
  const points = skills.map((skill, index) => {
    const angle = -Math.PI / 2 + (index / skills.length) * Math.PI * 2;
    const levelRadius = radius * ((levels[skill.id] ?? 0) / 5);
    return {
      outerX: center + Math.cos(angle) * radius,
      outerY: center + Math.sin(angle) * radius,
      x: center + Math.cos(angle) * levelRadius,
      y: center + Math.sin(angle) * levelRadius,
      labelX: center + Math.cos(angle) * (radius + 24),
      labelY: center + Math.sin(angle) * (radius + 24),
      label: skill.label,
      category: skill.category,
    };
  });

  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const rings = [1, 2, 3, 4, 5].map((ring) => {
    const ringRadius = radius * (ring / 5);
    return skills
      .map((_, index) => {
        const angle = -Math.PI / 2 + (index / skills.length) * Math.PI * 2;
        return `${center + Math.cos(angle) * ringRadius},${center + Math.sin(angle) * ringRadius}`;
      })
      .join(" ");
  });

  return (
    <figure className="radar-figure" aria-label="Radar chart of skill readiness">
      <svg viewBox="0 0 280 280" role="img">
        <title>Weighted skill radar chart</title>
        {rings.map((ring) => (
          <polygon key={ring} points={ring} className="radar-ring" />
        ))}
        {points.map((point) => (
          <line
            key={point.label}
            x1={center}
            y1={center}
            x2={point.outerX}
            y2={point.outerY}
            className="radar-axis"
          />
        ))}
        <polygon points={polygon} className="radar-fill" />
        {points.map((point) => (
          <circle
            key={`${point.label}-dot`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={categoryColors[point.category]}
          />
        ))}
      </svg>
      <figcaption>
        The score is approximate. It weights CUDA, profiling, architecture, and C++ systems more heavily
        because those are stronger signals for this target path.
      </figcaption>
    </figure>
  );
}
