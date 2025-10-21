import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MainLayout from '@/components/Layout/MainLayout';
import Console from '@/pages/Console';
import Projects from '@/pages/Projects';
import Datasets from '@/pages/Datasets';
import Exports from '@/pages/Exports';
import SettingsPage from '@/pages/SettingsPage';
import Annotation from '@/pages/Annotation';
import ProjectDetail from '@/pages/ProjectDetail';
import '@/utils/i18n';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/console" replace />} />
          <Route path="console" element={<Console />} />
          <Route path="console/projects" element={<Projects />} />
          <Route path="console/projects/:id" element={<ProjectDetail />} />
          <Route path="console/datasets" element={<Datasets />} />
          <Route path="console/exports" element={<Exports />} />
          <Route path="console/settings" element={<SettingsPage />} />
          <Route path="console/annotation/:id" element={<Annotation />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
