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
