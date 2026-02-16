import React, { useState } from 'react';
import {
  Grid,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Avatar,
  CircularProgress,
} from '@mui/material';
import BlankCard from '../../shared/BlankCard';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../hooks/useNotification';

const AccountTab = () => {
  const { user, updateAgentProfile, changePassword } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    image: user?.image || '',
    org_name: user?.org_name || '',
    org_title: user?.org_title || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const notify = useNotification();

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleResetImage = () => {
    setImageFile(null);
    setFormData((prev) => ({
      ...prev,
      reset_image: true,
    }));
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);

    const payload = new FormData();

    ['name', 'email', 'phone', 'address', 'org_name', 'org_title'].forEach((key) => {
      payload.append(key, formData[key]);
    });

    if (imageFile) {
      payload.append('image', imageFile);
    }

    if (formData.reset_image) {
      payload.append('reset_image', true);
    }
    try {
      const result = await updateAgentProfile(payload, true);
      if (result.success) {
        notify.success(result.message || 'Profile updated successfully!', 'Success');
        setImageFile(null);
      } else {
        notify.error(result.error || 'Update failed', 'Authentication Error');
      }
    } catch (err) {
      notify.error(err.response?.data?.error || 'Update failed', 'Authentication Error');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);

    try {
      const result = await changePassword(passwordData);
      if (result.success) {
        notify.success(result.message || 'Password changed successfully!', 'Success');
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      } else {
        notify.error(result.error || 'Failed to change password', 'Error');
      }
    } catch (err) {
      notify.error(err.response?.data?.error || 'Failed to change password', 'Error');
    } finally {
      setIsPasswordLoading(false);
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
            <Typography color="textSecondary" mb={3}>
              Change your profile picture from here
            </Typography>
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Box textAlign="center" display="flex" justifyContent="center">
                <Box>
                  <Avatar
                    src={imageFile ? URL.createObjectURL(imageFile) : user?.image}
                    alt={user?.name}
                    sx={{ width: 100, height: 100, margin: '0 auto' }}
                  />
                  <Stack direction="row" justifyContent="center" spacing={2} my={3}>
                    <Button variant="contained" color="primary" component="label">
                      Upload
                      <input
                        hidden
                        accept="image/*"
                        multiple
                        type="file"
                        onChange={handleImageChange}
                      />
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleResetImage}>
                      Reset
                    </Button>
                  </Stack>
                  <Typography variant="subtitle1" color="textSecondary" mb={4}>
                    Allowed JPG, GIF or PNG. Max size of 800K
                  </Typography>
                </Box>
              </Box>
              <Box>
                <CustomFormLabel htmlFor="name">Name</CustomFormLabel>
                <CustomTextField
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Box>
              <Box>
                <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
                <CustomTextField
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Box>
              <Box>
                <CustomFormLabel htmlFor="phone">Phone</CustomFormLabel>
                <CustomTextField
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Box>
              <Box>
                <CustomFormLabel htmlFor="address">Address</CustomFormLabel>
                <CustomTextField
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Box>
              <Box>
                <CustomFormLabel htmlFor="org_name">Organization Name</CustomFormLabel>
                <CustomTextField
                  id="org_name"
                  name="org_name"
                  value={formData.org_name}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Box>
              <Box>
                <CustomFormLabel htmlFor="org_title">Organization Title</CustomFormLabel>
                <CustomTextField
                  id="org_title"
                  name="org_title"
                  value={formData.org_title}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </Box>
              <Stack direction="row" spacing={2} mt={3}>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isProfileLoading}
                    startIcon={
                      isProfileLoading ? <CircularProgress size={20} color="inherit" /> : null
                    }
                  >
                    {isProfileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
                <Box>
                  <Button variant="outlined" color="error" disabled={isProfileLoading}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* Change Password */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Change Your Password
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
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isPasswordLoading}
                  startIcon={
                    isPasswordLoading ? <CircularProgress size={20} color="inherit" /> : null
                  }
                >
                  {isPasswordLoading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button variant="outlined" color="error" disabled={isPasswordLoading}>
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
