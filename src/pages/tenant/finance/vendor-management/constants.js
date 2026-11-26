export const STATUS_META = {
  Active: { bg: '#DCFCE7', color: '#15803D' },
  Inactive: { bg: '#F1F5F9', color: '#64748B' },
};

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

export function formatCompact(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n}`;
}
