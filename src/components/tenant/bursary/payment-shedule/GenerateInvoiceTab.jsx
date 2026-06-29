import { useState, useContext, useEffect } from 'react';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import {
  fetchBursarySessionTerms,
  fetchClasses,
  fetchGenerateInvoiceData,
  fetchGenerateInvoiceStats,
  fetchInvoiceStudentCounts,
} from '@/api/tenant/bursary/bursarySettingsApi';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const GenerateInvoiceTab = ({
  showSnackbar,
  selectedClass,
  setSelectedClass,
  onUpdateCategory,
}) => {
  const { tenantInfo } = useContext(TenantAuthContext) || {};
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || '/Edutams.png';
  const schoolName =
    tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || 'School Name';
  const schoolAddress = tenantInfo?.address || '';
  const schoolEmail = tenantInfo?.administrator_info?.school_owner?.school_owner_email || '';
  const schoolPhone = tenantInfo?.administrator_info?.school_owner?.school_owner_phone || '';

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionTermId, setSelectedSessionTermId] = useState('');
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

  const selectedSessionLabel =
    sessions.find((s) => s.id === selectedSessionTermId)?.session?.sesname || '';

  const selectedTermLabel =
    sessions.find((s) => s.id === selectedSessionTermId)?.displayTerm?.display_name || '';

  const selectedClassName =
    classes.find((c) => String(c.id) === String(selectedClass))?.class_name || selectedClass;

  // Fetch session terms on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoadingSessions(true);
        const res = await fetchBursarySessionTerms();
        const list = Array.isArray(res?.data) ? res.data : [];
        setSessions(list);
        if (list.length > 0) {
          setSelectedSessionTermId(list[0].id);
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

      const classStatuses = await Promise.all(
        classes.map(async (cls) => {
          try {
            const res = await fetchGenerateInvoiceStats(selectedSessionTermId, cls.id);
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

  // Fetch schedule data when session term or selected class changes
  useEffect(() => {
    const loadScheduleData = async () => {
      if (!selectedSessionTermId) return;
      try {
        setLoadingScheduleData(true);
        setErrorScheduleData(null);
        const data = await fetchGenerateInvoiceData({
          sessionTermId: selectedSessionTermId,
          classId: selectedClass || undefined,
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
  }, [selectedSessionTermId, selectedClass]);

  const calculateTotal = (column) => {
    return scheduleData
      .reduce((sum, row) => {
        const value = row[column];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0)
      .toLocaleString();
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
    showSnackbar?.(`Fetching data for ${selectedClass}...`, 'info');
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
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AssignmentTurnedInIcon sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Generate Invoice
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <FormControl size="small" sx={{ minWidth: { sm: 200 } }}>
            <InputLabel>Session Term</InputLabel>
            <Select
              value={selectedSessionTermId}
              label="Session Term"
              onChange={(e) => setSelectedSessionTermId(e.target.value)}
              disabled={loadingSessions}
            >
              {loadingSessions ? (
                <MenuItem disabled>
                  <CircularProgress size={16} />
                </MenuItem>
              ) : (
                sessions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.session?.sesname} - {item.display_term?.display_name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: 250 }}
            />

            <Button onClick={handleFetch} sx={{ fontWeight: 600, minWidth: 100 }}>
              Fetch
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
                      hasInvoiceGenerated ? (
                        <CheckCircleIcon
                          sx={{
                            fontSize: 18,
                            color: isSelected ? 'white !important' : 'primary.main !important',
                          }}
                        />
                      ) : undefined
                    }
                    sx={{
                      // bgcolor: isSelected
                      //   ? 'primary.main'
                      //   : hasInvoiceGenerated
                      //     ? 'primary.light'
                      //     : 'white',
                      bgcolor: isSelected
                        ? 'primary.main'
                        : 'white',
                      color: isSelected
                        ? 'white'
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
                        bgcolor: isSelected
                          ? 'primary.dark'
                          : hasInvoiceGenerated
                            ? 'text.main'
                            : 'grey.100',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 2,
            gap: 2,
          }}
        >
          <Alert severity="info" sx={{ flex: 1 }}>
            Payment Schedule for {selectedSessionLabel} - {selectedClassName}
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              size="small"
              onClick={() => {
                const url = `/payment-schedule/invoice/${selectedSessionTermId}/${selectedClass}`;
                window.open(url, '_blank');
              }}
              sx={{ fontWeight: 600 }}
            >
              Generate Invoice / {selectedClassName}
            </Button>
          </Stack>
        </Box>

        {selectedClass && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                mb: 1,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Students
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {loadingCounts ? <CircularProgress size={16} /> : studentCounts.total}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Generated
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {loadingCounts ? <CircularProgress size={16} /> : studentCounts.generated}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {loadingCounts ? <CircularProgress size={16} /> : studentCounts.pending}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {studentCounts.pending > 0 && (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="warning"
                    size="small"
                    onClick={handleGenerateForPending}
                    sx={{ fontWeight: 600, whiteSpace: 'nowrap', ml: 2 }}
                  >
                    Generate Now
                  </Button>
                }
                sx={{ mb: 2, alignItems: 'center' }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {studentCounts.pending} student(s) still need invoice generation. Click
                  &quot;Generate Now&quot; to go to the invoice page and generate for pending
                  students.
                </Typography>
              </Alert>
            )}

            {studentCounts.total > 0 && studentCounts.pending === 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  All {studentCounts.total} student(s) have invoices generated successfully.
                </Typography>
              </Alert>
            )}
          </>
        )}

        {/* Payment Schedule Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
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
              {scheduleData.map((row) => (
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
                          {typeof amount === 'number' ? amount.toLocaleString() : amount || '-'}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
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
      </Box>
    </Stack>
  );
};

export default GenerateInvoiceTab;
