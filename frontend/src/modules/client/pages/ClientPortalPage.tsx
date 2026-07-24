import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  CheckCircle as CompletedIcon,
  TrendingUp as ProgressIcon,
  ConfirmationNumber as TicketIcon,
  AddTask as RequestIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  VideoCall as VideoCallIcon,
  Person as LeadIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { RequestProjectModal } from '../components/RequestProjectModal';
import { RaiseSupportTicketModal } from '../components/RaiseSupportTicketModal';
import api from '../../../config/axios.config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  );
}

const INITIAL_CLIENT_PROJECTS: any[] = [];
const INITIAL_PROJECT_REQUESTS: any[] = [];
const INITIAL_MOUS_DOCUMENTS: any[] = [];
const INITIAL_SUPPORT_TICKETS: any[] = [];
const INITIAL_CLIENT_MEETINGS: any[] = [];

export const ClientPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const tabIndex = currentTab ? parseInt(currentTab, 10) : 0;

  const [projects, setProjects] = useState<any[]>(INITIAL_CLIENT_PROJECTS);
  const [requests, setRequests] = useState<any[]>(INITIAL_PROJECT_REQUESTS);
  const [documents, setDocuments] = useState<any[]>(INITIAL_MOUS_DOCUMENTS);
  const [tickets, setTickets] = useState<any[]>(INITIAL_SUPPORT_TICKETS);
  const [meetings, setMeetings] = useState<any[]>(INITIAL_CLIENT_MEETINGS);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [clientProfile, setClientProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const myClient = res.data.data.find((c: any) => c.email === user?.email || c.user?.email === user?.email);
          if (myClient) {
            setClientProfile(myClient);
          } else if (res.data.data.length > 0) {
            setClientProfile(res.data.data[0]);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  const clientOrgName = clientProfile?.companyName || (user as any)?.organization || (user as any)?.companyName || 'Corporate Client Partner';
  const contactPersonName = clientProfile?.contactPerson || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Primary Executive Contact';

  useEffect(() => {
    api.get('/projects')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const fetchedProjects = res.data.data.map((p: any) => ({
            id: p.id,
            code: p.projectCode || `PRJ-${p.id}`,
            name: p.title || p.name || '',
            organization: p.client?.companyName || clientOrgName,
            leadName: p.projectManager ? `${p.projectManager.firstName} ${p.projectManager.lastName}` : 'Unassigned',
            leadRole: 'Project Manager',
            leadEmail: p.projectManager?.email || '',
            leadPhone: p.projectManager?.phone || '',
            department: p.department?.name || 'Engineering',
            startDate: p.startDate || '',
            targetDeliveryDate: p.endDate || '',
            daysRemaining: 0,
            completionPercentage: p.progressPercentage || 0,
            health: p.health || 'ON_TRACK',
            activeStage: 0,
            stages: ['Requirements Analysis', 'Architecture Design', 'Core Development', 'UAT Testing', 'Production Release'],
            summary: p.description || '',
          }));
          setProjects(fetchedProjects);
        }
      })
      .catch(() => setProjects([]));

    api.get('/admin/project-requests')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setRequests(res.data.data);
        }
      })
      .catch(() => setRequests([]));

    api.get('/documents')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDocuments(res.data.data);
        }
      })
      .catch(() => setDocuments([]));

    api.get('/issues')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setTickets(res.data.data);
        }
      })
      .catch(() => setTickets([]));

    api.get('/meetings')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setMeetings(res.data.data);
        }
      })
      .catch(() => setMeetings([]));
  }, [clientOrgName]);

  // Derived Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.health !== 'COMPLETED').length;
  const completedProjects = projects.filter((p) => p.health === 'COMPLETED').length;
  const avgCompletionRate = totalProjects > 0 ? Math.round(
    projects.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) / totalProjects
  ) : 0;
  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'RESOLVED').length;

  const handleRequestSubmitted = (newReq: any) => {
    setRequests((prev) => [newReq, ...prev]);
    setNotice(`New Project Proposal "${newReq.title}" submitted successfully.`);
  };

  const handleTicketSubmitted = (newTicket: any) => {
    setTickets((prev) => [newTicket, ...prev]);
    setNotice(`Support Ticket "${newTicket.id}" raised and assigned to ${newTicket.assignedLead}.`);
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'ON_TRACK':
        return <Chip label="ON TRACK" color="success" size="small" sx={{ fontWeight: 800 }} />;
      case 'AT_RISK':
        return <Chip label="AT RISK" color="warning" size="small" sx={{ fontWeight: 800 }} />;
      case 'DELAYED':
        return <Chip label="DELAYED" color="error" size="small" sx={{ fontWeight: 800 }} />;
      case 'COMPLETED':
        return <Chip label="COMPLETED" color="info" size="small" sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label="ACTIVE" color="primary" size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Client Header Card */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0078D4 0%, #004578 100%)',
          color: '#fff',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <BusinessIcon sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {clientOrgName}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Corporate Client Enterprise Executive Portal • Welcome, <strong>{contactPersonName}</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RequestIcon />}
              onClick={() => setRequestModalOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              Request New Project
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3 }}>
          {notice}
        </Alert>
      )}

      {/* TAB 0: Executive Overview */}
      <CustomTabPanel value={tabIndex} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 50, height: 50 }}>
                  <ProjectIcon color="primary" />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700 }}>
                    TOTAL ASSIGNED PROJECTS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {totalProjects}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', width: 50, height: 50 }}>
                  <ProgressIcon color="warning" />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700 }}>
                    ACTIVE / IN-PROGRESS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {activeProjects}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', width: 50, height: 50 }}>
                  <CompletedIcon color="success" />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700 }}>
                    DELIVERED PROJECTS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {completedProjects}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.light', width: 50, height: 50 }}>
                  <TicketIcon color="error" />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700 }}>
                    OPEN SUPPORT TICKETS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {openTicketsCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Portfolio Progress Metric */}
        <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Overall Portfolio Delivery Rate: {avgCompletionRate}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={avgCompletionRate}
            sx={{ height: 12, borderRadius: 6, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#0078D4' } }}
          />
        </Paper>
      </CustomTabPanel>

      {/* TAB 1: Projects & Live Progress Tracker */}
      <CustomTabPanel value={tabIndex} index={1}>
        {projects.length > 0 ? (
          <Grid container spacing={3}>
            {projects.map((proj) => (
              <Grid item xs={12} key={proj.id}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid #0078D4' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {proj.name}
                        </Typography>
                        <Chip label={proj.code} variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                        {getHealthBadge(proj.health)}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {proj.summary}
                      </Typography>

                      {/* Stage Stepper */}
                      <Box sx={{ mt: 2 }}>
                        <Stepper activeStep={proj.activeStage} alternativeLabel>
                          {proj.stages.map((label: string) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LeadIcon color="primary" fontSize="small" /> SPEMS Project Lead
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {proj.leadName} ({proj.leadRole})
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <EmailIcon fontSize="inherit" /> {proj.leadEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="inherit" /> {proj.leadPhone}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Progress
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>
                            {proj.completionPercentage}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={proj.completionPercentage} sx={{ height: 8, borderRadius: 4 }} />
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 4, textCenter: 'center', borderRadius: 3, textAlign: 'center' }}>
            <ProjectIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No Active Contracts or Projects Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 500, mx: 'auto' }}>
              Welcome to your Corporate Client Portal! Your assigned projects and live progress updates will appear here once your proposal is accepted by our Super Admin & PMO team.
            </Typography>
            <Button variant="contained" startIcon={<RequestIcon />} onClick={() => setRequestModalOpen(true)}>
              Request New Project Proposal
            </Button>
          </Paper>
        )}
      </CustomTabPanel>

      {/* TAB 2: Project Requests Module */}
      <CustomTabPanel value={tabIndex} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Submitted Project Proposals & Scope Requests
          </Typography>
          <Button variant="contained" startIcon={<RequestIcon />} onClick={() => setRequestModalOpen(true)}>
            Submit New Proposal
          </Button>
        </Box>

        {requests.length > 0 ? (
          <Grid container spacing={2}>
            {requests.map((req) => (
              <Grid item xs={12} key={req.id}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {req.title} ({req.id})
                    </Typography>
                    <Chip
                      label={req.status}
                      color={req.status === 'ACCEPTED' || req.status === 'APPROVED' ? 'success' : req.status === 'IN_DISCUSSION' ? 'warning' : 'info'}
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                    {req.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target Budget: <strong>{req.budget}</strong> • Target Start: <strong>{req.startDate}</strong> • Submitted: <strong>{req.submittedDate}</strong>
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No Project Proposals Submitted
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Have an enterprise project or web application requirement? Click below to submit your RFP / project scope to our PMO team.
            </Typography>
            <Button variant="contained" startIcon={<RequestIcon />} onClick={() => setRequestModalOpen(true)}>
              Submit New Project Proposal
            </Button>
          </Paper>
        )}
      </CustomTabPanel>

      {/* TAB 3: MOUs & Document Vault */}
      <CustomTabPanel value={tabIndex} index={3}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Legal MOUs, Master Contracts & Deliverables
        </Typography>

        {documents.length > 0 ? (
          <Grid container spacing={2}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, borderTop: '4px solid #0078D4' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <DocumentIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, flexGrow: 1 }} noWrap>
                      {doc.title}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Category: {doc.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    Signed Date: {doc.signedDate} • Size: {doc.fileSize}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={doc.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                    <Box>
                      <Tooltip title="Preview Document">
                        <IconButton size="small" color="primary">
                          <PreviewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download File">
                        <IconButton size="small" color="primary">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <DocumentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              No Legal Contracts or MOUs Uploaded
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Master Services Agreements (MSA), Statements of Work (SOW), and architecture diagrams will be made available here upon project sign-off.
            </Typography>
          </Paper>
        )}
      </CustomTabPanel>

      {/* TAB 4: Support Tickets */}
      <CustomTabPanel value={tabIndex} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Support Tickets & Escalation Center
          </Typography>
          <Button variant="contained" color="error" startIcon={<TicketIcon />} onClick={() => setTicketModalOpen(true)}>
            Raise New Support Ticket
          </Button>
        </Box>

        {tickets.length > 0 ? (
          <Grid container spacing={2}>
            {tickets.map((tck) => (
              <Grid item xs={12} key={tck.id}>
                <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #d32f2f' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      [{tck.id}] {tck.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={tck.priority} color={tck.priority === 'High' ? 'error' : 'warning'} size="small" sx={{ fontWeight: 800 }} />
                      <Chip label={tck.status} color={tck.status === 'Resolved' ? 'success' : 'info'} size="small" sx={{ fontWeight: 800 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {tck.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Project: <strong>{tck.projectName}</strong> • Assigned Lead: <strong>{tck.assignedLead}</strong> • Created: <strong>{tck.createdDate}</strong>
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <TicketIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              No Active Support Tickets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Have questions, issues, or change requests for an active project? Raise a support ticket directly to your designated Project Manager.
            </Typography>
            <Button variant="contained" color="error" startIcon={<TicketIcon />} onClick={() => setTicketModalOpen(true)}>
              Raise New Support Ticket
            </Button>
          </Paper>
        )}
      </CustomTabPanel>

      {/* TAB 5: Meetings & Calendar */}
      <CustomTabPanel value={tabIndex} index={5}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Scheduled Client Meetings & Reviews
        </Typography>

        {meetings.length > 0 ? (
          <Grid container spacing={2}>
            {meetings.map((mtg) => (
              <Grid item xs={12} md={6} key={mtg.id}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
                    {mtg.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {mtg.agenda}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontWeight: 700 }}>
                    📅 Date: {mtg.date} | {mtg.time}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                    Organizer: {mtg.organizer}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<VideoCallIcon />}
                    component="a"
                    href={mtg.videoLink}
                    target="_blank"
                    sx={{ fontWeight: 700 }}
                  >
                    Join Meeting Call
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <VideoCallIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              No Scheduled Meetings Currently
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Project review calls, Sprint Demos, and Steering Committee meetings will be scheduled here with video conference links.
            </Typography>
          </Paper>
        )}
      </CustomTabPanel>

      {/* Modals */}
      <RequestProjectModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onRequestSubmitted={handleRequestSubmitted}
      />
      <RaiseSupportTicketModal
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        projects={projects}
        onTicketSubmitted={handleTicketSubmitted}
      />
    </Box>
  );
};

export default ClientPortalPage;
