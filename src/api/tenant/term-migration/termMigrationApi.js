import api from '@/api/tenant/tenant_api';

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
export const migrateClassTeacherAllocations = migrate('class-teacher-allocations');
export const migrateSubjectTeacherAllocations = migrate('subject-teacher-allocations');
export const migrateBursarySchedules = migrate('bursary-schedules');
