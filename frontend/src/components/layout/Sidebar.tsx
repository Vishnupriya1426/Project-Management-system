import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  GroupWork as TeamIcon,
  Assignment as ProjectIcon,
  CheckCircle as TaskIcon,
  ContactMail as ClientIcon,
  Event as MeetingIcon,
  CalendarMonth as CalendarIcon,
  BarChart as ReportIcon,
  Security as AuditIcon,
  Settings as SettingsIcon,
  PersonSearch as ResourceIcon,
  Flag as MilestoneIcon,
  DirectionsRun as SprintIcon,
  Warning as RiskIcon,
  Folder as DocumentIcon,
  Schedule as TimesheetIcon,
  AssignmentTurnedIn as DailyReportIcon,
  Domain as OrgIcon,
  HelpOutline as HelpIcon,
  FormatListBulleted as BacklogIcon,
  BugReport as BugIcon,
  ConfirmationNumber as TicketIcon,
  AddTask as RequestIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || 'ROLE_SUPER_ADMIN';

  // Dedicated Corporate Client Menu (7 Tailored Client Portal Modules)
  const clientMenuItems = [
    { text: 'Executive Overview', icon: <ProgressIcon />, path: '/clients/portal?tab=0' },
    { text: 'Projects & Progress', icon: <ProjectIcon />, path: '/clients/portal?tab=1' },
    { text: 'Project Requests', icon: <RequestIcon />, path: '/clients/portal?tab=2' },
    { text: 'MOUs & Vault', icon: <DocumentIcon />, path: '/clients/portal?tab=3' },
    { text: 'Support Tickets', icon: <TicketIcon />, path: '/clients/portal?tab=4' },
    { text: 'Meetings & Schedule', icon: <MeetingIcon />, path: '/clients/portal?tab=5' },
    { text: 'Settings & Profile', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Dedicated Project Manager Menu (16 Specific Delivery Modules)
  const pmMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { text: 'Backlog', icon: <BacklogIcon />, path: '/backlog' },
    { text: 'Sprints', icon: <SprintIcon />, path: '/sprints' },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Team Members', icon: <TeamIcon />, path: '/teams' },
    { text: 'Resource Allocation', icon: <ResourceIcon />, path: '/resource-allocation' },
    { text: 'Risks', icon: <RiskIcon />, path: '/risks' },
    { text: 'Issues', icon: <BugIcon />, path: '/issues' },
    { text: 'Meetings', icon: <MeetingIcon />, path: '/meetings' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Clients', icon: <ClientIcon />, path: '/clients' },
    { text: 'Milestones', icon: <MilestoneIcon />, path: '/milestones' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Super Admin & Master System Menu
  const defaultMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Organization', icon: <OrgIcon />, path: '/organization', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR_MANAGER'] },
    { text: 'Departments', icon: <BusinessIcon />, path: '/departments', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] },
    { text: 'Teams', icon: <TeamIcon />, path: '/teams', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_ENG_MANAGER'] },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_ENG_MANAGER'] },
    { text: 'Resource Allocation', icon: <ResourceIcon />, path: '/resource-allocation', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_ENG_MANAGER'] },
    { text: 'Milestones', icon: <MilestoneIcon />, path: '/milestones', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_ENG_MANAGER'] },
    { text: 'Sprints', icon: <SprintIcon />, path: '/sprints', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_ENG_MANAGER'] },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { text: 'My Projects', icon: <ProjectIcon />, path: '/my-projects', roles: ['ROLE_EMPLOYEE', 'ROLE_TEAM_LEAD'] },
    { text: 'Clients', icon: <ClientIcon />, path: '/clients', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] },
    { text: 'Meetings', icon: <MeetingIcon />, path: '/meetings' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Timesheet', icon: <TimesheetIcon />, path: '/timesheet', roles: ['ROLE_EMPLOYEE', 'ROLE_TEAM_LEAD'] },
    { text: 'Daily Work Report', icon: <DailyReportIcon />, path: '/daily-report', roles: ['ROLE_EMPLOYEE', 'ROLE_TEAM_LEAD'] },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR_MANAGER', 'ROLE_ENG_MANAGER'] },
    { text: 'Audit Logs', icon: <AuditIcon />, path: '/audit-logs', roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Dedicated Head of Department (HOD) Menu
  const hodMenuItems = [
    { text: 'Departments', icon: <BusinessIcon />, path: '/departments' },
    { text: 'Teams & Squads', icon: <TeamIcon />, path: '/teams' },
    { text: 'Resource Allocation', icon: <ResourceIcon />, path: '/resource-allocation' },
    { text: 'Department Employees', icon: <PeopleIcon />, path: '/employees' },
    { text: 'Projects', icon: <ProjectIcon />, path: '/projects' },
    { text: 'Timesheet Approvals', icon: <TimesheetIcon />, path: '/timesheet' },
    { text: 'Daily Work Reports', icon: <DailyReportIcon />, path: '/daily-report' },
    { text: 'Meetings', icon: <MeetingIcon />, path: '/meetings' },
    { text: 'Department Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const getMenuItems = () => {
    if (userRole === 'ROLE_CLIENT') {
      return clientMenuItems;
    }
    if (userRole === 'ROLE_PROJECT_MANAGER') {
      return pmMenuItems;
    }
    if (userRole === 'ROLE_ENG_MANAGER' || userRole === 'ROLE_HR_MANAGER' || userRole === 'HOD') {
      return hodMenuItems;
    }
    return defaultMenuItems.filter((item) => !item.roles || item.roles.includes(userRole));
  };

  const menuList = getMenuItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 1 }}>
        <List>
          {menuList.map((item) => {
            const currentFullPath = location.pathname + location.search;
            const isSelected =
              item.path.includes('?')
                ? currentFullPath === item.path
                : location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path) && !currentFullPath.includes('?'));

            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isSelected ? '#fff' : 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: isSelected ? 600 : 400 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1 }} />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
