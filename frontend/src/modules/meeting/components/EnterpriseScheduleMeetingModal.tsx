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
  Alert,
  IconButton,
  Chip,
  OutlinedInput,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Close as CloseIcon, Event as CalendarIcon, VideoCall as VideoIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface EnterpriseScheduleMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (meetingData: any) => void;
}

export const EnterpriseScheduleMeetingModal: React.FC<EnterpriseScheduleMeetingModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Sprint Planning');
  const [clientId, setClientId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [teamId, setTeamId] = useState<number | ''>('');
  const [meetingDate, setMeetingDate] = useState('2026-07-25');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/spems-sync');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);
  const [agenda, setAgenda] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/clients')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setOrganizations(raw);
        })
        .catch(() => setOrganizations([]));

      api.get('/departments')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setDepartments(raw);
        })
        .catch(() => setDepartments([]));

      api.get('/projects')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setProjects(raw);
        })
        .catch(() => setProjects([]));

      api.get('/teams')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setTeams(raw);
        })
        .catch(() => setTeams([]));

      api.get('/employees?size=100')
        .then((res) => {
          const raw = res.data?.data?.content || res.data?.data || [];
          if (Array.isArray(raw)) setEmployees(raw);
        })
        .catch(() => setEmployees([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title || !title.trim()) {
      setErrorMsg('Meeting Title is required.');
      return;
    }
    if (!meetingDate) {
      setErrorMsg('Meeting Date is required.');
      return;
    }
    if (!startTime) {
      setErrorMsg('Start Time is required.');
      return;
    }
    if (endTime && endTime <= startTime) {
      setErrorMsg('End Time must be after Start Time.');
      return;
    }
    if (meetingUrl && !/^https?:\/\/.+/.test(meetingUrl.trim())) {
      setErrorMsg('Meeting URL must start with http:// or https://');
      return;
    }

    let visibilityScope = 'PROJECT_TEAM';
    if (meetingType === 'Client Review' || clientId) visibilityScope = 'CLIENT_ONLY';
    if (meetingType === 'All Hands') visibilityScope = 'PUBLIC_ENTERPRISE';

    const payload = {
      title,
      meetingType,
      visibilityScope,
      meetingDate,
      startTime,
      endTime,
      meetingUrl: meetingUrl || 'https://meet.google.com/spems-sync',
      locationType: 'Online',
      agenda: agenda || 'Role-based enterprise meeting discussion',
      status: 'SCHEDULED',
      clientId: clientId || null,
      departmentId: departmentId || null,
      projectId: projectId || null,
      teamId: teamId || null,
      participantIds: selectedParticipantIds,
    };

    try {
      const res = await api.post('/meetings', payload);
      const createdData = res.data?.data || payload;
      onSuccess(createdData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule meeting.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Schedule Role-Based Meeting
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
          {/* 1. TITLE */}
          <Grid item xs={12}>
            <TextField
              label="Meeting Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Sprint 15 Velocity & Architecture Alignment Sync"
              fullWidth
              required
            />
          </Grid>

          {/* 2. MEETING TYPE */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Meeting Type *"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              fullWidth
            >
              <MenuItem value="Sprint Planning">Sprint Planning</MenuItem>
              <MenuItem value="Daily Standup">Daily Standup</MenuItem>
              <MenuItem value="Client Review">Client Status Review</MenuItem>
              <MenuItem value="Technical Discussion">Technical Architecture</MenuItem>
              <MenuItem value="1-on-1 Sync">1-on-1 Catchup</MenuItem>
              <MenuItem value="All Hands">All-Hands Company Sync</MenuItem>
            </TextField>
          </Grid>

          {/* 3. ORGANIZATION / CLIENT */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Target Organization"
              value={clientId}
              onChange={(e) => setClientId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Internal Enterprise HQ --</MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.companyName || org.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 4. DEPARTMENT */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Target Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Department --</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code || 'DEPT'})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 5. PROJECT */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Target Project"
              value={projectId}
              onChange={(e) => setProjectId(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">-- Select Project --</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title || p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* 6. TEAM */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Delivery Pod Team"
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

          {/* 7. VIDEO LINK */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Video Room URL"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              InputProps={{ startAdornment: <VideoIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
              fullWidth
            />
          </Grid>

          {/* 8. DATE & TIME */}
          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label="Meeting Date *"
              InputLabelProps={{ shrink: true }}
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="time"
              label="Start Time *"
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="time"
              label="End Time *"
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* 9. PARTICIPANTS WITH SELECT ALL */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="participants-label">Invited Participants</InputLabel>
              <Select
                labelId="participants-label"
                multiple
                value={selectedParticipantIds}
                onChange={(e) => {
                  const vals = e.target.value as number[];
                  if (vals.includes(-1)) {
                    if (selectedParticipantIds.length === employees.length) {
                      setSelectedParticipantIds([]);
                    } else {
                      setSelectedParticipantIds(employees.map((emp) => emp.id));
                    }
                  } else {
                    setSelectedParticipantIds(vals);
                  }
                }}
                input={<OutlinedInput label="Invited Participants" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const emp = employees.find((e) => e.id === id);
                      return (
                        <Chip
                          key={id}
                          label={emp ? `${emp.firstName} ${emp.lastName}` : `EMP-${id}`}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                <MenuItem
                  value={-1}
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    bgcolor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {selectedParticipantIds.length === employees.length ? '✓ Deselect All' : '+ Select All Participants'}
                </MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.designation || 'Engineer'}) - {e.department?.name || 'Engineering'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 10. AGENDA */}
          <Grid item xs={12}>
            <TextField
              multiline
              rows={2}
              label="Meeting Agenda & Brief Notes"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Key objectives, discussion points, or decision triggers"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
          Schedule Meeting & Dispatch Invites
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnterpriseScheduleMeetingModal;
