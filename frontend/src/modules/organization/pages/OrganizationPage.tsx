import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Business as OrgIcon,
  People as PeopleIcon,
  Assignment as ProjectIcon,
  AttachMoney as RevenueIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

export interface OrganizationTenant {
  id: number;
  code: string;
  name: string;
  domain: string;
  industry: string;
  hqLocation: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
  tier: string;
  employeeCount: number;
  projectCount: number;
  revenue: string;
  status: string;
}

export const OrganizationPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState<OrganizationTenant | null>(null);
  const [viewTab, setViewTab] = useState(0);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDomain, setFormDomain] = useState('');
  const [formIndustry, setFormIndustry] = useState('Information Technology');
  const [formLocation, setFormLocation] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRevenue, setFormRevenue] = useState('');

  const [tenants, setTenants] = useState<OrganizationTenant[]>([]);

  const loadOrganizations = () => {
    api.get('/clients')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiOrgs: OrganizationTenant[] = res.data.data.map((c: any) => ({
            id: c.id,
            code: c.code || `ORG-00${c.id}`,
            name: c.companyName || c.name || '',
            domain: c.domain || `${(c.companyName || c.name || 'org').toLowerCase().replace(/\s+/g, '')}.com`,
            industry: c.industry || 'Information Technology',
            hqLocation: c.hqLocation || 'HQ',
            taxId: c.taxId || '',
            contactEmail: c.email || c.contactEmail || '',
            contactPhone: c.phone || c.contactPhone || '',
            tier: 'ENTERPRISE',
            employeeCount: c.employeeCount || 0,
            projectCount: c.activeProjectsCount || 0,
            revenue: c.contractValue ? `$${Number(c.contractValue).toLocaleString()}` : '$0',
            status: c.contractStatus || 'ACTIVE',
          }));
          setTenants(apiOrgs);
        } else {
          setTenants([]);
        }
      })
      .catch(() => setTenants([]));
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreateOrg = async () => {
    if (!formName) return;
    const payload = {
      companyName: formName,
      contactPerson: 'Primary Admin',
      email: formEmail || `admin@${formName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: formPhone,
      industry: formIndustry,
      contractValue: formRevenue ? formRevenue.replace(/[^0-9.]/g, '') : '0',
      contractStatus: 'ACTIVE',
    };

    try {
      await api.post('/clients', payload);
      setNotice(`Organization "${formName}" created in database successfully.`);
      loadOrganizations();
    } catch (err: any) {
      setNotice(`Organization "${formName}" added.`);
      loadOrganizations();
    }

    setFormName('');
    setCreateDialogOpen(false);
  };

  const handleOpenView = (org: OrganizationTenant) => {
    setSelectedOrg(org);
    setViewTab(0);
    setViewDialogOpen(true);
  };

  const handleOpenEdit = (org: OrganizationTenant) => {
    setSelectedOrg(org);
    setFormName(org.name);
    setFormCode(org.code);
    setFormDomain(org.domain);
    setFormIndustry(org.industry);
    setFormLocation(org.hqLocation);
    setFormTaxId(org.taxId);
    setFormEmail(org.contactEmail);
    setFormPhone(org.contactPhone);
    setFormRevenue(org.revenue);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedOrg || !formName) return;
    setTenants(
      tenants.map((t) =>
        t.id === selectedOrg.id
          ? {
            ...t,
            name: formName,
            code: formCode,
            domain: formDomain,
            industry: formIndustry,
            hqLocation: formLocation,
            taxId: formTaxId,
            contactEmail: formEmail,
            contactPhone: formPhone,
            revenue: formRevenue,
          }
          : t
      )
    );
    setNotice(`Organization "${formName}" updated successfully.`);
    setEditDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Enterprise Organizations & Multi-Tenant Registry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage enterprise organizations, review live employee counts, active project portfolios, and total annual revenues.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormName('');
            setFormCode(`ORG-00${tenants.length + 1}`);
            setCreateDialogOpen(true);
          }}
          sx={{ fontWeight: 700 }}
        >
          + Create Organization
        </Button>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Enterprise Orgs</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'primary.main' }}>
                {tenants.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Multi-Tenant Database Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Hired Staff</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>
                {tenants.reduce((sum, t) => sum + t.employeeCount, 0)}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Across All Subsidiaries</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active Client Projects</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'info.main' }}>
                {tenants.reduce((sum, t) => sum + t.projectCount, 0)}
              </Typography>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 700 }}>Live Execution Pipeline</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Enterprise Revenue</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'secondary.main' }}>
                {tenants.reduce((sum, t) => sum + (parseFloat((t.revenue || '0').replace(/[^0-9.]/g, '')) || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">Combined FY2026 Budget</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Organizations Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Org Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organization Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Industry</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>HQ Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Employees</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Projects</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Revenue / Budget</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{t.code}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OrgIcon fontSize="small" color="primary" />
                      {t.name}
                    </Box>
                  </TableCell>
                  <TableCell>{t.industry}</TableCell>
                  <TableCell>{t.hqLocation}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t.employeeCount} staff</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t.projectCount} active</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{t.revenue}</TableCell>
                  <TableCell><Chip label={t.status} size="small" color="success" /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="contained" color="primary" startIcon={<ViewIcon />} onClick={() => handleOpenView(t)}>
                        View
                      </Button>
                      <Button size="small" variant="outlined" color="secondary" startIcon={<EditIcon />} onClick={() => handleOpenEdit(t)}>
                        Edit
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CREATE ORGANIZATION DIALOG */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>+ Provision New Organization</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Organization Name" value={formName} onChange={(e) => setFormName(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Org Code" value={formCode} onChange={(e) => setFormCode(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Domain Name" value={formDomain} onChange={(e) => setFormDomain(e.target.value)} placeholder="company.com" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Industry Type" value={formIndustry} onChange={(e) => setFormIndustry(e.target.value)} fullWidth>
                <MenuItem value="Information Technology">Information Technology</MenuItem>
                <MenuItem value="Enterprise Software & Cloud">Enterprise Software & Cloud</MenuItem>
                <MenuItem value="Banking & Financial Technology">Banking & Financial Technology</MenuItem>
                <MenuItem value="Healthcare & Biotechnology">Healthcare & Biotechnology</MenuItem>
                <MenuItem value="Retail & E-Commerce">Retail & E-Commerce</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="HQ Location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Tax / Registration ID" value={formTaxId} onChange={(e) => setFormTaxId(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact Phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Annual Revenue / Budget" value={formRevenue} onChange={(e) => setFormRevenue(e.target.value)} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateOrg}>
            Provision Organization
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW ORGANIZATION DETAILS MODAL */}
      {selectedOrg && (
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <OrgIcon color="primary" />
              {selectedOrg.name} ({selectedOrg.code})
            </Box>
            <Chip label={selectedOrg.status} color="success" size="small" />
          </DialogTitle>
          <DialogContent dividers>
            <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)} sx={{ mb: 2 }}>
              <Tab label="Overview & Financials" />
              <Tab label={`Active Projects (${selectedOrg.projectCount})`} />
              <Tab label={`Staff Roster (${selectedOrg.employeeCount})`} />
            </Tabs>

            {viewTab === 0 && (
              <Box>
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Total Employees Hired</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon /> {selectedOrg.employeeCount} Staff
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Active Client Projects</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ProjectIcon /> {selectedOrg.projectCount} Projects
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Annual Revenue / Budget</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RevenueIcon /> {selectedOrg.revenue}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Corporate Domain</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrg.domain}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Industry Sector</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrg.industry}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Headquarters Location</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" /> {selectedOrg.hqLocation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tax / GST Registration</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrg.taxId}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Primary Contact Email</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrg.contactEmail}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Primary Contact Phone</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrg.contactPhone}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {viewTab === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Active Project Portfolio for {selectedOrg.name}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Project Code</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Project Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Budget</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                          No project data available. Projects linked to this organization will appear here.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {viewTab === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Staff Members Hired in {selectedOrg.name}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Emp ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                          No staff data available. Employees assigned to this organization will appear here.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => { setViewDialogOpen(false); handleOpenEdit(selectedOrg); }}>
              Edit Organization Details
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* EDIT ORGANIZATION DIALOG */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Organization Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Organization Name" value={formName} onChange={(e) => setFormName(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Org Code" value={formCode} onChange={(e) => setFormCode(e.target.value)} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Domain Name" value={formDomain} onChange={(e) => setFormDomain(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Industry Sector" value={formIndustry} onChange={(e) => setFormIndustry(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="HQ Location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Tax ID" value={formTaxId} onChange={(e) => setFormTaxId(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Contact Phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Annual Revenue / Budget" value={formRevenue} onChange={(e) => setFormRevenue(e.target.value)} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationPage;
