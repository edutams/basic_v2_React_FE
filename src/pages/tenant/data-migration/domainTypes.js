// Single source of truth for the data-type rows shown across every stage
// of the migration wizard. `available: true` marks the domains that have a
// real DomainMigrator built on the backend (docs/migration/STAGE2_PLAN.md
// build order, row 1) — every other domain is still real/listed but can't
// actually be run yet, so the UI must disable it rather than pretend.
//
// `waitsFor` holds domain KEYS (not display names) — mirrors the backend's
// MigrationRun::DEPENDENCIES exactly (app/Models/Tenant/DataMigration/
// MigrationRun.php), since 2026-11-11 this is enforced, not just shown:
// a domain whose dependencies haven't had a completed REAL run yet (a dry
// run never counts — it never actually writes anything) gets disabled in
// Review & Configure, with an explanation, instead of being selectable and
// failing with a wall of "hasn't been migrated yet" errors. Previously
// `waitsFor` held free-text display names that didn't always match a real
// domain's own `name` (e.g. 'Classes' vs the real 'Classes & arms') — harmless
// back when this was purely decorative text, but had to be fixed now that
// it's used for real lookups.
export const DATA_TYPES = [
  {
    key: 'sessions_terms',
    name: 'Academic sessions & terms',
    waitsFor: [],
    available: true,
    note: 'Includes weeks & their dates, not just sessions/terms — the count covers both',
  },
  { key: 'classes', name: 'Classes & arms', waitsFor: ['sessions_terms'], available: true },
  { key: 'subjects', name: 'Subjects', waitsFor: ['classes'], available: true },
  { key: 'staff', name: 'Staff', waitsFor: [], available: true },
  { key: 'students', name: 'Students', waitsFor: ['classes'], available: true },
  { key: 'guardians', name: 'Parents & guardians', waitsFor: ['students'], available: true },
  { key: 'enrolments', name: 'Enrolments', waitsFor: ['students', 'sessions_terms'], available: true },
  { key: 'subject_groups', name: 'Subject groups & results', waitsFor: ['classes', 'subjects', 'enrolments'], available: true },
  { key: 'attendance', name: 'Attendance', waitsFor: ['enrolments', 'sessions_terms'], available: true },
  { key: 'results', name: 'Assessments & results', waitsFor: ['enrolments', 'subjects', 'sessions_terms'], available: true },
  { key: 'fees', name: 'Fees & payments', waitsFor: ['students', 'classes', 'sessions_terms'], available: true },
  { key: 'chat', name: 'Chat/messaging', waitsFor: ['staff', 'students', 'guardians'], available: true },
  { key: 'quizzes', name: 'Quizzes', waitsFor: ['students', 'enrolments', 'classes', 'sessions_terms'], available: true },
  { key: 'subject_teachers', name: 'Subject-teacher assignments', waitsFor: ['staff', 'subjects', 'classes', 'sessions_terms'], available: true },
  { key: 'class_teachers', name: 'Class teachers & report-card comments', waitsFor: ['staff', 'students', 'enrolments', 'classes', 'sessions_terms'], available: true },
  { key: 'lesson_notes', name: 'Lesson notes & scheme of work', waitsFor: ['subjects', 'classes', 'subject_teachers', 'sessions_terms'], available: true },
  { key: 'calendar_and_domains', name: 'School calendar & result domains', waitsFor: ['sessions_terms'], available: true },
  { key: 'reporting_extras', name: 'Result templates & bursary settlements', waitsFor: ['sessions_terms', 'classes', 'enrolments'], available: true },
  { key: 'admissions', name: 'Admissions', waitsFor: ['sessions_terms', 'classes', 'guardians'], available: true },
];

export const AVAILABLE_DOMAIN_KEYS = DATA_TYPES.filter((row) => row.available).map((row) => row.key);

export const DATA_TYPE_BY_KEY = DATA_TYPES.reduce((acc, row) => {
  acc[row.key] = row;
  return acc;
}, {});

/** Display names for a list of domain keys — e.g. row.waitsFor — joined for human-readable text. */
export const dependencyNames = (domainKeys) => domainKeys.map((key) => DATA_TYPE_BY_KEY[key]?.name || key).join(', ');

/** Statuses MigrationRun.status settles on — polling stops once one of these is reached. */
export const SETTLED_RUN_STATUSES = ['completed', 'failed'];
