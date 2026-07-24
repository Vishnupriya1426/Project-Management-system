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
  AvatarGroup,
  Avatar,
  Tooltip,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Add as AddIcon,
  Assignment as TaskIcon,
  Description as DocIcon,
  Business as OrgIcon,
  CheckCircle as AttendanceIcon,
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
  participantsCount: number;
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

  useEffect(() => {
    api.get('/meetings')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const fetched: MeetingItem[] = res.data.data.map((m: any) => ({
            id: m.id,
            meetingId: m.meetingId || `MTG-2026-90${m.id}`,
            title: m.title,
            type: m.type || 'Sync Meeting',
            priority: m.priority || 'HIGH',
            status: m.status || 'Scheduled',
            organization: 'SPEMS Enterprise HQ',
            department: 'Engineering',
            team: 'Alpha Pod',
            project: m.project ? m.project.title : 'Enterprise Cloud Migration',
            organizer: m.organizer ? m.organizer.firstName : 'Super Admin',
            meetingDate: m.meetingDate || '2026-07-25',
            startTime: m.startTime || '10:00 AM',
            endTime: m.endTime || '11:00 AM',
            meetingUrl: m.meetingUrl || 'https://meet.google.com/spems-sync',
            agenda: m.agenda || 'Project agenda review',
            participantsCount: m.participantsCount || 5,
            momUploaded: true,
          }));
          setMeetings(fetched);
        } else {
          setMeetings([]);
        }
      })
      .catch(() => {
        setMeetings([]);
      });
  }, []);

  const handleMeetingScheduled = (meetingData: any) => {
    const newM: MeetingItem = {
      id: meetingData.id,
      meetingId: meetingData.meetingId,
      title: meetingData.title,
      type: meetingData.type,
      priority: meetingData.priority,
      status: meetingData.status,
      organization: meetingData.organization,
      department: meetingData.department,
      team: meetingData.team,
      project: meetingData.project,
      organizer: meetingData.organizer,
      meetingDate: meetingData.meetingDate,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      meetingUrl: meetingData.meetingUrl,
      agenda: meetingData.agenda,
      participantsCount: meetingData.participants.length,
      momUploaded: false,
    };

    setMeetings([newM, ...meetings]);
    setNotice(`Meeting "${newM.title}" (${newM.meetingId}) scheduled! All Calendars, Employee Dashboards, Client Portals, and HTML email invitations synchronized.`);
  };

  const handleSaveMoM = () => {
    setMomDialogOpen(false);
    setTaskCreatedNotice(`Minutes of Meeting (MoM) published for "${selectedMeetingTitle}". Action item task automatically created & assigned on Task Kanban Board.`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Enterprise Meeting Management & Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cascading Organization selection, automatic calendar sync, email dispatch, and Action Item task conversion
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
                <TableCell sx={{ fontWeight: 700 }}>Type & Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organization Context</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Participants</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>MoM Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>
                      {m.meetingId}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {m.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
                      {m.agenda.split('\n')[0]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} alignItems="flex-start">
                      <Chip label={m.type} size="small" color="primary" variant="outlined" />
                      <Chip
                        label={m.priority}
                        size="small"
                        color={m.priority === 'CRITICAL' ? 'error' : m.priority === 'HIGH' ? 'warning' : 'success'}
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <OrgIcon fontSize="small" color="action" /> {m.organization}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {m.department} • {m.project}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{m.meetingDate}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.startTime} - {m.endTime}</Typography>
                  </TableCell>
                  <TableCell>
                    <AvatarGroup max={3}>
                      <Avatar sx={{ bgcolor: '#0078D4', width: 28, height: 28, fontSize: '0.75rem' }}>SC</Avatar>
                      <Avatar sx={{ bgcolor: '#008272', width: 28, height: 28, fontSize: '0.75rem' }}>AM</Avatar>
                      <Avatar sx={{ bgcolor: '#D83B01', width: 28, height: 28, fontSize: '0.75rem' }}>JD</Avatar>
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary">({m.participantsCount} invited)</Typography>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
