import React from 'react';
import { Box, Drawer, Divider, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  People as ClientsIcon, 
  Description as ContractsIcon, 
  AccountBalance as BalanceIcon, 
  AttachMoney as SalaryIcon, 
  MoreHoriz as MiscIcon, 
  Dashboard as DashboardIcon 
} from '@mui/icons-material';
import '../sidebar.css';

const drawerWidth = 240;

const menuItems = [
  { key: 'dashboard', icon: <DashboardIcon />, path: '/' },
  { key: 'clients', icon: <ClientsIcon />, path: '/clients' },
  { key: 'contracts', icon: <ContractsIcon />, path: '/contracts' },
  { key: 'balance', icon: <BalanceIcon />, path: '/balance' },
  { key: 'salary', icon: <SalaryIcon />, path: '/salary' },
  { key: 'miscellaneous', icon: <MiscIcon />, path: '/misc' },
];

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const drawer = (
    <div className="sidebar">
      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`menu-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => window.location.href = item.path}
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
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawer}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
