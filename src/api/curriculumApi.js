import api from './auth';


// Fetch all curriculums
export const fetchCurriculums = async () => {
  const response = await api.get('/landlord/v1/curriculum/get_all_curriculums');
  return response.data;
};

// Create a new curriculum
export const createCurriculum = async (data) => {
  const response = await api.post('/landlord/v1/curriculum/create_curriculum', data);
  return response.data;
};

// Update a curriculum
export const updateCurriculum = async (id, data) => {
  const response = await api.put(`/landlord/v1/curriculum/update_curriculum/${id}`, data);
  return response.data;
};

// Delete a curriculum
export const deleteCurriculum = async (id) => {
  const response = await api.delete(`/landlord/v1/curriculum/delete_curriculum/${id}`);
  return response.data;
};

// Fetch active curriculums
export const fetchActiveCurriculums = async () => {
  const response = await api.get('/landlord/v1/curriculum/active/list');
  return response.data;
};

// Fetch class-curriculum assignments
export const fetchClassAssignments = async (sessionId, termId) => {
  const response = await api.get('/landlord/v1/curriculum/class-assignments', {
    params: { session_id: sessionId, term_id: termId },
  });
  return response.data;
};

// Save class-curriculum assignments
export const saveClassAssignments = async (sessionId, termId, assignments) => {
  const response = await api.post('/landlord/v1/curriculum/class-assignments', {
    session_id: sessionId,
    term_id: termId,
    assignments,
  });
  return response.data;
};

// Fetch sessions
export const fetchSessions = async () => {
  const response = await api.get('/landlord/v1/curriculum/sessions/list');
  return response.data;
};

// Fetch terms
export const fetchTerms = async (sessionId = null) => {
  const params = sessionId ? { session_id: sessionId } : {};
  const response = await api.get('/landlord/v1/curriculum/terms/list', { params });
  return response.data;
};

// Fetch programmes
export const fetchProgrammes = async () => {
  const response = await api.get('/landlord/v1/curriculum/programmes');
  return response.data;
};

// Fetch subjects by curriculum
export const fetchSubjects = async (curriculumId) => {
  const response = await api.get(`/landlord/v1/curriculum/subjects/${curriculumId}`);
  return response.data;
};

// Fetch classes by programme
export const fetchClassesByProgramme = async (programmeId) => {
  const response = await api.get(`/landlord/v1/curriculum/classes-by-programme/${programmeId}`);
  return response.data;
};

// Fetch subjects by programme
export const fetchSubjectsByProgramme = async (programmeId) => {
  const response = await api.get(`/landlord/v1/curriculum/subjects/by-programme/${programmeId}`);
  return response.data;
};

// Create a new subject
export const createSubjectRecord = async (data) => {
  const response = await api.post('/landlord/v1/curriculum/create_subject', data);
  return response.data;
};

// Update an existing subject
export const updateSubjectRecord = async (id, data) => {
  const response = await api.put(`/landlord/v1/curriculum/update_subject/${id}`, data);
  return response.data;
};

// Delete a subject
export const deleteSubjectRecord = async (id) => {
  const response = await api.delete(`/landlord/v1/curriculum/delete_subject/${id}`);
  return response.data;
};

// Fetch class subjects with join to programme_subject
export const fetchClassSubjects = async (classId) => {
  const response = await api.get(`/curriculum/class-subjects/${classId}`);
  return response.data;
};

// Add or update a class subject
export const addOrUpdateClassSubject = async (data) => {
  const response = await api.post('/curriculum/class-subjects', data);
  return response.data;
};

// Fetch classes by programme
export const fetchClassesByProgrammeOld = async (programmeId) => {
  const response = await api.get(`/curriculum/classes-by-programme/${programmeId}`);
  return response.data;
};
