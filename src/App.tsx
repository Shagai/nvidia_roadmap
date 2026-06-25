import { useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SharedLayout } from "./components/SharedLayout";
import { CudaExercisesPage } from "./pages/CudaExercisesPage";
import { CudaKernelsPage } from "./pages/CudaKernelsPage";
import { CudaKnowledgeBasePage } from "./pages/CudaKnowledgeBasePage";
import { CudaLabPage } from "./pages/CudaLabPage";
import { CudaLaunchConfigurationPage } from "./pages/CudaLaunchConfigurationPage";
import { CudaMentalModelPage } from "./pages/CudaMentalModelPage";
import { CudaMentalModelTrapPage } from "./pages/CudaMentalModelTrapPage";
import { CudaSharedMemoryOccupancyPage } from "./pages/CudaSharedMemoryOccupancyPage";
import { CudaSyncthreadsPage } from "./pages/CudaSyncthreadsPage";
import { DiaryPage } from "./pages/DiaryPage";
import { ExportPage } from "./pages/ExportPage";
import { HomePage } from "./pages/HomePage";
import { InterviewPrepPage } from "./pages/InterviewPrepPage";
import { KnowledgeIndexPage } from "./pages/KnowledgeIndexPage";
import { MonthKnowledgePage } from "./pages/MonthKnowledgePage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ProfilingLabPage } from "./pages/ProfilingLabPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { SkillMapPage } from "./pages/SkillMapPage";
import { WhyFitPage } from "./pages/WhyFitPage";

export default function App() {
  return (
    <>
      <ScrollToRouteTarget />
      <Routes>
        <Route element={<SharedLayout />}>
          <Route index element={<HomePage />} />
          <Route path="why" element={<WhyFitPage />} />
          <Route path="knowledge" element={<KnowledgeIndexPage />} />
          <Route path="knowledge/:monthId" element={<MonthKnowledgePage />} />
          <Route path="cuda-kb" element={<CudaKnowledgeBasePage />} />
          <Route path="cuda-kb/mental-model" element={<CudaMentalModelPage />} />
          <Route path="cuda-kb/mental-model/traps/:trapSlug" element={<CudaMentalModelTrapPage />} />
          <Route path="cuda-kb/kernels" element={<CudaKernelsPage />} />
          <Route path="cuda-kb/syncthreads" element={<CudaSyncthreadsPage />} />
          <Route path="cuda-kb/shared-memory-occupancy" element={<CudaSharedMemoryOccupancyPage />} />
          <Route path="cuda-kb/execution-model" element={<CudaLaunchConfigurationPage />} />
          <Route path="cuda-kb/launch-configuration" element={<CudaLaunchConfigurationPage />} />
          <Route path="skill-map" element={<SkillMapPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="cuda-lab" element={<CudaLabPage />} />
          <Route path="cuda-lab/exercises" element={<CudaExercisesPage />} />
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
    let attempts = 0;
    let timeoutId: number | undefined;

    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    function scrollToTarget() {
      const targetId = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(targetId);
      if (!target) return false;

      target.scrollIntoView();
      return true;
    }

    function tryScroll() {
      scrollToTarget();

      attempts += 1;
      if (attempts < 12) {
        timeoutId = window.setTimeout(tryScroll, 50);
      }
    }

    tryScroll();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname, hash]);

  return null;
}
