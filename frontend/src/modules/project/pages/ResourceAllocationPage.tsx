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
  LinearProgress,
  Stack,
  Alert,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  PersonAdd as AssignIcon,
  SwapHoriz as ReplaceIcon,
  PersonRemove as RemoveIcon,
  TransferWithinAStation as TransferIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface Allocation {
  id: number;
  empId: string;
  name: string;
  role: string;
  primarySkill: string;
  currentProjects: string;
  currentSprint: string;
  workload: number;
  availability: number;
  status: 'AVAILABLE' | 'BUSY' | 'BENCH' | 'ON_LEAVE';
}

export const ResourceAllocationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    api.get('/employees')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiAlloc: Allocation[] = res.data.data.map((e: any) => ({
            id: e.id,
            empId: e.employeeCode ?? `EMP-${e.id}`,
            name: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim(),
            role: e.designation ?? '',
            primarySkill: e.primarySkill ?? '',
            currentProjects: e.currentProjects ?? '',
            currentSprint: e.currentSprint ?? '',
            workload: e.workload ?? 0,
            availability: e.availability ?? 0,
            status: e.status ?? 'AVAILABLE',
          }));
          setAllocations(apiAlloc);
        } else {
          setAllocations([]);
        }
      })
      .catch(() => {
        setAllocations([]);
      });
  }, []);

  const filtered = allocations.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.primarySkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = skillFilter === 'ALL' || a.primarySkill.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Resource Allocation & Workload Governance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Smart Matching Engine based on Skills, Availability %, Leave Schedule & Active Project Assignments
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" startIcon={<AssignIcon />} onClick={() => setNotice('Select employee to assign to project workspace.')}>
            Assign Employee
          </Button>
          <Button variant="outlined" startIcon={<ReplaceIcon />} onClick={() => setNotice('Employee substitution dialog opened.')}>
            Replace Employee
          </Button>
          <Button variant="outlined" startIcon={<TransferIcon />} onClick={() => setNotice('Inter-department transfer requested.')}>
            Transfer Employee
          </Button>
          <Button variant="outlined" color="error" startIcon={<RemoveIcon />} onClick={() => setNotice('Removed employee from active project team.')}>
            Remove Employee
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Filter Toolbar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Employee, Primary Skill, Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth size="small" label="Primary Skill Filter" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
              <MenuItem value="ALL">All Tech Stacks</MenuItem>
              <MenuItem value="React">React / Frontend</MenuItem>
              <MenuItem value="Selenium">QA Automation</MenuItem>
              <MenuItem value="Kubernetes">DevOps / Cloud</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Primary Skill</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Projects</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Sprint</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Workload %</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Availability</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{a.name}</TableCell>
                  <TableCell>{a.role}</TableCell>
                  <TableCell>
                    <Chip label={a.primarySkill} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{a.currentProjects}</TableCell>
                  <TableCell>{a.currentSprint}</TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={a.workload}
                        color={a.workload > 80 ? 'error' : a.workload > 50 ? 'warning' : 'success'}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {a.workload}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: a.availability > 50 ? 'success.main' : 'warning.main' }}>
                    {a.availability}% Available
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={a.status}
                      size="small"
                      color={a.status === 'AVAILABLE' ? 'success' : a.status === 'BENCH' ? 'info' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ResourceAllocationPage;
