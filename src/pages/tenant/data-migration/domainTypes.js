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
    note: 'Covers: sessions, terms, session_terms, weeks, week_terms',
  },
  {
    key: 'classes',
    name: 'Classes & arms',
    available: true,
    note: 'Covers: classes, school_divisions, programme_class',
  },
  { key: 'subjects', name: 'Subjects', available: true, note: 'Covers: programme_subject' },
  { key: 'staff', name: 'Staff', available: true },
  { key: 'students', name: 'Students', available: true },
  {
    key: 'guardians',
    name: 'Parents & guardians',
    available: true,
    note: 'Covers: guardians, guardian_wards',
  },
  {
    key: 'enrolments',
    name: 'Enrolments',
    available: true,
    note: 'Covers: student_registrations (class/arm placement), course_registration (subject enrolments) — also syncs class_curriculum/class_subjects',
  },
  {
    key: 'subject_groups',
    name: 'Subject groups & results',
    available: true,
    note: 'Covers: subject_groups, subject_group_results',
  },
  {
    key: 'attendance',
    name: 'Attendance',
    available: true,
    note: 'Covers: attendances, attendance_affective_psychomotor',
  },
  {
    key: 'results',
    name: 'Assessments & results',
    available: true,
    note: 'Covers: result_grade_settings, results',
  },
  {
    key: 'fees',
    name: 'Fees & payments',
    available: true,
    note: 'Covers: bursary_payment_categories, bursary_payment_names, bursary_installments, bursary_schedules, bursary_invoices, bursary_payment_transactions',
  },
  { key: 'chat', name: 'Chat/messaging', available: true, note: 'Covers: chat_messages' },
  {
    key: 'quizzes',
    name: 'Quizzes',
    available: true,
    note: 'Covers: quizzes, quiz_questions, quiz_answers, quiz_total_scores',
  },
  { key: 'subject_teachers', name: 'Subject-teacher assignments', available: true, note: 'Covers: subject_teachers' },
  {
    key: 'class_teachers',
    name: 'Class teachers & report-card comments',
    available: true,
    note: 'Covers: class_teachers, comment_grades, general_comments',
  },
  {
    key: 'lesson_notes',
    name: 'Lesson notes & scheme of work',
    available: true,
    note: 'Covers: scheme_of_works, topics, subtopics, learning_objectives, lesson_notes, lesson_notes_approval',
  },
  {
    key: 'calendar_and_domains',
    name: 'School calendar & result domains',
    available: true,
    note: 'Covers: psychomotor_domains, affective_domains, holidays, resumption_closing_dates, attendance_configurations, weeks, week_terms',
  },
  {
    key: 'reporting_extras',
    name: 'Result templates & bursary settlements',
    available: true,
    note: 'Covers: result_templates, result_publishes, bursary_settlements, result_promotion_settings, invoice_messaging',
  },
  {
    key: 'admissions',
    name: 'Admissions',
    available: true,
    note: 'Covers: admission_batches, admissions',
  },
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
