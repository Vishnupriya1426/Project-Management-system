import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCustomTheme } from '../../../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();

  const [firstName, setFirstName] = useState(user?.firstName || 'Super');
  const [lastName, setLastName] = useState(user?.lastName || 'Admin');
  const [email] = useState(user?.email || 'admin@spems.com');

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('Profile details updated successfully!');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          User Profile & Platform Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal details, password security, and theme preferences
        </Typography>
      </Box>

      {savedMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {savedMsg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Info Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Personal Information
            </Typography>
            <form onSubmit={handleSaveProfile}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Corporate Email (Immutable)"
                value={email}
                disabled
                margin="normal"
                size="small"
              />
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                Save Profile
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Theme & Security Preferences */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Appearance & Security Preferences
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />}
                label={`Dark Mode Theme (${mode === 'dark' ? 'Enabled' : 'Disabled'})`}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Change Password
            </Typography>
            <TextField fullWidth type="password" label="Current Password" margin="dense" size="small" />
            <TextField fullWidth type="password" label="New Password" margin="dense" size="small" />
            <Button variant="outlined" color="secondary" startIcon={<LockIcon />} sx={{ mt: 2 }}>
              Update Password
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
