import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Stack,
  Alert,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Event as MeetingIcon,
  Check as MarkReadIcon,
  Delete as DeleteIcon,
  AssignmentTurnedIn as TaskIcon,
  Group as TeamIcon,
  ManageAccounts as LeadIcon,
  Business as OrgIcon,
  Search as SearchIcon,
  NotificationsNone as EmptyIcon,
  MarkEmailRead as MarkAllIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../config/axios.config';

// ── Types ────────────────────────────────────────────────────────────────────

interface BackendNotification {
  id: number;
  title: string;
  message: string;
  linkUrl: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
  recipient?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// ── Icon & colour helpers ────────────────────────────────────────────────────

function getNotificationIcon(type: string) {
  switch (type) {
    case 'TASK_ASSIGNED':
      return <TaskIcon />;
    case 'MEETING_INVITE':
      return <MeetingIcon />;
    case 'TEAM_LEAD_ASSIGNED':
      return <LeadIcon />;
    case 'SCRUM_MASTER_ASSIGNED':
      return <LeadIcon />;
    case 'TEAM_ASSIGNED':
      return <TeamIcon />;
    default:
      return <OrgIcon />;
  }
}

function getNotificationColor(type: string): string {
  switch (type) {
    case 'TASK_ASSIGNED':
      return '#0078D4';
    case 'MEETING_INVITE':
      return '#7C4DFF';
    case 'TEAM_LEAD_ASSIGNED':
      return '#107C41';
    case 'SCRUM_MASTER_ASSIGNED':
      return '#0288D1';
    case 'TEAM_ASSIGNED':
      return '#ED6C02';
    default:
      return '#616161';
  }
}

function getNotificationLabel(type: string): string {
  switch (type) {
    case 'TASK_ASSIGNED':
      return 'Task Assigned';
    case 'MEETING_INVITE':
      return 'Meeting Invite';
    case 'TEAM_LEAD_ASSIGNED':
      return 'Team Lead';
    case 'SCRUM_MASTER_ASSIGNED':
      return 'Scrum Master';
    case 'TEAM_ASSIGNED':
      return 'Team Added';
    default:
      return 'General';
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export const NotificationCenterPage: React.FC = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState(0);

  // ── Auto-refresh every 30 seconds ──────────────────────────────────────
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(() => {
    if (!user?.userId) return;
    api
      .get(`/notifications?recipientId=${user.userId}`)
      .then((res) => {
        const raw = res.data?.data?.content ?? res.data?.data ?? [];
        setNotifications(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchNotifications]);
  // ─────────────────────────────────────────────────────────────────────

  // ── Actions that call backend ─────────────────────────────────────────

  const handleToggleRead = async (n: BackendNotification) => {
    const endpoint = n.isRead
      ? `/notifications/${n.id}/unread`
      : `/notifications/${n.id}/read`;
    try {
      await api.put(endpoint);
    } catch {
      // Optimistic update already applied below
    }
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, isRead: !item.isRead } : item))
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      // Optimistic — remove from UI anyway
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put(`/notifications/read-all?recipientId=${user?.userId}`);
    } catch {
      // Optimistic
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNotice('All notifications marked as read.');
  };

  // ── Filtering ─────────────────────────────────────────────────────────

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || n.notificationType === typeFilter;

    if (activeTab === 1) return !n.isRead && matchesSearch && matchesType;

    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const notificationTypes = [
    'ALL',
    'TASK_ASSIGNED',
    'MEETING_INVITE',
    'TEAM_ASSIGNED',
    'TEAM_LEAD_ASSIGNED',
    'SCRUM_MASTER_ASSIGNED',
    'GENERAL',
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Notification Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time enterprise alerts for your role &mdash;{' '}
            {unreadCount > 0 ? (
              <strong style={{ color: '#D32F2F' }}>{unreadCount} unread</strong>
            ) : (
              'all caught up ✓'
            )}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<MarkAllIcon />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            sx={{ fontWeight: 700 }}
          >
            Mark All Read
          </Button>
        </Stack>
      </Box>

      {/* Notice */}
      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3 }}>
          {notice}
        </Alert>
      )}

      {/* Filter bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search notifications by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {notificationTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t === 'ALL' ? 'All Types' : getNotificationLabel(t)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`All (${notifications.length})`} sx={{ fontWeight: 700 }} />
        <Tab
          label={
            unreadCount > 0
              ? `Unread (${unreadCount})`
              : 'Unread'
          }
          sx={{ fontWeight: 700 }}
        />
      </Tabs>

      {/* List */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading your notifications…
            </Typography>
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <EmptyIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {activeTab === 1 ? 'No unread notifications — you\'re all caught up! ✓' : 'No notifications found.'}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredNotifications.map((n) => (
              <ListItem
                key={n.id}
                divider
                sx={{
                  p: 2,
                  bgcolor: n.isRead ? 'transparent' : 'rgba(0, 120, 212, 0.05)',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title={n.isRead ? 'Mark as Unread' : 'Mark as Read'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleRead(n)}
                        id={`notif-toggle-read-${n.id}`}
                      >
                        <MarkReadIcon color={n.isRead ? 'disabled' : 'primary'} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Notification">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(n.id)}
                        id={`notif-delete-${n.id}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemIcon sx={{ minWidth: 52 }}>
                  <Avatar
                    sx={{
                      bgcolor: getNotificationColor(n.notificationType),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getNotificationIcon(n.notificationType)}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5, pr: 8 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: n.isRead ? 500 : 700 }}
                      >
                        {n.title}
                      </Typography>
                      <Chip
                        label={getNotificationLabel(n.notificationType)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: getNotificationColor(n.notificationType),
                          color: '#fff',
                        }}
                      />
                      {!n.isRead && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#D32F2F',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ pr: 8 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationCenterPage;
