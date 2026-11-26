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

export function formatDateDisplay(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const BALANCE_SHEET_TABS = [
  { value: 'balance-sheet', label: 'Balance Sheet' },
  { value: 'assets', label: 'Asset Details' },
  { value: 'liabilities', label: 'Liabilities Details' },
  { value: 'equity', label: 'Equity Details' },
  { value: 'trend', label: 'Trend & Analysis' },
];

// Consistent color scheme across every Balance Sheet chart.
export const COLORS = {
  assets: '#2563EB',
  nonCurrentAssets: '#2563EB',
  currentAssets: '#16A34A',
  liabilities: '#9333EA',
  nonCurrentLiabilities: '#2563EB',
  currentLiabilities: '#16A34A',
  equity: '#16A34A',
  accumulatedSurplus: '#2563EB',
  currentPeriodSurplus: '#16A34A',
};
