import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { encodeLinkParams } from '@/utils/scoreLinks';
import {
  Box,
  Grid,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  TextField,
  InputLabel,
  Avatar,
  Menu,
  useTheme,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import useNotification from '@/hooks/useNotification';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import WalletAccountCell from '@/components/shared/WalletAccountCell';
import { IconDotsVertical } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import FeeChart from './FeeChart';
import {
  fetchOnlineTransactions,
  fetchOnlineTransactionAnalytics,
  checkTransactionStatus,
  fetchTransactionValues,
} from '@/api/tenant/bursary/transactionApi';
import {
  fetchSessions,
  fetchTerms,
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import tenantApi from '@/api/tenant/tenant_api';
import dayjs from 'dayjs';

// Page-number list for the pagination footer — always shows page 1 and the
// last page, plus a small window around the current page, with "..." for
// any gap, instead of listing every page for a large result set.
// Each status tab's count pill is colored per-status (not one flat neutral
// gray) whether or not that tab is the active one — pale fill with colored
// text when inactive, solid fill with white text when active.
const TAB_PILL_COLORS = {
  All: { solid: '#2563EB', pale: '#DBEAFE', text: '#2563EB' },
  Successful: { solid: '#16A34A', pale: '#DCFCE7', text: '#16A34A' },
  Pending: { solid: '#D97706', pale: '#FFEDD5', text: '#D97706' },
  Declined: { solid: '#DC2626', pale: '#FEE2E2', text: '#DC2626' },
};

const buildPageList = (current, total) => {
  if (total <= 1) return [1];

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(p);
  });

  return result;
};

const Overview = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const tableRef = React.useRef(null);
  const notify = useNotification();

  const handleCopyTransactionId = async (id) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = id;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      notify.success('Transaction ID copied');
    } catch (error) {
      notify.error('Failed to copy');
    }
  };

  const [chartTitle] = useState('Collection Trend');
  const [chartType] = useState('bar');
  const [activeTab, setActiveTab] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(0); // zero-based for TablePagination
  const [perPage, setPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [statusData, setStatusData] = useState({ title: 'Distribution', items: [], metrics: [] });

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);

  /* FILTERS */
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [stalePendingCount, setStalePendingCount] = useState(0);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [expandedRows, setExpandedRows] = useState(() => new Set());
  const toggleRowExpanded = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [period, setPeriod] = useState('this_month'); // today | this_week | this_month | this_year
  const [periodValue, setPeriodValue] = useState(null);

  const [checkingStatusId, setCheckingStatusId] = useState(null);

  const statusTabs = ['All', 'Successful', 'Pending', 'Declined'];

  const buildFilters = useCallback(
    (extra = {}) => ({
      from: fromDate || null,
      to: toDate || null,
      session_id: sessionId || null,
      term_id: termId || null,
      search: search || null,
      status: activeTab > 0 ? statusTabs[activeTab] : null,
      payment_type: paymentMode || null,
      sort_by: sortBy || null,
      sort_dir: sortDir,
      page: page + 1, // API is 1-based
      per_page: perPage,
      ...extra,
    }),
    [
      fromDate,
      toDate,
      sessionId,
      termId,
      search,
      activeTab,
      paymentMode,
      sortBy,
      sortDir,
      page,
      perPage,
    ],
  );

  const loadTable = useCallback(
    async (targetPage = page, targetPerPage = perPage, extraFilters = {}) => {
      setLoading(true);
      try {
        const res = await fetchOnlineTransactions({
          filters: buildFilters({ page: targetPage + 1, per_page: targetPerPage, ...extraFilters }),
        });
        if (res.success) {
          setTableData(res.data);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      } finally {
        setLoading(false);
      }
    },
    [buildFilters],
  );

  const loadAnalytics = useCallback(
    async (overrides = {}) => {
      try {
        const payload = {
          session_id: sessionId || null,
          term_id: termId || null,
          period,
          ...overrides,
        };

        if (period === 'today') {
          payload.selected_date = periodValue || dayjs().format('YYYY-MM-DD');
        } else if (period === 'this_week') {
          payload.selected_week = periodValue?.week || dayjs().isoWeek();
          payload.selected_year = periodValue?.year || dayjs().year();
        } else if (period === 'this_month') {
          payload.selected_month = periodValue?.month || dayjs().month() + 1;
          payload.selected_year = periodValue?.year || dayjs().year();
        } else if (period === 'this_year') {
          payload.selected_year = periodValue || dayjs().year();
        }

        const res = await fetchOnlineTransactionAnalytics({ filters: payload });
        if (res.success) {
          setChartData(res.chart);
          setStatusData(res.status_breakdown);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      }
    },
    [sessionId, termId, period, periodValue],
  );

  useEffect(() => {
    loadAnalytics();
  }, [period, periodValue]);

  useEffect(() => {
    fetchSessions()
      .then((res) => setSessions(res.data || res || []))
      .catch(console.error);

    // Default the Session/Term filters to the school's current active term
    // rather than leaving them on "All" — reloads loadTable/loadAnalytics
    // once the default resolves, since both already ran once above with
    // sessionId/termId still empty.
    fetchActiveSessionTerm()
      .then((res) => {
        const active = res?.data;
        if (!active?.session_id && !active?.term_id) return;

        if (active.session_id) setSessionId(active.session_id);
        if (active.term_id) setTermId(active.term_id);

        // setSessionId/setTermId above won't be reflected in this closure's
        // sessionId/termId until next render, so the defaults are passed
        // through explicitly here instead of relying on state.
        loadTable(0, perPage, {
          session_id: active.session_id || null,
          term_id: active.term_id || null,
        });
        loadAnalytics({
          session_id: active.session_id || null,
          term_id: active.term_id || null,
        });
      })
      .catch(console.error);

    loadAnalytics();

    fetchTransactionValues()
      .then((res) => setStalePendingCount(res?.data?.stale_pending_count || 0))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setTerms([]);
      return;
    }

    fetchTerms(sessionId)
      .then((res) => setTerms(res.data || res || []))
      .catch(console.error);
  }, [sessionId]);

  // No manual "Apply"/"Fetch" button — every filter re-queries as soon as
  // it changes (each onChange below also resets the page to 0 in the same
  // handler, so this effect always reloads page 0 for a genuinely new
  // filter instead of a stale later page).
  useEffect(() => {
    loadTable(page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, activeTab, fromDate, toDate, sessionId, termId, paymentMode, sortBy, sortDir]);

  // Debounced — the only filter that waits for the user to pause typing
  // rather than re-querying on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(0);
      loadTable(0, perPage);
    }, 450);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // The chart/status-breakdown card is scoped by session+term (plus its own
  // period picker) — reload it when either changes, same as the table.
  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, termId]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(0);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSessionId('');
    setTermId('');
    setSearch('');
    setPaymentMode('');
    setActiveTab(0);
    setSortBy(null);
    setSortDir('desc');
    setPage(0);
    loadTable(0, perPage, {
      from: null,
      to: null,
      session_id: null,
      term_id: null,
      search: null,
      payment_type: null,
      status: null,
      sort_by: null,
      sort_dir: 'desc',
    });
    loadAnalytics({ session_id: null, term_id: null });
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleViewStatusDetails = () => scrollToTable();

  const handleViewReconciliation = () => {
    setActiveTab(2); // Pending
    setPage(0);
    scrollToTable();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleChangeRowsPerPage = (e) => {
    setPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handlePrintReceipt = (row) => {
    const token = encodeLinkParams({
      order_id: row.order_id,
      user_id: row.user_id,
      session_term_id: row.session_term_id,
    });
    window.open(
      `/bursary/transactions/print_receipt?t=${token}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  // const handleCheckStatus = async (row) => {
  //   try {
  //     await checkTransactionStatus(row.id);
  //     await loadTable();
  //     await loadAnalytics();
  //   } catch (err) {
  //     console.error('Failed to check status', err);
  //   }
  // };

  const handleCheckStatus = async (row) => {
    setCheckingStatusId(row.id);
    try {
      const res = await checkTransactionStatus(row.id);
      setTableData((prev) =>
        prev.map((t) => (t.id === row.id ? { ...t, status: res.transaction_status } : t)),
      );
      loadAnalytics();
    } catch (err) {
      console.error('Failed to check status', err);
    } finally {
      setCheckingStatusId(null);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await tenantApi.post(
        '/bursary/transactions/overview/export_csv_online_transaction_analytics',
        {
          filters: {
            from: fromDate || null,
            to: toDate || null,
            session_id: sessionId || null,
            term_id: termId || null,
            search: search || null,
            status: activeTab > 0 ? statusTabs[activeTab] : null,
            payment_type: paymentMode || null,
          },
        },
        { responseType: 'blob' },
      );

      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed', err);
    }
  };

  const format = (n) => `₦${Number(n || 0).toLocaleString()}`;

  // Drives the small count pill on each status tab — derived from the same
  // status_breakdown payload the Transaction Status card uses, so the tab
  // counts and that card can never disagree.
  const tabCounts = useMemo(() => {
    const items = statusData?.items || [];
    const byLabel = (label) => items.find((i) => i.label === label)?.count || 0;
    const successful = byLabel('Successful');
    const pending = byLabel('Pending');
    const declined = byLabel('Declined');

    return [successful + pending + declined, successful, pending, declined];
  }, [statusData]);

  /* Shared compact cell styles */
  const thCell = { fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 0.75, px: 1.5 };
  const tdCell = { py: 0.5, px: 1.5 };

  const SortableHeader = ({ column, children }) => (
    <Box
      onClick={() => handleSort(column)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {children}
      {sortBy === column ? (
        sortDir === 'asc' ? (
          <ArrowUpwardIcon sx={{ fontSize: 14 }} />
        ) : (
          <ArrowDownwardIcon sx={{ fontSize: 14 }} />
        )
      ) : (
        <UnfoldMoreIcon sx={{ fontSize: 14, opacity: 0.5 }} />
      )}
    </Box>
  );

  const buildChartOptions = (categories) => ({
    chart: {
      type: chartType,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
    },
    title: { text: chartTitle, align: 'left', style: { fontSize: '16px', fontWeight: 600 } },
    legend: { position: 'top', horizontalAlign: 'right' },
    colors: ['#3949AB'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', distributed: false } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    xaxis: {
      categories,
      labels: { style: { colors: isDark ? '#aaa' : '#64748B', fontSize: '12px' } },
    },
    yaxis: {
      labels: {
        formatter: (val) =>
          val >= 1000000
            ? `₦${(val / 1000000).toFixed(1)}M`
            : val >= 1000
              ? `₦${(val / 1000).toFixed(0)}K`
              : `₦${val}`,
      },
    },
    grid: {
      borderColor: isDark ? '#333' : '#F1F5F9',
      strokeDashArray: 5,
      padding: { top: 0, right: 8, bottom: 0, left: 8 },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val) => `₦${val.toLocaleString()}` },
    },
  });

  return (
    <PageContainer title="Online Transaction">
      <FeeChart
        title={chartTitle}
        chartType={chartType}
        chartOptions={buildChartOptions(chartData?.categories || [])}
        chartSeries={chartData?.series || []}
        statusData={statusData}
        period={period}
        periodValue={periodValue}
        onPeriodChange={(p) => {
          setPeriod(p);
          setPeriodValue(null);
        }}
        onPeriodValueChange={(v) => setPeriodValue(v)}
        onViewDetails={handleViewStatusDetails}
      />

      <ParentCard
        sx={{
          '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
          '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
        }}
      >
        <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)',
                borderRadius: 1,
                height: 40,
                px: 1,
              }}
            >
              <CalendarMonthOutlinedIcon
                fontSize="small"
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <TextField
                variant="standard"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
                InputProps={{ disableUnderline: true }}
                sx={{ flex: 1 }}
              />
              <Typography color="text.secondary">–</Typography>
              <TextField
                variant="standard"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
                InputProps={{ disableUnderline: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Session</InputLabel>
              <Select
                label="Session"
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">-- All session --</MenuItem>
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.session_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Term</InputLabel>
              <Select
                label="Term"
                value={termId}
                onChange={(e) => {
                  setTermId(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">-- All Term --</MenuItem>
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.term_name || t.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel shrink>Payment Mode</InputLabel>
              <Select
                label="Payment Mode"
                displayEmpty
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Modes</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="BANK_TELLER">Bank Teller</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value);
                  setPage(0);
                }}
              >
                {statusTabs.map((label, idx) => (
                  <MenuItem key={label} value={idx}>
                    {idx === 0 ? 'All Statuses' : label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2.2 }}>
            <TextField
              placeholder="Search by student, payer, transaction ID or payment name..."
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.2 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<RefreshOutlinedIcon fontSize="small" />}
              sx={{ height: '40px' }}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Grid>
          <Grid size={{ xs: 6, md: 1.2 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<DownloadIcon fontSize="small" />}
              sx={{ height: '40px' }}
              onClick={handleDownloadCSV}
            >
              Export
            </Button>
          </Grid>
        </Grid>

        <Box
          sx={{
            mb: 2,
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{
              minHeight: 0,
              '& .MuiTabs-indicator': { bottom: -9 },
              '& .MuiTab-root': {
                minHeight: 0,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
              },
            }}
          >
            {statusTabs.map((label, idx) => {
              const colors = TAB_PILL_COLORS[label];
              const isActive = activeTab === idx;

              return (
                <Tab
                  key={label}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <span>{label === 'All' ? 'All Transactions' : label}</span>
                      <Box
                        component="span"
                        sx={{
                          px: 0.9,
                          py: 0.15,
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1.6,
                          bgcolor: isActive ? colors.solid : colors.pale,
                          color: isActive ? '#fff' : colors.text,
                        }}
                      >
                        {tabCounts[idx]}
                      </Box>
                    </Box>
                  }
                />
              );
            })}
          </Tabs>

          {stalePendingCount > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: isDark ? 'rgba(217,119,6,0.15)' : '#FFFBEB',
                border: '1px solid',
                borderColor: isDark ? 'rgba(217,119,6,0.4)' : '#FDE68A',
                borderRadius: 2,
                px: 1.5,
                py: 0.6,
              }}
            >
              <WarningAmberOutlinedIcon fontSize="small" sx={{ color: '#D97706', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Reconciliation Attention
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                — {stalePendingCount} pending transaction{stalePendingCount === 1 ? '' : 's'} older
                than 24 hours.
              </Typography>
              <Button
                size="small"
                onClick={handleViewReconciliation}
                sx={{ fontWeight: 700, minWidth: 0, py: 0 }}
              >
                View
              </Button>
            </Box>
          )}
        </Box>

        <TableContainer
          ref={tableRef}
          component={Paper}
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
              <TableRow>
                <TableCell sx={thCell}>#</TableCell>
                <TableCell sx={thCell} width={20}>
                  Transaction ID
                </TableCell>
                <TableCell sx={thCell}>
                  <SortableHeader column="student">Student / Payer</SortableHeader>
                </TableCell>
                <TableCell sx={thCell}>
                  <SortableHeader column="class">Class</SortableHeader>
                </TableCell>
                <TableCell sx={thCell}>Wallet / Bank</TableCell>
                <TableCell sx={thCell}>
                  <SortableHeader column="payment_item">Payment Item</SortableHeader>
                </TableCell>
                <TableCell sx={thCell}>
                  <SortableHeader column="amount">Amount</SortableHeader>
                </TableCell>
                <TableCell sx={thCell}>
                  <SortableHeader column="payment_mode">Payment Mode</SortableHeader>
                </TableCell>
                <TableCell sx={thCell}>
                  <SortableHeader column="date">Date & Time</SortableHeader>
                </TableCell>
                <TableCell sx={thCell}>Status</TableCell>
                <TableCell sx={thCell} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={90} height={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="circular" width={36} height={36} />
                        <Box>
                          <Skeleton variant="text" width={120} height={20} />
                          <Skeleton variant="text" width={70} height={16} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={110} height={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={110} height={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={130} height={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={80} height={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton variant="text" width={90} height={20} />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={22}
                        sx={{ borderRadius: '12px' }}
                      />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Skeleton
                        variant="rounded"
                        width={65}
                        height={22}
                        sx={{ borderRadius: '12px' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={tdCell}>
                      <Skeleton variant="circular" width={28} height={28} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      No transactions found.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={tdCell}>{page * perPage + index + 1}</TableCell>
                    <TableCell sx={tdCell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 140,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={row.order_id}
                        >
                          {row.order_id}
                        </Typography>

                        <Tooltip title="Copy Transaction ID">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyTransactionId(row.order_id)}
                            sx={{ p: 0.4, flexShrink: 0 }}
                          >
                            <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36 }} src={row.avatar || undefined}>
                          <PersonOutlineIcon fontSize="small" />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {row.ward_name}
                          </Typography>
                          {row.payer_name && row.payer_name !== row.ward_name && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: 'block' }}
                            >
                              Paid by {row.payer_name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={tdCell}>{row.class || 'N/A (Staff)'}</TableCell>
                    <TableCell sx={tdCell}>
                      <WalletAccountCell row={row} />
                    </TableCell>
                    <TableCell sx={{ ...tdCell, maxWidth: 190 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {row.payment_item || '—'}
                      </Typography>
                      {row.description && expandedRows.has(row.id) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {row.description}
                        </Typography>
                      )}
                      {row.description && (
                        <Box
                          onClick={() => toggleRowExpanded(row.id)}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          {expandedRows.has(row.id) ? 'View less' : 'View more'}
                          {expandedRows.has(row.id) ? (
                            <ExpandLessIcon sx={{ fontSize: 14 }} />
                          ) : (
                            <ExpandMoreIcon sx={{ fontSize: 14 }} />
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={tdCell}>{format(row.amount)}</TableCell>
                    <TableCell sx={tdCell}>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          row.payment_type === 'ONLINE'
                            ? 'Online'
                            : row.payment_type === 'BANK_TELLER'
                              ? 'Bank Teller'
                              : row.payment_type === 'CASH'
                                ? 'Cash'
                                : row.payment_type || '—'
                        }
                        color={row.payment_type === 'ONLINE' ? 'info' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={tdCell}>
                      {dayjs(row.date).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell sx={tdCell}>
                      <Chip
                        size="small"
                        label={
                          row.status === 'APPROVED'
                            ? 'Successful'
                            : row.status === 'PENDING'
                              ? 'Pending'
                              : 'Declined'
                        }
                        color={
                          row.status === 'APPROVED'
                            ? 'success'
                            : row.status === 'PENDING'
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell align="right" sx={tdCell}>
                      <IconButton
                        size="small"
                        disabled={checkingStatusId === row.id}
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setActiveRow(row);
                        }}
                      >
                        {checkingStatusId === row.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <IconDotsVertical size={18} />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalCount > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              px: 1,
              py: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, totalCount)} of{' '}
              {totalCount} transactions
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FormControl size="small">
                <Select
                  value={perPage}
                  onChange={handleChangeRowsPerPage}
                  renderValue={(v) => `Rows per page: ${v}`}
                >
                  {[10, 15, 25, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton
                size="small"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              {buildPageList(page + 1, Math.ceil(totalCount / perPage)).map((p, i) =>
                p === '...' ? (
                  <Typography key={`gap-${i}`} color="text.secondary" sx={{ px: 0.5 }}>
                    …
                  </Typography>
                ) : (
                  <Box
                    key={p}
                    onClick={() => setPage(p - 1)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 700,
                      bgcolor: p === page + 1 ? 'primary.main' : 'transparent',
                      color: p === page + 1 ? '#fff' : 'text.primary',
                      '&:hover': {
                        bgcolor:
                          p === page + 1
                            ? 'primary.main'
                            : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F1F5F9',
                      },
                    }}
                  >
                    {p}
                  </Box>
                ),
              )}

              <IconButton
                size="small"
                disabled={(page + 1) * perPage >= totalCount}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
        >
          {activeRow?.status === 'APPROVED' ? (
            <MenuItem
              onClick={() => {
                handlePrintReceipt(activeRow);
                setAnchorEl(null);
              }}
            >
              <ReceiptLongOutlinedIcon sx={{ mr: 1.5, color: '#2e7d32' }} />
              View / Print Receipt
            </MenuItem>
          ) : (
            <MenuItem
              disabled={checkingStatusId === activeRow?.id}
              onClick={async () => {
                setAnchorEl(null);
                await handleCheckStatus(activeRow);
              }}
            >
              <ReceiptLongOutlinedIcon sx={{ mr: 1.5, color: '#ed6c02' }} />
              {checkingStatusId === activeRow?.id ? 'Checking...' : 'Check Status'}
            </MenuItem>
          )}
        </Menu>
      </ParentCard>
    </PageContainer>
  );
};

export default Overview;
