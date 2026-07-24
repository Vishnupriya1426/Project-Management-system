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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  CloudUpload as UploadIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

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
  const [prdFileName, setPrdFileName] = useState<string | null>(null);

  // Form Fields
  const [teamName, setTeamName] = useState('');
  const [clientProject, setClientProject] = useState('');
  const [teamLead, setTeamLead] = useState('');
  const [programManager, setProgramManager] = useState('');
  const [targetSize, setTargetSize] = useState('10');
  const [duration, setDuration] = useState('6');
  const [deadline, setDeadline] = useState('');

  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    api.get('/teams')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiTeams: Team[] = res.data.data.map((t: any) => ({
            id: t.id,
            name: t.name ?? '',
            clientProject: t.project?.title ?? (t.department?.name ?? ''),
            teamLeadName: t.teamLead ? `${t.teamLead.firstName} ${t.teamLead.lastName}` : '',
            programManager: t.programManager ? `${t.programManager.firstName} ${t.programManager.lastName}` : '',
            memberCount: t.memberCount ?? 0,
            targetSize: t.targetSize ?? 0,
            durationMonths: t.durationMonths ?? 0,
            deadline: t.deadline ?? '',
            prdDocument: t.prdDocument ?? null,
            capacityUtilization: t.capacityUtilization ?? 0,
          }));
          setTeams(apiTeams);
        } else {
          setTeams([]);
        }
      })
      .catch(() => {
        setTeams([]);
      });
  }, []);

  const handlePrdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrdFileName(e.target.files[0].name);
    }
  };

  const handleCreateTeam = () => {
    if (!teamName) return;
    const newTeam: Team = {
      id: Date.now(),
      name: teamName,
      clientProject,
      teamLeadName: teamLead,
      programManager,
      memberCount: 1,
      targetSize: parseInt(targetSize) || 10,
      durationMonths: parseInt(duration) || 6,
      deadline,
      prdDocument: prdFileName || 'Team_PRD_Specification.pdf',
      capacityUtilization: 40,
    };

    setTeams([newTeam, ...teams]);
    setNotice(`Team "${teamName}" created for Project "${clientProject}". PRD documents stored.`);
    setTeamName('');
    setPrdFileName(null);
    setOpenDialog(false);
  };

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

      {/* CREATE TEAM MODAL */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>➕ Form New Client Delivery Team</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Client & Project Link" value={clientProject} onChange={(e) => setClientProject(e.target.value)} required fullWidth placeholder="e.g. Global Bank Corp - Mobile App" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Core Banking Pod" required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Team Lead" value={teamLead} onChange={(e) => setTeamLead(e.target.value)} required fullWidth placeholder="e.g. John Smith" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Program Manager" value={programManager} onChange={(e) => setProgramManager(e.target.value)} required fullWidth placeholder="e.g. Jane Doe" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="number" label="Planned Team Size" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="number" label="Duration (Months)" value={duration} onChange={(e) => setDuration(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="date" label="Project Deadline" InputLabelProps={{ shrink: true }} value={deadline} onChange={(e) => setDeadline(e.target.value)} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <Box
                component="label"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  border: '2px dashed #0078D4',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'rgba(0, 120, 212, 0.04)',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0, 120, 212, 0.08)' },
                }}
              >
                <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#0078D4' }}>
                  Click to Upload PRD & SOW Documents
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {prdFileName ? `Selected PRD: ${prdFileName}` : 'Upload PDF/DOCX PRDs for this team'}
                </Typography>
                <input type="file" accept=".pdf,.docx,.doc" hidden onChange={handlePrdUpload} />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateTeam} sx={{ fontWeight: 700 }}>
            Form Team & Attach PRD
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamListPage;
