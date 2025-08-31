import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { isUserAuthenticated } from '../firebase/auth';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);
  
  useEffect(() => {
    // Double-check authentication with both Firebase and local storage
    const checkAuthentication = async () => {
      const isValid = isUserAuthenticated();
      setValidSession(isValid);
      setChecking(false);
    };
    
    checkAuthentication();
  }, [currentUser]);
  
  // Show loading while checking authentication
  if (checking) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // If not authenticated or session is invalid, redirect to login
  if (!isAuthenticated || !validSession) {
    console.log('User not authenticated or session invalid, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated with valid session, render the protected component
  return children;
};

export default ProtectedRoute;
