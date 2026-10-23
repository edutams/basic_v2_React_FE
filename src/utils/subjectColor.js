// Subjects don't have a `color` set in the database yet (no color-picker UI
// exists to assign one) — every subject was silently falling back to the
// same gray, which is why the timetable looked flat/uncolorful despite each
// subject having its own icon. This gives every subject a distinct, stable
// color (same subject -> same color every time) until a real per-subject
// color picker exists.
const SUBJECT_COLOR_PALETTE = [
  '#2563EB', // blue
  '#DC2626', // red
  '#9333EA', // purple
  '#0891B2', // cyan
  '#16A34A', // green
  '#EA580C', // orange
  '#CA8A04', // amber
  '#92400E', // brown
  '#DB2777', // pink
  '#4F46E5', // indigo
  '#65A30D', // lime
  '#0D9488', // teal
];

/**
 * @param {{id?: string|number, subject_id?: string|number, color?: string|null}} subject
 */
export const getSubjectColor = (subject) => {
  if (subject?.color) return subject.color;

  const key = String(subject?.id ?? subject?.subject_id ?? '');
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return SUBJECT_COLOR_PALETTE[hash % SUBJECT_COLOR_PALETTE.length];
};

export default getSubjectColor;
