import api from '@/api/tenant/tenant_api';

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

// Fetch session terms with display names (pass sessionId to filter, or nothing for all subscribed)
export const fetchSessionTerms = async (sessionId = null) => {
  const params = {};
  if (sessionId) params.session_id = sessionId;

  const response = await api.get('/curriculum/session-terms', { params });
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
export const subscribeSessionTerm = async (sessionId, appTermId) => {
  const response = await api.post('/curriculum/subscribe-session-term', {
    session_id: sessionId,
    app_term_id: appTermId,
  });
  return response.data;
};

// Toggle session term status
export const toggleSessionTermStatus = async (id) => {
  const response = await api.post(`/curriculum/toggle-session-term-status/${id}`);
  return response.data;
};

// ── New Session / Term / Session-Term management ──────────────────────────

// Fetch the landlord's active sessions (for the "Add Session" and "Set Session/Term" pickers)
export const fetchLandlordSessions = async () => {
  const response = await api.get('/sessions/landlord');
  return response.data;
};

// Fetch the tenant's own sessions (paginated)
export const fetchTenantSessions = async ({ page = 1, per_page = 10 } = {}) => {
  const response = await api.get('/sessions', { params: { page, per_page } });
  return response.data;
};

// Add a landlord session to the tenant's own sessions table
export const createTenantSession = async (landlordSessionId) => {
  const response = await api.post('/sessions', { landlord_session_id: landlordSessionId });
  return response.data;
};

// Toggle a tenant session's status
export const toggleTenantSessionStatus = async (id) => {
  const response = await api.put(`/sessions/${id}/toggle-status`);
  return response.data;
};

// Fetch the tenant's own terms
export const fetchTenantTerms = async () => {
  const response = await api.get('/terms');
  return response.data;
};

// Sync all active landlord terms into the tenant's own terms table
export const syncLandlordTerms = async () => {
  const response = await api.post('/terms/sync');
  return response.data;
};

// Fetch the currently active session-term, independent of pagination
export const fetchActiveTenantSessionTerm = async () => {
  const response = await api.get('/session-terms/active');
  return response.data;
};

// Fetch the tenant's session-term mappings (paginated; pass sessionId to filter)
export const fetchTenantSessionTerms = async ({ page = 1, per_page = 10, sessionId = null } = {}) => {
  const params = { page, per_page };
  if (sessionId) params.session_id = sessionId;

  const response = await api.get('/session-terms', { params });
  return response.data;
};

// Create a session-term mapping
export const createTenantSessionTerm = async ({ session_id, term_id, status }) => {
  const response = await api.post('/session-terms', { session_id, term_id, status });
  return response.data;
};

// Toggle a session-term mapping's status
export const toggleTenantSessionTermStatus = async (id) => {
  const response = await api.put(`/session-terms/${id}/toggle-status`);
  return response.data;
};
