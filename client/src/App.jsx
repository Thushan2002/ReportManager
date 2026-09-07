import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import { Loader } from "./components/loader/Loader.jsx";
import { AppShell } from "./components/app-shell/AppShell.jsx";
import { LoginPage } from "./pages/auth/LoginPage.jsx";
import { RegisterPage } from "./pages/auth/RegisterPage.jsx";
import { DashboardPage } from "./pages/dashboard/DashboardPage.jsx";
import { InviteUserPanel } from "./pages/invite-user-panel/InviteUserPanel.jsx";
import { ReportEditor } from "./pages/reports/ReportEditor.jsx";
import { ReportHistoryPage } from "./pages/reports/ReportHistoryPage.jsx";
import { ReportDetailPage } from "./pages/reports/ReportDetailPage.jsx";
import { ProjectsPage } from "./pages/projects/ProjectsPage.jsx";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader fullScreen label="Restoring your workspace" />;
  return user ? <AppShell /> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader fullScreen label="Loading ReportManager" />;
  return user ? <Navigate to="/" replace /> : children;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reports/new" element={<ReportEditor />} />
        <Route path="/reports/history" element={<ReportHistoryPage />} />
        <Route path="/reports/:id/edit" element={<ReportEditor />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/invite" element={<InviteUserPanel />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
