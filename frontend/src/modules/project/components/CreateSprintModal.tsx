import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Speed as SprintIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface CreateSprintModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [sprintName, setSprintName] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [teamId, setTeamId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('2026-07-25');
  const [endDate, setEndDate] = useState('2026-08-08');
  const [goal, setGoal] = useState('');
  const [capacityHours, setCapacityHours] = useState(80);
  const [storyPoints, setStoryPoints] = useState(40);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/projects').then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setProjects(res.data.data);
          if (res.data.data.length > 0 && !projectId) {
            setProjectId(res.data.data[0].id);
          }
        }
      }).catch(() => setProjects([]));

      api.get('/teams').then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setTeams(res.data.data);
        }
      }).catch(() => setTeams([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!sprintName || !sprintName.trim()) {
      setErrorMsg('Sprint Name is required.');
      return;
    }
    if (!projectId) {
      setErrorMsg('Please select a Project.');
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      setErrorMsg('Sprint End Date must be on or after the Start Date.');
      return;
    }

    const payload = {
      sprintName,
      projectId,
      teamId: teamId || null,
      startDate,
      endDate,
      goal,
      capacityHours,
      storyPoints,
      completedPoints: 0,
      status: 'PLANNING',
    };

    try {
      const res = await api.post('/sprints', payload);
      onSuccess(res.data?.message || `Sprint "${sprintName}" created successfully!`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create sprint.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SprintIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Create Agile Sprint & Target Velocity
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
              label="Sprint Name *"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="e.g. Sprint 15 - OAuth2 & API Security"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Target Project *"
              value={projectId}
              onChange={(e) => setProjectId(Number(e.target.value))}
              fullWidth
            >
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
              label="Target Squad Team"
              value={teamId}
              onChange={(e) => setTeamId(Number(e.target.value))}
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
              type="date"
              label="Sprint Start Date *"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Sprint End Date *"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Sprint Capacity (Hours) *"
              value={capacityHours}
              onChange={(e) => setCapacityHours(Number(e.target.value))}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              label="Target Story Points *"
              value={storyPoints}
              onChange={(e) => setStoryPoints(Number(e.target.value))}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              multiline
              rows={2}
              label="Sprint Goal & Definition of Done"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Implement role-based access for all enterprise portals"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
          Create Sprint & Initialize Backlog
        </Button>
      </DialogActions>
    </Dialog>
  );
};
