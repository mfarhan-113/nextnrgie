import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../firebase/auth';

const LogoutButton = ({ variant = "contained", size = "medium", sx = {} }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await logoutUser();
      if (success) {
        // Redirect to login page after successful logout
        navigate('/login');
      } else if (error) {
        console.error('Logout error:', error);
        // Still redirect to login even if there's an error
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      color="primary"
      onClick={handleLogout}
      disabled={isLoading}
      size={size}
      sx={sx}
    >
      {isLoading ? <CircularProgress size={24} /> : 'Logout'}
    </Button>
  );
};

export default LogoutButton;
