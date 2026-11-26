import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { fetchSessions, fetchTerms, fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';

/**
 * Session + Term picker, self-contained (fetches its own options and manages
 * its own selected state) so every page that needs this filter just drops
 * it in once instead of re-declaring the same sessions/terms state +
 * fetchSessions/fetchTerms/fetchActiveSessionTerm wiring every tab on
 * `/transactions` already duplicates from scratch.
 *
 * Reports `{ sessionId, termId }` (both nullable — "All") via `onChange`
 * whenever either selection changes, including once on mount after
 * auto-selecting the currently active session/term (skippable via
 * `autoSelectActive={false}`).
 */
const SessionTermFilter = ({ onChange, autoSelectActive = true, size = 'small', minWidth = 150 }) => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');

  useEffect(() => {
    fetchSessions()
      .then((res) => setSessions(res.data || res || []))
      .catch(() => setSessions([]));
    fetchTerms()
      .then((res) => setTerms(res.data || res || []))
      .catch(() => setTerms([]));

    if (autoSelectActive) {
      fetchActiveSessionTerm()
        .then((active) => {
          if (active?.session_id) setSessionId(active.session_id);
          if (active?.term_id) setTermId(active.term_id);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onChange?.({ sessionId: sessionId || null, termId: termId || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, termId]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
      <FormControl size={size} sx={{ minWidth }}>
        <InputLabel>Session</InputLabel>
        <Select label="Session" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
          <MenuItem value="">All Sessions</MenuItem>
          {sessions.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.session_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size={size} sx={{ minWidth }}>
        <InputLabel>Term</InputLabel>
        <Select label="Term" value={termId} onChange={(e) => setTermId(e.target.value)}>
          <MenuItem value="">All Terms</MenuItem>
          {terms.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.term_name || t.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SessionTermFilter;
