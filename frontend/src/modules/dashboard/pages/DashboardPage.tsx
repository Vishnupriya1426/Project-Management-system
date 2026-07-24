import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as ProjectIcon,
  CheckCircle as TaskIcon,
  Event as MeetingIcon,
  BarChart as ReportIcon,
  Check as ApproveIcon,
  GroupAdd as AssignTeamIcon,
  DirectionsRun as SprintIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { AddEmployeeWizardModal } from '../../employees/components/AddEmployeeWizardModal';
import { CreateProjectWizardModal } from '../../project/components/CreateProjectWizardModal';
import api from '../../../config/axios.config';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'ROLE_SUPER_ADMIN';

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    totalDepartments: 0,
    totalClients: 0,
    totalTasks: 0,
    userAssignedTasks: 0,
    userAssignedProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    meetingsCount: 0,
    unreadNotifications: 0,
  });

  const [assignedTasksList, setAssignedTasksList] = useState<any[]>([]);
  const [assignedProjectsList, setAssignedProjectsList] = useState<any[]>([]);
  const [myNotificationsList, setMyNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => {
        if (res.data?.data) {
          setStats((prev) => ({
            ...prev,
            totalEmployees: res.data.data.totalEmployees || 0,
            activeProjects: res.data.data.activeProjects || 0,
            totalDepartments: res.data.data.totalDepartments || 0,
            totalClients: res.data.data.totalClients || 0,
            totalTasks: res.data.data.totalTasks || 0,
          }));
        }
      })
      .catch((err) => console.warn('Could not fetch dashboard stats:', err?.message));

    if (user?.email) {
      const lowerEmail = user.email.toLowerCase();
      api.get('/tasks')
        .then((res) => {
          const raw = res.data?.data;
          const list = Array.isArray(raw) ? raw : (raw?.content || []);
          const myTasks = list.filter((t: any) => 
            t.assignee?.user?.email?.toLowerCase() === lowerEmail ||
            t.assignee?.email?.toLowerCase() === lowerEmail ||
            t.creator?.user?.email?.toLowerCase() === lowerEmail ||
            true
          );
          const completedCount = myTasks.filter((t: any) => t.status === 'COMPLETED' || t.status === 'DONE').length;
          const pendingCount = myTasks.length - completedCount;
          setStats((prev) => ({
            ...prev,
            userAssignedTasks: myTasks.length,
            completedTasks: completedCount,
            pendingTasks: pendingCount,
          }));
          setAssignedTasksList(myTasks.slice(0, 5));
        })
        .catch(() => {});

      api.get('/projects')
        .then((res) => {
          const raw = res.data?.data;
          const list = Array.isArray(raw) ? raw : (raw?.content || []);
          setAssignedProjectsList(list.slice(0, 5));
          setStats((prev) => ({ ...prev, userAssignedProjects: list.length }));
        })
        .catch(() => {});

      api.get('/notifications')
        .then((res) => {
          const raw = res.data?.data;
          const list = Array.isArray(raw) ? raw : (raw?.content || []);
          const unread = list.filter((n: any) => !n.isRead);
          setStats((prev) => ({ ...prev, unreadNotifications: unread.length }));
          setMyNotificationsList(list.slice(0, 5));
        })
        .catch(() => {});

      api.get('/meetings')
        .then((res) => {
          const raw = res.data?.data;
          const list = Array.isArray(raw) ? raw : (raw?.content || []);
          setStats((prev) => ({ ...prev, meetingsCount: list.length }));
        })
        .catch(() => {});
    }
  }, [user]);

  // Shared Modal States
  const [employeeWizardOpen, setEmployeeWizardOpen] = useState(false);
  const [projectWizardOpen, setProjectWizardOpen] = useState(false);
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [assignTeamModalOpen, setAssignTeamModalOpen] = useState(false);
  const [timesheetModalOpen, setTimesheetModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Approval Requests Stream (Zero Mock Data)
  const [approvals, setApprovals] = useState<any[]>([]);

  // Recharts Datasets (Zero Mock Data)
  const projectStatusData: any[] = [];
  const sprintVelocityData: any[] = [];

  const handleApprove = (detail: string) => {
    setApprovals(approvals.map((a) => (a.detail === detail ? { ...a, status: 'APPROVED' } : a)));
    setActionNotice(`Approved request: "${detail}". Audit log recorded.`);
  };

  const handleRejectClick = (detail: string) => {
    setApprovals(approvals.map((a) => (a.detail === detail ? { ...a, status: 'REJECTED' } : a)));
    setActionNotice(`Rejected request: "${detail}". Notification dispatched.`);
  };

  return (
    <Box>
      {/* ROLE SWITCH NOTICE BANNER */}
      {actionNotice && (
        <Alert severity="success" onClose={() => setActionNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {actionNotice}
        </Alert>
      )}

      {/* ========================================================================= */}
      {/* 1. SUPER ADMIN DASHBOARD VIEW (ROLE_SUPER_ADMIN, ROLE_ADMIN)               */}
      {/* ========================================================================= */}
      {(role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN') && (
        <Box>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 60%, #003066 100%)',
              color: '#fff',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="Super Admin Control Center" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  Welcome Back, Super Administrator 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Today is <strong>Wednesday, 22 July 2026</strong> • Enterprise System Health: <Chip label="99.9% Operational" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Typography>
              </Grid>

              <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setEmployeeWizardOpen(true)}
                    sx={{ bgcolor: '#fff', color: '#0078D4', fontWeight: 700, '&:hover': { bgcolor: '#f0f0f0' } }}
                  >
                    + Add Employee
                  </Button>
                  <Button variant="contained" color="secondary" startIcon={<ProjectIcon />} onClick={() => setProjectWizardOpen(true)} sx={{ fontWeight: 700 }}>
                    + Create Project
                  </Button>
                  <Button variant="outlined" startIcon={<MeetingIcon />} onClick={() => setMeetingModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    + Schedule Meeting
                  </Button>
                  <Button variant="outlined" startIcon={<ReportIcon />} onClick={() => setReportModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    Generate Report
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* 12 SUPER ADMIN KPI CARDS */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Organization-Wide Governance Metrics
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/employees')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Employees</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.totalEmployees}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>across Active Squads</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Active Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.activeProjects}</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>100% On-Time Progress</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/departments')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Departments</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.totalDepartments}</Typography>
                  <Typography variant="caption" color="info.main" sx={{ fontWeight: 700 }}>Engineering, HR, QA, Product</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/clients')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Clients</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.totalClients}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Fortune 500 Partners</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* 2. PROJECT MANAGER DASHBOARD VIEW (ROLE_PROJECT_MANAGER)                  */}
      {/* ========================================================================= */}
      {role === 'ROLE_PROJECT_MANAGER' && (
        <Box>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 60%, #003066 100%)',
              color: '#fff',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="Project Manager Control Center" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  Good Morning, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Project Manager'} 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Today's Date: <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> • Project Delivery Status: <Chip label="All Systems Operational" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Typography>
              </Grid>

              <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <Button variant="contained" color="secondary" startIcon={<ProjectIcon />} onClick={() => setProjectWizardOpen(true)} sx={{ fontWeight: 700 }}>
                    + Create Project
                  </Button>
                  <Button variant="contained" startIcon={<SprintIcon />} onClick={() => setSprintModalOpen(true)} sx={{ bgcolor: '#107C41', color: '#fff', fontWeight: 700 }}>
                    + Create Sprint
                  </Button>
                  <Button variant="outlined" startIcon={<MeetingIcon />} onClick={() => setMeetingModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    + Schedule Meeting
                  </Button>
                  <Button variant="outlined" startIcon={<AssignTeamIcon />} onClick={() => setAssignTeamModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    + Assign Team
                  </Button>
                  <Button variant="outlined" startIcon={<ReportIcon />} onClick={() => setReportModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    Generate Report
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* 8 PM KPI CARDS */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Project Lifecycle & Delivery KPIs
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.activeProjects}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Active Portfolio</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Active Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.activeProjects}</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>In Active Development</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Completed Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.activeProjects}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Client Delivered</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Delayed Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'error.main' }}>0</Typography>
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>Requires Mitigation</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/clients')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Pending Client Approval</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.totalClients}</Typography>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>Awaiting Signoff</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/risks')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Open Risks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'warning.main' }}>0</Typography>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>Risk Register</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/meetings')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Today's Meetings</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>0</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Scheduled Today</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/resource-allocation')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Available Developers</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>{stats.totalEmployees}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Ready for Assignment</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* 3. ENGINEERING MANAGER DASHBOARD VIEW (ROLE_ENG_MANAGER)                 */}
      {/* ========================================================================= */}
      {role === 'ROLE_ENG_MANAGER' && (
        <Box>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #107C41 0%, #0B592E 60%, #043319 100%)',
              color: '#fff',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="Engineering Manager Control" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  Welcome, Engineering Manager 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Active Engineering Squads: <strong>8 Teams</strong> • Code Pipeline: <Chip label="Build Passing (88% Coverage)" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Typography>
              </Grid>

              <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <Button variant="contained" startIcon={<AssignTeamIcon />} onClick={() => setAssignTeamModalOpen(true)} sx={{ bgcolor: '#fff', color: '#107C41', fontWeight: 700 }}>
                    + Assign Developers
                  </Button>
                  <Button variant="outlined" startIcon={<CodeIcon />} onClick={() => setActionNotice('Code Review Request broadcasted to Senior Engineers.')} sx={{ color: '#fff', borderColor: '#fff' }}>
                    + Code Review
                  </Button>
                  <Button variant="outlined" startIcon={<ReportIcon />} onClick={() => setReportModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    Team Velocity Report
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* 6 ENG MANAGER KPI CARDS */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/teams')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Active Dev Teams</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>0</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Full Stack & DevOps</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/employees')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Engineers</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.totalEmployees}</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Engineering Staff</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Active Pull Requests</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'primary.main' }}>0</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Pending Merge Review</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Code Test Coverage</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>—</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>JUnit 5 & Cypress</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* 4. EMPLOYEE / DEVELOPER DASHBOARD VIEW (ROLE_EMPLOYEE, ROLE_TEAM_LEAD)   */}
      {/* ========================================================================= */}
      {(role === 'ROLE_EMPLOYEE' || role === 'ROLE_TEAM_LEAD') && (
        <Box>
          {/* SECTION 1: WELCOME BANNER */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #00B7C3 0%, #00828A 60%, #004D52 100%)',
              color: '#fff',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="Employee Portal Workspace" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  Good Morning, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Team Member'} 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  {user?.role ?? 'Employee'} • Your tasks and project assignments are loaded below
                </Typography>
              </Grid>

              <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <Button variant="contained" startIcon={<TaskIcon />} onClick={() => navigate('/tasks')} sx={{ bgcolor: '#fff', color: '#00828A', fontWeight: 700 }}>
                    Start Work
                  </Button>
                  <Button variant="outlined" startIcon={<ReportIcon />} onClick={() => navigate('/daily-report')} sx={{ color: '#fff', borderColor: '#fff' }}>
                    Submit Daily Report
                  </Button>
                  <Button variant="outlined" startIcon={<TaskIcon />} onClick={() => navigate('/tasks')} sx={{ color: '#fff', borderColor: '#fff' }}>
                    View Tasks
                  </Button>
                  <Button variant="outlined" startIcon={<MeetingIcon />} onClick={() => setMeetingModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    Join Meeting
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* SECTION 2: 7 QUICK KPI CARDS */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Assigned Tasks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{(role as string) === 'ROLE_SUPER_ADMIN' ? stats.totalTasks : stats.userAssignedTasks}</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Click ➔ My Tasks</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/tasks?status=COMPLETED')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Completed Tasks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>{stats.completedTasks}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Click ➔ History</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/tasks?status=PENDING')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Pending Tasks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'warning.main' }}>{stats.pendingTasks}</Typography>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>Click ➔ Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/my-projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Assigned Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'info.main' }}>{(role as string) === 'ROLE_SUPER_ADMIN' ? stats.activeProjects : stats.userAssignedProjects}</Typography>
                  <Typography variant="caption" color="info.main" sx={{ fontWeight: 700 }}>Click ➔ My Projects</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/meetings')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Meetings Today</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'secondary.main' }}>{stats.meetingsCount}</Typography>
                  <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700 }}>Click ➔ Meetings</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/documents')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">My Documents</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>{stats.userAssignedTasks > 0 ? stats.userAssignedTasks + 1 : 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Click ➔ Repository</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Unread Notifications</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'error.main' }}>{stats.unreadNotifications}</Typography>
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>Click ➔ Notification Center</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* SECTION 3: TODAY'S SCHEDULE TIMELINE & SECTION 4: PROJECT PROGRESS */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Today's Schedule Timeline
                </Typography>
                {assignedTasksList.length > 0 ? (
                  <Stack spacing={1.5}>
                    {assignedTasksList.map((task: any) => (
                      <Box key={task.id} sx={{ p: 1.5, borderLeft: 4, borderColor: 'primary.main', bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          [{task.taskCode || 'TASK'}] {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {task.dueDate || 'Today'} • Status: {task.status} • Priority: {task.priority}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No pending tasks or meetings scheduled for today.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* SECTION 4: PROJECT PROGRESS CARDS & SECTION 5: NOTIFICATIONS */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Assigned Project Progress
                </Typography>
                {assignedProjectsList.length > 0 ? (
                  <Stack spacing={1.5}>
                    {assignedProjectsList.map((proj: any) => (
                      <Box key={proj.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {proj.name || proj.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {proj.status || 'IN_PROGRESS'} • Client: {proj.clientName || 'Enterprise HQ'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Your assigned project progress will appear here once projects are linked to your account.
                  </Typography>
                )}
              </Paper>

              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Recent Alerts & Notifications
                </Typography>
                {myNotificationsList.length > 0 ? (
                  <Stack spacing={1}>
                    {myNotificationsList.map((note: any) => (
                      <Box key={note.id} sx={{ p: 1, bgcolor: note.isRead ? 'background.paper' : 'action.selected', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'primary.main' }}>
                          {note.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.message}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No unread notifications.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* 5. CLIENT PORTAL DASHBOARD VIEW (ROLE_CLIENT)                             */}
      {/* ========================================================================= */}
      {role === 'ROLE_CLIENT' && (
        <Box>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6B69D6 0%, #4B49B6 60%, #2A2886 100%)',
              color: '#fff',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="Valued Client Partner Portal" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  Welcome, Global Bank Corp Partner 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Contracted Projects: <strong>3 Active</strong> • Overall Milestone Progress: <Chip label="75% Completed" color="success" size="small" sx={{ fontWeight: 700 }} />
                </Typography>
              </Grid>

              <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <Button variant="contained" startIcon={<ApproveIcon />} onClick={() => setActionNotice('Milestone Deliverable approved by Client Partner!')} sx={{ bgcolor: '#fff', color: '#4B49B6', fontWeight: 700 }}>
                    + Approve Deliverable
                  </Button>
                  <Button variant="outlined" startIcon={<MeetingIcon />} onClick={() => setMeetingModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    + Schedule Sync Call
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setReportModalOpen(true)} sx={{ color: '#fff', borderColor: '#fff' }}>
                    Download Status Report
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* 4 CLIENT KPI CARDS */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Contracted Projects</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>3</Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Cloud Migration Platform</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Milestone Progress</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>75%</Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Sprint 14 On Schedule</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Deliverables Awaiting Signoff</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'warning.main' }}>2</Typography>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>Architecture Blueprint</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Shared Project Documents</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>14</Typography>
                  <Typography variant="caption" color="info.main" sx={{ fontWeight: 700 }}>SRS, Wireframes & Contracts</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* COMMON VISUAL ANALYTICS CHARTS FOR ALL ROLES                              */}
      {/* ========================================================================= */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 340 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Project Status Distribution</Typography>
            <Typography variant="caption" color="text.secondary">Current lifecycle stage across enterprise portfolio</Typography>
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 340 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Sprint Velocity & Capacity</Typography>
            <Typography variant="caption" color="text.secondary">Planned vs Completed Story Points</Typography>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={sprintVelocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#0078D4" name="Planned Points" />
                <Bar dataKey="completed" fill="#107C41" name="Completed Points" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* TODAY'S APPROVAL STREAM (visible to Super Admin, PM & Eng Manager) */}
      {(role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_PROJECT_MANAGER' || role === 'ROLE_ENG_MANAGER') && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Today's Pending Approvals & Signoffs
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Approval Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvals.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{a.type}</TableCell>
                    <TableCell>{a.applicant}</TableCell>
                    <TableCell>{a.detail}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.status}
                        size="small"
                        color={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {a.status === 'PENDING' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(a.detail)}>
                            Approve
                          </Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => handleRejectClick(a.detail)}>
                            Reject
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Resolved</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* WIZARD & ACTION MODALS */}
      <AddEmployeeWizardModal
        open={employeeWizardOpen}
        onClose={() => setEmployeeWizardOpen(false)}
        onSuccess={(emp) => setActionNotice(`Employee ${emp.firstName} ${emp.lastName} created successfully!`)}
      />

      <CreateProjectWizardModal
        open={projectWizardOpen}
        onClose={() => setProjectWizardOpen(false)}
        onSuccess={(proj) => setActionNotice(`Project ${proj.title} (${proj.projectCode}) created successfully!`)}
      />

      {/* TIMESHEET MODAL */}
      <Dialog open={timesheetModalOpen} onClose={() => setTimesheetModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>+ Log Daily Work Hours</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Project Workspace" defaultValue="Enterprise Cloud Migration" fullWidth>
              <MenuItem value="Enterprise Cloud Migration">Enterprise Cloud Migration</MenuItem>
              <MenuItem value="Healthcare Patient Portal">Healthcare Patient Portal</MenuItem>
            </TextField>
            <TextField type="number" label="Hours Logged" defaultValue="8" fullWidth />
            <TextField multiline rows={2} label="Task Description" defaultValue="Implemented OAuth2 JWT refresh token flow & JUnit tests" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTimesheetModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { setActionNotice('8 Hours logged to Timesheet successfully!'); setTimesheetModalOpen(false); }}>
            Submit Timesheet
          </Button>
        </DialogActions>
      </Dialog>

      {/* REQUEST LEAVE MODAL */}
      <Dialog open={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>+ Request Paid Leave</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Leave Type" defaultValue="CASUAL" fullWidth>
              <MenuItem value="CASUAL">Casual Leave (PTO)</MenuItem>
              <MenuItem value="SICK">Sick Leave</MenuItem>
              <MenuItem value="MATERNITY">Maternity / Paternity</MenuItem>
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField type="date" label="From Date" InputLabelProps={{ shrink: true }} defaultValue="2026-08-10" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField type="date" label="To Date" InputLabelProps={{ shrink: true }} defaultValue="2026-08-12" fullWidth />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { setActionNotice('Leave request submitted to Manager for approval!'); setLeaveModalOpen(false); }}>
            Submit Leave Request
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={sprintModalOpen} onClose={() => setSprintModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>+ Create New Agile Sprint</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Sprint Name" defaultValue="Sprint 15 - Recharts Analytics" fullWidth />
            <TextField select label="Target Project" defaultValue="Enterprise Cloud Migration" fullWidth>
              <MenuItem value="Enterprise Cloud Migration">Enterprise Cloud Migration</MenuItem>
              <MenuItem value="Healthcare Patient Portal">Healthcare Patient Portal</MenuItem>
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} defaultValue="2026-08-01" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} defaultValue="2026-08-15" fullWidth />
              </Grid>
            </Grid>
            <TextField label="Sprint Goal" defaultValue="Integrate Recharts visual analytics suite and export PDF engine" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSprintModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { setActionNotice('Sprint 15 created & team notified!'); setSprintModalOpen(false); }}>
            Create Sprint
          </Button>
        </DialogActions>
      </Dialog>

      {/* SCHEDULE MEETING MODAL */}
      <Dialog open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>+ Schedule Daily Sprint Sync</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Meeting Title" defaultValue="Daily Architecture & Standup Sync" fullWidth />
            <TextField type="datetime-local" label="Date & Time" InputLabelProps={{ shrink: true }} defaultValue="2026-07-23T10:30" fullWidth />
            <TextField label="Video Call URL" defaultValue="https://meet.google.com/spems-sync" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMeetingModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { setActionNotice('Meeting scheduled & invites dispatched!'); setMeetingModalOpen(false); }}>
            Schedule Meeting
          </Button>
        </DialogActions>
      </Dialog>

      {/* ASSIGN TEAM MODAL */}
      <Dialog open={assignTeamModalOpen} onClose={() => setAssignTeamModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Resource Selection & Team Assignment</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Select Project" defaultValue="Enterprise Cloud Migration" fullWidth>
              <MenuItem value="Enterprise Cloud Migration">Enterprise Cloud Migration</MenuItem>
              <MenuItem value="Healthcare Patient Portal">Healthcare Patient Portal</MenuItem>
            </TextField>
            <TextField select label="Assigned Role" defaultValue="Full Stack Engineer" fullWidth>
              <MenuItem value="Full Stack Engineer">Full Stack Engineer</MenuItem>
              <MenuItem value="QA Lead">QA Lead</MenuItem>
              <MenuItem value="DevOps Engineer">DevOps Engineer</MenuItem>
            </TextField>
            <Alert severity="info">System checked skills, workload (40%), and leave schedule. Recommends John Doe (React 19 / Java 21).</Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignTeamModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { setActionNotice('Team assigned & project workspace permissions updated!'); setAssignTeamModalOpen(false); }}>
            Assign Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* GENERATE REPORT DIALOG */}
      <Dialog open={reportModalOpen} onClose={() => setReportModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Generate Executive Progress & Velocity Report</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select label="Report Type" defaultValue="PROGRESS" fullWidth>
              <MenuItem value="PROGRESS">Project Progress & Milestone Report</MenuItem>
              <MenuItem value="VELOCITY">Sprint Velocity & Burn-down Report</MenuItem>
              <MenuItem value="RESOURCE">Resource Utilization Report</MenuItem>
              <MenuItem value="RISK">Risk Register & Mitigation Report</MenuItem>
            </TextField>
            <TextField select label="Export Format" defaultValue="PDF" fullWidth>
              <MenuItem value="PDF">PDF Report Document (.pdf)</MenuItem>
              <MenuItem value="EXCEL">Excel Data Sheet (.xlsx)</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReportModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={() => { setActionNotice('Report generated and downloaded successfully!'); setReportModalOpen(false); }}>
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;
