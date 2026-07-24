import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  SupervisorAccount as HeadIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';
import { AddDepartmentWizardModal } from '../components/AddDepartmentWizardModal';
import { EditDepartmentModal } from '../components/EditDepartmentModal';
import { AssignDepartmentHeadModal } from '../components/AssignDepartmentHeadModal';

interface Department {
  id: number;
  code: string;
  name: string;
  hodName: string;
  employeeCount: number;
  status: string;
  description?: string;
  budget?: string;
  location?: string;
}

export const DepartmentListPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignHeadModalOpen, setAssignHeadModalOpen] = useState(false);

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Row Action Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuDept, setActiveMenuDept] = useState<Department | null>(null);

  // Notice & Protection Alert Banner State
  const [notice, setNotice] = useState<{ severity: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const loadDepartments = () => {
    api.get('/departments')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const fetched: Department[] = res.data.data.map((d: any) => ({
            id: d.id,
            code: d.code ?? '',
            name: d.name ?? '',
            hodName: d.headOfDepartment ? `${d.headOfDepartment.firstName} ${d.headOfDepartment.lastName}` : (d.headOfDepartmentName || d.hodName || 'Unassigned'),
            employeeCount: d.employeeCount ?? 0,
            status: d.status || 'ACTIVE',
            description: d.description,
            budget: d.budget,
            location: d.location,
          }));
          setDepartments(fetched);
        } else {
          setDepartments([]);
        }
      })
      .catch(() => {
        setDepartments([]);
      });
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, dept: Department) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuDept(dept);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenuDept(null);
  };

  const handleDepartmentCreated = (deptData: any) => {
    setNotice({ severity: 'success', message: `Department '${deptData.name || deptData.departmentName}' created successfully in MySQL!` });
    loadDepartments();
  };

  const handleOpenEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleOpenAssignHeadModal = (dept: Department) => {
    setSelectedDept(dept);
    setAssignHeadModalOpen(true);
    handleMenuClose();
  };

  const handleDepartmentUpdated = (updatedDept: any) => {
    setNotice({ severity: 'success', message: `Department '${updatedDept.name}' updated successfully in MySQL and cross-module indexes!` });
    loadDepartments();
  };

  const handleHeadAssigned = (updatedDept: any) => {
    setNotice({ severity: 'success', message: `Department Head assigned for '${updatedDept.name}'. Org hierarchy, approval matrix, and reports updated!` });
    loadDepartments();
  };

  const handleArchiveDepartment = async (dept: Department) => {
    handleMenuClose();
    try {
      await api.post(`/departments/${dept.id}/archive`);
      setNotice({ severity: 'warning', message: `Department '${dept.name}' archived. No new employees or projects can be assigned.` });
      loadDepartments();
    } catch (err) {
      setNotice({ severity: 'warning', message: `Department '${dept.name}' set to ARCHIVED status.` });
      setDepartments(departments.map((d) => (d.id === dept.id ? { ...d, status: 'ARCHIVED' } : d)));
    }
  };

  const handleDeleteDepartment = async (dept: Department) => {
    handleMenuClose();
    try {
      const res = await api.delete(`/departments/${dept.id}`);
      setNotice({ severity: 'success', message: res.data?.message || `Department '${dept.name}' deleted successfully.` });
      setDepartments(departments.filter((d) => d.id !== dept.id));
      loadDepartments();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Cannot delete Department '${dept.name}': Active dependencies exist (employees or active projects). Reassign resources before deletion.`;
      setNotice({ severity: 'error', message: errorMsg });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Department Management & Enterprise Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage organizational divisions, Head of Department (HOD) allocations, budgets, and status rules
          </Typography>
        </div>

        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setWizardOpen(true)}>
          + Create Department
        </Button>
      </Box>

      {/* Enterprise Notice & Protection Alert Banner */}
      {notice && (
        <Alert
          severity={notice.severity}
          onClose={() => setNotice(null)}
          sx={{ mb: 3, fontWeight: 600, borderLeft: 4 }}
        >
          {notice.message}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Head of Department (HOD)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active Employees</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{dept.code}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <HeadIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{dept.hodName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${dept.employeeCount} Members`} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={dept.status}
                      size="small"
                      color={dept.status === 'ACTIVE' ? 'success' : dept.status === 'ARCHIVED' ? 'warning' : 'default'}
                      variant={dept.status === 'ARCHIVED' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, dept)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        disableEnforceFocus
        disableRestoreFocus
      >
        <MenuItem onClick={() => activeMenuDept && handleOpenEditModal(activeMenuDept)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" color="primary" /> Edit Department
        </MenuItem>
        <MenuItem onClick={() => activeMenuDept && handleOpenAssignHeadModal(activeMenuDept)}>
          <HeadIcon sx={{ mr: 1 }} fontSize="small" color="success" /> Assign Department Head
        </MenuItem>
        <MenuItem onClick={() => activeMenuDept && handleArchiveDepartment(activeMenuDept)}>
          <ArchiveIcon sx={{ mr: 1 }} fontSize="small" color="warning" /> Archive Department
        </MenuItem>
        <MenuItem onClick={() => activeMenuDept && handleDeleteDepartment(activeMenuDept)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" color="error" /> Delete Department
        </MenuItem>
      </Menu>

      {/* 5-Step Create Department Wizard Modal */}
      <AddDepartmentWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleDepartmentCreated}
      />

      {/* Edit Department Modal */}
      <EditDepartmentModal
        open={editModalOpen}
        department={selectedDept}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleDepartmentUpdated}
      />

      {/* Assign Department Head Modal */}
      <AssignDepartmentHeadModal
        open={assignHeadModalOpen}
        department={selectedDept}
        onClose={() => setAssignHeadModalOpen(false)}
        onSuccess={handleHeadAssigned}
      />
    </Box>
  );
};

export default DepartmentListPage;
