export function CudaMemoryLatencyFigure() {
  return (
    <figure
      aria-labelledby="memory-latency-figure-title"
      className="interactive-panel launch-figure-panel memory-latency-figure"
    >
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Visual model</p>
          <h3 id="memory-latency-figure-title">Latency is not removed, it is overlapped</h3>
        </div>
        <div className="quality-pill quality-strong">SM + DRAM overlap</div>
      </div>

      <div className="memory-latency-stack">
        <section className="memory-latency-card" aria-labelledby="single-request-title">
          <h4 id="single-request-title">One global-memory request</h4>
          <p>A single request still spends most of its time waiting for DRAM cells.</p>
          <div className="memory-latency-scroll">
            <div className="memory-latency-row">
              <strong>Latency</strong>
              <div className="memory-latency-track" aria-label="DRAM access latency followed by burst data">
                <span className="latency-segment latency-segment-wait wait-long">
                  activate / read DRAM cells
                </span>
                <span className="latency-segment latency-segment-transfer transfer-short">burst data</span>
              </div>
            </div>
            <div className="memory-latency-row">
              <strong>Bus use</strong>
              <div className="memory-latency-track" aria-label="Bus idle time followed by transfer">
                <span className="latency-segment latency-segment-idle wait-long">idle bus</span>
                <span className="latency-segment latency-segment-bus transfer-short">transfer</span>
              </div>
            </div>
          </div>
        </section>

        <section className="memory-latency-card" aria-labelledby="overlap-title">
          <h4 id="overlap-title">Latency hiding</h4>
          <p>The wait remains, but useful warp work and DRAM preparation fill the gaps.</p>
          <div className="memory-latency-scroll">
            <div className="memory-latency-row">
              <strong>SM side</strong>
              <div className="memory-latency-track" aria-label="Warp scheduler switches from a waiting warp to ready warps">
                <span className="latency-segment latency-segment-wait sm-warp-0">
                  Warp 0 waits
                  <small>global load pending</small>
                </span>
                <span className="latency-segment latency-segment-issue sm-warp-1">Warp 1 issues</span>
                <span className="latency-segment latency-segment-issue sm-warp-2">Warp 2 issues</span>
                <span className="latency-segment latency-segment-issue sm-warp-3">Warp 3 issues</span>
              </div>
            </div>

            <div className="memory-latency-row">
              <strong>DRAM side</strong>
              <div className="memory-bank-grid" aria-label="Banks prepare while another bank transfers">
                <span className="memory-bank-label memory-bank-label-1">Bank 1</span>
                <span className="latency-segment latency-segment-wait bank-1-prepare">prepare</span>
                <span className="latency-segment latency-segment-transfer bank-1-transfer">transfer</span>

                <span className="memory-bank-label memory-bank-label-0">Bank 0</span>
                <span className="latency-segment latency-segment-wait bank-0-prepare">prepare</span>
                <span className="latency-segment latency-segment-transfer bank-0-transfer">transfer</span>

                <span className="memory-bank-label memory-bank-label-bus">Channel bus</span>
                <span className="latency-segment latency-segment-bus bus-bank-1">Bank 1 burst</span>
                <span className="latency-segment latency-segment-bus bus-bank-0">Bank 0 burst</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <figcaption className="memory-latency-caption">
        The gray waits still exist. Performance improves when ready warps keep the SM busy and
        bank/channel overlap keeps transfer bursts arriving.
      </figcaption>
    </figure>
  );
}
