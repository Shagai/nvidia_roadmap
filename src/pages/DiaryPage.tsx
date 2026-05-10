import { Callout } from "../components/Callout";
import { EssayLayout } from "../components/EssayLayout";
import { ExportImportPanel } from "../components/ExportImportPanel";
import { KnowledgeDiary } from "../components/KnowledgeDiary";
import { Section } from "../components/Section";

export function DiaryPage() {
  return (
    <EssayLayout
      eyebrow="Personal knowledge base"
      title="Knowledge diary"
      dek="Capture what changed in understanding, what still feels unclear, and the next action for each month."
      toc={[
        { id: "habit", label: "Diary habit" },
        { id: "diary", label: "Monthly diary" },
        { id: "backup", label: "Backup" },
      ]}
    >
      <Section id="habit" title="Diary habit">
        <p>
          The diary is where the plan becomes personal. Write small entries after each study block:
          what I tried, what I measured, what confused me, and what I will do next.
        </p>
        <Callout title="Common trap" tone="warning">
          Do not only paste links. The valuable part is the explanation in my own words.
        </Callout>
      </Section>

      <Section id="diary" title="Monthly diary">
        <KnowledgeDiary />
      </Section>

      <Section id="backup" title="Export/import">
        <ExportImportPanel />
      </Section>
    </EssayLayout>
  );
}
