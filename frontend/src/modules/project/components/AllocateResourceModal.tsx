import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, PersonAdd as AssignIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface AllocateResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const AllocateResourceModal: React.FC<AllocateResourceModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [role, setRole] = useState('Senior Developer');
  const [allocationPercentage, setAllocationPercentage] = useState(100);
  const [startDate, setStartDate] = useState('2026-07-25');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/employees?size=100')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data;
          if (Array.isArray(raw)) setEmployees(raw);
        })
        .catch(() => setEmployees([]));

      api.get('/projects')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) setProjects(res.data.data);
        })
        .catch(() => setProjects([]));

      api.get('/teams')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) setTeams(res.data.data);
        })
        .catch(() => setTeams([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedProjectId) {
      setErrorMsg('Please select both an employee and a target project.');
      return;
    }

    const payload = {
      employeeId: selectedEmployeeId,
      projectId: selectedProjectId,
      teamId: selectedTeamId || null,
      roleOnProject: role,
      allocationPercentage,
      startDate,
      endDate,
    };

    try {
      const res = await api.post('/resource-allocations', payload);
      onSuccess(res.data?.message || 'Resource allocated successfully!');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to allocate resource.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Allocate Enterprise Resource
          </Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              label="Select Employee *"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Employee --</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.designation || 'Engineer'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Target Project *"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Project --</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title || p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Target Delivery Pod Team"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Pod Team --</MenuItem>
              {teams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Role on Project"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Allocation %"
              value={allocationPercentage}
              onChange={(e) => setAllocationPercentage(Number(e.target.value))}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Allocation Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Allocation End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
          Confirm Resource Allocation
        </Button>
      </DialogActions>
    </Dialog>
  );
};
