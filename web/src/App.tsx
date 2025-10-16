import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Datasets from '@/pages/Datasets';
import Exports from '@/pages/Exports';
import SettingsPage from '@/pages/SettingsPage';
import Annotation from '@/pages/Annotation';
import ProjectDetail from '@/pages/ProjectDetail';
import '@/utils/i18n';
import '@douyinfe/semi-ui/dist/css/semi.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="datasets" element={<Datasets />} />
            <Route path="exports" element={<Exports />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="annotation/:id" element={<Annotation />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
