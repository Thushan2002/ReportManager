import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth.js'
import { Loader } from './components/Loader.jsx'
import { AppShell } from './components/AppShell.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Loader fullScreen label="Restoring your workspace" />
  return user ? <AppShell /> : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Loader fullScreen label="Loading ReportManager" />
  return user ? <Navigate to="/" replace /> : children
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App