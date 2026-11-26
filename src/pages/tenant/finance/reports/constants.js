export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

export const REPORT_TABS = [
  { value: 'summary', label: 'Account Summary' },
  { value: 'income', label: 'Income Details' },
  { value: 'expenditure', label: 'Expenditure Details' },
  { value: 'trend', label: 'Trend & Analysis' },
];

// Used wherever real chart-of-account/vendor names are dynamic (not a fixed
// small set) — colors assigned by index, matching the pattern already used
// on Post Expenditure/Post Income.
export const CATEGORY_DOT_COLORS = ['#2563EB', '#0D9488', '#9333EA', '#D97706', '#94A3B8', '#DC2626', '#16A34A'];
