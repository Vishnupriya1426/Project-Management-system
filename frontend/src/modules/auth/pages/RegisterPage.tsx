import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('SPEMS Enterprise HQ');
  const [role, setRole] = useState('ROLE_EMPLOYEE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!firstName || !firstName.trim()) {
      setError('First Name is required');
      return false;
    }
    if (!lastName || !lastName.trim()) {
      setError('Last Name is required');
      return false;
    }
    if (!email || !email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      // Dynamically Register User Profile & Dispatch Real Gmail OTP
      await registerUser({
        firstName,
        lastName,
        email,
        organization,
        role,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/otp-verification');
      }, 1000);
    } catch {
      setError('Failed to dispatch OTP. Proceeding to verification...');
      setTimeout(() => {
        navigate('/otp-verification');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
              SPEMS Enterprise Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create your real user profile for portal access
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile created for {firstName} {lastName}! Real 6-digit OTP code sent to {email}. Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Corporate / Personal Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Organization *"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                >
                  <MenuItem value="SPEMS Enterprise HQ">SPEMS Enterprise HQ</MenuItem>
                  <MenuItem value="Global Bank Corp">Global Bank Corp</MenuItem>
                  <MenuItem value="Healthcare Systems Inc">Healthcare Systems Inc</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Target Portal Persona *"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="ROLE_EMPLOYEE">Employee Portal</MenuItem>
                  <MenuItem value="ROLE_PROJECT_MANAGER">Project Manager Portal</MenuItem>
                  <MenuItem value="ROLE_ENG_MANAGER">Department Manager Portal</MenuItem>
                  <MenuItem value="ROLE_CLIENT">Corporate Client Portal</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password *"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48, fontWeight: 800 }}
            >
              {loading ? 'Sending OTP to Email...' : 'Create Account Profile & Proceed to OTP'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <strong style={{ cursor: 'pointer', color: '#0078D4' }} onClick={() => navigate('/login')}>
                Sign In
              </strong>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
