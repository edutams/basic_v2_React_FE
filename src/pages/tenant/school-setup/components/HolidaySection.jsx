import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Grid,
  Stack,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  IconCalendar,
  IconCalendarX,
  IconClock,
  IconPlus,
  IconTrash,
  IconDotsVertical,
} from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent, useAclTour } from '@/context/AclTourContext';
import {
  fetchTenantSessions,
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchHolidays,
  createHolidays,
  deleteHoliday,
  fetchHolidayStatistics,
} from '@/api/tenant/holidays/holidayApi';
import { fetchTermDateRange } from '@/api/tenant/term-weeks/weekApi';

// Local-safe "YYYY-MM-DD" formatter — new Date('2026-08-31') parses as UTC
// midnight, which can shift a day off in some timezones when re-formatted;
// this reads the components directly instead.
const formatIsoDate = (isoDate) => {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const emptyRow = () => ({ name: '', start_date: '', end_date: '' });

const holidayTourSteps = [
  {
    selector: '[data-tour="holiday-analytics"]',
    content: (
      <StepContent
        title="Holiday Analytics"
        body="An overview of your school calendar holidays for the selected session term — total school days, holiday utilization, and a holiday breakdown."
      />
    ),
  },
  {
    selector: '[data-tour="holiday-total-days"]',
    content: (
      <StepContent
        title="Total School Days"
        body="The number of school days scheduled for the selected session term on the school calendar."
      />
    ),
  },
  {
    selector: '[data-tour="holiday-utilization"]',
    content: (
      <StepContent
        title="Holiday Utilization"
        body="The percentage of the term taken up by holidays. Keep this in check so holidays don't eat too much into teaching time."
      />
    ),
  },
  {
    selector: '[data-tour="holiday-summary"]',
    content: (
      <StepContent
        title="Holiday Summary"
        body="A quick summary showing how many holidays are set, the days allocated, the days already used, and the holiday days still upcoming."
      />
    ),
  },
  {
    selector: '[data-tour="holiday-create"]',
    content: (
      <StepContent
        title="Create Holiday"
        body="Use the 'Create Holiday' button to add holidays for the selected session and term."
      />
    ),
  },
];

const heroAccent = (colorIndex) => schemeMap[colorIndex].color;

const heroIconBadgeSx = (colorIndex) => ({
  width: 32,
  height: 32,
  borderRadius: '10px',
  background: schemeMap[colorIndex].bg,
  color: schemeMap[colorIndex].color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
});

const HolidaySection = ({ refreshKey }) => (
  <AclTourProvider steps={holidayTourSteps}>
    <HolidaySectionInner refreshKey={refreshKey} />
  </AclTourProvider>
);

const HolidaySectionInner = ({ refreshKey }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  // The session-term actually running the school right now (getActiveSessionTerm()
  // on the backend) — used only to pick sensible defaults below; the filters
  // themselves can still browse to any session/term.
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTermLabel, setSelectedTermLabel] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Create holiday modal
  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [statistics, setStatistics] = useState(null);

  // Calendar date range for the selected term (min/max for date inputs)
  const [termDateRange, setTermDateRange] = useState(null); // { start_date, end_date }

  // Row action menu
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuHolidayId, setMenuHolidayId] = useState(null);

  const handleMenuOpen = (e, id) => {
    setMenuAnchor(e.currentTarget);
    setMenuHolidayId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuHolidayId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const { startTour } = useAclTour();
  const tourStartedRef = useRef(false);

  // Auto-play the tour every time this tab mounts, once the statistics (tour targets) are loaded
  useEffect(() => {
    if (!statistics || tourStartedRef.current) return;
    tourStartedRef.current = true;
    const timer = setTimeout(() => {
      startTour();
    }, 600);
    return () => clearTimeout(timer);
  }, [statistics, startTour]);

  // Load every session (the filter can browse any of them) on mount and when
  // refreshKey changes, and separately resolve which session-term is actually
  // running the school right now — that's what decides the *default*
  // selection, not which Session row happens to be flagged active (that flag
  // is independent and can lag behind, see SessionManagementController).
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const [sessionsRes, activeRes] = await Promise.all([
          fetchTenantSessions({ page: 1, per_page: 1000 }),
          fetchActiveTenantSessionTerm(),
        ]);

        const activeTerm = activeRes.status ? activeRes.data : null;
        setActiveSessionTermId(activeTerm?.id ?? null);

        if (sessionsRes.status && sessionsRes.data.length > 0) {
          setSessions(sessionsRes.data);
          setSelectedSessionId(activeTerm?.session_id ?? sessionsRes.data[0].id);
        }
      } catch {
        showSnackbar('Failed to load sessions', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [refreshKey]);

  // Load terms when session changes or refreshKey changes
  useEffect(() => {
    if (!selectedSessionId) return;
    const loadTerms = async () => {
      try {
        const res = await fetchSessionTerms(selectedSessionId);
        if (res.status) {
          const terms = res.data;
          setSessionTerms(terms);
          if (terms.length > 0) {
            const defaultTerm =
              terms.find((t) => t.session_term_id === activeSessionTermId) || terms[0];
            setSelectedTermId(defaultTerm.session_term_id);
            setSelectedTermLabel(defaultTerm.display_name || defaultTerm.term_name);
          } else {
            setSelectedTermId('');
            setSelectedTermLabel('');
            setHolidays([]);
          }
        }
      } catch {
        showSnackbar('Failed to load terms', 'error');
      }
    };
    loadTerms();
  }, [selectedSessionId, activeSessionTermId, refreshKey]);

  // Load holidays when term changes
  useEffect(() => {
    if (!selectedTermId) return;
    loadHolidays(selectedTermId);
    loadHolidayStatistics(selectedTermId);
    // Fetch calendar date range to constrain date pickers
    fetchTermDateRange(selectedTermId)
      .then((range) => setTermDateRange(range))
      .catch(() => setTermDateRange(null));
  }, [selectedTermId]);

  const loadHolidays = async (termId) => {
    try {
      setLoading(true);
      const res = await fetchHolidays(termId);
      if (res.status) {
        setHolidays(res.data);
      }
    } catch {
      showSnackbar('Failed to load holidays', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHolidayStatistics = async (termId) => {
    try {
      const res = await fetchHolidayStatistics(termId);

      if (res.status) {
        setStatistics(res.data);
      }
    } catch {
      showSnackbar('Failed to load holiday statistics', 'error');
    }
  };

  const handleTermChange = (e) => {
    const termId = e.target.value;
    setSelectedTermId(termId);
    const term = sessionTerms.find((t) => t.session_term_id === termId);
    setSelectedTermLabel(term?.display_name || term?.term_name || '');
  };

  // Modal handlers
  const handleOpenModal = () => {
    setRows([emptyRow()]);
    setErrors([]);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRows([emptyRow()]);
    setErrors([]);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
    setErrors((prev) => [...prev, {}]);
  };

  const handleRowChange = (index, field, value) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    setErrors((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: undefined } : e)));
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const validateRows = () => {
    const newErrors = rows.map((r) => {
      const e = {};
      if (!r.name.trim()) e.name = 'Required';
      if (!r.start_date) e.start_date = 'Required';
      if (!r.end_date) e.end_date = 'Required';
      return e;
    });
    setErrors(newErrors);
    return newErrors.every((e) => Object.keys(e).length === 0);
  };

  const handleSaveHolidays = async () => {
    if (!validateRows()) return;
    try {
      setSaving(true);
      const res = await createHolidays(selectedTermId, rows);
      if (res.status) {
        showSnackbar('Holidays created successfully');
        handleCloseModal();
        loadHolidays(selectedTermId);
        loadHolidayStatistics(selectedTermId);
      } else {
        // Map field-level errors from API onto rows
        if (res.errors) {
          const apiErrors = {};
          Object.entries(res.errors).forEach(([idx, fieldErrs]) => {
            apiErrors[parseInt(idx)] = fieldErrs;
          });
          setErrors((prev) => {
            const merged = [...prev];
            Object.entries(apiErrors).forEach(([idx, fieldErrs]) => {
              merged[idx] = { ...(merged[idx] || {}), ...fieldErrs };
            });
            return merged;
          });
        }
        showSnackbar(res.message || 'Failed to create holidays', 'error');
      }
    } catch (err) {
      // Handle 422 validation errors with field-level detail
      const data = err?.response?.data;
      if (data?.errors) {
        const apiErrors = {};
        Object.entries(data.errors).forEach(([idx, fieldErrs]) => {
          apiErrors[parseInt(idx)] = fieldErrs;
        });
        setErrors((prev) => {
          const merged = [...prev];
          Object.entries(apiErrors).forEach(([idx, fieldErrs]) => {
            merged[idx] = { ...(merged[idx] || {}), ...fieldErrs };
          });
          return merged;
        });
        showSnackbar(data.message || 'Validation failed', 'error');
      } else {
        showSnackbar('Failed to create holidays', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ open: false, id: null });
    try {
      setLoading(true);
      const res = await deleteHoliday(id);
      if (res.status) {
        showSnackbar('Holiday deleted');
        loadHolidays(selectedTermId);
        loadHolidayStatistics(selectedTermId);
      } else {
        showSnackbar(res.message || 'Failed to delete', 'error');
      }
    } catch {
      showSnackbar('Failed to delete holiday', 'error');
    } finally {
      setLoading(false);
    }
  };

  const paginatedHolidays = holidays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get session label for modal title
  const sessionLabel = sessions.find((s) => s.id === selectedSessionId)?.session_name || '';

  // Percentages used by the analytics cards
  const utilizationPercentage = statistics?.holiday_percentage || 0;
  const daysUsedPercentage =
    statistics?.holiday_days_allocated > 0
      ? Math.round((statistics.holiday_days_used / statistics.holiday_days_allocated) * 100)
      : 0;

  return (
    <>
      {statistics && (
        <Box sx={{ mb: 1.5 }}>
          <Grid container spacing={2}>
            {/* Card 1: Total School Days */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} data-tour="holiday-total-days">
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  borderRadius: '14px',
                  bgcolor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  minHeight: 70,
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                  >
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Total School Days
                    </Typography>
                    <Box sx={heroIconBadgeSx(0)}>
                      <IconCalendar size={20} />
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="h2"
                      fontWeight={900}
                      align="center"
                      sx={{
                        lineHeight: 1,
                        fontSize: { xs: 26, md: 32 },
                        color: heroAccent(0),
                      }}
                    >
                      {statistics.total_school_days}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Card 2: Holiday Utilization */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} data-tour="holiday-utilization">
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  borderRadius: '14px',
                  bgcolor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  minHeight: 70,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 70,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Holiday Utilization
                    </Typography>
                    <Box sx={heroIconBadgeSx(1)}>
                      <IconClock size={20} />
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(utilizationPercentage || 0, 100)}
                      color={
                        utilizationPercentage > 80
                          ? 'error'
                          : utilizationPercentage > 50
                            ? 'warning'
                            : 'primary'
                      }
                      sx={{
                        flex: 1,
                        height: 5,
                        borderRadius: 4,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                      }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        color:
                          utilizationPercentage > 80
                            ? 'error.main'
                            : utilizationPercentage > 50
                              ? 'warning.main'
                              : 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      {utilizationPercentage}%
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                    {statistics.holiday_days_allocated} of {statistics.total_school_days} days
                    allocated
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Card 3: Holiday Summary */}
            <Grid size={{ xs: 12, lg: 5 }} data-tour="holiday-summary">
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  borderRadius: '14px',
                  bgcolor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  height: '100%',
                  minHeight: 70,
                  width: '100%',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Holiday Summary
                  </Typography>
                  <Box sx={heroIconBadgeSx(2)}>
                    <IconCalendarX size={20} />
                  </Box>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {/* Holiday Count */}
                  <Box data-tour="holiday-analytics">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}
                    >
                      Holiday Count
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{ color: heroAccent(2) }}
                    >
                      {statistics.holiday_count}
                    </Typography>
                  </Box>
                  {/* Days Used with progress bar */}
                  <Box data-tour="holiday-analytics">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}
                    >
                      Days Used
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(daysUsedPercentage || 0, 100)}
                        color={
                          daysUsedPercentage > 80
                            ? 'error'
                            : daysUsedPercentage > 50
                              ? 'warning'
                              : 'primary'
                        }
                        sx={{
                          flex: 1,
                          height: 5,
                          borderRadius: 4,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                        }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{
                          color:
                            daysUsedPercentage > 80
                              ? 'error.main'
                              : daysUsedPercentage > 50
                                ? 'warning.main'
                                : 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        {daysUsedPercentage}%
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      {statistics.holiday_days_used} of {statistics.holiday_days_allocated} days
                      used
                    </Typography>
                  </Box>
                  {/* Upcoming holiday days still ahead in the term */}
                  <Box data-tour="holiday-analytics">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}
                    >
                      Upcoming
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: heroAccent(2) }}>
                      {statistics.upcoming_holiday_days ?? 0}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      holiday days still ahead
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      <ParentCard
        sx={{
          '& .MuiCardHeader-root': { pb: 0.5, pt: 2 },
          '& .MuiCardContent-root': { pt: 1 },
        }}
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Holidays</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPlus />}
              onClick={handleOpenModal}
              disabled={!selectedTermId}
              data-tour="holiday-create"
            >
              Create Holiday
            </Button>
          </Box>
        }
      >
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            select
            label="Session"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {sessions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.session_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Term"
            value={selectedTermId}
            onChange={handleTermChange}
            size="small"
            sx={{ minWidth: 160 }}
            disabled={sessionTerms.length === 0}
          >
            {sessionTerms.map((t) => (
              <MenuItem key={t.session_term_id} value={t.session_term_id}>
                {t.display_name || t.term_name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {!selectedTermId ? (
          <Alert severity="info">Select a session and term to view holidays.</Alert>
        ) : (
          <Box>
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Holiday Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
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
                        <TableCell><Skeleton variant="text" width={160} height={20} /></TableCell>
                        <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                        <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                        <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedHolidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          No holidays found for this term.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHolidays.map((h, i) => (
                      <TableRow key={h.id} hover>
                        <TableCell>{i + 1 + page * rowsPerPage}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{h.name}</TableCell>
                        <TableCell>{h.start_date}</TableCell>
                        <TableCell>{h.end_date}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, h.id)}>
                            <IconDotsVertical size={16} />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor) && menuHolidayId === h.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                handleDeleteClick(h.id);
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <IconTrash size={16} style={{ marginRight: 8 }} />
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={holidays.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, p) => setPage(p)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        )}
      </ParentCard>

      {/* Create Holiday Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Create Holiday
          {sessionLabel && selectedTermLabel ? ` for ${sessionLabel} - ${selectedTermLabel}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {termDateRange ? (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Dates must be within the term calendar:{' '}
                <strong>{formatIsoDate(termDateRange.start_date)}</strong>{' '}
                → <strong>{formatIsoDate(termDateRange.end_date)}</strong>
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                No calendar weeks found for this term. Dates will not be restricted.
              </Alert>
            )}
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="small"
                startIcon={<IconPlus />}
                onClick={handleAddRow}
              >
                Add More
              </Button>
            </Box>
            {rows.map((row, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <TextField
                  label="Holiday Name"
                  value={row.name}
                  onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                  size="small"
                  sx={{ flex: 2, width: '100%' }}
                  error={!!errors[index]?.name}
                  helperText={errors[index]?.name}
                  required
                />
                <TextField
                  label="Start Date"
                  type="date"
                  value={row.start_date}
                  onChange={(e) => handleRowChange(index, 'start_date', e.target.value)}
                  size="small"
                  sx={{ flex: 1.5, width: '100%' }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      min: termDateRange?.start_date,
                      max: termDateRange?.end_date,
                    },
                  }}
                  error={!!errors[index]?.start_date}
                  helperText={errors[index]?.start_date}
                  required
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={row.end_date}
                  onChange={(e) => handleRowChange(index, 'end_date', e.target.value)}
                  size="small"
                  sx={{ flex: 1.5, width: '100%' }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      min: row.start_date || termDateRange?.start_date,
                      max: termDateRange?.end_date,
                    },
                  }}
                  error={!!errors[index]?.end_date}
                  helperText={errors[index]?.end_date}
                  required
                />
                {rows.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRow(index)}
                    sx={{ mt: 0.5 }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSaveHolidays} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Create Holiday'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}>
        <DialogTitle>Delete Holiday</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this holiday?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setConfirmDelete({ open: false, id: null })}
          >
            Cancel
          </Button>
          <Button size="small" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HolidaySection;
