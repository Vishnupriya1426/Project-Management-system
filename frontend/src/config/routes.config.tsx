import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';

// Direct Page Imports
import LandingPage from '../modules/public/pages/LandingPage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../modules/auth/pages/VerifyEmailPage';
import ChangePasswordPage from '../modules/auth/pages/ChangePasswordPage';
import OtpVerificationPage from '../modules/auth/pages/OtpVerificationPage';

import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import EmployeeListPage from '../modules/employees/pages/EmployeeListPage';
import DepartmentListPage from '../modules/department/pages/DepartmentListPage';
import TeamListPage from '../modules/team/pages/TeamListPage';
import ProjectListPage from '../modules/project/pages/ProjectListPage';
import ProjectDetailPage from '../modules/project/pages/ProjectDetailPage';
import MyProjectsPage from '../modules/project/pages/MyProjectsPage';
import ResourceAllocationPage from '../modules/project/pages/ResourceAllocationPage';
import SprintListPage from '../modules/project/pages/SprintListPage';
import MilestoneListPage from '../modules/project/pages/MilestoneListPage';
import RiskListPage from '../modules/project/pages/RiskListPage';
import TaskListPage from '../modules/task/pages/TaskListPage';
import ClientListPage from '../modules/client/pages/ClientListPage';
import ClientPortalPage from '../modules/client/pages/ClientPortalPage';
import MeetingListPage from '../modules/meeting/pages/MeetingListPage';
import CalendarPage from '../modules/meeting/pages/CalendarPage';
import DocumentListPage from '../modules/document/pages/DocumentListPage';
import TimesheetPage from '../modules/timesheet/pages/TimesheetPage';
import DailyReportPage from '../modules/report/pages/DailyReportPage';
import NotificationCenterPage from '../modules/notification/pages/NotificationCenterPage';
import UserProfilePage from '../modules/profile/pages/UserProfilePage';
import OrganizationPage from '../modules/organization/pages/OrganizationPage';
import HelpPage from '../modules/help/pages/HelpPage';
import BacklogPage from '../modules/project/pages/BacklogPage';
import IssueListPage from '../modules/project/pages/IssueListPage';
import ReportPage from '../modules/report/pages/ReportPage';
import AuditLogListPage from '../modules/audit/pages/AuditLogListPage';
import SettingsPage from '../modules/settings/pages/SettingsPage';

const PageSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress size={40} color="primary" />
  </Box>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageSkeleton />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* PORTAL 1: Public Corporate Landing Website */}
      <Route path="/welcome" element={<LandingPage />} />

      {/* PORTAL 2: Authentication Portal */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/otp-verification" element={<OtpVerificationPage />} />

      {/* PORTAL 3-6: Protected Enterprise Workspace Portals */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="organization" element={<OrganizationPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="departments" element={<DepartmentListPage />} />
        <Route path="teams" element={<TeamListPage />} />
        <Route path="projects" element={<ProjectListPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="my-projects" element={<MyProjectsPage />} />
        <Route path="backlog" element={<BacklogPage />} />
        <Route path="issues" element={<IssueListPage />} />
        <Route path="resource-allocation" element={<ResourceAllocationPage />} />
        <Route path="sprints" element={<SprintListPage />} />
        <Route path="milestones" element={<MilestoneListPage />} />
        <Route path="risks" element={<RiskListPage />} />
        <Route path="tasks" element={<TaskListPage />} />
        <Route path="clients" element={<ClientListPage />} />
        <Route path="clients/:id" element={<ClientPortalPage />} />
        <Route path="meetings" element={<MeetingListPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="documents" element={<DocumentListPage />} />
        <Route path="timesheet" element={<TimesheetPage />} />
        <Route path="daily-report" element={<DailyReportPage />} />
        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="audit-logs" element={<AuditLogListPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};
