// Donut/legend palette for revenue distribution
export const COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'];

// Status chip metadata for the class-level collection matrix
export const STATUS_META = {
  excellent: { label: 'Excellent', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  poor: { label: 'Poor', color: 'error' },
};

export const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatCompact = (amount) => {
  const n = Number(amount || 0);
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(2)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
};
