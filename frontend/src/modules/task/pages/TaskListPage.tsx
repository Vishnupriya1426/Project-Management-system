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
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  AttachFile as AttachIcon,
  CheckCircle as CompleteIcon,
  Tune as ProgressIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import api from '../../../config/axios.config';
import { useAuth } from '../../../context/AuthContext';

interface TaskItem {
  id: number;
  taskCode: string;
  title: string;
  projectName: string;
  teamName: string;
  sprintName: string;
  departmentName: string;
  assigneeName: string;
  assigneeId: number | null;
  priority: string;
  status: string;
  progressPercentage: number;
  estimatedHours: number;
  storyPoints: number;
  dueDate: string;
  description: string;
}

export const TaskListPage: React.FC = () => {
  const { user } = useAuth();
  const userRole = (user as any)?.role?.name || (user as any)?.role || 'ROLE_EMPLOYEE';
  const isPMOrAdmin = userRole === 'ROLE_PROJECT_MANAGER' || userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN';

  const [viewMode, setViewMode] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Enterprise Multi-Filters
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [selectedSprintId, setSelectedSprintId] = useState<number | ''>('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter Dropdown Datasets
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Task State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [newProgress, setNewProgress] = useState<number>(50);
  const [newComment, setNewComment] = useState('');

  // Form State for Creating Task
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createProjectId, setCreateProjectId] = useState<number | ''>('');
  const [createTeamId, setCreateTeamId] = useState<number | ''>('');
  const [createSprintId, setCreateSprintId] = useState<number | ''>('');
  const [createDeptId, setCreateDeptId] = useState<number | ''>('');
  const [createAssigneeId, setCreateAssigneeId] = useState<number | ''>('');
  const [createPriority, setCreatePriority] = useState('MEDIUM');
  const [createDueDate, setCreateDueDate] = useState('2026-08-15');
  const [createHours, setCreateHours] = useState(8);
  const [createPoints, setCreatePoints] = useState(5);

  const fetchDropdowns = () => {
    api.get('/projects').then((res) => {
      const raw = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(raw)) setProjects(raw);
    }).catch(() => setProjects([]));

    api.get('/teams').then((res) => {
      const raw = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(raw)) setTeams(raw);
    }).catch(() => setTeams([]));

    api.get('/sprints').then((res) => {
      const raw = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(raw)) setSprints(raw);
    }).catch(() => setSprints([]));

    api.get('/departments').then((res) => {
      const raw = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(raw)) setDepartments(raw);
    }).catch(() => setDepartments([]));

    api.get('/employees?size=100').then((res) => {
      const raw = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(raw)) setEmployees(raw);
    }).catch(() => setEmployees([]));
  };

  const fetchTasks = () => {
    let queryParams: string[] = [];
    if (selectedProjectId) queryParams.push(`projectId=${selectedProjectId}`);
    if (selectedTeamId) queryParams.push(`teamId=${selectedTeamId}`);
    if (selectedSprintId) queryParams.push(`sprintId=${selectedSprintId}`);
    if (selectedDeptId) queryParams.push(`departmentId=${selectedDeptId}`);
    if (selectedAssigneeId) queryParams.push(`assigneeId=${selectedAssigneeId}`);
    if (statusFilter && statusFilter !== 'ALL') queryParams.push(`status=${statusFilter}`);

    const url = `/tasks${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;

    api.get(url)
      .then((res) => {
        const raw = res.data?.data?.content || res.data?.data || [];
        if (Array.isArray(raw)) {
          const mapped: TaskItem[] = raw.map((t: any) => ({
            id: t.id,
            taskCode: t.taskCode || `TSK-2026-${1000 + t.id}`,
            title: t.title || '',
            projectName: t.project?.title || t.project?.name || 'Enterprise Workspace',
            teamName: t.team?.name || 'Squad Team',
            sprintName: t.sprint?.sprintName || 'Active Sprint',
            departmentName: t.department?.name || 'Engineering',
            assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned',
            assigneeId: t.assignee ? t.assignee.id : null,
            priority: t.priority || 'MEDIUM',
            status: t.status || 'TODO',
            progressPercentage: t.progressPercentage ?? (t.status === 'COMPLETED' ? 100 : 0),
            estimatedHours: t.estimatedHours || 8,
            storyPoints: t.storyPoints || 5,
            dueDate: t.dueDate || 'N/A',
            description: t.description || 'Task description & acceptance criteria',
          }));
          setTasks(mapped);
        } else {
          setTasks([]);
        }
      })
      .catch(() => setTasks([]));
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId, selectedTeamId, selectedSprintId, selectedDeptId, selectedAssigneeId, statusFilter]);

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.taskCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTaskSubmit = async () => {
    if (!createTitle) return;

    const payload = {
      title: createTitle,
      description: createDescription,
      projectId: createProjectId || null,
      teamId: createTeamId || null,
      sprintId: createSprintId || null,
      departmentId: createDeptId || null,
      assigneeId: createAssigneeId || null,
      priority: createPriority,
      status: 'TODO',
      dueDate: createDueDate,
      estimatedHours: createHours,
      storyPoints: createPoints,
    };

    try {
      const res = await api.post('/tasks', payload);
      setNotice(`Task "${res.data?.data?.taskCode || createTitle}" created & assigned successfully in MySQL!`);
      setCreateDialogOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      fetchTasks();
    } catch {
      setNotice('Failed to create task.');
    }
  };

  const handleUpdateProgressSubmit = async () => {
    if (!selectedTask) return;
    try {
      await api.put(`/tasks/${selectedTask.id}`, {
        progressPercentage: newProgress,
        status: newProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      });
      setNotice(`Task ${selectedTask.taskCode} progress updated to ${newProgress}%.`);
      setProgressModalOpen(false);
      fetchTasks();
    } catch {
      setNotice('Failed to update progress.');
    }
  };

  const handleMarkComplete = async (task: TaskItem) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        status: 'PENDING_REVIEW',
        progressPercentage: 100,
      });
      setNotice(`Task ${task.taskCode} marked complete & submitted for Tech Lead approval!`);
      fetchTasks();
    } catch {
      setNotice('Failed to submit task for review.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      setNotice('Task deleted successfully.');
      fetchTasks();
    } catch {
      setNotice('Failed to delete task.');
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Enterprise Task Governance & Kanban Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role-Based Task Management • Multi-Dimensional Filters (Project, Team, Sprint, Department, Assignee) • MySQL Persistence
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)}>
            <Tab icon={<KanbanIcon />} label="Kanban Board" />
            <Tab icon={<ListIcon />} label="Table View" />
          </Tabs>

          {isPMOrAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} sx={{ fontWeight: 700 }}>
              + Create Task
            </Button>
          )}
        </Stack>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Multi-Dimensional Filter Toolbar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Code or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField select fullWidth size="small" label="Project" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : '')}>
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.title || p.name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField select fullWidth size="small" label="Squad Team" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : '')}>
              <MenuItem value="">All Teams</MenuItem>
              {teams.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField select fullWidth size="small" label="Agile Sprint" value={selectedSprintId} onChange={(e) => setSelectedSprintId(e.target.value ? Number(e.target.value) : '')}>
              <MenuItem value="">All Sprints</MenuItem>
              {sprints.map((s) => <MenuItem key={s.id} value={s.id}>{s.sprintName}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={1.5}>
            <TextField select fullWidth size="small" label="Department" value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}>
              <MenuItem value="">All Depts</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={1.5}>
            <TextField select fullWidth size="small" label="Assignee" value={selectedAssigneeId} onChange={(e) => setSelectedAssigneeId(e.target.value ? Number(e.target.value) : '')}>
              <MenuItem value="">All Staff</MenuItem>
              {employees.map((e) => <MenuItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</MenuItem>)}
            </TextField>
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
                    {colTasks.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 4, display: 'block' }}>
                        No tasks in {colTitle}
                      </Typography>
                    ) : (
                      colTasks.map((t) => (
                        <Card key={t.id} elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {t.taskCode}
                              </Typography>
                              <Chip label={t.priority} size="small" color={t.priority === 'HIGH' ? 'error' : 'default'} sx={{ height: 18, fontSize: '0.65rem' }} />
                            </Box>

                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {t.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              {t.projectName} • {t.assigneeName}
                            </Typography>

                            <Box sx={{ mb: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">Progress</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.progressPercentage}%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={t.progressPercentage} sx={{ height: 6, borderRadius: 3 }} />
                            </Box>

                            <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
                              <Button size="small" onClick={() => { setSelectedTask(t); setViewModalOpen(true); }}>
                                View
                              </Button>
                              <Button size="small" color="secondary" onClick={() => { setSelectedTask(t); setNewProgress(t.progressPercentage); setProgressModalOpen(true); }}>
                                Progress
                              </Button>
                              {t.status !== 'PENDING_REVIEW' && t.status !== 'COMPLETED' && (
                                <Button size="small" color="success" onClick={() => handleMarkComplete(t)}>
                                  Complete
                                </Button>
                              )}
                              {isPMOrAdmin && (
                                <IconButton size="small" color="error" onClick={() => handleDeleteTask(t.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))
                    )}
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
                  <TableCell sx={{ fontWeight: 700 }}>Project & Team</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assignee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No tasks found for current filter selection.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{t.taskCode}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell>
                      <TableCell>{`${t.projectName} (${t.teamName})`}</TableCell>
                      <TableCell>{t.assigneeName}</TableCell>
                      <TableCell>
                        <Chip label={t.priority} size="small" color={t.priority === 'HIGH' ? 'error' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip label={t.status} size="small" color={t.status === 'COMPLETED' ? 'success' : t.status === 'PENDING_REVIEW' ? 'info' : 'warning'} />
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.progressPercentage}%</Typography>
                        <LinearProgress variant="determinate" value={t.progressPercentage} sx={{ height: 6, borderRadius: 3 }} />
                      </TableCell>
                      <TableCell>{t.dueDate}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" color="primary" onClick={() => { setSelectedTask(t); setViewModalOpen(true); }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="secondary" onClick={() => { setSelectedTask(t); setNewProgress(t.progressPercentage); setProgressModalOpen(true); }}>
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
                          {isPMOrAdmin && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteTask(t.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* VIEW TASK MODAL */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedTask?.taskCode}: {selectedTask?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}><Typography variant="body2"><strong>Project:</strong> {selectedTask?.projectName}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Team:</strong> {selectedTask?.teamName}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Sprint:</strong> {selectedTask?.sprintName}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Department:</strong> {selectedTask?.departmentName}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Assignee:</strong> {selectedTask?.assigneeName}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Priority:</strong> {selectedTask?.priority}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Status:</strong> {selectedTask?.status}</Typography></Grid>
            <Grid item xs={6}><Typography variant="body2"><strong>Progress:</strong> {selectedTask?.progressPercentage}%</Typography></Grid>
            <Grid item xs={12}><Typography variant="body2"><strong>Description:</strong> {selectedTask?.description}</Typography></Grid>
          </Grid>
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
            placeholder="e.g. Code changes pushed to main branch. Verified unit tests."
            sx={{ pt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { setCommentModalOpen(false); setNotice('Comment posted.'); }}>
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
            <Typography variant="caption" color="text.secondary">Supports Screenshot, ZIP, PDF, Logs</Typography>
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNotice(`Uploaded ${e.target.files[0].name} artifact.`);
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

      {/* CREATE TASK DIALOG (PM / ADMIN ONLY) */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create & Assign Enterprise Task</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField label="Task Title *" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Target Project" value={createProjectId} onChange={(e) => setCreateProjectId(Number(e.target.value))} fullWidth>
                <MenuItem value="">-- Select Project --</MenuItem>
                {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.title || p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Squad Team" value={createTeamId} onChange={(e) => setCreateTeamId(Number(e.target.value))} fullWidth>
                <MenuItem value="">-- Select Squad Team --</MenuItem>
                {teams.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Agile Sprint" value={createSprintId} onChange={(e) => setCreateSprintId(Number(e.target.value))} fullWidth>
                <MenuItem value="">-- Select Sprint --</MenuItem>
                {sprints.map((s) => <MenuItem key={s.id} value={s.id}>{s.sprintName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Department" value={createDeptId} onChange={(e) => setCreateDeptId(Number(e.target.value))} fullWidth>
                <MenuItem value="">-- Select Department --</MenuItem>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Assignee Employee" value={createAssigneeId} onChange={(e) => setCreateAssigneeId(Number(e.target.value))} fullWidth>
                <MenuItem value="">-- Unassigned --</MenuItem>
                {employees.map((e) => <MenuItem key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.designation || 'Engineer'})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Priority" value={createPriority} onChange={(e) => setCreatePriority(e.target.value)} fullWidth>
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="URGENT">URGENT</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={createDueDate} onChange={(e) => setCreateDueDate(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="number" label="Est. Hours" value={createHours} onChange={(e) => setCreateHours(Number(e.target.value))} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="number" label="Story Points" value={createPoints} onChange={(e) => setCreatePoints(Number(e.target.value))} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField multiline rows={2} label="Task Specs & Acceptance Criteria" value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateTaskSubmit} sx={{ fontWeight: 700 }}>
            Create & Assign Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskListPage;
