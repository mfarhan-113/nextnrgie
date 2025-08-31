import React, { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CircularProgress,
  useTheme
} from "@mui/material";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";
import { 
  Person, 
  Description, 
  CloudUpload, 
  CloudDownload, 
  Share, 
  Login, 
  AccessTime, 
  Notifications, 
  Star, 
  TrendingUp, 
  Public, 
  Folder 
} from "@mui/icons-material";
import "./RecentActivity.css";

const getTypeIcon = (type) => {
  const iconStyle = { marginRight: 8 };
  switch(type) {
    case 'Login': return <Login style={{ ...iconStyle, color: '#4e7df9' }} />;
    case 'Upload': return <CloudUpload style={{ ...iconStyle, color: '#4caf50' }} />;
    case 'Download': return <CloudDownload style={{ ...iconStyle, color: '#ff9800' }} />;
    case 'Share': return <Share style={{ ...iconStyle, color: '#9c27b0' }} />;
    case 'Client': return <Person style={{ ...iconStyle, color: '#43e97b' }} />;
    case 'Contract': return <Description style={{ ...iconStyle, color: '#b39ddb' }} />;
    case 'Recent': return <AccessTime style={{ ...iconStyle, color: '#03a9f4' }} />;
    case 'Alert': return <Notifications style={{ ...iconStyle, color: '#f44336' }} />;
    case 'Important': return <Star style={{ ...iconStyle, color: '#ffc107' }} />;
    case 'Trending': return <TrendingUp style={{ ...iconStyle, color: '#00bcd4' }} />;
    case 'Global': return <Public style={{ ...iconStyle, color: '#795548' }} />;
    case 'Project': return <Folder style={{ ...iconStyle, color: '#607d8b' }} />;
    default: return <AccessTime style={iconStyle} />;
  }
};

const getTypeColor = (type) => {
  const colors = {
    Login: '#4e7df9',
    Upload: '#4caf50',
    Download: '#ff9800',
    Share: '#9c27b0',
    Client: '#43e97b',
    Contract: '#b39ddb',
    Recent: '#03a9f4',
    Alert: '#f44336',
    Important: '#ffc107',
    Trending: '#00bcd4',
    Global: '#795548',
    Project: '#607d8b'
  };
  return colors[type] || '#9e9e9e';
};

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload, t }) => {
  if (active && payload && payload.length) {
    const type = payload[0].name;
    const count = payload[0].value;
    const typeTranslation = t(`activity.${type.toLowerCase()}`) || type;
    
    return (
      <Box sx={{
        backgroundColor: 'background.paper',
        p: 1.5,
        borderRadius: 1,
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 140
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {getTypeIcon(type)}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {typeTranslation}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('count_activities', { count })}
        </Typography>
      </Box>
    );
  }
  return null;
};

const RecentActivity = ({ recent = [], loadingRecent = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Use the provided data or show empty state
  const activityData = useMemo(() => {
    return recent || [];
  }, [recent]);
  
  // Check if we should show the empty state
  const showEmptyState = !loadingRecent && activityData.length === 0;
  
  // Prepare data for pie chart
  const pieData = useMemo(() => {
    const counts = {};
    activityData.forEach(({ type }) => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, value]) => ({
      name: type,
      value,
      color: getTypeColor(type)
    }));
  }, [activityData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      {/* Activity List */}
      <Box sx={{ 
        flex: 1, 
        minWidth: 0,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        p: 2,
        boxShadow: 1
      }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, color: 'text.primary' }}>
          {t('recent_activities')}
        </Typography>
        
        {loadingRecent ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 300,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            p: 3,
            boxShadow: 1
          }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {t('loading_activities')}
            </Typography>
          </Box>
        ) : showEmptyState ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 300,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            p: 3,
            boxShadow: 1
          }}>
            <AccessTime sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="subtitle1" gutterBottom>
              {t('no_activity_found')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('no_activity_description')}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {activityData.slice(0, 5).map((item, idx) => (
              <ListItem 
                key={item.id || idx} 
                disableGutters
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getTypeIcon(item.type)}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="body2" noWrap>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {item.date}
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      
      {/* Pie Chart */}
      <Box sx={{ 
        width: { xs: '100%', md: 300 },
        backgroundColor: 'background.paper',
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, color: 'text.primary' }}>
          {t('activity_distribution')}
        </Typography>
        
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pieData.length > 0 ? (
            <Box sx={{ width: '100%', height: 200, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip t={t} />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center text */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <Typography variant="h6" color="text.primary">
                  {activityData.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('total_activities')}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('no_activity_data')}
            </Typography>
          )}
        </Box>
        
        {/* Legend */}
        {pieData.length > 0 && (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 1,
            mt: 2,
            '& > div': {
              display: 'flex',
              alignItems: 'center',
              '&:before': {
                content: '""',
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'currentColor',
                marginRight: 1,
                opacity: 0.7
              }
            }
          }}>
            {pieData.map((item, index) => (
              <Typography 
                key={`legend-${index}`}
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '&:before': {
                    backgroundColor: item.color
                  }
                }}
              >
                {t(`activity.${item.name.toLowerCase()}`) || item.name}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default React.memo(RecentActivity);
