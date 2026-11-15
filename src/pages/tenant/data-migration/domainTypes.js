// Single source of truth for the data-type rows shown across every stage
// of the migration wizard. `available: true` marks the domains that have a
// real DomainMigrator built on the backend (docs/migration/STAGE2_PLAN.md
// build order, row 1) — every other domain is still real/listed but can't
// actually be run yet, so the UI must disable it rather than pretend.
//
// migration-hardening Step 4 item 7 — no `waitsFor` field here anymore.
// This used to hardcode its own copy of the backend's
// MigrationRun::DEPENDENCIES, which is exactly how Enrolments → Classes
// went undeclared in one of the two copies but not the other. Dependency
// data now comes from GET /data-migration/dependency-graph (fetched once,
// passed down as a plain {domain: [key, ...]} object) — see
// fetchDependencyGraph() — never hardcoded here again.
export const DATA_TYPES = [
  {
    key: 'sessions_terms',
    name: 'Academic sessions & terms',
    available: true,
    note: 'Includes weeks & their dates, not just sessions/terms — the count covers both',
  },
  { key: 'classes', name: 'Classes & arms', available: true },
  { key: 'subjects', name: 'Subjects', available: true },
  { key: 'staff', name: 'Staff', available: true },
  { key: 'students', name: 'Students', available: true },
  { key: 'guardians', name: 'Parents & guardians', available: true },
  { key: 'enrolments', name: 'Enrolments', available: true },
  { key: 'subject_groups', name: 'Subject groups & results', available: true },
  { key: 'attendance', name: 'Attendance', available: true },
  { key: 'results', name: 'Assessments & results', available: true },
  { key: 'fees', name: 'Fees & payments', available: true },
  { key: 'chat', name: 'Chat/messaging', available: true },
  { key: 'quizzes', name: 'Quizzes', available: true },
  { key: 'subject_teachers', name: 'Subject-teacher assignments', available: true },
  { key: 'class_teachers', name: 'Class teachers & report-card comments', available: true },
  { key: 'lesson_notes', name: 'Lesson notes & scheme of work', available: true },
  { key: 'calendar_and_domains', name: 'School calendar & result domains', available: true },
  { key: 'reporting_extras', name: 'Result templates & bursary settlements', available: true },
  { key: 'admissions', name: 'Admissions', available: true },
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
