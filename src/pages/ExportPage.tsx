import { CodeBlock } from "../components/CodeBlock";
import { EssayLayout } from "../components/EssayLayout";
import { ExportImportPanel } from "../components/ExportImportPanel";
import { Section } from "../components/Section";

export function ExportPage() {
  return (
    <EssayLayout
      eyebrow="Local data"
      title="Export/import progress"
      dek="Move the local knowledge diary between browsers, make backups, or reset the plan."
      toc={[
        { id: "storage", label: "Storage keys" },
        { id: "panel", label: "Export/import" },
      ]}
    >
      <Section id="storage" title="How data is stored">
        <p>
          This app has no backend. Progress lives in localStorage under the requested keys:
          skills, roadmap progress, diary, portfolio, theme, and version. Export JSON is the portable
          snapshot.
        </p>
        <CodeBlock language="text" title="Local storage keys" wrap>{`nvidia-plan-skills
nvidia-plan-roadmap-progress
nvidia-plan-diary
nvidia-plan-portfolio
nvidia-plan-theme
nvidia-plan-version`}</CodeBlock>
      </Section>

      <Section id="panel" title="Export/import panel">
        <ExportImportPanel />
      </Section>
    </EssayLayout>
  );
}
