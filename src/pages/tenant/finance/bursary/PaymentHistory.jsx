import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Skeleton,
  Alert,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Autocomplete,
  Menu,
  Button,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import debounce from 'lodash/debounce';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import {
  fetchProgrammes,
  fetchClassAndArmsByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import {
  fetchMyWards,
  fetchPaymentsIMade,
  fetchPaymentHistoryClassStudents,
  fetchPaymentHistorySummary,
  fetchPaymentHistoryTransactions,
  fetchPaymentHistoryPaymentNameOptions,
  searchPaymentHistoryStudents,
  requeryPaymentHistoryTransaction,
} from '@/api/tenant/bursary/paymentHistoryApi';
import {
  fetchTenantSessions,
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment History' }];

const STAFF_ROLES = ['bursar', 'super_admin', 'school_admin', 'bursary_officer'];

const STATUS_COLOR = { APPROVED: 'success', PENDING: 'warning', DECLINED: 'error' };
const TYPE_LABEL = { CASH: 'Post Cash', ONLINE: 'Online', BANK_TELLER: 'Bank Teller' };

const money = (n) =>
  `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SummaryStat = ({ label, value, color }) => (
  <Box sx={{ flex: 1, textAlign: 'center', py: 1 }}>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={800} color={color}>
      {value}
    </Typography>
  </Box>
);

const SummaryCard = ({ label, data, color }) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderTop: `4px solid ${color}`, height: '100%' }}>
    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
      {label}
    </Typography>
    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
      <SummaryStat label="Due" value={money(data.due)} />
      <SummaryStat label="Paid" value={money(data.paid)} color="success.main" />
      <SummaryStat
        label="Balance"
        value={money(data.balance)}
        color={data.balance > 0 ? 'error.main' : 'text.primary'}
      />
    </Stack>
  </Paper>
);

const WalletCard = ({ wallet, guardianName }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          bgcolor: '#e0f2fe',
          color: '#0284c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AccountBalanceWalletOutlinedIcon />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Your Wallet ({guardianName})
        </Typography>
        {wallet?.wallet_no ? (
          <Typography variant="body2" color="text.secondary">
            {wallet.wallet_account_name || guardianName} — {wallet.wallet_no}
            {wallet.bank_name ? ` (${wallet.bank_name})` : ''}
            {wallet.wallet_balance !== undefined && wallet.wallet_balance !== null
              ? ` · Balance: ${money(wallet.wallet_balance)}`
              : ''}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No wallet account found for you yet.
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

const PaymentHistory = () => {
  const { user, roles } = useAuth();
  const notify = useNotification();

  const isBursaryStaff = useMemo(
    () =>
      Array.isArray(roles) &&
      roles.some((r) => STAFF_ROLES.includes(typeof r === 'string' ? r : r?.name)),
    [roles],
  );
  const isParent = useMemo(
    () =>
      Array.isArray(roles) && roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'parent'),
    [roles],
  );

  const selfId = user?.id || user?.user_id;

  // ── Staff picker: Programme → Class → Student ──────────────────
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [programmeId, setProgrammeId] = useState('');
  const [classArmId, setClassArmId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── Parent ward picker ──────────────────────────────────────────
  // A parent has no fees of their own — only wards do — so "Myself" is a
  // distinct view (payments the parent personally made, across any ward),
  // not just another entry in the ward list.
  const [wards, setWards] = useState([]);
  const [guardian, setGuardian] = useState(null);
  const [viewMode, setViewMode] = useState('myself'); // 'myself' | 'ward'
  const [selectedWardId, setSelectedWardId] = useState('');

  const [selectedUserId, setSelectedUserId] = useState(isBursaryStaff || isParent ? '' : selfId);

  useEffect(() => {
    if (!isBursaryStaff) return;
    (async () => {
      try {
        const res = await fetchProgrammes();
        setProgrammes(res.data.map((p) => ({ value: p.id, label: p.programme_name })));
      } catch (error) {
        console.error('Failed to load programmes', error);
      }
    })();
  }, [isBursaryStaff]);

  useEffect(() => {
    if (!isParent) return;
    (async () => {
      try {
        const res = await fetchMyWards();
        setWards(res.data?.wards || []);
        setGuardian(res.data?.guardian || null);
      } catch (error) {
        console.error('Failed to load wards', error);
        notify.error('Failed to load your wards');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParent]);

  // Ward mode drives selectedUserId from the picked ward; Myself mode uses
  // a completely separate endpoint (payments made, not a fee record).
  useEffect(() => {
    if (!isParent) return;
    setSelectedUserId(viewMode === 'ward' ? selectedWardId : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParent, viewMode, selectedWardId]);

  const handleProgrammeChange = async (val) => {
    setProgrammeId(val);
    setClassArmId('');
    setStudents([]);
    setSelectedUserId('');
    setSelectedStudentOption(null);
    try {
      const res = await fetchClassAndArmsByProgramme(val);
      setClasses(
        res.data.map((c) => ({
          value: c.class_arm_id,
          label: `${c.class_code} (${c.class_arm_names})`,
        })),
      );
    } catch (error) {
      console.error('Failed to load classes', error);
    }
  };

  const handleClassChange = async (val) => {
    setClassArmId(val);
    setSelectedUserId('');
    setSelectedStudentOption(null);
    setLoadingStudents(true);
    try {
      const res = await fetchPaymentHistoryClassStudents(val);
      setStudents(res.data || []);
    } catch (error) {
      console.error('Failed to load students', error);
      notify.error('Failed to load students for this class');
    } finally {
      setLoadingStudents(false);
    }
  };

  // ── Staff search: find a student directly, skipping the cascade ─
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentOption, setSelectedStudentOption] = useState(null);

  const runStudentSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query || query.length < 2) {
          setSearchOptions([]);
          setSearchLoading(false);
          return;
        }
        try {
          const res = await searchPaymentHistoryStudents(query);
          setSearchOptions(res.data || []);
        } catch (error) {
          console.error('Failed to search students', error);
        } finally {
          setSearchLoading(false);
        }
      }, 400),
    [],
  );

  useEffect(() => () => runStudentSearch.cancel(), [runStudentSearch]);

  const handleSearchInputChange = (event, value) => {
    setSearchLoading(true);
    runStudentSearch(value);
  };

  const handleSearchSelect = async (event, option) => {
    setSelectedStudentOption(option);
    if (!option) return;

    setSelectedUserId(option.user_id);
    setProgrammeId(option.programme_id ?? '');
    setClassArmId(option.class_arm_id ?? '');

    // Prefill the Programme → Class cascade to match the picked student,
    // instead of leaving it blank/inconsistent with the search result.
    try {
      if (option.programme_id) {
        const classesRes = await fetchClassAndArmsByProgramme(option.programme_id);
        setClasses(
          classesRes.data.map((c) => ({
            value: c.class_arm_id,
            label: `${c.class_code} (${c.class_arm_names})`,
          })),
        );
      }
      if (option.class_arm_id) {
        const studentsRes = await fetchPaymentHistoryClassStudents(option.class_arm_id);
        setStudents(studentsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to prefill class/programme for searched student', error);
    }
  };

  // ── Filters ───────────────────────────────────────────────────
  const [sessions, setSessions] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [terms, setTerms] = useState([{ id: 'all', label: 'All Terms' }]);
  const [selectedSessionId, setSelectedSessionId] = useState('all');
  const [selectedTermId, setSelectedTermId] = useState('all');
  const [payType, setPayType] = useState('');
  const [status, setStatus] = useState('');
  const [paymentNameId, setPaymentNameId] = useState('');
  const [paymentNameOptions, setPaymentNameOptions] = useState([]);

  // Load every session, plus the tenant's currently active session+term (to
  // preselect both filters by default) — same pattern as My Applications.
  useEffect(() => {
    (async () => {
      try {
        const [sessionsRes, activeRes] = await Promise.all([
          fetchTenantSessions({ pagination: false }),
          fetchActiveTenantSessionTerm().catch(() => null),
        ]);

        setSessions([
          { id: 'all', label: 'All Sessions' },
          ...(sessionsRes?.data || []).map((s) => ({ id: s.id, label: s.session_name })),
        ]);

        const active = activeRes?.data;
        if (active?.session_id) {
          setSelectedSessionId(active.session_id);
          setSelectedTermId(active.id);
        }
      } catch (error) {
        console.error('Failed to load sessions', error);
      }
    })();
  }, []);

  // Terms scoped to the selected session (a term's own id repeats across
  // every session — the session_term id here is what filters actually use).
  useEffect(() => {
    if (selectedSessionId === 'all') {
      setTerms([{ id: 'all', label: 'All Terms' }]);
      return;
    }

    (async () => {
      try {
        const res = await fetchSessionTerms(selectedSessionId);
        setTerms([
          { id: 'all', label: 'All Terms' },
          ...res.data.map((st) => ({ id: st.id, label: st.term?.term_name || st.term_name || '—' })),
        ]);
      } catch (error) {
        console.error('Failed to load terms', error);
      }
    })();
  }, [selectedSessionId]);

  const [summary, setSummary] = useState({
    compulsory: { due: 0, paid: 0, balance: 0 },
    optional: { due: 0, paid: 0, balance: 0 },
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isParent && !selectedUserId) return;
    setPayType('');
    setStatus('');
    setPaymentNameId('');
    setPaymentNameOptions([]);
    setPage(0);

    // The payment-name filter is scoped to one student's own transactions —
    // not applicable to the Myself view, which spans multiple wards.
    if (!selectedUserId) return;

    (async () => {
      try {
        const res = await fetchPaymentHistoryPaymentNameOptions(selectedUserId);
        setPaymentNameOptions(res.data || []);
      } catch (error) {
        console.error('Failed to load payment name options', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, viewMode]);

  // A specific term (session_term_id) is the most precise filter; picking
  // "All Terms" within one session falls back to filtering by session alone.
  const effectiveSessionTermId = selectedTermId !== 'all' ? selectedTermId : undefined;
  const effectiveSessionId =
    selectedTermId === 'all' && selectedSessionId !== 'all' ? selectedSessionId : undefined;

  const showingMyself = isParent && viewMode === 'myself';

  const loadData = useCallback(async () => {
    if (!showingMyself && !selectedUserId) return;
    setLoading(true);
    try {
      if (showingMyself) {
        // A parent has no fees of their own — no summary cards here, just
        // every payment they personally made, across any ward.
        const txRes = await fetchPaymentsIMade({
          session_id: effectiveSessionId,
          session_term_id: effectiveSessionTermId,
          pay_type: payType || undefined,
          status: status || undefined,
          page: page + 1,
          per_page: rowsPerPage,
        });
        setRows(txRes.data || []);
        setTotal(txRes.meta?.total || 0);
      } else {
        const [summaryRes, txRes] = await Promise.all([
          fetchPaymentHistorySummary({
            user_id: selectedUserId,
            session_id: effectiveSessionId,
            session_term_id: effectiveSessionTermId,
          }),
          fetchPaymentHistoryTransactions({
            user_id: selectedUserId,
            session_id: effectiveSessionId,
            session_term_id: effectiveSessionTermId,
            pay_type: payType || undefined,
            status: status || undefined,
            payment_name_id: paymentNameId || undefined,
            page: page + 1,
            per_page: rowsPerPage,
          }),
        ]);
        setSummary(summaryRes.data);
        setRows(txRes.data || []);
        setTotal(txRes.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load payment history', error);
      notify.error(error?.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingMyself, selectedUserId, effectiveSessionId, effectiveSessionTermId, payType, status, paymentNameId, page, rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [requeryingId, setRequeryingId] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const handleActionMenuOpen = (event, row) => {
    setActionAnchorEl(event.currentTarget);
    setActiveRow(row);
  };
  const handleActionMenuClose = () => setActionAnchorEl(null);

  const handleRequery = async (row) => {
    handleActionMenuClose();
    setRequeryingId(row.id);
    try {
      const res = await requeryPaymentHistoryTransaction(row.id);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: res.transaction_status } : r)));
      notify.success(`Transaction status: ${res.transaction_status}`);
    } catch (error) {
      console.error('Failed to requery transaction', error);
      notify.error(error?.response?.data?.message || 'Failed to requery transaction');
    } finally {
      setRequeryingId(null);
    }
  };

  const handleViewReceipt = (row) => {
    handleActionMenuClose();
    const params = new URLSearchParams({
      bulk_order_id: row.bulk_order_id,
      user_id: row.user_id || selectedUserId,
      session_term_id: row.session_term_id,
    });
    window.open(`/bursary/transactions/print_receipt?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageContainer title="Payment History" description="Track individual bursary payment transactions">
      <Breadcrumb
        title="Payment History"
        subtitle="Track individual transactions made through Post Cash, Bank Teller, and Online"
        items={BCrumb}
      />

      {isParent && <WalletCard wallet={guardian?.wallet} guardianName={guardian?.name || 'You'} />}

      {isParent && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant={viewMode === 'myself' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('myself')}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Myself
            </Button>
            <TextField
              select
              size="small"
              label="Select Ward"
              value={viewMode === 'ward' ? selectedWardId : ''}
              onChange={(e) => {
                setSelectedWardId(e.target.value);
                setViewMode('ward');
              }}
              sx={{ minWidth: 300 }}
            >
              {wards.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                  {w.class_label ? ` — ${w.class_label}` : ''}
                  {w.programme_name ? ` (${w.programme_name})` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>
      )}

      {isBursaryStaff && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                size="small"
                options={searchOptions}
                loading={searchLoading}
                value={selectedStudentOption}
                filterOptions={(x) => x}
                getOptionLabel={(o) => `${o.fname || ''} ${o.lname || ''}`.trim()}
                isOptionEqualToValue={(o, v) => o.user_id === v.user_id}
                onChange={handleSearchSelect}
                onInputChange={handleSearchInputChange}
                renderOption={(props, option) => (
                  <li {...props} key={option.user_id}>
                    {`${option.fname || ''} ${option.lname || ''}`.trim()}
                    {option.admission_no ? ` (${option.admission_no})` : ''}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search student by name or admission no"
                    placeholder="Start typing..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchLoading ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Or narrow down by Programme → Class → Student below.
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Programme"
                value={programmeId}
                onChange={(e) => handleProgrammeChange(e.target.value)}
              >
                {programmes.map((p) => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Class"
                value={classArmId}
                disabled={!programmeId}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Student"
                value={selectedUserId}
                disabled={!classArmId || loadingStudents}
                onChange={(e) => { setSelectedUserId(e.target.value); setSelectedStudentOption(null); }}
              >
                {students.map((s) => (
                  <MenuItem key={s.user_id} value={s.user_id}>
                    {`${s.fname || ''} ${s.lname || ''}`.trim()} {s.admission_no ? `(${s.admission_no})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      {!showingMyself && !selectedUserId ? (
        <Alert severity="info">
          {isBursaryStaff
            ? 'Select a Programme, Class, and Student to view their payment history.'
            : 'Select a ward to view their payment history.'}
        </Alert>
      ) : (
        <>
          {!showingMyself && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <SummaryCard label="Compulsory Fees" data={summary.compulsory} color="#2563EB" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <SummaryCard label="Optional Fees" data={summary.optional} color="#9333EA" />
              </Grid>
            </Grid>
          )}

          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Session"
                  value={selectedSessionId}
                  onChange={(e) => { setSelectedSessionId(e.target.value); setSelectedTermId('all'); setPage(0); }}
                >
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Term"
                  value={selectedTermId}
                  disabled={selectedSessionId === 'all'}
                  onChange={(e) => { setSelectedTermId(e.target.value); setPage(0); }}
                >
                  {terms.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {!showingMyself && (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Payment Name"
                    value={paymentNameId}
                    onChange={(e) => { setPaymentNameId(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {paymentNameOptions.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Payment Purpose"
                  value={payType}
                  onChange={(e) => { setPayType(e.target.value); setPage(0); }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="bursary">Registered Students</MenuItem>
                  <MenuItem value="admission">Admission</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="DECLINED">Declined</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Payment Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Wallet / Bank</TableCell>
                    <TableCell>{showingMyself ? 'Paid For' : 'Paid By'}</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 10 }).map((__, j) => (
                          <TableCell key={j}><Skeleton variant="text" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <Alert severity="info" sx={{ my: 1 }}>No transactions found.</Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{row.trans_date}</TableCell>
                        <TableCell>{row.payment_name}</TableCell>
                        <TableCell>{row.description || '—'}</TableCell>
                        <TableCell>{TYPE_LABEL[row.payment_type] || row.payment_type}</TableCell>
                        <TableCell>{money(row.amount_paid)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.status}
                            color={STATUS_COLOR[row.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {row.wallet_account_no
                            ? `${row.wallet_account_no}${row.bank_name ? ` (${row.bank_name})` : ''}`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {(showingMyself ? row.paid_for_name : row.paid_by_name)?.trim() || '—'}
                        </TableCell>
                        <TableCell align="center">
                          {row.status === 'APPROVED' || row.payment_type === 'ONLINE' ? (
                            <IconButton
                              size="small"
                              disabled={requeryingId === row.id}
                              onClick={(e) => handleActionMenuOpen(e, row)}
                            >
                              {requeryingId === row.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <MoreVertIcon fontSize="small" />
                              )}
                            </IconButton>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[15, 30, 50, 100]}
            />
          </Paper>
        </>
      )}

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
      >
        {activeRow?.status === 'APPROVED' && (
          <MenuItem onClick={() => handleViewReceipt(activeRow)}>
            <ReceiptLongOutlinedIcon sx={{ mr: 1.5, fontSize: 20, color: '#2e7d32' }} />
            View / Print Receipt
          </MenuItem>
        )}
        {activeRow?.payment_type === 'ONLINE' && activeRow?.status !== 'APPROVED' && (
          <MenuItem onClick={() => handleRequery(activeRow)}>
            <RefreshIcon sx={{ mr: 1.5, fontSize: 20, color: '#ed6c02' }} />
            Requery Transaction
          </MenuItem>
        )}
      </Menu>
    </PageContainer>
  );
};

export default PaymentHistory;
