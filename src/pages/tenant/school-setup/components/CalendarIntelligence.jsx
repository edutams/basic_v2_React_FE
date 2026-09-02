import { Box, Grid, Paper, Stack, Typography, Skeleton } from '@mui/material';
import {
  IconCalendarStats,
  IconLayoutGrid,
  IconStack2,
  IconCalendarOff,
  IconReceipt2,
} from '@tabler/icons-react';

// Same "hero stat card" visual language as HolidaySection.jsx, kept local to
// this component since neither file exports a shared palette utility.
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' }, // Active Sessions
  { bg: '#F3E8FF', color: '#9333EA' }, // Active Sections
  { bg: '#DCFCE7', color: '#16A34A' }, // Weeks Set
  { bg: '#FEE2E2', color: '#DC2626' }, // Holidays Set
];

const heroIconBadgeSx = (colorIndex) => ({
  width: 32,
  height: 32,
  borderRadius: '10px',
  background: schemeMap[colorIndex].bg,
  color: schemeMap[colorIndex].color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
});

const heroAccent = (colorIndex) => schemeMap[colorIndex].color;

const StatCard = ({ title, icon, colorIndex, value, footer }) => (
  <Paper
    elevation={0}
    sx={{
      p: '14px',
      borderRadius: '14px',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      height: '100%',
      minHeight: 110,
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
      <Typography variant="h6" fontWeight={700} color="text.primary">
        {title}
      </Typography>
      <Box sx={heroIconBadgeSx(colorIndex)}>{icon}</Box>
    </Stack>
    <Typography
      variant="h2"
      fontWeight={900}
      sx={{ lineHeight: 1, fontSize: { xs: 26, md: 32 }, color: heroAccent(colorIndex) }}
    >
      {value}
    </Typography>
    {footer && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {footer}
      </Typography>
    )}
  </Paper>
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

/**
 * "How intelligent is the calendar?" — a stat-card row atop SetCalendarTab
 * answering exactly what the CEO asked for: active sessions, active
 * sections, how this term's weeks compare to the last one, holidays set,
 * and a plain-language subscription readout with its own color coding.
 */
const CalendarIntelligence = ({ overview, loading }) => {
  if (loading && !overview) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <Skeleton variant="rounded" height={110} sx={{ borderRadius: '14px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!overview) return null;

  const { active_sessions_count, active_sections_count, weeks, holidays_count, subscription } = overview;
  const palette = subscriptionPalette(subscription?.tier);
  const deltaColor =
    weeks?.delta > 0 ? 'success.main' : weeks?.delta < 0 ? 'error.main' : 'text.secondary';

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          title="Active Sessions"
          icon={<IconCalendarStats size={20} />}
          colorIndex={0}
          value={active_sessions_count}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          title="Active Sections"
          icon={<IconLayoutGrid size={20} />}
          colorIndex={1}
          value={active_sections_count}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          title="Weeks Set"
          icon={<IconStack2 size={20} />}
          colorIndex={2}
          value={weeks?.current ?? 0}
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
          icon={<IconCalendarOff size={20} />}
          colorIndex={3}
          value={holidays_count}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <Paper
          elevation={0}
          sx={{
            p: '14px',
            borderRadius: '14px',
            bgcolor: palette.bg,
            border: `1px solid ${palette.border}`,
            height: '100%',
            minHeight: 110,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: palette.color }}>
              {subscriptionLabel(subscription?.tier)}
            </Typography>
            <IconReceipt2 size={20} color={palette.color} />
          </Stack>
          <Typography variant="body2" sx={{ color: palette.color, lineHeight: 1.4 }}>
            {subscription?.message ||
              (subscription?.tier === 'active'
                ? "You're all set for this term."
                : 'No subscription information available.')}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CalendarIntelligence;
