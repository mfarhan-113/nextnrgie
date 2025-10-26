import React from 'react';
import { 
  Box, 
  Drawer, 
  Divider, 
  Typography, 
  IconButton,
  styled,
  useTheme,
  alpha
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
  Close as CloseIcon
} from '@mui/icons-material';
import { styled as muiStyled } from '@mui/material/styles';

const StyledDrawer = muiStyled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '280px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[16],
    borderRight: 'none',
    [theme.breakpoints.up('md')]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '& .MuiDivider-root': {
        borderColor: 'rgba(255, 255, 255, 0.12)',
      },
      '& .menu-item': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: '#fff',
        },
        '&.active': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: '#fff',
          borderLeft: `4px solid ${theme.palette.secondary.main}`,
        },
      },
    },
  },
}));

const MenuHeader = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2, 2, 3),
  minHeight: '64px',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const MenuContainer = muiStyled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto',
});

const MenuItem = muiStyled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 3),
  margin: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiSvgIcon-root': {
      color: theme.palette.secondary.main,
    },
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(2),
    fontSize: '1.5rem',
    color: theme.palette.text.secondary,
  },
  '&.active .MuiSvgIcon-root': {
    color: theme.palette.secondary.main,
  },
}));

const MenuText = muiStyled(Typography)({
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  letterSpacing: '0.01em',
});

const MenuFooter = muiStyled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(2),
  textAlign: 'center',
  '& .MuiTypography-root': {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  [theme.breakpoints.up('md')]: {
    '& .MuiTypography-root': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
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
  const isMobile = window.innerWidth < 900; // Adjust breakpoint as needed

  const menuContent = (
    <MenuContainer>
      {/* Mobile Header */}
      {isMobile && (
        <>
          <MenuHeader>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Menu
            </Typography>
            <IconButton
              onClick={onDrawerToggle}
              size="small"
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </MenuHeader>
          <Divider />
        </>
      )}

      {/* Menu Items */}
      <Box sx={{ p: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon.type;
          return (
            <MenuItem
              key={item.key}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => {
                navigate(item.path);
                if (isMobile) onDrawerToggle();
              }}
            >
              {React.cloneElement(item.icon, {
                sx: { fontSize: '1.5rem', mr: 2 }
              })}
              <MenuText>{t(item.key)}</MenuText>
            </MenuItem>
          );
        })}
      </Box>

      {/* Footer */}
      <MenuFooter>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption">
          © {new Date().getFullYear()} NR-GIE
        </Typography>
      </MenuFooter>
    </MenuContainer>
  );

  return (
    <Box component="nav" sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
          BackdropProps: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRight: 'none',
          },
        }}
      >
        {menuContent}
      </StyledDrawer>

      {/* Desktop Drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRight: 'none',
          },
        }}
        open
      >
        {menuContent}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
