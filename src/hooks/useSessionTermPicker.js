import { useCallback, useEffect, useState } from 'react';
import {
  fetchTenantSessions,
  fetchTenantTerms,
  fetchActiveTenantSessionTerm,
  fetchTenantSessionTerms,
} from '@/api/tenant/session-term/sessionTermApi';

/**
 * Shared session/term picker state.
 *
 * Fetches this tenant's own sessions and terms — NOT the landlord's session
 * catalog, which is only ever used to onboard a new session into a tenant
 * (see fetchLandlordSessions) — optionally preselects the currently active
 * session/term, and (when a session is selected) loads that session's
 * session-terms for a cascading term dropdown.
 *
 * Replaces the ad-hoc fetch-and-useState session/term logic that used to be
 * copy-pasted independently into many page components.
 *
 * @param {Object} [options]
 * @param {boolean} [options.autoSelectActive=true] - preselect the active session/term on mount
 * @param {boolean} [options.loadSessionTerms=true] - fetch session-terms for the selected session (cascade)
 * @returns {{
 *   sessions: Array, terms: Array, sessionTerms: Array,
 *   sessionId: number|null, termId: number|null, sessionTermId: number|null,
 *   setSessionId: Function, setTermId: Function,
 *   loading: boolean, error: Error|null, refetch: Function,
 * }}
 */
export const useSessionTermPicker = ({ autoSelectActive = true, loadSessionTerms = true } = {}) => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [termId, setTermId] = useState(null);
  const [sessionTermId, setSessionTermId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [sessionsRes, termsRes, activeRes] = await Promise.all([
          fetchTenantSessions({ per_page: 100 }),
          fetchTenantTerms(),
          autoSelectActive ? fetchActiveTenantSessionTerm() : Promise.resolve(null),
        ]);

        if (!mounted) return;

        setSessions(sessionsRes?.data ?? []);
        setTerms(termsRes?.data ?? []);

        const active = activeRes?.data ?? null;
        if (active) {
          setSessionId(active.session_id);
          setTermId(active.term_id);
          setSessionTermId(active.id);
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectActive, refetchToken]);

  useEffect(() => {
    if (!loadSessionTerms || !sessionId) {
      setSessionTerms([]);
      return undefined;
    }

    let mounted = true;

    fetchTenantSessionTerms({ sessionId, per_page: 100 })
      .then((res) => {
        if (mounted) setSessionTerms(res?.data ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err);
      });

    return () => {
      mounted = false;
    };
  }, [sessionId, loadSessionTerms]);

  return {
    sessions,
    terms,
    sessionTerms,
    sessionId,
    termId,
    sessionTermId,
    setSessionId,
    setTermId,
    loading,
    error,
    refetch,
  };
};

export default useSessionTermPicker;
