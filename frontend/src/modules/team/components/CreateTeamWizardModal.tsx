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
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface CreateTeamWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

interface EmployeeDTO {
  id: number;
  name: string;
  designation: string;
  department: string;
  skills: string;
  workload: number;
  availability: number;
}

const steps = [
  '1. Project & Team Type',
  '2. Leadership',
  '3. Member Selection',
  '4. Capacity & Sprint',
  '5. Review & Confirm',
];

export const CreateTeamWizardModal: React.FC<CreateTeamWizardModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // STEP 1: PROJECT & TYPE
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [teamName, setTeamName] = useState('');
  const [teamType, setTeamType] = useState('Frontend');

  // STEP 2: LEADERSHIP
  const [teamLeadId, setTeamLeadId] = useState<number | ''>('');
  const [assistantLeadId, setAssistantLeadId] = useState<number | ''>('');
  const [scrumMasterId, setScrumMasterId] = useState<number | ''>('');

  // STEP 3: MEMBERS
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  // STEP 4: CAPACITY
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(8);
  const [sprintCapacityHours, setSprintCapacityHours] = useState(80);
  const [estimatedStoryPoints, setEstimatedStoryPoints] = useState(40);
  const [startDate, setStartDate] = useState('2026-07-25');
  const [endDate, setEndDate] = useState('2026-12-31');

  // DATA LISTS
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/projects')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setProjects(res.data.data);
            if (res.data.data.length > 0 && !selectedProjectId) {
              setSelectedProjectId(res.data.data[0].id);
            }
          }
        })
        .catch(() => setProjects([]));

      api.get('/employees?size=100')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data;
          if (Array.isArray(raw)) {
            const list: EmployeeDTO[] = raw.map((e: any) => ({
              id: e.id,
              name: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim(),
              designation: e.designation ?? e.user?.role?.name ?? 'Developer',
              department: e.department?.name ?? 'Engineering',
              skills: e.primarySkill ?? 'Java, React',
              workload: e.workload ?? 20,
              availability: e.availability ?? 80,
            }));
            setEmployees(list);
          }
        })
        .catch(() => setEmployees([]));
    }
  }, [open, selectedProjectId]);

  const handleToggleMember = (id: number) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!teamName) {
        setErrorMsg('Please enter a Team Name.');
        return;
      }
    }
    setErrorMsg(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!teamName || !selectedProjectId) {
      setErrorMsg('Please select a project and enter a team name.');
      return;
    }

    const payload = {
      name: teamName,
      teamType,
      projectId: selectedProjectId,
      teamLeadId: teamLeadId || null,
      assistantLeadId: assistantLeadId || null,
      scrumMasterId: scrumMasterId || null,
      memberIds: selectedMemberIds,
      workingHoursPerDay,
      sprintCapacity: sprintCapacityHours,
      estimatedStoryPoints,
      startDate,
      endDate,
    };

    try {
      const res = await api.post('/teams', payload);
      onSuccess(res.data?.message || `Team "${teamName}" created successfully!`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create team.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Enterprise Delivery Pod Formation Studio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            5-Step Governed Squad Setup • Resource Skill Allocation • Sprint 1 Auto-Initialization
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

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1 */}
        {activeStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Target Client Project *"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                fullWidth
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title || p.name} ({p.projectCode || `PRJ-${p.id}`})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Team Name *"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Core Banking Frontend Pod"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Squad Specialization Type *"
                value={teamType}
                onChange={(e) => setTeamType(e.target.value)}
                fullWidth
              >
                <MenuItem value="Backend">Backend Services & API Squad</MenuItem>
                <MenuItem value="Frontend">Frontend SPA & UI Architecture</MenuItem>
                <MenuItem value="QA">QA Automation & Performance Testing</MenuItem>
                <MenuItem value="DevOps">DevOps, Kubernetes & Cloud Security</MenuItem>
                <MenuItem value="Mobile">Mobile iOS & Android Squad</MenuItem>
                <MenuItem value="Data">Data Engineering & Analytics</MenuItem>
                <MenuItem value="Support">Enterprise Production Support</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        )}

        {/* STEP 2 */}
        {activeStep === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Team Lead *"
                value={teamLeadId}
                onChange={(e) => setTeamLeadId(Number(e.target.value))}
                fullWidth
              >
                <MenuItem value="">-- Select Team Lead --</MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name} ({e.designation})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Assistant Lead"
                value={assistantLeadId}
                onChange={(e) => setAssistantLeadId(Number(e.target.value))}
                fullWidth
              >
                <MenuItem value="">-- Select Assistant Lead --</MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name} ({e.designation})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Scrum Master *"
                value={scrumMasterId}
                onChange={(e) => setScrumMasterId(Number(e.target.value))}
                fullWidth
              >
                <MenuItem value="">-- Select Scrum Master --</MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name} ({e.designation})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        )}

        {/* STEP 3 */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Select Pod Members from Active Enterprise Roster ({selectedMemberIds.length} Selected)
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell padding="checkbox" />
                    <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Availability</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => {
                    const checked = selectedMemberIds.includes(emp.id);
                    return (
                      <TableRow key={emp.id} hover onClick={() => handleToggleMember(emp.id)} sx={{ cursor: 'pointer' }}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={checked} color="primary" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{emp.name}</TableCell>
                        <TableCell><Chip label={emp.designation} size="small" variant="outlined" /></TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell><Chip label={emp.skills} size="small" color="primary" /></TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{emp.availability}% Available</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* STEP 4 */}
        {activeStep === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Working Hours / Day *"
                value={workingHoursPerDay}
                onChange={(e) => setWorkingHoursPerDay(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Sprint 1 Capacity (Hours) *"
                value={sprintCapacityHours}
                onChange={(e) => setSprintCapacityHours(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Estimated Story Points *"
                value={estimatedStoryPoints}
                onChange={(e) => setEstimatedStoryPoints(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="Squad Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="Target End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        )}

        {/* STEP 5 */}
        {activeStep === 4 && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0, 120, 212, 0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
              Confirm Squad Configuration
            </Typography>
            <Typography variant="body2"><strong>Team Name:</strong> {teamName} ({teamType})</Typography>
            <Typography variant="body2"><strong>Assigned Members:</strong> {selectedMemberIds.length} Engineers</Typography>
            <Typography variant="body2"><strong>Sprint 1 Velocity Target:</strong> {estimatedStoryPoints} Story Points ({sprintCapacityHours} hrs)</Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>Next</Button>
        ) : (
          <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={handleSubmit}>
            Create Pod & Launch Sprint 1
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
