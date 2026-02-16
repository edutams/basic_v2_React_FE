import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api/auth';

const AuthVerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
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
      .post('/agent/verify_otp', formData)
      .then((res) => {
        const reset_token = res.data.reset_token;

        navigate(
          `/agent/reset_password?token=${reset_token}&email=${encodeURIComponent(formData.email)}`,
          {
            replace: true,
            state: {
              message: 'OTP verified successfully! Please reset your password.',
            },
          },
        );

        setTimeout(() => {
          window.location.href = `/agent/reset_password?token=${reset_token}&email=${encodeURIComponent(formData.email)}`;
        }, 1000);
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
