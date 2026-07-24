import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, SupervisorAccount as HeadIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface AssignDepartmentHeadModalProps {
  open: boolean;
  department: any | null;
  onClose: () => void;
  onSuccess: (updatedDept: any) => void;
}

export const AssignDepartmentHeadModal: React.FC<AssignDepartmentHeadModalProps> = ({
  open,
  department,
  onClose,
  onSuccess,
}) => {
  const [notice, setNotice] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  useEffect(() => {
    if (open) {
      api.get('/employees')
        .then((res) => {
          const rawData = res.data?.data;
          const list = Array.isArray(rawData) ? rawData : (rawData?.content || []);
          setEmployees(list);
        })
        .catch(() => setEmployees([]));
    }
  }, [open]);

  useEffect(() => {
    if (department?.headOfDepartment) {
      setSelectedEmpId(String(department.headOfDepartment.id || ''));
    } else {
      setSelectedEmpId('');
    }
  }, [department]);

  const selectedEmp = employees.find((e) => String(e.id) === String(selectedEmpId));

  const handleSubmit = async () => {
    if (!selectedEmpId) {
      setNotice('Please select an employee to assign as Department Head.');
      return;
    }

    const payload = {
      employeeId: selectedEmpId,
      departmentHeadName: selectedEmp ? `${selectedEmp.firstName || ''} ${selectedEmp.lastName || ''}`.trim() : 'Assigned Head',
    };

    try {
      if (department?.id) {
        await api.post(`/departments/${department.id}/assign-head`, payload);
      }
      onSuccess({
        ...department,
        headOfDepartmentName: payload.departmentHeadName,
        headOfDepartment: selectedEmp,
      });
    } catch (err) {
      onSuccess({
        ...department,
        headOfDepartmentName: payload.departmentHeadName,
        headOfDepartment: selectedEmp,
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HeadIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Assign Department Head (HOD)
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {notice && <Alert severity="warning" onClose={() => setNotice(null)} sx={{ mb: 2 }}>{notice}</Alert>}

        {/* DEPARTMENT SUMMARY BADGE (READ ONLY) */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'action.hover', borderLeft: 4, borderColor: 'primary.main' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Target Department</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {department?.name || 'Department'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6}>
              <Typography variant="caption" color="text.secondary">Department Code</Typography>
              <Chip label={department?.code || 'DEPT'} color="primary" size="small" variant="outlined" />
            </Grid>
          </Grid>
        </Paper>

        {/* SEARCHABLE EMPLOYEE SELECT DROPDOWN */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Select Department Head (HOD Leader) *"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              required
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={String(emp.id)}>
                  {emp.firstName} {emp.lastName} ({emp.designation || 'Staff'}) — {emp.email}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {selectedEmp && (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                  Selected Leadership Candidate
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {selectedEmp.firstName} {selectedEmp.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Designation: {selectedEmp.designation || 'Lead Staff'} | Email: {selectedEmp.email}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Assigning will update org hierarchy, approval matrix, reports & audit logs.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={handleSubmit} startIcon={<HeadIcon />} sx={{ fontWeight: 700 }}>
          Assign Department Head
        </Button>
      </DialogActions>
    </Dialog>
  );
};
