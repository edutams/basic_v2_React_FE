import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link, useTheme, useMediaQuery } from '@mui/material';
import { IconVideo, IconChevronRight, IconPower, IconArrowRight } from '@tabler/icons-react';
import { TenantAuthContext } from '../../context/TenantContext/auth';
import { useSetupTour } from '../../context/SetupTourContext';
import EduTAMSLogo from '../../assets/images/logos/EduTAMS.png';
import SetupImage from '../../assets/images/setup/setup.png';

// ── Keyframes ────────────────────────────────────────────────────────────────
const keyframes = {
  '@keyframes fadeSlideLeft': {
    from: { opacity: 0, transform: 'translateX(-40px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes floatUp': {
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-14px)' },
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% center' },
    '100%': { backgroundPosition: '200% center' },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-8px)' },
    '60%': { transform: 'translateY(-4px)' },
  },
  '@keyframes ripple': {
    '0%': { transform: 'scale(0.8)', opacity: 1 },
    '100%': { transform: 'scale(2.4)', opacity: 0 },
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const anim = (name, duration = '0.6s', delay = '0s', easing = 'cubic-bezier(0.22,1,0.36,1)') =>
  `${name} ${duration} ${easing} ${delay} both`;

const SetupWelcome = () => {
  const navigate = useNavigate();
  const { tenantInfo, logout } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { startTour } = useSetupTour();

  // Breakpoint helpers
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px — stacked layout
  const isTablet = useMediaQuery(theme.breakpoints.down('sm')); // tablets keep the desktop side-by-side layout

  const schoolName = tenantInfo?.tenant_name || tenantInfo?.name || 'Your School';

  useEffect(() => {
    const timer = setTimeout(() => startTour(), 800);
    return () => clearTimeout(timer);
  }, [startTour]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const handleStartSetup = () => navigate('/school-profile?stage=1');

  return (
    <Box
      sx={{
        ...keyframes,
        width: '100vw',
        minHeight: '100vh',
        height: { xs: 'auto', sm: '100vh' },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        overflow: { xs: 'auto', sm: 'hidden' },
        position: 'relative',
        m: 0,
        p: 0,
        borderRadius: '0 !important',
      }}
    >
      {/* ── LEFT / TOP PANEL ─────────────────────────────────────────── */}
      <Box
        sx={{
          width: { xs: '100%', sm: '62%' },
          flexShrink: 0,
          bgcolor: 'primary.main',
          animation: anim('fadeIn', '0.4s', '0s'),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 5, md: '60px' },
          pt: { xs: 7, sm: '52px' },
          pb: { xs: 0, sm: '140px' },
          borderRadius: '0 !important',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          minHeight: { xs: 340, sm: 'unset' },
        }}
      >
        {/* Ripple rings (decorative — hidden on xs to reduce noise) */}
        {!isMobile && (
          <>
            <Box
              sx={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50% !important',
                border: '1px solid rgba(255,255,255,0.08)',
                top: '50%',
                left: '30%',
                transform: 'translate(-50%,-50%)',
                animation: 'ripple 4s ease-out 0.5s infinite',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50% !important',
                border: '1px solid rgba(255,255,255,0.05)',
                top: '50%',
                left: '30%',
                transform: 'translate(-50%,-50%)',
                animation: 'ripple 4s ease-out 2s infinite',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h5"
            data-tour="welcome-heading"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              mb: 0.25,
              fontSize: { xs: 16, sm: 18, md: 20 },
              animation: anim('fadeSlideLeft', '0.55s', '0.15s'),
            }}
          >
            Welcome
          </Typography>

          <Box sx={{ mb: { xs: 2, md: 4 }, animation: anim('fadeSlideLeft', '0.6s', '0.28s') }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 18, sm: 25, md: 32 },
                lineHeight: 1.1,
                wordBreak: 'break-word',
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
              fontSize: { xs: 20, sm: 23, md: 25, lg: 30 },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: { xs: 2, md: 3 },
              maxWidth: { xs: '100%', md: 460 },
              animation: anim('fadeUp', '0.65s', '0.42s'),
            }}
          >
            Let&apos;s get your school portal ready in a few easy steps.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: { xs: 14, sm: 15, md: 17 },
              lineHeight: 1.7,
              maxWidth: { xs: '100%', md: 400 },
              animation: anim('fadeUp', '0.65s', '0.56s'),
            }}
          >
            From lesson planning to student engagement—everything in one place. Teach better. Manage
            easier.
          </Typography>

          {/* Bouncing progress dots */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: { xs: 3, md: 4 },
              animation: anim('fadeIn', '0.5s', '0.8s'),
            }}
          >
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

          {/* ── "Start Setup" button + mobile illustration row ── */}
          {isTablet && (
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
              }}
            >
              {/* Start Setup button — sits on top */}
              <Box
                onClick={handleStartSetup}
                data-tour="welcome-start"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#FFD43B',
                  color: 'primary.dark',
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px !important',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  animation: anim('fadeUp', '0.6s', '0.75s'),
                  zIndex: 2,
                  '&:hover': { opacity: 0.9, transform: 'translateY(-2px)' },
                  '&:active': { transform: 'translateY(0)' },
                }}
              >
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: 'inherit', letterSpacing: 0.3 }}
                >
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
                    bgcolor: 'rgba(0,0,0,0.12)',
                  }}
                >
                  <IconArrowRight size={15} />
                </Box>
              </Box>

              {/* Full-width illustration — circle + image below the button */}
              <Box
                sx={{
                  position: 'relative',
                  width: 'calc(100% + 48px)', // bleed past the panel's px padding
                  mx: '-24px',
                  height: 220,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Circle — explicit vw-based square so it's always a circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100vw',
                    height: '100vw',
                    borderRadius: '50% !important',
                    background: 'radial-gradient(circle, #ffffff 60%, #e8edf8 100%)',
                    boxShadow: `0 8px 40px ${primary}1f`,
                    bottom: '-60vw',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 0,
                  }}
                />
                {/* Illustration sits on top of the circle */}
                <Box
                  component="img"
                  src={SetupImage}
                  alt="School setup"
                  sx={{
                    height: 210,
                    width: 'auto',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                    position: 'relative',
                    zIndex: 1,
                    animation: anim('floatUp', '0.8s', '0.9s'),
                  }}
                />

                {/* Powered by — sits at the bottom of the circle on mobile */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    animation: anim('fadeIn', '0.6s', '1.1s'),
                  }}
                >
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, whiteSpace: 'nowrap' }}>
                    Powered by
                  </Typography>
                  <Box
                    component="img"
                    src={EduTAMSLogo}
                    alt="EduTAMS"
                    sx={{
                      height: 16,
                      filter: 'brightness(0) invert(1)',
                      opacity: 0.65,
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Powered-by footer — desktop only (mobile version lives inside the illustration block) */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            position: 'absolute',
            bottom: 28,
            left: '60px',
            alignItems: 'center',
            gap: 1,
            zIndex: 2,
            animation: anim('fadeIn', '0.6s', '1s'),
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>Powered by</Typography>
          <Box
            component="img"
            src={EduTAMSLogo}
            alt="EduTAMS"
            sx={{
              height: 20,
              filter: 'brightness(0) invert(1)',
              opacity: 0.75,
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>

      {/* ── RIGHT / BOTTOM PANEL — hidden on mobile ──────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          flex: 1,
          background: 'linear-gradient(160deg, #f0f4ff 0%, #e8edf8 100%)',
          borderRadius: '0 !important',
          position: 'relative',
        }}
      />

      {/* White circle behind illustration — hidden on mobile */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          width: { sm: '60vw', md: '40vw', lg: '35vw' },
          height: { sm: '60vw', md: '40vw', lg: '35vw' },
          borderRadius: '50% !important',
          background: 'radial-gradient(circle, #ffffff 60%, #e8edf8 100%)',
          boxShadow: `0 8px 40px ${primary}1f`,
          bottom: { sm: '-10vw', md: '-9vw' },
          left: { sm: '25%', md: '37%', lg: '37%' },
          zIndex: 2,
          animation: anim('floatUp', '0.9s', '0.3s'),
        }}
      />

      {/* Illustration — hidden on mobile */}
      <Box
        component="img"
        src={SetupImage}
        alt="School setup"
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          bottom: 0,
          left: { sm: '20%', md: '30%' },
          height: { sm: '48%', md: '65%' },
          objectFit: 'contain',
          objectPosition: 'bottom left',
          zIndex: 3,
        }}
      />

      {/* ── TOP-RIGHT CONTROLS ───────────────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.75,
          px: { xs: 2, md: 3 },
          pt: { xs: 1.5, md: 2 },
          animation: anim('fadeIn', '0.5s', '0.2s'),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: { xs: 11, md: 13 }, color: 'rgba(0,0,0,0.45)' }}>
              Having Troubles?
            </Typography>
            <Link
              href="#"
              underline="hover"
              data-tour="welcome-help"
              sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 700, color: 'primary.main' }}
            >
              Get Help
            </Link>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              '&:hover': { opacity: 0.75 },
            }}
          >
            <IconPower size={14} color="#e53935" />
            <Typography sx={{ fontSize: { xs: 11, md: 13 }, fontWeight: 600, color: '#e53935' }}>
              Logout
            </Typography>
          </Box>
        </Box>

        {/* "How to setup" pill — hide on very small screens to avoid crowding */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.6,
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
              width: 32,
              height: 22,
              bgcolor: 'primary.main',
              borderRadius: '6px !important',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconVideo size={13} color="#fff" />
          </Box>
          <Typography
            sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}
          >
            How to setup your Profile
          </Typography>
          <IconChevronRight size={15} color="#666" />
        </Box>
      </Box>

      {/* ── "Ready? Click to get started!" callout bubble ── desktop only ── */}
      {!isTablet && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 110,
            right: 28,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0,
            animation: `${anim('fadeUp', '0.7s', '1.2s')}, bounce 2.4s ease-in-out 2.2s infinite`,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              bgcolor: '#fff',
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: '14px !important',
              px: 2,
              py: 1.25,
              boxShadow: `0 6px 24px ${primary}22`,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: 'primary.main',
                whiteSpace: 'nowrap',
                letterSpacing: 0.2,
              }}
            >
              🚀 Ready? Click to get started!
            </Typography>
          </Box>

          <Box sx={{ mr: 4, mt: 0.5 }}>
            <svg width="48" height="52" viewBox="0 0 48 52" fill="none">
              <path
                d="M8 4 C4 22, 20 36, 40 46"
                stroke={primary}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M30 44 L40 46 L36 36"
                stroke={primary}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </Box>
        </Box>
      )}

      {/* ── "Start Setup" CTA — absolute on desktop only ── */}
      {!isTablet && (
        <Box
          onClick={handleStartSetup}
          data-tour="welcome-start"
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
      )}
    </Box>
  );
};

export default SetupWelcome;