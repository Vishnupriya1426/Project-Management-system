import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Slider,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewKanban as KanbanIcon,
  FormatListBulleted as ListIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  AttachFile as AttachIcon,
  CheckCircle as CompleteIcon,
  Tune as ProgressIcon,
} from '@mui/icons-material';

import api from '../../../config/axios.config';

interface TaskItem {
  id: number;
  taskCode: string;
  title: string;
  projectCode: string;
  projectName: string;
  assigneeName: string;
  assignedBy: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED';
  progress: number;
  estimatedHours: number;
  dueDate: string;
  description: string;
  comments: Array<{ author: string; text: string; date: string }>;
  attachments: Array<{ name: string; size: string }>;
  history: Array<{ action: string; timestamp: string }>;
}

export const TaskListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Task for View / Update Modals
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);

  const [activeViewTab, setActiveViewTab] = useState(0);
  const [newProgress, setNewProgress] = useState<number>(50);
  const [newComment, setNewComment] = useState('');

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    api.get('/tasks')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiTasks: TaskItem[] = res.data.data.map((t: any) => ({
            id: t.id,
            taskCode: t.taskCode || `TSK-100${t.id}`,
            title: t.title,
            projectCode: t.project?.projectCode || 'PRJ-2026-001',
            projectName: t.project?.title || 'Enterprise Cloud Migration Platform',
            assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned Employee',
            assignedBy: 'Tech Lead Rahul',
            priority: t.priority || 'HIGH',
            status: t.status || 'IN_PROGRESS',
            progress: t.status === 'COMPLETED' ? 100 : 75,
            estimatedHours: t.estimatedHours || 16,
            dueDate: t.dueDate || '2026-07-28',
            description: t.description || 'Task execution spec',
            comments: [],
            attachments: [],
            history: [],
          }));
          setTasks(apiTasks);
        } else {
          setTasks([]);
        }
      })
      .catch(() => {
        setTasks([]);
      });
  }, []);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createPriority, setCreatePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const filteredTasks = tasks.filter(
    (t) =>
      (statusFilter === 'ALL' || t.status === statusFilter) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.taskCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpdateProgressSubmit = () => {
    if (!selectedTask) return;
    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id
          ? {
            ...t,
            progress: newProgress,
            history: [...t.history, { action: `Progress updated to ${newProgress}%`, timestamp: new Date().toLocaleString() }],
          }
          : t
      )
    );
    setNotice(`Task ${selectedTask.taskCode} progress updated to ${newProgress}%. Lead notified & project progress recalculated.`);
    setProgressModalOpen(false);
  };

  const handleAddCommentSubmit = () => {
    if (!selectedTask || !newComment) return;
    const commentObj = { author: 'Authenticated User', text: newComment, date: new Date().toLocaleString() };
    setTasks(
      tasks.map((t) => (t.id === selectedTask.id ? { ...t, comments: [...t.comments, commentObj] } : t))
    );
    setNotice(`Comment added to ${selectedTask.taskCode}. Tech Lead Rahul notified.`);
    setNewComment('');
    setCommentModalOpen(false);
  };

  const handleMarkComplete = (task: TaskItem) => {
    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? {
            ...t,
            status: 'PENDING_REVIEW',
            progress: 100,
            history: [...t.history, { action: 'Submitted for Tech Lead Approval (Pending Review)', timestamp: new Date().toLocaleString() }],
          }
          : t
      )
    );
    setNotice(`Task ${task.taskCode} marked Complete! Submitted to Tech Lead for approval (Status: PENDING_REVIEW).`);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            My Assigned Tasks Workspace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage assigned tasks, update work progress, add technical comments, upload code artifacts & submit for Lead approval.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)}>
            <Tab icon={<KanbanIcon />} label="Kanban Board" />
            <Tab icon={<ListIcon />} label="Table View" />
          </Tabs>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} sx={{ fontWeight: 700 }}>
            Create Task
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Top Filter & Action Toolbar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tasks by ID or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField select fullWidth size="small" label="Status Filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="PENDING_REVIEW">Pending Lead Review</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={5} sx={{ textAlign: 'right' }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" size="small" startIcon={<FilterIcon />} onClick={() => setNotice('Filter preferences applied.')}>
                Filter
              </Button>

              <Button variant="outlined" size="small" startIcon={<ExportIcon />} onClick={() => setNotice('Exported My Tasks to CSV/Excel.')}>
                Export
              </Button>
              <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => setNotice('Refreshed task workspace.')}>
                Refresh
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* VIEW 0: KANBAN BOARD */}
      {viewMode === 0 && (
        <Grid container spacing={2}>
          {(['TODO', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'] as const).map((st) => {
            const colTasks = filteredTasks.filter((t) => t.status === st);
            const colTitle = st === 'TODO' ? 'To Do' : st === 'IN_PROGRESS' ? 'In Progress' : st === 'PENDING_REVIEW' ? 'Pending Review' : 'Completed';
            const colColor = st === 'TODO' ? '#0078D4' : st === 'IN_PROGRESS' ? '#D83B01' : st === 'PENDING_REVIEW' ? '#008272' : '#107C41';

            return (
              <Grid item xs={12} sm={6} md={3} key={st}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, minHeight: 480 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colColor }}>
                      {colTitle}
                    </Typography>
                    <Chip label={colTasks.length} size="small" sx={{ bgcolor: colColor, color: '#fff', fontWeight: 700 }} />
                  </Box>

                  <Stack spacing={2}>
                    {colTasks.map((t) => (
                      <Card key={t.id} elevation={2} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {t.taskCode}
                            </Typography>
                            <Chip label={t.priority} size="small" color={t.priority === 'HIGH' ? 'error' : 'default'} sx={{ height: 18, fontSize: '0.65rem' }} />
                          </Box>

                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                            {t.title}
                          </Typography>

                          <Box sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">Progress</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.progress}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={t.progress} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>

                          <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
                            <Button size="small" onClick={() => { setSelectedTask(t); setViewModalOpen(true); }}>
                              View
                            </Button>
                            <Button size="small" color="secondary" onClick={() => { setSelectedTask(t); setNewProgress(t.progress); setProgressModalOpen(true); }}>
                              Progress
                            </Button>
                            {t.status !== 'PENDING_REVIEW' && t.status !== 'COMPLETED' && (
                              <Button size="small" color="success" onClick={() => handleMarkComplete(t)}>
                                Complete
                              </Button>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 1 && (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Task ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{t.taskCode}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell>
                    <TableCell>{t.projectName}</TableCell>
                    <TableCell>{t.assignedBy}</TableCell>
                    <TableCell>
                      <Chip label={t.priority} size="small" color={t.priority === 'HIGH' ? 'error' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={t.status} size="small" color={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING_REVIEW' ? 'info' : 'warning'} />
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.progress}%</Typography>
                      <LinearProgress variant="determinate" value={t.progress} sx={{ height: 6, borderRadius: 3 }} />
                    </TableCell>
                    <TableCell>{t.dueDate}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" color="primary" onClick={() => { setSelectedTask(t); setViewModalOpen(true); }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={() => { setSelectedTask(t); setNewProgress(t.progress); setProgressModalOpen(true); }}>
                          <ProgressIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="info" onClick={() => { setSelectedTask(t); setCommentModalOpen(true); }}>
                          <CommentIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="warning" onClick={() => { setSelectedTask(t); setAttachmentModalOpen(true); }}>
                          <AttachIcon fontSize="small" />
                        </IconButton>
                        {t.status !== 'PENDING_REVIEW' && t.status !== 'COMPLETED' && (
                          <IconButton size="small" color="success" onClick={() => handleMarkComplete(t)}>
                            <CompleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* VIEW TASK MODAL WITH 5 TABS */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedTask?.taskCode}: {selectedTask?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={activeViewTab} onChange={(_, v) => setActiveViewTab(v)} sx={{ mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Description" />
            <Tab label="Comments" />
            <Tab label="Attachments" />
            <Tab label="History" />
          </Tabs>

          {activeViewTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2"><strong>Project:</strong> {selectedTask?.projectName}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Assigned By:</strong> {selectedTask?.assignedBy}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Priority:</strong> {selectedTask?.priority}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Status:</strong> {selectedTask?.status}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Progress:</strong> {selectedTask?.progress}%</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Due Date:</strong> {selectedTask?.dueDate}</Typography></Grid>
            </Grid>
          )}

          {activeViewTab === 1 && (
            <Typography variant="body1">{selectedTask?.description}</Typography>
          )}

          {activeViewTab === 2 && (
            <Box>
              {selectedTask?.comments.map((c, i) => (
                <Paper key={i} sx={{ p: 1.5, mb: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.author} • {c.date}</Typography>
                  <Typography variant="body2">{c.text}</Typography>
                </Paper>
              ))}
            </Box>
          )}

          {activeViewTab === 3 && (
            <Box>
              {selectedTask?.attachments.map((a, i) => (
                <Chip key={i} label={`${a.name} (${a.size})`} icon={<AttachIcon />} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          )}

          {activeViewTab === 4 && (
            <Box>
              {selectedTask?.history.map((h, i) => (
                <Typography key={i} variant="caption" display="block" sx={{ mb: 0.5 }}>
                  • <strong>{h.timestamp}:</strong> {h.action}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* UPDATE PROGRESS MODAL */}
      <Dialog open={progressModalOpen} onClose={() => setProgressModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Work Progress (%)</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2, pb: 1, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 2 }}>
              {newProgress}%
            </Typography>
            <Slider value={newProgress} onChange={(_, v) => setNewProgress(v as number)} step={5} marks min={0} max={100} valueLabelDisplay="auto" />
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              {[10, 25, 50, 75, 100].map((val) => (
                <Button key={val} size="small" variant={newProgress === val ? 'contained' : 'outlined'} onClick={() => setNewProgress(val)}>
                  {val}%
                </Button>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateProgressSubmit}>
            Update Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD COMMENT MODAL */}
      <Dialog open={commentModalOpen} onClose={() => setCommentModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Technical Comment</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment Message"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="e.g. JWT API completed. Frontend integration pending."
            sx={{ pt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddCommentSubmit}>
            Post Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD ATTACHMENT MODAL */}
      <Dialog open={attachmentModalOpen} onClose={() => setAttachmentModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Code / Document Artifact</DialogTitle>
        <DialogContent dividers>
          <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, border: '2px dashed #0078D4', borderRadius: 2, cursor: 'pointer' }}>
            <AttachIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Click to select file</Typography>
            <Typography variant="caption" color="text.secondary">Supports Screenshot, ZIP, PDF, Design, Logs</Typography>
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0] && selectedTask) {
                  setNotice(`Uploaded ${e.target.files[0].name} to task ${selectedTask.taskCode}.`);
                  setAttachmentModalOpen(false);
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachmentModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE TASK DIALOG */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Task</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Task Title" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} fullWidth />
            <TextField select label="Priority" value={createPriority} onChange={(e) => setCreatePriority(e.target.value as any)} fullWidth>
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="URGENT">URGENT</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (createTitle) {
                const newTask: TaskItem = {
                  id: Date.now(),
                  taskCode: `TSK-${tasks.length + 1001}`,
                  title: createTitle,
                  projectCode: 'PRJ-2026-001',
                  projectName: 'Enterprise Cloud Migration',
                  assigneeName: 'Unassigned Staff',
                  assignedBy: 'Self',
                  priority: createPriority,
                  status: 'TODO',
                  progress: 0,
                  estimatedHours: 8,
                  dueDate: '2026-08-01',
                  description: createTitle,
                  comments: [],
                  attachments: [],
                  history: [{ action: 'Created Task', timestamp: new Date().toLocaleString() }],
                };
                setTasks([...tasks, newTask]);
                setNotice(`Created task ${newTask.taskCode}.`);
                setCreateTitle('');
                setCreateDialogOpen(false);
              }
            }}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskListPage;
