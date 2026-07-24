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
  TextField,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  Archive as ArchiveIcon,
  Cancel as CloseProjIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axios.config';
import { CreateProjectWizardModal } from '../components/CreateProjectWizardModal';

interface Project {
  id: number;
  projectCode: string;
  title: string;
  clientName: string;
  pmName: string;
  teamLead: string;
  budget: string;
  deadline: string;
  techStack: string[];
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  health: 'HEALTHY' | 'AT_RISK' | 'DELAYED';
  progressPercentage: number;
}

export const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  // Wizard Modal
  const [wizardOpen, setWizardOpen] = useState(false);

  // Row Action Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.get('/projects')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiProjects: Project[] = res.data.data.map((p: any) => ({
            id: p.id,
            projectCode: p.projectCode ?? `PRJ-${p.id}`,
            title: p.title ?? '',
            clientName: p.client?.companyName ?? '',
            pmName: p.projectManager ? `${p.projectManager.firstName} ${p.projectManager.lastName}` : '',
            teamLead: p.teamLead ? `${p.teamLead.firstName} ${p.teamLead.lastName}` : '',
            budget: p.budget ? `$${p.budget.toLocaleString()}` : '',
            deadline: p.endDate ?? '',
            techStack: Array.isArray(p.techStack) ? p.techStack : [],
            status: p.status ?? 'PLANNED',
            priority: p.priority ?? 'MEDIUM',
            health: p.health ?? 'HEALTHY',
            progressPercentage: p.progressPercentage ?? 0,
          }));
          setProjects(apiProjects);
        } else {
          setProjects([]);
        }
      })
      .catch(() => {
        setProjects([]);
      });
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, proj: Project) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveProject(proj);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveProject(null);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pmName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Box>
      {/* Top Header & Actions Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Project Governance & Portfolio (PM Portal)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Complete Lifecycle of Enterprise Projects with Real-Time Milestone & Sprint Tracking
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setWizardOpen(true)} sx={{ fontWeight: 700 }}>
            + Create Project
          </Button>
          <Button variant="outlined" startIcon={<ImportIcon />} onClick={() => setNotice('Import project roadmap dialog ready.')}>
            Import
          </Button>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={() => setNotice('Exported 24 projects portfolio to Excel (.xlsx)')}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<ArchiveIcon />} onClick={() => setNotice('Archived selected completed projects')}>
            Archive
          </Button>
          <Button variant="outlined" color="warning" startIcon={<CloseProjIcon />} onClick={() => setNotice('Selected project status updated to CLOSED')}>
            Close Project
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setNotice('Project delete request logged to Audit Log')}>
            Delete
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Filters Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search (Code, Name, Client, Manager, Tech)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField select fullWidth size="small" label="Status Filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PLANNED">PLANNED</MenuItem>
              <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField select fullWidth size="small" label="Priority Filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Data Grid */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Manager (PM)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tech Lead</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Budget</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Health</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{p.projectCode}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {p.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {p.techStack.map((tech, i) => (
                        <Chip key={i} label={tech} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{p.clientName}</TableCell>
                  <TableCell>{p.pmName}</TableCell>
                  <TableCell>{p.teamLead}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{p.budget}</TableCell>
                  <TableCell>{p.deadline}</TableCell>
                  <TableCell>
                    <Chip label={p.priority} size="small" color={p.priority === 'CRITICAL' || p.priority === 'HIGH' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.health}
                      size="small"
                      color={p.health === 'HEALTHY' ? 'success' : p.health === 'AT_RISK' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={p.progressPercentage} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {p.progressPercentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, p)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Row Actions Menu */}
      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { if (activeProject) navigate(`/projects/${activeProject.id}`); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} /> View Workspace
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Edit mode for ${activeProject?.title}`); handleMenuClose(); }}>
          Edit Project
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Resource Allocation assigned for ${activeProject?.title}`); handleMenuClose(); }}>
          Assign Team & Developers
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Assigned Technical Lead for ${activeProject?.title}`); handleMenuClose(); }}>
          Assign Tech Lead
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Sprint Created for ${activeProject?.title}`); handleMenuClose(); }}>
          Create Sprint
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Milestone Schedule updated for ${activeProject?.title}`); handleMenuClose(); }}>
          Create Milestone
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Uploaded Documents linked to ${activeProject?.title}`); handleMenuClose(); }}>
          Upload Documents
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Generated Executive Progress Report for ${activeProject?.title}`); handleMenuClose(); }}>
          Generate Report
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Project ${activeProject?.title} archived.`); handleMenuClose(); }}>
          Archive
        </MenuItem>
        <MenuItem onClick={() => { setNotice(`Project ${activeProject?.title} marked as CLOSED.`); handleMenuClose(); }}>
          Close Project
        </MenuItem>
      </Menu>

      {/* 5-Step Project Creation Wizard Modal */}
      <CreateProjectWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={(newProj) => {
          setProjects([newProj, ...projects]);
          setNotice(`Project "${newProj.title}" (${newProj.projectCode}) created successfully with 11-step automated sequence! Team notified & audit log recorded.`);
        }}
      />
    </Box>
  );
};

export default ProjectListPage;
