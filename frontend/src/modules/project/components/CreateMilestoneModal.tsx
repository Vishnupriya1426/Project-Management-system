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
import { Close as CloseIcon, Flag as MilestoneIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface CreateMilestoneModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [milestoneName, setMilestoneName] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('2026-08-15');
  const [ownerId, setOwnerId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

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

      api.get('/employees?size=100').then((res) => {
        const raw = res.data?.data?.content || res.data?.data;
        if (Array.isArray(raw)) setEmployees(raw);
      }).catch(() => setEmployees([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!milestoneName || !milestoneName.trim()) {
      setErrorMsg('Milestone Name is required.');
      return;
    }
    if (!projectId) {
      setErrorMsg('Please select a Project.');
      return;
    }

    const payload = {
      milestoneName,
      projectId,
      dueDate,
      ownerId: ownerId || null,
      description,
      completionPct: 0,
      status: 'IN_PROGRESS',
    };

    try {
      const res = await api.post('/milestones', payload);
      onSuccess(res.data?.message || `Milestone "${milestoneName}" created successfully!`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create milestone.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MilestoneIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Create Project Milestone & Deliverable
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
              label="Milestone Deliverable Name *"
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
              placeholder="e.g. Architecture Blueprint & Cloud Gateway Setup"
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
              type="date"
              label="Contractual Due Date *"
              InputLabelProps={{ shrink: true }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Milestone Owner / Lead"
              value={ownerId}
              onChange={(e) => setOwnerId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Owner --</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.designation || 'Lead'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              multiline
              rows={3}
              label="Deliverable Description & Scope Specs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key contractual acceptance criteria for client signoff"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
          Create Milestone & Trigger Sync
        </Button>
      </DialogActions>
    </Dialog>
  );
};
