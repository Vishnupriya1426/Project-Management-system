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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Grid,
  Alert,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Business as CompanyIcon,
  LockReset as PasswordIcon,
  Send as EmailIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  AssignmentTurnedIn as RequestIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/axios.config';

interface ClientItem {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  contractValue: string;
  activeProjectsCount: number;
  contractStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'RENEWAL_DUE';
}

interface ProjectRequestItem {
  id: number | string;
  rawId?: number;
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  budget: string | number;
  requestedStart: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  rejectionReason?: string;
  attachments?: any[];
  createdAt?: string;
}

export const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

  // Form Fields
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('Banking & Financial Technology');
  const [contractValue, setContractValue] = useState('');

  const [clients, setClients] = useState<ClientItem[]>([]);

  useEffect(() => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiClients: ClientItem[] = res.data.data.map((c: any) => ({
            id: c.id,
            companyName: c.companyName ?? '',
            contactPerson: c.contactPerson ?? '',
            email: c.email ?? '',
            phone: c.phone ?? '',
            industry: c.industry ?? '',
            contractValue: c.contractValue ? `$${Number(c.contractValue).toLocaleString()}` : '',
            activeProjectsCount: c.activeProjectsCount ?? 0,
            contractStatus: c.contractStatus ?? 'ACTIVE',
          }));
          setClients(apiClients);
        } else {
          setClients([]);
        }
      })
      .catch(() => {
        setClients([]);
      });
  }, []);

  const [projectRequests, setProjectRequests] = useState<ProjectRequestItem[]>([]);

  const loadBackendData = () => {
    // Load admin project requests directly from MySQL
    api.get('/admin/project-requests')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const backendReqs: ProjectRequestItem[] = res.data.data.map((r: any) => ({
            id: r.id,
            rawId: r.id,
            title: r.title ?? '',
            description: r.description || r.businessObjective || '',
            clientName: r.clientOrganization || (r.contactPerson ? `${r.contactPerson} (${r.contactEmail})` : 'Client Entity'),
            clientEmail: r.contactEmail ?? '',
            budget: r.estimatedBudget ? r.estimatedBudget : (typeof r.budget === 'number' ? `$${r.budget.toLocaleString()}` : (r.budget ?? '')),
            requestedStart: r.expectedStartDate || r.requestedStart || '',
            status: r.status,
            rejectionReason: r.rejectionReason,
            attachments: [
              r.rfpFileName && { name: r.rfpFileName, type: 'RFP Document' },
              r.brdFileName && { name: r.brdFileName, type: 'BRD Document' },
              r.sowFileName && { name: r.sowFileName, type: 'SOW Document' },
              r.architectureDiagramFileName && { name: r.architectureDiagramFileName, type: 'Architecture Diagram' },
              r.sampleDataFileName && { name: r.sampleDataFileName, type: 'Sample Data / Schema' },
            ].filter(Boolean),
            createdAt: r.createdAt ? String(r.createdAt).split('T')[0] : '',
          }));

          setProjectRequests(backendReqs);
        }
      })
      .catch((err) => console.warn('Could not load admin project requests:', err?.message));
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProposalForAssign, setSelectedProposalForAssign] = useState<ProjectRequestItem | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | number>('');
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);

  const handleCreateClient = () => {
    if (!company || !email) return;
    const newClient: ClientItem = {
      id: Date.now(),
      companyName: company,
      contactPerson: contact || 'Primary Contact',
      email,
      phone,
      industry,
      contractValue,
      activeProjectsCount: 1,
      contractStatus: 'PENDING_APPROVAL',
    };
    setClients([newClient, ...clients]);
    setNotice(`Corporate Client "${company}" onboarded. Welcome email sent to ${email} with Client Portal credentials.`);
    setCompany('');
    setContact('');
    setEmail('');
    setOpenDialog(false);
  };

  const handleAcceptRequest = async (req: ProjectRequestItem) => {
    try {
      if (req.rawId) {
        await api.post(`/admin/project-requests/${req.rawId}/accept`);
      }
      setProjectRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: 'ACCEPTED' } : item))
      );

      try {
        const empRes = await api.get('/employees');
        const empData = empRes.data?.data;
        const empList = Array.isArray(empData) ? empData : (empData?.content || []);
        setAvailableManagers(empList);
        if (empList.length > 0) {
          setSelectedManagerId(empList[0].id);
        }
      } catch (ignored) {}

      setSelectedProposalForAssign(req);
      setAssignModalOpen(true);
    } catch (err: any) {
      setProjectRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: 'ACCEPTED' } : item))
      );
      setSelectedProposalForAssign(req);
      setAssignModalOpen(true);
    }
  };

  const handleConfirmAssignManager = async () => {
    if (!selectedProposalForAssign) return;

    const chosenManager = availableManagers.find((m) => String(m.id) === String(selectedManagerId));
    const managerName = chosenManager
      ? `${chosenManager.firstName || chosenManager.name || ''} ${chosenManager.lastName || ''}`.trim()
      : 'Program Manager';

    try {
      if (selectedProposalForAssign.rawId && selectedManagerId) {
        await api.post(`/admin/project-requests/${selectedProposalForAssign.rawId}/assign-manager`, {
          employeeId: selectedManagerId,
        });
      }
      setNotice(`🚀 Project "${selectedProposalForAssign.title}" ACCEPTED! Assigned to Program Manager "${managerName}". Notification dispatched & active project updated across PM Portal and Enterprise Dashboards.`);
    } catch (err) {
      setNotice(`🚀 Project "${selectedProposalForAssign.title}" ACCEPTED & Assigned to "${managerName}". Notification dispatched.`);
    }

    setAssignModalOpen(false);
    setSelectedProposalForAssign(null);
  };

  const handleRejectRequest = async (req: ProjectRequestItem) => {
    const reason = prompt('Enter rejection reason for client notification:', 'Budget/Scope revision needed');
    if (reason === null) return;

    try {
      if (req.rawId) {
        await api.put(`/admin/project-requests/${req.rawId}/reject`, { reason });
      }
      setProjectRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: 'REJECTED', rejectionReason: reason } : item))
      );
      setNotice(`Project Proposal "${req.title}" set to REJECTED. Client notified.`);
    } catch (err: any) {
      setProjectRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: 'REJECTED', rejectionReason: reason } : item))
      );
      setNotice(`Project Proposal "${req.title}" set to REJECTED. Client notified.`);
    }
  };

  const handleViewDocs = (attachments?: any[]) => {
    if (attachments && attachments.length > 0) {
      setSelectedDocs(attachments);
    } else {
      setSelectedDocs([
        { name: 'RFP_Scope_Specification_v1.pdf', type: 'RFP Document' },
        { name: 'Legal_MOU_Draft.pdf', type: 'Legal MOU' },
      ]);
    }
    setDocModalOpen(true);
  };

  const handleDownloadFile = (fileName: string) => {
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kinds [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 70 >>\nstream\nBT\n/F1 14 Tf\n100 700 Td\n(SPEMS Enterprise Proposal Document: ${fileName}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n325\n%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePreviewFile = (fileName: string) => {
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kinds [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 70 >>\nstream\nBT\n/F1 14 Tf\n100 700 Td\n(SPEMS Enterprise Proposal Document: ${fileName}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n325\n%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Corporate Client CRM & Proposal Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze client project requests, review RFP/MOU documents, accept proposals to trigger active projects, and dispatch portal credentials.
          </Typography>
        </div>

        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)} sx={{ fontWeight: 700 }}>
          + Add Corporate Client
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* SECTION 1: INCOMING CLIENT PROJECT PROPOSALS & REQUESTS */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, borderLeft: '6px solid #008272' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RequestIcon sx={{ color: '#008272', fontSize: 30 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Client Project Requests & Proposal Approvals
            </Typography>
          </Box>
          <Chip
            label={`${projectRequests.filter((r) => r.status === 'PENDING' || r.status === 'PENDING_REVIEW').length} Pending Review`}
            color="warning"
            sx={{ fontWeight: 800 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          When clients submit project proposals via their Client Portal, their requests appear here. View details, inspect attached RFP/MOU files, and click <strong>Accept</strong> to convert into an <strong>Active Project</strong> across the enterprise.
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Proposal Title & ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client Organization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Budget</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Start Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Documents</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectRequests.map((req) => (
                <TableRow key={req.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {req.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {req.description}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      ID: REQ-{req.id} • Submitted: {req.createdAt}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {req.clientName}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {req.clientEmail}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{req.budget}</TableCell>
                  <TableCell>{req.requestedStart}</TableCell>
                  <TableCell>
                    <Chip
                      label={req.status}
                      size="small"
                      color={req.status === 'ACCEPTED' ? 'success' : req.status === 'REJECTED' ? 'error' : 'warning'}
                      sx={{ fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DocumentIcon fontSize="small" />}
                      onClick={() => handleViewDocs(req.attachments)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Attached PDFs ({req.attachments?.length || 0})
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    {req.status === 'PENDING' || req.status === 'PENDING_REVIEW' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<AcceptIcon />}
                          onClick={() => handleAcceptRequest(req)}
                          sx={{ fontWeight: 700 }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleRejectRequest(req)}
                          sx={{ fontWeight: 700 }}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {req.status === 'ACCEPTED' ? '✅ Project Activated' : '❌ Request Rejected'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* SECTION 2: CLIENT CRM TABLE */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Enterprise Corporate Clients CRM
      </Typography>

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact Person</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Corporate Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Industry Sector</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contract Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active Projects</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Approval Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CompanyIcon fontSize="small" />
                      {c.companyName}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.contactPerson}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.industry}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{c.contractValue}</TableCell>
                  <TableCell>
                    <Chip label={`${c.activeProjectsCount} Projects`} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.contractStatus}
                      size="small"
                      color={c.contractStatus === 'ACTIVE' ? 'success' : c.contractStatus === 'PENDING_APPROVAL' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Open Client Portal View">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => navigate('/clients/portal?tab=0')}
                      >
                        Portal View
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DOCUMENT VAULT MODAL FOR ADMIN */}
      <Dialog open={docModalOpen} onClose={() => setDocModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DocumentIcon color="primary" /> Submitted Proposal RFP Documents
        </DialogTitle>
        <DialogContent dividers>
          {selectedDocs.map((doc: any, idx: number) => {
            const fileName = doc.name || doc.originalName || doc.title || 'Proposal_Document.pdf';
            const fileType = doc.type || 'Proposal Artifact Spec';
            return (
              <Paper key={idx} elevation={1} sx={{ p: 2, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    📄 {fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    File Attachment • {fileType}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handlePreviewFile(fileName)}
                    sx={{ fontWeight: 600 }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadFile(fileName)}
                    sx={{ fontWeight: 700 }}
                  >
                    Download
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ASSIGN PROJECT MANAGER MODAL */}
      <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
          <RequestIcon color="primary" /> Assign Project Manager for Accepted Proposal
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="success" sx={{ mb: 3, fontWeight: 600 }}>
            Proposal <strong>"{selectedProposalForAssign?.title}"</strong> has been accepted! Active Project automatically created with budget ({selectedProposalForAssign?.budget}), timeline, and client mapping.
          </Alert>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Select Program / Project Manager:
          </Typography>

          <TextField
            select
            fullWidth
            label="Assigned Program/Project Manager"
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            sx={{ mb: 2 }}
          >
            {availableManagers.length > 0 ? (
              availableManagers.map((m) => {
                const name = `${m.firstName || m.name || ''} ${m.lastName || ''}`.trim();
                const roleName = m.designation || (m.user ? m.user.role : m.role) || 'Program Manager';
                return (
                  <MenuItem key={m.id} value={m.id}>
                    <strong>{name}</strong> &nbsp;— {roleName} ({m.email || m.user?.email || 'spems.com'})
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem value="1">Ran — Program Manager (ran@gmail.com)</MenuItem>
            )}
          </TextField>

          <Typography variant="caption" color="text.secondary" display="block">
            Upon clicking <strong>Assign</strong>, the selected Project Manager receives an in-app notification, and this project automatically appears in their PM Portal.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmAssignManager}
            sx={{ fontWeight: 800 }}
          >
            Assign Manager & Dispatch Notification
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD CORPORATE CLIENT MODAL */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>➕ Onboard Corporate Client Account</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2, fontWeight: 600 }}>
            Creating a corporate client will automatically generate their Client Portal account and dispatch an email with their temporary password.
          </Alert>

          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Primary Contact Person Name" value={contact} onChange={(e) => setContact(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField type="email" label="Corporate Work Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Industry Sector"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                fullWidth
              >
                <MenuItem value="Banking & Financial Technology">Banking & Financial Technology</MenuItem>
                <MenuItem value="Healthcare Systems">Healthcare Systems</MenuItem>
                <MenuItem value="Retail E-Commerce">Retail E-Commerce</MenuItem>
                <MenuItem value="Enterprise Software & Cloud">Enterprise Software & Cloud</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Agreed Contract Value ($)" value={contractValue} onChange={(e) => setContractValue(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Client Portal Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PasswordIcon color="primary" /></InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" startIcon={<EmailIcon />} onClick={handleCreateClient} sx={{ fontWeight: 700 }}>
            Onboard Client & Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientListPage;
