# Preparing for NVIDIA

Interactive multi-page learning diary for the plan:

**Preparing for NVIDIA: A One-Year C++/CUDA/Robotics Learning Diary**

The app is a local, static Vite + React + TypeScript project. It uses React Router for deep links and localStorage for all saved progress. There is no backend.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

## Typecheck

```bash
npm run typecheck
```

## Project structure

```text
src/
  App.tsx                         Router configuration
  data/plan.ts                    Skills, roadmap, portfolio, interview content
  state/ProgressContext.tsx       Shared localStorage-backed progress state
  utils/progress.ts               Readiness and completion calculations
  components/                     Reusable essay layout and interactive figures
  pages/                          Routed pages
  styles.css                      Distill-inspired responsive styling
```

## Pages

- `/` - Home / overview dashboard
- `/why` - Why this NVIDIA path fits
- `/knowledge` - Monthly knowledge base index
- `/knowledge/:monthId` - Month-specific curriculum guide, for example `/knowledge/2026-06`
- `/cuda-kb` - Central CUDA field guide with concepts, workflows, commands, glossary, and official sources
- `/skill-map` - Interactive readiness skill map
- `/roadmap` - May 2026 to April 2027 roadmap timeline
- `/cuda-lab` - CUDA execution visualizer
- `/profiling-lab` - GPU pipeline latency simulator
- `/portfolio` - Portfolio project board
- `/diary` - Knowledge diary
- `/interview-prep` - Interview preparation
- `/export` - Export/import/reset progress

## localStorage usage

The app writes these keys:

- `nvidia-plan-skills`
- `nvidia-plan-roadmap-progress`
- `nvidia-plan-diary`
- `nvidia-plan-portfolio`
- `nvidia-plan-theme`
- `nvidia-plan-version`

Progress is browser-local. Use the export page to generate or download a JSON snapshot before moving browsers, clearing site data, or resetting progress.

## Export/import diary data

Go to `/export` or the export section in `/diary`.

1. Click **Export JSON** or **Download JSON**.
2. Keep the JSON snapshot as a backup.
3. To restore, paste the JSON into the text area and click **Import pasted JSON**.

The reset button clears all saved skill, roadmap, diary, portfolio, and theme state after confirmation.
