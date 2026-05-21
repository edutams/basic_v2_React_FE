import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { IconClipboardCheck, IconSearch, IconTrophy, IconClock } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import AdmissionBatchModal from '@/tenant/components/admission/AdmissionBatchModal';

import ApplicationCard from '@/tenant/components/admission/status/ApplicationCard';

const MOCK_APPLICATIONS = [
  {
    id: 3,
    name: 'Tunde Okafor',
    status: 'Incomplete',
    applicationNo: '—',
    class: 'JSS 1',
    session: '2025/26',
    batch: 'Batch 1',
    currentStep: 0,
    acceptanceFee: null,
    feeDue: null,
    timeline: [],
    isDraft: true,
    draftStep: 2,
    surname: 'Okafor',
    first_name: 'Tunde',
  },
  {
    id: 1,
    name: 'Chinaza Okafor',
    status: 'Admitted',
    applicationNo: 'A-10428',
    class: 'JSS 1',
    session: '2025/26',
    batch: 'Batch 2',
    currentStep: 2,
    acceptanceFee: 35000,
    feeDue: 'Acceptance fee due Sep 5',
    timeline: [
      {
        type: 'submitted',
        title: 'Application submitted',
        date: 'Aug 12, 2025',
        detail: '₦5,000 paid',
      },
      {
        type: 'reviewed',
        title: 'Application reviewed',
        date: 'Aug 15, 2025',
        detail: 'Approved for exam',
      },
      { type: 'exam', title: 'E-Exam completed', date: 'Aug 24, 2025', detail: 'Score 84/100' },
      {
        type: 'decision',
        title: 'Admission decision',
        date: 'Aug 30, 2025',
        detail: 'Admitted to JSS 1',
      },
      { type: 'fee', title: 'Acceptance fee', date: 'Due Sep 5, 2025', detail: '₦35,000' },
      { type: 'pending', title: 'Auto-enrollment', date: '', detail: 'Awaiting acceptance fee' },
    ],
  },
  {
    id: 2,
    name: 'Emeka Okafor',
    status: 'Exam Scheduled',
    applicationNo: 'A-10431',
    class: 'JSS 2',
    session: '2025/26',
    batch: 'Batch 2',
    currentStep: 1,
    acceptanceFee: null,
    feeDue: null,
    timeline: [
      {
        type: 'submitted',
        title: 'Application submitted',
        date: 'Aug 14, 2025',
        detail: '₦5,000 paid',
      },
      {
        type: 'reviewed',
        title: 'Application reviewed',
        date: 'Aug 18, 2025',
        detail: 'Approved for exam',
      },
      { type: 'pending', title: 'E-Exam scheduled', date: 'Sep 2, 2025', detail: 'Awaiting exam' },
    ],
  },
];
// ── Page ──────────────────────────────────────────────────────────────────────
const MyApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const handleApplyAdmission = (batch) => {
    navigate('/admission/new-application', { state: { batch } });
  };

  const single = location.state?.application ?? location.state?.ward ?? null;

  const applications = single
    ? [
        {
          id: single.id ?? 1,
          name: single.name ?? '—',
          status: single.status ?? 'Applied',
          applicationNo: single.applicationNo ?? single.regNo ?? '—',
          class: single.class ?? single.tags?.[0] ?? '—',
          session: single.session ?? '—',
          term: single.term ?? '',
          currentStep: single.currentStep ?? 0,
          acceptanceFee: single.acceptanceFee ?? null,
          feeDue: single.feeDue ?? null,
          timeline: single.timeline ?? [],
          isDraft: single.isDraft ?? false,
          draftStep: single.draftStep ?? 0,
        },
      ]
    : MOCK_APPLICATIONS;

  const title = single ? `${single.name ?? 'Ward'} — Application` : 'All Applications';

  return (
    <PageContainer title="Admission Status" description="Application status">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => setBatchModalOpen(true)}
            // sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            sx={{ display: 'inline-flex' }}
          >
            New Application
          </Button>
        </Box>
      </Box>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            color: '#262292',
            // onHover: { color: 'primary.main' },
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          Back to dashboard
        </Button>
      </Box>

      {/* Application cards */}
      {applications.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No applications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              You haven't submitted any admission applications. Start a new application to get your
              ward enrolled.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setBatchModalOpen(true)}>
            New Application
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} alignItems="flex-start">
          {applications.map((app, i) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={app.id ?? i}>
              <ApplicationCard app={app} defaultOpen={applications.length === 1} />
            </Grid>
          ))}
        </Grid>
      )}

      <AdmissionBatchModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onApply={handleApplyAdmission}
      />
    </PageContainer>
  );
};

export default MyApplication;
