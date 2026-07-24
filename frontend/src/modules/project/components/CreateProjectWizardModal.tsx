import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  GroupAdd as AssignIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface CreateProjectWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (projectData: any) => void;
}

export const CreateProjectWizardModal: React.FC<CreateProjectWizardModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [resourceSearch, setResourceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmpIds, setSelectedEmpIds] = useState<number[]>([]);
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setClients(res.data.data);
        }
      })
      .catch(() => setClients([]));

    api.get('/employees')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiEmps = res.data.data.map((e: any) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            department: e.department?.name || 'Engineering',
            primarySkill: e.designation || 'Software Engineer',
            currentProjects: 0,
            taskCount: 0,
            availability: 100,
            status: 'Available',
            workload: 0,
            manager: 'PMO',
          }));
          setEmployees(apiEmps);
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  // 5-Step Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    projectName: '',
    projectCode: 'PRJ-2026-' + Math.floor(100 + Math.random() * 900),
    client: '',
    industry: 'FinTech & Banking',
    description: '',
    projectType: 'Fixed Price',
    techStack: ['Java 21', 'Spring Boot 3', 'React 19', 'MySQL 8', 'Docker'],
    priority: 'HIGH',
    estimatedBudget: '250000',
    currency: 'USD ($)',

    // Step 2: Timeline
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: '',
    deliveryDate: '',
    sprintDuration: '2 Weeks',
    estimatedHours: '1600',
    milestones: 'Sprint 0 Setup, Architecture MVP, Beta Release, Security Audit, Production Launch',

    // Step 3: Management
    projectManager: '',
    technicalLead: '',
    businessAnalyst: '',
    qaLead: '',
    devopsEngineer: '',
  });

  const wizardSteps = [
    'Basic Information',
    'Timeline & Milestones',
    'Management Team',
    'Resource Allocation',
    'Documents & Finalize',
  ];

  const handleNext = () => {
    if (activeStep < wizardSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleToggleSelectEmp = (id: number) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds(selectedEmpIds.filter((empId) => empId !== id));
    } else {
      setSelectedEmpIds([...selectedEmpIds, id]);
    }
  };

  const handleCreateProjectSubmit = () => {
    const newProject = {
      id: Date.now(),
      projectCode: formData.projectCode || `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.projectName || 'New Enterprise Project',
      clientName: formData.client,
      pmName: formData.projectManager,
      techLead: formData.technicalLead,
      budget: `$${formData.estimatedBudget}`,
      techStack: formData.techStack,
      status: 'PLANNED',
      priority: formData.priority,
      progressPercentage: 0,
      assignedMembersCount: selectedEmpIds.length,
    };
    onSuccess(newProject);
    onClose();
    setActiveStep(0);
  };

  const filteredCandidates = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      emp.primarySkill.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(resourceSearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Project Creation & Management Wizard (5 Steps)
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {wizardSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1: BASIC INFORMATION */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 1: Basic Project Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Project Name *"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. NextGen Banking Portal Migration"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Project Code *"
                  value={formData.projectCode}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Client Name *"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.companyName || c.name}>
                      {c.companyName || c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Industry Domain"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <MenuItem value="FinTech & Banking">FinTech & Banking</MenuItem>
                  <MenuItem value="Healthcare & Life Sciences">Healthcare & Life Sciences</MenuItem>
                  <MenuItem value="E-Commerce & Retail">E-Commerce & Retail</MenuItem>
                  <MenuItem value="SaaS & Cloud Software">SaaS & Cloud Software</MenuItem>
                  <MenuItem value="Artificial Intelligence & ML">Artificial Intelligence & ML</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Project Scope & Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Project Type"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                >
                  <MenuItem value="Fixed Price">Fixed Price</MenuItem>
                  <MenuItem value="Time & Material">Time & Material</MenuItem>
                  <MenuItem value="Dedicated Team">Dedicated Team</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Priority Level"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="LOW">LOW</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                  <MenuItem value="HIGH">HIGH</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Estimated Budget ($)"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 2: TIMELINE & MILESTONES */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 2: Project Timeline & Initial Milestones
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Project Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expected End Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.expectedEndDate}
                  onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Final Delivery Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Sprint Cadence Duration"
                  value={formData.sprintDuration}
                  onChange={(e) => setFormData({ ...formData, sprintDuration: e.target.value })}
                >
                  <MenuItem value="1 Week">1 Week Sprints</MenuItem>
                  <MenuItem value="2 Weeks">2 Weeks Sprints (Recommended)</MenuItem>
                  <MenuItem value="3 Weeks">3 Weeks Sprints</MenuItem>
                  <MenuItem value="4 Weeks">4 Weeks Sprints</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Man-Hours"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Key Project Milestones (Comma Separated)"
                  value={formData.milestones}
                  onChange={(e) => setFormData({ ...formData, milestones: e.target.value })}
                  helperText="Default milestone schedule will be generated automatically upon creation."
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 3: MANAGEMENT TEAM */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 3: Assign Project Leadership & Management Roles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Project Manager (PM) *"
                  value={formData.projectManager}
                  onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                >
                  {employees.map((e) => (
                    <MenuItem key={e.id} value={e.name}>
                      {e.name} ({e.department})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Technical Lead (Tech Lead) *"
                  value={formData.technicalLead}
                  onChange={(e) => setFormData({ ...formData, technicalLead: e.target.value })}
                >
                  {employees.map((e) => (
                    <MenuItem key={e.id} value={e.name}>
                      {e.name} ({e.department})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Business Analyst (BA)"
                  value={formData.businessAnalyst}
                  onChange={(e) => setFormData({ ...formData, businessAnalyst: e.target.value })}
                >
                  <MenuItem value="Claire Redfield">Claire Redfield (Lead BA)</MenuItem>
                  <MenuItem value="Unassigned">Unassigned</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="QA Lead"
                  value={formData.qaLead}
                  onChange={(e) => setFormData({ ...formData, qaLead: e.target.value })}
                >
                  <MenuItem value="Robert Vance">Robert Vance (QA Lead)</MenuItem>
                  <MenuItem value="Unassigned">Unassigned</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="DevOps Lead"
                  value={formData.devopsEngineer}
                  onChange={(e) => setFormData({ ...formData, devopsEngineer: e.target.value })}
                >
                  <MenuItem value="Kyle Reese">Kyle Reese (Lead Site Reliability Engineer)</MenuItem>
                  <MenuItem value="Unassigned">Unassigned</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 4: RESOURCE ALLOCATION POPUP / GRID */}
        {activeStep === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 4: Resource Allocation & Team Selection ({selectedEmpIds.length} Selected)
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search candidates by skill (Java, React, Python, QA, DevOps)..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filter Availability"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Busy">Busy</MenuItem>
                  <MenuItem value="Bench">Bench</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TableContainer component={Box} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Select</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Primary Skill</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Workload %</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCandidates.map((emp) => {
                    const isSelected = selectedEmpIds.includes(emp.id);
                    return (
                      <TableRow key={emp.id} hover selected={isSelected} onClick={() => handleToggleSelectEmp(emp.id)} sx={{ cursor: 'pointer' }}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected} color="primary" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>
                          <Chip label={emp.primarySkill} size="small" variant="outlined" color="primary" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{emp.workload}%</TableCell>
                        <TableCell>
                          <Chip
                            label={emp.status}
                            size="small"
                            color={emp.status === 'Available' ? 'success' : emp.status === 'Bench' ? 'info' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* STEP 5: DOCUMENTS & FINALIZE */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 5: Upload Project Specifications & Documents
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Clicking <strong>"Create Project"</strong> will trigger the 11-step automated sequence: Validating fields ➔ Generating unique Project Code ({formData.projectCode}) ➔ Creating DB record ➔ Building default phases ➔ Assigning Team ({selectedEmpIds.length} members) ➔ Dispatching Email & In-App Notifications ➔ Writing Audit Log.
            </Alert>

            <Box
              component="label"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                border: '2px dashed #0078D4',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'rgba(0, 120, 212, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'rgba(0, 120, 212, 0.08)',
                  borderColor: '#005a9e',
                },
              }}
            >
              <UploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0078D4' }}>
                Click to Upload Requirement Document, Architecture, SRS, Contract or NDA
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {docFileName ? `Selected File: ${docFileName}` : 'Supports PDF, DOCX, XLSX, ZIP (Max 50MB)'}
              </Typography>
              <input
                type="file"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFileName(e.target.files[0].name);
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Stack direction="row" spacing={1.5}>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined">
              Back
            </Button>
          )}
          {activeStep < wizardSteps.length - 1 ? (
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          ) : (
            <Button onClick={handleCreateProjectSubmit} variant="contained" color="success" sx={{ fontWeight: 700, px: 3 }}>
              Create Project
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
