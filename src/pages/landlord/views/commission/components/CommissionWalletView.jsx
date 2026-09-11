import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  useTheme,
  TablePagination,
  Button,
  TextField,
  Grid,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { IconArrowLeft, IconDownload, IconDotsVertical, IconEye, IconX } from '@tabler/icons-react';
import PageContainer from '../../../../../components/container/PageContainer';
import Breadcrumb from '../../../../../layouts/landlord/shared/breadcrumb/Breadcrumb';
import useAuth from 'src/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import {
  getStats,
  getTransactions,
  getTransactionDetails,
  getOrganizations,
  getCommissionSchools,
} from '@/api/landlord/commission/commissionApi';
import MyCommissionStatCards from './MyCommissionStatCards';
import CommissionListModal from './CommissionListModal';

const BCrumb = [];

const formatNaira = (value) =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Shared by "My Commission by Subscription" and "My Commission by
// Transaction" — both read the exact same wallet/stats/transaction data
// (the organization's own SkoolPay wallet), the only difference is the
// page's own copy/labels.
const CommissionWalletView = ({ pageTitle, tableTitle, emptyMessage }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user: currentUser } = useAuth();
  const notify = useNotification();
  const organizationId = currentUser?.organization?.id || currentUser?.organization_id;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  const tableRef = useRef(null);
  const scrollToTable = () => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [subOrgsOpen, setSubOrgsOpen] = useState(false);
  const [subOrgsRows, setSubOrgsRows] = useState([]);
  const [subOrgsLoading, setSubOrgsLoading] = useState(false);

  const [schoolsOpen, setSchoolsOpen] = useState(false);
  const [schoolsRows, setSchoolsRows] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!organizationId) return;
    setWalletLoading(true);
    try {
      const res = await getStats({ organizationId });
      if (res.status) setWallet(res.data);
    } catch (error) {
      console.error('Failed to fetch commission wallet', error);
    } finally {
      setWalletLoading(false);
    }
  }, [organizationId]);

  const fetchRows = useCallback(async () => {
    if (!organizationId) return;
    setRowsLoading(true);
    try {
      const res = await getTransactions({
        organizationId,
        from: fromDate || undefined,
        to: toDate || undefined,
        search: transactionId || undefined,
      });
      const list = res?.data?.data ?? res?.data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to fetch commission transactions', error);
      notify.error('Failed to load commission details');
      setRows([]);
    } finally {
      setRowsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    setPage(0);
    fetchRows();
  }, [fetchRows]);

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = () => {
    setPage(0);
    fetchRows();
  };

  const handleViewSubOrgs = async () => {
    setSubOrgsOpen(true);
    setSubOrgsLoading(true);
    try {
      const res = await getOrganizations();
      setSubOrgsRows(res?.status ? res.data || [] : []);
    } catch (error) {
      console.error('Failed to fetch sub-organizations', error);
      notify.error('Failed to load sub-organizations');
      setSubOrgsRows([]);
    } finally {
      setSubOrgsLoading(false);
    }
  };

  const handleViewSchools = async () => {
    setSchoolsOpen(true);
    setSchoolsLoading(true);
    try {
      const res = await getCommissionSchools({ organizationId });
      setSchoolsRows(res?.status ? res.data || [] : []);
    } catch (error) {
      console.error('Failed to fetch schools', error);
      notify.error('Failed to load schools');
      setSchoolsRows([]);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const handleViewDetails = async () => {
    const row = selectedItem;
    handleClose();
    const rowId = row?.transaction_id ?? row?.trans_id ?? row?.id;
    if (!rowId) return;

    setDetails(null);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await getTransactionDetails(rowId, { organizationId });
      setDetails(res?.data ?? res);
    } catch (error) {
      console.error('Failed to fetch transaction details', error);
      notify.error('Failed to load transaction details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <PageContainer title={pageTitle} description={`View your ${tableTitle.toLowerCase()}`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Breadcrumb title={pageTitle} items={BCrumb} />
        <Button variant="contained" size="small" startIcon={<IconArrowLeft />}
          onClick={() => navigate('/organization/commissions')}
          sx={{
            textTransform: 'none',
          }}
        >
          Back to Commission Management
        </Button>
      </Box>

      <Box mt={1.5}>
        {/* Stat cards — wallet balance, inflow/outflow, sub-orgs, schools
            by type. Purely informational, no withdraw action here — this
            page is a read-only statement of commission activity. */}
        <MyCommissionStatCards
          organizationName={currentUser?.organization?.organization_name}
          wallet={wallet}
          subOrgs={wallet?.subOrgs}
          schools={wallet?.schools}
          loading={walletLoading}
          onViewTransactions={scrollToTable}
          onViewSubOrgs={handleViewSubOrgs}
          onViewSchools={handleViewSchools}
        />

        {/* Table Section */}
        <Box
          ref={tableRef}
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
                mb: 1.5,
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                {tableTitle}
              </Typography>
              <Button variant="contained" size="small" startIcon={<IconDownload />}
                sx={{
                  bgcolor: '#3949ab',
                  textTransform: 'none',
                  borderRadius: '8px',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: '#303f9f' },
                }}
              >
                Export
              </Button>
            </Box>

            {/* Filter Section */}
            <Box sx={{ mb: 1.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    type="date"
                    label="From"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    type="date"
                    label="To"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Enter transaction ID"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="contained" size="small" onClick={handleFilter} fullWidth sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#303f9f' }, }}>
                    Filter
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Paginated data */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Narration</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Payment Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(8)].map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow key={row.id ?? row.trans_id ?? index} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.transaction_id ?? row.trans_id ?? row.id ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.session_id ?? row.sessionId ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ whiteSpace: 'normal', minWidth: 200 }}>
                            {row.narration ?? row.description ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatNaira(row.amount)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.credit_type ?? row.creditType ?? row.payment_type ?? '—'}
                            size="small"
                            color="success"
                            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.created_at ?? row.transaction_date ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleClick(e, row)}>
                            <IconDotsVertical size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  width: 180,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[3],
                  borderRadius: '12px',
                },
              }}
            >
              <MenuItem onClick={handleViewDetails}>
                <IconEye size={16} style={{ marginRight: 8 }} />
                View Details
              </MenuItem>
            </Menu>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              component="Box"
              sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            />
          </Box>
        </Box>
      </Box>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Transaction Details
          <IconButton size="small" onClick={() => setDetailsOpen(false)}>
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Skeleton variant="rounded" height={160} />
          ) : details ? (
            <Box
              component="pre"
              sx={{
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(details, null, 2)}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No details available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <CommissionListModal
        open={subOrgsOpen}
        onClose={() => setSubOrgsOpen(false)}
        title="Sub Organizations"
        loading={subOrgsLoading}
        rows={subOrgsRows}
        columns={[
          { key: 'organization_name', label: 'Organization' },
          { key: 'schools_count', label: 'Schools', align: 'right' },
          {
            key: 'commission',
            label: 'Commission',
            align: 'right',
            render: (row) => `${row.commission ?? 0}%`,
          },
          { key: 'status', label: 'Status' },
        ]}
      />

      <CommissionListModal
        open={schoolsOpen}
        onClose={() => setSchoolsOpen(false)}
        title="Schools"
        loading={schoolsLoading}
        rows={schoolsRows}
        columns={[
          { key: 'tenant_name', label: 'School' },
          { key: 'organization_name', label: 'Organization' },
          {
            key: 'school_type',
            label: 'Type',
            render: (row) => {
              const raw = row.school_type;
              try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed.join(', ') : raw;
              } catch {
                return raw;
              }
            },
          },
          { key: 'status', label: 'Status' },
        ]}
      />
    </PageContainer>
  );
};

export default CommissionWalletView;
