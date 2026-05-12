import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import {
  IconVideo,
  IconChevronRight,
  IconPower,
  IconArrowLeft,
} from '@tabler/icons-react';
import { TenantAuthContext } from '../../../context/TenantContext/auth';
import SetupIllustration from '../../../assets/images/setup/setup.png';

// ── Keyframes ────────────────────────────────────────────────────────────────
const keyframes = {
  '@keyframes fadeSlideLeft': {
    from: { opacity: 0, transform: 'translateX(-32px)' },
    to:   { opacity: 1, transform: 'translateX(0)' },
  },
  '@keyframes fadeUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to:   { opacity: 1 },
  },
  '@keyframes floatUp': {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '40%':      { transform: 'translateY(-6px)' },
    '60%':      { transform: 'translateY(-3px)' },
  },
};

const anim = (name, duration = '0.55s', delay = '0s') =>
  `${name} ${duration} cubic-bezier(0.22,1,0.36,1) ${delay} both`;

/**
 * Shared full-viewport shell used by every setup stage.
 * Props:
 *  - stage        : current stage number (1-based)
 *  - totalStages  : total number of stages (drives the dot indicators)
 *  - onBack       : called when Back is clicked
 *  - onSkip       : called when Skip is clicked
 *  - onSaveAndContinue : called when Save & Continue is clicked
 *  - saving       : disables the Save & Continue button while true
 *  - backLabel    : optional override for the Back button label
 *  - noPadding    : removes px/pt from the content area (for stages with their own layout)
 *  - children     : the stage content rendered in the right panel
 */
const SetupShell = ({
  children,
  stage,
  totalStages,
  onBack,
  onSkip,
  onSaveAndContinue,
  saving = false,
  backLabel,
  noPadding = false,
  leftVariant = 'light', 
  leftImage,             
  leftTitle = 'Build a smarter school experience in minutes.',
  leftSubtitle = 'From lesson planning to student engagement—everything in one place. Teach better. Manage easier.',
}) => {
  const navigate = useNavigate();
  const { logout } = useContext(TenantAuthContext);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        overflow: 'hidden',
        m: 0,
        p: 0,
        borderRadius: '0 !important',
      }}
    >
      {/* ── LEFT panel — hidden on mobile ── */}
      <Box
        sx={{
          ...keyframes,
          display: { xs: 'none', sm: 'flex' },
          width: '32%',
          flexShrink: 0,
          bgcolor: leftVariant === 'dark' ? 'primary.main' : '#fff',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, md: '40px' },
          py: { xs: 4, md: '52px' },
          borderRadius: '0 !important',
          position: 'relative',
          overflow: 'hidden',
          borderRight: leftVariant === 'dark' ? 'none' : '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          sx={{
            color: leftVariant === 'dark' ? '#fff' : 'primary.main',
            fontSize: { xs: 24, md: 32 },
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 2.5,
            maxWidth: 280,
            animation: anim('fadeSlideLeft', '0.55s', '0.1s'),
          }}
        >
          {leftTitle}
        </Typography>

        <Typography
          sx={{
            color: leftVariant === 'dark' ? 'rgba(255,255,255,0.72)' : 'text.secondary',
            fontSize: 13,
            lineHeight: 1.7,
            maxWidth: 280,
            animation: anim('fadeUp', '0.55s', '0.25s'),
          }}
        >
          {leftSubtitle}
        </Typography>

        {/* Stage progress dots */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 4,
            animation: anim('fadeIn', '0.5s', '0.4s'),
          }}
        >
          {Array.from({ length: totalStages }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i + 1 === stage ? 20 : 8,
                height: 8,
                borderRadius: '4px !important',
                bgcolor: i + 1 === stage
                  ? (leftVariant === 'dark' ? '#fff' : 'primary.main')
                  : (leftVariant === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)'),
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>

        {/* Two concentric semicircles + illustration */}
        {leftVariant === 'light' && (
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pointerEvents: 'none',
          }}>
            {/* Outer semicircle */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '92%',
                paddingBottom: '46%',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0 !important',
                bgcolor: 'primary.light',
                animation: anim('fadeIn', '0.6s', '0.3s'),
              }}
            />
            {/* Inner semicircle  */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '72%',
                paddingBottom: '36%',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0 !important',
                bgcolor: 'primary.main',
                animation: anim('fadeIn', '0.6s', '0.4s'),
              }}
            />
            {/* Illustration centered on inner circle */}
            <Box
              component="img"
              src={leftImage || SetupIllustration}
              alt="Setup illustration"
              sx={{
                position: 'relative',
                zIndex: 2,
                width: '75%',
                maxHeight: '50%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                animation: anim('floatUp', '0.8s', '0.5s'),
              }}
            />
          </Box>
        )}

        {leftVariant === 'dark' && (
          <Box
            component="img"
            src={leftImage || SetupIllustration}
            alt="Setup illustration"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              maxHeight: '38%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              zIndex: 2,
              animation: anim('floatUp', '0.8s', '0.5s'),
            }}
          />
        )}
      </Box>

      {/* ── RIGHT panel ── */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 !important',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── TOP-RIGHT CONTROLS — matches SetupWelcome pattern ── */}
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
              <Typography sx={{ fontSize: { xs: 11, md: 13 }, color: 'rgba(0,0,0,0.5)' }}>
                Having Troubles?
              </Typography>
              <Link
                href="#"
                underline="hover"
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

          {/* "How to setup" pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.6,
              bgcolor: '#fff',
              borderRadius: '10px !important',
              boxShadow: '0px 3px 14px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: '0px 6px 20px rgba(0,0,0,0.12)', transform: 'translateY(-1px)' },
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
              sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}
            >
              How to setup your Profile
            </Typography>
            <IconChevronRight size={15} color="#666" />
          </Box>
        </Box>

        {/* Stage content area */}
        <Box
          sx={{
            flex: 1,
            overflow: noPadding ? { xs: 'auto', sm: 'hidden' } : 'auto',
            overflowY: noPadding ? { xs: 'auto', sm: 'hidden' } : 'auto',
            px: noPadding ? 0 : { xs: 2, sm: 3, md: '60px' },
            pt: noPadding ? 0 : { xs: '80px', sm: '85px', md: '90px' },
            pb: noPadding ? 0 : 2,
          }}
        >
          {children}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 2, sm: 3, md: '60px' },
            py: 2.5,
            bgcolor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            size="small"
            startIcon={<IconArrowLeft size={16} />}
            onClick={onBack}
            sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', textTransform: 'none' }}
          >
            {backLabel || 'Back'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* <Button
              size="small"
              onClick={onSkip}
              sx={{ fontSize: 14, fontWeight: 600, color: 'primary.main' }}
            >
              Skip
            </Button> */}
            <Button
              size="small"
              variant="contained"
              endIcon={<IconChevronRight size={16} />}
              onClick={onSaveAndContinue}
              disabled={saving}
              sx={{
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '8px !important',
              }}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SetupShell;
