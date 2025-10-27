import React from 'react';
import { Box, Drawer, Divider, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  People as ClientsIcon, 
  Description as ContractsIcon, 
  Receipt as FacturesIcon,
  AccountBalance as BalanceIcon, 
  AttachMoney as SalaryIcon, 
  MoreHoriz as MiscIcon, 
  Dashboard as DashboardIcon 
} from '@mui/icons-material';
import '../sidebar.css';

const drawerWidth = 220;

const menuItems = [
  { key: 'dashboard', icon: <DashboardIcon />, path: '/' },
  { key: 'clients', icon: <ClientsIcon />, path: '/clients' },
  { key: 'contracts', icon: <ContractsIcon />, path: '/contracts' },
  { key: 'devis', icon: <ContractsIcon />, path: '/devis' },
  { key: 'factures', icon: <FacturesIcon />, path: '/factures' },
  { key: 'balance', icon: <BalanceIcon />, path: '/balance' },
  { key: 'salary', icon: <SalaryIcon />, path: '/salary' },
  { key: 'miscellaneous', icon: <MiscIcon />, path: '/miscellaneous' },
];

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const drawer = (
    <div className="sidebar drawer">
      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`menu-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{t(item.key)}</span>
          </div>
        ))}
      </div>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
      <Box textAlign="center" pb={2}>
        <Typography variant="caption" color="rgba(25, 118, 210, 0.5)">
          {new Date().getFullYear()} NR-GIE
        </Typography>
      </Box>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ 
          keepMounted: true,
          style: { 
            zIndex: 1300,
          }
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '80%', // Increased from 220px for better mobile experience
            backgroundColor: '#03062e',
            color: '#fff',
            height: '100%',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            overflowY: 'auto',
            position: 'fixed',
            top: 0,
            left: 0,
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
            },
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{ 
          display: { xs: 'none', md: 'block' }, 
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            top: 64,
            height: 'calc(100vh - 64px)'
          } 
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
