import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link, useTheme, useMediaQuery } from '@mui/material';
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
};

const anim = (name, duration = '0.6s', delay = '0s', easing = 'cubic-bezier(0.22,1,0.36,1)') =>
  `${name} ${duration} ${easing} ${delay} both`;

// ── Component ────────────────────────────────────────────────────────────────
const SetupWelcome = () => {
  const navigate = useNavigate();
  const { tenantInfo, logout } = useContext(TenantAuthContext);
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  // sm (600px)+ → side-by-side (tablet + desktop)
  // xs only     → full-width stacked (mobile)
  const isSideBySide = useMediaQuery(theme.breakpoints.up('sm'));

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
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
        m: 0, p: 0,
        borderRadius: '0 !important',
      }}
    >

      {/* ══════════════════════════════════════════════════════════
          LEFT / MAIN PANEL
          xs  : 100% wide, full primary bg, text top + image bottom
          sm+ : 55–65% wide, side-by-side with right panel
      ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          width: { xs: '100%', sm: '55%', md: '60%', lg: '65%' },
          flexShrink: 0,
          bgcolor: 'primary.main',
          animation: anim('fadeIn', '0.4s', '0s'),
          display: 'flex',
          flexDirection: 'column',
          // xs: start from top so text + image fill the screen naturally
          // sm+: centre vertically as before
          justifyContent: { xs: 'flex-start', sm: 'center' },
          px: { xs: 3, sm: 4, md: '60px' },
          pt: { xs: '60px', sm: '72px', md: '52px' },
          pb: { xs: 0, sm: '100px', md: '140px' },
          borderRadius: '0 !important',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Ripple rings */}
        <Box sx={{
          position: 'absolute',
          width: { xs: 220, sm: 240, md: 300 },
          height: { xs: 220, sm: 240, md: 300 },
          borderRadius: '50% !important',
          border: '1px solid rgba(255,255,255,0.08)',
          // xs: centre of lower half where the circle sits
          top: { xs: '72%', sm: '50%' },
          left: { xs: '44%', sm: '40%', md: '30%' },
          transform: 'translate(-50%,-50%)',
          animation: 'ripple 4s ease-out 0.5s infinite',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute',
          width: { xs: 220, sm: 240, md: 300 },
          height: { xs: 220, sm: 240, md: 300 },
          borderRadius: '50% !important',
          border: '1px solid rgba(255,255,255,0.05)',
          top: { xs: '72%', sm: '50%' },
          left: { xs: '44%', sm: '40%', md: '30%' },
          transform: 'translate(-50%,-50%)',
          animation: 'ripple 4s ease-out 2s infinite',
          pointerEvents: 'none',
        }} />

        {/* ── Text block ── */}
        <Box sx={{ position: 'relative', zIndex: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              mb: 0.25,
              fontSize: { xs: '1rem', sm: '1rem', md: '1.05rem' },
              animation: anim('fadeSlideLeft', '0.55s', '0.15s'),
            }}
          >
            Welcome
          </Typography>

          {/* School name — shimmer */}
          <Box sx={{ mb: { xs: 1.5, sm: 2, md: 4 }, animation: anim('fadeSlideLeft', '0.6s', '0.28s') }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '1.8rem', md: '2.2rem', lg: '2.6rem' },
                background: 'linear-gradient(90deg, #FFD43B, #FFE082, #FFD43B, #FFC107)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear 1s infinite',
                display: 'inline-block',
                wordBreak: 'break-word',
              }}
            >
              {schoolName}
            </Typography>
          </Box>

          <Typography
            sx={{
              color: '#fff',
              fontSize: { xs: 24, sm: 18, md: 26, lg: 32 },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: { xs: 1.5, sm: 1.5, md: 3 },
              maxWidth: { xs: '100%', md: 460 },
              animation: anim('fadeUp', '0.65s', '0.42s'),
            }}
          >
            Let&apos;s get your school portal ready in a few easy steps.
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.6,
              maxWidth: { xs: '100%', md: 400 },
              fontSize: { xs: '0.88rem', sm: '0.82rem', md: '0.9rem' },
              animation: anim('fadeUp', '0.65s', '0.56s'),
            }}
          >
            From lesson planning to student engagement—everything in one place.
            Teach better. Manage easier.
          </Typography>

          {/* Bouncing dots */}
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 2, md: 4 }, animation: anim('fadeIn', '0.5s', '0.8s') }}>
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

        {/* ── Mobile circle + image (xs only) ──────────────────────
            Sits below the text, fills the remaining vertical space.
            Circle is centred, partially cropped at the bottom.
            Image overlaps the circle from above.
        ─────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: { xs: 'block', sm: 'none' },
            position: 'relative',
            width: '100%',
            flex: 1,          // take all remaining height below text
            minHeight: 260,
            mt: 3,
            overflow: 'visible',
          }}
        >
          {/* White circle — same gradient + shadow as desktop, shifted left */}
          <Box
            sx={{
              position: 'absolute',
              width: '88vw',
              height: '88vw',
              borderRadius: '50% !important',
              background: 'radial-gradient(circle, #ffffff 60%, #e8edf8 100%)',
              boxShadow: `0 8px 40px ${primary}1f`,
              bottom: '-25vw',
              // shifted left: anchor from left edge instead of centre
              left: '5vw',
              zIndex: 2,
              animation: anim('floatUp', '0.9s', '0.3s'),
              pointerEvents: 'none',
            }}
          />
          {/* Setup image — larger, overlaps circle from above, follows circle left shift */}
          <Box
            component="img"
            src={SetupImage}
            alt="School setup"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '5vw',
              height: '150%',
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom left',
              zIndex: 3,
              animation: anim('floatUp', '1s', '0.5s'),
            }}
          />
        </Box>

        {/* Powered by EduTAMS */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 14, sm: 16, md: 28 },
            left: { xs: 16, sm: 20, md: '60px' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 5,
            animation: anim('fadeIn', '0.6s', '1s'),
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: { xs: 10, md: 12 } }}>
            Powered by
          </Typography>
          <Box
            component="img"
            src={EduTAMSLogo}
            alt="EduTAMS"
            sx={{ height: { xs: 16, md: 20 }, filter: 'brightness(0) invert(1)', opacity: 0.75, objectFit: 'contain' }}
          />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          RIGHT PANEL  (sm+ only)
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          flex: 1,
          background: 'linear-gradient(160deg, #f0f4ff 0%, #e8edf8 100%)',
          borderRadius: '0 !important',
          position: 'relative',
        }}
      />

      {/* White circle — sm+ */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          width: { sm: '48vw', md: '42vw', lg: '38vw' },
          height: { sm: '48vw', md: '42vw', lg: '38vw' },
          borderRadius: '50% !important',
          background: 'radial-gradient(circle, #ffffff 60%, #e8edf8 100%)',
          boxShadow: `0 8px 40px ${primary}1f`,
          bottom: { sm: '-14vw', md: '-10vw', lg: '-8vw' },
          left: { sm: '30%', md: '36%', lg: '38%' },
          zIndex: 2,
          animation: anim('floatUp', '0.9s', '0.3s'),
        }}
      />

      {/* Setup image — sm+ */}
      <Box
        component="img"
        src={SetupImage}
        alt="School setup"
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          bottom: 0,
          left: { sm: '24%', md: '28%', lg: '30%' },
          height: { sm: '55%', md: '68%', lg: '75%' },
          objectFit: 'contain',
          objectPosition: 'bottom left',
          zIndex: 3,
        }}
      />

      {/* ══════════════════════════════════════════
          TOP CONTROLS BAR
          xs  : full-width bar over the primary panel
          sm+ : top-right corner, transparent bg
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, right: 0,
          left: { xs: 0, sm: 'auto' },
          zIndex: 10,
          display: 'flex',
          // xs: column so video pill stacks above help/logout
          flexDirection: 'column',
          alignItems: { xs: 'stretch', sm: 'flex-end' },
          gap: 0.75,
          px: { xs: 2, sm: 3 },
          pt: { xs: 1.25, sm: 2 },
          pb: { xs: 1.25, sm: 0 },
          bgcolor: { xs: 'rgba(0,0,0,0.18)', sm: 'transparent' },
          backdropFilter: { xs: 'blur(6px)', sm: 'none' },
          animation: anim('fadeIn', '0.5s', '0.2s'),
        }}
      >
        {/* Video pill — all breakpoints, full width on mobile */}
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
          <Box sx={{
            width: 32, height: 22,
            bgcolor: 'primary.main',
            borderRadius: '6px !important',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconVideo size={13} color="#fff" />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}>
            How to setup your Profile
          </Typography>
          <IconChevronRight size={15} color="#666" />
        </Box>

        {/* Help + Logout — right-aligned on mobile, right-aligned on desktop */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 0, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{
              fontSize: { xs: 11, sm: 13 },
              color: { xs: 'rgba(255,255,255,0.7)', sm: 'rgba(0,0,0,0.45)' },
            }}>
              Having Troubles?
            </Typography>
            <Link
              href="#"
              underline="hover"
              sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 700, color: { xs: '#FFD43B', sm: 'primary.main' } }}
            >
              Get Help
    \        </Link>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
          >
            <IconPower size={14} color="#e53935" />
            <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 600, color: '#e53935' }}>Logout</Typography>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          SPEECH BUBBLE + ARROW
          xs  : bottom-left, above the Start Setup button
          sm+ : bottom-right as before
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'absolute',
          // xs: sits above the bottom-left Start Setup button
          bottom: { xs: 68, sm: 80, md: 100, lg: 110 },
          right: { xs: 'auto', sm: 16, md: 20, lg: 28 },
          left: { xs: 16, sm: 'auto' },
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          animation: `${anim('fadeUp', '0.7s', '1.2s')}, bounce 2.4s ease-in-out 2.2s infinite`,
          pointerEvents: 'none',
        }}
      >
        <Box sx={{
          bgcolor: '#fff',
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: '14px !important',
          px: 2, py: 1.25,
          boxShadow: `0 6px 24px ${primary}22`,
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap', letterSpacing: 0.2 }}>
            🚀 Ready? Click to get started!
          </Typography>
        </Box>
        {/* Arrow — flip direction on mobile */}
        <Box sx={{ ml: { xs: 2, sm: 0 }, mr: { xs: 0, sm: 4 }, mt: 0.5 }}>
          <svg
            width="48" height="52" viewBox="0 0 48 52" fill="none"
            style={{ transform: isSideBySide ? 'none' : 'scaleX(-1)' }}
          >
            <path d="M8 4 C4 22, 20 36, 40 46" stroke={primary} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M30 44 L40 46 L36 36" stroke={primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          START SETUP BUTTON
          xs  : bottom-left, primary colour
          sm+ : bottom-right as before
      ══════════════════════════════════════════ */}
      <Box
        onClick={handleStartSetup}
        sx={{
          position: 'absolute',
          bottom: { xs: 16, sm: 20, md: 24, lg: 28 },
          right: { xs: 'auto', sm: 16, md: 20, lg: 28 },
          left: { xs: 16, sm: 'auto' },
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'primary.main',
          px: 3, py: 1.25,
          borderRadius: '12px !important',
          boxShadow: `0px 4px 20px ${primary}66`,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          animation: anim('fadeUp', '0.6s', '0.75s'),
          '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-3px)', boxShadow: `0px 8px 28px ${primary}80` },
          '&:active': { transform: 'translateY(-1px)' },
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
          Start Setup
        </Typography>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26,
          borderRadius: '50% !important',
          bgcolor: 'rgba(255,255,255,0.2)',
          transition: 'transform 0.2s',
          '.MuiBox-root:hover &': { transform: 'translateX(3px)' },
        }}>
          <IconArrowRight size={15} color="#fff" />
        </Box>
      </Box>

    </Box>
  );
};

export default SetupWelcome;
