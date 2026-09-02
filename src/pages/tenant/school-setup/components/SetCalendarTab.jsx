import { useState, useEffect, useLayoutEffect, useRef, useContext } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconTrash, IconPlus, IconRefresh, IconEdit } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import ArrowHint from '@/components/shared/ArrowHint';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import {
  fetchLandlordSessions,
  fetchTenantSessions,
  createTenantSession,
  toggleTenantSessionStatus,
  fetchTenantTerms,
  syncLandlordTerms,
  updateDisplayName,
  fetchActiveTenantSessionTerm,
  fetchTenantSessionTerms,
  createTenantSessionTerm,
  toggleTenantSessionTermStatus,
} from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchWeeks,
  autoGenerateWeeks,
  toggleWeekStatus,
  deleteWeek,
} from '@/api/tenant/term-weeks/weekApi';
import { fetchCalendarOverview } from '@/api/tenant/calendar/calendarAnalyticsApi';
import CalendarIntelligence from './CalendarIntelligence';

const SetCalendarTab = ({ onSaveAndContinue, onUpdate, onReadyChange }) => {
  const { refreshTenantInfo, refreshSubscriptionStatus } = useContext(TenantAuthContext);
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const loadOverview = async () => {
    try {
      setOverviewLoading(true);
      const res = await fetchCalendarOverview();
      if (res.status) setOverview(res.data);
    } catch (error) {
      // Non-critical — the rest of the tab still works without it.
    } finally {
      setOverviewLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(false);

  // Sessions
  const [tenantSessions, setTenantSessions] = useState([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(0);
  const [sessionsRowsPerPage, setSessionsRowsPerPage] = useState(10);
  // Unpaginated — used to populate the Session Filter dropdown so it always lists every session
  const [sessionFilterOptions, setSessionFilterOptions] = useState([]);
  const [landlordSessions, setLandlordSessions] = useState([]);
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [selectedLandlordSessionId, setSelectedLandlordSessionId] = useState('');
  const [sessionAnchorEl, setSessionAnchorEl] = useState(null);
  const [selectedSessionItem, setSelectedSessionItem] = useState(null);
  const [confirmSessionToggle, setConfirmSessionToggle] = useState({ open: false, session: null });

  // Terms
  const [tenantTerms, setTenantTerms] = useState([]);
  const [editTermOpen, setEditTermOpen] = useState(false);
  const [editTermForm, setEditTermForm] = useState({ id: null, term_name: '' });

  // Session/Term mappings
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionTermsTotal, setSessionTermsTotal] = useState(0);
  const [sessionTermsPage, setSessionTermsPage] = useState(0);
  const [sessionTermsRowsPerPage, setSessionTermsRowsPerPage] = useState(10);
  const [sessionFilter, setSessionFilter] = useState('');
  const [setSessionTermOpen, setSetSessionTermOpen] = useState(false);
  const [sessionTermForm, setSessionTermForm] = useState({
    session_id: '',
    term_id: '',
    status: 'active',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState({ open: false, mapping: null });

  // Notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Week Management states
  const [weeks, setWeeks] = useState([]);
  const [schoolDays, setSchoolDays] = useState(null);
  const [autoGenerateConfig, setAutoGenerateConfig] = useState({
    startDate: '',
    numWeeks: 0,
  });
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  const [confirmDeleteWeek, setConfirmDeleteWeek] = useState(false);

  // ── Hint positioning ─────────────────────────────────────────────────────
  const generateBtnRef = useRef(null);
  const paperRef = useRef(null);
  const [hintStyle, setHintStyle] = useState(null);

  useEffect(() => {
    if (weeks.length > 0) {
      setAutoGenerateConfig((prev) => ({
        ...prev,
        numWeeks: weeks.length,
      }));
    }
  }, [weeks]);

  // Intelligent defaults for a brand-new term (no weeks generated yet): start
  // from the same week count as the previous term, and a sensible next-Monday
  // start date, rather than leaving the admin to guess both from scratch.
  useEffect(() => {
    if (weeks.length > 0 || !activeSessionTermId) return;

    setAutoGenerateConfig((prev) => {
      const next = { ...prev };
      if (!prev.numWeeks && overview?.weeks?.previous) {
        next.numWeeks = overview.weeks.previous;
      }
      if (!prev.startDate) {
        // The coming Monday — or today, if today already is one.
        const today = new Date();
        const offsetToMonday = (8 - today.getDay()) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() + offsetToMonday);
        next.startDate = monday.toISOString().slice(0, 10);
      }
      return next;
    });
  }, [activeSessionTermId, weeks.length, overview]);

  useLayoutEffect(() => {
    const btn = generateBtnRef.current;
    const paper = paperRef.current;
    if (!btn || !paper) return;

    const calc = () => {
      const btnRect = btn.getBoundingClientRect();
      const paperRect = paper.getBoundingClientRect();
      setHintStyle({
        top: btnRect.bottom - paperRect.top + 6,
        left: btnRect.left - paperRect.left,
        width: btnRect.width,
      });
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(paper);
    return () => ro.disconnect();
  }, [weeks.length, activeSessionTermId, sessionTerms.length]);

  useEffect(() => {
    loadData();
    loadOverview();
    refreshTenantInfo();
    refreshSubscriptionStatus();
  }, []);

  // Sessions list re-fetches when its page/rowsPerPage change
  useEffect(() => {
    loadTenantSessions();
  }, [sessionsPage, sessionsRowsPerPage]);

  // Session/Term list re-fetches when its page/rowsPerPage/filter change
  useEffect(() => {
    loadSessionTerms();
  }, [sessionTermsPage, sessionTermsRowsPerPage, sessionFilter]);

  // Notify parent when stage is completable: an active session/term + weeks generated
  useEffect(() => {
    const isReady = Boolean(activeSessionTermId) && weeks.length > 0;
    onReadyChange?.(isReady);
  }, [activeSessionTermId, weeks, onReadyChange]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTenantSessions(),
        loadSessionFilterOptions(),
        loadTenantTerms(),
        loadSessionTerms(),
        loadActiveSessionTerm(),
      ]);
    } catch (error) {
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTenantSessions = async () => {
    const res = await fetchTenantSessions({ page: sessionsPage + 1, per_page: sessionsRowsPerPage });
    if (res.status) {
      setTenantSessions(res.data);
      setSessionsTotal(res.total);
    }
  };

  // Unpaginated, for the Session Filter dropdown
  const loadSessionFilterOptions = async () => {
    const res = await fetchTenantSessions({ page: 1, per_page: 1000 });
    if (res.status) setSessionFilterOptions(res.data);
  };

  const loadTenantTerms = async () => {
    const res = await fetchTenantTerms();
    if (res.status) setTenantTerms(res.data);
  };

  const loadSessionTerms = async () => {
    const res = await fetchTenantSessionTerms({
      page: sessionTermsPage + 1,
      per_page: sessionTermsRowsPerPage,
      sessionId: sessionFilter || null,
    });
    if (res.status) {
      setSessionTerms(res.data);
      setSessionTermsTotal(res.total);
    }
  };

  // Independent of pagination — drives the active session-term id / weeks card
  const loadActiveSessionTerm = async () => {
    const res = await fetchActiveTenantSessionTerm();
    if (res.status && res.data) {
      setActiveSessionTermId(res.data.id);
      loadWeeksData(res.data.id);
    } else {
      setActiveSessionTermId(null);
      setWeeks([]);
    }
  };

  const loadWeeksData = async (stId) => {
    if (!stId) return;
    try {
      const weeksRes = await fetchWeeks(stId);
      if (weeksRes.status) {
        setWeeks(weeksRes.data);
        if (weeksRes.stats) {
          setSchoolDays(weeksRes.stats.total_school_days);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load weeks', 'error');
    }
  };

  // ── Sessions ───────────────────────────────────────────────────────────
  const openAddSession = async () => {
    setSelectedLandlordSessionId('');
    setAddSessionOpen(true);
    try {
      const res = await fetchLandlordSessions();
      if (res.status) setLandlordSessions(res.data);
    } catch (error) {
      showSnackbar('Failed to load landlord sessions', 'error');
    }
  };

  const handleAddSession = async () => {
    if (!selectedLandlordSessionId) {
      showSnackbar('Select a session first', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await createTenantSession(selectedLandlordSessionId);
      if (res.status) {
        showSnackbar('Session added successfully', 'success');
        setAddSessionOpen(false);
        loadTenantSessions();
        loadSessionFilterOptions();
      } else {
        showSnackbar(res.message || 'Failed to add session', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to add session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionMenuOpen = (event, session) => {
    setSessionAnchorEl(event.currentTarget);
    setSelectedSessionItem(session);
  };

  const handleSessionMenuClose = () => {
    setSessionAnchorEl(null);
    setSelectedSessionItem(null);
  };

  const handleSessionToggleClick = (session) => {
    setConfirmSessionToggle({ open: true, session });
  };

  const handleConfirmSessionToggle = async () => {
    const session = confirmSessionToggle.session;
    setConfirmSessionToggle({ open: false, session: null });
    if (!session) return;
    try {
      setLoading(true);
      const res = await toggleTenantSessionStatus(session.id);
      if (res.status) {
        showSnackbar(
          `Session ${session.status === 'active' ? 'deactivated' : 'activated'} successfully`,
          'success',
        );
        loadTenantSessions();
      } else {
        showSnackbar(res.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Terms ──────────────────────────────────────────────────────────────
  const handleSyncTerms = async () => {
    try {
      setLoading(true);
      const res = await syncLandlordTerms();
      if (res.status) {
        setTenantTerms(res.data);
        showSnackbar('Terms synced successfully', 'success');
      } else {
        showSnackbar(res.message || 'Failed to sync terms', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to sync terms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditTerm = (term) => {
    setEditTermForm({ id: term.id, term_name: term.term_name });
    setEditTermOpen(true);
  };

  const handleSaveTermName = async () => {
    const { id, term_name } = editTermForm;
    if (!term_name.trim()) {
      showSnackbar('Term name is required', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await updateDisplayName(id, term_name.trim());
      if (res.status) {
        showSnackbar('Term renamed successfully', 'success');
        setEditTermOpen(false);
        loadTenantTerms();
        loadSessionTerms();
        loadActiveSessionTerm();
      } else {
        showSnackbar(res.message || 'Failed to rename term', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to rename term', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Session/Term mapping ───────────────────────────────────────────────
  const openSetSessionTerm = async () => {
    setSessionTermForm({ session_id: '', term_id: '', status: 'active' });
    setSetSessionTermOpen(true);
    try {
      const res = await fetchLandlordSessions();
      if (res.status) setLandlordSessions(res.data);
    } catch (error) {
      showSnackbar('Failed to load landlord sessions', 'error');
    }
  };

  const handleSaveSessionTerm = async () => {
    const { session_id, term_id, status } = sessionTermForm;
    if (!session_id || !term_id || !status) {
      showSnackbar('Session, Term and Status are required', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await createTenantSessionTerm(sessionTermForm);
      if (res.status) {
        showSnackbar('Session/Term saved successfully', 'success');
        setSetSessionTermOpen(false);
        loadTenantSessions();
        loadSessionTerms();
        loadActiveSessionTerm();
        loadOverview();
        await refreshTenantInfo();
        await refreshSubscriptionStatus();
        if (onUpdate) onUpdate();
      } else {
        showSnackbar(res.message || 'Failed to save session/term', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to save session/term', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, mapping) => {
    setAnchorEl(event.currentTarget);
    setSelectedMapping(mapping);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMapping(null);
  };

  const handleToggleClick = (mapping) => {
    setConfirmToggle({ open: true, mapping });
  };

  const handleConfirmToggle = async () => {
    const mapping = confirmToggle.mapping;
    setConfirmToggle({ open: false, mapping: null });
    if (!mapping) return;
    try {
      setLoading(true);
      const res = await toggleTenantSessionTermStatus(mapping.id);
      if (res.status) {
        showSnackbar(
          `Session/Term ${mapping.status === 'active' ? 'deactivated' : 'activated'} successfully`,
          'success',
        );
        loadSessionTerms();
        loadActiveSessionTerm();
        loadOverview();
        await refreshTenantInfo();
        await refreshSubscriptionStatus();
        if (onUpdate) onUpdate();
      } else {
        showSnackbar(res.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Weeks ──────────────────────────────────────────────────────────────
  const handleAutoGenerate = async () => {
    if (!activeSessionTermId || !autoGenerateConfig.startDate) {
      showSnackbar('Set start date first', 'error');
      return;
    }

    if (autoGenerateConfig.numWeeks < 1 || autoGenerateConfig.numWeeks > 15) {
      showSnackbar('Number of weeks must be between 1 and 15', 'error');
      return;
    }
    try {
      setLoading(true);
      const response = await autoGenerateWeeks(activeSessionTermId, {
        start_date: autoGenerateConfig.startDate,
        num_weeks: autoGenerateConfig.numWeeks,
      });
      if (response.status) {
        setWeeks(response.data);
        if (response.stats) {
          setSchoolDays(response.stats.total_school_days);
        }

        setAutoGenerateConfig((prev) => ({
          ...prev,
          numWeeks: response.data.length,
        }));

        showSnackbar('Weeks generated successfully', 'success');
        loadSessionTerms();
        loadOverview();
        refreshTenantInfo();
        refreshSubscriptionStatus();
      } else {
        showSnackbar(response.message || 'Failed to generate weeks', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to generate weeks';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeekStatus = async (id) => {
    try {
      const response = await toggleWeekStatus(id);
      if (response.status) {
        loadWeeksData(activeSessionTermId);
      }
    } catch (error) {
      showSnackbar('Failed to toggle status', 'error');
    }
  };

  const handleDeleteLastWeek = async () => {
    if (!weeks.length || !activeSessionTermId) return;
    const lastWeek = weeks[weeks.length - 1];
    try {
      setLoading(true);
      const response = await deleteWeek(activeSessionTermId, lastWeek.week_id);
      if (response.status) {
        setWeeks(response.data);
        if (response.stats) {
          setSchoolDays(response.stats.total_school_days);
        }
        showSnackbar('Last week removed successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to delete week', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to delete week';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Live preview of how the number of weeks being typed compares to the
  // previous term — updates as the admin types, before they even hit Generate.
  const weeksComparisonHint = (() => {
    const previous = overview?.weeks?.previous;
    if (weeks.length > 0 || !previous || !autoGenerateConfig.numWeeks) return null;
    const delta = autoGenerateConfig.numWeeks - previous;
    if (delta > 0) return `Last term: ${previous} weeks (+${delta})`;
    if (delta < 0) return `Last term: ${previous} weeks (${delta})`;
    return `Same as last term (${previous} weeks)`;
  })();

  return (
    <Box sx={{ width: '100%' }}>
      <CalendarIntelligence overview={overview} loading={overviewLoading} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Manage Sessions & Session/Term</Typography>
              </Box>
            }
          >
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
            >
              <Tab label="All Sessions" value="sessions" />
              <Tab label="Terms" value="terms" />
              <Tab label="Session/Term" value="session-term" />
            </Tabs>

            {activeTab === 'sessions' ? (
              <>
                <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<IconPlus size={16} />}
                    onClick={openAddSession}
                  >
                    Add New Session
                  </Button>
                </Box>
                <TableContainer>
                  <Table sx={{ whiteSpace: 'nowrap' }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Session Name</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton variant="text" width={20} /></TableCell>
                            <TableCell><Skeleton variant="text" width={140} height={20} /></TableCell>
                            <TableCell align="center"><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px', mx: 'auto' }} /></TableCell>
                            <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                          </TableRow>
                        ))
                      ) : tenantSessions.length > 0 ? (
                        tenantSessions.map((session, i) => (
                          <TableRow key={session.id} hover>
                            <TableCell>{sessionsPage * sessionsRowsPerPage + i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {session.session_name}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={session.status}
                                size="small"
                                sx={{
                                  bgcolor: session.status === 'active' ? '#dcfce7' : '#fef3c7',
                                  color: session.status === 'active' ? '#166534' : '#92400e',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => handleSessionMenuOpen(e, session)}
                              >
                                <MoreVertIcon size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Alert severity="info" sx={{ justifyContent: 'center' }}>
                              No sessions added yet. Click "Add New Session" to fetch one from the landlord.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={sessionsTotal}
                  rowsPerPage={sessionsRowsPerPage}
                  page={sessionsPage}
                  onPageChange={(e, newPage) => setSessionsPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setSessionsRowsPerPage(parseInt(e.target.value, 10));
                    setSessionsPage(0);
                  }}
                />
              </>
            ) : activeTab === 'terms' ? (
              <>
                <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconRefresh size={16} />}
                    onClick={handleSyncTerms}
                  >
                    Sync Terms
                  </Button>
                </Box>
                <TableContainer>
                  <Table sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Term Name</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton variant="text" width={20} /></TableCell>
                            <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
                            <TableCell align="center"><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px', mx: 'auto' }} /></TableCell>
                            <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                          </TableRow>
                        ))
                      ) : tenantTerms.length > 0 ? (
                        tenantTerms.map((term, i) => (
                          <TableRow key={term.id} hover>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{term.term_name}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={term.status}
                                size="small"
                                sx={{
                                  bgcolor: term.status === 'active' ? '#dcfce7' : '#fef3c7',
                                  color: term.status === 'active' ? '#166534' : '#92400e',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => openEditTerm(term)}
                                title="Rename term"
                              >
                                <IconEdit size={16} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Alert severity="info" sx={{ justifyContent: 'center' }}>
                              No terms synced yet. Click "Sync Terms" to pull them from the landlord.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2, gap: 1, flexWrap: 'wrap' }}
                >
                  <TextField
                    select
                    size="small"
                    label="Session Filter"
                    value={sessionFilter}
                    onChange={(e) => {
                      setSessionFilter(e.target.value);
                      setSessionTermsPage(0);
                    }}
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="">All Sessions</MenuItem>
                    {sessionFilterOptions.map((session) => (
                      <MenuItem key={session.id} value={session.id}>
                        {session.session_name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconRefresh size={16} />}
                      onClick={handleSyncTerms}
                    >
                      Sync Terms
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<IconPlus size={16} />}
                      onClick={openSetSessionTerm}
                    >
                      Set Session/Term
                    </Button>
                  </Box>
                </Box>

                <TableContainer>
                  <Table sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Session/Term</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          Status
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton variant="text" width={180} height={20} /></TableCell>
                            <TableCell align="center"><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px', mx: 'auto' }} /></TableCell>
                            <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                          </TableRow>
                        ))
                      ) : sessionTerms.length > 0 ? (
                        sessionTerms.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {item.session?.session_name} - {item.term?.term_name}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  bgcolor: item.status === 'active' ? '#dcfce7' : '#fef3c7',
                                  color: item.status === 'active' ? '#166534' : '#92400e',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                                <MoreVertIcon size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                            <Alert severity="info" sx={{ justifyContent: 'center' }}>
                              No session/term mappings yet. Click "Set Session/Term" to create one.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={sessionTermsTotal}
                  rowsPerPage={sessionTermsRowsPerPage}
                  page={sessionTermsPage}
                  onPageChange={(e, newPage) => setSessionTermsPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setSessionTermsRowsPerPage(parseInt(e.target.value, 10));
                    setSessionTermsPage(0);
                  }}
                />
              </>
            )}
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ParentCard
            id="generate-week-section"
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Generate Week</Typography>
                <Box
                  sx={{
                    ml: 'auto',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                >
                  <Typography variant="caption">
                    {weeks.length} Weeks • {schoolDays} school days
                  </Typography>
                </Box>
              </Box>
            }
          >
            {activeSessionTermId ? (
              <Box ref={paperRef} sx={{ p: 2, position: 'relative' }}>
                <Box
                  sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}
                >
                  <TextField
                    label="No. of Weeks"
                    type="number"
                    size="small"
                    sx={{ width: { xs: '100%', sm: 160 } }}
                    value={autoGenerateConfig.numWeeks}
                    onChange={(e) =>
                      setAutoGenerateConfig({
                        ...autoGenerateConfig,
                        numWeeks: parseInt(e.target.value),
                      })
                    }
                    inputProps={{
                      min: 1,
                      max: 15,
                    }}
                    helperText={weeksComparisonHint}
                  />
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    sx={{ width: { xs: '100%', sm: 160 } }}
                    value={autoGenerateConfig.startDate}
                    onChange={(e) =>
                      setAutoGenerateConfig({ ...autoGenerateConfig, startDate: e.target.value })
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  {/* generateBtnRef targets this button exactly */}
                  <Button
                    variant="contained"
                    size="small"
                    ref={generateBtnRef}
                    onClick={handleAutoGenerate}
                    disabled={loading || !activeSessionTermId}
                    sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
                  >
                    Generate
                  </Button>
                </Box>

                {/* ── Generate hint  ── */}
                {Boolean(activeSessionTermId) &&
                  weeks.length === 0 &&
                  hintStyle && (
                    <ArrowHint
                      show
                      label="Set dates &amp; click Generate ☝️"
                      direction="up-right"
                      mode="persistent"
                      delay="0.3s"
                      position={{
                        position: 'absolute',
                        top: hintStyle.top,
                        left: hintStyle.left,
                        width: hintStyle.width,
                        zIndex: 10,
                      }}
                    />
                  )}

                <TableContainer sx={{ maxHeight: 320, overflowY: 'auto' }}>
                  <Table stickyHeader sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Week</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: 48 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weeks.length > 0 ? (
                        weeks.map((item, i) => {
                          const isLast = i === weeks.length - 1;
                          return (
                            <TableRow key={i} hover>
                              <TableCell sx={{ fontWeight: 500 }}>{item.week_name}</TableCell>
                              <TableCell>{item.start_date || 'N/A'}</TableCell>
                              <TableCell>{item.end_date || 'N/A'}</TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status}
                                  size="small"
                                  onClick={() => handleToggleWeekStatus(item.wk_id)}
                                  sx={{
                                    cursor: 'pointer',
                                    bgcolor: item.status === 'active' ? '#dcfce7' : '#fee2e2',
                                    color: item.status === 'active' ? '#166534' : '#991b1b',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {isLast && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setConfirmDeleteWeek(true)}
                                    disabled={loading}
                                    title="Remove last week"
                                  >
                                    <IconTrash size={15} />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              No weeks generated yet for this term.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 3 }}>
                No weeks generated yet. Set an active Session/Term first to generate weeks.
              </Alert>
            )}
          </ParentCard>
        </Grid>
      </Grid>

      {/* ── Add Session Modal ── */}
      <Dialog open={addSessionOpen} onClose={() => setAddSessionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Session</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Session"
            value={selectedLandlordSessionId}
            onChange={(e) => setSelectedLandlordSessionId(e.target.value)}
            margin="normal"
            size="small"
          >
            {landlordSessions.length === 0 ? (
              <MenuItem disabled value="">
                No sessions available to add
              </MenuItem>
            ) : (
              landlordSessions.map((session) => (
                <MenuItem key={session.id} value={session.id}>
                  {session.session_name}
                </MenuItem>
              ))
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setAddSessionOpen(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleAddSession}
            disabled={loading || !selectedLandlordSessionId}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Term Name Modal ── */}
      <Dialog open={editTermOpen} onClose={() => setEditTermOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rename Term</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Give this term whatever name your school uses — e.g. "Harmattan" instead of
            "First Term". This only changes the name; the term id stays the same.
          </Typography>
          <TextField
            fullWidth
            label="Term Name"
            value={editTermForm.term_name}
            onChange={(e) => setEditTermForm((p) => ({ ...p, term_name: e.target.value }))}
            margin="normal"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setEditTermOpen(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleSaveTermName}
            disabled={loading || !editTermForm.term_name.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Set Session/Term Modal ── */}
      <Dialog
        open={setSessionTermOpen}
        onClose={() => setSetSessionTermOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Attach Term to Session</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Session"
            value={sessionTermForm.session_id}
            onChange={(e) =>
              setSessionTermForm((p) => ({ ...p, session_id: e.target.value }))
            }
            margin="normal"
            size="small"
          >
            {landlordSessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.session_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Term"
            value={sessionTermForm.term_id}
            onChange={(e) => setSessionTermForm((p) => ({ ...p, term_id: e.target.value }))}
            margin="normal"
            size="small"
            helperText={
              tenantTerms.length === 0 ? 'No terms synced yet — click "Sync Terms" first' : ''
            }
          >
            {tenantTerms.map((term) => (
              <MenuItem key={term.id} value={term.id}>
                {term.term_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Status"
            value={sessionTermForm.status}
            onChange={(e) => setSessionTermForm((p) => ({ ...p, status: e.target.value }))}
            margin="normal"
            size="small"
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setSetSessionTermOpen(false)}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSaveSessionTerm} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Session Status Toggle Confirmation ── */}
      <Dialog
        open={confirmSessionToggle.open}
        onClose={() => setConfirmSessionToggle({ open: false, session: null })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography>
              Are you sure you want to{' '}
              <strong>
                {confirmSessionToggle.session?.status === 'active' ? 'deactivate' : 'activate'}
              </strong>{' '}
              <strong>{confirmSessionToggle.session?.session_name}</strong>?
            </Typography>
            {confirmSessionToggle.session?.status !== 'active' && (
              <Box mt={2}>
                <Alert severity="info" sx={{ '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
                  Activating this will automatically deactivate any other active session. The
                  school keeps running on its current active term until you set an active term
                  for this session — the "Session/Term" tab still shows what's actually live.
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setConfirmSessionToggle({ open: false, session: null })}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleConfirmSessionToggle}
            color="primary"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Status Toggle Confirmation ── */}
      <Dialog
        open={confirmToggle.open}
        onClose={() => setConfirmToggle({ open: false, mapping: null })}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography>
              Are you sure you want to{' '}
              <strong>{confirmToggle.mapping?.status === 'active' ? 'deactivate' : 'activate'}</strong>{' '}
              <strong>
                {confirmToggle.mapping?.session?.session_name} -{' '}
                {confirmToggle.mapping?.term?.term_name}
              </strong>
              ?
            </Typography>
            {confirmToggle.mapping?.status !== 'active' && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Activating this will automatically deactivate any other active session/term.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setConfirmToggle({ open: false, mapping: null })}
          >
            Cancel
          </Button>
          <Button size="small" onClick={handleConfirmToggle} color="primary" disabled={loading}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Last Week Confirmation ── */}
      <Dialog open={confirmDeleteWeek} onClose={() => setConfirmDeleteWeek(false)}>
        <DialogTitle>Remove Last Week</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{weeks[weeks.length - 1]?.week_name}</strong>?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setConfirmDeleteWeek(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            disabled={loading}
            onClick={() => {
              setConfirmDeleteWeek(false);
              handleDeleteLastWeek();
            }}
          >
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Session Action Menu ── */}
      <Menu
        anchorEl={sessionAnchorEl}
        open={Boolean(sessionAnchorEl)}
        onClose={handleSessionMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            handleSessionToggleClick(selectedSessionItem);
            handleSessionMenuClose();
          }}
          sx={{ color: selectedSessionItem?.status === 'active' ? 'error.main' : 'success.main' }}
        >
          {selectedSessionItem?.status === 'active' ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Menu>

      {/* ── Session/Term Action Menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            handleToggleClick(selectedMapping);
            handleMenuClose();
          }}
          sx={{ color: selectedMapping?.status === 'active' ? 'error.main' : 'success.main' }}
        >
          {selectedMapping?.status === 'active' ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SetCalendarTab;
