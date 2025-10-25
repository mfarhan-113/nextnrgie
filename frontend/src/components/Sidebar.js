import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Drawer, 
  Divider, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  People as ClientsIcon, 
  Description as ContractsIcon, 
  Receipt as FacturesIcon,
  AccountBalance as BalanceIcon, 
  AttachMoney as SalaryIcon, 
  MoreHoriz as MiscIcon, 
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiDivider-root': {
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
  },
  ...(!open && {
    '& .MuiDrawer-paper': {
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }),
}));

const MenuHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2, 2, 3),
  minHeight: '64px',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
  '& .MuiTypography-root': {
    color: 'white',
  },
}));

const MenuContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto',
  padding: '16px 0',
});

const MenuItem = styled('div')(({ theme, open }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  '&.active': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    '& .MuiSvgIcon-root': {
      color: theme.palette.secondary.main,
    },
  },
  '& .MuiSvgIcon-root': {
    minWidth: '24px',
    marginRight: theme.spacing(open ? 2 : 'auto'),
    color: 'rgba(255, 255, 255, 0.7)',
    transition: theme.transitions.create(['margin', 'color'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  '&.active .MuiSvgIcon-root': {
    color: theme.palette.secondary.main,
  },
  ...(!open && {
    justifyContent: 'center',
    padding: theme.spacing(1.5, 2),
  }),
}));

const MenuText = styled(Typography)(({ open }) => ({
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  letterSpacing: '0.01em',
  opacity: 1,
  transition: theme => theme.transitions.create('opacity', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  ...(!open && {
    opacity: 0,
    width: 0,
    overflow: 'hidden',
  }),
}));

const MenuFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(2),
  textAlign: 'center',
  '& .MuiTypography-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.75rem',
  },
}));

const drawerWidth = 240;

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Close the sidebar by default on mobile
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      onDrawerToggle();
    } else {
      setOpen(!open);
    }
  };

  const menuContent = (
    <MenuContainer>
      {/* Mobile Header */}
      {isMobile && (
        <MenuHeader>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon sx={{ color: 'text.primary' }} />
          </IconButton>
        </MenuHeader>
        <Divider />
      )}

      {/* Menu Items */}
      <Box sx={{ flex: 1, mt: 1 }}>
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setOpen(!open)}>
              {open ? <ChevronLeftIcon sx={{ color: 'common.white' }} /> : <ChevronRightIcon sx={{ color: 'common.white' }} />}
            </IconButton>
          </Box>
        )}
        
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            className={location.pathname === item.path ? 'active' : ''}
            onClick={() => {
              navigate(item.path);
              if (isMobile) onDrawerToggle();
            }}
            open={open}
          >
            {React.cloneElement(item.icon, { sx: { fontSize: '1.5rem' } })}
            <MenuText open={open}>{t(item.key)}</MenuText>
          </MenuItem>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {new Date().getFullYear()} NR-GIE
        </Typography>
      </Box>
    </MenuContainer>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          },
        }}
      >
        {menuContent}
      </Drawer>
    );
  }

  return (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <StyledDrawer variant="permanent" open={open}>
        {menuContent}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
