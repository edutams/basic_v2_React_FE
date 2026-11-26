export const STATUS_META = {
  Active: { bg: '#DCFCE7', color: '#15803D' },
  Inactive: { bg: '#F1F5F9', color: '#64748B' },
};

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
