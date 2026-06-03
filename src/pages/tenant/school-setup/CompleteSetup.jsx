import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { IconShieldCheck, IconArrowLeft, IconLogout } from '@tabler/icons-react';
import { TenantAuthContext } from '@/context/TenantContext/auth';

// ── Keyframes ────────────────────────────────────────────────────────────────
const keyframes = {
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(28px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes scaleIn': {
    from: { opacity: 0, transform: 'scale(0.7)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  '@keyframes ripple': {
    '0%': { transform: 'scale(0.85)', opacity: 0.6 },
    '100%': { transform: 'scale(1.6)', opacity: 0 },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

const anim = (name, duration = '0.6s', delay = '0s') =>
  `${name} ${duration} cubic-bezier(0.22,1,0.36,1) ${delay} both`;

const CompleteSetup = () => {
  const navigate = useNavigate();
  const { tenantInfo, refreshTenantInfo, logout } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const status = tenantInfo?.onboarding_status || 'pending';
  const isApproved = status === 'approved';

  const schoolName = tenantInfo?.tenant_name || tenantInfo?.name || 'Your School';

  useEffect(() => {
    refreshTenantInfo();
  }, []); // ← runs once on mount

  // Poll every 15s while waiting for approval
  // SetupRedirectHandler will auto-navigate to '/' once approved
  useEffect(() => {
    if (isApproved) return;
    const interval = setInterval(refreshTenantInfo, 15000);
    return () => clearInterval(interval);
  }, [isApproved, refreshTenantInfo]);

  // Once tenantInfo updates to 'approved', SetupRedirectHandler
  // will see hasSeenWelcome is not set → navigate to /complete-setup
  // which they're already on → so the page just re-renders showing
  // "Welcome! Continue to Dashboard"

  const handleContinue = () => {
    navigate('/');
  };

  const handleBack = () => navigate('/school-profile?stage=1&edit=true'); // or stage=1

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        ...keyframes,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        m: 0,
        p: 0,
      }}
    >
      <Box
        sx={{
          width: '60%',
          flexShrink: 0,
          bgcolor: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ripple rings behind icon */}
        {[0, 1].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50% !important',
              border: '1.5px solid rgba(255,255,255,0.18)',
              animation: `ripple 3.5s ease-out ${i * 1.4}s infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50% !important',
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            animation: anim('scaleIn', '0.7s', '0.1s'),
            position: 'relative',
            zIndex: 1,
          }}
        >
          <IconShieldCheck size={56} color="#fff" strokeWidth={1.5} />
        </Box>

        <Typography
          sx={{
            color: '#fff',
            fontSize: { xs: 18, md: 22 },
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: 380,
            mb: 4,
            animation: anim('fadeUp', '0.6s', '0.3s'),
            position: 'relative',
            zIndex: 1,
          }}
        >
          {isApproved ? `Welcome back, ${schoolName}!` : `Congratulations ${schoolName}!`}
          <br />
          {isApproved
            ? 'Your school has been approved.'
            : "You've successfully completed your school setup."}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isApproved && (
            <Button
              onClick={handleBack}
              startIcon={<IconArrowLeft />}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Review / Edit Setup
            </Button>
          )}

          <Button
            onClick={handleContinue}
            sx={{
              bgcolor: '#fff',
              color: 'primary.main',
              fontWeight: 700,
              px: 4,
              py: 1.25,
              borderRadius: '10px !important',
            }}
          >
            {isApproved ? 'Continue to Dashboard' : 'Waiting for Approval'}
          </Button>
        </Box>

        <Button
          onClick={handleLogout}
          startIcon={<IconLogout size={16} />}
          sx={{
            mt: 3,
            color: 'rgba(41, 99, 110, 0.7)',
            fontSize: 13,
            textTransform: 'none',
            '&:hover': {
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.1)',
            },
            position: 'relative',
            zIndex: 1,
          }}
        >
          Log out
        </Button>
      </Box>

      <Box sx={{ flex: 1, bgcolor: '#f5f5f5', p: { xs: 4, md: 6 } }}>
        {isApproved ? (
          <Typography sx={{ fontSize: 18, lineHeight: 1.7 }}>
            Your school is now fully active. You can start using all features.
          </Typography>
        ) : (
          <>
            <Typography sx={{ fontSize: 18, lineHeight: 1.7, mb: 3 }}>
              A support agent will review your configuration to ensure everything is in order and
              will contact you shortly.
            </Typography>
            <Typography sx={{ fontSize: 18, lineHeight: 1.7 }}>
              Thank you for choosing <strong>EduTAMS</strong>.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CompleteSetup;
