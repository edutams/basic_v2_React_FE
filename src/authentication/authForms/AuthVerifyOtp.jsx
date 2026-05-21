import React, { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import agentApi from '@/api/auth';
import tenantApi from '@/api/tenant_api';

const AuthVerifyOtp = ({ emailProp, onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isAgentFlow = location.pathname.startsWith('/agent');
  const api = isAgentFlow ? agentApi : tenantApi;
  const apiEndpoint = isAgentFlow ? '/v1/landlord/auth/verify_otp' : '/verify_otp';
  const resetPath = isAgentFlow ? '/agent/reset_password' : '/reset_password';

  const [formData, setFormData] = useState({
    email: emailProp || searchParams.get('email') || '',
    otp: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    api
      .post(apiEndpoint, formData)
      .then((res) => {
        const reset_token = res.data.reset_token;
        const query = reset_token
          ? `?token=${reset_token}&email=${encodeURIComponent(formData.email)}`
          : `?email=${encodeURIComponent(formData.email)}`;

        if (onSuccess) {
          onSuccess(formData.email, reset_token);
        } else {
          navigate(`${resetPath}${query}`, {
            replace: true,
            state: { message: 'OTP verified successfully! Please reset your password.' },
          });
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP');
      })
      .finally(() => {
        setLoading(false);
      });
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
        label="Enter OTP"
        name="otp"
        value={formData.otp}
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
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
    </Box>
  );
};

export default AuthVerifyOtp;
