import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import { IconDotsVertical } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import FeeChart from './FeeChart';
import {
  fetchOnlineTransactions,
  fetchOnlineTransactionAnalytics,
} from '@/api/tenant/bursary/transactionApi';
import { fetchSessions, fetchTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import tenantApi from '@/api/tenant/tenant_api';
import dayjs from 'dayjs';

const Overview = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [chartTitle] = useState('Transaction Overview');
  const [chartType] = useState('bar');
  const [activeTab, setActiveTab] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [duration, setDuration] = useState('monthly');

  const statusTabs = ['All', 'Successful', 'Pending', 'Declined'];

  const buildFilters = useCallback(
    (extra = {}) => ({
      from: fromDate || null,
      to: toDate || null,
      session_id: sessionId || null,
      term_id: termId || null,
      search: search || null,
      status: activeTab > 0 ? statusTabs[activeTab] : null,
      page,
      per_page: 15,
      ...extra,
    }),
    [fromDate, toDate, sessionId, termId, search, activeTab, page],
  );

  const loadTable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOnlineTransactions({ filters: buildFilters() });
      if (res.success) {
        setTableData(res.data);
        setLastPage(res.last_page);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetchOnlineTransactionAnalytics({
        filters: {
          from: fromDate || null,
          to: toDate || null,
          session_id: sessionId || null,
          term_id: termId || null,
          duration,
        },
      });
      if (res.success) {
        setChartData(res.chart);
        setStatusData(res.status_breakdown);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  }, [fromDate, toDate, sessionId, termId, duration]);

  useEffect(() => {
    fetchSessions()
      .then((res) => setSessions(res.data || res || []))
      .catch(console.error);

    loadTable();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (duration) loadAnalytics();
  }, [duration]);

  useEffect(() => {
    if (!sessionId) {
      setTerms([]);
      return;
    }

    fetchTerms(sessionId)
      .then((res) => setTerms(res.data || res || []))
      .catch(console.error);
  }, [sessionId]);

  const handleFetch = () => {
    setPage(1);
    loadTable();
    loadAnalytics();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
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
    grid: { borderColor: isDark ? '#333' : '#F1F5F9', strokeDashArray: 5 },
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
        onDurationChange={(val) => {
          setDuration(val);
        }}
      />
      <ParentCard
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="h5">Transaction Overview</Typography>
            <Button
              variant="contained"
              onClick={handleDownloadCSV}
              size="small"
              startIcon={<DownloadIcon />}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Download CSV Format
            </Button>
          </Box>
        }
      >
        <Grid container spacing={3} sx={{ mb: 3, mt: 3 }} alignItems="center">
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Session</InputLabel>
              <Select
                label="Session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              >
                <MenuItem value="">-- All session --</MenuItem>
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.sesname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Term</InputLabel>
              <Select label="Term" value={termId} onChange={(e) => setTermId(e.target.value)}>
                <MenuItem value="">-- All Term --</MenuItem>
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.term_name || t.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              placeholder="Search by name"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              sx={{ height: '40px' }}
              onClick={handleFetch}
            >
              Fetch
            </Button>
          </Grid>
        </Grid>

        <Box
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            overflowX: 'auto',
            '& .MuiTabs-root': { minWidth: '300px' },
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '14px' } }}
          >
            {statusTabs.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell width={20}>Transaction ID</TableCell>
                  <TableCell>Paid By</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell>{row.transaction_id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{ width: 36, height: 36 }}
                            src={
                              row.avatar ||
                              'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848'
                            }
                          ></Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {row.paid_by}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.class}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{format(row.amount)}</TableCell>
                      <TableCell>{dayjs(row.date).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            row.status === 'APPROVED'
                              ? 'Successful'
                              : row.status === 'PENDING'
                                ? 'Pending'
                                : 'Failed'
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
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setActiveRow(row);
                          }}
                        >
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {tableData.length} of {totalCount} transactions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="small" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 190 } }}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Check Status
          </MenuItem>
        </Menu>
      </ParentCard>
    </PageContainer>
  );
};

export default Overview;
