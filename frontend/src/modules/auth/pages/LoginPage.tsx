import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, getPortalLandingPath } = useAuth();
  const [email, setEmail] = useState('admin@spems.com');
  const [password, setPassword] = useState('Admin@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefill = localStorage.getItem('loginEmailPrefill');
    if (prefill) {
      setEmail(prefill);
      setPassword('');
      localStorage.removeItem('loginEmailPrefill');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login({ email, password });
      
      // Dynamic Role-Based Portal Routing
      const targetPath = getPortalLandingPath(loggedUser.role);
      navigate(targetPath);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
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
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
              SPEMS Enterprise
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Smart Employee & Project Management System
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Corporate / Registered Email *"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" size="small" />}
                label={<Typography variant="body2">Remember Me</Typography>}
              />
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48, fontWeight: 800 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Portal'}
            </Button>
          </form>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an enterprise account?{' '}
              <strong style={{ cursor: 'pointer', color: '#0078D4' }} onClick={() => navigate('/register')}>
                Register Account Profile
              </strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/welcome')}>
              ← Back to Corporate Website
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
