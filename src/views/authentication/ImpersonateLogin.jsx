import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const ImpersonateLogin = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('tenant_access_token', token);
      // Redirect to dashboard
      window.location.href = '/';
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Authenticating Impersonation session...
      </Typography>
    </Box>
  );
};

export default ImpersonateLogin;
