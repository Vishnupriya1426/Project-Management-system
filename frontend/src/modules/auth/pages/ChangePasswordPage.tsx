import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentPwdError, setCurrentPwdError] = useState('');
  const [newPwdError, setNewPwdError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPwdError('');
    setNewPwdError('');
    if (!currentPassword) { setCurrentPwdError('Current password is required'); return; }
    if (!newPassword) { setNewPwdError('New password is required'); return; }
    if (newPassword.length < 6) { setNewPwdError('Password must be at least 6 characters long'); return; }
    setSuccess(true);
    setTimeout(() => { navigate('/dashboard'); }, 1500);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Update your corporate account security credential
            </Typography>
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2 }}>Password updated! Returning to dashboard...</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setCurrentPwdError(''); }}
              error={Boolean(currentPwdError)}
              helperText={currentPwdError}
              required
            />
            <TextField
              fullWidth
              label="New Secure Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setNewPwdError(''); }}
              error={Boolean(newPwdError)}
              helperText={newPwdError}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, height: 48, fontWeight: 700 }}
            >
              Confirm Password Change
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;
