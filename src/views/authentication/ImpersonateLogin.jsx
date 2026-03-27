import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { CircularProgress, Box, Typography } from '@mui/material';

const ImpersonateLogin = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const token = params.token;

  useEffect(() => {
    if (token) {
      localStorage.setItem('tenant_access_token', token);
      localStorage.setItem('isImpersonating', 'true');

      // Get impersonator_id from query parameter (passed from backend)
      const impersonatorId = searchParams.get('impersonator_id');
      if (impersonatorId) {
        localStorage.setItem('impersonator_id', impersonatorId);
      }

      window.location.href = '/';
    } else {
      window.location.href = '/login';
    }
  }, [token, searchParams]);

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
        Authenticating...
      </Typography>
    </Box>
  );
};

export default ImpersonateLogin;
