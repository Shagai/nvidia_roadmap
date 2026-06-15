import { divergentLoopTripCounts, warpLanes } from "./data";

export function CudaWarpDivergenceFigure() {
  const maxLoopTripCount = Math.max(...divergentLoopTripCounts);

  return (
    <div className="interactive-panel launch-figure-panel divergence-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Visual model</p>
          <h3>When one warp follows more than one path</h3>
        </div>
        <div className="quality-pill quality-mixed">lane-dependent control</div>
      </div>

      <div className="divergence-example-grid">
        <section className="divergence-example" aria-labelledby="branch-divergence-title">
          <h4 id="branch-divergence-title">Branch predicate varies by lane</h4>
          <p>
            In <code>if (threadIdx.x &gt; 2)</code>, lanes 0, 1, and 2 disagree with lanes 3
            through 31. The warp must execute the taken and not-taken paths with different lane
            masks.
          </p>
          <div className="warp-lane-strip" aria-label="Lane decisions for threadIdx.x greater than 2">
            {warpLanes.map((lane) => {
              const takesBranch = lane > 2;
              return (
                <span
                  className={`warp-lane ${takesBranch ? "warp-lane-taken" : "warp-lane-skipped"}`}
                  key={lane}
                >
                  <i>{lane}</i>
                  <b>{takesBranch ? "T" : "F"}</b>
                </span>
              );
            })}
          </div>
        </section>

        <section className="divergence-example" aria-labelledby="loop-divergence-title">
          <h4 id="loop-divergence-title">Loop trip count varies by lane</h4>
          <p>
            When each lane reads its own limit, such as <code>N = a[threadIdx.x]</code>, some lanes
            leave the loop earlier. Later iterations run with only the lanes that still have work.
          </p>
          <div className="loop-divergence-grid" aria-label="Loop activity by lane and iteration">
            {divergentLoopTripCounts.map((tripCount, lane) => (
              <div className="loop-lane-column" key={lane}>
                <strong>lane {lane}</strong>
                <span>N={tripCount}</span>
                {Array.from({ length: maxLoopTripCount }, (_, iteration) => (
                  <i
                    aria-label={`iteration ${iteration}: lane ${lane} ${
                      iteration < tripCount ? "active" : "inactive"
                    }`}
                    className={iteration < tripCount ? "loop-cell-active" : "loop-cell-inactive"}
                    key={iteration}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="explanation-grid">
        <p>
          <strong>Inspection rule:</strong> if a branch or loop condition depends on a value that can
          differ across lanes in the same warp, it can diverge.
        </p>
        <p>
          <strong>Boundary rule:</strong> guards like <code>if (i &lt; n)</code> are often necessary;
          the divergence is usually limited to the final partially useful warp.
        </p>
      </div>
    </div>
  );
}
