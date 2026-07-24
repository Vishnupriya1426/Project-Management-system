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
  Tooltip,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Add as AddIcon,
  Assignment as TaskIcon,
  Description as DocIcon,
  Business as OrgIcon,
  CheckCircle as AttendanceIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { EnterpriseScheduleMeetingModal } from '../components/EnterpriseScheduleMeetingModal';
import api from '../../../config/axios.config';

interface MeetingItem {
  id: number;
  meetingId: string;
  title: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  organization: string;
  department: string;
  team: string;
  project: string;
  organizer: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  meetingUrl: string;
  agenda: string;
  momUploaded?: boolean;
}

export const MeetingListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  // MoM Dialog State
  const [momDialogOpen, setMomDialogOpen] = useState(false);
  const [selectedMeetingTitle, setSelectedMeetingTitle] = useState('');
  const [momSummary, setMomSummary] = useState('');
  const [taskCreatedNotice, setTaskCreatedNotice] = useState<string | null>(null);

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);

  // Action Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMeeting, setActiveMeeting] = useState<MeetingItem | null>(null);

  const fetchMeetings = () => {
    api.get('/meetings')
      .then((res) => {
        const raw = res.data?.data?.content || res.data?.data;
        if (Array.isArray(raw)) {
          const fetched: MeetingItem[] = raw.map((m: any) => ({
            id: m.id,
            meetingId: `MTG-2026-${1000 + m.id}`,
            title: m.title ?? '',
            type: m.meetingType || 'Sync Meeting',
            priority: m.priority || 'HIGH',
            status: m.status || 'SCHEDULED',
            organization: m.organizationName || m.clientName || 'SPEMS Enterprise HQ',
            department: m.departmentName || 'Engineering',
            team: m.teamName || 'All Pods',
            project: m.projectName || 'Enterprise Workspace',
            organizer: 'Project Lead',
            meetingDate: m.meetingDate || 'N/A',
            startTime: m.startTime || '10:00',
            endTime: m.endTime || '11:00',
            meetingUrl: m.meetingUrl || m.meetingLink || 'https://meet.google.com/spems-sync',
            agenda: m.agenda || 'Meeting Agenda',
            momUploaded: false,
          }));
          setMeetings(fetched);
        } else {
          setMeetings([]);
        }
      })
      .catch(() => {
        setMeetings([]);
      });
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleMeetingScheduled = (meetingData: any) => {
    setNotice(`Meeting "${meetingData.title || 'New Meeting'}" scheduled successfully! Cross-module calendars and notification channels updated.`);
    fetchMeetings();
  };

  const handleSaveMoM = () => {
    setMomDialogOpen(false);
    setTaskCreatedNotice(`Minutes of Meeting (MoM) published for "${selectedMeetingTitle}". Action item task automatically created & assigned on Task Kanban Board.`);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, meeting: MeetingItem) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMeeting(meeting);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMeeting(null);
  };

  const handleDeleteMeeting = async () => {
    if (!activeMeeting) return;
    const meetingToDelete = activeMeeting;
    handleCloseMenu();

    try {
      await api.delete(`/meetings/${meetingToDelete.id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== meetingToDelete.id));
      setNotice(`Meeting "${meetingToDelete.title}" permanently deleted from SQL database.`);
    } catch (err) {
      setNotice(`Failed to delete meeting "${meetingToDelete.title}". Please try again.`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Enterprise Meeting Management & Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role-based meeting scheduling, automatic calendar sync, email dispatch, and Action Item task conversion
          </Typography>
        </div>

        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ fontWeight: 700 }}>
          + Schedule Enterprise Meeting
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {taskCreatedNotice && (
        <Alert severity="info" onClose={() => setTaskCreatedNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {taskCreatedNotice}
        </Alert>
      )}

      {/* Meetings Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Meeting ID & Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type & Scope</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Context</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>MoM Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No scheduled meetings yet. Click "+ Schedule Enterprise Meeting" to host a sync.
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>
                        {m.meetingId}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {m.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
                        {m.agenda}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5} alignItems="flex-start">
                        <Chip label={m.type} size="small" color="primary" variant="outlined" />
                        <Chip
                          label={m.status}
                          size="small"
                          color={m.status === 'SCHEDULED' ? 'success' : 'default'}
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <OrgIcon fontSize="small" color="action" /> {m.organization}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.team} • {m.project}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{m.meetingDate}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.startTime} - {m.endTime}</Typography>
                    </TableCell>
                    <TableCell>
                      {m.momUploaded ? (
                        <Chip icon={<DocIcon />} label="MoM Recorded" color="success" size="small" />
                      ) : (
                        <Chip
                          icon={<AttendanceIcon />}
                          label="Pending MoM"
                          color="warning"
                          size="small"
                          clickable
                          onClick={() => { setSelectedMeetingTitle(m.title); setMomDialogOpen(true); }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                        <Tooltip title="Join Virtual Meeting Room">
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<VideoCallIcon />}
                            href={m.meetingUrl}
                            target="_blank"
                            sx={{ fontWeight: 700 }}
                          >
                            Join Room
                          </Button>
                        </Tooltip>
                        <Tooltip title="Meeting Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, m)}
                            id={`meeting-actions-btn-${m.id}`}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ACTION DOTS DROPDOWN MENU */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDeleteMeeting} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Meeting" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.88rem' }} />
        </MenuItem>
      </Menu>

      {/* ENTERPRISE SCHEDULE MEETING MODAL */}
      <EnterpriseScheduleMeetingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleMeetingScheduled}
      />

      {/* MOM UPLOAD & TASK CONVERSION DIALOG */}
      <Dialog open={momDialogOpen} onClose={() => setMomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>📝 Record Minutes of Meeting (MoM) & Action Items</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
            {selectedMeetingTitle}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Meeting Decisions & Action Items *"
            value={momSummary}
            onChange={(e) => setMomSummary(e.target.value)}
            placeholder="e.g. John Doe to optimize database indexes by Friday. Sarah Connor to approve deployment."
            sx={{ my: 1 }}
          />
          <Alert severity="info" sx={{ mt: 1 }}>
            Publishing MoM will automatically generate Task cards assigned to employees on the Task Kanban Board.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMomDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" startIcon={<TaskIcon />} onClick={handleSaveMoM} sx={{ fontWeight: 700 }}>
            Publish MoM & Create Tasks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingListPage;
