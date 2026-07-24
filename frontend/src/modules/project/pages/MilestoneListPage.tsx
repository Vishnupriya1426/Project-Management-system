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
  Flag as MilestoneIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface Milestone {
  id: number;
  milestoneName: string;
  projectName: string;
  dueDate: string;
  owner: string;
  completionPct: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

export const MilestoneListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    api.get('/milestones')
      .then((res) => {
        const apiMilestones: Milestone[] = Array.isArray(res.data?.data)
          ? res.data.data.map((m: any) => ({
              id: m.id,
              milestoneName: m.milestoneName ?? m.name ?? '',
              projectName: m.project?.title ?? '',
              dueDate: m.dueDate ?? '',
              owner: m.owner ? `${m.owner.firstName} ${m.owner.lastName}` : '',
              completionPct: m.completionPct ?? m.completionPercentage ?? 0,
              status: m.status ?? 'IN_PROGRESS',
            }))
          : [];
        setMilestones(apiMilestones);
      })
      .catch(() => {
        setMilestones([]);
      });
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Project Milestones & Deliverables Roadmap
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor Key Contractual Milestones, Deliverable Schedules & Client Payment Triggers
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNotice('Milestone creation form opened.')}>
            + Create Milestone
          </Button>
          <Button variant="outlined" color="success" startIcon={<CompleteIcon />} onClick={() => setNotice('Milestone marked as COMPLETED.')}>
            Complete Milestone
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Milestone Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milestones.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MilestoneIcon color="primary" fontSize="small" />
                    {m.milestoneName}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{m.projectName}</TableCell>
                  <TableCell>{m.dueDate}</TableCell>
                  <TableCell>{m.owner}</TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={m.completionPct} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {m.completionPct}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.status}
                      size="small"
                      color={m.status === 'COMPLETED' ? 'success' : m.status === 'IN_PROGRESS' ? 'primary' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MilestoneListPage;
