import { useState, useEffect } from 'react';
import {
  Box, FormControl, InputLabel, Select, MenuItem, Typography, Tabs, Tab, Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const mockSessions = [
  { id: 1, session_name: '2025/2026' },
  { id: 2, session_name: '2024/2025' },
];

const mockTermsBySession = {
  1: [
    { id: 10, term_name: 'First Term' },
    { id: 11, term_name: 'Second Term' },
    { id: 12, term_name: 'Third Term' },
  ],
  2: [
    { id: 20, term_name: 'First Term' },
    { id: 21, term_name: 'Second Term' },
    { id: 22, term_name: 'Third Term' },
  ],
};

const SessionTermSelector = ({ onSessionTermChange, loading: externalLoading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [sessions] = useState(mockSessions);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [currentTab, setCurrentTab] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(String(sessions[0].id));
    }
  }, [sessions]);

  useEffect(() => {
    if (!selectedSession) {
      setSessionTerms([]);
      setCurrentTab('');
      onSessionTermChange?.(null);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      const terms = mockTermsBySession[selectedSession] || [];
      setSessionTerms(terms);
      if (terms.length > 0) {
        setCurrentTab(String(terms[0].id));
        onSessionTermChange?.(terms[0].id);
      } else {
        setCurrentTab('');
        onSessionTermChange?.(null);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSession]);

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
    const term = sessionTerms.find((t) => String(t.id) === newValue);
    onSessionTermChange?.(term ? term.id : null);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Session</InputLabel>
          <Select value={selectedSession} label="Session" onChange={handleSessionChange}>
            {sessions.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>{s.session_name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {sessionTerms.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No terms available. Please select a session.
          </Typography>
        </Box>
      ) : loading ? (
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
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
            {sessionTerms.map((term) => (
              <Tab key={term.id} label={term.term_name} value={String(term.id)} />
            ))}
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default SessionTermSelector;
