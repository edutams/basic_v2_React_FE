import api from '@/api/tenant/tenant_api';

// The one session-term that immediately precedes `sessionTermId` within the
// same session — same lookup the automatic SessionTermActivated listeners
// use, so the "From Term" field never lets an admin free-pick some other
// term in the session (there is exactly one "previous term", or none at a
// session boundary).
export const fetchPreviousTerm = async (sessionTermId) => {
  const response = await api.get(`/term-migration/previous-term/${sessionTermId}`);
  return response.data;
};

// Manual "migrate now" triggers mirroring what SessionTermActivated already
// does automatically — each carries one kind of record forward from one
// term into another (same session only; the backend rejects anything else,
// same as the automatic listeners).
const migrate = (path) => async ({ fromSessionTermId, toSessionTermId }) => {
  const response = await api.post(`/term-migration/${path}`, {
    from_session_term_id: fromSessionTermId,
    to_session_term_id: toSessionTermId,
  });
  return response.data;
};

export const migrateStudents = migrate('students');
export const migrateCourseRegistrations = migrate('course-registrations');
export const migrateClassTeacherAllocations = migrate('class-teacher-allocations');
export const migrateSubjectTeacherAllocations = migrate('subject-teacher-allocations');
export const migrateBursarySchedules = migrate('bursary-schedules');
