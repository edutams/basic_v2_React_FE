import { useState } from 'react';
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
} from '@mui/material';
import { IconCalendarStats, IconCalendarEvent, IconReceipt2, IconX } from '@tabler/icons-react';

// Same "hero stat card" visual language as HolidaySection.jsx, kept local to
// this component since neither file exports a shared palette utility.
// Weeks/Holidays used to live here too, but that's now the reused
// TermCalendarCard + SchoolCalendarModal (see SetCalendarTab.jsx) — no
// point showing the same numbers twice in two different-looking widgets.
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' }, // Sessions Subscribed
  { bg: '#F3E8FF', color: '#9333EA' }, // Active Session
];

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

// height: '100%' all the way down (ButtonBase -> Paper) is what lets these
// cards stretch to match TermCalendarCard's taller natural height when
// they're placed side by side (see SetCalendarTab.jsx) — a fixed pixel
// height here would leave a gap under the shorter cards instead.
const StatCard = ({ title, tooltip, icon, colorIndex, value, footer, onClick }) => (
  <Tooltip title={tooltip} arrow placement="top">
    <ButtonBase
      onClick={onClick}
      sx={{ display: 'block', width: '100%', height: '100%', borderRadius: '12px' }}
    >
      <Paper
        elevation={0}
        sx={{
          p: '14px',
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          height: '100%',
          minHeight: 92,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
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
        <Box>
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{ lineHeight: 1, fontSize: { xs: 22, md: 26 }, color: heroAccent(colorIndex) }}
          >
            {value}
          </Typography>
          {footer &&
            (typeof footer === 'string' ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block', ...clampSx(1) }}
              >
                {footer}
              </Typography>
            ) : (
              <Box sx={{ mt: 0.5 }}>{footer}</Box>
            ))}
        </Box>
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

// 'not_configured' (no active session-term yet) deliberately does NOT say
// "Active" or anything implying a confirmed, paid subscription — there's
// genuinely nothing to check yet, and claiming otherwise is misleading.
const subscriptionLabel = (tier) =>
  ({
    active: 'Subscription Active',
    grace: 'Free Trial — Subscription Due',
    locked: 'Subscription Expired',
    not_configured: 'Not Yet Configured',
  }[tier] || 'Subscription Status');

const tierChipColor = (tier) =>
  ({ active: 'success', grace: 'warning', locked: 'error' })[tier] || 'default';

// Subscription.status ('active'/'pending'/'expired') uses its own vocabulary
// — distinct from the grace/locked tier above — so it gets its own mapping.
const subscriptionStatusChipColor = (status) =>
  ({ active: 'success', pending: 'warning', expired: 'error' })[status] || 'default';

// "N active / M not" breakdown for the Sessions Subscribed card's footer —
// derived from the same list the modal already shows, no extra fetch.
const subscribedSessionsBreakdown = (sessions) => {
  if (!sessions?.length) return null;
  const activeCount = sessions.filter((s) => s.statuses.includes('active')).length;
  if (activeCount === sessions.length) return `All ${activeCount} currently active`;
  if (activeCount === 0) return `${sessions.length} session${sessions.length === 1 ? '' : 's'}, none active`;
  return `${activeCount} of ${sessions.length} currently active`;
};

// Local-safe "YYYY-MM-DD" parsing — new Date('2026-01-30') parses as UTC
// midnight, which can shift a day off in some timezones; read the
// components directly instead, same as SetCalendarTab.jsx/HolidaySection.jsx.
const parseIsoDate = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatIsoDateLong = (isoDate) =>
  isoDate
    ? parseIsoDate(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

// Signed day difference between today and an ISO date, for the due-date
// countdown on the Subscription card.
const daysUntil = (isoDate) => {
  if (!isoDate) return null;
  const due = parseIsoDate(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

const dueCountdownLabel = (tier, dueDate) => {
  // due_date is always computed by the backend (the term's own week-4
  // date), regardless of tier — only show it as a countdown while it's
  // still actionable. Once tier is 'active', the school has already paid;
  // a due-date countdown here would read as "active, but also overdue".
  if (tier === 'active') return null;
  const days = daysUntil(dueDate);
  if (days === null) return null;
  if (days > 0) return `Due in ${days} day${days === 1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  // Locked subscriptions are already expired, not "overdue" — that reads
  // as though paying now would still save the grace period, which it can't.
  return tier === 'locked' ? `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago` : `Due ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
};

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
        <Paper key={s.session_id} variant="outlined" sx={{ p: 1.5, borderRadius: '10px' }}>
          <Typography fontWeight={700}>{s.session_name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {s.terms_subscribed} term{s.terms_subscribed === 1 ? '' : 's'} subscribed
          </Typography>
          <Stack spacing={0.75}>
            {(s.terms ?? []).map((t, i) => (
              <Stack key={`${t.term_name}-${i}`} direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">{t.term_name || 'Unknown term'}</Typography>
                <Chip size="small" label={t.status} color={subscriptionStatusChipColor(t.status)} />
              </Stack>
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

const SubscriptionModal = ({ subscription }) => {
  const dueLabel = dueCountdownLabel(subscription?.tier, subscription?.due_date);

  return (
    <Stack spacing={1.5}>
      <Chip
        label={subscriptionLabel(subscription?.tier)}
        color={tierChipColor(subscription?.tier)}
        sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
      />
      <Typography>{subscription?.message || "You're all set for this term."}</Typography>
      {/* due_date is always computed (it's the term's own week-4 date,
          informational regardless of tier) — only show it as a countdown
          when it's still actionable. Once tier is 'active', the school has
          already paid; a due date here would read as "active, but also
          overdue", which is exactly backwards. */}
      {subscription?.tier !== 'active' && subscription?.due_date && (
        <Box>
          <Typography variant="caption" color="text.secondary">Due Date</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography fontWeight={700}>{formatIsoDateLong(subscription.due_date)}</Typography>
            {dueLabel && <Chip size="small" label={dueLabel} color={tierChipColor(subscription?.tier)} variant="outlined" />}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

const MODALS = {
  sessions: { title: 'Sessions Subscribed', Body: SessionsSubscribedModal },
  session: { title: 'Active Session', Body: ActiveSessionModal },
  subscription: { title: 'Subscription', Body: SubscriptionModal },
};

/**
 * "How intelligent is the calendar?" — a stat-card row atop SetCalendarTab
 * answering what the CEO asked for: sessions subscribed to, and the session
 * actually running the school, plus a plain-language subscription readout.
 * Weeks/holidays live in the (reused) TermCalendarCard next to this — see
 * SetCalendarTab.jsx. Every level here is height: '100%' specifically so
 * this whole block stretches to match TermCalendarCard's taller natural
 * height when the two sit side by side, instead of leaving a gap.
 *
 * Every card opens a modal with the full data behind it — no navigation, no
 * scrolling. Every modal reads from the same `overview` response this
 * component already has — no extra round trips.
 */
const CalendarIntelligence = ({ overview, loading }) => {
  const [activeModal, setActiveModal] = useState(null);

  if (loading && !overview) {
    return (
      <Grid container spacing={1.5} sx={{ height: '100%' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Skeleton variant="rounded" height={92} sx={{ borderRadius: '12px', height: '100%' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!overview) return null;

  const { subscribed_sessions_count, subscribed_sessions, weeks, subscription } = overview;
  const palette = subscriptionPalette(subscription?.tier);
  const sessionsBreakdown = subscribedSessionsBreakdown(subscribed_sessions);
  const dueLabel = dueCountdownLabel(subscription?.tier, subscription?.due_date);

  const modal = activeModal ? MODALS[activeModal] : null;
  const ModalBody = modal?.Body;

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={1.5} sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Sessions Subscribed"
            tooltip="Every academic session your school has subscribed to since joining the platform. Click to see them."
            icon={<IconCalendarStats size={18} />}
            colorIndex={0}
            value={subscribed_sessions_count}
            footer={sessionsBreakdown}
            onClick={() => setActiveModal('sessions')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Active Session"
            tooltip="The session and term actually running the school right now. Click for details."
            icon={<IconCalendarEvent size={18} />}
            colorIndex={1}
            value={subscription?.session_name || '—'}
            footer={
              subscription?.term_name && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {subscription.term_name}
                  </Typography>
                  {subscription?.week_number && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Week {subscription.week_number}
                      {weeks?.current ? ` of ${weeks.current}` : ''}
                    </Typography>
                  )}
                </>
              )
            }
            onClick={() => setActiveModal('session')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
          <Tooltip title="Your school's subscription status for the active term. Click for details." arrow placement="top">
            <ButtonBase
              onClick={() => setActiveModal('subscription')}
              sx={{ display: 'block', width: '100%', height: '100%', borderRadius: '12px', textAlign: 'left' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  borderRadius: '12px',
                  bgcolor: palette.bg,
                  border: `1px solid ${palette.border}`,
                  height: '100%',
                  minHeight: 92,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
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
                  sx={{ color: palette.color, lineHeight: 1.35, display: 'block', ...clampSx(3) }}
                >
                  {subscription?.message ||
                    (subscription?.tier === 'active'
                      ? "You're all set for this term."
                      : 'No subscription information available.')}
                </Typography>
                {dueLabel && (
                  <Chip
                    label={dueLabel}
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      mt: 0.75,
                      fontWeight: 700,
                      bgcolor: 'rgba(255,255,255,0.6)',
                      color: palette.color,
                    }}
                  />
                )}
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
          {ModalBody && <ModalBody overview={overview} subscription={subscription} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CalendarIntelligence;
