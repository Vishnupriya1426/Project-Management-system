import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Chip, Card, CardContent, Stack, Button, Tabs, Tab, Alert } from '@mui/material';
import { Event as EventIcon, Task as TaskIcon, Celebration as BirthdayIcon, Public as HolidayIcon, Add as AddIcon } from '@mui/icons-material';
import { EnterpriseScheduleMeetingModal } from '../components/EnterpriseScheduleMeetingModal';
import api from '../../../config/axios.config';

export const CalendarPage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/meetings')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiEvents = res.data.data.map((m: any) => ({
            date: m.meetingDate || 'Jul 25, 2026',
            title: m.title,
            type: 'MEETING',
            color: '#0078D4',
            time: m.startTime || '10:00 AM',
            scope: 'Organization',
          }));
          setEvents(apiEvents);
        } else {
          setEvents([]);
        }
      })
      .catch(() => {
        setEvents([]);
      });
  }, []);

  const handleMeetingScheduled = (m: any) => {
    const newEv = {
      date: m.meetingDate,
      title: `${m.title} (${m.meetingId})`,
      type: 'MEETING',
      color: '#0078D4',
      time: m.startTime,
      scope: 'Organization',
    };

    setEvents([newEv, ...events]);
    setNotice(`Meeting "${m.title}" automatically synced to Organization, Department, Project, and Employee Calendars!`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Unified Enterprise Calendar & Schedule Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cross-module synchronized calendar tracking Organization, Project, Department, and Employee Events
          </Typography>
        </Box>

        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)} sx={{ fontWeight: 700 }}>
          + Schedule Enterprise Meeting
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Organization Calendar" sx={{ fontWeight: 700 }} />
        <Tab label="Project Calendar" sx={{ fontWeight: 700 }} />
        <Tab label="Department Calendar" sx={{ fontWeight: 700 }} />
        <Tab label="My Employee Schedule" sx={{ fontWeight: 700 }} />
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, minHeight: 450 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
              Synchronized Event Timeline
            </Typography>
            <Stack spacing={2}>
              {events.map((ev, i) => (
                <Card key={i} elevation={1} sx={{ borderRadius: 2, borderLeft: `6px solid ${ev.color}` }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {ev.type === 'MEETING' && <EventIcon sx={{ color: ev.color }} />}
                      {ev.type === 'CLIENT_MEETING' && <EventIcon sx={{ color: ev.color }} />}
                      {ev.type === 'DEADLINE' && <TaskIcon sx={{ color: ev.color }} />}
                      {ev.type === 'BIRTHDAY' && <BirthdayIcon sx={{ color: ev.color }} />}
                      {ev.type === 'HOLIDAY' && <HolidayIcon sx={{ color: ev.color }} />}
                      <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {ev.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ev.date} • {ev.time} • Scope: {ev.scope}
                        </Typography>
                      </div>
                    </Box>
                    <Chip label={ev.type} size="small" sx={{ bgcolor: ev.color, color: '#fff', fontWeight: 700 }} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Calendar Integration Legend
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="MEETING" size="small" sx={{ bgcolor: '#0078D4', color: '#fff' }} />
                <Typography variant="body2">Internal Enterprise Meetings</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="CLIENT_MEETING" size="small" sx={{ bgcolor: '#B4009E', color: '#fff' }} />
                <Typography variant="body2">Corporate Client Review Syncs</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="DEADLINE" size="small" sx={{ bgcolor: '#D83B01', color: '#fff' }} />
                <Typography variant="body2">Project Milestones & Releases</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="HOLIDAY" size="small" sx={{ bgcolor: '#107C41', color: '#fff' }} />
                <Typography variant="body2">Corporate Holidays & Offs</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* SCHEDULE MEETING MODAL */}
      <EnterpriseScheduleMeetingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleMeetingScheduled}
      />
    </Box>
  );
};

export default CalendarPage;
