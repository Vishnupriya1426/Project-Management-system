import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setSubmitted(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              Reset Your Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter your corporate email address to receive password reset instructions.
            </Typography>
          </Box>

          {submitted ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset link has been dispatched to <strong>{email}</strong> via Spring Mail SMTP.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Corporate Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={Boolean(emailError)}
                helperText={emailError}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2, height: 48, fontWeight: 600 }}>
                Send Recovery Email
              </Button>
            </form>
          )}

          <Button
            fullWidth
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{ textTransform: 'none' }}
          >
            Back to Sign In
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
