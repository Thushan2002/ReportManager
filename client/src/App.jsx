import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import { Loader } from "./components/loader/Loader.jsx";
import { AppShell } from "./components/app-shell/AppShell.jsx";
import { LoginPage } from "./pages/auth/LoginPage.jsx";
import { RegisterPage } from "./pages/auth/RegisterPage.jsx";
import { DashboardPage } from "./pages/dashboard/DashboardPage.jsx";
import { InviteUserPanel } from "./pages/invite-user-panel/InviteUserPanel.jsx";

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
        <Route path="/invite" element={<InviteUserPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
