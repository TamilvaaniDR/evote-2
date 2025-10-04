import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { VoterProvider } from './contexts/VoterContext';
import AdminLayout from './components/Layout/AdminLayout';
// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LoginForm from './components/Auth/LoginForm';

import Dashboard from './pages/Admin/Dashboard';
import Elections from './pages/Admin/Elections';
import Voters from './pages/Admin/Voters';
import AllVoters from './pages/Admin/AllVoters';
import AdminResults from './pages/Admin/Results';
import ElectionDetail from './pages/Admin/ElectionDetail';
import AuditLogs from './pages/Admin/AuditLogs';
import Imports from './pages/Admin/Imports';
import VoterHome from './pages/Voter/VoterHome';
import VotePage from './pages/Voter/VotePage';
import ResultsPage from './pages/Voter/ResultsPage';
import ResultsIndex from './pages/Voter/ResultsIndex';
import VoteSuccess from './pages/Voter/VoteSuccess';
import VoterDashboard from './pages/Voter/VoterDashboard';
import VoterLayout from './components/Layout/VoterLayout';
import VoterLogout from './pages/Voter/Logout';
import VoterElections from './pages/Voter/Elections';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Accessibility from './pages/Accessibility';
import Contact from './pages/Contact';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e88e5',
      dark: '#1565c0',
      light: '#42a5f5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8e24aa',
      dark: '#6a1b9a',
      light: '#ba68c8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    info: { main: '#0288d1' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 6px 18px rgba(30,136,229,0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(21,101,192,0.15)'
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

// Note: Voter pages are public entry points guarded by server-side eligibility/OTP.

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <VoterProvider>
          <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Redirect generic vote/results routes to appropriate pages */}
            <Route path="/vote" element={<Navigate to="/dashboard" />} />
            <Route path="/results" element={<Navigate to="/dashboard" />} />

            {/* Admin login */}
            <Route path="/admin/login" element={<LoginForm />} />
            {/* Voter routes */}
            <Route path="/dashboard" element={<VoterLayout><VoterHome /></VoterLayout>} />
            {/* Backward compatibility */}
            <Route path="/home" element={<Navigate to="/dashboard" />} />
            {/* Public info */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<VoterLayout><VoterDashboard /></VoterLayout>} />
            <Route path="/elections" element={<VoterLayout><VoterElections /></VoterLayout>} />
            <Route path="/results-index" element={<VoterLayout><ResultsIndex /></VoterLayout>} />
            <Route path="/logout" element={<VoterLogout />} />
            <Route path="/vote/:electionId" element={<VotePage />} />
            <Route path="/results/:electionId" element={<ResultsPage />} />
            <Route path="/vote/success" element={<VoteSuccess />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/elections"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Elections />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/voters"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Voters />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/all-voters"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AllVoters />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/results"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminResults />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/elections/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ElectionDetail />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AuditLogs />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/imports"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Imports />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </Router>
        </VoterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;