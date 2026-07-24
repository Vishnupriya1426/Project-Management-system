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
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  CheckCircle as CloseIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';
import { CreateSprintModal } from '../components/CreateSprintModal';

interface Sprint {
  id: number;
  sprintName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  goal: string;
  capacityHours: number;
  storyPoints: number;
  completedPoints: number;
  status: 'PLANNING' | 'ACTIVE' | 'CLOSED';
}

export const SprintListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const fetchSprints = () => {
    api.get('/sprints')
      .then((res) => {
        const apiSprints: Sprint[] = Array.isArray(res.data?.data)
          ? res.data.data.map((s: any) => ({
              id: s.id,
              sprintName: s.sprintName ?? s.name ?? '',
              projectName: s.project?.title ?? '',
              startDate: s.startDate ?? '',
              endDate: s.endDate ?? '',
              goal: s.goal ?? '',
              capacityHours: s.capacityHours ?? 0,
              storyPoints: s.storyPoints ?? 0,
              completedPoints: s.completedPoints ?? 0,
              status: s.status ?? 'PLANNING',
            }))
          : [];
        setSprints(apiSprints);
      })
      .catch(() => {
        setSprints([]);
      });
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/sprints/${id}/status`, { status: newStatus });
      setNotice(`Sprint status changed to ${newStatus}! Database & velocity board updated.`);
      fetchSprints();
    } catch {
      setNotice('Failed to update sprint status.');
    }
  };

  const handleIncrementPoints = async (s: Sprint) => {
    const newPts = Math.min(s.completedPoints + 10, s.storyPoints || 40);
    try {
      await api.put(`/sprints/${s.id}/status`, { completedPoints: newPts });
      setNotice(`Completed +10 Story Points in "${s.sprintName}"! Velocity & Burndown updated.`);
      fetchSprints();
    } catch {
      setNotice('Failed to update story points.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Sprint Management & Velocity Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Agile Sprints, Story Point Velocity, Capacity Hours, and Burndown Milestones
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
            + Create Sprint
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Sprints Data Grid */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Sprint Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sprint Goal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Story Points</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Burned %</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sprints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No agile sprints created yet. Form a team or click "+ Create Sprint" to start a sprint.
                  </TableCell>
                </TableRow>
              ) : (
                sprints.map((s) => {
                  const burnPct = s.storyPoints > 0 ? Math.round((s.completedPoints / s.storyPoints) * 100) : 0;
                  return (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.sprintName}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{s.projectName || 'Unassigned'}</TableCell>
                      <TableCell>{`${s.startDate || ''} ➔ ${s.endDate || ''}`}</TableCell>
                      <TableCell>{s.goal || 'Sprint Goal'}</TableCell>
                      <TableCell>{s.capacityHours || 80} hrs</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{`${s.completedPoints || 0} / ${s.storyPoints || 40} pts`}</TableCell>
                      <TableCell sx={{ width: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={burnPct} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {burnPct}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={s.status}
                          size="small"
                          color={s.status === 'ACTIVE' ? 'primary' : s.status === 'CLOSED' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {s.status === 'PLANNING' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<StartIcon />}
                              onClick={() => handleUpdateStatus(s.id, 'ACTIVE')}
                            >
                              Start
                            </Button>
                          )}
                          {s.status === 'ACTIVE' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleIncrementPoints(s)}
                              >
                                +10 Pts
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<CloseIcon />}
                                onClick={() => handleUpdateStatus(s.id, 'CLOSED')}
                              >
                                Close
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CREATE SPRINT MODAL */}
      <CreateSprintModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={(msg: string) => {
          setNotice(msg);
          setOpenModal(false);
          fetchSprints();
        }}
      />
    </Box>
  );
};

export default SprintListPage;
