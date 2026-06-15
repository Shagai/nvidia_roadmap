import { schedulerTimeline } from "./data";

export function CudaWarpSchedulingFigure() {
  return (
    <div className="interactive-panel launch-figure-panel scheduler-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Visual model</p>
          <h3>Latency is hidden by issuing another ready warp</h3>
        </div>
        <div className="quality-pill quality-strong">ready-warp selection</div>
      </div>

      <div className="scheduler-diagram">
        <section className="scheduler-queue" aria-labelledby="ready-queue-title">
          <h4 id="ready-queue-title">Resident warp pool</h4>
          <p>The scheduler can choose only from warps already resident on the SM.</p>
          <div className="warp-pool" aria-label="Resident warp readiness">
            <span className="warp-token warp-token-stalled">Warp 0 stalled</span>
            <span className="warp-token warp-token-ready">Warp 1 ready</span>
            <span className="warp-token warp-token-ready">Warp 2 ready</span>
            <span className="warp-token warp-token-stalled">Warp 3 stalled</span>
            <span className="warp-token warp-token-ready">Warp 4 ready</span>
            <span className="warp-token warp-token-ready">Warp 5 ready</span>
          </div>
        </section>

        <section className="scheduler-timeline" aria-labelledby="scheduler-timeline-title">
          <h4 id="scheduler-timeline-title">Issue timeline</h4>
          <div className="scheduler-timeline-rows">
            {schedulerTimeline.map((item) => (
              <article className={`scheduler-step scheduler-step-${item.tone}`} key={`${item.cycle}-${item.warp}`}>
                <strong>{item.cycle}</strong>
                <span>{item.warp}</span>
                <b>{item.instruction}</b>
                <em>{item.state}</em>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="explanation-grid">
        <p>
          <strong>Scheduling rule:</strong> an SM issues instructions from ready resident warps; a
          stalled warp simply leaves the scheduler looking for another ready warp.
        </p>
        <p>
          <strong>Latency rule:</strong> the memory operation is not faster. The waiting time is hidden
          only if enough other warps can do useful work.
        </p>
      </div>
    </div>
  );
}
