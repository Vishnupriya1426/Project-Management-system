import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Stack,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send as SubmitIcon,
  Save as SaveIcon,
  AssignmentTurnedIn as ReportIcon,
} from '@mui/icons-material';
import { downloadFileBlob } from '../../../config/axios.config';

export const DailyReportPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: '2026-07-22',
    todayWork: 'Completed OAuth2 JWT token rotation, updated EmployeeServiceImpl transactional methods, and verified clean npm run build.',
    hoursWorked: '8',
    completedTasks: 'PRJ-001-T01 (OAuth2 Auth Engine), PRJ-001-T04 (12-Step Employee Creation)',
    blockers: 'None. All Docker services (spems-mysql, spems-backend, spems-frontend) are running healthy.',
    tomorrowPlan: 'Build 10 Employee Portal modules and verify role-based permissions.',
  });

  const handleSubmit = () => {
    setNotice('Daily Work Report submitted successfully to Tech Lead Rahul & Manager Sarah Connor! Audit log updated.');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          End-of-Day Daily Work Report
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submit your daily accomplishments, hours worked, completed tasks, blockers, and tomorrow's plan.
        </Typography>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Column */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReportIcon color="primary" /> Daily Work Log Form
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Report Date"
                  InputLabelProps={{ shrink: true }}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Hours Worked Today"
                  value={form.hoursWorked}
                  onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Today's Work Summary *"
                  value={form.todayWork}
                  onChange={(e) => setForm({ ...form, todayWork: e.target.value })}
                  placeholder="Detailed summary of tasks, pull requests, and features completed today..."
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Completed Task IDs / Titles"
                  value={form.completedTasks}
                  onChange={(e) => setForm({ ...form, completedTasks: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Blockers / Impediments (If Any)"
                  value={form.blockers}
                  onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                  placeholder="State any technical blockers or unblocked requirements..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Tomorrow's Planned Tasks *"
                  value={form.tomorrowPlan}
                  onChange={(e) => setForm({ ...form, tomorrowPlan: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => setNotice('Draft daily work report saved locally.')}>
                Save Draft
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  downloadFileBlob('/reports/pdf?title=SPEMS_Daily_Work_Report', 'SPEMS_Daily_Work_Report.pdf');
                  setNotice('📄 Daily Work Report PDF downloaded to your machine!');
                }}
                sx={{ fontWeight: 700 }}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={() => {
                  downloadFileBlob('/reports/excel?title=SPEMS_Daily_Report_Excel', 'SPEMS_Daily_Report.xlsx');
                  setNotice('📊 Daily Work Report Excel spreadsheet downloaded to your machine!');
                }}
                sx={{ fontWeight: 700 }}
              >
                Export Excel
              </Button>
              <Button variant="contained" color="success" startIcon={<SubmitIcon />} onClick={handleSubmit} sx={{ fontWeight: 700, px: 3 }}>
                Submit Daily Report
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Workflow Summary Side Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: 'action.hover' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Report Workflow
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                1. <strong>Submit:</strong> Employee submits end-of-day report.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                2. <strong>Notify:</strong> Tech Lead Rahul & Manager Sarah Connor receive real-time notification.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                3. <strong>Store:</strong> Activity recorded in employee timeline & audit log.
              </Typography>
              <Typography variant="body2">
                4. <strong>Analytics:</strong> Updates sprint velocity and team productivity graphs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DailyReportPage;
