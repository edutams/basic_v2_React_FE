import api from './tenant_api';

// Fetch current active session
export const fetchCurrentSession = async () => {
  const response = await api.get('/curriculum/current-session');
  return response.data;
};

// Fetch all available landlord terms for the tenant
export const fetchTerms = async () => {
  const response = await api.get('/curriculum/terms/list');
  return response.data;
};

// Fetch session terms with display names
export const fetchSessionTerms = async (sessionId) => {
  const response = await api.get('/curriculum/session-terms', {
    params: { session_id: sessionId },
  });
  return response.data;
};

// Update display name for a term
export const updateDisplayName = async (appTermId, displayName) => {
  const response = await api.post('/curriculum/update-display-name', {
    app_term_id: appTermId,
    display_name: displayName,
  });
  return response.data;
};

// Subscribe to a session term
export const subscribeSessionTerm = async (sessionId, termId) => {
  const response = await api.post('/curriculum/subscribe-session-term', {
    session_id: sessionId,
    term_id: termId,
  });
  return response.data;
};
