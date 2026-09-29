import { useState, useEffect } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Typography, Tabs, Tab, Skeleton, Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';

const SessionTermSelector = ({ onSessionTermChange, loading: externalLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [currentTab, setCurrentTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch sessions on mount ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      setSessionsLoading(true);
      setError(null);
      try {
        const res = await fetchTenantSessions({ pagination: false });
        if (cancelled) return;

        const list = res?.data ?? [];
        setSessions(list);

        if (list.length > 0) {
          setSelectedSession(String(list[0].id));
        } else {
          setError('No sessions found. Please create a session first.');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch sessions:', err);
        setError('Failed to load sessions. Please try again.');
        setSessions([]);
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    };
    loadSessions();

    return () => { cancelled = true; };
  }, []);

  // ── Fetch terms when session changes ───────────────────────────
  useEffect(() => {
    if (!selectedSession) {
      setSessionTerms([]);
      setCurrentTab('');
      onSessionTermChange?.(null);
      return;
    }

    let cancelled = false;

    const loadTerms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchSessionTerms(selectedSession);
        if (cancelled) return;

        const list = res?.data ?? [];
        setSessionTerms(list);

        if (list.length > 0) {
          const active = list.find((st) => st.status === 'active');
          const pick = active ?? list[0];
          setCurrentTab(String(pick.id));
          onSessionTermChange?.(pick.id);
        } else {
          setCurrentTab('');
          onSessionTermChange?.(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch session terms:', err);
        setError('Failed to load terms for this session.');
        setSessionTerms([]);
        setCurrentTab('');
        onSessionTermChange?.(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadTerms();

    return () => { cancelled = true; };
  }, [selectedSession]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
    const term = sessionTerms.find((st) => String(st.id) === newValue);
    onSessionTermChange?.(term ? term.id : null);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* ── Error Banner ───────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Session Dropdown ──────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Session</InputLabel>
          {sessionsLoading ? (
            <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
          ) : (
            <Select value={selectedSession} label="Session" onChange={handleSessionChange}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.session_name}</MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Box>

      {/* ── Term Tabs ─────────────────────────────────────── */}
      {loading ? (
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
      ) : sessionTerms.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedSession
              ? 'No terms available for this session. Please set up session terms first.'
              : 'Please select a session.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                minHeight: 36,
              },
            }}
          >
            {sessionTerms.map((st) => (
              <Tab
                key={st.id}
                label={st.term_name ?? st.term?.term_name ?? `Term ${st.term_id}`}
                value={String(st.id)}
              />
            ))}
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default SessionTermSelector;
