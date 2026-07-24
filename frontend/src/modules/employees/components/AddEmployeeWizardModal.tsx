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
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility,
  VisibilityOff,
  Autorenew as GenerateIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface AddEmployeeWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (empData: any) => void;
}

export const AddEmployeeWizardModal: React.FC<AddEmployeeWizardModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
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

  // Complete Form State matching all 5 Steps
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    lastName: '',
    dob: '1995-06-15',
    gender: 'Male',
    nationality: 'American',
    maritalStatus: 'Single',
    bloodGroup: 'O+',
    profilePhoto: '',

    // Step 2: Contact
    email: '',
    phone: '',
    emergencyContact: '',
    permanentAddress: '',
    currentAddress: '',

    // Step 3: Professional
    employeeId: 'EMP-2026-' + Math.floor(1000 + Math.random() * 9000),
    organization: '',
    department: '',
    designation: '',
    employmentType: 'Full-Time',
    joiningDate: new Date().toISOString().split('T')[0],
    reportingManager: '',
    team: '',

    // Step 4: Technical
    primarySkill: 'React / TypeScript',
    secondarySkills: 'Node.js, GraphQL, Docker',
    programmingLanguages: 'Java, TypeScript, Python, SQL',
    frameworks: 'Spring Boot, React, Next.js, Material UI',
    databases: 'MySQL 8, PostgreSQL, Redis',
    cloudPlatforms: 'Google Cloud Platform (GCP), AWS',
    certifications: 'AWS Solutions Architect, Oracle Java SE 17',
    github: 'https://github.com/employee',
    linkedin: 'https://linkedin.com/in/employee',

    // Step 5: System Access
    username: '',
    temporaryPassword: 'TempPass@2026!',
    role: 'ROLE_EMPLOYEE',
    portalAccess: {
      employeePortal: true,
      projectPortal: true,
      taskPortal: true,
      meetingPortal: true,
      reportPortal: false,
      adminPortal: false,
    },
    accountStatus: 'ACTIVE',
  });

  const steps = [
    'Personal Information',
    'Contact Information',
    'Professional Information',
    'Technical Information',
    'System Access',
  ];

  const handleNext = () => {
    if (activeStep === 0 && !formData.username) {
      const generatedUsername = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`;
      setFormData((prev) => ({ ...prev, username: generatedUsername }));
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = 'SPEMS@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, temporaryPassword: pass });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    const resolvedRole = (formData.designation?.toLowerCase().includes('project') || formData.designation?.toLowerCase().includes('program'))
      ? 'ROLE_PROJECT_MANAGER'
      : (formData.role || 'ROLE_EMPLOYEE');

    const payload = {
      firstName: formData.firstName || 'Employee',
      lastName: formData.lastName || 'Staff',
      email: formData.email || `${formData.username || 'emp' + Date.now()}@spems.com`,
      phone: formData.phone || '+1 555-0192',
      employeeCode: formData.employeeId || `EMP-2026-00${Date.now().toString().slice(-3)}`,
      designation: formData.designation || 'Software Engineer',
      role: resolvedRole,
      organization: formData.organization || 'SPEMS Enterprise HQ',
      temporaryPassword: formData.temporaryPassword || 'TempPass@2026!',
      primarySkill: formData.primarySkill || 'Java / Spring / React',
    };

    try {
      const res = await api.post('/employees', payload);
      onSuccess(res.data?.data || payload);
    } catch (err) {
      onSuccess(payload);
    }

    onClose();
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        ➕ Enterprise Add Employee Wizard (5 Steps)
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 1: Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth (DOB)"
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
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Marital Status"
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
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
                    p: 3,
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
                  <UploadIcon color="primary" sx={{ fontSize: 42, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0078D4' }}>
                    Click to Upload Profile Photo
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {photoFileName ? `Selected: ${photoFileName}` : 'Supports JPG, PNG, WEBP (Max 5MB)'}
                  </Typography>
                  <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 2: CONTACT INFORMATION */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 2: Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Corporate Email Address"
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
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact (Name & Number)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Jane Doe (+1 555-0999) - Spouse"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Permanent Address"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Current Address"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 3: PROFESSIONAL INFORMATION */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 3: Professional Information & Enterprise Organization
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Organization (Enterprise Company)"
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
                  label="Employee ID (System Assigned)"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Employment Type"
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                >
                  <MenuItem value="Full-Time">Full-Time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Intern">Intern</MenuItem>
                  <MenuItem value="Part-Time">Part-Time</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Joining Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Assigned Team"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 4: TECHNICAL INFORMATION */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 4: Technical Information & Skills
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Skill"
                  value={formData.primarySkill}
                  onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Secondary Skills"
                  value={formData.secondarySkills}
                  onChange={(e) => setFormData({ ...formData, secondarySkills: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Programming Languages"
                  value={formData.programmingLanguages}
                  onChange={(e) => setFormData({ ...formData, programmingLanguages: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frameworks & Libraries"
                  value={formData.frameworks}
                  onChange={(e) => setFormData({ ...formData, frameworks: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Databases"
                  value={formData.databases}
                  onChange={(e) => setFormData({ ...formData, databases: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cloud Platforms"
                  value={formData.cloudPlatforms}
                  onChange={(e) => setFormData({ ...formData, cloudPlatforms: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
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
                  label="GitHub Profile URL"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile URL"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 5: SYSTEM ACCESS */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Step 5: System Access & Account Credentials
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              Enterprise Workflow Ready: Unique email check, Employee ID generation, RBAC assignment, Audit Log record, and Welcome Email dispatch will run automatically.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Temporary Password"
                  value={formData.temporaryPassword}
                  onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleGeneratePassword} title="Generate Random Password">
                          <GenerateIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="System Role (RBAC)"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="ROLE_EMPLOYEE">ROLE_EMPLOYEE (Software Engineer)</MenuItem>
                  <MenuItem value="ROLE_PROJECT_MANAGER">ROLE_PROJECT_MANAGER</MenuItem>
                  <MenuItem value="ROLE_ENG_MANAGER">ROLE_ENG_MANAGER (Dept Manager)</MenuItem>
                  <MenuItem value="ROLE_HR_MANAGER">ROLE_HR_MANAGER</MenuItem>
                  <MenuItem value="ROLE_SUPER_ADMIN">ROLE_SUPER_ADMIN</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Initial Account Status"
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="PENDING_ACTIVATION">PENDING_ACTIVATION</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: 1 }}>
                  Portal Access Permissions
                </Typography>
                <FormGroup row>
                  <FormControlLabel control={<Checkbox checked={formData.portalAccess.employeePortal} disabled />} label="Employee Portal" />
                  <FormControlLabel control={<Checkbox checked={formData.portalAccess.projectPortal} />} label="Projects Portal" />
                  <FormControlLabel control={<Checkbox checked={formData.portalAccess.taskPortal} />} label="Tasks Kanban Portal" />
                  <FormControlLabel control={<Checkbox checked={formData.portalAccess.meetingPortal} />} label="Meetings Portal" />
                  <FormControlLabel control={<Checkbox checked={formData.portalAccess.reportPortal} />} label="Analytics Reports Portal" />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep < 4 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="success" size="large" onClick={handleSubmit} sx={{ fontWeight: 700 }}>
              Create Employee
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployeeWizardModal;
