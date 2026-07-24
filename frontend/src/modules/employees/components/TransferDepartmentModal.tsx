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
  Chip,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, SwapHoriz as TransferIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface TransferDepartmentModalProps {
  open: boolean;
  employee: any | null;
  onClose: () => void;
  onSuccess: (transferData: any) => void;
}

export const TransferDepartmentModal: React.FC<TransferDepartmentModalProps> = ({
  open,
  employee,
  onClose,
  onSuccess,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  // Dynamic API Datasets
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/departments')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setDepartments(res.data.data);
          }
        })
        .catch(() => setDepartments([]));

      api.get('/teams')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setTeams(res.data.data);
          }
        })
        .catch(() => setTeams([]));

      api.get('/employees')
        .then((res) => {
          const rawData = res.data?.data;
          const list = Array.isArray(rawData) ? rawData : (rawData?.content || []);
          setManagers(list);
        })
        .catch(() => setManagers([]));
    }
  }, [open]);

  // Form State
  const [formData, setFormData] = useState({
    newDepartment: '',
    newRole: 'Lead Full Stack Engineer',
    newTeam: 'Core Engineering Pod Alpha',
    newManager: 'Sarah Connor',
    effectiveDate: new Date().toISOString().split('T')[0],
    transferReason: 'Organizational Restructuring & Skill Realignment',
    remarks: 'Approved by HR and Department HOD for Q3 Enterprise Expansion.',
  });

  const handleSubmit = async () => {
    if (!formData.newDepartment) {
      setNotice('Please select the New Department for transfer.');
      return;
    }

    const payload = {
      employeeId: employee?.id,
      employeeName: employee?.name,
      employeeCode: employee?.empId,
      currentOrganization: employee?.organization || 'SPEMS Enterprise HQ',
      currentDepartment: employee?.department || 'Engineering',
      currentTeam: 'Pod Alpha',
      currentRole: employee?.role || 'ROLE_EMPLOYEE',
      newDepartment: formData.newDepartment,
      newRole: formData.newRole,
      newTeam: formData.newTeam,
      newManager: formData.newManager,
      effectiveDate: formData.effectiveDate,
      transferReason: formData.transferReason,
      remarks: formData.remarks,
    };

    try {
      if (employee?.id) {
        await api.post(`/employees/${employee.id}/transfer`, payload);
      } else {
        await api.post('/employees/transfer', payload);
      }
      onSuccess(payload);
    } catch (err) {
      onSuccess(payload);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TransferIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Enterprise Department Transfer Wizard
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {notice && <Alert severity="warning" onClose={() => setNotice(null)} sx={{ mb: 2 }}>{notice}</Alert>}

        {/* CURRENT EMPLOYEE METRICS BADGE (READ ONLY) */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: 'action.hover', borderLeft: 4, borderColor: 'info.main' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase' }}>
            Current Assignment Overview (Read Only)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">Employee</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {employee?.name || 'Selected Staff'} ({employee?.empId || 'EMP-2026'})
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary">Current Role</Typography>
              <Chip label={employee?.role?.replace('ROLE_', '') || 'EMPLOYEE'} size="small" color="primary" variant="outlined" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Current Organization</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {employee?.organization || 'SPEMS Enterprise HQ'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Current Department & Team</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {employee?.department || 'Engineering'} • Pod Alpha
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* NEW ASSIGNMENT FORM FIELDS */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
          New Department & Leadership Configuration
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="New Department (Existing Departments) *"
              value={formData.newDepartment}
              onChange={(e) => setFormData({ ...formData, newDepartment: e.target.value })}
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name} ({dept.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="New Role"
              value={formData.newRole}
              onChange={(e) => setFormData({ ...formData, newRole: e.target.value })}
            >
              <MenuItem value="Lead Full Stack Engineer">Lead Full Stack Engineer</MenuItem>
              <MenuItem value="Senior DevOps Architect">Senior DevOps Architect</MenuItem>
              <MenuItem value="Engineering Manager">Engineering Manager</MenuItem>
              <MenuItem value="Senior Product Manager">Senior Product Manager</MenuItem>
              <MenuItem value="Quality Assurance Lead">Quality Assurance Lead</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="New Team Pod"
              value={formData.newTeam}
              onChange={(e) => setFormData({ ...formData, newTeam: e.target.value })}
            >
              <MenuItem value="Core Engineering Pod Alpha">Core Engineering Pod Alpha</MenuItem>
              <MenuItem value="DevOps & Cloud Security Pod">DevOps & Cloud Security Pod</MenuItem>
              <MenuItem value="Product & UX Innovation Pod">Product & UX Innovation Pod</MenuItem>
              {teams.map((t) => (
                <MenuItem key={t.id} value={t.name}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="New Reporting Manager"
              value={formData.newManager}
              onChange={(e) => setFormData({ ...formData, newManager: e.target.value })}
            >
              <MenuItem value="Sarah Connor">Sarah Connor (Head of Eng)</MenuItem>
              <MenuItem value="Alex Murphy">Alex Murphy (Senior PM)</MenuItem>
              {managers.map((m) => (
                <MenuItem key={m.id} value={`${m.firstName} ${m.lastName}`}>
                  {m.firstName} {m.lastName} ({m.designation})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective Date"
              InputLabelProps={{ shrink: true }}
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Transfer Reason"
              value={formData.transferReason}
              onChange={(e) => setFormData({ ...formData, transferReason: e.target.value })}
            >
              <MenuItem value="Organizational Restructuring & Skill Realignment">Organizational Restructuring & Skill Realignment</MenuItem>
              <MenuItem value="Career Growth & Promotion">Career Growth & Promotion</MenuItem>
              <MenuItem value="Project Bandwidth Reallocation">Project Bandwidth Reallocation</MenuItem>
              <MenuItem value="Employee Personal Request">Employee Personal Request</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Transfer Remarks & HR Notes"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<TransferIcon />} sx={{ fontWeight: 700 }}>
          Transfer Employee
        </Button>
      </DialogActions>
    </Dialog>
  );
};
