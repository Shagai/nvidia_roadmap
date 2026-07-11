import { lazy, useEffect, useLayoutEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SharedLayout } from "./components/SharedLayout";
import { HomePage } from "./pages/HomePage";

const CudaCcclRuntimePage = lazy(() =>
  import("./pages/CudaCcclRuntimePage").then((module) => ({ default: module.CudaCcclRuntimePage })),
);
const CudaExercisesPage = lazy(() =>
  import("./pages/CudaExercisesPage").then((module) => ({ default: module.CudaExercisesPage })),
);
const CudaKernelExamplesPage = lazy(() =>
  import("./pages/CudaKernelExamplesPage").then((module) => ({ default: module.CudaKernelExamplesPage })),
);
const CudaKernelsPage = lazy(() =>
  import("./pages/CudaKernelsPage").then((module) => ({ default: module.CudaKernelsPage })),
);
const CudaKnowledgeBasePage = lazy(() =>
  import("./pages/CudaKnowledgeBasePage").then((module) => ({ default: module.CudaKnowledgeBasePage })),
);
const CudaLabPage = lazy(() =>
  import("./pages/CudaLabPage").then((module) => ({ default: module.CudaLabPage })),
);
const CudaLaunchConfigurationPage = lazy(() =>
  import("./pages/CudaLaunchConfigurationPage").then((module) => ({
    default: module.CudaLaunchConfigurationPage,
  })),
);
const CudaMentalModelPage = lazy(() =>
  import("./pages/CudaMentalModelPage").then((module) => ({ default: module.CudaMentalModelPage })),
);
const CudaMentalModelTrapPage = lazy(() =>
  import("./pages/CudaMentalModelTrapPage").then((module) => ({
    default: module.CudaMentalModelTrapPage,
  })),
);
const CudaSharedMemoryOccupancyPage = lazy(() =>
  import("./pages/CudaSharedMemoryOccupancyPage").then((module) => ({
    default: module.CudaSharedMemoryOccupancyPage,
  })),
);
const CudaSyncthreadsPage = lazy(() =>
  import("./pages/CudaSyncthreadsPage").then((module) => ({ default: module.CudaSyncthreadsPage })),
);
const CudaThreadCoarseningPage = lazy(() =>
  import("./pages/CudaThreadCoarseningPage").then((module) => ({
    default: module.CudaThreadCoarseningPage,
  })),
);
const DiaryPage = lazy(() =>
  import("./pages/DiaryPage").then((module) => ({ default: module.DiaryPage })),
);
const ExportPage = lazy(() =>
  import("./pages/ExportPage").then((module) => ({ default: module.ExportPage })),
);
const InterviewPrepPage = lazy(() =>
  import("./pages/InterviewPrepPage").then((module) => ({ default: module.InterviewPrepPage })),
);
const KnowledgeIndexPage = lazy(() =>
  import("./pages/KnowledgeIndexPage").then((module) => ({ default: module.KnowledgeIndexPage })),
);
const MonthKnowledgePage = lazy(() =>
  import("./pages/MonthKnowledgePage").then((module) => ({ default: module.MonthKnowledgePage })),
);
const PortfolioPage = lazy(() =>
  import("./pages/PortfolioPage").then((module) => ({ default: module.PortfolioPage })),
);
const ProfilingLabPage = lazy(() =>
  import("./pages/ProfilingLabPage").then((module) => ({ default: module.ProfilingLabPage })),
);
const RoadmapPage = lazy(() =>
  import("./pages/RoadmapPage").then((module) => ({ default: module.RoadmapPage })),
);
const SkillMapPage = lazy(() =>
  import("./pages/SkillMapPage").then((module) => ({ default: module.SkillMapPage })),
);
const WhyFitPage = lazy(() =>
  import("./pages/WhyFitPage").then((module) => ({ default: module.WhyFitPage })),
);

export default function App() {
  return (
    <>
      <ScrollToRouteTarget />
      <RoutePageMetadata />
      <Routes>
        <Route element={<SharedLayout />}>
          <Route index element={<HomePage />} />
          <Route path="why" element={<WhyFitPage />} />
          <Route path="knowledge" element={<KnowledgeIndexPage />} />
          <Route path="knowledge/:monthId" element={<MonthKnowledgePage />} />
          <Route path="cuda-kb" element={<CudaKnowledgeBasePage />} />
          <Route path="cuda-kb/cccl-runtime" element={<CudaCcclRuntimePage />} />
          <Route path="cuda-kb/mental-model" element={<CudaMentalModelPage />} />
          <Route path="cuda-kb/mental-model/traps/:trapSlug" element={<CudaMentalModelTrapPage />} />
          <Route path="cuda-kb/kernels" element={<CudaKernelsPage />} />
          <Route path="cuda-kb/syncthreads" element={<CudaSyncthreadsPage />} />
          <Route path="cuda-kb/shared-memory-occupancy" element={<CudaSharedMemoryOccupancyPage />} />
          <Route path="cuda-kb/thread-coarsening" element={<CudaThreadCoarseningPage />} />
          <Route path="cuda-kb/execution-model" element={<CudaLaunchConfigurationPage />} />
          <Route path="cuda-kb/launch-configuration" element={<CudaLaunchConfigurationPage />} />
          <Route path="skill-map" element={<SkillMapPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="cuda-lab" element={<CudaLabPage />} />
          <Route path="cuda-lab/exercises" element={<CudaExercisesPage />} />
          <Route path="cuda-lab/kernel-examples" element={<CudaKernelExamplesPage />} />
          <Route path="profiling-lab" element={<ProfilingLabPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="interview-prep" element={<InterviewPrepPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

function ScrollToRouteTarget() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    const targetId = decodeHashTarget(hash);
    let animationFrameId: number | undefined;
    let observer: MutationObserver | undefined;
    let timeoutId: number | undefined;

    function scrollToTarget() {
      const target = document.getElementById(targetId);
      if (!target || target.getClientRects().length === 0) return false;

      const topbarOffset = 96;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - topbarOffset;
      window.scrollTo(0, Math.max(0, targetTop));
      return true;
    }

    function scheduleScroll() {
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = undefined;
        if (scrollToTarget()) {
          observer?.disconnect();
          observer = undefined;
        }
      });
    }

    observer = new MutationObserver(scheduleScroll);
    observer.observe(document.body, { childList: true, subtree: true });
    timeoutId = window.setTimeout(() => {
      observer?.disconnect();
      observer = undefined;
    }, 10_000);
    scheduleScroll();

    return () => {
      observer?.disconnect();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [pathname, hash]);

  return null;
}

function RoutePageMetadata() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    const mainElement = main;

    const shouldFocus = previousPath.current !== pathname;
    previousPath.current = pathname;
    let observer: MutationObserver | undefined;
    let timeoutId: number | undefined;

    function applyMetadata() {
      const heading = mainElement.querySelector("h1");
      const headingText = heading?.textContent?.trim();
      if (!headingText) return false;

      document.title = `${headingText} | Preparing for NVIDIA`;
      if (shouldFocus) {
        mainElement.focus({ preventScroll: true });
      }
      return true;
    }

    if (!applyMetadata()) {
      observer = new MutationObserver(() => {
        if (applyMetadata()) {
          observer?.disconnect();
          observer = undefined;
        }
      });
      observer.observe(mainElement, { childList: true, subtree: true });
      timeoutId = window.setTimeout(() => {
        observer?.disconnect();
        observer = undefined;
      }, 10_000);
    }

    return () => {
      observer?.disconnect();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  return null;
}

function decodeHashTarget(hash: string) {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}
