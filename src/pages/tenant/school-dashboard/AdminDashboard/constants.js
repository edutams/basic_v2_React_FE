// ── Reference palette ────────────────────────────────────────────────
export const BLUE = '#3B82F6';
export const GREEN = '#22C55E';
export const ORANGE = '#F59E0B';
export const PURPLE = '#8B5CF6';
export const RED = '#EF4444';

export const formatCompact = (amount) => {
  const n = Number(amount || 0);
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(2)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
};

export const num = (v) => Number(v || 0);

// Deterministic 10-point trend series for the overview sparklines (up / down)
export const makeSparkData = (down = false) =>
  Array.from({ length: 10 }, (_, i) => ({
    label: `Wk ${i + 1}`,
    v: down ? 90 - i * 8 : 16 + i * 8,
  }));

