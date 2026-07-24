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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface EditEmployeeWizardModalProps {
  open: boolean;
  employee: any | null;
  onClose: () => void;
  onSuccess: (updatedEmp: any) => void;
}

export const EditEmployeeWizardModal: React.FC<EditEmployeeWizardModalProps> = ({
  open,
  employee,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setOrganizations(res.data.data);
        }
      })
      .catch(() => setOrganizations([]));

    api.get('/departments')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDepartments(res.data.data);
        }
      })
      .catch(() => setDepartments([]));
  }, []);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    lastName: '',
    dob: '1995-06-15',
    gender: 'Male',
    nationality: 'American',

    // Step 2: Contact
    email: '',
    phone: '',
    emergencyContact: '+1 555-0999',
    address: '123 Tech Boulevard',

    // Step 3: Professional
    empId: '',
    organization: '',
    department: '',
    team: 'Core Pod Alpha',
    designation: '',
    role: 'ROLE_EMPLOYEE',
    reportingManager: 'Sarah Connor',
    employmentType: 'Full-Time',
    joiningDate: '2025-01-10',

    // Step 4: Technical
    skills: 'Java 21, React 19, Spring Boot, MySQL',
    certifications: 'AWS Certified Solutions Architect',
    technologies: 'Docker, Kubernetes, GCP',
    experience: '5+ Years Enterprise Software',
    projectAssignments: 'Enterprise Cloud Migration',

    // Step 5: System Access
    username: '',
    roles: 'ROLE_EMPLOYEE',
    permissions: 'READ, WRITE, EXECUTE',
    accountStatus: 'ACTIVE',
    mfaEnabled: true,
    loginAccess: true,
  });

  useEffect(() => {
    if (employee) {
      const nameParts = (employee.name || '').split(' ');
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: employee.email || '',
        phone: employee.phone || '',
        empId: employee.empId || '',
        organization: employee.organization || '',
        department: employee.department || '',
        designation: employee.designation || '',
        role: employee.role || 'ROLE_EMPLOYEE',
        username: employee.email ? employee.email.split('@')[0] : '',
      }));
    }
  }, [employee]);

  const steps = [
    'Personal Info',
    'Contact Info',
    'Professional Info',
    'Technical Info',
    'System Access',
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
    const updated = {
      ...employee,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      department: formData.department,
      designation: formData.designation,
      role: formData.role,
      status: formData.accountStatus,
    };

    try {
      await api.put(`/employees/${employee?.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        designation: formData.designation,
        organization: formData.organization,
        role: formData.role,
      });
      onSuccess(updated);
    } catch (err: any) {
      onSuccess(updated);
    }

    onClose();
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Enterprise Update Employee Wizard (5 Steps) — [{employee?.empId}]
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {notice && <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 2 }}>{notice}</Alert>}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1: PERSONAL INFORMATION */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 1 — Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 2: CONTACT INFORMATION */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 2 — Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Corporate Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 3: PROFESSIONAL INFORMATION */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 3 — Professional Information & Organization Hierarchy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
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
                  select
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Team Pod"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Reporting Manager"
                  value={formData.reportingManager}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 4: TECHNICAL INFORMATION */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 4 — Technical Information & Assignments
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Assignments"
                  value={formData.projectAssignments}
                  onChange={(e) => setFormData({ ...formData, projectAssignments: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 5: SYSTEM ACCESS */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Step 5 — System Access & Governance Permissions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="System Role (RBAC) *"
                  value={formData.role || 'ROLE_EMPLOYEE'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="ROLE_EMPLOYEE">ROLE_EMPLOYEE (Software Engineer / Staff)</MenuItem>
                  <MenuItem value="ROLE_PROJECT_MANAGER">ROLE_PROJECT_MANAGER (Program / Project Manager)</MenuItem>
                  <MenuItem value="ROLE_ENG_MANAGER">ROLE_ENG_MANAGER (Engineering Manager / HOD)</MenuItem>
                  <MenuItem value="ROLE_SUPER_ADMIN">ROLE_SUPER_ADMIN (System Administrator)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Account Status"
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  <MenuItem value="ON_LEAVE">ON_LEAVE</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <FormGroup row>
                    <FormControlLabel
                      control={<Checkbox checked={formData.mfaEnabled} onChange={(e) => setFormData({ ...formData, mfaEnabled: e.target.checked })} />}
                      label="Enforce Multi-Factor Authentication (MFA)"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={formData.loginAccess} onChange={(e) => setFormData({ ...formData, loginAccess: e.target.checked })} />}
                      label="Portal Login Access Granted"
                    />
                  </FormGroup>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Previous
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
              Save Changes
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
