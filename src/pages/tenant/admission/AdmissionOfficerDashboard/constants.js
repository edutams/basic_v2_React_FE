// ── Reference palette ────────────────────────────────────────────────
export const BLUE = '#3B82F6';
export const MAGENTA = '#EC4899';
export const GREEN = '#22C55E';
export const PURPLE = '#8B5CF6';
export const ORANGE = '#F59E0B';
export const RED = '#EF4444';

export const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

export const formatCompact = (amount) => {
  const n = Number(amount || 0);
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(2)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
};

export const num = (v) => Number(v || 0);

// Deterministic rising sparkline series (10 weekly periods; max = 84, used to scale to the card total)
export const SPARK_MAX = 84;
export const sparkSeries = Array.from({ length: 10 }, (_, i) => ({
  label: `Wk ${i + 1}`,
  v: 18 + i * 7 + (i % 3) * 5,
}));

// Shorten "2023/2024" → "2023/24"
export const shortSession = (s) =>
  String(s || '').replace(/\/(\d{4})$/, (m, y) => `/${String(Number(y) % 100).padStart(2, '0')}`);
