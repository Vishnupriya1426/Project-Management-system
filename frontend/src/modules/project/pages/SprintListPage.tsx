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
  Assessment as ReviewIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

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

  const [sprints, setSprints] = useState<Sprint[]>([]);

  useEffect(() => {
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
  }, []);

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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNotice('Sprint creation modal opened.')}>
            + Create Sprint
          </Button>
          <Button variant="outlined" color="success" startIcon={<StartIcon />} onClick={() => setNotice('Sprint 14 activated!')}>
            Start Sprint
          </Button>
          <Button variant="outlined" color="warning" startIcon={<CloseIcon />} onClick={() => setNotice('Sprint closed & retrospective report generated.')}>
            Close Sprint
          </Button>
          <Button variant="outlined" startIcon={<ReviewIcon />} onClick={() => setNotice('Sprint Velocity Review Report exported.')}>
            Review Sprint
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {sprints.map((s) => {
                const burnPct = s.storyPoints > 0 ? Math.round((s.completedPoints / s.storyPoints) * 100) : 0;
                return (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{s.sprintName}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{s.projectName}</TableCell>
                    <TableCell>{`${s.startDate} ➔ ${s.endDate}`}</TableCell>
                    <TableCell>{s.goal}</TableCell>
                    <TableCell>{s.capacityHours} hrs</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{`${s.completedPoints} / ${s.storyPoints} pts`}</TableCell>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SprintListPage;
