import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  InputBase,
  alpha,
  styled,
} from '@mui/material';
import {
  Search as SearchIcon,
  Brightness4,
  Brightness7,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomTheme } from '../../context/ThemeContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '28ch',
    },
  },
}));

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ROLE_SUPER_ADMIN':
        return '👑 Super Admin Portal';
      case 'ROLE_ENG_MANAGER':
        return '🏢 Dept Manager Portal';
      case 'ROLE_PROJECT_MANAGER':
        return '📊 Project Manager Portal';
      case 'ROLE_EMPLOYEE':
        return '👨‍💻 Employee Portal';
      case 'ROLE_CLIENT':
        return '💼 Corporate Client Portal';
      default:
        return '🔒 Enterprise Portal';
    }
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          SPEMS Enterprise
        </Typography>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Global Search (Employees, Projects, Tasks)..." inputProps={{ 'aria-label': 'search' }} />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Active Portal Badge */}
          {user && (
            <Chip
              icon={<SecurityIcon style={{ color: '#fff', fontSize: 16 }} />}
              label={getRoleDisplayName(user.role)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                height: 32,
                px: 0.5,
              }}
            />
          )}

          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/notifications')}>
            <NotificationsIcon />
          </IconButton>

          {user && (
            <>
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontWeight: 700 }}>
                  {user.firstName ? user.firstName[0] : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={user.role.replace('ROLE_', '').replace('_', ' ')}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <AccountCircle sx={{ mr: 1 }} /> Profile Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
