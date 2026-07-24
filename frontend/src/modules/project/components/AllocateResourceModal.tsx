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
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [role, setRole] = useState('Senior Full Stack Developer');
  const [allocationPercentage, setAllocationPercentage] = useState(100);
  const [startDate, setStartDate] = useState('2026-07-25');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [billableStatus, setBillableStatus] = useState('BILLABLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/projects')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setProjects(raw);
        })
        .catch(() => setProjects([]));

      api.get('/teams')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setTeams(raw);
        })
        .catch(() => setTeams([]));

      api.get('/employees?size=100')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setEmployees(raw);
        })
        .catch(() => setEmployees([]));
    }
  }, [open]);

  // Cascade teams when project changes
  useEffect(() => {
    if (selectedProjectId) {
      const matched = teams.filter((t) => t.project?.id === selectedProjectId);
      setFilteredTeams(matched.length > 0 ? matched : teams);
    } else {
      setFilteredTeams(teams);
    }
  }, [selectedProjectId, teams]);

  const handleSubmit = async () => {
    if (!selectedProjectId || !selectedEmployeeId) {
      setErrorMsg('Please select both a Project and an Employee.');
      return;
    }

    const payload = {
      projectId: selectedProjectId,
      teamId: selectedTeamId || null,
      employeeId: selectedEmployeeId,
      roleOnProject: role,
      allocationPercentage: Number(allocationPercentage),
      startDate,
      endDate,
      billableStatus,
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
          {/* 1. PROJECT */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="1. Target Project *"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Project --</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title || p.name} ({p.projectCode || `PRJ-${p.id}`})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 2. TEAM */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="2. Delivery Pod Team"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Team --</MenuItem>
              {filteredTeams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 3. EMPLOYEE */}
          <Grid item xs={12}>
            <TextField
              select
              label="3. Select Employee *"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Employee --</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.designation || 'Engineer'}) - {e.department?.name || 'Tech'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 4. ROLE */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="4. Role on Project *"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* 5. ALLOCATION % */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="5. Allocation % *"
              value={allocationPercentage}
              onChange={(e) => setAllocationPercentage(Number(e.target.value))}
              fullWidth
            />
          </Grid>

          {/* 6. START DATE */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="6. Start Date *"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* 7. END DATE */}
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="7. End Date *"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* 8. BILLABLE STATUS */}
          <Grid item xs={12}>
            <TextField
              select
              label="8. Billable Status *"
              value={billableStatus}
              onChange={(e) => setBillableStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="BILLABLE">Billable Client Resource</MenuItem>
              <MenuItem value="NON_BILLABLE">Non-Billable Internal R&D</MenuItem>
              <MenuItem value="SHADOW">Shadow Resource / Onboarding</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
          Save & Allocate Resource
        </Button>
      </DialogActions>
    </Dialog>
  );
};
