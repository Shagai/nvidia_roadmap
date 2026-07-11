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

## Test and run all checks

```bash
npm test
npm run check
```

`npm run check` runs the test suite, TypeScript validation, and the production build. Pull requests run the same command in GitHub Actions, and deployments run the tests before publishing.

## Project structure

```text
src/
  App.tsx                         Router configuration
  data/learningPlan/              Skills, roadmap, portfolio, interview content
  data/cudaKnowledge/             CUDA field-guide content and sources
  state/ProgressContext.tsx       Shared localStorage-backed progress state
  state/progressData.ts           Runtime validation and progress-data defaults
  utils/progress.ts               Readiness and completion calculations
  components/                     Reusable essay layout and interactive figures
  pages/                          Routed pages
  styles/                         Distill-inspired responsive styling
```

## Pages

- `/` - Home / overview dashboard
- `/why` - Why this NVIDIA path fits
- `/knowledge` - Monthly knowledge base index
- `/knowledge/:monthId` - Month-specific curriculum guide, for example `/knowledge/2026-06`
- `/cuda-kb` - Central CUDA field guide with concepts, workflows, commands, glossary, and official sources
- `/cuda-kb/cccl-runtime` - Modern CCCL runtime and `cuda::launch` guide
- `/cuda-kb/mental-model` - Deep CUDA mental-model pillar with CPU/GPU boundary practice and traps
- `/cuda-kb/kernels` - Kernel design and execution guide
- `/cuda-kb/syncthreads` - Block synchronization deep dive
- `/cuda-kb/shared-memory-occupancy` - Shared-memory and occupancy tradeoffs
- `/cuda-kb/thread-coarsening` - Thread-coarsening guide
- `/cuda-kb/execution-model` - CUDA launch and execution-model article
- `/skill-map` - Interactive readiness skill map
- `/roadmap` - May 2026 to April 2027 roadmap timeline
- `/cuda-lab` - CUDA execution visualizer
- `/cuda-lab/exercises` - Question-first CUDA exercise notebook
- `/cuda-lab/kernel-examples` - Worked CUDA kernel examples
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
