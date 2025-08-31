import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Avatar, useTheme, Divider, Tooltip as MuiTooltip, CssBaseline, IconButton, Menu, MenuItem, Snackbar, Grid, Button } from '@mui/material';
import { People, Description, AccountBalance, AttachMoney, MoreHoriz, Dashboard as DashboardIcon, Menu as MenuIcon, Assignment, Notifications, Group, ExitToApp, AccountCircle } from '@mui/icons-material';
import RecentActivity from "../components/RecentActivity";
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import '../dashboard.css';
import '../sidebar.css';
import Navbar from '../components/Navbar';
import '../topbar.css';
import '../toast.css';
import '../modern-dashboard.css';
import axios from 'axios';
import { useAuth } from '../firebase/AuthContext';
import LogoutButton from '../components/LogoutButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, PieChart, Pie, Cell, Legend } from 'recharts';

const drawerWidth = 240;

const Dashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const open = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);
  
  const menuItems = [
    { text: t('dashboard'), icon: <DashboardIcon />, path: '/' },
    { text: t('clients'), icon: <People />, path: '/clients' },
    { text: t('contracts'), icon: <Description />, path: '/contracts' },
    { text: t('balance'), icon: <AccountBalance />, path: '/balance' },
    { text: t('salary'), icon: <AttachMoney />, path: '/salary' },
    { text: t('miscellaneous'), icon: <MoreHoriz />, path: '/misc' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleUserMenuClose();
    const { success } = await logout();
    if (success) {
      navigate('/login');
    }
  };

  // Dashboard stats
  const [stats, setStats] = useState([
    { label: 'total_clients', value: '0', icon: <People />, color: 'clients' },
    { label: 'total_contracts', value: '0', icon: <Description />, color: 'contracts' },
    { label: 'invoices_due', value: '0', icon: <Assignment />, color: 'invoices' },
    { label: 'employees_tracked', value: '0', icon: <Group />, color: 'employees' }
  ]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Recent activity state
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  useEffect(() => {
    setToastOpen(true);
    
    // Fetch real dashboard stats
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/stats`);
        setStats(prevStats => prevStats.map(stat => ({
          ...stat,
          value: res.data[stat.label] || '0'
        })));
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    
    // Fetch recent activity
    const fetchRecentActivity = async () => {
      setLoadingRecent(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/recent-activity`);
        const activities = res.data.map(item => ({
          id: item.id,
          type: item.type || 'Recent',
          name: item.name || `Activity ${item.id}`,
          date: new Date(item.date || new Date()).toLocaleDateString()
        }));
        setRecentActivity(activities);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        // Return empty array to show empty state
        setRecentActivity([]);
      } finally {
        setLoadingRecent(false);
      }
    };
    
    fetchStats();
    fetchRecentActivity();
  }, [t]);

  // Pie chart color mapping for activity types
  const activityPieColors = {
    'Client': '#81c784',
    'Contract': '#9575cd',
    'Invoice': '#ffd54f',
    'Employee': '#4db6ac',
    'Other': '#90caf9',
  };

  // Helper: aggregate recent activity by type for pie chart
  const activityPieData = useMemo(() => {
    const counts = {};
    recentActivity.forEach(({ type }) => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, value]) => ({ type, value }));
  }, [recentActivity]);
  
  const [loadingGrowth, setLoadingGrowth] = useState(true);
  const [contractGrowth, setContractGrowth] = useState([]);

  // Fetch contract growth data
  useEffect(() => {
    const fetchContractGrowth = async () => {
      setLoadingGrowth(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/contract-growth`);
        setContractGrowth(response.data);
      } catch (error) {
        console.error('Error fetching contract growth data:', error);
        // Set some sample data if API fails
        const currentDate = new Date();
        const months = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          months.push({
            month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            count: Math.floor(Math.random() * 20) + 5 // Random count between 5-25
          });
        }
        setContractGrowth(months);
      } finally {
        setLoadingGrowth(false);
      }
    };

    fetchContractGrowth();
  }, []);

  const drawer = (
    <div className="sidebar">
      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item.text}
            className={`menu-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => window.location.href = item.path}
          >
            {item.icon}
            <span>{item.text}</span>
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
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <CssBaseline />
        {/* App Bar */}
        <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: '#555' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {t('dashboard')}
            </Typography>
            
            {/* Notifications */}
            <IconButton color="inherit" sx={{ color: '#555', mr: 1 }}>
              <Notifications />
            </IconButton>
            
            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                onClick={handleUserMenuOpen}
                color="inherit"
                sx={{ 
                  textTransform: 'none', 
                  color: '#555',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
                }}
                startIcon={
                  currentUser?.photoURL ? 
                  <Avatar 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || currentUser.email} 
                    sx={{ width: 32, height: 32 }}
                  /> : 
                  <AccountCircle />
                }
              >
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                </Typography>
              </Button>
              
              <Menu
                anchorEl={userMenuAnchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: { minWidth: 180, mt: 1 }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="h5" sx={{ mb: 4, color: 'text.primary' }}>
                    {t('welcome_back')}, {currentUser?.displayName || t('user')}!
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('quick_stats')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {currentUser?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('logout')}</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        {/* Sidebar */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        </Box>
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, px: { xs: 1, md: 4 }, mt: { xs: 7.5, md: 8 }, pb: 4, minHeight: '100vh', transition: 'all 0.3s', background: 'rgba(255,255,255,0.7)', boxShadow: { md: 3, xs: 0 } }}>
          <Navbar handleDrawerToggle={handleDrawerToggle} />
          <Box className="dashboard-main-glass">




            <div className="dashboard-hero">
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{t('welcome_to_dashboard')}</Typography>
              <Typography variant="body1" color="textSecondary">{t('track_your_metrics')}</Typography>
            </div>

                        {/* Stats Cards */}
                        <Box sx={{ mb: 5, width: '100%', px: 0, py: 2 }}>
            <Grid container spacing={0} sx={{ width: '100%', minHeight: '140px' }}>
              {stats.map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx} sx={{ p: 1.5, flex: '1 1 0', minWidth: '24%', transform: 'translateY(-8px)' }}>
                  <div 
                    className={`stat-card stat-card-${stat.color}`}
                    role="region"
                    aria-label={`${t(stat.label)} statistics`}
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        // Handle interaction - could show more details, etc.
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="stat-card-content">
                      <Typography 
                        variant="body2" 
                        className="stat-card-label"
                        component="h3"
                      >
                        {t(stat.label)}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        className="stat-card-value"
                        aria-live="polite"
                      >
                        {loadingStats ? '...' : stat.value}
                      </Typography>
                    </div>
                    <div className={`stat-card-icon-wrapper stat-card-icon-${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Box>
            

            
            {/* Recent Activity */}
            <Box sx={{ 
              mt: 4,
              '& .MuiPaper-root': {
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }
            }}>
              <RecentActivity recent={recentActivity} loadingRecent={loadingRecent} />
            </Box>
            
            {/* Contract Growth Chart */}
            <Box sx={{ mt: 4, p: 3, borderRadius: 2, background: 'rgba(255,255,255,0.13)', boxShadow: '0 12px 32px 0 rgba(180,185,200,0.15)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(230,230,240,0.13)', transform: 'translateY(-8px)' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>{t('contract_growth')}</Typography>
              <Box sx={{ height: 260, width: '100%', minWidth: 320 }}>
                {loadingGrowth ? (
                  <Typography variant="body2">{t('loading')}</Typography>
                ) : contractGrowth.length === 0 ? (
                  <Typography variant="h6" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                    {t('no_contract_growth_data')}
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={contractGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9c27b0" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#4caf50" stopOpacity={0.7}/>
                        </linearGradient>
                        <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#9c27b0" flood-opacity="0.25" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#ececf7" />
                      <XAxis dataKey="month" tickFormatter={m => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const [y, mo] = m.split('-');
                        return months[parseInt(mo, 10) - 1];
                      }} tick={{ fontSize: 13, fill: '#9c27b0' }} axisLine={false} tickLine={false}>
                        <Label value="Month" offset={-10} position="insideBottom" style={{ fill: '#9c27b0', fontWeight: 600 }} />
                      </XAxis>
                      <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#4caf50' }} axisLine={false} tickLine={false}>
                        <Label value="Contracts" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#4caf50', fontWeight: 600 }} />
                      </YAxis>
                      <Tooltip 
                        formatter={(value) => [value, 'Contracts']} 
                        contentStyle={{ 
                          borderRadius: 10, 
                          background: '#fff', 
                          border: '1px solid rgba(156, 39, 176, 0.2)', 
                          boxShadow: '0 8px 24px 0 rgba(156, 39, 176, 0.15)' 
                        }} 
                        labelStyle={{ color: '#9c27b0', fontWeight: 600 }} 
                        itemStyle={{ color: '#4caf50', fontWeight: 500 }} 
                        cursor={{ fill: 'rgba(156, 39, 176, 0.1)', opacity: 0.3 }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#barGradient)" 
                        radius={[10, 10, 0, 0]} 
                        filter="url(#barShadow)" 
                        isAnimationActive={true} 
                        animationDuration={1200} 
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
