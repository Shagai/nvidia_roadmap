const channels = [0, 1, 2];
const banks = [0, 1, 2];

export function CudaMemoryChannelBankFigure() {
  return (
    <figure
      aria-labelledby="memory-channel-bank-figure-title"
      className="interactive-panel launch-figure-panel memory-topology-figure"
    >
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Visual model</p>
          <h3 id="memory-channel-bank-figure-title">Channels carry transfers; banks prepare data</h3>
        </div>
        <div className="quality-pill quality-strong">memory topology</div>
      </div>

      <div className="memory-topology-diagram">
        <div className="memory-topology-gpu" aria-label="GPU load and store requests">
          <strong>GPU</strong>
          <span>load / store requests</span>
        </div>

        <div className="memory-topology-channels" aria-label="Memory channels and banks">
          {channels.map((channel) => (
            <section className="memory-channel-card" key={channel}>
              <header>
                <strong>Channel {channel}</strong>
                <span>independent transfer path</span>
              </header>
              <div className="channel-bus">channel bus</div>
              <div className="memory-bank-list">
                {banks.map((bank) => (
                  <span key={`${channel}-${bank}`}>
                    Bank {bank}
                    <small>prepare data</small>
                  </span>
                ))}
                <span className="memory-bank-ellipsis">...</span>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="memory-topology-rules">
        <p>
          <strong>More channels</strong>
          <span>More independent paths can move burst transfers toward the GPU.</span>
        </p>
        <p>
          <strong>More banks</strong>
          <span>More independent storage units can prepare data while a channel is busy.</span>
        </p>
      </div>
    </figure>
  );
}
