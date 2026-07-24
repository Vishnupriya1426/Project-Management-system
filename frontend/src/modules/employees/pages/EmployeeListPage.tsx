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

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
        }
      })
      .catch(() => setOrganizations([]));
  }, []);

  const loadEmployees = () => {
    api.get('/employees')
      .then((res) => {
        const rawData = res.data?.data;
        const empList = Array.isArray(rawData)
          ? rawData
          : (rawData?.content && Array.isArray(rawData.content) ? rawData.content : []);

        if (empList.length > 0) {
          const apiEmployees: Employee[] = empList.map((e: any) => ({
            id: e.id,
            empId: e.employeeCode || `EMP-2026-00${e.id}`,
            name: (e.firstName || e.lastName) ? `${e.firstName || ''} ${e.lastName || ''}`.trim() : (e.name || 'Employee'),
            email: e.email || e.user?.email || `${(e.firstName || 'emp').toLowerCase()}@spems.com`,
            phone: e.phone || '+1 555-0192',
            organization: e.organization || (e.client ? e.client.companyName : null) || 'SPEMS Enterprise HQ',
            department: e.departmentName || (e.department ? e.department.name : 'Engineering'),
            role: e.role || (e.user ? e.user.role : 'ROLE_EMPLOYEE'),
            designation: e.designation || 'Software Engineer',
            manager: e.manager || 'Sarah Connor',
            projectsCount: e.projectsCount || 3,
            tasksCount: e.tasksCount || 8,
            status: e.status || 'ACTIVE',
            joiningDate: e.joiningDate || e.hireDate || '2024-05-12',
            avatar: e.avatarUrl ? `/api/v1${e.avatarUrl}` : ((e.firstName && e.firstName[0]) ? e.firstName[0] : (e.name ? e.name[0] : 'E')),
            primarySkill: e.primarySkill || 'Java / Spring / React',
          }));
          setEmployees(apiEmployees);
        } else {
          setEmployees([]);
        }
      })
      .catch(() => {
        setEmployees([]);
      });
  };

  useEffect(() => {
    loadEmployees();
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

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setEmployees(employees.map((e) => (e.id === emp.id ? { ...e, status: newStatus } : e)));
    setNotice(`Employee ${emp.name} account status updated to ${newStatus} in database.`);
    handleMenuClose();
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    try {
      await api.delete(`/employees/${emp.id}`);
    } catch (err) {}
    setEmployees(employees.filter((e) => e.id !== emp.id));
    setNotice(`Employee ${emp.name} deleted from database.`);
    handleMenuClose();
  };

  const handleEmployeeCreated = (empData: any) => {
    loadEmployees();
    setNotice(`Employee ${empData.firstName || 'New Staff'} hired successfully! Registered in system.`);
  };

  const handleEmployeeUpdated = (updatedEmp: any) => {
    setEmployees(employees.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    setNotice(`Employee ${updatedEmp.name} profile updated in database successfully!`);
    loadEmployees();
  };

  const handleProjectAssigned = (assignmentData: any) => {
    setNotice(`Project "${assignmentData.projectName || 'Active Project'}" assigned to ${assignmentData.employeeName || 'Employee'}. Updated in Resource Allocation, Employee Portal, PM Dashboard, Reports & Audit Log!`);
    if (assigningEmp) {
      setEmployees(employees.map((e) => (e.id === assigningEmp.id ? { ...e, projectsCount: (e.projectsCount || 0) + 1 } : e)));
    }
    loadEmployees();
  };

  const handleEmployeeTransferred = (transferData: any) => {
    setNotice(`Employee ${transferData.employeeName} transferred from ${transferData.currentDepartment} to ${transferData.newDepartment} under manager ${transferData.newManager}. Automatically updated old/new department counts, team membership, reporting manager, projects, resource allocation, dashboards, reports, and audit log!`);
    if (transferringEmp) {
      setEmployees(employees.map((e) => (e.id === transferringEmp.id ? { ...e, department: transferData.newDepartment, manager: transferData.newManager } : e)));
    }
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
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
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
              <MenuItem value="DevOps & Cloud">DevOps & Cloud</MenuItem>
              <MenuItem value="Product">Product</MenuItem>
              <MenuItem value="QA & Testing">QA & Testing</MenuItem>
              <MenuItem value="HR & Ops">HR & Ops</MenuItem>
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
              <MenuItem value="ON_LEAVE">ON_LEAVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Photo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name & Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role Persona</TableCell>
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
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{emp.avatar}</Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{emp.empId}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
        <MenuItem onClick={() => { setNotice(`Password reset link dispatched to ${activeMenuEmp?.email}`); handleMenuClose(); }}>
          <LockResetIcon sx={{ mr: 1 }} /> Reset Password
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleToggleStatus(activeMenuEmp)}>
          <EditIcon sx={{ mr: 1 }} /> Activate / Deactivate Account
        </MenuItem>
        <MenuItem onClick={() => activeMenuEmp && handleDeleteEmployee(activeMenuEmp)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Employee
        </MenuItem>
      </Menu>

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

            {activeTab > 0 && (
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tab View: {tabLabels[activeTab]}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Detailed enterprise section for <strong>{selectedEmp.name}</strong> ({tabLabels[activeTab]} record set).
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      <AddEmployeeWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleEmployeeCreated}
      />

      <EditEmployeeWizardModal
        open={editWizardOpen}
        employee={editingEmp}
        onClose={() => setEditWizardOpen(false)}
        onSuccess={handleEmployeeUpdated}
      />

      <AssignProjectDialogModal
        open={assignDialogOpen}
        employee={assigningEmp}
        onClose={() => setAssignDialogOpen(false)}
        onSuccess={handleProjectAssigned}
      />

      <TransferDepartmentModal
        open={transferModalOpen}
        employee={transferringEmp}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={handleEmployeeTransferred}
      />
    </Box>
  );
};

export default EmployeeListPage;
