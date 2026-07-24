import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Stack,
  Chip,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  BarChart as AnalyticsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  VerifiedUser as AuthIcon,
  CloudDone as CloudIcon,
  Badge as ProfileIcon,
  AccessTime as AttendanceIcon,
  Assignment as ProjectIcon,
  TaskAlt as TaskIcon,
  NotificationsActive as NotificationIcon,
  ReceiptLong as AuditIcon,
  FormatQuote as QuoteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const whyChooseUs = [
    { title: 'Employee Management', desc: 'Centralized directory for 50,000+ employees with skill metrics.', icon: <ProfileIcon color="primary" fontSize="large" /> },
    { title: 'Project Tracking', desc: 'Jira-style progress %, milestone sign-offs, and resource capacity.', icon: <ProjectIcon color="secondary" fontSize="large" /> },
    { title: 'Task Automation', desc: 'Automated sprint workflows, priority triggers, and bottleneck alerts.', icon: <TaskIcon color="success" fontSize="large" /> },
    { title: 'Real Time Reports', desc: 'Instant Recharts visual analytics, PDF & Excel export pipelines.', icon: <AnalyticsIcon color="warning" fontSize="large" /> },
    { title: 'Instant Notifications', desc: 'Realtime in-app alerts, email updates, and escalation triggers.', icon: <NotificationIcon color="info" fontSize="large" /> },
    { title: 'Secure Authentication', desc: 'Stateless JWT, BCrypt hashing, and MFA OTP verification.', icon: <AuthIcon color="primary" fontSize="large" /> },
    { title: 'Cloud Ready', desc: 'Fully Dockerized microservices stack ready for GCP, AWS & Azure.', icon: <CloudIcon color="secondary" fontSize="large" /> },
    { title: 'Role Based Access', desc: '14-tier granular RBAC security protecting all endpoints and UI views.', icon: <SecurityIcon color="success" fontSize="large" /> },
  ];

  const features = [
    { name: 'Employee Profiles', desc: 'Rich employee profiles, hierarchy charts, and skill tags.', icon: <ProfileIcon color="primary" /> },
    { name: 'Attendance & Timesheets', desc: 'Automated clock-in tracking, timesheet logs, and leave requests.', icon: <AttendanceIcon color="primary" /> },
    { name: 'Projects Portfolio', desc: 'Multi-project roadmap view, budget tracking, and tech stack tags.', icon: <ProjectIcon color="primary" /> },
    { name: 'Task Kanban & Sprints', desc: 'Drag-and-drop task boards, velocity tracking, and backlog refinement.', icon: <TaskIcon color="primary" /> },
    { name: 'Executive Reports', desc: 'Customizable date/department filters with one-click report downloads.', icon: <AnalyticsIcon color="primary" /> },
    { name: 'Interactive Dashboards', desc: 'Role-adapted dashboards for Super Admin, Managers, Developers & Clients.', icon: <SpeedIcon color="primary" /> },
    { name: 'Smart Notifications', desc: 'Contextual notification center for task updates and meeting invites.', icon: <NotificationIcon color="primary" /> },
    { name: 'Immutable Audit Logs', desc: 'SOC2 compliant security audit trail logging every user transaction.', icon: <AuditIcon color="primary" /> },
  ];

  const statistics = [
    { number: '50,000+', label: 'Employees Managed' },
    { number: '2,300+', label: 'Projects Delivered' },
    { number: '35+', label: 'Countries Operating' },
    { number: '18,000+', label: 'Daily Active Users' },
  ];

  const clientLogos = [
    'Microsoft', 'Google', 'Amazon', 'Capgemini', 'Infosys', 'IBM', 'TCS', 'Oracle'
  ];

  const testimonials = [
    {
      quote: 'SPEMS transformed our enterprise project governance. Managing 40 engineering teams and 150+ active projects is now completely seamless.',
      author: 'David Richardson',
      title: 'VP of Engineering, Global Tech Solutions',
      company: 'Fortune 500 Enterprise',
    },
    {
      quote: 'The role-based security, instant reporting, and automated client portal simplified our client billing and milestone approvals by 40%.',
      author: 'Elena Rostova',
      title: 'Chief Operations Officer',
      company: 'Enterprise Services Corp',
    },
    {
      quote: 'Docker containerization and Spring Boot 3 architecture made deployment across our cloud infrastructure effortless.',
      author: 'Marcus Vance',
      title: 'Principal Cloud Architect',
      company: 'NextGen Systems',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar - Microsoft Style Navigation */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters justify-content="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/welcome')}>
              <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}>
                SPEMS Enterprise
              </Typography>
            </Box>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, mx: 'auto' }}>
              <Button color="inherit" onClick={() => navigate('/welcome')}>Home</Button>
              <Button color="inherit" onClick={() => setContactOpen(true)}>About</Button>
              <Button color="inherit" onClick={() => setDemoOpen(true)}>Services</Button>
              <Button color="inherit" onClick={() => setDemoOpen(true)}>Industries</Button>
              <Button color="inherit" onClick={() => setDemoOpen(true)}>Case Studies</Button>
              <Button color="inherit" onClick={() => setDemoOpen(true)}>Clients</Button>
              <Button color="inherit" onClick={() => setContactOpen(true)}>Careers</Button>
              <Button color="inherit" onClick={() => setContactOpen(true)}>Contact</Button>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="contained" color="primary" onClick={() => setDemoOpen(true)}>
                Request Demo
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* SECTION 1: HERO BANNER (Microsoft Style Aesthetic) */}
      <Box
        sx={{
          bgcolor: '#0078D4', // Microsoft Blue
          color: '#fff',
          py: { xs: 8, md: 12 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 50%, #003066 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Enterprise Platform 2026"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, mb: 2 }}
              />
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.4rem', md: '3.6rem' }, lineHeight: 1.15 }}>
                Enterprise Employee & Project Management System
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 4, fontWeight: 400, lineHeight: 1.5 }}>
                Manage Employees, Projects, Tasks, and Reports. One Platform. Secure. Fast. Scalable.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setDemoOpen(true)}
                  sx={{ bgcolor: '#fff', color: '#0078D4', fontWeight: 700, height: 50, px: 3, '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  Request Demo
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setContactOpen(true)}
                  sx={{ color: '#fff', borderColor: '#fff', fontWeight: 600, height: 50, px: 3, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Contact Sales
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/login')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 700, height: 50, px: 3 }}
                >
                  Login to Portal
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper elevation={8} sx={{ borderRadius: 3, p: 3, bgcolor: '#FFFFFF', color: '#201F1E' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0078D4' }}>
                  ⚡ Platform Architecture Highlights
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Spring Boot 3 + MySQL 8</Typography>
                    <Chip icon={<CheckIcon />} label="Production Ready" color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Docker Compose Orchestration</Typography>
                    <Chip icon={<CheckIcon />} label="3 Services" color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>14-Tier Granular RBAC</Typography>
                    <Chip icon={<CheckIcon />} label="Enforced" color="secondary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>TanStack Query Caching</Typography>
                    <Chip icon={<CheckIcon />} label="Active" color="info" size="small" />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 2: WHY CHOOSE US (8 CARDS) */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Why Choose SPEMS Enterprise?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Built for enterprise companies demanding security, scale, and high-performance project execution.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {whyChooseUs.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card elevation={2} sx={{ height: '100%', borderRadius: 2, p: 1, '&:hover': { elevation: 6, transform: 'translateY(-4px)', transition: 'all 0.2s' } }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{card.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.05rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* SECTION 3: FEATURES GRID WITH ICONS */}
      <Box sx={{ bgcolor: 'action.hover', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Core Features & Capabilities
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Everything your organization needs to manage human capital, agile projects, and client relationships.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feat, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    {feat.icon}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {feat.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feat.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* SECTION 4: PLATFORM STATISTICS (ANIMATED / HIGHLIGHTED METRICS) */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Enterprise Scale & Global Impact
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Proven track record supporting global workforce deployments.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {statistics.map((stat, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', borderTop: 4, borderColor: 'primary.main' }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stat.number}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* SECTION 5: TRUSTED CLIENTS */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="subtitle2" align="center" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, mb: 4 }}>
            Trusted by Fortune 500 Leaders & Global IT Enterprises
          </Typography>

          <Grid container spacing={3} justifyContent="center" alignItems="center">
            {clientLogos.map((logo, idx) => (
              <Grid item xs={6} sm={3} md={1.5} key={idx} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary', opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main', transition: 'all 0.2s' } }}>
                  {logo}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* SECTION 6: TESTIMONIALS CARDS */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            What Enterprise Leaders Say
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real feedback from executives managing enterprise software organizations.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((test, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card elevation={2} sx={{ height: '100%', borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <QuoteIcon color="primary" sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3 }}>
                    "{test.quote}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
                      {test.author[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {test.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {test.title}
                      </Typography>

                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* SECTION 7: ENTERPRISE FOOTER */}
      <Box sx={{ bgcolor: '#1B1A19', color: '#F3F2F1', py: 8, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0078D4', mb: 1 }}>
                SPEMS Enterprise
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Next-generation Smart Employee & Project Management Platform built for large IT companies, high-velocity development teams, and corporate governance.
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0078D4' }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => setContactOpen(true)}>About Us</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => setContactOpen(true)}>Careers</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => setDemoOpen(true)}>News & Press</Typography>
              </Stack>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0078D4' }}>
                Legal & Security
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Privacy Policy</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Terms of Service</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Security Audit</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0078D4' }}>
                Contact Enterprise Sales
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                📧 sales@spems-enterprise.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                📞 +1 (800) 555-SPEMS
              </Typography>
              <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                Sign In to Corporate Portal
              </Button>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              © 2026 Enterprise SPEMS Platform Inc. All rights reserved. • Built with React 19, Material UI, Spring Boot 3, and MySQL 8.
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* Demo Modal */}
      <Dialog open={demoOpen} onClose={() => setDemoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Enterprise Demo</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Full Name" required fullWidth />
            <TextField label="Corporate Email" required fullWidth />
            <TextField label="Company Name" required fullWidth />
            <TextField label="Employee Headcount" placeholder="e.g. 400+ Employees" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDemoOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { alert('Demo request submitted successfully!'); setDemoOpen(false); }}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Sales Modal */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Contact Enterprise Sales</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Your Name" required fullWidth />
            <TextField label="Business Email" required fullWidth />
            <TextField label="Message / Inquiry" multiline rows={4} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setContactOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => { alert('Inquiry sent! Sales representative will contact you shortly.'); setContactOpen(false); }}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPage;
