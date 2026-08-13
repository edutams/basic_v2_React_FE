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

// ── Mock fallbacks ───────────────────────────────────────────────────
// Used when an analytics endpoint has not started returning data yet, so
// the chart cards render populated instead of staying blank. Follows the
// same pattern as the enrollment mock data in the dashboard index.

export const MOCK_TOP_RESOURCES = [
  { name: 'Slides/Notes', percentage: 46 },
  { name: 'Video Lessons', percentage: 32 },
  { name: 'Quizzes', percentage: 22 },
];

// Full mock payload for the Teacher Analytics panel — the endpoint
// (/dashboard/admin/teacher-analytics) is implemented but the frontend call is
// temporarily commented out, so the panel renders this data instead. Top
// Resource Usage includes Quizzes, so that bar shows even before the endpoint
// returns real values.
export const MOCK_TEACHER_ANALYTICS = {
  lesson_plans_created: 128,
  quizzes_created: 86,
  assignments_given: 0,
  video_resources_generated: 54,
  resource_usage: { level: 'Medium', value: 65 },
  resource_usage_series: [
    { label: 'Sep', v: 12 },
    { label: 'Oct', v: 28 },
    { label: 'Nov', v: 41 },
    { label: 'Dec', v: 55 },
    { label: 'Jan', v: 68 },
    { label: 'Feb', v: 79 },
  ],
  top_resources: MOCK_TOP_RESOURCES,
};

export const MOCK_EXAM_PERFORMANCE = [
  { name: 'Excellent (80%+)', value: 28 },
  { name: 'Good (60-79%)', value: 44 },
  { name: 'Average (40-59%)', value: 19 },
  { name: 'Below (0-39%)', value: 9 },
];

export const MOCK_RESOURCE_ENGAGEMENT = [
  { name: 'Videos Watched', value: 1286 },
  { name: 'Notes Read', value: 954 },
  { name: 'Quizzes Taken', value: 712 },
];

