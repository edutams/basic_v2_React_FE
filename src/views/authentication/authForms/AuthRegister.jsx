import React, { useState } from 'react';
import { Box, Typography, Button, Divider, Alert, CircularProgress, Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../hooks/useNotification';
import AuthSocialButtons from './AuthSocialButtons';

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      // password_confirmation: formData.password_confirmation,
    });

    if (result.success) {
      notify.success('Registration successful!', 'Welcome!');
      navigate('/dashboards/analytical');
    } else {
      setApiError(result.error || 'Registration failed');
      notify.error(result.error || 'Registration failed');
    }
  };

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      )}
      {subtext}

      <AuthSocialButtons title="Sign up with" />

      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            or sign up with
          </Typography>
        </Divider>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {apiError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} mt={3}>
        <Stack spacing={0}>
          <Box>
            <CustomFormLabel htmlFor="name">Name</CustomFormLabel>
            <CustomTextField
              id="name"
              name="name"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={isLoading}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
            <CustomTextField
              id="email"
              name="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isLoading}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <CustomTextField
              id="password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
            />
          </Box>

          {/* <Box>
            <CustomFormLabel htmlFor="password_confirmation">Confirm Password</CustomFormLabel>
            <CustomTextField
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              variant="outlined"
              fullWidth
              value={formData.password_confirmation}
              onChange={handleInputChange}
              error={!!formErrors.password_confirmation}
              helperText={formErrors.password_confirmation}
              disabled={isLoading}
            />
          </Box> */}

          <Button
            sx={{ mt: 2 }}
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </Stack>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
