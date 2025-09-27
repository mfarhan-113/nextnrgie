import React, { createContext, useContext, useState, useEffect } from 'react';
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
