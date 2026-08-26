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
} from '@mui/material';
import {
  IconUpload,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconKey,
  IconShieldLock,
  IconUser,
} from '@tabler/icons-react';
import BlankCard from '@/components/shared/BlankCard';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

const AccountTab = () => {
  const { user, updateAgentProfile, changePassword } = useAuth();
  const notify = useNotification();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState('');

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
      const result = await updateAgentProfile(payload, true);
      if (result?.success !== false) {
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
      } else {
        notify.error(result?.error || 'Failed to update profile photo', 'Error');
      }
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
      const result = await updateAgentProfile(payload, true);
      if (result?.success !== false) {
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
      } else {
        notify.error(result?.error || 'Update failed', 'Authentication Error');
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
      notify.success(result.message || 'Password changed successfully!');

      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      notify.error(err.response?.data?.message || err.response?.data?.error || 'Failed to change password', 'Error');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Profile Update */}
      <Grid item size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: (theme) => theme.palette.primary.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                }}
              >
                <IconUser size={20} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                Personal Information
              </Typography>
            </Box>
            <Typography color="textSecondary" variant="body2" mb={3}>
              Update your photo and personal details here
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleProfileSubmit}>
              {/* Profile Photo Section */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: '12px',
                  borderColor: 'divider',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  alignItems={{ xs: 'center', sm: 'center' }}
                >
                  <Avatar
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : savedAvatarUrl || user?.avatar
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
                          Save Photo
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="fname">First Name</CustomFormLabel>
                  <CustomTextField
                    id="fname"
                    name="fname"
                    value={formData.fname}
                    onChange={handleProfileChange}
                    fullWidth
                    placeholder="Enter first name"
                  />
                </Grid>

                <Grid item size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="lname">Last Name</CustomFormLabel>
                  <CustomTextField
                    id="lname"
                    name="lname"
                    value={formData.lname}
                    onChange={handleProfileChange}
                    fullWidth
                    placeholder="Enter last name"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
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

                <Grid item size={{ xs: 12, sm: 6 }}>
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
                  value={formData.address || ''}
                  onChange={handleProfileChange}
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={2}
                  placeholder="Enter street address"
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
                  Save Changes
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>

      {/* Change Password */}
      <Grid item size={{ xs: 12, lg: 6 }}>
        <BlankCard>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: (theme) => theme.palette.warning.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'warning.main',
                }}
              >
                <IconShieldLock size={20} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                Security & Password
              </Typography>
            </Box>
            <Typography color="textSecondary" variant="body2" mb={3}>
              Ensure your account stays secure by using a strong password
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handlePasswordSubmit}>
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconKey size={18} />
                    </InputAdornment>
                  ),
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

              <CustomFormLabel htmlFor="password">New Password</CustomFormLabel>
              <CustomTextField
                id="password"
                name="password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.password}
                onChange={handlePasswordChange}
                fullWidth
                placeholder="Minimum 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconShieldLock size={18} />
                    </InputAdornment>
                  ),
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

              <CustomFormLabel htmlFor="password_confirmation">Confirm New Password</CustomFormLabel>
              <CustomTextField
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                fullWidth
                placeholder="Re-enter new password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCheck size={18} />
                    </InputAdornment>
                  ),
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
                      <IconCheck size={18} />
                    )
                  }
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3.5, py: 1 }}
                >
                  Update Password
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
