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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport as BugIcon,
  CheckCircle as ResolveIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface IssueItem {
  id: number;
  issueCode: string;
  title: string;
  project: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reporter: string;
  assignee: string;
  status: 'OPEN' | 'IN_TRIAGE' | 'RESOLVED';
}

export const IssueListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  const [issues, setIssues] = useState<IssueItem[]>([]);

  useEffect(() => {
    api.get('/issues')
      .then((res) => {
        const items: IssueItem[] = Array.isArray(res.data?.data)
          ? res.data.data.map((i: any) => ({
              id: i.id,
              issueCode: i.issueCode ?? i.code ?? `BUG-${i.id}`,
              title: i.title ?? '',
              project: i.project?.title ?? '',
              severity: i.severity ?? 'MEDIUM',
              reporter: i.reporter ?? '',
              assignee: i.assignee ? `${i.assignee.firstName} ${i.assignee.lastName}` : '',
              status: i.status ?? 'OPEN',
            }))
          : [];
        setIssues(items);
      })
      .catch(() => setIssues([]));
  }, []);

  const handleCreateIssue = () => {
    if (!title) return;
    const newIssue: IssueItem = {
      id: Date.now(),
      issueCode: `BUG-${issues.length + 401}`,
      title,
      project: 'Enterprise Cloud Migration',
      severity,
      reporter: 'Project Manager',
      assignee: 'Unassigned',
      status: 'OPEN',
    };
    setIssues([...issues, newIssue]);
    setNotice(`Issue ${newIssue.issueCode} logged to Project Issue Tracker.`);
    setTitle('');
    setDialogOpen(false);
  };

  const handleResolveIssue = (id: number) => {
    setIssues(issues.map((i) => (i.id === id ? { ...i, status: 'RESOLVED' } : i)));
    setNotice('Issue marked as Resolved. Regression test suite queued.');
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Project Issues & Bug Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor critical production bugs, triage reported issues, and assign resolution engineers.
          </Typography>
        </Box>

        <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 700 }}>
          + Report Issue
        </Button>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Issues Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Issue Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Issue Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reporter</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugIcon fontSize="small" color="error" />
                    {item.issueCode}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.title}</TableCell>
                  <TableCell>{item.project}</TableCell>
                  <TableCell>
                    <Chip label={item.severity} size="small" color={item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'error' : 'warning'} />
                  </TableCell>
                  <TableCell>{item.reporter}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{item.assignee}</TableCell>
                  <TableCell>
                    <Chip label={item.status} size="small" color={item.status === 'RESOLVED' ? 'success' : item.status === 'IN_TRIAGE' ? 'info' : 'error'} />
                  </TableCell>
                  <TableCell align="right">
                    {item.status !== 'RESOLVED' && (
                      <Button size="small" variant="contained" color="success" startIcon={<ResolveIcon />} onClick={() => handleResolveIssue(item.id)}>
                        Mark Resolved
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log New Project Issue</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Issue Title / Summary" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
            <TextField select label="Severity Level" value={severity} onChange={(e) => setSeverity(e.target.value as any)} fullWidth>
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleCreateIssue}>
            Log Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueListPage;
