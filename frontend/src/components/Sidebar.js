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
    <div className="sidebar">
      <div className="brand">
        <img src="/logonr.jpg" alt="NR-GIE Logo" />
        <span>NR-GIE</span>
      </div>
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
        ModalProps={{ keepMounted: true }}
        sx={{ 
          display: { xs: 'block', md: 'none' }, 
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            top: 64,
            height: 'calc(100vh - 64px)'
          } 
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
