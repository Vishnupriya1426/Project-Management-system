import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { VerifiedUser as VerifiedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();

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
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <VerifiedIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
            Email Verified Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your corporate email identity has been confirmed in the enterprise registry.
          </Typography>
          <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')}>
            Sign In to Portal
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
