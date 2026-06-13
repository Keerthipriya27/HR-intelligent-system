import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Attribution } from './pages/Attribution';
import { Employees } from './pages/Employees';
import { Anomalies } from './pages/Anomalies';
import { Insights } from './pages/Insights';
import { Forecasting } from './pages/Forecasting';
import { AIAssistant } from './pages/AIAssistant';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifyTOTP } from './pages/VerifyTOTP';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-totp" element={<VerifyTOTP />} />

            {/* Protected app routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="attribution" element={<Attribution />} />
              <Route path="employees" element={<Employees />} />
              <Route path="anomalies" element={<Anomalies />} />
              <Route path="insights" element={<Insights />} />
              <Route path="forecasting" element={<Forecasting />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
