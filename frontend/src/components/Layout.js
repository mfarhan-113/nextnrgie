import React, { useState } from 'react';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <CssBaseline />
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flex: 1, position: 'relative', width: '100%' }}>
        <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            // ml: { md: '220px' },
            width: { xs: '100%', md: 'calc(100% - 220px)' },
            mt: '64px',
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#f5f7fa',
            position: 'relative',
            zIndex: 1,
            transition: 'margin 0.3s ease'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
