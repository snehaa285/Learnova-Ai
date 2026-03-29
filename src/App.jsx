// File: src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Auth from './pages/Auth';
import StudyVault from './pages/StudyVault';
import VideoMode from './pages/VideoMode';
import FocusTimer from './pages/FocusTimer';
import Analytics from './pages/Analytics';
import MockTests from './pages/MockTests';
import Planner from './pages/Planner';
import Cybersecurity from './pages/Cybersecurity'; 
import Settings from './pages/Settings';

// --- PROTECTED ROUTE COMPONENT ---
// This wrapper checks if a user exists. If not, it redirects to login.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TimerProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/chatbot" element={<Chatbot />} />
                      <Route path="/vault" element={<StudyVault />} />
                      <Route path="/video-mode" element={<VideoMode />} />
                      <Route path="/video" element={<VideoMode />} />
                      <Route path="/focus" element={<FocusTimer />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/mock-tests" element={<MockTests />} />
                      <Route path="/tests" element={<MockTests />} />
                      <Route path="/planner" element={<Planner />} />
                      <Route path="/cybersecurity" element={<Cybersecurity />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </TimerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;