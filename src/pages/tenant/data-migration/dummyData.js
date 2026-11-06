// Placeholder data for the "Migrate from V1" UI preview. Every number and
// timestamp here is illustrative only — none of it comes from a real scan
// or run yet. Swapped out for live API data once the migration backend
// lands; the shape mirrors what that response is expected to look like so
// the swap is mostly a data-source change, not a redesign.

export const DUMMY_SCHOOL = {
  name: 'Ridgeview High School',
  v1SchoolId: 'RHS-0142',
  lastV1Activity: 'Yesterday, 16:40',
  linkedBy: 'Ada Okafor (Admin)',
  scannedAt: 'Scanned today, 10:12',
};

export const DUMMY_DATA_TYPES = [
  { key: 'sessions', name: 'Academic sessions & terms', inV1: 12, inV2: 0, toCopy: 12, waitsFor: [], required: true, note: 'Required — everything else depends on it' },
  { key: 'classes', name: 'Classes & arms', inV1: 48, inV2: 0, toCopy: 48, waitsFor: ['Sessions'], required: true, note: 'Required by students and subjects' },
  { key: 'subjects', name: 'Subjects', inV1: 36, inV2: 0, toCopy: 36, waitsFor: ['Classes'], required: false, note: 'Needed for results' },
  { key: 'staff', name: 'Staff', inV1: 84, inV2: 38, toCopy: 46, waitsFor: [], required: false, note: '38 match existing V2 staff' },
  { key: 'students', name: 'Students', inV1: 1912, inV2: 0, toCopy: 1912, waitsFor: ['Classes'], required: false, note: 'Includes 212 graduated students' },
  { key: 'guardians', name: 'Parents & guardians', inV1: 2406, inV2: 0, toCopy: 2406, waitsFor: ['Students'], required: false, note: 'Linked to their students' },
  { key: 'enrolments', name: 'Enrolments', inV1: 5730, inV2: 0, toCopy: 5730, waitsFor: ['Students', 'Sessions'], required: false, note: 'Which class each student was in, per term' },
  { key: 'attendance', name: 'Attendance', inV1: 184220, inV2: 0, toCopy: 184220, waitsFor: ['Enrolments'], required: false, note: 'Largest set — can be added in a later run', defaultSelected: false },
  { key: 'results', name: 'Assessments & results', inV1: 61488, inV2: 0, toCopy: 61488, waitsFor: ['Enrolments', 'Subjects'], required: false, note: 'Scores, grades and report remarks' },
  { key: 'fees', name: 'Fees & payments', inV1: 9354, inV2: 0, toCopy: 9354, waitsFor: ['Students'], required: false, note: 'Invoices, payments and balances' },
];

export const DUMMY_READINESS_CHECKS = [
  { label: 'School found in V1', detail: 'Matched to this V2 school by your admin account.', status: 'pass' },
  { label: 'Read-only access confirmed', detail: 'The migration cannot write to V1.', status: 'pass' },
  { label: 'No other migration running', detail: 'Only one run per school can happen at a time.', status: 'pass' },
  { label: '38 staff already exist in V2', detail: "They'll be matched by email, not duplicated.", status: 'pass' },
  { label: '214 records have gaps', detail: "Missing or conflicting values. You'll decide how to handle them next.", status: 'warning' },
];

export const DUMMY_NEW_FIELDS = [
  { field: '[Admission type]', required: true, on: 'Students', value: 'Regular' },
  { field: '[Employment type]', required: true, on: 'Staff', value: 'Full-time' },
  { field: '[Class capacity]', required: false, on: 'Classes', value: 'Leave empty' },
  { field: '[Fee category]', required: false, on: 'Fee items', value: 'Match by V1 fee name' },
];

export const DUMMY_NEEDS_ATTENTION = [
  { count: 162, title: 'students missing date of birth', example: 'e.g. Chidi A. (RHS-2019/044), Mariam K. (RHS-2020/118)', resolution: 'Copy and flag for follow-up' },
  { count: 41, title: 'payments point to a deleted fee item', example: 'Fee item "Excursion 2022" no longer exists in V1', resolution: 'Copy under "Unmapped fee"' },
  { count: 11, title: 'duplicate admission numbers', example: 'Two students share RHS-2018/007', resolution: 'Skip and list in report' },
];

export const DUMMY_MATCH_RULES = [
  { type: 'Staff', rule: 'Email address' },
  { type: 'Students', rule: 'Admission number' },
  { type: 'Parents', rule: 'Phone, then email' },
  { type: 'Everything else', rule: 'V1 record ID' },
];

export const DUMMY_LAST_DRY_RUN = {
  ranAt: 'Today, 10:14',
  errors: 0,
  warnings: 214,
  recordsWouldCopy: 81070,
};

export const DUMMY_RUN_PROGRESS = {
  runNumber: 3,
  startedAt: 'today at 10:21',
  startedBy: 'Ada Okafor',
  etaMinutes: 14,
  copied: 49168,
  total: 81070,
  percent: 61,
};

export const DUMMY_PROGRESS_BY_TYPE = [
  { name: 'Academic sessions & terms', status: 'done', detail: '12 copied' },
  { name: 'Classes & arms', status: 'done', detail: '48 copied' },
  { name: 'Subjects', status: 'done', detail: '36 copied' },
  { name: 'Staff', status: 'done', detail: '46 copied · 38 matched' },
  { name: 'Students', status: 'done', detail: '1,901 copied · 11 skipped' },
  { name: 'Parents & guardians', status: 'done', detail: '2,406 copied' },
  { name: 'Enrolments', status: 'done', detail: '5,730 copied' },
  { name: 'Assessments & results', status: 'in_progress', detail: '38,940 / 61,488 · batch 78 of 123', percent: 63 },
  { name: 'Fees & payments', status: 'waiting', detail: 'Waiting' },
];

export const DUMMY_ACTIVITY_LOG = [
  { time: '10:33:52', text: 'Results — batch 78 committed (500)' },
  { time: '10:33:47', text: 'Results — batch 77 committed (500)' },
  { time: '10:33:41', text: 'Results — batch 76 committed (500)' },
  { time: '10:31:05', text: 'Results — started, checkpoint saved' },
  { time: '10:31:04', text: 'Enrolments — complete, 5,730 copied' },
  { time: '10:27:19', text: 'Parents — complete, 2,406 copied' },
  { time: '10:24:02', text: 'Students — 162 flagged: missing date of birth' },
  { time: '10:23:58', text: 'Students — 11 skipped: duplicate admission no.' },
  { time: '10:22:10', text: 'Staff — 38 matched by email, left unchanged' },
  { time: '10:21:00', text: 'Run #3 started · lock acquired for RHS-0142' },
];

export const DUMMY_VERIFICATION_CHECKS = [
  { label: 'Record counts match V1', ratio: '9 / 9', detail: 'For all 9 data types, after skips and matches.', status: 'pass' },
  { label: 'Every student has a class for the current term', ratio: '1,901 / 1,901', detail: 'Checked against enrolments.', status: 'pass' },
  { label: 'Result totals match V1', ratio: '0 differences', detail: 'Sum of scores per subject, per term.', status: 'pass' },
  { label: 'Outstanding fee balances', ratio: '1 difference', detail: "Differs by one payment that wasn't copied — see below.", status: 'warning' },
  { label: 'Parents linked to students', ratio: '2,406 / 2,406', detail: 'No orphaned guardians.', status: 'pass' },
];

export const DUMMY_FOLLOW_UPS = [
  { issue: 'Duplicate admission numbers', records: 11, status: 'Not copied', nextStep: 'Fix in V1' },
  { issue: 'Payment with an invalid amount', records: 1, status: 'Not copied', nextStep: 'View record' },
  { issue: 'Students missing date of birth', records: 162, status: 'Copied, flagged', nextStep: 'Update in V2' },
  { issue: 'Payments under "Unmapped fee"', records: 41, status: 'Copied, flagged', nextStep: 'Assign fee items' },
];

export const DUMMY_RUN_HISTORY = [
  { label: 'Run #3', when: 'Today, 10:21', by: 'Ada Okafor', status: 'Complete' },
  { label: 'Dry run #2', when: 'Today, 10:14', by: 'Ada Okafor', status: 'Preview only' },
  { label: 'Dry run #1', when: 'Oct 30, 15:02', by: 'Ada Okafor', status: 'Preview only' },
];
