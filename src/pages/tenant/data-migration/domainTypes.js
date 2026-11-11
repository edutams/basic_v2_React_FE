// Single source of truth for the data-type rows shown across every stage
// of the migration wizard. `available: true` marks the domains that have a
// real DomainMigrator built on the backend (docs/migration/STAGE2_PLAN.md
// build order, row 1) — every other domain is still real/listed but can't
// actually be run yet, so the UI must disable it rather than pretend.
export const DATA_TYPES = [
  { key: 'sessions_terms', name: 'Academic sessions & terms', waitsFor: [], available: true },
  { key: 'classes', name: 'Classes & arms', waitsFor: ['Sessions & terms'], available: true },
  { key: 'subjects', name: 'Subjects', waitsFor: ['Classes'], available: true },
  { key: 'staff', name: 'Staff', waitsFor: [], available: true },
  { key: 'students', name: 'Students', waitsFor: ['Classes'], available: true },
  { key: 'guardians', name: 'Parents & guardians', waitsFor: ['Students'], available: true },
  { key: 'enrolments', name: 'Enrolments', waitsFor: ['Students', 'Sessions & terms'], available: true },
  { key: 'attendance', name: 'Attendance', waitsFor: ['Enrolments'], available: true },
  { key: 'results', name: 'Assessments & results', waitsFor: ['Enrolments', 'Subjects'], available: true },
  { key: 'fees', name: 'Fees & payments', waitsFor: ['Students'], available: true },
  { key: 'chat', name: 'Chat/messaging', waitsFor: ['Staff', 'Students', 'Parents & guardians'], available: true },
  { key: 'quizzes', name: 'Quizzes', waitsFor: ['Students', 'Enrolments'], available: true },
  { key: 'subject_teachers', name: 'Subject-teacher assignments', waitsFor: ['Staff', 'Subjects', 'Classes'], available: true },
  { key: 'class_teachers', name: 'Class teachers & report-card comments', waitsFor: ['Staff', 'Students', 'Enrolments'], available: true },
];

export const AVAILABLE_DOMAIN_KEYS = DATA_TYPES.filter((row) => row.available).map((row) => row.key);

export const DATA_TYPE_BY_KEY = DATA_TYPES.reduce((acc, row) => {
  acc[row.key] = row;
  return acc;
}, {});

/** Statuses MigrationRun.status settles on — polling stops once one of these is reached. */
export const SETTLED_RUN_STATUSES = ['completed', 'failed'];
