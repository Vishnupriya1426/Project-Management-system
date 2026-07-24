import React, { useState } from 'react';
import api from '../../../config/axios.config';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Alert,
} from '@mui/material';

interface AssignedProject {
  id: number;
  name: string;
  code: string;
  clientName: string;
  manager: string;
  techLead: string;
  sprint: string;
  deadline: string;
  progress: number;
  status: string;
  myRole: string;
}

export const MyProjectsPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
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
        name: p.title || p.name || 'Enterprise Application',
        code: p.projectCode || `PRJ-2026-0${p.id}`,
        clientName: p.clientName || p.client?.companyName || p.client?.name || 'SPEMS Enterprise HQ',
        manager: p.projectManager ? `${p.projectManager.firstName} ${p.projectManager.lastName}` : (p.managerName || 'Super Admin'),
        techLead: p.techLeadName || 'Tech Lead',
        sprint: p.activeSprint || 'Sprint 1 - Core Services',
        deadline: p.endDate || p.deadline || '2026-12-31',
        progress: p.progressPercentage || p.progress || 0,
        status: p.status || 'IN_PROGRESS',
        myRole: p.myRole || 'Project Developer / Engineer',
      }));
      setProjects(mapped);
    } catch (err) {
      console.error('Failed to load assigned projects:', err);
    }
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
                    <strong>Client Company:</strong> {p.clientName}
                  </Typography>
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

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Overall Progress</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={p.progress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyProjectsPage;
