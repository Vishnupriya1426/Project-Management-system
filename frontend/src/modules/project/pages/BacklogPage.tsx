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
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  DirectionsRun as SprintIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface BacklogItem {
  id: number;
  storyCode: string;
  title: string;
  project: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  storyPoints: number;
  status: 'UNASSIGNED' | 'SPRINT_READY';
}

export const BacklogPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('5');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const [backlog, setBacklog] = useState<BacklogItem[]>([]);

  useEffect(() => {
    api.get('/backlog')
      .then((res) => {
        const items: BacklogItem[] = Array.isArray(res.data?.data)
          ? res.data.data.map((b: any) => ({
              id: b.id,
              storyCode: b.storyCode ?? b.code ?? `US-${b.id}`,
              title: b.title ?? '',
              project: b.project?.title ?? '',
              priority: b.priority ?? 'MEDIUM',
              storyPoints: b.storyPoints ?? 0,
              status: b.status ?? 'UNASSIGNED',
            }))
          : [];
        setBacklog(items);
      })
      .catch(() => setBacklog([]));
  }, []);

  const handleCreateStory = () => {
    if (!title) return;
    const newStory: BacklogItem = {
      id: Date.now(),
      storyCode: `US-${backlog.length + 201}`,
      title,
      project: 'Enterprise Cloud Migration',
      priority,
      storyPoints: parseInt(points) || 5,
      status: 'UNASSIGNED',
    };
    setBacklog([...backlog, newStory]);
    setNotice(`User Story ${newStory.storyCode} added to Product Backlog.`);
    setTitle('');
    setDialogOpen(false);
  };

  const handleMoveToSprint = (id: number) => {
    setBacklog(backlog.map((b) => (b.id === id ? { ...b, status: 'SPRINT_READY' } : b)));
    setNotice('User Story moved to Sprint 15 Ready Queue.');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Product Backlog & User Stories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage unassigned feature user stories, estimate story points, and push items to active agile sprints.
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 700 }}>
          + Add User Story
        </Button>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Backlog Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Story Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Story Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Story Points</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backlog.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{item.storyCode}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.title}</TableCell>
                  <TableCell>{item.project}</TableCell>
                  <TableCell>
                    <Chip label={item.priority} size="small" color={item.priority === 'URGENT' || item.priority === 'HIGH' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{item.storyPoints} pts</TableCell>
                  <TableCell>
                    <Chip label={item.status} size="small" color={item.status === 'SPRINT_READY' ? 'success' : 'warning'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {item.status === 'UNASSIGNED' && (
                        <Button size="small" variant="contained" color="secondary" startIcon={<SprintIcon />} onClick={() => handleMoveToSprint(item.id)}>
                          Assign to Sprint
                        </Button>
                      )}
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setBacklog(backlog.filter((b) => b.id !== item.id))}>
                        Remove
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add User Story to Backlog</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="User Story Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
            <TextField type="number" label="Story Points Estimate" value={points} onChange={(e) => setPoints(e.target.value)} fullWidth />
            <TextField select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as any)} fullWidth>
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="URGENT">URGENT</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateStory}>
            Add Story
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BacklogPage;
