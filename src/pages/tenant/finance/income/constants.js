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

export const CATEGORY_DOT_COLORS = ['#16A34A', '#2563EB', '#D97706', '#9333EA', '#64748B', '#DC2626', '#0D9488'];

export const STATUS_TABS = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'outstanding', label: 'With Outstanding Payment' },
  { value: 'full', label: 'Full Payment' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All Entries' },
];

/**
 * Which status tab an entry currently belongs to — mirrors the backend's
 * IncomeEntry scopes exactly, computed client-side since the listing is
 * fetched once (unfiltered) and tabs/stats are all derived from it.
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

// Income Trend (last 7 terms) has no backing aggregation endpoint yet —
// this report belongs with the Reports module's term-over-term wiring, not
// this operational page, so it stays an explicit placeholder for now.
export const mockIncomeTrend = [
  { term: '2024 T1', actual: 520000, paid: 480000, balance: 40000 },
  { term: '2024 T2', actual: 560000, paid: 510000, balance: 50000 },
  { term: '2024 T3', actual: 590000, paid: 540000, balance: 50000 },
  { term: '2025 T1', actual: 630000, paid: 580000, balance: 50000 },
  { term: '2025 T2', actual: 670000, paid: 610000, balance: 60000 },
  { term: '2025 T3', actual: 710000, paid: 650000, balance: 60000 },
  { term: '2026 T1', actual: 742000, paid: 687000, balance: 55000 },
];
