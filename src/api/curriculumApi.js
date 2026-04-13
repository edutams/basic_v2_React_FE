import api from './tenant_api';

// Fetch all curriculums
export const fetchCurriculums = async () => {
  const response = await api.get('/curriculum/get_all_curriculums');
  return response.data;
};

// Create a new curriculum
export const createCurriculum = async (data) => {
  const response = await api.post('/curriculum/create_curriculum', data);
  return response.data;
};

// Update a curriculum
export const updateCurriculum = async (id, data) => {
  const response = await api.put(`/curriculum/update_curriculum/${id}`, data);
  return response.data;
};

// Delete a curriculum
export const deleteCurriculum = async (id) => {
  const response = await api.delete(`/curriculum/delete_curriculum/${id}`);
  return response.data;
};

// Fetch active curriculums
export const fetchActiveCurriculums = async () => {
  const response = await api.get('/curriculum/active/list');
  return response.data;
};

// Fetch class-curriculum assignments
export const fetchClassAssignments = async (sessionId, termId) => {
  const response = await api.get('/curriculum/class-assignments', {
    params: { session_id: sessionId, term_id: termId },
  });
  return response.data;
};

// Save class-curriculum assignments
export const saveClassAssignments = async (sessionId, termId, assignments) => {
  const response = await api.post('/curriculum/class-assignments', {
    session_id: sessionId,
    term_id: termId,
    assignments,
  });
  return response.data;
};

// Fetch sessions
export const fetchSessions = async () => {
  const response = await api.get('/curriculum/sessions/list');
  return response.data;
};

// Fetch terms
export const fetchTerms = async (sessionId = null) => {
  const params = sessionId ? { session_id: sessionId } : {};
  const response = await api.get('/curriculum/terms/list', { params });
  return response.data;
};
