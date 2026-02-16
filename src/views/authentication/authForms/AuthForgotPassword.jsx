import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress, Stack } from '@mui/material';
import { Link } from 'react-router';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/auth';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';

const AuthForgotPassword = () => {
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
      const res = await api.post('/agent/forgot_password', { email });
      setMessage(res.data.message || 'Reset link sent to your email!');

      navigate(`/agent/verify_otp?email=${encodeURIComponent(email)}`, {
        replace: true,
        state: { message: 'Reset link sent to your email. Please verify your OTP.' },
      });

      setTimeout(() => {
        window.location.href = `/agent/verify_otp?email=${encodeURIComponent(email)}`;
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
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
          <CustomFormLabel htmlFor="reset-email">Email Adddress</CustomFormLabel>
          <CustomTextField
            id="reset-email"
            variant="outlined"
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Box mt={2} textAlign="center">
            <Button component={Link} to="/agent/login" color="primary">
              Back to Login
            </Button>
          </Box>
        </Stack>
      </Box>
    </>
  );
};
export default AuthForgotPassword;
