import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import EventSimulatorPage from "./pages/EventSimulatorPage";
import DashboardPage from "./pages/DashboardPage";
import AuditLogPage from "./pages/AuditLogPage";
import LaterQueuePage from "./pages/LaterQueuePage";
import RulesManagerPage from "./pages/RulesManagerPage";
import MetricsPage from "./pages/MetricsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/simulator" element={<EventSimulatorPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/audit" element={<AuditLogPage />} />
                <Route path="/later-queue" element={<LaterQueuePage />} />
                <Route path="/rules" element={<RulesManagerPage />} />
                <Route path="/metrics" element={<MetricsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
