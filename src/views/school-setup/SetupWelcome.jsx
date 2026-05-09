import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link, useTheme } from '@mui/material';
import { IconVideo, IconChevronRight, IconPower, IconArrowRight } from '@tabler/icons-react';
import { TenantAuthContext } from '../../context/TenantContext/auth';
import EduTAMSLogo from '../../assets/images/logos/EduTAMS.png';
import SetupImage from '../../assets/images/setup/setup.png';

// ── Keyframes ────────────────────────────────────────────────────────────────
const keyframes = {
  '@keyframes fadeSlideLeft': {
    from: { opacity: 0, transform: 'translateX(-40px)' },
    to:   { opacity: 1, transform: 'translateX(0)' },
  },
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to:   { opacity: 1 },
  },
  '@keyframes floatUp': {
    from: { opacity: 0, transform: 'translateY(50px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%':      { transform: 'translateY(-14px)' },
  },
  '@keyframes shimmer': {
    '0%':   { backgroundPosition: '-200% center' },
    '100%': { backgroundPosition: '200% center' },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '40%':      { transform: 'translateY(-8px)' },
    '60%':      { transform: 'translateY(-4px)' },
  },
  '@keyframes ripple': {
    '0%':   { transform: 'scale(0.8)', opacity: 1 },
    '100%': { transform: 'scale(2.4)', opacity: 0 },
  },
  '@keyframes gradientShift': {
    '0%':   { backgroundPosition: '0% 50%' },
    '50%':  { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};
const anim = (name, duration = '0.6s', delay = '0s', easing = 'cubic-bezier(0.22,1,0.36,1)') =>
  `${name} ${duration} ${easing} ${delay} both`;

// ── Component ────────────────────────────────────────────────────────────────
const SetupWelcome = () => {
  const navigate = useNavigate();
  const { tenantInfo, logout } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const schoolName = tenantInfo?.tenant_name || tenantInfo?.name || 'Your School';

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const handleStartSetup = () => navigate('/school-profile?stage=1');

  return (
    <Box
      sx={{
        ...keyframes,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        m: 0, p: 0,
        borderRadius: '0 !important',
      }}
    >
      {/* ══════════════════════════════════════════
          LEFT PANEL — animated gradient
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          width: '65%',
          flexShrink: 0,
          bgcolor: 'primary.main',
          animation: anim('fadeIn', '0.4s', '0s'),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, md: '60px' },
          py: { xs: 4, md: '52px' },
          pb: { md: '140px' },
          borderRadius: '0 !important',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Ripple ring behind text */}
        <Box sx={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50% !important',
          border: '1px solid rgba(255,255,255,0.08)',
          top: '50%', left: '30%',
          transform: 'translate(-50%,-50%)',
          animation: 'ripple 4s ease-out 0.5s infinite',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50% !important',
          border: '1px solid rgba(255,255,255,0.05)',
          top: '50%', left: '30%',
          transform: 'translate(-50%,-50%)',
          animation: 'ripple 4s ease-out 2s infinite',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              mb: 0.25,
              animation: anim('fadeSlideLeft', '0.55s', '0.15s'),
            }}
          >
            Welcome
          </Typography>

          {/* School name with shimmer */}
          <Box
            sx={{
              mb: 4,
              animation: anim('fadeSlideLeft', '0.6s', '0.28s'),
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg, #FFD43B, #FFE082, #FFD43B, #FFC107)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear 1s infinite',
                display: 'inline-block',
              }}
            >
              {schoolName}
            </Typography>
          </Box>

          <Typography
            sx={{
              color: '#fff',
              fontSize: { xs: 26, md: 42 },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 3,
              maxWidth: 460,
              animation: anim('fadeUp', '0.65s', '0.42s'),
            }}
          >
            Let&apos;s get your school portal ready in a few easy steps.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.7,
              maxWidth: 400,
              animation: anim('fadeUp', '0.65s', '0.56s'),
            }}
          >
            From lesson planning to student engagement—everything in one place.
            Teach better. Manage easier.
          </Typography>

          {/* Animated bouncing dots */}
          <Box sx={{ display: 'flex', gap: 1, mt: 4, animation: anim('fadeIn', '0.5s', '0.8s') }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  width: i === 0 ? 24 : 8,
                  height: 8,
                  borderRadius: '4px !important',
                  bgcolor: i === 0 ? '#FFD43B' : 'rgba(255,255,255,0.35)',
                  animation: `bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Powered by EduTAMS */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 28,
            left: { xs: 4, md: '60px' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 2,
            animation: anim('fadeIn', '0.6s', '1s'),
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
            Powered by
          </Typography>
          <Box
            component="img"
            src={EduTAMSLogo}
            alt="EduTAMS"
            sx={{ height: 20, filter: 'brightness(0) invert(1)', opacity: 0.75, objectFit: 'contain' }}
          />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          RIGHT PANEL
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(160deg, #f0f4ff 0%, #e8edf8 100%)',          borderRadius: '0 !important',
          position: 'relative',
        }}
      />

      {/* White circle */}
      <Box
        sx={{
          position: 'absolute',
          width: '38vw',
          height: '38vw',
          borderRadius: '50% !important',
          background: 'radial-gradient(circle, #ffffff 60%, #e8edf8 100%)',
          boxShadow: `0 8px 40px ${primary}1f`,
          bottom: '-8vw',
          left: '38%',
          zIndex: 2,
          animation: anim('floatUp', '0.9s', '0.3s'),
        }}
      />

      {/* Kids image with float */}
      <Box
        component="img"
        src={SetupImage}
        alt="School setup"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '36%',
          height: '72%',
          objectFit: 'contain',
          objectPosition: 'bottom left',
          zIndex: 3,
          animation: `${anim('floatUp', '1s', '0.5s')}, float 5s ease-in-out 1.5s infinite`,
          filter: `drop-shadow(0 16px 32px ${primary}2e)`,
        }}
      />

      {/* ══════════════════════════════════════════
          TOP-RIGHT CONTROLS
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, right: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.75,
          px: 3, pt: 2,
          animation: anim('fadeIn', '0.5s', '0.2s'),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
              Having Troubles?
            </Typography>
            <Link href="#" underline="hover" sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main' }}>
              Get Help
            </Link>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
          >
            <IconPower size={15} color="#e53935" />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e53935' }}>Logout</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5, py: 0.6,
            bgcolor: '#fff',
            borderRadius: '10px !important',
            boxShadow: '0px 3px 14px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: `0px 6px 20px ${primary}2e`, transform: 'translateY(-1px)' },
          }}
        >
          <Box
            sx={{
              width: 32, height: 22,
              bgcolor: 'primary.main',
              borderRadius: '6px !important',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconVideo size={13} color="#fff" />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}>
            How to setup your Profile
          </Typography>
          <IconChevronRight size={15} color="#666" />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          START SETUP BUTTON
      ══════════════════════════════════════════ */}
      <Box
        onClick={handleStartSetup}
        sx={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'primary.main',
          color: '#fff',
          px: 3,
          py: 1.25,
          borderRadius: '12px !important',
          boxShadow: `0px 4px 20px ${primary}66`,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          animation: anim('fadeUp', '0.6s', '0.75s'),
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'translateY(-3px)',
            boxShadow: `0px 8px 28px ${primary}80`,
          },
          '&:active': { transform: 'translateY(-1px)' },
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
          Start Setup
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '50% !important',
            bgcolor: 'rgba(255,255,255,0.2)',
            transition: 'transform 0.2s',
            '.MuiBox-root:hover &': { transform: 'translateX(3px)' },
          }}
        >
          <IconArrowRight size={15} color="#fff" />
        </Box>
      </Box>
    </Box>
  );
};

export default SetupWelcome;
