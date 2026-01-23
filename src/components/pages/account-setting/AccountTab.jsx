import React, { useState } from 'react';
import { Grid, CardContent, Typography, Button, Stack, Alert } from '@mui/material';
import BlankCard from '../../shared/BlankCard';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { useAuth } from '../../../hooks/useAuth';

const AccountTab = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateUser(formData);
    if (result.success) {
      setMessage('Profile updated successfully!');
    } else {
      setError(result.error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/agent/change-password', passwordData);
      setMessage('Password changed successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Profile Update */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Update Profile
            </Typography>
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleProfileSubmit}>
              <CustomFormLabel htmlFor="name">Name</CustomFormLabel>
              <CustomTextField
                id="name"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                fullWidth
              />

              <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
              <CustomTextField
                id="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                fullWidth
              />

              <CustomFormLabel htmlFor="phone">Phone</CustomFormLabel>
              <CustomTextField
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                fullWidth
              />

              <CustomFormLabel htmlFor="address">Address</CustomFormLabel>
              <CustomTextField
                id="address"
                name="address"
                value={formData.address}
                onChange={handleProfileChange}
                fullWidth
              />

              <Stack direction="row" spacing={2} mt={3}>
                <Button variant="contained" color="primary" type="submit">
                  Save Changes
                </Button>
                <Button variant="outlined" color="error">
                  Cancel
                </Button>
              </Stack>
            </form>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* Change Password */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Change Password
            </Typography>
            <form onSubmit={handlePasswordSubmit}>
              <CustomFormLabel htmlFor="current_password">Current Password</CustomFormLabel>
              <CustomTextField
                id="current_password"
                name="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                fullWidth
              />

              <CustomFormLabel htmlFor="password">New Password</CustomFormLabel>
              <CustomTextField
                id="password"
                name="password"
                type="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                fullWidth
              />

              <CustomFormLabel htmlFor="password_confirmation">Confirm Password</CustomFormLabel>
              <CustomTextField
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                fullWidth
              />

              <Stack direction="row" spacing={2} mt={3}>
                <Button variant="contained" color="primary" type="submit">
                  Change Password
                </Button>
                <Button variant="outlined" color="error">
                  Cancel
                </Button>
              </Stack>
            </form>
          </CardContent>
        </BlankCard>
      </Grid>
    </Grid>
  );
};

export default AccountTab;
