import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Link } from '@mui/material';
import { IconVideo, IconChevronRight, IconPower } from '@tabler/icons-react';
import { TenantAuthContext } from '../../context/TenantContext/auth';
import EduTAMSLogo from '../../assets/images/logos/EduTAMS.png';
import SetupImage from '../../assets/images/setup/setup.png';

const SetupWelcome = () => {
  const navigate = useNavigate();
  const { tenantInfo, logout } = useContext(TenantAuthContext);

  const schoolName = tenantInfo?.tenant_name || tenantInfo?.name || 'Your School';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStartSetup = () => {
    navigate('/school-profile?stage=1');
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        m: 0,
        p: 0,
        borderRadius: '0 !important',
      }}
    >
      {/* ── LEFT panel: primary color, ~65% width ── */}
      <Box
        sx={{
          width: '65%',
          flexShrink: 0,
          bgcolor: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, md: '60px' },
          py: { xs: 4, md: '52px' },
          pb: { md: '140px' },
          borderRadius: '0 !important',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box>
          <Typography variant='h5' sx={{ color: 'rgba(255,255,255,0.88)', mb: 0.25 }}>
            Welcome
          </Typography>
          <Typography variant='h1' sx={{ color: '#FFD43B',fontWeight: 600, mb: 4 }}>
            {schoolName}
          </Typography>

          <Typography
            sx={{
              color: '#fff',
              fontSize: { xs: 26, md: 42 },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 3,
              maxWidth: 460,
            }}
          >
            Let&apos;s get your school portal ready in a few easy steps.
          </Typography>

          <Typography variant='h6' color='grey.100' 
            sx={{
              lineHeight: 1.7,
              maxWidth: 400,
            }}
          >
            From lesson planning to student engagement—everything in one place.
            Teach better. Manage easier.
          </Typography>
        </Box>

        {/* Powered by EduTAMS — pinned to bottom of left panel */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 28,
            left: { xs: 4, md: '60px' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            Powered by
          </Typography>
          <Box
            component="img"
            src={EduTAMSLogo}
            alt="EduTAMS"
            sx={{
              height: 20,
              filter: 'brightness(0) invert(1)',
              opacity: 0.8,
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>

      {/* ── RIGHT panel: white/light, ~35% width ── */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f0f0f0',
          borderRadius: '0 !important',
          position: 'relative',
        }}
      />

      {/* ── White circle — behind the kids image ── */}
      <Box
        sx={{
          position: 'absolute',
          width: '38vw',
          height: '38vw',
          borderRadius: '50% !important',
          bgcolor: '#fff',
          bottom: '-8vw',
          left: '38%',
          zIndex: 2,
        }}
      />

      <Box
        component="img"
        src={SetupImage}
        alt="School setup"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '36%',
          height: '60%',
          objectFit: 'contain',
          objectPosition: 'bottom left',
          zIndex: 3,
        }}
      />

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
          px: 3,
          pt: 2,
        }}
      >
        {/* Row 1: Having Troubles + Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
              Having Troubles?
            </Typography>
            <Link
              href="#"
              underline="hover"
              sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main' }}
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
            <IconPower size={15} color="#e53935" />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e53935' }}>
              Logout
            </Typography>
          </Box>
        </Box>

        {/* Row 2: How to setup pill */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.6,
            bgcolor: '#fff',
            borderRadius: '10px !important',
            boxShadow: '0px 3px 14px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            '&:hover': { boxShadow: '0px 5px 18px rgba(0,0,0,0.18)' },
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
              flexShrink: 0,
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

      {/* ── Start Setup button — bottom right ── */}
      <Box
        onClick={handleStartSetup}
        sx={{
          position: 'absolute',
          bottom: 24,
          right: 28,
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: '#fff',
          px: 2.5,
          py: 1,
          borderRadius: '10px !important',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'primary.main',
            borderColor: 'primary.main',
            '& .start-label': { color: '#fff' },
            '& svg': { color: '#fff !important' },
          },
        }}
      >
        <Typography
          className="start-label"
          sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
        >
          Start Setup
        </Typography>
        <IconChevronRight size={16} color="#333" />
      </Box>
    </Box>
  );
};

export default SetupWelcome;
