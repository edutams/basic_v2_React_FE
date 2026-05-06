import React, { useContext, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import {
  Groups as GroupsIcon,
  AccountBalanceWallet as WalletIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
} from '@mui/icons-material';
import AdmissionBatchModal from 'src/components/tenant-components/admission/AdmissionBatchModal';

const StatCard = ({ count, label, icon: Icon, color = 'primary', loading }) => (
  <Paper
    sx={{
      borderRadius: 2,
      p: 3,
      flex: 1,
      minWidth: { xs: '100%', sm: 200 },
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={22} color={color} />
    </Box>

    <Box sx={{ textAlign: 'center' }}>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography fontSize={26} fontWeight={700}>
            {count}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {label}
          </Typography>
        </>
      )}
    </Box>
  </Paper>
);

// ── Admission Banner ──────────────────────────────────────────────────────────
const AdmissionBanner = ({ session, onApply }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const leftPanelBg = `linear-gradient(90deg, #020411 0%, ${primary} 100%)`;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        mb: 3,
        overflow: 'hidden',
        background: leftPanelBg,
        color: '#fff',
        p: { xs: 2.5, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {/* Left: icon + text */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '1px solid #FFFBB7',
            bgcolor: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
        </Box>

        <Box>
          {session && (
            <Chip
              label={`Session ${session}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                mb: 0.5,
                fontWeight: 600,
              }}
            />
          )}

          <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
            Admission is now open!
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Apply for your child today. Application closes Oct 30, 2025.
          </Typography>
        </Box>
      </Box>

      {/* Right: CTA */}
      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={onApply}
        sx={{
          bgcolor: '#fff',
          color: 'primary.main',
          fontWeight: 700,
          borderRadius: 2,
          px: 3,
          // '&:hover': { bgcolor: '#e8eaf6' },
          whiteSpace: 'nowrap',
        }}
      >
        Apply Now
      </Button>
    </Paper>
  );
};

// ── Enrolled Ward Card ────────────────────────────────────────────────────────
const EnrolledWardCard = ({ ward }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}
  >
    <Avatar src={ward.avatar} sx={{ width: 40, height: 40 }}>
      {ward.name?.[0]}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" fontWeight={700} noWrap>
        {ward.name}
      </Typography>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.3}>
        {ward.tags?.map((t) => (
          <Chip
            key={t}
            label={t}
            size="small"
            sx={{ fontSize: 10, bgcolor: '#E7F3D4', color: '#000000', fontWeight: 600 }}
          />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {ward.regNo}
      </Typography>
    </Box>
    <Box sx={{ textAlign: 'left', flexShrink: 0 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Compulsory: <strong>₦{ward.compulsory?.toLocaleString()}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Optional: <strong>₦{ward.optional?.toLocaleString()}</strong>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#E28327' }}>
            Total Payable
          </Typography>

          <Box
            sx={{
              mt: 0.5,
              px: 1.5,
              bgcolor: '#C5A07A',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '0.75rem',
            }}
          >
            ₦ {ward.total?.toLocaleString()}
          </Box>
        </Box>
      </Box>
    </Box>

    <Button
      size="small"
      endIcon={<ArrowForwardIcon />}
      sx={{ ml: 1, whiteSpace: 'nowrap', fontSize: '0.75rem' }}
    >
      View Details
    </Button>
  </Paper>
);

// ── Admission Step ────────────────────────────────────────────────────────────
const STEPS = ['Applied', 'E-Exam', 'Admitted', 'Enrolled'];

const AdmissionSteps = ({ currentStep }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mt: 1.5, mb: 1 }}>
    {STEPS.map((step, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      return (
        <React.Fragment key={step}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: done || active ? 'primary.main' : 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {done ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />
              ) : (
                <PendingIcon sx={{ fontSize: 18, color: active ? '#fff' : 'grey.400' }} />
              )}
            </Box>
            <Typography
              variant="caption"
              color={done || active ? 'primary.main' : 'text.disabled'}
              mt={0.5}
            >
              {step}
            </Typography>
          </Box>
          {i < STEPS.length - 1 && (
            <Box
              sx={{
                flex: 1,
                height: 2,
                bgcolor: done ? 'primary.main' : 'grey.200',
                mb: 2.5,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

// ── Prospective Ward Card ─────────────────────────────────────────────────────
const ProspectiveWardCard = ({ ward }) => {
  const [expanded, setExpanded] = React.useState(ward.expanded ?? false);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            // bgcolor: ward.avatarBg || 'primary.light',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {ward.initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {ward.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {ward.class} · Application #{ward.applicationNo}
          </Typography>
        </Box>

        <Chip
          icon={
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: ward.status === 'Admitted' ? 'success.main' : 'warning.main',
                ml: 0.5,
              }}
            />
          }
          label={ward.status}
          size="small"
          sx={{
            bgcolor: ward.status === 'Admitted' ? '#E8F5E9' : '#FFF4E5',
            color: ward.status === 'Admitted' ? 'success.dark' : 'warning.dark',
            fontWeight: 600,
            fontSize: 11,
          }}
        />
        <IconButton size="small">
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Expanded detail */}
      {expanded && (
        <Box sx={{ px: 2, pb: 2 }}>
          <AdmissionSteps currentStep={ward.step ?? 2} />
          {ward.actionLabel && (
            <Paper
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#FFF8F0',
                border: '1px solid',
                borderColor: '#FFD8AB',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#FFD8AB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ color: '#EF9146', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {ward.actionLabel}
                  </Typography>
                  {ward.actionDue && (
                    <Typography variant="caption" color="text.secondary">
                      Due {ward.actionDue}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                // color="warning"
                sx={{ borderRadius: 1, fontWeight: 700 , bgcolor:"#EF9146", fontSize: '0.75rem'}}
              >
                Pay now
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </Paper>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const ParentDashboard = () => {
  const navigate = useNavigate();
  const { tenantInfo } = useContext(TenantAuthContext);

  const session = tenantInfo?.academic_session || '2025/2026';

  // Admission batch modal state
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  const handleApplyAdmission = (batch) => {
    console.log('Selected batch:', batch);
    // TODO: Navigate to admission application form with selected batch
    // navigate('/admission/apply', { state: { batch } });
  };

  // Placeholder data — replace with real API calls
  const enrolledWards = [
    {
      id: 1,
      name: 'Blessing Okafor',
      avatar: null,
      tags: ['ESA/02 | JSS 2A'],
      regNo: 'FAH/2025/098',
      compulsory: 30000,
      optional: 10000,
      total: 40000,
    },
    {
      id: 2,
      name: 'Blessing Okafor',
      avatar: null,
      tags: ['ESA/02 | JSS 2A'],
      regNo: 'FAH/2025/098',
      compulsory: 30000,
      optional: 10000,
      total: 40000,
    },
  ];

  const prospectiveWards = [
    {
      id: 1,
      name: 'Chinaza Okafor',
      initials: 'JD',
      avatarBg: '#E8EAF6',
      class: 'JSS1',
      applicationNo: 'A-10428',
      status: 'Exam Scheduled',
      step: 1,
      expanded: false,
    },
    {
      id: 2,
      name: 'Chinaza Okafor',
      initials: 'CO',
      avatarBg: '#E0F2F1',
      class: 'JSS 1',
      applicationNo: 'A-10428',
      status: 'Admitted',
      step: 2,
      expanded: true,
      actionLabel: 'Pay acceptance fee · ₦35,000',
      actionDue: 'Sep 5, 2023 to confirm enrollment',
    },
  ];

  return (
    <PageContainer title="Parent Dashboard" description="Parent portal">
      {/* ── Admission Banner ── */}
      <AdmissionBanner session={session} onApply={() => setAdmissionModalOpen(true)} />

      {/* ── Stat Cards ── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard
            icon={GroupsIcon}
            iconBg="#E8F5E9"
            count={enrolledWards.length}
            label="Enrolled Ward"
          />
          <StatCard
            icon={GroupsIcon}
            iconBg="#E8F5E9"
            count={prospectiveWards.length}
            label="Prospective ward"
          />
          <StatCard icon={WalletIcon} iconBg="#E8F5E9" count="₦35,000" label="Outstanding Fees" />
          <StatCard icon={WalletIcon} iconBg="#E8F5E9" count="₦35,000" label="Wallet Balance" />

          {/*             
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              flex: 1,
              minWidth: { xs: '100%', sm: 200 },
            }}
          >
            <Typography variant="caption" color="warning.main" fontWeight={700}>
              Wallet Balance
            </Typography>
            <Chip
              label="₦ 40,000:00"
              size="small"
              sx={{
                bgcolor: '#FFF3E0',
                color: 'warning.dark',
                fontWeight: 700,
                display: 'flex',
                mt: 0.5,
                mb: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Wallet Account
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                987123793
              </Typography>
              <IconButton size="small">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Globus Bank
            </Typography>
          </Paper> */}
        </Stack>
      </Box>

      {/* ── Main content grid ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ borderRadius: 3, p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Enrolled Ward
              </Typography>
              <Chip
                label={`${session} — 2nd Term`}
                size="small"
                sx={{
                  bgcolor: '#F1F4F1',
                  color: '#000000',
                  fontWeight: 500,
                }}
              />
            </Box>
            <Stack spacing={1.5}>
              {enrolledWards.map((ward) => (
                <EnrolledWardCard key={ward.id} ward={ward} />
              ))}
            </Stack>
          </Paper>

          <Paper
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: '#fff' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Check Your Ward Result
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  View Academic Performance For All Wards
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#FFD600',
                color: '#1a1a1a',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#FFC400' },
                whiteSpace: 'nowrap',
              }}
            >
              Access
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ borderRadius: 3, p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Prospective
              </Typography>
              <Chip
                label={`${session} — 2nd Term Admission`}
                size="small"
                sx={{ bgcolor: '#F1F4F1', color: '#000000', fontWeight: 500 }}
              />
            </Box>
            {prospectiveWards.map((ward) => (
              <ProspectiveWardCard key={ward.id} ward={ward} />
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Admission Batch Modal ── */}
      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApplyAdmission}
      />
    </PageContainer>
  );
};

export default ParentDashboard;
