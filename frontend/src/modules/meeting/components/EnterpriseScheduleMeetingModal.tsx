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
  Avatar,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  GroupAdd as AddPeopleIcon,
  Event as CalendarIcon,
  CheckCircle as SuccessIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface EnterpriseScheduleMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (meetingData: any) => void;
}

interface Participant {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  avatar: string;
  status: string;
  isClient?: boolean;
}

export const EnterpriseScheduleMeetingModal: React.FC<EnterpriseScheduleMeetingModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  // SECTION 1: MEETING INFO
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Sprint Planning');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [status, setStatus] = useState('Scheduled');

  // SECTION 2: CASCADING ORG SELECTION
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  // SECTION 3: HOST INFO
  const [organizer] = useState('Super Admin');
  const [owner, setOwner] = useState('');
  const [moderator, setModerator] = useState('');
  const [recorder, setRecorder] = useState('');

  // SECTION 4: PARTICIPANTS
  const [participantSearch, setParticipantSearch] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allEmployees, setAllEmployees] = useState<Participant[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
        }
      })
      .catch(() => setOrganizations([]));

    api.get('/departments')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDepartments(res.data.data);
        }
      })
      .catch(() => setDepartments([]));

    api.get('/teams')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setTeams(res.data.data);
        }
      })
      .catch(() => setTeams([]));

    api.get('/projects')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setProjects(res.data.data);
        }
      })
      .catch(() => setProjects([]));

    api.get('/employees')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiParticipants: Participant[] = res.data.data.map((e: any) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            role: e.user?.role?.name || 'ROLE_EMPLOYEE',
            department: e.department?.name || 'Engineering',
            email: e.user?.email || `${e.firstName.toLowerCase()}@spems.com`,
            avatar: e.firstName.charAt(0).toUpperCase(),
            status: 'Available',
          }));
          setAllEmployees(apiParticipants);
        }
      })
      .catch(() => setAllEmployees([]));
  }, []);

  // SECTION 5: DATE & TIME
  const [meetingDate, setMeetingDate] = useState('2026-07-25');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [timezone, setTimezone] = useState('EST (UTC-5) / New York');
  const [recurring, setRecurring] = useState('Weekly');
  const [recurringEndDate, setRecurringEndDate] = useState('2026-12-31');

  // SECTION 6: LOCATION
  const [locationType, setLocationType] = useState<'Online' | 'Offline' | 'Hybrid'>('Online');
  const [videoProvider, setVideoProvider] = useState('Microsoft Teams');
  const [meetingUrl, setMeetingUrl] = useState('https://teams.microsoft.com/l/meetup-join/spems-sync-2026');
  const [building, setBuilding] = useState('SPEMS Tech Tower 1');
  const [floorRoom, setFloorRoom] = useState('Floor 8, Executive Room 802');

  // SECTION 7: RELATED AGILE CONTEXT
  const [sprint, setSprint] = useState('Sprint 15');
  const [milestone, setMilestone] = useState('Phase 2 Cloud Gateways');
  const [ticketNumber, setTicketNumber] = useState('SPEMS-4091');

  // SECTION 8: ATTACHMENTS
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // SECTION 9: REMINDERS & CHANNELS
  const [reminderTime, setReminderTime] = useState('15 mins');
  const [sendEmailInvite, setSendEmailInvite] = useState(true);
  const [sendBellAlert, setSendBellAlert] = useState(true);
  const [sendDashboardWidget, setSendDashboardWidget] = useState(true);

  // SECTION 10: PERMISSIONS
  const [allowRecording, setAllowRecording] = useState(true);
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [mandatoryAttendance, setMandatoryAttendance] = useState(true);

  // SECTION 11: NOTES & AGENDA
  const [agenda, setAgenda] = useState('1. Sprint 14 Velocity Review\n2. Sprint 15 Story Points Allocation\n3. Risk & Impediment Triage\n4. Client Signoff Milestone Schedule');
  const [discussionTopics, setDiscussionTopics] = useState('OAuth2 PKCE Flow, High-Res PDF Export Engine, Multi-Tenant Database Security');

  // Handlers for Participant Quick Select Buttons
  const handleSelectAllTeam = () => {
    setParticipants(allEmployees.filter((e) => e.department === selectedDept));
    setNotice(`Added all members of ${selectedDept} Department.`);
  };

  const handleInviteClients = () => {
    const clients = allEmployees.filter((e) => e.isClient);
    setParticipants((prev) => [...prev.filter((p) => !p.isClient), ...clients]);
    setNotice('Corporate Client partners added to invitation roster.');
  };

  const handleAddParticipant = (emp: Participant) => {
    if (!participants.some((p) => p.id === emp.id)) {
      setParticipants([...participants, emp]);
    }
  };

  const handleRemoveParticipant = (id: number) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleScheduleAndSend = async () => {
    if (!title) {
      setNotice('Please enter a Meeting Title.');
      return;
    }

    const matchedProject = projects.find((p) => (p.title || p.name) === selectedProject);
    const matchedTeam = teams.find((t) => t.name === selectedTeam);
    const matchedOrg = organizations.find((o) => (o.companyName || o.name) === selectedOrg);

    let visibilityScope = 'PROJECT_TEAM';
    if (meetingType === 'Client Meeting' || selectedOrg) {
      visibilityScope = 'CLIENT_ONLY';
    } else if (meetingType === 'Management Review' || meetingType === 'HR Meeting') {
      visibilityScope = 'ROLE_RESTRICTED';
    } else if (meetingType === 'All Hands') {
      visibilityScope = 'PUBLIC_ENTERPRISE';
    }

    const payload = {
      title,
      meetingType,
      visibilityScope,
      meetingDate: meetingDate || '2026-07-25',
      startTime: startTime || '10:00',
      endTime: endTime || '11:00',
      durationMinutes: 60,
      meetingUrl: meetingUrl || 'https://meet.google.com/spems-sync',
      locationType,
      buildingRoom: `${building} ${floorRoom}`.trim(),
      agenda,
      status: 'SCHEDULED',
      projectId: matchedProject ? matchedProject.id : null,
      teamId: matchedTeam ? matchedTeam.id : null,
      clientId: matchedOrg ? matchedOrg.id : null,
      participantIds: participants.map((p) => p.id),
    };

    try {
      const res = await api.post('/meetings', payload);
      const createdData = res.data?.data || payload;
      onSuccess(createdData);
      onClose();
    } catch (err: any) {
      console.error('Error scheduling meeting:', err);
      setNotice(err.response?.data?.message || 'Failed to schedule meeting.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalendarIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Enterprise Meeting Management Studio
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cascading Organization Data • Live Participant Selection • Automated Platform Synchronization
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        {notice && (
          <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 2, fontWeight: 600 }}>
            {notice}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="1. Info & Hierarchy" />
          <Tab label={`2. Participants (${participants.length})`} />
          <Tab label="3. Date, Time & Virtual Room" />
          <Tab label="4. Agile, Attachments & Security" />
          <Tab label="5. Agenda & Dispatches" />
        </Tabs>

        {/* TAB 1: MEETING INFO & CASCADING HIERARCHY */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Section 1 & 2: Meeting Information & Cascading Enterprise Hierarchy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField label="Meeting Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 Executive Sprint 15 Planning & Architecture Sync" required fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="Meeting Type *" value={meetingType} onChange={(e) => setMeetingType(e.target.value)} fullWidth>
                  <MenuItem value="Sprint Planning">Sprint Planning</MenuItem>
                  <MenuItem value="Daily Standup">Daily Standup</MenuItem>
                  <MenuItem value="Sprint Review">Sprint Review</MenuItem>
                  <MenuItem value="Sprint Retrospective">Sprint Retrospective</MenuItem>
                  <MenuItem value="Client Meeting">Client Meeting</MenuItem>
                  <MenuItem value="HR Meeting">HR Meeting</MenuItem>
                  <MenuItem value="Technical Discussion">Technical Discussion</MenuItem>
                  <MenuItem value="Project Kickoff">Project Kickoff</MenuItem>
                  <MenuItem value="Architecture Review">Architecture Review</MenuItem>
                  <MenuItem value="Production Incident">Production Incident</MenuItem>
                  <MenuItem value="Management Review">Management Review</MenuItem>
                  <MenuItem value="One-on-One">One-on-One</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField multiline rows={2} label="Meeting Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed context and purpose of the meeting" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Meeting Priority" value={priority} onChange={(e) => setPriority(e.target.value as any)} fullWidth>
                  <MenuItem value="LOW">LOW</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                  <MenuItem value="HIGH">HIGH (Urgent Team Alignment)</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL (Production Incident)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Meeting Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Draft">Save as Draft</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                  Cascading Enterprise Selection (DB Entity Records)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField select label="Organization *" value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)} fullWidth>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.companyName || org.name}>
                      {org.companyName || org.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select label="Department *" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} fullWidth>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select label="Team *" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} fullWidth>
                  {teams.map((t) => (
                    <MenuItem key={t.id} value={t.name}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField select label="Project *" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} fullWidth>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.title || p.name}>
                      {p.title || p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* HOST & LEADERSHIP */}
              <Grid item xs={12} sm={3}>
                <TextField label="Meeting Organizer" value={organizer} disabled fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Meeting Owner" value={owner} onChange={(e) => setOwner(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Meeting Moderator" value={moderator} onChange={(e) => setModerator(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="MoM Minutes Secretary" value={recorder} onChange={(e) => setRecorder(e.target.value)} fullWidth />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: PARTICIPANTS & ONE-CLICK BULK INVITES */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              Section 4: Enterprise Participants Roster & Bulk Selection Action Buttons
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Button variant="outlined" size="small" startIcon={<AddPeopleIcon />} onClick={handleSelectAllTeam}>
                + Select All Team ({selectedTeam})
              </Button>
              <Button variant="outlined" size="small" startIcon={<AddPeopleIcon />} onClick={handleSelectAllTeam}>
                + Select Project Members
              </Button>
              <Button variant="outlined" size="small" color="secondary" onClick={handleInviteClients}>
                + Invite Corporate Clients
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: 320, overflow: 'auto' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search Staff by Name, Role, Skill..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    sx={{ mb: 2 }}
                  />
                  <Stack spacing={1}>
                    {allEmployees
                      .filter((e) => e.name.toLowerCase().includes(participantSearch.toLowerCase()))
                      .map((emp) => (
                        <Paper key={emp.id} elevation={0} sx={{ p: 1, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: emp.isClient ? 'secondary.main' : 'primary.main' }}>{emp.avatar}</Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{emp.department} • {emp.email}</Typography>
                            </Box>
                          </Box>
                          <Button size="small" variant="contained" onClick={() => handleAddParticipant(emp)}>
                            + Add
                          </Button>
                        </Paper>
                      ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: 320, overflow: 'auto', bgcolor: 'rgba(0, 120, 212, 0.02)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Invited Participants Roster ({participants.length})
                  </Typography>
                  <Stack spacing={1}>
                    {participants.map((p) => (
                      <Paper key={p.id} elevation={1} sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: p.isClient ? 'secondary.main' : 'primary.main' }}>{p.avatar}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                            <Chip label={p.status} size="small" color={p.status === 'Available' ? 'success' : 'warning'} sx={{ height: 18, fontSize: '0.65rem' }} />
                          </Box>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => handleRemoveParticipant(p.id)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 3: DATE, TIME & LOCATION */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Section 5 & 6: Date, Time, Timezone & Location Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField type="date" label="Meeting Date *" InputLabelProps={{ shrink: true }} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField type="time" label="Start Time *" InputLabelProps={{ shrink: true }} value={startTime} onChange={(e) => setStartTime(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField type="time" label="End Time *" InputLabelProps={{ shrink: true }} value={endTime} onChange={(e) => setEndTime(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Timezone *" value={timezone} onChange={(e) => setTimezone(e.target.value)} fullWidth />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField select label="Recurring Meeting" value={recurring} onChange={(e) => setRecurring(e.target.value)} fullWidth>
                  <MenuItem value="No">No Recurrence (One-time)</MenuItem>
                  <MenuItem value="Daily">Daily Standup</MenuItem>
                  <MenuItem value="Weekly">Weekly Sprint Sync</MenuItem>
                  <MenuItem value="Monthly">Monthly Executive Review</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="Recurring End Date" InputLabelProps={{ shrink: true }} value={recurringEndDate} onChange={(e) => setRecurringEndDate(e.target.value)} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 700 }}>Meeting Mode</FormLabel>
                  <RadioGroup row value={locationType} onChange={(e) => setLocationType(e.target.value as any)}>
                    <FormControlLabel value="Online" control={<Radio />} label="Virtual Online Room" />
                    <FormControlLabel value="Offline" control={<Radio />} label="In-Person Office Room" />
                    <FormControlLabel value="Hybrid" control={<Radio />} label="Hybrid (Online + Office Room)" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {locationType !== 'Offline' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField select label="Virtual Platform Provider" value={videoProvider} onChange={(e) => setVideoProvider(e.target.value)} fullWidth>
                      <MenuItem value="Microsoft Teams">Microsoft Teams</MenuItem>
                      <MenuItem value="Zoom Video">Zoom Video</MenuItem>
                      <MenuItem value="Google Meet">Google Meet</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Auto-Generated Meeting Link" value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} fullWidth />
                  </Grid>
                </>
              )}

              {locationType !== 'Online' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Building Location" value={building} onChange={(e) => setBuilding(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Floor & Conference Room ID" value={floorRoom} onChange={(e) => setFloorRoom(e.target.value)} fullWidth />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}

        {/* TAB 4: AGILE, ATTACHMENTS & SECURITY */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Section 7, 8, 9 & 10: Agile Context, Attachments, Reminders & Security Permissions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="Agile Sprint" value={sprint} onChange={(e) => setSprint(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Project Milestone" value={milestone} onChange={(e) => setMilestone(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Jira / Ticket ID" value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)} fullWidth />
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
                    p: 2.5,
                    textAlign: 'center',
                    bgcolor: 'rgba(0, 120, 212, 0.04)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 120, 212, 0.08)' },
                  }}
                >
                  <UploadIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0078D4' }}>
                    Upload Meeting Agenda PDF, Architecture Specs & Supporting Docs
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {attachmentName ? `Attached: ${attachmentName}` : 'Supports PDF, PPTX, XLSX, DOCX (Max 25MB)'}
                  </Typography>
                  <input type="file" hidden onChange={(e) => e.target.files && setAttachmentName(e.target.files[0].name)} />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField select label="Automatic Reminder Timer" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} fullWidth>
                  <MenuItem value="15 mins">15 Minutes Before</MenuItem>
                  <MenuItem value="30 mins">30 Minutes Before</MenuItem>
                  <MenuItem value="1 Hour">1 Hour Before</MenuItem>
                  <MenuItem value="1 Day">1 Day Before</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Notification Channels
                </Typography>
                <Stack direction="row" spacing={1}>
                  <FormControlLabel control={<Checkbox checked={sendEmailInvite} onChange={(e) => setSendEmailInvite(e.target.checked)} />} label="Email Invites" />
                  <FormControlLabel control={<Checkbox checked={sendBellAlert} onChange={(e) => setSendBellAlert(e.target.checked)} />} label="Bell Notification" />
                  <FormControlLabel control={<Checkbox checked={sendDashboardWidget} onChange={(e) => setSendDashboardWidget(e.target.checked)} />} label="Dashboard Widget" />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                  Security & Recording Permissions
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel control={<Checkbox checked={allowRecording} onChange={(e) => setAllowRecording(e.target.checked)} />} label="Allow Recording" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel control={<Checkbox checked={allowScreenShare} onChange={(e) => setAllowScreenShare(e.target.checked)} />} label="Allow Screen Share" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel control={<Checkbox checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} />} label="Require Host Approval" />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControlLabel control={<Checkbox checked={mandatoryAttendance} onChange={(e) => setMandatoryAttendance(e.target.checked)} />} label="Mandatory Attendance" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 5: AGENDA & DISPATCHES */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              Section 11: Agenda Topics & Automated Platform Synchronization
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField multiline rows={3} label="Meeting Agenda & Key Objectives *" value={agenda} onChange={(e) => setAgenda(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField multiline rows={2} label="Discussion Topics & Architectural Specs" value={discussionTopics} onChange={(e) => setDiscussionTopics(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="success" icon={<SuccessIcon />}>
                  Enterprise Synchronization Engine Ready: Scheduling will automatically update Database, All Calendars, Employee Dashboards, PM Portals, Client Portals, and dispatch HTML email invites.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="secondary">
            Save Draft
          </Button>
          <Button variant="contained" color="success" size="large" startIcon={<EmailIcon />} onClick={handleScheduleAndSend} sx={{ fontWeight: 700 }}>
            Schedule & Send Invitations
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EnterpriseScheduleMeetingModal;
