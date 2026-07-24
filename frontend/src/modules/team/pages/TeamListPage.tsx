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
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';
import { CreateTeamWizardModal } from '../components/CreateTeamWizardModal';

interface Team {
  id: number;
  name: string;
  clientProject: string;
  teamLeadName: string;
  programManager: string;
  memberCount: number;
  targetSize: number;
  durationMonths: number;
  deadline: string;
  prdDocument: string | null;
  capacityUtilization: number;
}

export const TeamListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  const fetchTeams = () => {
    api.get('/teams')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiTeams: Team[] = res.data.data.map((t: any) => ({
            id: t.id,
            name: t.name ?? '',
            clientProject: t.project?.title ?? (t.department?.name ?? ''),
            teamLeadName: t.teamLead ? `${t.teamLead.firstName} ${t.teamLead.lastName}` : '',
            programManager: t.scrumMaster ? `${t.scrumMaster.firstName} ${t.scrumMaster.lastName}` : '',
            memberCount: t.memberCount ?? (t.members ? t.members.length : 1),
            targetSize: t.targetSize ?? 10,
            durationMonths: 6,
            deadline: t.deadline ?? '2026-12-31',
            prdDocument: 'Enterprise_Pod_Spec.pdf',
            capacityUtilization: 85,
          }));
          setTeams(apiTeams);
        } else {
          setTeams([]);
        }
      })
      .catch(() => {
        setTeams([]);
      });
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Enterprise Teams & Delivery Squad Formation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Form client project teams, assign Team Leads & Program Managers, upload PRD specs, and set deadlines.
          </Typography>
        </div>

        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ fontWeight: 700 }}>
          + Create Team
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Teams Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Team Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client & Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Team Lead</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Program Manager</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Team Size</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Deadline</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PRD Specs</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon fontSize="small" />
                      {team.name}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{team.clientProject}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{team.teamLeadName}</TableCell>
                  <TableCell>{team.programManager}</TableCell>
                  <TableCell>
                    <Chip label={`${team.memberCount} / ${team.targetSize} members`} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{team.deadline}</TableCell>
                  <TableCell>
                    {team.prdDocument ? (
                      <Chip icon={<DocIcon />} label={team.prdDocument} size="small" color="info" clickable />
                    ) : (
                      <Typography variant="caption" color="text.secondary">No PRD</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ width: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={team.capacityUtilization}
                        color={team.capacityUtilization > 90 ? 'error' : 'success'}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {team.capacityUtilization}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 5-STEP ENTERPRISE CREATION WIZARD MODAL */}
      <CreateTeamWizardModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={(msg: string) => {
          setNotice(msg);
          setOpenDialog(false);
          fetchTeams();
        }}
      />
    </Box>
  );
};

export default TeamListPage;
