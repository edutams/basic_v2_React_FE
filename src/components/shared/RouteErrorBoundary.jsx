import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ErrorImg from '@/assets/images/backgrounds/errorimg.svg';

// Replaces react-router's default "Hey developer 👋" fallback screen with
// something an end user should actually see. Used as `errorElement` on every
// top-level route in both AgentRoutes.jsx (landlord) and TenantRoutes.jsx
// (tenant) — react-router renders this in place of whatever route actually
// threw, for both render errors and loader/action errors.
const RouteErrorBoundary = () => {
  const error = useRouteError();

  // Still surface it in the console for whoever's debugging.
  // eslint-disable-next-line no-console
  console.error('Route error:', error);

  const isResponse = isRouteErrorResponse(error);
  const status = isResponse ? error.status : null;

  const title = status === 404 ? 'Page not found' : 'Something went wrong';
  const message = isResponse
    ? error.statusText || (typeof error.data === 'string' ? error.data : null) || 'This page could not be found.'
    : error?.message || 'An unexpected error occurred. Please try again.';

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <img src={ErrorImg} alt="Error" style={{ maxWidth: 320, margin: '0 auto', display: 'block' }} />
        <Typography align="center" variant="h1" mb={2}>
          {status || 'Oops!'}
        </Typography>
        <Typography align="center" variant="h4" mb={1}>
          {title}
        </Typography>
        <Typography align="center" variant="body1" color="text.secondary" mb={4}>
          {message}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          {/* Plain <a>/full reload rather than react-router's Link/useNavigate —
              this can render while the router itself is in an error state, so
              it shouldn't lean on router context still being healthy. */}
          <Button variant="outlined" size="small" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button variant="contained" size="small" color="primary" href="/dashboard" disableElevation>
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default RouteErrorBoundary;
