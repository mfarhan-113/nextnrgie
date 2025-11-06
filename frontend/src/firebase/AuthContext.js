import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { CircularProgress, Box } from '@mui/material';
import { isUserAuthenticated, logoutUser } from './auth';
import { auth } from './init';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);
  const inactivityTimer = useRef(null);
  const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // Verify session validity
      if (user) {
        const storedUserId = localStorage.getItem('authUserId') || sessionStorage.getItem('authUserId');
        if (!storedUserId || storedUserId !== user.uid) {
          console.warn('Session mismatch detected. Logging out for security.');
          setSessionValid(false);
          // Force logout if session is invalid
          logoutUser().then(() => {
            setCurrentUser(null);
          });
        } else {
          setSessionValid(true);
        }
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
  
  // Check for session expiry or tampering
  useEffect(() => {
    const validateSession = () => {
      if (currentUser) {
        const isValid = isUserAuthenticated();
        setSessionValid(isValid);
        
        if (!isValid) {
          console.warn('Invalid session detected. Logging out.');
          logoutUser().then(() => {
            setCurrentUser(null);
          });
        }
      }
    };
    
    // Initial validation
    validateSession();
    
    // Set up periodic validation (every 5 minutes)
    const intervalId = setInterval(validateSession, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Inactivity auto-logout
  useEffect(() => {
    if (!currentUser) {
      // Clear any timer if user is logged out
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const scheduleLogout = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(async () => {
        try {
          console.warn('Auto-logout due to inactivity');
          await logoutUser();
          setCurrentUser(null);
          setSessionValid(false);
        } catch (e) {
          console.error('Auto-logout failed:', e);
        }
      }, INACTIVITY_MS);
    };

    const activity = () => {
      try {
        // cross-tab signal
        localStorage.setItem('lastActivityTs', String(Date.now()));
      } catch {}
      scheduleLogout();
    };

    // Start timer immediately for current session
    scheduleLogout();

    // Listen to user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, activity, { passive: true }));

    // Cross-tab sync: when another tab records activity, reset timer here
    const onStorage = (e) => {
      if (e.key === 'lastActivityTs') scheduleLogout();
    };
    window.addEventListener('storage', onStorage);

    // When tab becomes visible again, reset timer
    const onVisibility = () => {
      if (document.visibilityState === 'visible') scheduleLogout();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(evt => window.removeEventListener(evt, activity));
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [currentUser]);

  // Handle logout
  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setSessionValid(false);
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error };
    }
  };

  // Value object that will be passed to consumers of this context
  const value = {
    currentUser,
    isAuthenticated: !!currentUser && sessionValid,
    sessionValid,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
