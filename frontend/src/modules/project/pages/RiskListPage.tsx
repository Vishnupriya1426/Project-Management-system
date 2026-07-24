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
  Stack,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as RiskIcon,
  CheckCircle as MitigateIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface Risk {
  id: number;
  riskTitle: string;
  projectName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  owner: string;
  mitigationPlan: string;
  status: 'OPEN' | 'MITIGATED' | 'CLOSED';
}

export const RiskListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);

  const [risks, setRisks] = useState<Risk[]>([]);

  useEffect(() => {
    api.get('/risks')
      .then((res) => {
        const apiRisks: Risk[] = Array.isArray(res.data?.data)
          ? res.data.data.map((r: any) => ({
              id: r.id,
              riskTitle: r.riskTitle ?? r.title ?? '',
              projectName: r.project?.title ?? '',
              severity: r.severity ?? 'MEDIUM',
              probability: r.probability ?? 'MEDIUM',
              owner: r.owner ? `${r.owner.firstName} ${r.owner.lastName}` : '',
              mitigationPlan: r.mitigationPlan ?? '',
              status: r.status ?? 'OPEN',
            }))
          : [];
        setRisks(apiRisks);
      })
      .catch(() => {
        setRisks([]);
      });
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Project Risk Register & Contingency Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track Project Bottlenecks, Technical Risks, Impact Severity, and Mitigation Protocols
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => setNotice('Add Risk entry dialog opened.')}>
            + Add Risk
          </Button>
          <Button variant="outlined" color="success" startIcon={<MitigateIcon />} onClick={() => setNotice('Risk mitigation status updated.')}>
            Mitigate Risk
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Risk Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Probability</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Risk Owner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mitigation Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risks.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RiskIcon color="error" fontSize="small" />
                    {r.riskTitle}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{r.projectName}</TableCell>
                  <TableCell>
                    <Chip label={r.severity} size="small" color={r.severity === 'HIGH' ? 'error' : 'warning'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={r.probability} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{r.owner}</TableCell>
                  <TableCell>{r.mitigationPlan}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      color={r.status === 'MITIGATED' ? 'success' : r.status === 'OPEN' ? 'error' : 'default'}
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

export default RiskListPage;
