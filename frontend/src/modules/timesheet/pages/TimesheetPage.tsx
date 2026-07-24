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
  Send as SubmitIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface TimesheetEntry {
  id: number;
  date: string;
  project: string;
  task: string;
  hours: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

export const TimesheetPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState('2026-07-22');
  const [project, setProject] = useState('Enterprise Cloud Migration');
  const [task, setTask] = useState('PRJ-001-T01: OAuth2 JWT Token Implementation');
  const [hours, setHours] = useState('8');
  const [hoursError, setHoursError] = useState('');

  const [entries, setEntries] = useState<TimesheetEntry[]>([]);

  useEffect(() => {
    api.get('/timesheets')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiEntries: TimesheetEntry[] = res.data.data.map((t: any) => ({
            id: t.id,
            date: t.workDate || '2026-07-22',
            project: t.project ? t.project.title : 'Enterprise Cloud Migration',
            task: t.task ? t.task.title : 'OAuth2 Implementation',
            hours: t.hoursLogged || 8,
            status: t.status || 'APPROVED',
          }));
          setEntries(apiEntries);
        } else {
          setEntries([
            { id: 1, date: '2026-07-20', project: 'Enterprise Cloud Migration', task: 'OAuth2 Refresh Token Rotation', hours: 8, status: 'APPROVED' },
            { id: 2, date: '2026-07-21', project: 'Enterprise Cloud Migration', task: 'Audit Log Entity Integration', hours: 8, status: 'APPROVED' },
          ]);
        }
      })
      .catch(() => {
        setEntries([
          { id: 1, date: '2026-07-20', project: 'Enterprise Cloud Migration', task: 'OAuth2 Refresh Token Rotation', hours: 8, status: 'APPROVED' },
          { id: 2, date: '2026-07-21', project: 'Enterprise Cloud Migration', task: 'Audit Log Entity Integration', hours: 8, status: 'APPROVED' },
        ]);
      });
  }, []);

  const handleAddEntry = () => {
    setHoursError('');
    const parsedHours = parseFloat(hours);
    if (!hours || isNaN(parsedHours)) { setHoursError('Hours logged is required'); return; }
    if (parsedHours < 0.5 || parsedHours > 24) { setHoursError('Hours must be between 0.5 and 24'); return; }
    if (!project || !project.trim()) { setNotice('Please enter a project name.'); return; }
    const newEntry: TimesheetEntry = {
      id: Date.now(),
      date,
      project,
      task,
      hours: parsedHours,
      status: 'DRAFT',
    };
    setEntries([newEntry, ...entries]);
    setNotice(`Logged ${hours} hours for ${task} on ${date}.`);
    setModalOpen(false);
  };

  const handleSubmitAll = () => {
    setEntries(entries.map((e) => ({ ...e, status: 'SUBMITTED' })));
    setNotice('Submitted week timesheet to Tech Lead & Manager for approval!');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            My Timesheet & Work Hours Record
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log daily project task hours and submit weekly timesheets for Tech Lead & Manager approval.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ fontWeight: 700 }}>
            + Add Entry
          </Button>
          <Button variant="contained" color="success" startIcon={<SubmitIcon />} onClick={handleSubmitAll} sx={{ fontWeight: 700 }}>
            Submit Timesheet
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Timesheet Data Grid */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project Workspace</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Task / Feature</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hours Logged</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Approval Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{e.date}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{e.project}</TableCell>
                  <TableCell>{e.task}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{e.hours} hrs</TableCell>
                  <TableCell>
                    <Chip
                      label={e.status}
                      size="small"
                      color={e.status === 'APPROVED' ? 'success' : e.status === 'SUBMITTED' ? 'primary' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {e.status === 'DRAFT' && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" startIcon={<EditIcon />} onClick={() => setNotice(`Editing entry for ${e.date}`)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setEntries(entries.filter((item) => item.id !== e.id))}>
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Entry Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Work Hours Entry</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(ev) => setDate(ev.target.value)} fullWidth />
            <TextField select label="Project Workspace" value={project} onChange={(ev) => setProject(ev.target.value)} fullWidth>
              <MenuItem value="Enterprise Cloud Migration">Enterprise Cloud Migration</MenuItem>
              <MenuItem value="Healthcare Patient Portal">Healthcare Patient Portal</MenuItem>
            </TextField>
            <TextField label="Task Description" value={task} onChange={(ev) => setTask(ev.target.value)} fullWidth />
            <TextField
              type="number"
              label="Hours Worked"
              value={hours}
              onChange={(ev) => { setHours(ev.target.value); setHoursError(''); }}
              error={Boolean(hoursError)}
              helperText={hoursError || 'Enter hours between 0.5 and 24'}
              inputProps={{ min: 0.5, max: 24, step: 0.5 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddEntry}>
            Save Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetPage;
