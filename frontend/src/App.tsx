import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { HistoryPage } from './features/process/HistoryPage';
import { ProcessDetailPage } from './features/process/ProcessDetailPage';
import { InspectionPage } from './features/inspection/InspectionPage';
import { InspectionDetailPage } from './features/inspection/InspectionDetailPage';
import { EnvironmentLogPage } from './features/log-pages/EnvironmentLogPage';
import { SystemLogPage } from './features/log-pages/SystemLogPage';
import { CameraPage } from './features/camera/CameraPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/process" element={<Navigate to="/dashboard" replace />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:runId" element={<ProcessDetailPage />} />
        <Route path="/inspection" element={<InspectionPage />} />
        <Route path="/inspection/:inspectionId" element={<InspectionDetailPage />} />
        <Route path="/env-log" element={<EnvironmentLogPage />} />
        <Route path="/sys-log" element={<SystemLogPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
