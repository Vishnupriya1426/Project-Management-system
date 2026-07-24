import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { ConfirmationNumber as TicketIcon } from '@mui/icons-material';

interface RaiseSupportTicketModalProps {
  open: boolean;
  onClose: () => void;
  projects: any[];
  onTicketSubmitted: (newTicket: any) => void;
}

export const RaiseSupportTicketModal: React.FC<RaiseSupportTicketModalProps> = ({
  open,
  onClose,
  projects,
  onTicketSubmitted,
}) => {
  const [ticketTitle, setTicketTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 1);
  const [priority, setPriority] = useState('High');
  const [issueType, setIssueType] = useState('Bug / Defect');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !description) return;

    const selectedProj = projects.find((p) => p.id === selectedProjectId) || projects[0];

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: ticketTitle,
      projectName: selectedProj ? selectedProj.name : 'Global Platform',
      priority,
      issueType,
      description,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      assignedLead: selectedProj ? selectedProj.leadName : 'Alex Murphy',
    };

    onTicketSubmitted(newTicket);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setTicketTitle('');
      setDescription('');
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
        <TicketIcon /> Raise Support Ticket / Issue Escalation
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Support Ticket created! Assigned Project Manager has been notified.
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ticket / Issue Summary *"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="e.g. UAT Login Timeout Error on Mobile Auth Service"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Related Project *"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              >
                {projects.map((proj) => (
                  <MenuItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Issue Category *"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <MenuItem value="Bug / Defect">Bug / Defect</MenuItem>
                <MenuItem value="Scope Change Request">Scope Change Request</MenuItem>
                <MenuItem value="Technical Query">Technical Query</MenuItem>
                <MenuItem value="Production Incident">Production Incident</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority Level *"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Detailed Description & Reproduction Steps *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, expected behavior, steps to reproduce..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Raise Ticket & Notify PM
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RaiseSupportTicketModal;
