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
  IconButton,
  InputAdornment,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import {
  IconUser,
  IconLock,
  IconUpload,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconKey,
  IconShieldLock,
} from '@tabler/icons-react';
import BlankCard from '@/components/shared/BlankCard';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { useNotification } from '@/hooks/useNotification';

const AccountTab = () => {
  const { user, updateUser, changePassword } = useTenantAuth();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const notify = useNotification();

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savedAvatarUrl, setSavedAvatarUrl] = useState('');
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
        fname: user?.fname || '',
        lname: user?.lname || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        avatar: user?.avatar || '',
      });
      if (user?.avatar) {
        setSavedAvatarUrl(user.avatar);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };


  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!imageFile) return;

    setIsProfileLoading(true);
    const payload = new FormData();
    payload.append('avatar', imageFile);

    try {
      const result = await updateUser(payload, true);
      notify.success(result.message || 'Profile photo updated successfully!', 'Success');

      const newAvatar = result.user?.avatar || result.data?.avatar || user?.avatar;
      if (newAvatar) {
        setSavedAvatarUrl(newAvatar);
      }
      setImageFile(null);
      setFormData((prev) => ({
        ...prev,
        avatar: newAvatar,
        reset_image: false,
      }));
    } catch (err) {
      notify.error(err.response?.data?.error || 'Failed to update profile photo', 'Error');
    } finally {
      setIsProfileLoading(false);
    }
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

    if (imageFile) {
      payload.append('avatar', imageFile);
    }

    if (formData.reset_image) {
      payload.append('reset_image', true);
    }

    try {
      const result = await updateUser(payload, true);

      notify.success(result.message || 'Profile updated successfully!', 'Success');

      const newAvatar = result.user?.avatar || result.data?.avatar || user?.avatar;
      if (newAvatar) {
        setSavedAvatarUrl(newAvatar);
      }
      setImageFile(null);
      setFormData((prev) => ({
        ...prev,
        avatar: newAvatar,
        reset_image: false,
      }));
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
      notify.success(result.message || 'Password changed successfully!');

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
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconUser size={24} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Personal Information
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Update your profile picture and personal details
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleProfileSubmit}>
              {/* Profile Avatar Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  // mb: 3,
                  borderRadius: '14px',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
                  <Avatar
                    key={imageFile ? 'preview' : (savedAvatarUrl || formData.avatar || user?.avatar)}
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : (savedAvatarUrl || formData.avatar || user?.avatar)
                          ? `${savedAvatarUrl || formData.avatar || user?.avatar}?t=${Date.now()}`
                          : ''
                    }
                    alt={user?.name}
                    sx={{
                      width: 90,
                      height: 90,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      border: '3px solid #ffffff',
                    }}
                  />
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                      Profile Photo
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                      Allowed formats: JPG, PNG or GIF. Max size of 800KB.
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1.5}
                      justifyContent={{ xs: 'center', sm: 'flex-start' }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        component="label"
                        startIcon={<IconUpload size={16} />}
                        sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
                      >
                        Upload Photo
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleImageChange}
                        />
                      </Button>

                      {imageFile && (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          type="button"
                          onClick={handleAvatarSubmit}
                          disabled={isProfileLoading}
                          startIcon={
                            isProfileLoading ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              <IconCheck size={16} />
                            )
                          }
                          sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
                        >
                          {isProfileLoading ? 'Saving...' : 'Save Photo'}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="fname">First Name</CustomFormLabel>
                  <CustomTextField
                    id="fname"
                    name="fname"
                    value={formData.fname}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!isTenantSubdomain}
                    placeholder="Enter first name"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="lname">Last Name</CustomFormLabel>
                  <CustomTextField
                    id="lname"
                    name="lname"
                    value={formData.lname}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!isTenantSubdomain}
                    placeholder="Enter last name"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
                  <CustomTextField
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    fullWidth
                    placeholder="name@example.com"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="phone">Phone Number</CustomFormLabel>
                  <CustomTextField
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    fullWidth
                    placeholder="+234..."
                  />
                </Grid>
              </Grid>

              <Box>
                <CustomFormLabel htmlFor="address">Address</CustomFormLabel>
                <CustomTextField
                  id="address"
                  name="address"
                  value={formData.address === null ? '' : formData.address}
                  onChange={handleProfileChange}
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={2}
                  disabled={!isTenantSubdomain}
                  placeholder="Enter your street address"
                />
              </Box>

              <Stack direction="row" spacing={2} mt={3.5} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={isProfileLoading}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
                  onClick={() => {
                    if (user) {
                      setFormData({
                        id: user?.id,
                        fname: user?.fname || '',
                        lname: user?.lname || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        avatar: user?.avatar || '',
                      });
                      setImageFile(null);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isProfileLoading}
                  startIcon={
                    isProfileLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <IconCheck size={18} />
                    )
                  }
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3.5, py: 1 }}
                >
                  {isProfileLoading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* Change Password */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'warning.light',
                  color: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconLock size={24} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Security & Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage your password and security credentials
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Alert
                severity="info"
                icon={<IconShieldLock size={20} />}
                sx={{ mb: 3, borderRadius: '12px', fontSize: '13px' }}
              >
                Ensure your new password contains at least 8 characters with a mix of letters and numbers.
              </Alert>

              <Box>
                <CustomFormLabel htmlFor="current_password">Current Password</CustomFormLabel>
                <CustomTextField
                  id="current_password"
                  name="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  fullWidth
                  placeholder="Enter current password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showCurrentPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box mt={1}>
                <CustomFormLabel htmlFor="password">New Password</CustomFormLabel>
                <CustomTextField
                  id="password"
                  name="password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  fullWidth
                  placeholder="Enter new password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box mt={1}>
                <CustomFormLabel htmlFor="password_confirmation">Confirm New Password</CustomFormLabel>
                <CustomTextField
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.password_confirmation}
                  onChange={handlePasswordChange}
                  fullWidth
                  placeholder="Confirm new password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2} mt={3.5} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={isPasswordLoading}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
                  onClick={() =>
                    setPasswordData({
                      current_password: '',
                      password: '',
                      password_confirmation: '',
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isPasswordLoading}
                  startIcon={
                    isPasswordLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <IconKey size={18} />
                    )
                  }
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3.5, py: 1 }}
                >
                  {isPasswordLoading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>
    </Grid>
  );
};

export default AccountTab;
