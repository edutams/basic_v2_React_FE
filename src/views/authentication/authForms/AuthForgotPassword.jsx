import React, { useState } from 'react';
import { Box, Button, Alert, CircularProgress, Stack } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import agentApi from '../../../api/auth';
import tenantApi from '../../../api/tenant_api';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';

const AuthForgotPassword = ({ loginPath, verifyOtpPath, onBackToLogin }) => {
  const location = useLocation();

  // Auto-detect paths based on current route if not explicitly provided
  const isAgentFlow = location.pathname.startsWith('/agent');
  const resolvedLoginPath = loginPath ?? (isAgentFlow ? '/agent/login' : '/login');
  const resolvedVerifyOtpPath = verifyOtpPath ?? (isAgentFlow ? '/agent/verify_otp' : '/verify_otp');

  // Agent uses the landlord axios instance; tenant uses tenantApi (adds X-Tenant-ID header)
  const api = isAgentFlow ? agentApi : tenantApi;
  const apiEndpoint = isAgentFlow ? '/v1/landlord/auth/forgot_password' : '/forgot_password';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post(apiEndpoint, { email });

      setMessage(res.data.message || 'Reset link sent to your email!');

      navigate(`${resolvedVerifyOtpPath}?email=${encodeURIComponent(email)}`, {
        replace: true,
        state: {
          message: 'Reset link sent to your email. Please verify your OTP.',
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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

      <Stack mt={4} spacing={2}>
        <CustomFormLabel htmlFor="reset-email">Email Address</CustomFormLabel>

        <CustomTextField
          id="reset-email"
          fullWidth
          label="Email Address"
          value={email}
          size="small"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Box mt={2} textAlign="center">
          <Button
            {...(onBackToLogin ? { onClick: onBackToLogin } : { component: Link, to: resolvedLoginPath })}
            fullWidth
          >
            Back to Login
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AuthForgotPassword;
