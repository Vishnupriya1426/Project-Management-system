import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Menu,
  Drawer,
  Tabs,
  Tab,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LockReset as LockResetIcon,
  AssignmentInd as AssignIcon,
  Search as SearchIcon,
  Business as OrgIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { AddEmployeeWizardModal } from '../components/AddEmployeeWizardModal';
import { EditEmployeeWizardModal } from '../components/EditEmployeeWizardModal';
import { AssignProjectDialogModal } from '../components/AssignProjectDialogModal';
import { TransferDepartmentModal } from '../components/TransferDepartmentModal';
import api from '../../../config/axios.config';

interface Employee {
  id: number;
  empId: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  department: string;
  role: string;
  designation: string;
  manager: string;
  projectsCount: number;
  tasksCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  joiningDate: string;
  avatar: string;
  primarySkill: string;
}

export const EmployeeListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orgFilter, setOrgFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  // Selected Employee for View Drawer
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Row Action Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuEmp, setActiveMenuEmp] = useState<Employee | null>(null);

  // Wizard & Dialog Modals
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editWizardOpen, setEditWizardOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningEmp, setAssigningEmp] = useState<Employee | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferringEmp, setTransferringEmp] = useState<Employee | null>(null);

  // Reset Password Modal
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resettingEmp, setResettingEmp] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('Password123');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const loadEmployees = () => {
    api.get('/employees?size=100')
      .then((res) => {
        const raw = res.data?.data?.content || res.data?.data;
        if (Array.isArray(raw)) {
          const mapped: Employee[] = raw.map((e: any) => {
            const firstName = e.firstName || 'Employee';
            const lastName = e.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const avatarInitial = firstName.charAt(0).toUpperCase();

            return {
              id: e.id,
              empId: e.employeeCode || `EMP-2026-${1000 + e.id}`,
              name: fullName,
              email: e.email || e.user?.email || `${firstName.toLowerCase()}@spems.com`,
              phone: e.phone || 'N/A',
              organization: e.organization || 'SPEMS Enterprise HQ',
              department: e.departmentName || e.department?.name || 'General',
              role: e.role || e.user?.role?.name || 'ROLE_EMPLOYEE',
              designation: e.designation || 'Staff Member',
              manager: e.reportingManager ? `${e.reportingManager.firstName} ${e.reportingManager.lastName}` : (e.manager || 'Executive Lead'),
              projectsCount: e.projectsCount != null ? e.projectsCount : 0,
              tasksCount: e.tasksCount != null ? e.tasksCount : 0,
              status: e.status || 'ACTIVE',
              joiningDate: e.joiningDate || e.hireDate || 'N/A',
              avatar: e.avatarUrl || avatarInitial,
              primarySkill: e.designation || 'Staff Member',
            };
          });
          setEmployees(mapped);
        } else {
          setEmployees([]);
        }
      })
      .catch(() => setEmployees([]));
  };

  useEffect(() => {
    loadEmployees();

    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
        }
      })
      .catch(() => setOrganizations([]));
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, emp: Employee) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuEmp(emp);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenuEmp(null);
  };

  const handleOpenViewDrawer = (emp: Employee) => {
    setSelectedEmp(emp);
    setDrawerOpen(true);
    handleMenuClose();
  };

  const handleOpenEditWizard = (emp: Employee) => {
    setEditingEmp(emp);
    setEditWizardOpen(true);
    handleMenuClose();
  };

  const handleOpenAssignModal = (emp: Employee) => {
    setAssigningEmp(emp);
    setAssignDialogOpen(true);
    handleMenuClose();
  };

  const handleOpenTransferModal = (emp: Employee) => {
    setTransferringEmp(emp);
    setTransferModalOpen(true);
    handleMenuClose();
  };

  const handleOpenResetPassword = (emp: Employee) => {
    setResettingEmp(emp);
    setNewPassword('Password123');
    setResetPasswordOpen(true);
    handleMenuClose();
  };

  const handleResetPasswordSubmit = async () => {
    if (!resettingEmp || !newPassword) return;
    try {
      await api.put(`/employees/${resettingEmp.id}/password`, { password: newPassword });
      setNotice(`Password reset successfully for ${resettingEmp.name}! Email: ${resettingEmp.email} | New Password: ${newPassword}`);
      setResetPasswordOpen(false);
    } catch (err: any) {
      setNotice(err.response?.data?.message || 'Failed to reset employee password.');
    }
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    api.put(`/employees/${emp.id}`, { status: newStatus })
      .then(() => {
        setNotice(`Employee ${emp.name} account status updated to ${newStatus}.`);
        loadEmployees();
      })
      .catch(() => setNotice('Failed to update status.'));
    handleMenuClose();
  };

  const handleDeleteEmployee = (emp: Employee) => {
    api.delete(`/employees/${emp.id}`)
      .then(() => {
        setNotice(`Employee ${emp.name} deleted successfully.`);
        loadEmployees();
      })
      .catch(() => setNotice('Failed to delete employee.'));
    handleMenuClose();
  };

  const handleEmployeeCreated = (newEmpData: any) => {
    setNotice(`Employee ${newEmpData.firstName} ${newEmpData.lastName} created successfully! Database & Audit Log updated.`);
    loadEmployees();
  };

  const handleEmployeeUpdated = (updatedEmp: any) => {
    setNotice(`Employee ${updatedEmp.name} profile updated in database successfully!`);
    loadEmployees();
  };

  const filteredEmployees = employees.filter((e: Employee) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.primarySkill.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = orgFilter === 'ALL' || e.organization === orgFilter;
    const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesOrg && matchesDept && matchesStatus;
  });

  const tabLabels = [
    'Overview', 'Personal', 'Professional', 'Skills', 'Projects',
    'Tasks', 'Meetings', 'Leaves', 'Attendance', 'Assets',
    'Documents', 'Performance', 'Activity & Audit'
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Employee Directory & Enterprise Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Enterprise Employees across Organizations & Subsidiaries
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setWizardOpen(true)}>
            + Add Employee
          </Button>
          <Button variant="outlined" startIcon={<ImportIcon />}>Import Excel</Button>
          <Button variant="outlined" startIcon={<ExportIcon />}>Export Excel</Button>
          <Button variant="outlined" startIcon={<ExportIcon />}>Export PDF</Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search ID, Name, Email, Skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter Organization"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Organizations</MenuItem>
              <MenuItem value="SPEMS Enterprise HQ">SPEMS Enterprise HQ</MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.companyName || org.name}>
                  {org.companyName || org.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Product">Product Management</MenuItem>
              <MenuItem value="Quality Assurance">Quality Assurance</MenuItem>
              <MenuItem value="Human Resources">Human Resources</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              <MenuItem value="ON_LEAVE">ON LEAVE</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Employee ID & Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{emp.avatar}</Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>
                          {emp.empId}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {emp.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                      <OrgIcon fontSize="small" color="primary" />
                      {emp.organization}
                    </Box>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>
                    <Chip label={emp.role.replace('ROLE_', '')} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>{emp.manager}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.status}
                      size="small"
                      color={emp.status === 'ACTIVE' ? 'success' : emp.status === 'ON_LEAVE' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, emp)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ACTION MENU */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        disableEnforceFocus
        disableRestoreFocus
      >
        <MenuItem onClick={() => activeMenuEmp && handleOpenViewDrawer(activeMenuEmp)}>
          <ViewIcon sx={{ mr: 1 }} /> View Employee Details
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleOpenEditWizard(activeMenuEmp)}>
          <EditIcon sx={{ mr: 1 }} /> Edit Employee
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleOpenAssignModal(activeMenuEmp)}>
          <AssignIcon sx={{ mr: 1 }} /> Assign Project & Team
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleOpenTransferModal(activeMenuEmp)}>
          <OrgIcon sx={{ mr: 1 }} /> Transfer Department
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleOpenResetPassword(activeMenuEmp)}>
          <LockResetIcon sx={{ mr: 1 }} /> Reset Password
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleToggleStatus(activeMenuEmp)}>
          <EditIcon sx={{ mr: 1 }} /> Activate / Deactivate Account
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleDeleteEmployee(activeMenuEmp)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Employee
        </MenuItem>
      </Menu>

      {/* RESET PASSWORD DIALOG */}
      <Dialog open={resetPasswordOpen} onClose={() => setResetPasswordOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>🔑 Reset Employee Password</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
            {resettingEmp?.name} ({resettingEmp?.email})
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="New Password *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetPasswordOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleResetPasswordSubmit} sx={{ fontWeight: 700 }}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* DRAWER FOR EMPLOYEE DETAILS */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 650 }, p: 3 } }}>
        {selectedEmp && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontSize: 24, fontWeight: 700 }}>{selectedEmp.avatar}</Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedEmp.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedEmp.designation} • {selectedEmp.empId}</Typography>
              </Box>
            </Box>

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              {tabLabels.map((lbl, i) => (
                <Tab key={i} label={lbl} sx={{ fontWeight: 600 }} />
              ))}
            </Tabs>

            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Employee Overview</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Hired Organization</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedEmp.organization}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Corporate Email</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmp.email}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Phone Number</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmp.phone}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmp.department}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Reporting Manager</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEmp.manager}</Typography></Grid>
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* WIZARDS */}
      <AddEmployeeWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleEmployeeCreated}
      />

      {editingEmp && (
        <EditEmployeeWizardModal
          open={editWizardOpen}
          onClose={() => setEditWizardOpen(false)}
          employee={editingEmp}
          onSuccess={handleEmployeeUpdated}
        />
      )}

      {assigningEmp && (
        <AssignProjectDialogModal
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          employee={assigningEmp}
          onSuccess={() => loadEmployees()}
        />
      )}

      {transferringEmp && (
        <TransferDepartmentModal
          open={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          employee={transferringEmp}
          onSuccess={() => loadEmployees()}
        />
      )}
    </Box>
  );
};

export default EmployeeListPage;
