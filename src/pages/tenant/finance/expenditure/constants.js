export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

// Kept as a separate export (rather than inlining formatNaira at every call
// site) so chart/tooltip code that asked for a "compact" formatter still
// works unchanged — it just no longer abbreviates to K/M, per explicit
// request to always show the real figure.
export function formatCompact(amount) {
  return formatNaira(amount);
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
