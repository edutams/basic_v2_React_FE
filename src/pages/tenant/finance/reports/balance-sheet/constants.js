export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
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
