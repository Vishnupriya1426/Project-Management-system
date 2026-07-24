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

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setMessage('Your password has been successfully reset! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
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
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter your new secure corporate password
            </Typography>
          </Box>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, height: 48, fontWeight: 700 }}
            >
              Update Password
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
