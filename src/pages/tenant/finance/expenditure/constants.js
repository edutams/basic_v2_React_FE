export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateDisplay(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const CATEGORY_DOT_COLORS = ['#2563EB', '#0D9488', '#9333EA', '#D97706', '#64748B', '#DC2626', '#16A34A'];

export const STATUS_TABS = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'outstanding', label: 'With Outstanding Payment' },
  { value: 'full', label: 'Full Payment' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All Entries' },
];

/**
 * Which status tab an entry currently belongs to — mirrors the backend's
 * ExpenditureEntry scopes exactly, computed client-side since the listing
 * is fetched once (unfiltered) and tabs/stats are all derived from it.
 */
export function getEntryTabStatus(entry) {
  if (entry.status === 'rejected') return 'rejected';
  const hasPending = (entry.installments || []).some((i) => i.status === 'pending_approval');
  if (hasPending) return 'pending';
  if (Number(entry.balance_amount) > 0) return 'outstanding';
  return 'full';
}

export function getPendingInstallment(entry) {
  return (entry.installments || []).find((i) => i.status === 'pending_approval') || null;
}

// Posting Trend (last 7 terms) has no backing aggregation endpoint yet —
// this report belongs with the Reports module's term-over-term wiring, not
// this operational page, so it stays an explicit placeholder for now.
export const mockPostingTrend = [
  { term: '2024 T1', actual: 255000, paid: 200000, balance: 55000 },
  { term: '2024 T2', actual: 288000, paid: 230000, balance: 58000 },
  { term: '2024 T3', actual: 312000, paid: 250000, balance: 62000 },
  { term: '2025 T1', actual: 356000, paid: 270000, balance: 86000 },
  { term: '2025 T2', actual: 398000, paid: 290000, balance: 108000 },
  { term: '2025 T3', actual: 462000, paid: 310000, balance: 152000 },
  { term: '2026 T1', actual: 525000, paid: 327000, balance: 198000 },
];
