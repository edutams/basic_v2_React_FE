import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../api/auth';

const AuthResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
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
      const res = await api.post('/agent/reset_password', formData);
      setMessage(res.data.message || 'Password reset successfully! Redirecting to login...');
      localStorage.removeItem('access_token');
      setFormData({
        email: '',
        token: '',
        password: '',
        password_confirmation: '',
      });

      navigate('/agent/login', {
        replace: true,
        state: { message: 'Password reset successful! Please login with your new password.' },
      });

      setTimeout(() => {
        window.location.href = '/agent/login';
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
