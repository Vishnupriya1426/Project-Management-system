import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  HelpOutline as SupportIcon,
  ContactSupport as ContactIcon,
  Book as DocIcon,
} from '@mui/icons-material';

export const HelpPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  const faqs = [
    {
      q: 'How do I request a role permission update or access elevation?',
      a: 'Submit a ticket to Super Admin or contact your HR Administrator. Roles can only be modified by Super Admin or Admin personas via the Security & Permissions module.',
    },
    {
      q: 'How does the 12-Step Employee Creation workflow function?',
      a: 'Super Admin or HR enters employee personal, contact, professional, technical, and system access details. The system auto-generates a temporary password, hashes it using BCrypt, persists the record, assigns roles/departments/teams, dispatches a welcome email, creates in-app notifications, and logs an audit record.',
    },
    {
      q: 'What should I do if I forget my temporary or active account password?',
      a: 'Click "Forgot Password" on the login screen (/forgot-password), enter your registered corporate email address, and follow the link or OTP code sent to reset your password.',
    },
    {
      q: 'Can an Employee directly close assigned tasks without approval?',
      a: 'No. When an employee marks a task complete, its status transitions to PENDING_REVIEW. The assigned Tech Lead or Project Manager receives an approval request to review the code/deliverables before closing.',
    },
  ];

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketMsg) return;
    setNotice(`Support ticket "${ticketSubject}" submitted to System IT Administrator. Ticket ID: TKT-2026-${Math.floor(100 + Math.random() * 900)}`);
    setTicketSubject('');
    setTicketMsg('');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Help Center & Technical Support Desk
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Documentation, system FAQs, enterprise user guides, and IT support ticket submission.
        </Typography>
      </Box>

      {notice && (
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* FAQs */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportIcon color="primary" /> Frequently Asked Questions (FAQs)
            </Typography>

            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' }, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: 'action.hover' }}>
                  <Typography variant="body2">{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Support Ticket Form */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContactIcon color="primary" /> Submit IT Support Ticket
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Ticket Subject"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Need VPN Access or Portal Role Update"
                required
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Detailed Description"
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Provide details about the issue or request..."
                required
              />
              <Button variant="contained" color="primary" startIcon={<DocIcon />} onClick={handleSubmitTicket} sx={{ fontWeight: 700, py: 1.2 }}>
                Submit Support Ticket
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HelpPage;
