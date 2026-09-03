import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Skeleton,
  Tooltip,
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  IconCalendarStats,
  IconCalendarEvent,
  IconStack2,
  IconCalendarOff,
  IconReceipt2,
  IconX,
} from '@tabler/icons-react';
import { fetchHolidays } from '@/api/tenant/holidays/holidayApi';

// Same "hero stat card" visual language as HolidaySection.jsx, kept local to
// this component since neither file exports a shared palette utility.
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' }, // Sessions Subscribed
  { bg: '#F3E8FF', color: '#9333EA' }, // Active Session
  { bg: '#DCFCE7', color: '#16A34A' }, // Weeks Set
  { bg: '#FEE2E2', color: '#DC2626' }, // Holidays Set
];

// Every card shares this height so the row never looks lopsided regardless
// of how much text a given card's content needs — long text is clamped and
// the rest lives in the modal instead.
const CARD_HEIGHT = 92;

const heroIconBadgeSx = (colorIndex) => ({
  width: 28,
  height: 28,
  borderRadius: '9px',
  background: schemeMap[colorIndex].bg,
  color: schemeMap[colorIndex].color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
});

const heroAccent = (colorIndex) => schemeMap[colorIndex].color;

const clampSx = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const StatCard = ({ title, tooltip, icon, colorIndex, value, footer, onClick }) => (
  <Tooltip title={tooltip} arrow placement="top">
    <ButtonBase onClick={onClick} sx={{ display: 'block', width: '100%', borderRadius: '12px' }}>
      <Paper
        elevation={0}
        sx={{
          p: '10px 12px',
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          height: CARD_HEIGHT,
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {title}
          </Typography>
          <Box sx={heroIconBadgeSx(colorIndex)}>{icon}</Box>
        </Stack>
        <Typography
          variant="h2"
          fontWeight={900}
          sx={{ lineHeight: 1, fontSize: { xs: 22, md: 26 }, color: heroAccent(colorIndex) }}
        >
          {value}
        </Typography>
        {footer && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.25, display: 'block', ...clampSx(1) }}
          >
            {footer}
          </Typography>
        )}
      </Paper>
    </ButtonBase>
  </Tooltip>
);

const subscriptionPalette = (tier) => {
  switch (tier) {
    case 'active':
      return { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' };
    case 'grace':
      return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    case 'locked':
      return { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' };
    default:
      return { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
  }
};

const subscriptionLabel = (tier) =>
  ({ active: 'Subscription Active', grace: 'Free Trial — Subscription Due', locked: 'Subscription Expired' }[tier] ||
  'Subscription Status');

const tierChipColor = (tier) =>
  ({ active: 'success', grace: 'warning', locked: 'error' })[tier] || 'default';

// Subscription.status ('active'/'pending'/'expired') uses its own vocabulary
// — distinct from the grace/locked tier above — so it gets its own mapping.
const subscriptionStatusChipColor = (status) =>
  ({ active: 'success', pending: 'warning', expired: 'error' })[status] || 'default';

// ── Modal bodies — one per card, every stat's "click to see the data" ──────

const SessionsSubscribedModal = ({ overview }) => {
  const sessions = overview?.subscribed_sessions ?? [];

  if (sessions.length === 0) {
    return (
      <Typography color="text.secondary">
        No subscriptions have been made for this school yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {sessions.map((s) => (
        <Paper
          key={s.session_id}
          variant="outlined"
          sx={{ p: 1.5, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
        >
          <Box>
            <Typography fontWeight={700}>{s.session_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {s.terms_subscribed} term{s.terms_subscribed === 1 ? '' : 's'} subscribed
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {s.statuses.map((status) => (
              <Chip key={status} size="small" label={status} color={subscriptionStatusChipColor(status)} />
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

const ActiveSessionModal = ({ subscription }) => (
  <Stack spacing={1.5}>
    <Box>
      <Typography variant="caption" color="text.secondary">Session</Typography>
      <Typography variant="h6" fontWeight={700}>{subscription?.session_name || 'Not set'}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Term</Typography>
      <Typography variant="h6" fontWeight={700}>{subscription?.term_name || 'Not set'}</Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">Current Week</Typography>
      <Typography variant="h6" fontWeight={700}>
        {subscription?.week_number ? `Week ${subscription.week_number}` : 'Not set'}
      </Typography>
    </Box>
    <Divider />
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2" color="text.secondary">Subscription status:</Typography>
      <Chip size="small" label={subscriptionLabel(subscription?.tier)} color={tierChipColor(subscription?.tier)} />
    </Stack>
  </Stack>
);

const WeeksModal = ({ weeks }) => (
  <Stack spacing={1.5}>
    <Stack direction="row" spacing={3}>
      <Box>
        <Typography variant="caption" color="text.secondary">This Term</Typography>
        <Typography variant="h4" fontWeight={800}>{weeks?.current ?? 0}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">Previous Term</Typography>
        <Typography variant="h4" fontWeight={800} color="text.secondary">
          {weeks?.previous ?? '—'}
        </Typography>
      </Box>
    </Stack>
    <Typography color="text.secondary">{weeks?.delta_label}</Typography>
  </Stack>
);

const HolidaysModal = ({ sessionTermId }) => {
  const [holidays, setHolidays] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionTermId) return;
    let mounted = true;
    fetchHolidays(sessionTermId)
      .then((res) => {
        if (mounted) setHolidays(res?.data ?? []);
      })
      .catch(() => {
        if (mounted) setError(true);
      });
    return () => {
      mounted = false;
    };
  }, [sessionTermId]);

  if (!sessionTermId) {
    return <Typography color="text.secondary">No active term to show holidays for.</Typography>;
  }
  if (error) {
    return <Typography color="error">Failed to load holidays.</Typography>;
  }
  if (holidays === null) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (holidays.length === 0) {
    return <Typography color="text.secondary">No holidays set for the active term yet.</Typography>;
  }

  return (
    <Stack spacing={1}>
      {holidays.map((h) => (
        <Paper key={h.id} variant="outlined" sx={{ p: 1.5, borderRadius: '10px' }}>
          <Typography fontWeight={700}>{h.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {h.start_date} → {h.end_date}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

const SubscriptionModal = ({ subscription }) => (
  <Stack spacing={1.5}>
    <Chip
      label={subscriptionLabel(subscription?.tier)}
      color={tierChipColor(subscription?.tier)}
      sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
    />
    <Typography>{subscription?.message || "You're all set for this term."}</Typography>
    {subscription?.due_date && (
      <Box>
        <Typography variant="caption" color="text.secondary">Due Date</Typography>
        <Typography fontWeight={700}>
          {new Date(subscription.due_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </Box>
    )}
  </Stack>
);

const MODALS = {
  sessions: { title: 'Sessions Subscribed', Body: SessionsSubscribedModal },
  session: { title: 'Active Session', Body: ActiveSessionModal },
  weeks: { title: 'Weeks Set', Body: WeeksModal },
  holidays: { title: 'Holidays Set', Body: HolidaysModal },
  subscription: { title: 'Subscription', Body: SubscriptionModal },
};

/**
 * "How intelligent is the calendar?" — a stat-card row atop SetCalendarTab
 * answering exactly what the CEO asked for: sessions subscribed to, the
 * session actually running the school, how this term's weeks compare to the
 * last one, holidays set, and a plain-language subscription readout.
 *
 * Every card opens a modal with the full data behind it — no navigation, no
 * scrolling, all five behave the same way (uniform, single source of truth:
 * every modal reads from the same `overview` response this component
 * already has, except Holidays which lazy-fetches on open).
 */
const CalendarIntelligence = ({ overview, loading }) => {
  const [activeModal, setActiveModal] = useState(null);

  if (loading && !overview) {
    return (
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <Skeleton variant="rounded" height={CARD_HEIGHT} sx={{ borderRadius: '12px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!overview) return null;

  const { subscribed_sessions_count, weeks, holidays_count, subscription } = overview;
  const palette = subscriptionPalette(subscription?.tier);
  const deltaColor =
    weeks?.delta > 0 ? 'success.main' : weeks?.delta < 0 ? 'error.main' : 'text.secondary';

  const modal = activeModal ? MODALS[activeModal] : null;
  const ModalBody = modal?.Body;

  return (
    <>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            title="Sessions Subscribed"
            tooltip="Every academic session your school has subscribed to since joining the platform. Click to see them."
            icon={<IconCalendarStats size={18} />}
            colorIndex={0}
            value={subscribed_sessions_count}
            onClick={() => setActiveModal('sessions')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            title="Active Session"
            tooltip="The session and term actually running the school right now. Click for details."
            icon={<IconCalendarEvent size={18} />}
            colorIndex={1}
            value={subscription?.session_name || '—'}
            footer={subscription?.term_name}
            onClick={() => setActiveModal('session')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            title="Weeks Set"
            tooltip="Weeks generated for the active term, compared to the previous term. Click for details."
            icon={<IconStack2 size={18} />}
            colorIndex={2}
            value={weeks?.current ?? 0}
            onClick={() => setActiveModal('weeks')}
            footer={
              <Box component="span" sx={{ color: deltaColor, fontWeight: 600 }}>
                {weeks?.delta_label}
              </Box>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            title="Holidays Set"
            tooltip="Holidays configured for the active term. Click to see them."
            icon={<IconCalendarOff size={18} />}
            colorIndex={3}
            value={holidays_count}
            onClick={() => setActiveModal('holidays')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <Tooltip title="Your school's subscription status for the active term. Click for details." arrow placement="top">
            <ButtonBase
              onClick={() => setActiveModal('subscription')}
              sx={{ display: 'block', width: '100%', borderRadius: '12px', textAlign: 'left' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: '10px 12px',
                  borderRadius: '12px',
                  bgcolor: palette.bg,
                  border: `1px solid ${palette.border}`,
                  height: CARD_HEIGHT,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s ease, transform 0.15s ease',
                  '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: palette.color }}>
                    {subscriptionLabel(subscription?.tier)}
                  </Typography>
                  <IconReceipt2 size={18} color={palette.color} />
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ color: palette.color, lineHeight: 1.35, display: 'block', ...clampSx(2) }}
                >
                  {subscription?.message ||
                    (subscription?.tier === 'active'
                      ? "You're all set for this term."
                      : 'No subscription information available.')}
                </Typography>
              </Paper>
            </ButtonBase>
          </Tooltip>
        </Grid>
      </Grid>

      <Dialog open={Boolean(activeModal)} onClose={() => setActiveModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {modal?.title}
          <IconButton size="small" aria-label="Close" onClick={() => setActiveModal(null)}>
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {ModalBody && (
            <ModalBody
              overview={overview}
              subscription={subscription}
              weeks={weeks}
              sessionTermId={subscription?.session_term_id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarIntelligence;
