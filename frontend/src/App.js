import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import theme from './theme';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './firebase/AuthContext';
import { app } from './firebase/init';
import './responsive.css'; // Import the responsive CSS
// Note: Do not set axios.defaults.baseURL here; all API calls use getApiUrl() to avoid double prefixing

// Lazy load pages
const Clients = React.lazy(() => import('./pages/Clients'));
const Contracts = React.lazy(() => import('./pages/Contracts'));
const Devis = React.lazy(() => import('./pages/Devis'));
const Factures = React.lazy(() => import('./pages/Factures'));
const Balance = React.lazy(() => import('./pages/Balance'));
const Salary = React.lazy(() => import('./pages/Salary'));
const Miscellaneous = React.lazy(() => import('./pages/Miscellaneous'));

// Responsive Layout Component
const ResponsiveLayout = ({ children }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {children}
    </div>
  );
};



function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <ResponsiveLayout>
              <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <Clients />
                    </ProtectedRoute>
                  } />
                  <Route path="/contracts" element={
                    <ProtectedRoute>
                      <Contracts />
                    </ProtectedRoute>
                  } />
                  <Route path="/devis" element={
                    <ProtectedRoute>
                      <Devis />
                    </ProtectedRoute>
                  } />
                  <Route path="/factures" element={
                    <ProtectedRoute>
                      <Factures />
                    </ProtectedRoute>
                  } />
                  <Route path="/balance" element={
                    <ProtectedRoute>
                      <Balance />
                    </ProtectedRoute>
                  } />
                  <Route path="/salary" element={
                    <ProtectedRoute>
                      <Salary />
                    </ProtectedRoute>
                  } />
                  <Route path="/miscellaneous" element={
                    <ProtectedRoute>
                      <Miscellaneous />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 - Not Found */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </React.Suspense>
            </ResponsiveLayout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
