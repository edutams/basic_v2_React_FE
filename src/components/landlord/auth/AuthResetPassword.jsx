import React, { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import agentApi from '@/api/landlord/landlord_api';
import tenantApi from '@/api/tenant/tenant_api';

const AuthResetPassword = ({ emailProp, tokenProp, onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isAgentFlow = location.pathname.startsWith('/agent');
  const api = isAgentFlow ? agentApi : tenantApi;
  const apiEndpoint = isAgentFlow ? '/v1/landlord/auth/reset_password' : '/reset_password';
  const loginPath = isAgentFlow ? '/agent/login' : '/login';

  const [formData, setFormData] = useState({
    email: emailProp || searchParams.get('email') || '',
    token: tokenProp || searchParams.get('token') || '',
    password: '',
    password_confirmation: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post(apiEndpoint, formData);
      setMessage(res.data.message || 'Password reset successfully!');
      localStorage.removeItem('access_token');
      setFormData({ email: '', token: '', password: '', password_confirmation: '' });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(loginPath, {
          replace: true,
          state: { message: 'Password reset successful! Please login with your new password.' },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || 'Failed to reset password',
      );
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

      <TextField
        fullWidth
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        disabled
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="New Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        name="password_confirmation"
        type="password"
        value={formData.password_confirmation}
        onChange={handleChange}
        required
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        type="submit"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </Box>
  );
};

export default AuthResetPassword;
