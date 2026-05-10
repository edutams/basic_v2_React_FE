import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { IconShieldCheck } from '@tabler/icons-react';
import { TenantAuthContext } from '../../context/TenantContext/auth';

// ── Keyframes ────────────────────────────────────────────────────────────────
const keyframes = {
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(28px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes scaleIn': {
    from: { opacity: 0, transform: 'scale(0.7)' },
    to:   { opacity: 1, transform: 'scale(1)' },
  },
  '@keyframes ripple': {
    '0%':   { transform: 'scale(0.85)', opacity: 0.6 },
    '100%': { transform: 'scale(1.6)',  opacity: 0 },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to:   { opacity: 1 },
  },
};

const anim = (name, duration = '0.6s', delay = '0s') =>
  `${name} ${duration} cubic-bezier(0.22,1,0.36,1) ${delay} both`;

const CompleteSetup = () => {
  const navigate = useNavigate();
  const { tenantInfo } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const schoolName = tenantInfo?.tenant_name || tenantInfo?.name || 'Your School';

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
      {/* ── LEFT — blue congratulations panel ── */}
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

        {/* Shield icon in circle */}
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

        {/* Congratulations text */}
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
          Congratulations {schoolName}!{'\n'}
          You've successfully completed your school setup.
        </Typography>

        {/* Continue to Dashboard button */}
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            bgcolor: '#fff',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: 14,
            px: 4,
            py: 1.25,
            borderRadius: '10px !important',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: anim('fadeUp', '0.6s', '0.5s'),
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.92)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Continue to Dashboard
        </Button>
      </Box>

      {/* ── RIGHT — support message panel ── */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, md: 6 },
          animation: anim('fadeIn', '0.6s', '0.4s'),
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 16, md: 20 },
            fontWeight: 400,
            color: 'text.primary',
            lineHeight: 1.7,
            mb: 3,
            maxWidth: 360,
          }}
        >
          A support agent will review your configuration to ensure everything is in order and will contact you shortly.
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 16, md: 20 },
            fontWeight: 400,
            color: 'text.primary',
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Thank you for choosing <strong>EduTAMS</strong>, we're excited to support your journey in digitizing schooling!
        </Typography>
      </Box>
    </Box>
  );
};

export default CompleteSetup;
