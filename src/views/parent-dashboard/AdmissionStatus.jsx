import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import {
  Box, Grid, Typography, Paper, Button, Chip, Avatar, Collapse, Divider,
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
import PageContainer from 'src/components/container/PageContainer';

// ── Stepper ───────────────────────────────────────────────────────────────────
const STEPS = ['Applied', 'E-Exam', 'Admitted', 'Enrolled'];

const AdmissionStepper = ({ currentStep }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {STEPS.map((step, i) => {
      const done   = i < currentStep;
      const active = i === currentStep;
      return (
        <React.Fragment key={step}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 48 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '50%',
                bgcolor: done || active ? 'primary.main' : 'grey.100',
                border: '2px solid',
                borderColor: done || active ? 'primary.main' : 'grey.300',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {done
                ? <CheckCircleIcon sx={{ color: '#fff', fontSize: 18 }} />
                : active
                ? <SchoolIcon sx={{ color: '#fff', fontSize: 16 }} />
                : <PendingIcon sx={{ color: 'grey.400', fontSize: 16 }} />}
            </Box>
            <Typography
              variant="caption"
              fontWeight={active ? 700 : done ? 600 : 400}
              color={active ? 'primary.main' : done ? 'primary.dark' : 'text.secondary'}
              mt={0.5} textAlign="center" sx={{ fontSize: 10 }}
            >
              {step}
            </Typography>
          </Box>
          {i < STEPS.length - 1 && (
            <Box sx={{ flex: 1, height: 2, bgcolor: done ? 'primary.main' : 'grey.200', mb: 2.5, minWidth: 12 }} />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

// ── Timeline ──────────────────────────────────────────────────────────────────
const TIMELINE_ICON_MAP = {
  submitted: { icon: DescriptionIcon,    bg: '#1565C0', isMui: true  },
  reviewed:  { icon: IconClipboardCheck, bg: '#2E7D32', isMui: false },
  exam:      { icon: IconTrophy,         bg: '#6A1B9A', isMui: false },
  decision:  { icon: IconSearch,         bg: '#E65100', isMui: false },
  fee:       { icon: CreditCardIcon,     bg: '#9E9E9E', isMui: true  },
  pending:   { icon: IconClock,          bg: '#BDBDBD', isMui: false },
};

const TimelineEvent = ({ type = 'pending', title, date, detail, isLast = false }) => {
  const { icon: Icon, bg, isMui } = TIMELINE_ICON_MAP[type] ?? TIMELINE_ICON_MAP.pending;
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: bg, flexShrink: 0 }}>
          {isMui ? <Icon sx={{ fontSize: 18, color: '#fff' }} /> : <Icon size={18} color="#fff" />}
        </Avatar>
        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.200', mt: 0.5, mb: 0.5, minHeight: 20 }} />}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 2, pt: 0.25 }}>
        <Typography variant="body2" fontWeight={700}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {date}{detail ? ` · ${detail}` : ''}
        </Typography>
      </Box>
    </Box>
  );
};

// ── Action card ───────────────────────────────────────────────────────────────
const ActionCard = ({ amount, dueLabel, onPay, onViewLetter }) => {
  const theme = useTheme();
  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ background: `linear-gradient(90deg,#15161a 0%,${theme.palette.primary.main} 100%)`, p: 2, color: '#fff' }}>
        <Typography variant="caption" sx={{ opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>
          Action Required
        </Typography>
        <Typography variant="h5" fontWeight={800} mt={0.5}>₦{amount?.toLocaleString()}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>{dueLabel}</Typography>
      </Box>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button variant="contained" fullWidth startIcon={<CreditCardIcon />} onClick={onPay}
          sx={{ fontWeight: 700, py: 1.25, borderRadius: 2 }}>
          Pay acceptance fee
        </Button>
        <Button variant="outlined" fullWidth startIcon={<DescriptionIcon />} onClick={onViewLetter}
          sx={{ fontWeight: 600, py: 1.25, borderRadius: 2 }}>
          View admission letter
        </Button>
      </Box>
    </Paper>
  );
};

// ── Status helpers ────────────────────────────────────────────────────────────
const statusChipSx = (status) => {
  if (status === 'Admitted')        return { bgcolor: 'success.light',  color: 'success.dark'  };
  if (status === 'Enrolled')        return { bgcolor: 'primary.light',  color: 'primary.dark'  };
  if (status === 'Exam Scheduled')  return { bgcolor: 'warning.light',  color: 'warning.dark'  };
  return                                   { bgcolor: 'grey.100',       color: 'text.secondary' };
};

// ── Single application card ───────────────────────────────────────────────────
const ApplicationCard = ({ app, defaultOpen = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);

  const hasTimeline   = app.timeline?.length > 0;
  const hasAction     = Boolean(app.acceptanceFee);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
      {/* ── Summary row (always visible) ── */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 2, p: 2,
          cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar sx={{ width: 44, height: 44, fontWeight: 700, flexShrink: 0 }}>
          {app.name?.[0]}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={700} noWrap>{app.name}</Typography>
            <Chip
              label={app.status}
              size="small"
              icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor', ml: 0.75 }} />}
              sx={{ ...statusChipSx(app.status), fontWeight: 700, fontSize: 11 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            App #{app.applicationNo} · {app.class} · {app.session}{app.term ? ` · ${app.term}` : ''}
          </Typography>
        </Box>

        {/* Mini stepper — hidden on xs */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 220, flexShrink: 0 }}>
          <AdmissionStepper currentStep={app.currentStep ?? 0} />
        </Box>

        <Box sx={{ flexShrink: 0, color: 'text.secondary' }}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* ── Expanded detail ── */}
      <Collapse in={open}>
        <Divider />

        {/* Full stepper on mobile */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, px: 2, pt: 2 }}>
          <AdmissionStepper currentStep={app.currentStep ?? 0} />
        </Box>

        <Grid container spacing={2} sx={{ p: 2 }} alignItems="flex-start">
          {/* Timeline */}
          <Grid size={{ xs: 12, md: hasAction ? 7 : 12 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Activity timeline</Typography>
            {hasTimeline ? (
              app.timeline.map((ev, i) => (
                <TimelineEvent
                  key={i} type={ev.type} title={ev.title}
                  date={ev.date} detail={ev.detail}
                  isLast={i === app.timeline.length - 1}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No activity recorded yet.</Typography>
            )}
          </Grid>

          {/* Action card */}
          {hasAction && (
            <Grid size={{ xs: 12, md: 5 }}>
              <ActionCard
                amount={app.acceptanceFee}
                dueLabel={app.feeDue}
                onPay={() => {}}
                onViewLetter={() => navigate('/admission-letter', { state: { letter: { ...app, parentName: 'Mrs. Adaeze Okafor' } } })}
              />
            </Grid>
          )}
        </Grid>
      </Collapse>
    </Paper>
  );
};

// ── Mock data (multiple wards) ────────────────────────────────────────────────
const MOCK_APPLICATIONS = [
  {
    id: 1, name: 'Chinaza Okafor', status: 'Admitted',
    applicationNo: 'A-10428', class: 'JSS 1', session: '2025/26',
    currentStep: 2, acceptanceFee: 35000, feeDue: 'Acceptance fee due Sep 5',
    timeline: [
      { type: 'submitted', title: 'Application submitted',  date: 'Aug 12, 2025', detail: '₦5,000 paid'        },
      { type: 'reviewed',  title: 'Application reviewed',   date: 'Aug 15, 2025', detail: 'Approved for exam'  },
      { type: 'exam',      title: 'E-Exam completed',       date: 'Aug 24, 2025', detail: 'Score 84/100'       },
      { type: 'decision',  title: 'Admission decision',     date: 'Aug 30, 2025', detail: 'Admitted to JSS 1'  },
      { type: 'fee',       title: 'Acceptance fee',         date: 'Due Sep 5, 2025', detail: '₦35,000'         },
      { type: 'pending',   title: 'Auto-enrollment',        date: '',             detail: 'Awaiting acceptance fee' },
    ],
  },
  {
    id: 2, name: 'Emeka Okafor', status: 'Exam Scheduled',
    applicationNo: 'A-10431', class: 'JSS 2', session: '2025/26',
    currentStep: 1, acceptanceFee: null, feeDue: null,
    timeline: [
      { type: 'submitted', title: 'Application submitted', date: 'Aug 14, 2025', detail: '₦5,000 paid'       },
      { type: 'reviewed',  title: 'Application reviewed',  date: 'Aug 18, 2025', detail: 'Approved for exam' },
      { type: 'pending',   title: 'E-Exam scheduled',      date: 'Sep 2, 2025',  detail: 'Awaiting exam'     },
    ],
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const AdmissionStatus = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // If navigated with a single ward/application, show just that one (expanded)
  // Otherwise show all mock applications
  const single = location.state?.application ?? location.state?.ward ?? null;

  const applications = single
    ? [{
        id:            single.id            ?? 1,
        name:          single.name          ?? '—',
        status:        single.status        ?? 'Applied',
        applicationNo: single.applicationNo ?? single.regNo ?? '—',
        class:         single.class         ?? single.tags?.[0] ?? '—',
        session:       single.session       ?? '—',
        term:          single.term          ?? '',
        currentStep:   single.currentStep   ?? 0,
        acceptanceFee: single.acceptanceFee ?? null,
        feeDue:        single.feeDue        ?? null,
        timeline:      single.timeline      ?? [],
      }]
    : MOCK_APPLICATIONS;

  const title = single ? `${single.name ?? 'Ward'} — Application` : 'All Applications';

  return (
    <PageContainer title="Admission Status" description="Application status">
      {/* Page header */}
      <Box
        display="flex" justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5} mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
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

      {/* Application cards */}
      {applications.map((app, i) => (
        <ApplicationCard
          key={app.id ?? i}
          app={app}
          defaultOpen={applications.length === 1}
        />
      ))}
    </PageContainer>
  );
};

export default AdmissionStatus;
