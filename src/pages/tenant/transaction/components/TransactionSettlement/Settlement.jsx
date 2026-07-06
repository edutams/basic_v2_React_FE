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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  TextField,
  Menu,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import { IconDotsVertical } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettlementDetailsModal from './SettlementDetailsModal';
import {
  fetchSettlements,
  fetchSettlementAnalytics,
  fetchBursarySettlementValues,
} from '@/api/tenant/bursary/transactionApi';
import tenantApi from '@/api/tenant/tenant_api';
import dayjs from 'dayjs';
import FeeChart from './FeeChart';
import { usePermissions } from '@/context/TenantContext/permissions';
import { useNotification } from '@/hooks/useNotification';

const Settlement = () => {
  const { can } = usePermissions();
  const notify = useNotification();

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [chartTitle] = useState('Settlement');
  const [chartType] = useState('bar');

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [statusData, setStatusData] = useState({ title: 'Total Transaction Value', items: [] });

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [duration, setDuration] = useState('monthly');

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [syncFrom, setSyncFrom] = useState('');
  const [syncTo, setSyncTo] = useState('');
  const [syncing, setSyncing] = useState(false);

  const format = (n) => `₦${Number(n || 0).toLocaleString()}`;

  const handleSyncFromGateway = async () => {
    if (!syncFrom || !syncTo) {
      // use whatever toast/snackbar utility v2 already has, matching the pattern used elsewhere
      notify.warning('Select both From and To dates before syncing.');
      return;
    }
    setSyncing(true);
    try {
      const res = await tenantApi.post(
        '/bursary/transactions/settlement/fetch_settlement_data_from_gateway',
        {
          from: syncFrom,
          to: syncTo,
        },
      );
      // Show as a toast/snackbar: res.data.message
      notify.success(res.data.message);
      // Optional: refresh the table after a short delay since linking runs in background
      setTimeout(() => {
        loadTable();
        loadValues();
      }, 5000);
    } catch (err) {
      console.error('Gateway sync failed', err);
    } finally {
      setSyncing(false);
    }
  };

  const buildFilters = useCallback(
    (extra = {}) => ({
      from: fromDate || null,
      to: toDate || null,
      search: search || null,
      page,
      per_page: 40,
      ...extra,
    }),
    [fromDate, toDate, search, page],
  );

  const loadTable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSettlements({ filters: buildFilters() });
      if (res.success) {
        setTableData(res.data);
        setLastPage(res.last_page);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch settlements', err);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetchSettlementAnalytics({
        filters: { from: fromDate || null, to: toDate || null, duration },
      });
      if (res.success) setChartData(res.chart);
    } catch (err) {
      console.error('Failed to fetch settlement analytics', err);
    }
  }, [fromDate, toDate, duration]);

  const loadValues = useCallback(async () => {
    try {
      const res = await fetchBursarySettlementValues();
      if (res.success) {
        const d = res.data;
        setStatusData({
          title: 'Total Transaction Value',
          items: [
            {
              label: 'Settlement Today',
              value: format(d.today_total),
              color: '#4DA3F5',
              bgColor: '#EAF4FF',
            },
            {
              label: 'Settlement This Week',
              value: format(d.this_week_total),
              color: '#6BC68D',
              bgColor: '#EEF9F2',
            },
            {
              label: 'Settlement This Month',
              value: format(d.this_month_total),
              color: '#E95A71',
              bgColor: '#FDF1F3',
            },
            {
              label: 'Settlement This Year',
              value: format(d.this_year_total),
              color: '#3247C6',
              bgColor: '#EEF0FF',
            },
          ],
        });
      }
    } catch (err) {
      console.error('Failed to fetch settlement values', err);
    }
  }, []);

  useEffect(() => {
    loadTable();
    loadAnalytics();
    loadValues();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [duration]);

  const handleFetch = () => {
    setPage(1);
    loadTable();
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await tenantApi.post(
        '/bursary/transactions/settlement/export_csv_settlements',
        { filters: buildFilters() },
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlements_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed', err);
    }
  };

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
    colors: [theme.palette.primary.main],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', distributed: false } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    xaxis: {
      categories,
      labels: { style: { colors: isDark ? '#aaa' : '#64748B', fontSize: '9px' } },
    },
    yaxis: {
      title: { text: 'Settlements Amount', style: { fontWeight: 600 } },
      labels: {
        formatter: (val) =>
          val >= 1000000
            ? `${(val / 1000000).toFixed(1)}M`
            : val >= 1000
              ? `${(val / 1000).toFixed(0)}K`
              : `${val}`,
      },
    },
    grid: { borderColor: isDark ? '#333' : '#F1F5F9', strokeDashArray: 5 },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val) => `₦${val.toLocaleString()}` },
    },
  });

  return (
    <PageContainer title="Settlement">
      {can('walet_manager.transactions.fetch_gateway_settlement') && (
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Sync From"
              type="date"
              value={syncFrom}
              onChange={(e) => setSyncFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Sync To"
              type="date"
              value={syncTo}
              onChange={(e) => setSyncTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              disabled={syncing}
              onClick={handleSyncFromGateway}
            >
              {syncing ? 'Syncing…' : 'Fetch from Gateway'}
            </Button>
          </Grid>
        </Grid>
      )}
      <FeeChart
        title=" Settlement Analytics"
        chartType={chartType}
        chartOptions={buildChartOptions(chartData?.categories || [])}
        chartSeries={chartData?.series || []}
        statusData={statusData}
        onDurationChange={setDuration}
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
            <Typography variant="h5">Settlement</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCSV}
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
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              placeholder="Search by bank, account, or rev code"
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
                  <TableCell>Bank</TableCell>
                  <TableCell>Account Number</TableCell>
                  <TableCell>No. of Revenue</TableCell>
                  <TableCell>No. of Transaction</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date Paid</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      No settlements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * 40 + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.bank_name}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.account_number}</TableCell>
                      <TableCell>{row.no_of_revenue}</TableCell>
                      <TableCell>{row.no_of_transaction}</TableCell>
                      <TableCell>{format(row.amount)}</TableCell>
                      <TableCell>{dayjs(row.date_paid).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                      <TableCell align="center">
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
            Showing {tableData.length} of {totalCount} settlements
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
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setDetailsOpen(true);
            }}
          >
            <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            View Details
          </MenuItem>
        </Menu>

        <SettlementDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          settlementId={activeRow?.settlement_id}
          bankLabel={activeRow ? `${activeRow.bank_name} - ${activeRow.account_number}` : ''}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default Settlement;
