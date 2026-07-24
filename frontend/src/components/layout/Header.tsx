import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
  Popover,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Brightness4,
  Brightness7,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  CheckCircle as TaskIcon,
  Event as MeetingIcon,
  Assignment as ProjectIcon,
  Info as SystemIcon,
  DeleteOutline as DeleteIcon,
  Close as CloseIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomTheme } from '../../context/ThemeContext';
import api from '../../config/axios.config';

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
  
  // User Profile Menu Anchor
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  // Notifications Popover State (Originating from Bell Icon)
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [fullHistoryDialogOpen, setFullHistoryDialogOpen] = useState<boolean>(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch Notifications & Unread Count from Backend
  const fetchNotifications = () => {
    if (!user?.userId) return;
    setLoading(true);
    
    // Fetch Notifications list scoped to user
    api.get(`/notifications?recipientId=${user.userId}`)
      .then((res) => {
        const raw = res.data?.data || [];
        setNotifications(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));

    // Fetch Unread Count
    api.get(`/notifications/unread-count?recipientId=${user.userId}`)
      .then((res) => {
        const count = res.data?.data?.unreadCount ?? 0;
        setUnreadCount(Number(count));
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user?.userId) return;
    fetchNotifications();

    // Poll unread count every 30s
    pollRef.current = setInterval(() => {
      api.get(`/notifications/unread-count?recipientId=${user.userId}`)
        .then((res) => setUnreadCount(Number(res.data?.data?.unreadCount ?? 0)))
        .catch(() => {});
    }, 30_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.userId]);

  // Open / Close Bell Popover
  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setBellAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleBellClose = () => {
    setBellAnchorEl(null);
  };

  // Open / Close Profile Menu
  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    logout();
    navigate('/login');
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/read-all?recipientId=${user?.userId}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  // Mark single notification as read
  const handleMarkSingleRead = async (id: number, targetUrl?: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}

    if (targetUrl) {
      handleBellClose();
      navigate(targetUrl);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {}
  };

  // Format relative time helper
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Get Notification Icon by Type
  const getNotificationIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('TASK')) return <TaskIcon color="primary" fontSize="small" />;
    if (t.includes('MEETING')) return <MeetingIcon color="secondary" fontSize="small" />;
    if (t.includes('PROJECT')) return <ProjectIcon color="info" fontSize="small" />;
    if (t.includes('SECURITY') || t.includes('AUTH')) return <SecurityIcon color="warning" fontSize="small" />;
    return <SystemIcon color="action" fontSize="small" />;
  };

  // Filter notifications by Tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 1) return !n.isRead;
    if (activeTab === 2) return (n.type || '').toUpperCase().includes('TASK');
    if (activeTab === 3) return (n.type || '').toUpperCase().includes('MEETING');
    if (activeTab === 4) return (n.type || '').toUpperCase().includes('PROJECT');
    return true;
  });

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

  const isBellOpen = Boolean(bellAnchorEl);

  return (
    <>
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

            {/* Dark/Light Mode Toggle */}
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* ── Single Bell Icon Navigation (With Smooth Origin Expansion) ── */}
            <IconButton
              color="inherit"
              onClick={handleBellClick}
              id="header-notifications-btn"
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.08)' },
              }}
            >
              <Badge
                badgeContent={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    padding: '0 4px',
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Profile Avatar */}
            {user && (
              <>
                <IconButton onClick={handleProfileOpen} color="inherit">
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontWeight: 700 }}>
                    {user.firstName ? user.firstName[0] : 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={profileAnchorEl}
                  open={Boolean(profileAnchorEl)}
                  onClose={handleProfileClose}
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
                  <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); }}>
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

      {/* ── Elaborate Animated Popover Elaborating from Bell Icon Position ── */}
      <Popover
        open={isBellOpen}
        anchorEl={bellAnchorEl}
        onClose={handleBellClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 12,
          sx: {
            width: 420,
            maxHeight: 560,
            borderRadius: 3.5,
            mt: 1,
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            transformOrigin: 'top right',
            animation: 'expandFromBell 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            '@keyframes expandFromBell': {
              '0%': { opacity: 0, transform: 'scale(0.3) translateY(-20px)' },
              '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
            },
          },
        }}
      >
        {/* Popover Header */}
        <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} Unread`} color="error" size="small" sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Refresh Notifications">
              <IconButton size="small" onClick={fetchNotifications}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton size="small" color="primary" onClick={handleMarkAllRead}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <IconButton size="small" onClick={handleBellClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Filter Category Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            px: 1,
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            '& .MuiTab-root': { minHeight: 38, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', py: 0 },
          }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Tasks" />
          <Tab label="Meetings" />
          <Tab label="Projects" />
        </Tabs>

        {/* Notification List Body */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={28} />
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Loading updates...
              </Typography>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <NotificationsIcon sx={{ fontSize: 44, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                No notifications found
              </Typography>
              <Typography variant="caption">You are all caught up with your activities!</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredNotifications.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={() => handleMarkSingleRead(item.id, item.actionUrl || item.targetUrl)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    bgcolor: item.isRead ? 'transparent' : mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                      {getNotificationIcon(item.type || item.title)}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: item.isRead ? 600 : 800,
                            fontSize: '0.84rem',
                            color: item.isRead ? 'text.primary' : 'primary.main',
                          }}
                        >
                          {item.title || 'System Notification'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                          {formatTimeAgo(item.createdAt || item.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'text.secondary',
                          mt: 0.3,
                          fontSize: '0.76rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.message || item.details || 'New activity logged in your workspace.'}
                      </Typography>
                    }
                  />

                  <ListItemSecondaryAction>
                    {!item.isRead && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-block', mr: 1 }} />
                    )}
                    <IconButton size="small" onClick={(e) => handleDeleteNotification(e, item.id)} title="Delete Notification">
                      <DeleteIcon fontSize="inherit" sx={{ fontSize: 16 }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        {/* Popover Footer */}
        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
          <Button
            size="small"
            color="primary"
            startIcon={<OpenIcon fontSize="small" />}
            onClick={() => {
              handleBellClose();
              setFullHistoryDialogOpen(true);
            }}
            sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.8rem' }}
          >
            View Full Notification History
          </Button>
        </Box>
      </Popover>

      {/* ── Full History Dialog Modal ── */}
      <Dialog
        open={fullHistoryDialogOpen}
        onClose={() => setFullHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Full Enterprise Notification Archive
            </Typography>
          </Box>
          <IconButton onClick={() => setFullHistoryDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            {notifications.map((item) => (
              <ListItem key={item.id} divider sx={{ py: 1.5 }}>
                <ListItemIcon>{getNotificationIcon(item.type || item.title)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.createdAt || item.timestamp}
                      </Typography>
                    </Box>
                  }
                  secondary={item.message || item.details}
                />
                <Chip label={item.isRead ? 'READ' : 'UNREAD'} color={item.isRead ? 'default' : 'primary'} size="small" />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setFullHistoryDialogOpen(false)}>
            Close Archive
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
