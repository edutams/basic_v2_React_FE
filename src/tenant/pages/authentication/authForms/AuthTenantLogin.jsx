import { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import CustomCheckbox from '@/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { useNotification } from '@/hooks/useNotification';
import EduTAMSLogo from '../../../assets/images/logos/EduTAMS.jpeg';
import { Avatar } from '@mui/material';
import { IconSchool } from '@tabler/icons-react';

const AuthTenantLogin = ({ title, subtitle, subtext, onCreateAccount }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const { login, isLoading, error, clearError, tenantInfo } = useTenantAuth();
  const schoolName = tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || '';
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const notify = useNotification();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.login.trim()) {
      errors.login = 'login is required';
    }
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    clearError();

    const result = await login({
      login: formData.login,
      password: formData.password,
      remember: formData.rememberMe,
    });

    if (result.success) {
      notify.success('Login successful!', 'Welcome back');
      navigate(from, { replace: true });
    } else {
      notify.error(result.error || 'Login failed', 'Authentication Error');
    }
  };

  return (
    <>
      {title ? (
        <Box mb={2}>
          {/* School logo */}
          <Box display="flex" justifyContent="center" mb={1.5}>
            <Avatar
              src={schoolLogo || undefined}
              alt={schoolName || 'School Logo'}
              variant="rounded"
              sx={{
                width: 72,
                height: 72,
                borderRadius: 2,
                bgcolor: schoolLogo ? 'transparent' : 'grey.100',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {!schoolLogo && <IconSchool size={40} color="#9e9e9e" />}
            </Avatar>
          </Box>

          {/* <Typography fontWeight="700" variant="h3" textAlign="center">
            {title}
          </Typography> */}
          {schoolName && (
            <Typography fontWeight="700" variant="h4" textAlign="center">
              {schoolName}
            </Typography>
          )}
        </Box>
      ) : null}

      {subtext}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={0}>
          <Box>
            <CustomFormLabel htmlFor="login">Email/Phone No</CustomFormLabel>
            <CustomTextField
              id="login"
              name="login"
              variant="outlined"
              fullWidth
              value={formData.login}
              onChange={handleInputChange}
              error={!!formErrors.login}
              helperText={formErrors.login}
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
          {/* <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <CustomCheckbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                }
                label="Remember this Device"
              />
            </FormGroup>
          </Stack> */}
          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={<CustomCheckbox defaultChecked />}
                label="Remeber this Device"
              />
            </FormGroup>
            <Typography
              component={Link}
              to="/forgot_password"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              Forgot Password ?
            </Typography>
          </Stack>
        </Stack>
        <Box mt={2}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Signing In...' : 'Login to Dashboard'}
          </Button>
        </Box>

        <Box mt={1.5}>
          <Button
            {...(onCreateAccount
              ? { onClick: onCreateAccount }
              : { component: Link, to: '/admission/apply' })}
            variant="outlined"
            size="large"
            fullWidth
            color="primary"
            disabled={isLoading}
          >
            Create Parent Account
          </Button>
        </Box>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthTenantLogin;
