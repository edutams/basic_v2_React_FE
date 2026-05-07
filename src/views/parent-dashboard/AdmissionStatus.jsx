import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Box, Grid, Typography, Paper, Button, Chip, Avatar } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { IconClipboardCheck, IconSearch, IconTrophy, IconClock } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';

// ── Progress stepper 
const STEPS = ['Applied', 'E-Exam', 'Admitted', 'Enrolled'];

const AdmissionStepper = ({ currentStep }) => (
  <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3, overflowX: 'auto' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 320 }}>
      {STEPS.map((step, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        return (
          <React.Fragment key={step}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 60 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: done ? 'success.dark' : active ? 'primary.main' : 'grey.100',
                  border: '2px solid',
                  borderColor: done ? 'success.dark' : active ? 'primary.main' : 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {done ? (
                  <CheckCircleIcon sx={{ color: '#fff', fontSize: 22 }} />
                ) : active ? (
                  <SchoolIcon sx={{ color: '#fff', fontSize: 20 }} />
                ) : (
                  <PendingIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                )}
              </Box>
              <Typography
                variant="caption"
                fontWeight={active ? 700 : done ? 600 : 400}
                color={active ? 'primary.main' : done ? 'success.dark' : 'text.secondary'}
                mt={0.75}
                textAlign="center"
              >
                {step}
              </Typography>
            </Box>

            {i < STEPS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 3,
                  bgcolor: done ? 'success.main' : 'grey.200',
                  borderRadius: 2,
                  mb: 2.5,
                  minWidth: 16,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  </Paper>
);

const TIMELINE_ICON_MAP = {
  submitted: { icon: DescriptionIcon, bg: '#1565C0', isMui: true },
  reviewed: { icon: IconClipboardCheck, bg: '#2E7D32', isMui: false },
  exam: { icon: IconTrophy, bg: '#6A1B9A', isMui: false },
  decision: { icon: IconSearch, bg: '#E65100', isMui: false },
  fee: { icon: CreditCardIcon, bg: '#9E9E9E', isMui: true },
  pending: { icon: IconClock, bg: '#BDBDBD', isMui: false },
};

const TimelineEvent = ({ type = 'pending', title, date, detail, isLast = false }) => {
  const { icon: Icon, bg, isMui } = TIMELINE_ICON_MAP[type] ?? TIMELINE_ICON_MAP.pending;

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Icon + connector */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: bg, flexShrink: 0 }}>
          {isMui ? <Icon sx={{ fontSize: 20, color: '#fff' }} /> : <Icon size={20} color="#fff" />}
        </Avatar>
        {!isLast && (
          <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.200', mt: 0.5, mb: 0.5, minHeight: 24 }} />
        )}
      </Box>

      <Box sx={{ pb: isLast ? 0 : 2.5, pt: 0.5 }}>
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {date}
          {detail ? ` · ${detail}` : ''}
        </Typography>
      </Box>
    </Box>
  );
};

const ActionCard = ({ amount, dueLabel, onPay, onViewLetter }) => {
  const theme = useTheme();

  const bg = `linear-gradient(90deg, #15161a 0%, ${theme.palette.primary.main} 100%)`;

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          background: bg,
          p: 2.5,
          color: '#fff',
        }}
      >
        <Typography
          variant="caption"
          sx={{ opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}
        >
          Action Required
        </Typography>

        <Typography variant="h4" fontWeight={800} mt={0.5}>
          ₦{amount?.toLocaleString()}
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {dueLabel}
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<CreditCardIcon />}
          onClick={onPay}
          sx={{
            bgcolor: 'primary.main',
            fontWeight: 700,
            py: 1.25,
            borderRadius: 2,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Pay acceptance fee
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<DescriptionIcon />}
          onClick={onViewLetter}
          sx={{ fontWeight: 600, py: 1.25, borderRadius: 2 }}
        >
          View admission letter
        </Button>
      </Box>
    </Paper>
  );
};

const MOCK_APPLICATION = {
  name: 'Chinaza Okafor',
  status: 'Admitted',
  applicationNo: 'A-10428',
  class: 'JSS 1',
  session: '2025/26',
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
};

const AdmissionStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const app = location.state?.application ?? MOCK_APPLICATION;

  const statusColor =
    app.status === 'Admitted'
      ? { bgcolor: 'success.light', color: 'success.dark' }
      : { bgcolor: 'warning.light', color: 'warning.dark' };

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
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography variant="h4" fontWeight={800}>
              {app.name}
            </Typography>
            <Chip
              label={app.status}
              size="small"
              icon={
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: 'success.dark',
                    ml: 0.75,
                  }}
                />
              }
              sx={{ ...statusColor, fontWeight: 700, fontSize: 12 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Application #{app.applicationNo} · {app.class} · Session {app.session}
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'text.secondary', fontWeight: 500, flexShrink: 0 }}
        >
          Back to dashboard
        </Button>
      </Box>

      {/* Stepper */}
      <AdmissionStepper currentStep={app.currentStep} />

      <Grid container spacing={3} alignItems="flex-start">
        {/* Activity timeline */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2.5}>
              Activity timeline
            </Typography>
            {app.timeline.map((event, i) => (
              <TimelineEvent
                key={i}
                type={event.type}
                title={event.title}
                date={event.date}
                detail={event.detail}
                isLast={i === app.timeline.length - 1}
              />
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <ActionCard
            amount={app.acceptanceFee}
            dueLabel={app.feeDue}
            onPay={() => {}}
            onViewLetter={() => navigate('/admission-letter', { state: { letter: { ...app, parentName: 'Mrs. Adaeze Okafor' } } })}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AdmissionStatus;
