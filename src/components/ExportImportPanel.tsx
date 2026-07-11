import { useMemo, useState } from "react";
import { useProgress } from "../state/ProgressContext";
import { parseProgressImport } from "../state/progressData";

export function ExportImportPanel() {
  const { exportProgress, importProgress, resetProgress } = useProgress();
  const [buffer, setBuffer] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const latestExport = useMemo(() => JSON.stringify(exportProgress(), null, 2), [exportProgress]);

  function handleExport() {
    setBuffer(JSON.stringify(exportProgress(), null, 2));
    setMessage("Export JSON generated.");
  }

  function handleDownload() {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nvidia-learning-diary-progress.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Progress JSON download started.");
  }

  function handleImport() {
    try {
      const parsed = parseProgressImport(JSON.parse(buffer ?? latestExport) as unknown);
      if (!parsed.ok) {
        setMessage(parsed.message);
        return;
      }

      importProgress(parsed.value);
      setMessage("Progress imported.");
    } catch {
      setMessage("Import failed. Paste valid exported JSON.");
    }
  }

  function handleReset() {
    if (window.confirm("Reset all NVIDIA preparation progress stored in this browser?")) {
      resetProgress();
      setBuffer(null);
      setMessage("Progress reset.");
    }
  }

  return (
    <div className="interactive-panel export-panel">
      <div className="figure-header">
        <div>
          <p className="figure-kicker">Figure 6</p>
          <h3>Export and import progress</h3>
        </div>
      </div>
      <p>
        Progress is saved in this browser with localStorage keys for skills, roadmap deliverables,
        diary entries, portfolio state, theme, and version. Export JSON before switching browsers or
        resetting local data.
      </p>
      <div className="button-row">
        <button type="button" onClick={handleExport}>
          Export JSON
        </button>
        <button type="button" onClick={handleDownload}>
          Download JSON
        </button>
        <button type="button" className="danger-button" onClick={handleReset}>
          Reset progress
        </button>
      </div>
      <label className="stacked-field">
        Progress JSON
        <textarea
          value={buffer ?? latestExport}
          onChange={(event) => setBuffer(event.target.value)}
          spellCheck={false}
        />
      </label>
      <div className="button-row">
        <button type="button" onClick={handleImport}>
          Import pasted JSON
        </button>
        {message ? <span className="form-message" role="status">{message}</span> : null}
      </div>
    </div>
  );
}
