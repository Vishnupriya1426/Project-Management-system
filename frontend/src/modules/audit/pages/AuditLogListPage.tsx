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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import api from '../../../config/axios.config';

interface AuditItem {
  id: number;
  timestamp: string;
  userEmail: string;
  action: string;
  entityName: string;
  entityId: number;
  ipAddress: string;
  details: string;
}

export const AuditLogListPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);

  useEffect(() => {
    api.get('/audit-logs')
      .then((res) => {
        const apiLogs: AuditItem[] = Array.isArray(res.data?.data)
          ? res.data.data.map((l: any) => ({
              id: l.id,
              timestamp: l.timestamp ?? '',
              userEmail: l.userEmail ?? '',
              action: l.action ?? '',
              entityName: l.entityName ?? '',
              entityId: l.entityId ?? 0,
              ipAddress: l.ipAddress ?? '',
              details: l.details ?? '{}',
            }))
          : [];
        setLogs(apiLogs);
      })
      .catch(() => {
        setLogs([]);
      });
  }, []);

  const [selectedDetails, setSelectedDetails] = useState<string | null>(null);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          System Security & Audit Trails
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Immutable compliance record of all CREATE, UPDATE, DELETE, and LOGIN actions across SPEMS
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp (UTC)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity Target</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Payload Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.timestamp}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{log.userEmail}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={log.action.includes('CREATE') ? 'success' : log.action.includes('UPDATE') ? 'info' : 'secondary'}
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    {log.entityName} #{log.entityId}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{log.ipAddress}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View JSON Diff Payload">
                      <IconButton size="small" color="primary" onClick={() => setSelectedDetails(log.details)}>
                        <CodeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* JSON Payload Dialog */}
      <Dialog open={Boolean(selectedDetails)} onClose={() => setSelectedDetails(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Audit Event JSON Payload</DialogTitle>
        <DialogContent dividers>
          <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#00ff66', fontFamily: 'monospace', borderRadius: 1 }}>
            <pre style={{ margin: 0, overflowX: 'auto' }}>
              {selectedDetails ? JSON.stringify(JSON.parse(selectedDetails), null, 2) : ''}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogListPage;
