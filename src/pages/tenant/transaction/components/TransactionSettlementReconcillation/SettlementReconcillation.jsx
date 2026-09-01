import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';

import { IconDotsVertical, IconChecklist } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import FeeChart from './FeeChart';
import ReconcileSettlementsModal from './ReconcileSettlementsModal';
import dayjs from 'dayjs';

import TransactionsModal from './ReconciliationModals/TransactionsModal';
import RevenuesModal from './ReconciliationModals/RevenuesModal';
import {
  fetchSettlementReconciliationData,
  fetchSettlementReconciliationAnalytics,
  exportSettlementReconciliationCsv,
} from '@/api/tenant/bursary/transactionApi';
import SettlementsModal from './ReconciliationModals/SettlementsModal';

const fmtNaira = (val) => `₦${Number(val || 0).toLocaleString()}`;

const SettlementReconcillation = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ---------- Table filters / data ----------
  const [filters, setFilters] = useState({ from: '', to: '', search: '' });
  const [page, setPage] = useState(0); // zero-based for TablePagination
  const [perPage, setPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  // ---------- Chart / analytics ----------
  const [period, setPeriod] = useState('this_month');
  const [periodValue, setPeriodValue] = useState(null);
  const [chartTitle] = useState('Settlement Recon.');
  const [chartType] = useState('bar');
  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [statusData, setStatusData] = useState({ title: 'TOTAL RECONCILIATION', items: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ---------- Row menu ----------
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  // ---------- Modals ----------
  const [activeRow, setActiveRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [settlementsModalOpen, setSettlementsModalOpen] = useState(false);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ---- Analytics: chart + status breakdown for the current period ----
  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      let from, to;

      if (period === 'today') {
        const d = periodValue || dayjs().format('YYYY-MM-DD');
        from = d;
        to = d;
      } else if (period === 'this_week') {
        const year = periodValue?.year ?? dayjs().year();
        const week = periodValue?.week ?? dayjs().isoWeek();
        from = dayjs().year(year).isoWeek(week).startOf('week').format('YYYY-MM-DD');
        to = dayjs().year(year).isoWeek(week).endOf('week').format('YYYY-MM-DD');
      } else if (period === 'this_month') {
        const year = periodValue?.year ?? dayjs().year();
        const month = periodValue?.month ?? dayjs().month() + 1;
        from = dayjs()
          .year(year)
          .month(month - 1)
          .startOf('month')
          .format('YYYY-MM-DD');
        to = dayjs()
          .year(year)
          .month(month - 1)
          .endOf('month')
          .format('YYYY-MM-DD');
      } else if (period === 'this_year') {
        const year = periodValue ?? dayjs().year();
        from = dayjs().year(year).startOf('year').format('YYYY-MM-DD');
        to = dayjs().year(year).endOf('year').format('YYYY-MM-DD');
      }

      const res = await fetchSettlementReconciliationAnalytics({ filters: { from, to } });
      if (res?.success) {
        setChartData(res.chart || { categories: [], series: [] });
        setStatusData(res.status_breakdown);
      }
    } catch (err) {
      console.error('Failed to load settlement reconciliation analytics', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [period, periodValue]);

  useEffect(() => {
    loadAnalytics();
  }, [period, periodValue, loadAnalytics]);

  // ---- Main (bank-grouped) table ----
  const loadTableData = useCallback(
    async (targetPage = page, targetPerPage = perPage) => {
      setTableLoading(true);
      try {
        const res = await fetchSettlementReconciliationData({
          filters: {
            from: filters.from || undefined,
            to: filters.to || undefined,
            search: filters.search || undefined,
            page: targetPage + 1, // API is 1-based
            per_page: targetPerPage,
          },
        });
        if (res?.success) {
          setRows(res.data || []);
          setTotalRows(res.total || 0);
        }
      } catch (err) {
        console.error('Failed to load settlement reconciliation data', err);
      } finally {
        setTableLoading(false);
      }
    },
    [filters, page, perPage],
  );

  useEffect(() => {
    loadTableData(page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  const handleFetchClick = () => {
    setPage(0);
    loadTableData(0, perPage);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // ---- Row menu ----
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleViewSettlements = (row) => {
    setActiveRow({ ...row, from: filters.from, to: filters.to });
    setModalOpen(true);
    handleMenuClose();
  };

  // rowData passed to every modal is the full bank row:
  // { bank_name, account_number, payment_name_ids, no_of_transactions,
  //   no_of_revenue, no_of_settlements, expected_amount, reconciled_amount,
  //   balance, outstanding_trns } — plus the current from/to filters, since the
  // details endpoint needs both payment_name_ids and a date range.
  const handleOpenTransactions = (row) => {
    setSelectedRow({ ...row, from: filters.from, to: filters.to });
    setTransactionsModalOpen(true);
  };

  const handleOpenRevenue = (row) => {
    setSelectedRow({ ...row, from: filters.from, to: filters.to });
    setRevenueModalOpen(true);
  };

  const handleOpenSettlements = (row) => {
    setSelectedRow({ ...row, from: filters.from, to: filters.to });
    setSettlementsModalOpen(true);
  };

  // ---- Chart options ----
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

    title: {
      text: chartTitle,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 600,
      },
    },

    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },

    colors: ['#3949AB', '#10B981'],

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
        distributed: false,
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 0,
    },

    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDark ? '#aaa' : '#64748B',
          fontSize: '12px',
        },
      },
    },

    yaxis: {
      labels: {
        formatter: (val) => {
          if (val >= 1000000) {
            return `₦${(val / 1000000).toFixed(1)}M`;
          }

          if (val >= 1000) {
            return `₦${(val / 1000).toFixed(0)}K`;
          }

          return `₦${val}`;
        },
      },
    },

    grid: {
      borderColor: isDark ? '#333' : '#F1F5F9',
      strokeDashArray: 5,
    },

    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val) => `₦${val.toLocaleString()}`,
      },
    },
  });

  const downloadReconciliation = async (extraFilters = {}) => {
    try {
      const res = await exportSettlementReconciliationCsv(
        {
          filters: {
            from: filters.from || undefined,
            to: filters.to || undefined,
            search: filters.search || undefined,
            ...extraFilters,
          },
        },
        { responseType: 'blob' },
      );

      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlement_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download reconciliation failed', err);
    }
  };

  return (
    <PageContainer title="Settlement Reconciliation">
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
      />

      {analyticsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      <ParentCard
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Settlement Reconciliation</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                size="small"
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Bank Statement
              </Button>
              <Button
                variant="outlined"
                onClick={() => downloadReconciliation()}
                startIcon={<DownloadIcon />}
                size="small"
              >
                Download Reconciliation
              </Button>
            </Box>
          </Box>
        }
      >
        <Alert severity="info" sx={{ mb: 2 }} color="info" variant="outlined">
          <Typography variant="body2">
            Settlement represents the amount expected from transactions processed through payment
            channels. To ensure accuracy, always reconcile settlement figures against your uploaded
            bank statement.
          </Typography>
        </Alert>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={2} lg={4}>
            <TextField
              fullWidth
              size="small"
              label="To"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by bank or account"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleFetchClick}
              disabled={tableLoading}
            >
              {tableLoading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
            </Button>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>No. of Transactions</TableCell>
                <TableCell>No. of Revenue</TableCell>
                <TableCell>No. of Settlements</TableCell>
                <TableCell>Total Settelements (₦)</TableCell>
                <TableCell>Total Reconciliations (₦)</TableCell>
                <TableCell>Total Balance (₦)</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${row.bank_name}-${row.account_number}-${index}`} hover>
                  <TableCell>{page * perPage + index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.bank_name}</TableCell>
                  <TableCell>{row.account_number}</TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleOpenTransactions(row)}
                      sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {row.no_of_transactions}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleOpenRevenue(row)}
                      sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {row.no_of_revenue}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleOpenSettlements(row)}
                      sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {row.no_of_settlements}
                    </Link>
                  </TableCell>
                  <TableCell>{fmtNaira(row.expected_amount)}</TableCell>
                  <TableCell>{fmtNaira(row.reconciled_amount)}</TableCell>
                  <TableCell
                    sx={{ color: row.balance > 0 ? '#ef4444' : '#10B981', fontWeight: 600 }}
                  >
                    {fmtNaira(row.balance)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                      <IconDotsVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!tableLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No reconciliation records found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={totalRows}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={perPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </TableContainer>
      </ParentCard>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleViewSettlements(menuRow)}>
          <IconChecklist size={16} style={{ marginRight: 8 }} />
          Reconcile Settlements
        </MenuItem>
        <MenuItem
          onClick={() => {
            downloadReconciliation({ payment_name_ids: menuRow?.payment_name_ids });
            handleMenuClose();
          }}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download Reconciliation
        </MenuItem>
      </Menu>

      <ReconcileSettlementsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        settlementData={activeRow}
      />

      <TransactionsModal
        open={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
        rowData={selectedRow}
      />

      <RevenuesModal
        open={revenueModalOpen}
        onClose={() => setRevenueModalOpen(false)}
        rowData={selectedRow}
      />

      <SettlementsModal
        open={settlementsModalOpen}
        onClose={() => setSettlementsModalOpen(false)}
        rowData={selectedRow}
      />

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Bank Statement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Upload the school's statement of account so we can match it against recorded settlements
            and flag anything missing.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ py: 2, borderStyle: 'dashed' }}
          >
            {selectedFile ? selectedFile.name : 'Choose file (PDF, CSV, XLSX)'}
            <input
              type="file"
              hidden
              accept=".pdf,.csv,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedFile}
            onClick={() => setUploadDialogOpen(false)}
          >
            Upload & Reconcile
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default SettlementReconcillation;
