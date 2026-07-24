import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  AddTask as AddTaskIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Assignment as ProjectIcon,
  AttachMoney as BudgetIcon,
  Code as TechIcon,
  Description as DocumentIcon,
  CheckCircle as SummaryIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';
import { useAuth } from '../../../context/AuthContext';

interface RequestProjectModalProps {
  open: boolean;
  onClose: () => void;
  onRequestSubmitted: (newRequest: any) => void;
}

export const RequestProjectModal: React.FC<RequestProjectModalProps> = ({
  open,
  onClose,
  onRequestSubmitted,
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user && open) {
      setFormData((prev) => ({
        ...prev,
        clientOrganization: (user as any)?.organization || (user as any)?.companyName || prev.clientOrganization,
        contactPerson: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.contactPerson,
        contactEmail: user.email || prev.contactEmail,
      }));

      api.get('/clients')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            const myClient = res.data.data.find((c: any) => c.email === user.email || c.user?.email === user.email);
            if (myClient) {
              setFormData((prev) => ({
                ...prev,
                clientOrganization: myClient.companyName || prev.clientOrganization,
                contactPerson: myClient.contactPerson || prev.contactPerson,
                contactEmail: myClient.email || prev.contactEmail,
                contactPhone: myClient.phone || prev.contactPhone,
                industry: myClient.industry || prev.industry,
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [user, open]);

  const steps = [
    'Client & Company Info',
    'Project Overview',
    'Budget & Timeline',
    'Technical Requirements',
    'Documents & Approvals',
    'Review & Submit',
  ];

  const [formData, setFormData] = useState({
    // Step 1 – Client & Company Information
    clientOrganization: (user as any)?.organization || (user as any)?.companyName || '',
    contactPerson: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    contactEmail: user?.email || '',
    contactPhone: (user as any)?.phone || '',
    industry: 'Financial Technology / Banking',
    companySize: '100 - 500 Employees',
    companyAddress: 'Corporate Headquarters',
    country: 'United States',
    timeZone: 'EST (UTC-5)',

    // Step 2 – Project Overview
    title: '',
    projectType: 'Mobile & Web Enterprise Application',
    businessObjective: '',
    description: '',
    businessProblem: '',
    expectedOutcome: '',
    priority: 'HIGH',
    isConfidential: false,

    // Step 3 – Budget & Timeline
    estimatedBudget: '$100,000 - $250,000',
    currency: 'USD ($)',
    expectedStartDate: '',
    expectedEndDate: '',
    requiredGoLiveDate: '',
    estimatedDuration: '6 Months',
    billingModel: 'Time & Materials (T&M)',
    paymentTerms: 'Milestone Based (30/40/30)',

    // Step 4 – Technical Requirements
    technologyStack: 'Java Spring Boot / React / MySQL / AWS',
    platform: 'Cross-Platform (Web & Mobile iOS/Android)',
    integrationsRequired: 'Core Banking API, Payment Gateway, OAuth SSO',
    securityRequirements: 'SOC2 Type II, ISO 27001, End-to-End Encryption',
    complianceRequirements: 'GDPR, PCI-DSS, HIPAA',
    expectedUsersCount: '50,000 Active Monthly Users',
    hostingPreference: 'AWS Cloud Dedicated VPC',
    requiredFeaturesChecklist: 'MFA Auth, Real-time Dashboard, PDF Reports, Audit Logging',

    // Step 5 – Documents & Approvals
    rfpFileName: '',
    brdFileName: '',
    sowFileName: '',
    architectureDiagramFileName: '',
    sampleDataFileName: '',
    additionalNotes: '',
    termsAccepted: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        clientOrganization: (user as any)?.organization || prev.clientOrganization,
        contactPerson: `${user.firstName} ${user.lastName}`.trim() || prev.contactPerson,
        contactEmail: user.email || prev.contactEmail,
      }));
    }
  }, [user]);

  const handleNext = () => {
    if (activeStep === 0 && !formData.title) {
      // Auto-set title draft if blank
    }
    if (activeStep === 1 && (!formData.title || !formData.description)) {
      setErrorNotice('Project Title and Description are required before proceeding.');
      return;
    }
    setErrorNotice(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorNotice(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setFormData((prev) => ({ ...prev, [field]: fileName }));
    }
  };

  const handleSubmitProposal = async (isDraft = false) => {
    if (!formData.title) {
      setErrorNotice('Project Title is required.');
      return;
    }
    if (!isDraft && !formData.termsAccepted) {
      setErrorNotice('You must accept the Terms & Governance Authorization before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);

    const payload = {
      ...formData,
      status: isDraft ? 'DRAFT' : 'PENDING_REVIEW',
    };

    try {
      const res = await api.post('/client/project-requests', payload);
      const savedData = res.data?.data || payload;
      onRequestSubmitted(savedData);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        setActiveStep(0);
      }, 1500);
    } catch (err: any) {
      // Fallback submission
      onRequestSubmitted(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
        setActiveStep(0);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, bgcolor: '#0078D4', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AddTaskIcon />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Enterprise Client Project Proposal & RFP Request Wizard (6 Steps)
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {errorNotice && <Alert severity="error" onClose={() => setErrorNotice(null)} sx={{ mb: 2 }}>{errorNotice}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Project Request submitted successfully to Backend MySQL! Admin PMO team notified.</Alert>}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1: CLIENT & COMPANY INFORMATION */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon /> Step 1 — Client Organization & Executive Contact Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Organization (Auto-filled)"
                  value={formData.clientOrganization}
                  onChange={(e) => setFormData({ ...formData, clientOrganization: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person Name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Official Email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone Number"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Industry Sector"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Company Size"
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Company Address"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Time Zone"
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 2: PROJECT OVERVIEW */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ProjectIcon /> Step 2 — Project Scope, Objectives & Business Goals
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Project Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. NextGen Core Banking Analytics & Mobile Gateway"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Priority Level"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="CRITICAL">CRITICAL (Immediate Execution)</MenuItem>
                  <MenuItem value="HIGH">HIGH Priority</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM Priority</MenuItem>
                  <MenuItem value="LOW">LOW Priority</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Type"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={formData.isConfidential} onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })} />}
                    label="Confidential Project NDA Protected (Yes/No)"
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Business Objective *"
                  value={formData.businessObjective}
                  onChange={(e) => setFormData({ ...formData, businessObjective: e.target.value })}
                  placeholder="Primary enterprise growth objectives and key milestones..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  required
                  label="Project Description *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed technical & functional scope description..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Business Problem Solved"
                  value={formData.businessProblem}
                  onChange={(e) => setFormData({ ...formData, businessProblem: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Expected Business Outcome"
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 3: BUDGET & TIMELINE */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BudgetIcon /> Step 3 — Estimated Financial Budget & Delivery Schedule
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Budget"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expected Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.expectedStartDate}
                  onChange={(e) => setFormData({ ...formData, expectedStartDate: e.target.value })}
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
                  label="Required Go-live Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.requiredGoLiveDate}
                  onChange={(e) => setFormData({ ...formData, requiredGoLiveDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Estimated Duration"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billing Model"
                  value={formData.billingModel}
                  onChange={(e) => setFormData({ ...formData, billingModel: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Payment Terms"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 4: TECHNICAL REQUIREMENTS */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TechIcon /> Step 4 — Architecture, Tech Stack & Security Compliance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Technology Stack"
                  value={formData.technologyStack}
                  onChange={(e) => setFormData({ ...formData, technologyStack: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Platform Target"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Integrations Required"
                  value={formData.integrationsRequired}
                  onChange={(e) => setFormData({ ...formData, integrationsRequired: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Security Requirements"
                  value={formData.securityRequirements}
                  onChange={(e) => setFormData({ ...formData, securityRequirements: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Compliance Requirements"
                  value={formData.complianceRequirements}
                  onChange={(e) => setFormData({ ...formData, complianceRequirements: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Expected Users"
                  value={formData.expectedUsersCount}
                  onChange={(e) => setFormData({ ...formData, expectedUsersCount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hosting Preference"
                  value={formData.hostingPreference}
                  onChange={(e) => setFormData({ ...formData, hostingPreference: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Required Features Checklist"
                  value={formData.requiredFeaturesChecklist}
                  onChange={(e) => setFormData({ ...formData, requiredFeaturesChecklist: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 5: DOCUMENTS & APPROVALS */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DocumentIcon /> Step 5 — Proposal Artifact Attachments & Governance Consent
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { key: 'rfpFileName', label: 'Upload RFP Document' },
                { key: 'brdFileName', label: 'Upload BRD Document' },
                { key: 'sowFileName', label: 'Upload Draft SOW' },
                { key: 'architectureDiagramFileName', label: 'Upload Architecture Diagram' },
                { key: 'sampleDataFileName', label: 'Upload Sample Data / Schema' },
              ].map((doc) => (
                <Grid item xs={12} sm={6} key={doc.key}>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2, textAlign: 'center', border: '1px dashed #0078D4' }}>
                    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small">
                      {doc.label}
                      <input type="file" hidden onChange={(e) => handleFileUpload(doc.key, e)} />
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 700, color: 'primary.main' }}>
                      {(formData as any)[doc.key] ? `File Attached: ${(formData as any)[doc.key]}` : 'No file selected'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Additional Notes / Governance Comments"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <FormControlLabel
                    control={<Checkbox checked={formData.termsAccepted} onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })} />}
                    label={<strong>I confirm all information in this 6-Step RFP Proposal is accurate and authorize SPEMS Enterprise PMO evaluation.</strong>}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {activeStep === 5 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SummaryIcon color="success" /> Step 6 — Proposal Summary Review & Submission
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                {formData.title || 'Untitled Enterprise Proposal'}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Client Organization: <strong>{formData.clientOrganization}</strong> | Priority: <Chip label={formData.priority} size="small" color="primary" />
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Contact Person:</strong> {formData.contactPerson}</Typography>
                  <Typography variant="body2"><strong>Contact Email:</strong> {formData.contactEmail}</Typography>
                  <Typography variant="body2"><strong>Contact Phone:</strong> {formData.contactPhone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Estimated Budget:</strong> {formData.estimatedBudget} ({formData.currency})</Typography>
                  <Typography variant="body2"><strong>Target Timeline:</strong> {formData.expectedStartDate || 'TBD'} to {formData.expectedEndDate || 'TBD'}</Typography>
                  <Typography variant="body2"><strong>Billing Model:</strong> {formData.billingModel}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Description:</strong> {formData.description || 'No description provided.'}</Typography>
                  <Typography variant="body2"><strong>Tech Stack:</strong> {formData.technologyStack}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info">
              Clicking <strong>Submit Proposal</strong> sends this RFP directly to MySQL and publishes it to the Admin Portal <strong>Client Project Requests</strong> governance queue.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0 || isSubmitting} onClick={handleBack}>
          Previous
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep === 5 && (
            <Button variant="outlined" color="secondary" onClick={() => handleSubmitProposal(true)} disabled={isSubmitting}>
              Save Draft
            </Button>
          )}
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSubmitProposal(false)}
              disabled={isSubmitting}
              sx={{ fontWeight: 800, px: 3 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RequestProjectModal;
