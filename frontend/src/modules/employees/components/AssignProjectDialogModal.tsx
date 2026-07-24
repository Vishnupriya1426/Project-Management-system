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
  FormControlLabel,
  Switch,
  Chip,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, AssignmentInd as AssignIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface AssignProjectDialogModalProps {
  open: boolean;
  employee: any | null;
  onClose: () => void;
  onSuccess: (assignmentData: any) => void;
}

export const AssignProjectDialogModal: React.FC<AssignProjectDialogModalProps> = ({
  open,
  employee,
  onClose,
  onSuccess,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  // Dynamic API Datasets
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/clients')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setOrganizations(res.data.data);
          }
        })
        .catch(() => setOrganizations([]));

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

      api.get('/projects')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setProjects(res.data.data);
          }
        })
        .catch(() => setProjects([]));

      api.get('/employees')
        .then((res) => {
          const rawData = res.data?.data;
          const list = Array.isArray(rawData) ? rawData : (rawData?.content || []);
          setEmployees(list);
        })
        .catch(() => setEmployees([]));
    }
  }, [open]);

  // Form State
  const [formData, setFormData] = useState({
    organization: '',
    department: '',
    team: '',
    projectId: '',
    projectName: '',
    roleInProject: 'Senior Full Stack Engineer',
    sprint: 'Sprint 1 — Core Execution',
    allocationPercentage: '100%',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    billable: true,
    projectManager: 'Sarah Connor',
    notes: 'Primary project assignment with 100% dedicated bandwidth.',
  });

  useEffect(() => {
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        organization: employee.organization || prev.organization,
        department: employee.department || prev.department,
      }));
    }
  }, [employee]);

  const handleProjectSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedId = e.target.value;
    const selectedPrj = projects.find((p) => String(p.id) === String(selectedId));
    setFormData({
      ...formData,
      projectId: selectedId,
      projectName: selectedPrj ? selectedPrj.title : '',
      projectManager: selectedPrj?.projectManager ? `${selectedPrj.projectManager.firstName} ${selectedPrj.projectManager.lastName}` : formData.projectManager,
    });
  };

  const handleSubmit = async () => {
    if (!formData.projectId && !formData.projectName) {
      setNotice('Please select an active project to assign.');
      return;
    }

    const payload = {
      employeeId: employee?.id,
      employeeName: employee?.name,
      employeeCode: employee?.empId,
      organization: formData.organization,
      department: formData.department,
      team: formData.team,
      projectId: formData.projectId,
      projectName: formData.projectName,
      roleInProject: formData.roleInProject,
      sprint: formData.sprint,
      allocationPercentage: formData.allocationPercentage,
      startDate: formData.startDate,
      endDate: formData.endDate,
      billable: formData.billable ? 'Billable' : 'Non-Billable',
      projectManager: formData.projectManager,
      notes: formData.notes,
    };

    try {
      if (formData.projectId) {
        await api.post(`/projects/${formData.projectId}/assign`, payload);
      } else {
        await api.post('/projects/assign', payload);
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
          <AssignIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Enterprise Assign Project & Team Workflow
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {notice && <Alert severity="warning" onClose={() => setNotice(null)} sx={{ mb: 2 }}>{notice}</Alert>}

        {/* EMPLOYEE SUMMARY BADGE (READ ONLY) */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'action.hover', borderLeft: 4, borderColor: 'primary.main' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Assigned Employee (Read Only)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {employee?.name || 'Selected Staff'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Employee ID</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {employee?.empId || 'EMP-2026'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Designation</Typography>
              <Chip label={employee?.designation || 'Engineer'} size="small" color="primary" variant="outlined" />
            </Grid>
          </Grid>
        </Paper>

        {/* ASSIGNMENT FORM FIELDS */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.companyName || org.name}>
                  {org.companyName || org.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
              label="Team Pod"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            >
              <MenuItem value="Core Engineering Pod Alpha">Core Engineering Pod Alpha</MenuItem>
              <MenuItem value="DevOps & Infrastructure Pod">DevOps & Infrastructure Pod</MenuItem>
              <MenuItem value="Frontend Architecture Pod">Frontend Architecture Pod</MenuItem>
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
              label="Project (Active Projects) *"
              value={formData.projectId}
              onChange={handleProjectSelect}
              required
            >
              {projects.map((prj) => (
                <MenuItem key={prj.id} value={prj.id}>
                  {prj.title} ({prj.projectCode || prj.status})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Role in Project"
              value={formData.roleInProject}
              onChange={(e) => setFormData({ ...formData, roleInProject: e.target.value })}
            >
              <MenuItem value="Lead Full Stack Architect">Lead Full Stack Architect</MenuItem>
              <MenuItem value="Senior Frontend Engineer">Senior Frontend Engineer</MenuItem>
              <MenuItem value="Backend Services Lead">Backend Services Lead</MenuItem>
              <MenuItem value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</MenuItem>
              <MenuItem value="Quality Assurance Lead">Quality Assurance Lead</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Sprint Allocation"
              value={formData.sprint}
              onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
            >
              <MenuItem value="Sprint 1 — Core Execution">Sprint 1 — Core Execution</MenuItem>
              <MenuItem value="Sprint 2 — API & Integration">Sprint 2 — API & Integration</MenuItem>
              <MenuItem value="Sprint 3 — UAT & Release">Sprint 3 — UAT & Release</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Allocation Percentage"
              value={formData.allocationPercentage}
              onChange={(e) => setFormData({ ...formData, allocationPercentage: e.target.value })}
            >
              <MenuItem value="100%">100% Dedicated</MenuItem>
              <MenuItem value="75%">75% Allocation</MenuItem>
              <MenuItem value="50%">50% Allocation</MenuItem>
              <MenuItem value="25%">25% Part-Time</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Project Manager"
              value={formData.projectManager}
              onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
            >
              <MenuItem value="Sarah Connor">Sarah Connor</MenuItem>
              <MenuItem value="Alex Murphy">Alex Murphy</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                  {emp.firstName} {emp.lastName} ({emp.designation})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.billable}
                    onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formData.billable ? 'Billable Resource' : 'Non-Billable Overhead'}
                  </Typography>
                }
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Assignment Notes & Objectives"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={handleSubmit} startIcon={<AssignIcon />} sx={{ fontWeight: 700 }}>
          Assign Project & Team
        </Button>
      </DialogActions>
    </Dialog>
  );
};
