import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box, 
  Button, 
  Divider, 
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Navbar = ({ handleDrawerToggle, avatarSrc = '/avatar.png', logoSrc = '/logonr.jpg', userName = 'Danial' }) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  // Profile dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    position: '',
    bio: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    darkMode: false,
    notifications: true,
    emailAlerts: true,
    language: 'en' // Default language
  });

  // Initialize language from localStorage or browser language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
    setSettingsForm(prev => ({
      ...prev,
      language: savedLanguage
    }));
  }, []);

  // Handle language change in form
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSettingsForm(prev => ({
      ...prev,
      language: newLanguage
    }));
  };
  
  // Get display name from auth context or use the provided userName as fallback
  const displayName = currentUser?.displayName || userName;

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        // Close the menu
        setAnchorEl(null);
        // Redirect to login page
        navigate('/login');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Profile dialog handlers
  const handleOpenProfileDialog = (tabIndex = 0) => {
    setProfileDialogOpen(true);
    setAnchorEl(null);
    setActiveTab(tabIndex);
    
    // Initialize form with current user data if available
    if (currentUser && tabIndex === 0) { // Only set profile data for profile tab
      setProfileForm({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        position: currentUser.position || 'Staff Member',
        bio: currentUser.bio || ''
      });
    }
  };
  
  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setActiveTab(0);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveProfile = async () => {
    try {
      // Here you would implement the actual profile update logic
      // using Firebase or your backend API
      console.log('Saving profile:', profileForm);
      
      // Close the dialog after successful save
      handleCloseProfileDialog();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  
  const handleChangePassword = async () => {
    try {
      // Here you would implement the actual password change logic
      // using Firebase or your backend API
      console.log('Changing password:', passwordForm);
      
      // Reset form and show success message
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      // Change the language when settings are saved
      await i18n.changeLanguage(settingsForm.language);
      
      // Save language preference to localStorage
      localStorage.setItem('i18nextLng', settingsForm.language);
      
      // Close the dialog after successful save
      handleCloseProfileDialog();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <AppBar position="fixed" sx={{ width: '100%', right: 0, left: 'auto', zIndex: (theme) => theme.zIndex.drawer + 1, background: '#01293e', color: '#fff', boxShadow: '0 2px 8px 0 rgba(30,40,60,0.14)', borderRadius: 0 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 48, px: { xs: 1, sm: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={logoSrc} sx={{ bgcolor: '#1976d2', width: 36, height: 36, mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
            {t('app_name')}
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={handleAvatarClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '24px',
              padding: '4px 12px 4px 4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            endIcon={<KeyboardArrowDownIcon sx={{ color: '#fff', opacity: 0.8 }} />}
          >
            <Avatar
              src={avatarSrc}
              sx={{ 
                width: 32, 
                height: 32, 
                marginRight: 1,
                border: '2px solid rgba(255, 255, 255, 0.6)'
              }}
            />
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#fff', 
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {displayName}
            </Typography>
          </Button>
          <Menu 
            anchorEl={anchorEl} 
            open={open} 
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                minWidth: 220,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                mt: 1.5,
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: '8px',
                  mx: 1,
                  my: 0.5,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User info section */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {currentUser?.email || 'user@example.com'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 0.5 }} />
            
            {/* Menu items */}
            <MenuItem onClick={() => handleOpenProfileDialog(0)} sx={{ fontWeight: 500 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#1976d2' }} />
              </ListItemIcon>
              {t('my_profile')}
            </MenuItem>
            
            <MenuItem onClick={() => handleOpenProfileDialog(1)} sx={{ fontWeight: 500 }}>
              <ListItemIcon>
                <EditIcon fontSize="small" sx={{ color: '#9c27b0' }} />
              </ListItemIcon>
              {t('edit_account')}
            </MenuItem>
            
            <MenuItem onClick={() => handleOpenProfileDialog(2)} sx={{ fontWeight: 500 }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#2e7d32' }} />
              </ListItemIcon>
              {t('settings')}
            </MenuItem>
            
            <Divider sx={{ my: 0.5 }} />
            
            <MenuItem onClick={handleLogout} sx={{ fontWeight: 500 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} />
              </ListItemIcon>
              {t('logout')}
            </MenuItem>
          </Menu>
          
          {/* Profile Dialog */}
          <Dialog 
            open={profileDialogOpen} 
            onClose={handleCloseProfileDialog}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              sx: {
                borderRadius: '12px',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(0,0,0,0.1)', 
              px: 3, 
              py: 2,
              backgroundColor: '#f8f9fa'
            }}>
              <Typography variant="h6" fontWeight={600}>{t('account_settings')}</Typography>
            </DialogTitle>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="profile tabs"
                sx={{ 
                  px: 3,
                  '& .MuiTab-root': {
                    minHeight: '48px',
                    fontWeight: 500
                  }
                }}
              >
                <Tab icon={<PersonIcon />} iconPosition="start" label={t('profile')} />
                <Tab icon={<LockIcon />} iconPosition="start" label={t('change_password')} />
                <Tab icon={<SettingsIcon />} iconPosition="start" label={t('settings')} />
              </Tabs>
            </Box>
            
            <DialogContent sx={{ p: 3 }}>
              {/* Profile Tab */}
              {activeTab === 0 && (
                <Box component="form" noValidate>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    {t('personal_information')}
                  </Typography>
                  
                  <TextField
                    margin="dense"
                    label={t('display_name')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    name="displayName"
                    value={profileForm.displayName}
                    onChange={handleProfileFormChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    label={t('email_address')}
                    type="email"
                    fullWidth
                    variant="outlined"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileFormChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    label={t('phone_number')}
                    type="tel"
                    fullWidth
                    variant="outlined"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileFormChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    label={t('position')}
                    type="text"
                    fullWidth
                    variant="outlined"
                    name="position"
                    value={profileForm.position}
                    onChange={handleProfileFormChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    label={t('bio')}
                    type="text"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileFormChange}
                  />
                </Box>
              )}
              
              {/* Password Tab */}
              {activeTab === 1 && (
                <Box component="form" noValidate>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    {t('change_password')}
                  </Typography>
                  
                  <TextField
                    margin="dense"
                    label={t('current_password')}
                    type="password"
                    fullWidth
                    variant="outlined"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    label={t('new_password')}
                    type="password"
                    fullWidth
                    variant="outlined"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    label={t('confirm_new_password')}
                    type="password"
                    fullWidth
                    variant="outlined"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                  />
                </Box>
              )}
              
              {/* Settings Tab */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 3 }}>
                    Application Settings
                  </Typography>
                  
                  {/* Language Selector */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="language-select-label">{t('language')}</InputLabel>
                    <Select
                      labelId="language-select-label"
                      id="language-select"
                      value={settingsForm.language}
                      label={t('language')}
                      onChange={handleLanguageChange}
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="en">{t('english')}</MenuItem>
                      <MenuItem value="fr">{t('french')}</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settingsForm.darkMode} 
                        onChange={handleSettingsChange} 
                        name="darkMode" 
                        color="primary"
                      />
                    }
                    label={t('dark_mode')}
                    sx={{ display: 'block', mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settingsForm.notifications} 
                        onChange={handleSettingsChange} 
                        name="notifications" 
                        color="primary"
                      />
                    }
                    label={t('notifications')}
                    sx={{ display: 'block', mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settingsForm.emailAlerts} 
                        onChange={handleSettingsChange} 
                        name="emailAlerts" 
                        color="primary"
                      />
                    }
                    label={t('email_alerts')}
                    sx={{ display: 'block' }}
                  />
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Button onClick={handleCloseProfileDialog} variant="outlined" color="inherit">
                {t('cancel')}
              </Button>
              <Button 
                onClick={
                  activeTab === 0 ? handleSaveProfile : 
                  activeTab === 1 ? handleChangePassword : 
                  handleSaveSettings
                } 
                variant="contained" 
                color="primary"
                sx={{ ml: 1 }}
              >
                {activeTab === 1 ? t('change_password') : t('save')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
