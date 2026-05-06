import { useContext, useState } from 'react';
import { Box, Grid, Typography, Paper, Button, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import { Groups as GroupsIcon, AccountBalanceWallet as WalletIcon, School as SchoolIcon } from '@mui/icons-material';

import StatCard from 'src/components/shared/StatCard';
import AdmissionBanner from 'src/components/tenant-components/admission/AdmissionBanner';
import EnrolledWardCard from 'src/components/tenant-components/admission/EnrolledWardCard';
import ProspectiveWardCard from 'src/components/tenant-components/admission/ProspectiveWardCard';
import AdmissionBatchModal from 'src/components/tenant-components/admission/AdmissionBatchModal';

const ENROLLED_WARDS = [
  { id: 1, name: 'Blessing Okafor', avatar: null, tags: ['ESA/02 | JSS 2A'], regNo: 'FAH/2025/098', compulsory: 30000, optional: 10000, total: 40000 },
  { id: 2, name: 'Blessing Okafor', avatar: null, tags: ['ESA/02 | JSS 2A'], regNo: 'FAH/2025/098', compulsory: 30000, optional: 10000, total: 40000 },
];

const PROSPECTIVE_WARDS = [
  { id: 1, name: 'Chinaza Okafor', initials: 'JD', class: 'JSS1', applicationNo: 'A-10428', status: 'Exam Scheduled', step: 1, expanded: false },
  { id: 2, name: 'Chinaza Okafor', initials: 'CO', class: 'JSS 1', applicationNo: 'A-10428', status: 'Admitted', step: 2, expanded: true, actionLabel: 'Pay acceptance fee · ₦35,000', actionDue: 'Sep 5, 2023 to confirm enrollment' },
];

// ── Dashboard 
const ParentDashboard = () => {
  const navigate = useNavigate();
  const { tenantInfo } = useContext(TenantAuthContext);

  const session = tenantInfo?.academic_session || '2025/2026';
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  const handleApplyAdmission = (batch) => {
    navigate('/admission/new-application', { state: { batch } });
  };

  return (
    <PageContainer title="Parent Dashboard" description="Parent portal">

      <AdmissionBanner session={session} onApply={() => setAdmissionModalOpen(true)} />

      {/* ── Stat Cards ── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard icon={GroupsIcon} count={ENROLLED_WARDS.length}    label="Enrolled Ward"     />
          <StatCard icon={GroupsIcon} count={PROSPECTIVE_WARDS.length} label="Prospective Ward"  />
          <StatCard icon={WalletIcon} count="₦35,000"                  label="Outstanding Fees"  />
          <StatCard icon={WalletIcon} count="₦35,000"                  label="Wallet Balance"    />
        </Stack>
      </Box>

      <Grid container spacing={3}>

        <Grid size={{ xs: 12, lg: 7 }}>

          {/* Enrolled wards */}
          <Paper sx={{ borderRadius: 3, p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Enrolled Ward</Typography>
              <Chip
                label={`${session} — 2nd Term`}
                size="small"
                sx={{ bgcolor: '#F1F4F1', color: '#000', fontWeight: 500 }}
              />
            </Box>
            <Stack spacing={1.5}>
              {ENROLLED_WARDS.map((ward) => (
                <EnrolledWardCard key={ward.id} ward={ward} />
              ))}
            </Stack>
          </Paper>

          {/* Results banner */}
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
                <Typography variant="subtitle1" fontWeight={700}>Check Your Ward Result</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  View Academic Performance For All Wards
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{ bgcolor: '#FFD600', color: '#1a1a1a', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#FFC400' }, whiteSpace: 'nowrap' }}
            >
              Access
            </Button>
          </Paper>
        </Grid>

        {/* Prospective wards */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ borderRadius: 3, p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Prospective</Typography>
              <Chip
                label={`${session} — 2nd Term Admission`}
                size="small"
                sx={{ bgcolor: '#F1F4F1', color: '#000', fontWeight: 500 }}
              />
            </Box>
            {PROSPECTIVE_WARDS.map((ward) => (
              <ProspectiveWardCard key={ward.id} ward={ward} />
            ))}
          </Paper>
        </Grid>

      </Grid>

      <AdmissionBatchModal
        open={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
        onApply={handleApplyAdmission}
      />

    </PageContainer>
  );
};

export default ParentDashboard;
