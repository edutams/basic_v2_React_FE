import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { IconLock, IconLogout } from '@tabler/icons-react';
import { useTenantAuth } from '@/hooks/useTenantAuth';

/**
 * The ONLY thing a non-admin end user (teacher/student/parent) sees once
 * their school's subscription is locked — rendered by SchoolLayout in
 * place of the sidebar/header/page content entirely, for every route, not
 * just the dashboard. There is nothing else to do here but log out; the
 * only way back in is the school actually renewing, at which point a
 * fresh login lands on a normal dashboard again.
 */
const AccountLockedScreen = () => {
  const { logout } = useTenantAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.default : '#e4e4e4a9'),
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 420,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'error.light',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <IconLock size={28} />
        </Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          This platform is temporarily unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please contact your school for more information.
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={loggingOut ? <CircularProgress size={16} color="inherit" /> : <IconLogout size={18} />}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          Log Out
        </Button>
      </Paper>
    </Box>
  );
};

export default AccountLockedScreen;
