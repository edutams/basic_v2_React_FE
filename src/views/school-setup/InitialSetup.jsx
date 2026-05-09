import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  IconVideo,
  IconChevronRight,
  IconPower,
  IconArrowLeft,
  IconUpload,
  IconPhoto,
} from '@tabler/icons-react';
import { getTenantInfo } from '../../api/tenant_api';
import { getFullImageUrl } from '../../helpers/ImageHelper';
import { TenantAuthContext } from '../../context/TenantContext/auth';
import SetupIllustration from '../../assets/images/setup/setup.png';
import SetCalendarTab from './tabs/SetCalendarTab';
import { useNotification } from '../../hooks/useNotification';
import UploadLogoModal from '../../components/tenant-components/school/UploadLogoModal';

// ── Shared layout shell ──────────────────────────────────────────────────────
const SetupShell = ({ children, onBack, onSkip, onSaveAndContinue, saving, backLabel, stage, totalStages, noPadding }) => {
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
        overflow: 'hidden',
        position: 'relative',
        m: 0,
        p: 0,
        borderRadius: '0 !important',
      }}
    >
      {/* LEFT panel */}
      <Box
        sx={{
          width: '32%',
          flexShrink: 0,
          bgcolor: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, md: '40px' },
          py: { xs: 4, md: '52px' },
          pb: { md: '120px' },
          borderRadius: '0 !important',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{ color: '#fff', fontSize: { xs: 24, md: 32 }, fontWeight: 800, lineHeight: 1.2, mb: 2.5, maxWidth: 280 }}
        >
          Build a smarter school experience in minutes.
        </Typography>
        <Typography
          sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}
        >
          From lesson planning to student engagement—everything in one place.
          Teach better. Manage easier.
        </Typography>

        {/* Stage indicator dots */}
        <Box sx={{ display: 'flex', gap: 1, mt: 4 }}>
          {Array.from({ length: totalStages }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i + 1 === stage ? 20 : 8,
                height: 8,
                borderRadius: '4px !important',
                bgcolor: i + 1 === stage ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>

        {/* Illustration pinned to bottom */}
        <Box
          component="img"
          src={SetupIllustration}
          alt="Setup illustration"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            maxHeight: '38%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
          }}
        />
      </Box>

      {/* RIGHT panel */}
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0 !important',
          overflow: 'hidden',
        }}
      >
        {/* Top-right controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.75,
            px: 3,
            pt: 2,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Having Troubles?</Typography>
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
              px: 1.5,
              py: 0.6,
              bgcolor: '#fff',
              borderRadius: '10px !important',
              boxShadow: '0px 3px 14px rgba(0,0,0,0.12)',
              cursor: 'pointer',
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
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}>
              How to setup your Profile
            </Typography>
            <IconChevronRight size={15} color="#666" />
          </Box>
        </Box>

        {/* Stage content */}
        <Box sx={{ flex: 1, overflow: noPadding ? 'hidden' : 'auto', overflowY: noPadding ? 'hidden' : 'auto', px: noPadding ? 0 : { xs: 3, md: '60px' }, pt: noPadding ? 0 : 4, pb: 2 }}>
          {children}
        </Box>

        {/* Bottom action bar */}
        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 3, md: '60px' },
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
            size='small'
            startIcon={<IconArrowLeft size={16} />}
            onClick={onBack}
            sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', textTransform: 'none', }}
          >
            {backLabel || 'Back'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button size='small'
              onClick={onSkip}
              sx={{ fontSize: 14, fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
            >
              Skip
            </Button>
            <Button
              size='small'
              variant="contained"
              endIcon={<IconChevronRight size={16} />}
              onClick={onSaveAndContinue}
              disabled={saving}
              sx={{ fontSize: 14, fontWeight: 600, textTransform: 'none', px: 3, py: 1, borderRadius: '8px !important' }}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Stage 1: School Profile ──────────────────────────────────────────────────
const Stage1 = ({ onNext, onBack, onSkip }) => {
  const { refreshTenantInfo } = useContext(TenantAuthContext);
  const notify = useNotification();
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    getTenantInfo()
      .then((res) => {
        const d = res.data;
        setTenantData({ name: d.tenant_name || '', shortName: d.tenant_short_name || '', address: d.address || '' });
        setLogo(getFullImageUrl(d.school_logo));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUploaded = (newLogoUrl) => {
    setLogo(newLogoUrl);
    refreshTenantInfo();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SetupShell onBack={onBack} onSkip={onSkip} onSaveAndContinue={handleSave} saving={saving} stage={1} totalStages={3}>
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 1 }}>
        Set Up Your School Profile
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 4, maxWidth: 480, lineHeight: 1.6 }}>
        Upload your school logo and check your school details. If the details are incorrect click{' '}
        <Link href="#" sx={{ fontWeight: 600, color: 'primary.main' }}>(Get Help)</Link>{' '}
        to make a complaint.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          {/* Logo upload */}
          <Box sx={{ flexShrink: 0 }}>
            <Box
              onClick={() => setLogoModalOpen(true)}
              sx={{
                width: 160, height: 160,
                border: '1.5px dashed', borderColor: 'divider',
                borderRadius: '12px !important', bgcolor: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              {logo
                ? <Box component="img" src={logo} alt="School logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <IconPhoto size={48} color="#bbb" strokeWidth={1} />
              }
            </Box>
            <Box
              onClick={() => setLogoModalOpen(true)}
              sx={{
                mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                borderRadius: '8px !important', py: 0.75, bgcolor: '#fff',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <IconUpload size={15} color="#555" />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>Browse</Typography>
            </Box>
          </Box>

          {/* Fields */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {[
              { label: 'School Name', value: tenantData?.name, placeholder: 'Enter School Name' },
              { label: 'Acronym', value: tenantData?.shortName, placeholder: 'e.g. GSS' },
            ].map(({ label, value, placeholder }) => (
              <Box key={label}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>{label}</Typography>
                <TextField fullWidth placeholder={placeholder} value={value || ''} InputProps={{ readOnly: true }} sx={{ bgcolor: '#fff' }} />
              </Box>
            ))}
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75, color: 'text.primary' }}>Address</Typography>
              <TextField fullWidth placeholder="Enter school address" value={tenantData?.address || ''} InputProps={{ readOnly: true }} multiline rows={3} sx={{ bgcolor: '#fff' }} />
            </Box>
          </Box>
        </Box>
      )}

      <UploadLogoModal
        open={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
        onUploaded={handleLogoUploaded}
      />
    </SetupShell>
  );
};

// ── Stage 2: Manage Sessions ─────────────────────────────────────────────────
const Stage2 = ({ onNext, onBack, onSkip }) => {
  return (
    <SetupShell
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      saving={false}
      stage={2}
      totalStages={3}
      noPadding
    >
      <Box sx={{ px: { xs: 3, md: '60px' }, pt: 4, pb: 1 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Manage Sessions
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
          Select the session and subscribe
        </Typography>
      </Box>
      <SetCalendarTab onSaveAndContinue={onNext} />
    </SetupShell>
  );
};

// ── Stage 3: Confirm School Head / Admin Detail ──────────────────────────────
const Stage3 = ({ onNext, onBack, onSkip }) => {
  const [admins, setAdmins] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantInfo()
      .then((res) => {
        const d = res.data;
        setAdmins({
          owner: {
            title: 'School Owner Detail',
            lastName:   d.administrator_info?.school_owner?.school_owner_last_name  || '',
            firstName:  d.administrator_info?.school_owner?.school_owner_first_name || '',
            otherName:  d.administrator_info?.school_owner?.school_owner_middle_name || '',
            phone:      d.administrator_info?.school_owner?.school_owner_phone       || '',
            email:      d.administrator_info?.school_owner?.school_owner_email       || '',
          },
          head: {
            title: 'School Head Detail',
            lastName:   d.administrator_info?.school_head?.school_head_last_name   || '',
            firstName:  d.administrator_info?.school_head?.school_head_first_name  || '',
            otherName:  d.administrator_info?.school_head?.school_head_middle_name || '',
            phone:      d.administrator_info?.school_head?.school_head_phone       || '',
            email:      d.administrator_info?.school_head?.school_head_email       || '',
          },
          spa: {
            title: 'Portal Admin',
            lastName:   d.administrator_info?.school_spa?.admin_last_name   || '',
            firstName:  d.administrator_info?.school_spa?.admin_first_name  || '',
            otherName:  d.administrator_info?.school_spa?.admin_middle_name || '',
            phone:      d.administrator_info?.school_spa?.admin_phone       || '',
            email:      d.administrator_info?.school_spa?.admin_email       || '',
          },
        });
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const adminList = admins ? [admins.owner, admins.head, admins.spa] : [];

  const fieldRow = (label, value) => (
    <Box key={label}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 0.4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={value || ''}
        slotProps={{ input: { readOnly: true } }}
        sx={{ bgcolor: '#fff' }}
      />
    </Box>
  );

  return (
    <SetupShell onBack={onBack} onSkip={onSkip} onSaveAndContinue={onNext} saving={false} stage={3} totalStages={3}>
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
        Confirm School Head/Admin Detail
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
        Confirm your school owner details. If the details are incorrect click{' '}
        <Link href="#" sx={{ fontWeight: 700, color: 'primary.main' }}>Get Help</Link>
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
          {adminList.map((admin) => (
            <Box
              key={admin.title}
              sx={{
                flex: '1 1 260px',
                bgcolor: '#fff',
                borderRadius: '12px !important',
                border: '1px solid',
                borderColor: 'divider',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Card header */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '20px !important',
                  alignSelf: 'flex-start',
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 18, height: 18,
                    borderRadius: '50% !important',
                    bgcolor: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                  }}
                >
                  i
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{admin.title}</Typography>
              </Box>

              {fieldRow('Surname',    admin.lastName)}
              {fieldRow('First Name', admin.firstName)}
              {fieldRow('Other Name', admin.otherName)}
              {fieldRow('Phone',      admin.phone)}
              {fieldRow('Email',      admin.email)}
            </Box>
          ))}
        </Box>
      )}
    </SetupShell>
  );
};

// ── Main controller ──────────────────────────────────────────────────────────
const InitialSetup = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stage = parseInt(searchParams.get('stage') || '1', 10);

  const goToStage = (n) => setSearchParams({ stage: n });
  const goNext = () => goToStage(stage + 1);
  const goBack = () => {
    if (stage <= 1) navigate('/setup-welcome');
    else goToStage(stage - 1);
  };
  const goSkip = () => {
    navigate('/complete-setup');
  };

  // Stage routing — add more stages here as you build them
  if (stage === 1) {
    return <Stage1 onNext={goNext} onBack={goBack} onSkip={goSkip} />;
  }

  if (stage === 2) {
    return <Stage2 onNext={goNext} onBack={goBack} onSkip={goSkip} />;
  }

  if (stage === 3) {
    return <Stage3 onNext={() => navigate('/complete-setup')} onBack={goBack} onSkip={goSkip} />;
  }

  // Fallback
  navigate('/complete-setup');
  return null;
};

export default InitialSetup;
