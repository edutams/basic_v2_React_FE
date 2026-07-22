import React, { useState, useEffect } from 'react';
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
import BlankCard from '@/components/shared/BlankCard';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

const AccountTab = () => {
  const { user, updateAgentProfile, changePassword } = useAuth();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    org_name: '',
    org_title: '',
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

  const hostname = window.location.hostname;
  const centralHost = import.meta.env.VITE_API_BASE_URL
    ? new URL(import.meta.env.VITE_API_BASE_URL).hostname
    : 'basic_v2_be.test';

  const isTenantSubdomain =
    hostname !== centralHost && hostname !== 'localhost' && hostname !== '127.0.0.1';

  // Prefill fields when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        id: user?.id,
        fname: user?.fname,
        lname: user?.lname,
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address,
        avatar: user?.avatar || '',
        // org_name: user?.org_name || '',
        // org_title: user?.org_title || '',
      });
    }
  }, [user]);

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

    payload.append('fname', formData.fname);
    payload.append('lname', formData.lname);
    payload.append('email', formData.email);
    payload.append('phone', formData.phone);
    payload.append('address', formData.address);
    // payload.append('org_name', formData.org_name);
    // payload.append('org_title', formData.org_title);

    if (imageFile) {
      payload.append('avatar', imageFile);
    }

    if (formData.reset_image) {
      payload.append('reset_image', true);
    }

    try {
      const result = await updateAgentProfile(payload, true);

      notify.success(result.message || 'Profile updated successfully!', 'Success');

      setImageFile(null);
      setFormData((prev) => ({ ...prev, reset_image: false }));
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

      notify.success(result.message);

      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to change password', 'Error');
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
                    src={imageFile ? URL.createObjectURL(imageFile) : user?.avatar}
                    alt={user?.name}
                    sx={{ width: 100, height: 100, margin: '0 auto' }}
                  />
                  {!isTenantSubdomain && (
                    <Stack direction="row" justifyContent="center" spacing={2} my={3}>
                      <Button variant="contained" size="small" color="primary" component="label">
                        Upload
                        <input
                          hidden
                          accept="image/*"
                          multiple
                          type="file"
                          onChange={handleImageChange}
                        />
                      </Button>
                      <Button variant="contained" size="small" color="error" onClick={handleResetImage}>
                        Reset
                      </Button>
                    </Stack>
                  )}
                  {!isTenantSubdomain && (
                    <Typography variant="subtitle1" color="textSecondary" mb={4}>
                      Allowed JPG, GIF or PNG. Max size of 800K
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box>
                <CustomFormLabel htmlFor="fname">First Name</CustomFormLabel>
                <CustomTextField
                  id="fname"
                  name="fname"
                  value={formData.fname}
                  onChange={handleProfileChange}
                  fullWidth
                  disabled={isTenantSubdomain}
                />

                <CustomFormLabel htmlFor="lname">Last Name</CustomFormLabel>
                <CustomTextField
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={handleProfileChange}
                  fullWidth
                  disabled={isTenantSubdomain}
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
                  disabled={!isTenantSubdomain}
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
                  disabled={!isTenantSubdomain}
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
                  disabled={isTenantSubdomain}
                />
              </Box>
              {isTenantSubdomain && (
                <Box>
                  <CustomFormLabel htmlFor="org_name">Organization Name</CustomFormLabel>
                  <CustomTextField
                    id="org_name"
                    name="org_name"
                    value={formData.org_name}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={isTenantSubdomain}
                  />
                </Box>
              )}
              {!isTenantSubdomain && (
                <Stack direction="row" spacing={2} mt={3}>
                  <Box>
                    <Button size="small" color="primary" type="submit" disabled={isProfileLoading} startIcon={isProfileLoading ? <CircularProgress color="inherit" /> : null
                    }
                    >
                      {isProfileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                  <Box>
                    <Button variant="contained" size="small" color="error" disabled={isProfileLoading}>
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              )}
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* Change Password */}
      {!isTenantSubdomain && (
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
                  <Button size="small" color="primary" type="submit" disabled={isPasswordLoading} startIcon={isPasswordLoading ? <CircularProgress color="inherit" /> : null
                  }
                  >
                    {isPasswordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button variant="contained" size="small" color="error" disabled={isPasswordLoading}>
                    Cancel
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </BlankCard>
        </Grid>
      )}
    </Grid>
  );
};

export default AccountTab;
