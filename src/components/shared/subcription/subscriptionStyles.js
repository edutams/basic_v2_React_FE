// Shared design tokens for both Subscriptions tabs (Manage Subscription and
// Subscription History) — kept in one place so "Active"/"Pending" etc. read
// identically everywhere instead of drifting between the two pages.

export const ACCENT = '#7C3AED';

export const STATUS_STYLE = {
  active: { bg: '#DCFCE7', color: '#15803D' },
  approved: { bg: '#DCFCE7', color: '#15803D' },
  pending: { bg: '#FEF3C7', color: '#B45309' },
  declined: { bg: '#FEE2E2', color: '#B91C1C' },
  reversed: { bg: '#FEE2E2', color: '#B91C1C' },
  refund: { bg: '#E2E8F0', color: '#475569' },
};

export const PLAN_BAR_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#D97706', '#16A34A'];

// CSS Grid via a plain Box (not MUI's Grid component) — matches the
// pattern Class Register's stat-card rows already use, for a 4-card row.
export const cardRowSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
  gap: 1,
  mb: 1.5,
};
