import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import PageLayout from '@/components/Layout/MainLayout';
import Console from '@/pages/Console';
import Projects from '@/pages/Projects';
import Datasets from '@/pages/Datasets';
import Exports from '@/pages/Exports';
import SettingsPage from '@/pages/SettingsPage';
import Annotation from '@/pages/Annotation';
import ProjectDetail from '@/pages/ProjectDetail';
import '@/utils/i18n';

function AppContent() {
  const { resolvedTheme } = useTheme();

  // Create MUI theme dynamically based on current theme
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme === 'dark' ? 'dark' : 'light',
        },
      }),
    [resolvedTheme]
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PageLayout />}>
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
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
