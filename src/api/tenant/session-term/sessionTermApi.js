import api from '@/api/tenant/tenant_api';

// Fetch current active session
export const fetchCurrentSession = async () => {
  const response = await api.get('/curriculum/current-session');
  return response.data;
};

// Fetch this tenant's own terms
export const fetchTerms = async () => {
  const response = await api.get('/terms');
  return response.data;
};

// Fetch this tenant's session-terms (pass sessionId to filter to one session, or
// nothing for the full list across all sessions). Each row carries both the raw
// shape (id, session_id, term_id, status, session:{session_name}, term:{term_name})
// AND legacy aliases (session_term_id, term_name, display_name) so every existing
// consumer's field names keep working regardless of which naming convention it
// was written against — display_name is just an alias for term_name (display
// terms are gone). There is no `is_subscribed` concept anymore — every
// session-term that exists is inherently part of the tenant's calendar; use
// `status === 'active'` to find the one currently in use.
export const fetchSessionTerms = async (sessionId = null) => {
  const params = { per_page: 100 };
  if (sessionId) params.session_id = sessionId;

  const response = await api.get('/session-terms', { params });
  const data = (response.data.data ?? []).map((row) => ({
    ...row,
    app_term_id: row.term_id,
    term_name: row.term?.term_name ?? null,
    display_term_id: row.term_id,
    display_name: row.term?.term_name ?? null,
    session_term_id: row.id,
    start_date: row.start_date ?? null,
  }));

  return { ...response.data, data };
};

// Rename a term for this tenant (e.g. "First Term" -> "Harmattan"); the term id is unchanged.
export const updateDisplayName = async (appTermId, displayName) => {
  const response = await api.put(`/terms/${appTermId}`, {
    term_name: displayName,
  });
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

// Convenience for imperative call sites that only need the active session-term's id
// (adapts the /session-terms/active shape's `id` field to what callers ask for).
export const fetchActiveSessionTermId = async () => {
  const response = await fetchActiveTenantSessionTerm();
  return response?.data?.id ?? null;
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
