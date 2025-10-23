import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api, { getApiUrl } from '../config/api';
import {
  Box, Typography, Grid, Card, CardContent, Paper, Fade, Zoom,
  useTheme, alpha, styled, CssBaseline, CircularProgress, Chip
} from '@mui/material';
import {
  People, Description, Assignment, Analytics,
  Assessment, Timeline, Group
} from '@mui/icons-material';
// Router hooks removed - not used in this component
import { useAuth } from '../firebase/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Styled Components
const StatsCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${getCardGradient(color)})`,
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)',
  }
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  }
}));

const WelcomeCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '20px',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(50px, -50px)',
  }
}));

// Helper function for card gradients
function getCardGradient(color) {
  const gradients = {
    clients: '#667eea 0%, #764ba2 100%',
    contracts: '#4CAF50 0%, #45a049 100%',
    invoices: '#FF9800 0%, #F57C00 100%',
    employees: '#2196F3 0%, #1976D2 100%',
    default: '#9C27B0 0%, #673AB7 100%'
  };
  return gradients[color] || gradients.default;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

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

  // Growth chart state
  const [loadingGrowth, setLoadingGrowth] = useState(true);
  const [contractGrowth, setContractGrowth] = useState([]);

  // Pie chart color mapping for activity types
  const activityPieColors = {
    'Client': '#81c784',
    'Contract': '#9575cd',
    'Invoice': '#ffd54f',
    'Employee': '#4db6ac',
    'Other': '#90caf9',
  };

  // Aggregate recent activity by type for pie chart
  const activityPieData = useMemo(() => {
    const counts = {};
    recentActivity.forEach(({ type }) => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, value]) => ({ type, value }));
  }, [recentActivity]);
  
  useEffect(() => {
    // Fetch real dashboard stats
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await api.get(getApiUrl('dashboard/stats/'));
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
        const res = await api.get(getApiUrl('dashboard/recent-activity/'));
        const activities = res.data.map(item => ({
          id: item.id,
          type: item.type || 'Recent',
          name: item.name || `Activity ${item.id}`,
          date: new Date(item.date || new Date()).toLocaleDateString(),
          description: item.description || ''
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
  }, []);

  // Fetch contract growth data
  useEffect(() => {
    const fetchContractGrowth = async () => {
      setLoadingGrowth(true);
      try {
        const response = await api.get(getApiUrl('dashboard/contract-growth/'));
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


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, backgroundColor: '#f8fafc' }}>
        {/* Welcome Section */}
        <WelcomeCard elevation={0}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {t('welcome_back')}, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              {t('track_your_metrics') || 'Track your business metrics and performance'}
            </Typography>
            <Chip 
              icon={<Analytics />}
              label={`${new Date().toLocaleDateString()} - Dashboard Overview`}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        </WelcomeCard>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Zoom in={true} timeout={300 + idx * 100}>
                <StatsCard color={stat.color}>
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                          {t(stat.label)}
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {loadingStats ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            stat.value
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                      }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Contract Growth Chart */}
          <Grid item xs={12} lg={8}>
            <Fade in={true} timeout={800}>
              <ChartCard>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                  <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('contract_growth') || 'Contract Growth'}
                </Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  {loadingGrowth ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : contractGrowth.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
                      <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        {t('no_contract_growth_data') || 'No contract growth data available'}
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={contractGrowth} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#667eea" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#764ba2" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={m => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const [y, mo] = m.split('-');
                            return months[parseInt(mo, 10) - 1];
                          }}
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'Contracts']} 
                          contentStyle={{ 
                            borderRadius: 12, 
                            background: 'white', 
                            border: '1px solid #e0e0e0', 
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' 
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="url(#barGradient)" 
                          radius={[8, 8, 0, 0]} 
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </ChartCard>
            </Fade>
          </Grid>

          {/* Activity Overview */}
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1000}>
              <ChartCard sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('recent_activity') || 'Recent Activity'}
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loadingRecent ? (
                    <CircularProgress />
                  ) : recentActivity.length === 0 ? (
                    <Box textAlign="center">
                      <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="textSecondary">
                        {t('no_recent_activity') || 'No recent activity'}
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {activityPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={Object.values(activityPieColors)[index % Object.values(activityPieColors).length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </ChartCard>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
