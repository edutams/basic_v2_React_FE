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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useAuth from 'src/hooks/useAuth';
import { usePermissions } from '@/context/AgentContext/permissions';
import { useNotification } from '@/hooks/useNotification';
import {
  getStats,
  getTransactions,
  getOrganizations,
  getCommissionSchools,
} from '@/api/landlord/commission/commissionApi';
import MyCommissionStatCards from './MyCommissionStatCards';
import CommissionListModal from './CommissionListModal';
import SchoolsListModal from './SchoolsListModal';

const BCrumb = [];

const formatNaira = (value) =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Shared by "My Commission by Subscription" and "My Commission by
// Transaction" — both read the exact same wallet/stats/transaction data
// (the organization's own SkoolPay wallet), the only difference is the
// page's own copy/labels.
const CommissionWalletView = ({ pageTitle, tableTitle, emptyMessage, commissionType }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user: currentUser } = useAuth();
  const { can } = usePermissions();
  const notify = useNotification();
  const organizationId = currentUser?.organization?.id || currentUser?.organization_id;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  const tableRef = useRef(null);
  const scrollToTable = () =>
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
      const res = await getStats({ organizationId, type: commissionType });
      if (res.status) setWallet(res.data);
    } catch (error) {
      console.error('Failed to fetch commission wallet', error);
    } finally {
      setWalletLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, commissionType]);

  const fetchRows = useCallback(async () => {
    if (!organizationId) return;
    setRowsLoading(true);
    try {
      const res = await getTransactions({
        organizationId,
        from: fromDate || undefined,
        to: toDate || undefined,
        search: transactionId || undefined,
        type: commissionType,
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
  }, [organizationId, commissionType]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    setPage(0);
    fetchRows();
  }, [fetchRows]);

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
        <Button
          variant="contained"
          size="small"
          startIcon={<IconArrowLeft />}
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
            page is a read-only statement of commission activity.

            The wallet card's headline figure is the type-specific earnings
            SkoolPay itself computed (subscriptionEarning/transactionEarning
            — see CommissionController::fetchInterestPartyEarnings()), not
            the wallet's current spendable balance, which mixes both types
            together and doesn't answer "how much did I earn via
            subscription/transaction specifically" — the whole point of
            these two dedicated pages. Falls back to the generic
            myCommission (balance) figure when no commissionType is passed
            (shouldn't happen from either real caller, but keeps this
            component safe to reuse without one). */}
        <MyCommissionStatCards
          organizationName={currentUser?.organization?.organization_name}
          wallet={
            commissionType
              ? {
                  ...wallet,
                  myCommission:
                    commissionType === 'transaction'
                      ? wallet?.transactionEarning
                      : wallet?.subscriptionEarning,
                }
              : wallet
          }
          subOrgs={wallet?.subOrgs}
          schools={wallet?.schools}
          loading={walletLoading}
          onViewTransactions={scrollToTable}
          onViewSubOrgs={handleViewSubOrgs}
          onViewSchools={handleViewSchools}
          onSetupWallet={
            can('landlord.bank_account.manage')
              ? () => navigate('/dashboard', { state: { activeTab: '5' } })
              : undefined
          }
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
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleFilter}
                    fullWidth
                    sx={{
                      bgcolor: '#3949ab',
                      textTransform: 'none',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: '#303f9f' },
                    }}
                  >
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
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Payment Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Transaction Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsLoading ? (
                    [...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={row.id ?? row.trans_id ?? index} hover>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {row.transaction_id ?? row.trans_id ?? row.id ?? '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {row.session_id ?? row.sessionId ?? '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: 'normal', minWidth: 200 }}
                            >
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
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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

      <CommissionListModal
        open={subOrgsOpen}
        onClose={() => setSubOrgsOpen(false)}
        title="Sub Agents"
        loading={subOrgsLoading}
        rows={subOrgsRows}
        columns={[
          { key: 'organization_name', label: 'Agent' },
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

      <SchoolsListModal
        open={schoolsOpen}
        onClose={() => setSchoolsOpen(false)}
        title="Schools"
        loading={schoolsLoading}
        rows={schoolsRows}
      />
    </PageContainer>
  );
};

export default CommissionWalletView;
