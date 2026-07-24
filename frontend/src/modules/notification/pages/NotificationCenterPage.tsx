import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Event as MeetingIcon,
  Check as MarkReadIcon,
  Delete as DeleteIcon,
  Cake as BirthdayIcon,
  PersonAdd as HiringIcon,
  Business as OrgIcon,
  Search as SearchIcon,
  ConfirmationNumber as TicketIcon,
  AddTask as RequestIcon,
  Description as DocumentIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../config/axios.config';

export interface OrganizationNotification {
  id: number;
  title: string;
  organization: string;
  department: string;
  category: 'Hiring & Onboarding' | 'Birthday Celebration' | 'Department Assignment' | 'Task Assigned' | 'Meeting Reminder' | 'Project Milestone' | 'Support Ticket' | 'Project Request' | 'MOU & Document';
  employeeName?: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

export const NotificationCenterPage: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'ROLE_SUPER_ADMIN';
  const isClient = userRole === 'ROLE_CLIENT';
  const clientOrgName = (user as any)?.organization || 'Global Bank Corp';

  const [notice, setNotice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orgFilter, setOrgFilter] = useState(isClient ? clientOrgName : 'ALL');
  const [activeTab, setActiveTab] = useState(0);

  const [notifications, setNotifications] = useState<OrganizationNotification[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    api.get('/audit-logs')
      .then(() => {
        setNotifications([]);
      })
      .catch(() => {
        setNotifications([]);
      });

    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
        }
      })
      .catch(() => setOrganizations([]));
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    setNotice('All notifications marked as read.');
  };

  const handleToggleRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    // Strict Scoping for Corporate Clients
    if (isClient) {
      if (n.organization !== clientOrgName) return false;
      if (n.category === 'Birthday Celebration' || n.category === 'Hiring & Onboarding' || n.category === 'Department Assignment') {
        return false; // Filter out internal HR notices
      }
    }

    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrg = orgFilter === 'ALL' || n.organization === orgFilter;

    if (activeTab === 1) return !n.isRead && matchesSearch && matchesOrg; // Unread
    if (activeTab === 2 && isClient) return n.category === 'Project Milestone' && matchesSearch && matchesOrg;
    if (activeTab === 3 && isClient) return n.category === 'Support Ticket' && matchesSearch && matchesOrg;
    if (activeTab === 4 && isClient) return (n.category === 'Meeting Reminder' || n.category === 'Project Request' || n.category === 'MOU & Document') && matchesSearch && matchesOrg;

    if (activeTab === 2 && !isClient) return n.category === 'Birthday Celebration' && matchesSearch && matchesOrg;
    if (activeTab === 3 && !isClient) return (n.category === 'Hiring & Onboarding' || n.category === 'Department Assignment') && matchesSearch && matchesOrg;
    if (activeTab === 4 && !isClient) return (n.category === 'Task Assigned' || n.category === 'Meeting Reminder') && matchesSearch && matchesOrg;

    return matchesSearch && matchesOrg;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {isClient ? `${clientOrgName} Project Notifications` : 'Enterprise Notification Center'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isClient
              ? `Real-time status updates for your organization's active projects, milestones, support tickets, and meetings (${unreadCount} unread)`
              : `Organization-scoped alerts for birthdays, new hires, department changes, meetings, and assigned tasks (${unreadCount} unread)`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" startIcon={<MarkReadIcon />} onClick={handleMarkAllRead} sx={{ fontWeight: 700 }}>
            Mark All as Read
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setNotifications([])}>
            Clear All
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* FILTER BAR & SEARCH */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={isClient ? 12 : 7}>
            <TextField
              fullWidth
              size="small"
              placeholder={isClient ? "Search project alerts by keyword..." : "Search Notifications by Keyword, Staff Name, or Department..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>

          {!isClient && (
            <Grid item xs={12} sm={5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter Organization"
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Organizations (Enterprise Overview)</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.companyName || org.name}>
                    {org.companyName || org.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* CATEGORY TABS */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`All Alerts (${filteredNotifications.length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Unread (${unreadCount})`} sx={{ fontWeight: 700 }} />
        {isClient ? (
          <>
            <Tab label="Project Milestones 🚀" sx={{ fontWeight: 700 }} />
            <Tab label="Support Tickets 🎟️" sx={{ fontWeight: 700 }} />
            <Tab label="Meetings & Requests 📅" sx={{ fontWeight: 700 }} />
          </>
        ) : (
          <>
            <Tab label="Birthdays 🎂" sx={{ fontWeight: 700 }} />
            <Tab label="Onboarding & Depts 🎉" sx={{ fontWeight: 700 }} />
            <Tab label="Meetings & Tasks 📅" sx={{ fontWeight: 700 }} />
          </>
        )}
      </Tabs>

      {/* CLEAN NOTIFICATIONS LIST */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No project notifications found for your organization.
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
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title={n.isRead ? 'Mark Unread' : 'Mark Read'}>
                      <IconButton size="small" onClick={() => handleToggleRead(n.id)}>
                        <MarkReadIcon color={n.isRead ? 'disabled' : 'primary'} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Notification">
                      <IconButton size="small" color="error" onClick={() => handleDelete(n.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemIcon sx={{ minWidth: 52 }}>
                  {n.category === 'Project Milestone' ? (
                    <Avatar sx={{ bgcolor: '#0078D4', width: 40, height: 40 }}><ProgressIcon /></Avatar>
                  ) : n.category === 'Support Ticket' ? (
                    <Avatar sx={{ bgcolor: '#D32F2F', width: 40, height: 40 }}><TicketIcon /></Avatar>
                  ) : n.category === 'Project Request' ? (
                    <Avatar sx={{ bgcolor: '#ED6C02', width: 40, height: 40 }}><RequestIcon /></Avatar>
                  ) : n.category === 'MOU & Document' ? (
                    <Avatar sx={{ bgcolor: '#0288D1', width: 40, height: 40 }}><DocumentIcon /></Avatar>
                  ) : n.category === 'Birthday Celebration' ? (
                    <Avatar sx={{ bgcolor: '#FF4081', width: 40, height: 40 }}><BirthdayIcon /></Avatar>
                  ) : n.category === 'Hiring & Onboarding' ? (
                    <Avatar sx={{ bgcolor: '#107C41', width: 40, height: 40 }}><HiringIcon /></Avatar>
                  ) : (
                    <Avatar sx={{ bgcolor: '#7C4DFF', width: 40, height: 40 }}><MeetingIcon /></Avatar>
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: n.isRead ? 500 : 700 }}>
                        {n.title}
                      </Typography>
                      <Chip
                        label={n.category}
                        size="small"
                        color={n.category === 'Support Ticket' ? 'error' : n.category === 'Project Milestone' ? 'primary' : 'info'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: 'primary.main' }}>
                        <OrgIcon fontSize="small" /> {n.organization} • {n.department}
                      </Box>
                      • {n.time}
                    </Typography>
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
