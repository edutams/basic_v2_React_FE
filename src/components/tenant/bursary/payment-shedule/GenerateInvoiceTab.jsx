import { useState, useContext, useEffect, useMemo } from 'react';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import {
  fetchBursarySessionTerms,
  fetchClasses,
  fetchGenerateInvoiceData,
  fetchGenerateInvoiceStats,
  fetchInvoiceStudentCounts,
} from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  TablePagination,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  GroupsOutlined as GroupsIcon,
  TaskAltOutlined as TaskAltIcon,
  PendingActionsOutlined as PendingIcon,
} from '@mui/icons-material';

const GenerateInvoiceTab = ({
  showSnackbar,
  selectedClass,
  setSelectedClass,
  onUpdateCategory,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { tenantInfo } = useContext(TenantAuthContext) || {};
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || '/Edutams.png';
  const schoolName =
    tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || 'School Name';
  const schoolAddress = tenantInfo?.address || '';
  const schoolEmail = tenantInfo?.administrator_info?.school_owner?.school_owner_email || '';
  const schoolPhone = tenantInfo?.administrator_info?.school_owner?.school_owner_phone || '';

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  // Session and term are picked separately — `sessions` is still a flat
  // list of session_term rows underneath, but selectedSessionTermId below
  // is derived from these two rather than picked directly.
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [loadingScheduleData, setLoadingScheduleData] = useState(false);
  const [errorScheduleData, setErrorScheduleData] = useState(null);
  const [tableCategories, setTableCategories] = useState([]);

  const [studentCounts, setStudentCounts] = useState({ total: 0, generated: 0, pending: 0 });
  const [loadingCounts, setLoadingCounts] = useState(false);

  // True when at least one bursary schedule exists for the selected class & session
  const hasSchedules =
    !loadingScheduleData && scheduleData.length > 0 && tableCategories.length > 0;

  const distinctSessions = useMemo(() => {
    const bySessionId = new Map();
    sessions.forEach((item) => {
      if (!bySessionId.has(item.session_id)) {
        bySessionId.set(item.session_id, item);
      }
    });
    return Array.from(bySessionId.values());
  }, [sessions]);

  const termsForSelectedSession = useMemo(
    () => sessions.filter((item) => item.session_id === selectedSessionId),
    [sessions, selectedSessionId],
  );

  const selectedSessionTermId =
    sessions.find(
      (item) => item.session_id === selectedSessionId && item.term_id === selectedTermId,
    )?.id || '';

  const selectedSessionLabel =
    sessions.find((s) => s.id === selectedSessionTermId)?.session?.session_name || '';

  const selectedTermLabel =
    sessions.find((s) => s.id === selectedSessionTermId)?.term?.term_name || '';

  const selectedClassName =
    classes.find((c) => String(c.id) === String(selectedClass))?.class_name || selectedClass;

  // Fetch session terms on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        // fetchBursarySessionTerms() is ordered newest-first — that's "most
        // recently created", not "actually active". Default off
        // getActiveSessionTerm() instead, same single source of truth every
        // other picker in the app uses.
        const [res, activeRes] = await Promise.all([
          fetchBursarySessionTerms(),
          fetchActiveTenantSessionTerm(),
        ]);
        const list = Array.isArray(res?.data) ? res.data : [];
        setSessions(list);
        if (list.length > 0) {
          const activeSessionTerm = activeRes?.status ? activeRes.data : null;
          const defaultItem =
            (activeSessionTerm && list.find((item) => item.id === activeSessionTerm.id)) || list[0];
          setSelectedSessionId(defaultItem.session_id);
          setSelectedTermId(defaultItem.term_id);
        }
      } catch (err) {
        console.error('Failed to load session terms', err);
        if (typeof showSnackbar === 'function') {
          showSnackbar('Failed to load session terms', 'error');
        }
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, []);

  // If the picked term doesn't exist for whichever session is now selected
  // (e.g. switching to a session that only has two terms set up so far),
  // fall back to the first term that session does have.
  useEffect(() => {
    if (!selectedSessionId || termsForSelectedSession.length === 0) return;
    const stillValid = termsForSelectedSession.some((item) => item.term_id === selectedTermId);
    if (!stillValid) {
      setSelectedTermId(termsForSelectedSession[0].term_id);
    }
  }, [selectedSessionId, termsForSelectedSession, selectedTermId]);

  // Fetch classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await fetchClasses();
        const list = Array.isArray(res?.data) ? res.data : [];
        setClasses(list);
        if (list.length > 0 && !list.find((c) => String(c.id) === String(selectedClass))) {
          setSelectedClass(String(list[0].id));
        }
      } catch (err) {
        console.error('Failed to load classes', err);
        if (typeof showSnackbar === 'function') {
          showSnackbar('Failed to load classes', 'error');
        }
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const loadClassInvoiceStatus = async () => {
      if (!selectedSessionTermId || classes.length === 0) {
        return;
      }

      const payOption = 'compulsory';

      const classStatuses = await Promise.all(
        classes.map(async (cls) => {
          try {
            const res = await fetchGenerateInvoiceStats(selectedSessionTermId, cls.id, payOption);
            const invoiceGenerated = Number(res?.data?.invoice_generated ?? 0);
            return {
              ...cls,
              invoice_generated: invoiceGenerated,
            };
          } catch (err) {
            return {
              ...cls,
              invoice_generated: 0,
            };
          }
        }),
      );

      setClasses(classStatuses);
    };

    loadClassInvoiceStatus();
  }, [selectedSessionTermId, classes.length]);

  // Only re-fetches on an explicit "Fetch" click, not on every keystroke —
  // matches the Fetch-button convention used elsewhere in this app (no
  // auto-fetch while typing).
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

  // Fetch schedule data when session term, selected class, or the applied
  // search term changes. Filtering by payment name happens server-side
  // (`search` param) rather than over the already-loaded rows, so the
  // table and its totals only ever reflect what the backend matched.
  useEffect(() => {
    const loadScheduleData = async () => {
      if (!selectedSessionTermId) return;
      try {
        setLoadingScheduleData(true);
        setErrorScheduleData(null);
        const data = await fetchGenerateInvoiceData({
          sessionTermId: selectedSessionTermId,
          classId: selectedClass || undefined,
          search: appliedSearchQuery || undefined,
        });
        const categories = Array.isArray(data?.categories) ? data.categories : [];
        setTableCategories(categories);

        const rowsObj = data?.rows || {};
        const rowIds = Object.keys(rowsObj);

        // Transform API rows object into flat array for the table
        // Each row has: id, payment_name, category_1, category_2, etc.
        const transformed = rowIds.map((key, index) => {
          const item = rowsObj[key];
          return {
            id: index + 1,
            payment_name_id: item.id,
            paymentName: item.payment_name,
            ...item,
          };
        });

        setScheduleData(transformed);
      } catch (err) {
        console.error('Failed to load schedule data', err);
        setErrorScheduleData(err?.response?.data?.message || 'Failed to load schedule data');
        if (typeof showSnackbar === 'function') {
          showSnackbar('Failed to load invoice data', 'error');
        }
      } finally {
        setLoadingScheduleData(false);
      }
    };
    loadScheduleData();
  }, [selectedSessionTermId, selectedClass, appliedSearchQuery]);

  const calculateTotal = (column) => {
    const total = scheduleData.reduce((sum, row) => {
      const value = row[column];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    return `₦${total.toLocaleString()}`;
  };

  useEffect(() => {
    const loadCounts = async () => {
      if (!selectedSessionTermId || !selectedClass) return;
      try {
        setLoadingCounts(true);
        const res = await fetchInvoiceStudentCounts(selectedSessionTermId, selectedClass);
        const d = res?.data || {};
        setStudentCounts({
          total: Number(d.total_students) || 0,
          generated: Number(d.generated_count) || 0,
          pending: Number(d.pending_count) || 0,
        });
      } catch (err) {
        console.error('Failed to load student counts', err);
        setStudentCounts({ total: 0, generated: 0, pending: 0 });
      } finally {
        setLoadingCounts(false);
      }
    };
    loadCounts();
  }, [selectedSessionTermId, selectedClass]);

  const handleGenerateForPending = () => {
    if (!selectedSessionTermId || !selectedClass) return;
    const url = `/payment-schedule/invoice/${selectedSessionTermId}/${selectedClass}?pending=${studentCounts.pending}`;
    window.open(url, '_blank');
  };

  const handleFetch = () => {
    setAppliedSearchQuery(searchQuery.trim());
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: { sm: 180 } }}>
              <InputLabel>Session</InputLabel>
              <Select
                value={selectedSessionId}
                label="Session"
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={loadingSessions}
              >
                {loadingSessions ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} />
                  </MenuItem>
                ) : (
                  distinctSessions.map((item) => (
                    <MenuItem key={item.session_id} value={item.session_id}>
                      {item.session?.session_name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
              <InputLabel>Term</InputLabel>
              <Select
                value={selectedTermId}
                label="Term"
                onChange={(e) => setSelectedTermId(e.target.value)}
                disabled={loadingSessions || termsForSelectedSession.length === 0}
              >
                {termsForSelectedSession.map((item) => (
                  <MenuItem key={item.term_id} value={item.term_id}>
                    {item.term?.term_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search payment item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetch();
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 320 } }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={handleFetch}
              sx={{ fontWeight: 600, minWidth: 90, whiteSpace: 'nowrap' }}
            >
              Fetch
            </Button>

            <Button
              variant="contained"
              size="small"
              disabled={!hasSchedules}
              onClick={() => {
                const url = `/payment-schedule/invoice/${selectedSessionTermId}/${selectedClass}`;
                window.open(url, '_blank');
              }}
              sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Generate Invoice
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            bgcolor: 'rgba(255, 152, 0, 0.08)',
            p: 2,
            borderRadius: 1,
            mb: 3,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 3,
            },
          }}
        >
          {loadingClasses ? (
            <CircularProgress size={24} />
          ) : (
            <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
              {classes.map((cls) => {
                const hasInvoiceGenerated =
                  (Number(cls.invoice_generated) || Number(cls.invoiceGenerated) || 0) > 0;
                const isSelected = Number(selectedClass) === Number(cls.id);

                return (
                  <Chip
                    key={cls.id}
                    label={cls.class_name}
                    onClick={() => setSelectedClass(cls.id)}
                    icon={
                      hasInvoiceGenerated ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : undefined
                    }
                    sx={{
                      // bgcolor: isSelected
                      //   ? 'primary.main'
                      //   : hasInvoiceGenerated
                      //     ? 'primary.light'
                      //     : 'white',
                      bgcolor: isSelected ? 'primary.main' : isDark ? 'background.paper' : '#fff',
                      color: isSelected
                        ? '#fff'
                        : hasInvoiceGenerated
                          ? 'primary.main'
                          : 'text.primary',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: isSelected
                        ? 'primary.main'
                        : hasInvoiceGenerated
                          ? 'primary.main'
                          : 'divider',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'primary.light',
                      },
                      '& .MuiChip-icon': {
                        color: isSelected ? '#fff' : 'success.dark',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          )}
        </Box>

        {selectedClass && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: isDark ? 'background.default' : '#fff',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.100',
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GroupsIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Total Students
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      {loadingCounts ? <CircularProgress size={16} /> : studentCounts.total}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(0,194,146,0.15)' : '#ebfaf2',
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TaskAltIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Invoices Generated
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="success.main"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {loadingCounts ? <CircularProgress size={16} /> : studentCounts.generated}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor:
                        studentCounts.pending > 0
                          ? isDark
                            ? 'rgba(253,201,15,0.15)'
                            : '#fff4e5'
                          : isDark
                            ? 'rgba(0,194,146,0.15)'
                            : '#ebfaf2',
                      color: studentCounts.pending > 0 ? 'warning.main' : 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PendingIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Still Pending
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={studentCounts.pending > 0 ? 'warning.main' : 'success.main'}
                      sx={{ lineHeight: 1.2 }}
                    >
                      {loadingCounts ? <CircularProgress size={16} /> : studentCounts.pending}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {hasSchedules && studentCounts.pending > 0 && (
                <Button
                  variant="contained"
                  size="small"
                  color="warning"
                  onClick={handleGenerateForPending}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Generate for {studentCounts.pending} Pending
                </Button>
              )}
            </Stack>

            {hasSchedules && studentCounts.total > 0 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(studentCounts.generated / studentCounts.total) * 100}
                  color={studentCounts.pending === 0 ? 'success' : 'warning'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {studentCounts.pending === 0
                    ? `All ${studentCounts.total} student(s) have invoices generated`
                    : `${studentCounts.generated} of ${studentCounts.total} student(s) invoiced — ${studentCounts.pending} left to go`}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Empty state - no bursary schedules configured */}
        {!loadingScheduleData &&
          !errorScheduleData &&
          !hasSchedules &&
          selectedClass &&
          selectedSessionTermId && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                justifyContent: 'center',
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                No payment schedules found for {selectedClassName} in {selectedSessionLabel} -{' '}
                {selectedTermLabel}.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Please ensure at least one bursary schedule has been set up for this class and
                session term before generating invoices. Go to the{' '}
                <Typography component="span" variant="body2" fontWeight={600} color="primary.main">
                  Payment Schedule
                </Typography>{' '}
                section to add a schedule first.
              </Typography>
            </Alert>
          )}

        {hasSchedules && (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? 'background.default' : 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>PAYMENT NAME</TableCell>
                  {tableCategories.map((cat) => (
                    <TableCell key={cat.id} sx={{ fontWeight: 700, minWidth: 120 }}>
                      <Box>
                        <Typography variant="caption" fontWeight={700} display="block">
                          {cat.name}
                        </Typography>
                        <Chip
                          label="Update"
                          size="small"
                          onClick={() => onUpdateCategory?.(cat.id, selectedSessionTermId)}
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + tableCategories.length} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No payment item matches &quot;{appliedSearchQuery}&quot;
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  scheduleData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.paymentName}
                      </Typography>
                    </TableCell>
                    {tableCategories.map((cat) => {
                      const catKey = `category_${cat.id}`;
                      const amount = row[catKey];
                      return (
                        <TableCell key={cat.id}>
                          <Typography variant="body2">
                            {typeof amount === 'number' ? `₦${amount.toLocaleString()}` : amount || '-'}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  ))
                )}
                <TableRow sx={{ bgcolor: isDark ? 'background.default' : 'grey.50' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="body2" fontWeight={700}>
                      Total
                    </Typography>
                  </TableCell>
                  {tableCategories.map((cat) => {
                    const catKey = `category_${cat.id}`;
                    return (
                      <TableCell key={cat.id}>
                        <Typography variant="body2" fontWeight={700}>
                          {calculateTotal(catKey)}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={scheduleData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        )}
      </Box>
    </Stack>
  );
};

export default GenerateInvoiceTab;
