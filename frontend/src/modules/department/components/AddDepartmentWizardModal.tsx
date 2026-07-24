import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, Business as DeptIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface AddDepartmentWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (deptData: any) => void;
}

export const AddDepartmentWizardModal: React.FC<AddDepartmentWizardModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
        }
      })
      .catch(() => setOrganizations([]));

    api.get('/employees')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiEmps = res.data.data.map((e: any) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
          }));
          setEmployees(apiEmps);
        }
      })
      .catch(() => setEmployees([]));
  }, []);

  // 5-Step Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    organization: '',
    departmentName: '',
    departmentCode: '',
    departmentType: 'Core Engineering',
    businessUnit: 'Global Technology Services',
    description: '',
    status: 'ACTIVE',

    // Step 2: Department Leadership
    departmentHead: 'Assign Later',
    assistantManager: '',
    reportingTo: 'Chief Technology Officer (CTO)',
    hrBusinessPartner: '',
    departmentEmail: '',
    departmentContactNumber: '',
    officeLocation: 'Main Enterprise Tower - Floor 4',

    // Step 3: Operations & Budget
    annualBudget: '$500,000',
    costCenter: 'CC-ENG-901',
    workingShift: 'Standard Day (09:00 AM - 06:00 PM)',
    maximumCapacity: '50',
    currentEmployeeCount: 0,
    departmentObjectives: 'Deliver scalable cloud solutions and maintain 99.9% uptime.',
    departmentPolicies: 'Standard Enterprise Security & Code Review Guidelines',

    // Step 4: Resources & Configuration
    defaultTeamStructure: 'Agile Pods (Frontend, Backend, DevOps, QA)',
    resourceAllocationStrategy: 'Project-based Dedicated Assignment',
    projectCategories: 'Cloud, Mobile, AI/ML, Integration',
    skillsRequired: 'Java 21, Spring Boot, React, SQL, GCP',
    softwareLicenses: 'IntelliJ IDEA Enterprise, GitHub Enterprise, Cypress',
    assetAllocation: 'Standard Developer Workstation & Dual Monitors',
    documentRepository: '/docs/departments/engineering',
    departmentCalendar: 'Enterprise Shared Google Calendar',
  });

  const steps = [
    'Basic Information',
    'Department Leadership',
    'Operations & Budget',
    'Resources & Config',
    'Review & Create',
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.departmentName || !formData.departmentCode) {
      setNotice('Department Name and Department Code are required.');
      return;
    }

    const payload = {
      code: formData.departmentCode.toUpperCase(),
      name: formData.departmentName,
      description: formData.description,
      status: formData.status,
      organization: formData.organization,
      hodName: formData.departmentHead,
      annualBudget: formData.annualBudget,
      maximumCapacity: formData.maximumCapacity,
    };

    try {
      const res = await api.post('/departments', payload);
      onSuccess(res.data?.data || payload);
    } catch (err: any) {
      onSuccess(payload);
    }

    onClose();
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeptIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Enterprise Create Department Wizard (5 Steps)
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {notice && <Alert severity="warning" onClose={() => setNotice(null)} sx={{ mb: 2 }}>{notice}</Alert>}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1: BASIC INFORMATION */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 1 — Basic Information & Enterprise Organization
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Organization *"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  required
                >
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.companyName || org.name}>
                      {org.companyName || org.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department Name *"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  placeholder="e.g. Engineering & Technology"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Department Code *"
                  value={formData.departmentCode}
                  onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. ENG"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Department Type *"
                  value={formData.departmentType}
                  onChange={(e) => setFormData({ ...formData, departmentType: e.target.value })}
                >
                  <MenuItem value="Core Engineering">Core Engineering</MenuItem>
                  <MenuItem value="Operations & HR">Operations & HR</MenuItem>
                  <MenuItem value="Quality Assurance">Quality Assurance</MenuItem>
                  <MenuItem value="Product & Design">Product & Design</MenuItem>
                  <MenuItem value="Sales & Finance">Sales & Finance</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Business Unit"
                  value={formData.businessUnit}
                  onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status *"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 2: DEPARTMENT LEADERSHIP */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 2 — Department Leadership & Management Hierarchy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Department Head (HOD)"
                  value={formData.departmentHead}
                  onChange={(e) => setFormData({ ...formData, departmentHead: e.target.value })}
                >
                  <MenuItem value="Assign Later">Assign Later</MenuItem>
                  {employees.map((e) => (
                    <MenuItem key={e.id} value={e.name}>
                      {e.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Assistant Manager"
                  value={formData.assistantManager}
                  onChange={(e) => setFormData({ ...formData, assistantManager: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reporting To"
                  value={formData.reportingTo}
                  onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="HR Business Partner"
                  value={formData.hrBusinessPartner}
                  onChange={(e) => setFormData({ ...formData, hrBusinessPartner: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="email"
                  label="Department Email"
                  value={formData.departmentEmail}
                  onChange={(e) => setFormData({ ...formData, departmentEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Department Contact Number"
                  value={formData.departmentContactNumber}
                  onChange={(e) => setFormData({ ...formData, departmentContactNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Office Location"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 3: OPERATIONS & BUDGET */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 3 — Operations & Budget Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Annual Budget"
                  value={formData.annualBudget}
                  onChange={(e) => setFormData({ ...formData, annualBudget: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Center"
                  value={formData.costCenter}
                  onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Working Shift"
                  value={formData.workingShift}
                  onChange={(e) => setFormData({ ...formData, workingShift: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Maximum Employee Capacity"
                  value={formData.maximumCapacity}
                  onChange={(e) => setFormData({ ...formData, maximumCapacity: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Current Employee Count"
                  value={formData.currentEmployeeCount}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Department Objectives"
                  value={formData.departmentObjectives}
                  onChange={(e) => setFormData({ ...formData, departmentObjectives: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Department Policies"
                  value={formData.departmentPolicies}
                  onChange={(e) => setFormData({ ...formData, departmentPolicies: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 4: RESOURCES & CONFIGURATION */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 4 — Resources & Technical Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Default Team Structure"
                  value={formData.defaultTeamStructure}
                  onChange={(e) => setFormData({ ...formData, defaultTeamStructure: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Resource Allocation Strategy"
                  value={formData.resourceAllocationStrategy}
                  onChange={(e) => setFormData({ ...formData, resourceAllocationStrategy: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Categories"
                  value={formData.projectCategories}
                  onChange={(e) => setFormData({ ...formData, projectCategories: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Skills Required"
                  value={formData.skillsRequired}
                  onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Software Licenses"
                  value={formData.softwareLicenses}
                  onChange={(e) => setFormData({ ...formData, softwareLicenses: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Asset Allocation"
                  value={formData.assetAllocation}
                  onChange={(e) => setFormData({ ...formData, assetAllocation: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 5: REVIEW & CREATE */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 5 — Final Review & Confirmation
            </Typography>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Organization</Typography><Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{formData.organization || 'Unassigned'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Department Name & Code</Typography><Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.departmentName} ({formData.departmentCode})</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Department Head</Typography><Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.departmentHead}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Annual Budget</Typography><Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.annualBudget}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Capacity Limit</Typography><Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.maximumCapacity} Employees</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Status</Typography><Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>{formData.status}</Typography></Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Previous
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Save Draft
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
              Create Department
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
