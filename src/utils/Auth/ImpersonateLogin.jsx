import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

// A JWT is always 3 base64url segments separated by dots — reject anything
// that doesn't at least look like one before it ever touches localStorage.
const isPlausibleJwt = (value) => /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value ?? '');

const ImpersonateLogin = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const token = params.token;

  useEffect(() => {
    if (isPlausibleJwt(token)) {
      localStorage.setItem('tenant_access_token', token);
      localStorage.setItem('isImpersonating', 'true');

      // Get impersonator_id from query parameter (passed from backend)
      const impersonatorId = searchParams.get('impersonator_id');
      if (impersonatorId) {
        localStorage.setItem('impersonator_id', impersonatorId);
      }

      // Scrub the token out of the current history entry before navigating
      // away, so pressing "back" later doesn't resurface it in the URL bar.
      window.history.replaceState(null, '', '/impersonate-login');

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
