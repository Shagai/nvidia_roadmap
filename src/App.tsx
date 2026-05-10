import { Navigate, Route, Routes } from "react-router-dom";
import { SharedLayout } from "./components/SharedLayout";
import { CudaKnowledgeBasePage } from "./pages/CudaKnowledgeBasePage";
import { CudaLabPage } from "./pages/CudaLabPage";
import { CudaMentalModelPage } from "./pages/CudaMentalModelPage";
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
    <Routes>
      <Route element={<SharedLayout />}>
        <Route index element={<HomePage />} />
        <Route path="why" element={<WhyFitPage />} />
        <Route path="knowledge" element={<KnowledgeIndexPage />} />
        <Route path="knowledge/:monthId" element={<MonthKnowledgePage />} />
        <Route path="cuda-kb" element={<CudaKnowledgeBasePage />} />
        <Route path="cuda-kb/mental-model" element={<CudaMentalModelPage />} />
        <Route path="skill-map" element={<SkillMapPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="cuda-lab" element={<CudaLabPage />} />
        <Route path="profiling-lab" element={<ProfilingLabPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="diary" element={<DiaryPage />} />
        <Route path="interview-prep" element={<InterviewPrepPage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
