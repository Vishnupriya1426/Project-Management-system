import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axios.config';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Group as TeamIcon,
  Folder as DocIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

interface AssignedProject {
  id: number;
  name: string;
  code: string;
  manager: string;
  techLead: string;
  sprint: string;
  deadline: string;
  progress: number;
  status: string;
  myRole: string;
}

export const MyProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<AssignedProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [projects, setProjects] = useState<AssignedProject[]>([]);

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const data = res.data?.data || [];
      const mapped: AssignedProject[] = data.map((p: any) => ({
        id: p.id,
        name: p.title || 'Enterprise Application',
        code: p.projectCode || `PRJ-2026-0${p.id}`,
        manager: p.projectManager ? `${p.projectManager.firstName} ${p.projectManager.lastName}` : 'Super Admin',
        techLead: 'Tech Lead',
        sprint: 'Sprint 1 - Core Services',
        deadline: p.endDate || '2026-12-31',
        progress: p.progressPercentage || 10,
        status: p.status || 'IN_PROGRESS',
        myRole: 'Project Developer / Manager',
      }));
      setProjects(mapped);
    } catch (err) {
      console.error('Failed to load assigned projects:', err);
    }
  };

  const handleOpenProjectDetails = (proj: AssignedProject) => {
    setSelectedProject(proj);
    navigate(`/projects/${proj.id}`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          My Assigned Projects Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View assigned projects, team members, sprint progress, and technical specification documents.
        </Typography>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Permission Boundary Banner */}
      <Alert severity="warning" sx={{ mb: 3, fontWeight: 500 }}>
        <strong>Permission Notice:</strong> Employees can view project workspace, team members, documents & timelines, but <em>cannot</em> delete projects, modify budget, assign team members, or close projects (Manager access only).
      </Alert>

      {/* Projects Cards Grid */}
      <Grid container spacing={3}>
        {projects.map((p) => (
          <Grid item xs={12} md={6} key={p.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Chip label={p.code} size="small" color="primary" sx={{ fontWeight: 700, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {p.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      My Assigned Role: <strong>{p.myRole}</strong>
                    </Typography>
                  </Box>
                  <Chip label={p.status} size="small" color={p.status === 'IN_PROGRESS' ? 'success' : 'default'} />
                </Box>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Project Manager:</strong> {p.manager}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tech Lead:</strong> {p.techLead}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Active Sprint:</strong> {p.sprint}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Deadline:</strong> {p.deadline}
                  </Typography>
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Overall Progress</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={p.progress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" size="small" startIcon={<ViewIcon />} onClick={() => handleOpenProjectDetails(p)}>
                    Open Project
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<TeamIcon />} onClick={() => setNotice(`Viewing Team roster for ${p.name}`)}>
                    View Team
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<DocIcon />} onClick={() => setNotice(`Viewing Documents for ${p.name}`)}>
                    Documents
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<TimelineIcon />} onClick={() => setNotice(`Viewing Timeline for ${p.name}`)}>
                    Timeline
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Project Details Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedProject?.name} ({selectedProject?.code})
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Team Roster" />
            <Tab label="Tasks" />
            <Tab label="Meetings" />
            <Tab label="Documents" />
            <Tab label="Timeline" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Project Overview</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                High-performance microservices architecture migration with spring boot, react 19 frontend, and automated MySQL audit logging.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="body2"><strong>Manager:</strong> {selectedProject?.manager}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Tech Lead:</strong> {selectedProject?.techLead}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>My Role:</strong> {selectedProject?.myRole}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2"><strong>Deadline:</strong> {selectedProject?.deadline}</Typography></Grid>
              </Grid>
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Assigned Team Members</Typography>
              <Typography variant="body2">• John Doe (Tech Lead - Java)</Typography>
              <Typography variant="body2">• Sarah Connor (Senior Full Stack)</Typography>
              <Typography variant="body2">• Robert Vance (QA Lead)</Typography>
              <Typography variant="body2">• Kyle Reese (DevOps Architect)</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProjectsPage;
