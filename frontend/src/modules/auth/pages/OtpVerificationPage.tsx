import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../../context/AuthContext';

export const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const pending = localStorage.getItem('pendingEmail');
    if (pending) {
      setTargetEmail(pending);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setNotice('Please enter a valid 6-digit OTP security code.');
      return;
    }

    const isValid = verifyOtp(targetEmail, otp);
    if (!isValid) {
      setNotice('Invalid 6-digit security code. Please check your email inbox.');
      return;
    }

    setSuccess(true);
    setNotice(null);

    // Save for Login Page Auto-Fill
    localStorage.setItem('loginEmailPrefill', targetEmail);

    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  const handleResend = async () => {
    if (!targetEmail) return;
    setNotice(`Dispatching a new 6-digit OTP security email to ${targetEmail}...`);
    await resendOtp(targetEmail);
    setNotice(`New 6-digit OTP code dispatched to ${targetEmail}. Check your inbox!`);
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
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
              Email OTP Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter the 6-digit security OTP code sent to <strong>{targetEmail || 'your email'}</strong>
            </Typography>
          </Box>

          {notice && <Alert severity="info" sx={{ mb: 2 }}>{notice}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Email Verified Successfully! Activating Profile & Redirecting to Sign In...</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="6-Digit Security OTP Code *"
              variant="outlined"
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              required
              inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.4rem', letterSpacing: 6, fontWeight: 700 } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, height: 48, fontWeight: 800 }}
            >
              Verify OTP & Activate Profile
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={handleResend}
            >
              Didn't receive code? <strong>Resend Email OTP</strong>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OtpVerificationPage;
