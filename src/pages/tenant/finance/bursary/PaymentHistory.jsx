import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { encodeLinkParams, decodeLinkParams } from '@/utils/scoreLinks';
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
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import debounce from 'lodash/debounce';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
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
  fetchPaymentHistoryStudentInfo,
  searchPaymentHistoryStudents,
  requeryPaymentHistoryTransaction,
} from '@/api/tenant/bursary/paymentHistoryApi';
import {
  fetchTenantSessions,
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment History' }];

const STAFF_ROLES = ['bursar', 'super_admin', 'school_admin'];

const STATUS_COLOR = { APPROVED: 'success', PENDING: 'warning', DECLINED: 'error' };
const CHANNEL_LABEL = { CASH: 'Post Cash', ONLINE: 'Online', BANK_TELLER: 'Bank Teller' };
const CHANNEL_ICON = {
  CASH: PaidOutlinedIcon,
  ONLINE: LaptopMacOutlinedIcon,
  BANK_TELLER: AccountBalanceOutlinedIcon,
};
const CHANNEL_COLOR = { CASH: '#D97706', ONLINE: '#2563EB', BANK_TELLER: '#7C3AED' };

const money = (n) =>
  `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EMPTY_SUMMARY = {
  compulsory: { due: 0, paid: 0, balance: 0 },
  optional: { due: 0, paid: 0, balance: 0 },
  total: { due: 0, paid: 0, balance: 0 },
  counts: { all: 0, compulsory: 0, optional: 0 },
};

const StatSub = ({ icon: Icon, iconColor, label, value, valueColor }) => (
  <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center', px: 0.5 }}>
    <Stack
      direction="row"
      spacing={0.4}
      alignItems="center"
      justifyContent="center"
      sx={{ mb: 0.25 }}
    >
      <Icon sx={{ fontSize: 13, color: iconColor }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10.5px' }}>
        {label}
      </Typography>
    </Stack>
    <Typography
      variant="subtitle1"
      fontWeight={800}
      sx={{ wordBreak: 'break-word', color: valueColor, fontSize: '17px' }}
    >
      {value}
    </Typography>
  </Box>
);

const StatCard = ({ icon: Icon, iconBg, iconColor, label, data }) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '8px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Typography variant="body2" fontWeight={700}>
        {label}
      </Typography>
    </Stack>
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem />}
      sx={{ width: '100%' }}
    >
      <StatSub
        icon={ReceiptLongOutlinedIcon}
        iconColor="#64748B"
        label="Due"
        value={money(data.due)}
      />
      <StatSub
        icon={CheckCircleOutlineIcon}
        iconColor="#16A34A"
        label="Paid"
        value={money(data.paid)}
        valueColor="#16A34A"
      />
      <StatSub
        icon={WarningAmberOutlinedIcon}
        iconColor={data.balance > 0 ? '#DC2626' : '#64748B'}
        label="Outstanding"
        value={money(data.balance)}
        valueColor={data.balance > 0 ? '#DC2626' : undefined}
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

const StudentInfoCard = ({ info, loading, isDark }) => {
  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="text" width={120} />
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (!info) return null;

  const InfoField = ({ icon: Icon, iconBg, iconColor, label, value, valueColor, caption }) => (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 180 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: valueColor }} noWrap>
          {value}
        </Typography>
        {caption && (
          <Typography variant="caption" fontWeight={600} sx={{ color: valueColor }}>
            {caption}
          </Typography>
        )}
      </Box>
    </Stack>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
      <Stack
        direction="row"
        spacing={3}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ width: '100%' }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 220 }}>
          <Avatar src={info.avatar} sx={{ width: 56, height: 56 }}>
            <PersonOutlineIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {info.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {info.admission_no}
            </Typography>
            <Stack direction="row" spacing={0.75}>
              {info.class_label && (
                <Chip size="small" color="primary" variant="outlined" label={info.class_label} />
              )}
              {info.programme_name && (
                <Chip size="small" color="success" variant="outlined" label={info.programme_name} />
              )}
            </Stack>
          </Box>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        <InfoField
          icon={PhoneOutlinedIcon}
          iconBg={isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE'}
          iconColor="#2563EB"
          label="Parent/Guardian"
          value={info.guardian?.full_name || '—'}
          valueColor="#2563EB"
          caption={info.guardian?.phone}
        />

        <InfoField
          icon={CalendarMonthOutlinedIcon}
          iconBg={isDark ? 'rgba(147,51,234,0.18)' : '#F3E8FF'}
          iconColor="#9333EA"
          label="Current Session"
          value={info.session?.name || '—'}
          valueColor="#9333EA"
        />

        <InfoField
          icon={MenuBookOutlinedIcon}
          iconBg={isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7'}
          iconColor="#16A34A"
          label="Current Term"
          value={info.term?.name || '—'}
          valueColor="#16A34A"
        />

        <Box sx={{ ml: { md: 'auto' } }}>
          <Chip
            icon={info.is_active ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
            color={info.is_active ? 'success' : 'default'}
            variant="outlined"
            label={
              <Box>
                <Typography variant="body2" fontWeight={700} component="span" display="block">
                  {info.is_active ? 'Active Student' : 'Not Active'}
                </Typography>
                <Typography variant="caption" component="span" display="block">
                  {info.is_active ? 'Currently enrolled' : info.enrollment_status}
                </Typography>
              </Box>
            }
            sx={{ height: 'auto', py: 1, '& .MuiChip-label': { py: 0.5 } }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

// A transaction row has two real, distinct timestamps — created_at (row
// insertion) and trans_date (the payment's own business date, which can
// genuinely land before OR after created_at depending on the channel) —
// plus updated_at, which only moves again on a later status requery. Rather
// than assume a fixed column→stage mapping, this sorts whichever of the
// three are present into true chronological order so the timeline always
// reads correctly regardless of which channel produced the row.
const buildTimeline = (row) => {
  if (!row) return [];

  const stages = [
    { key: 'created', label: 'Payment Created', time: row.created_at, detail: row.payment_name },
    {
      key: 'initiated',
      label: 'Payment Initiated',
      time: row.trans_date,
      detail: CHANNEL_LABEL[row.payment_type] || row.payment_type,
    },
  ];

  if (row.updated_at && row.updated_at !== row.created_at) {
    const statusLabel =
      row.status === 'APPROVED'
        ? 'Payment Approved'
        : row.status === 'DECLINED'
          ? 'Payment Declined'
          : 'Payment Pending';
    stages.push({
      key: 'status',
      label: statusLabel,
      time: row.updated_at,
      detail: `${money(row.amount_paid)}, via ${CHANNEL_LABEL[row.payment_type] || row.payment_type}${row.bank_name ? ` (${row.bank_name})` : ''}`,
    });
  }

  return stages.filter((s) => s.time).sort((a, b) => new Date(b.time) - new Date(a.time)); // newest first, matching the reference
};

const PaymentTimeline = ({ row }) => {
  const stages = useMemo(() => buildTimeline(row), [row]);

  if (!row) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Payment Timeline
      </Typography>
      <Stack spacing={0}>
        {stages.map((stage, i) => (
          <Box key={stage.key} sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: i === 0 ? 'success.main' : 'grey.300',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i === 0 ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> : null}
              </Box>
              {i < stages.length - 1 && (
                <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.300', my: 0.25 }} />
              )}
            </Box>
            <Box sx={{ pb: i < stages.length - 1 ? 2.5 : 0, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700}>
                {stage.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {stage.detail}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stage.time}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

const TermPaymentSummary = ({ total }) => {
  const paid = Number(total.paid || 0);
  const balance = Number(total.balance || 0);
  const due = Number(total.due || 0);
  const percent = due > 0 ? Math.round((paid / due) * 100) : 0;

  const donutData = [
    { name: 'Paid', value: paid || 0.0001, color: '#16A34A' },
    { name: 'Outstanding', value: balance, color: '#DC2626' },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Term Payment Summary
      </Typography>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ width: 130, flexShrink: 0 }}>
          <ReusableDonutChart
            data={donutData}
            height={130}
            centerValue={`${percent}%`}
            centerTitle="Paid"
          />
        </Box>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'grey.400' }} />
            <Typography variant="caption" color="text.secondary">
              Total Due
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto' }}>
              {money(due)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#16A34A' }} />
            <Typography variant="caption" color="text.secondary">
              Total Paid
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto' }}>
              {money(paid)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#DC2626' }} />
            <Typography variant="caption" color="text.secondary">
              Outstanding
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto' }}>
              {money(balance)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

const PaymentHistory = () => {
  const { user, roles } = useAuth();
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Deep-linked from Class Ledger's "View Payment History" action — land
  // directly on that student, no lookup widget needed since we already
  // know who we're here for.
  const [searchParams] = useSearchParams();
  const deepLinkedUserId = decodeLinkParams(searchParams.get('t')).user_id || '';

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
  const [wards, setWards] = useState([]);
  const [guardian, setGuardian] = useState(null);
  const [viewMode, setViewMode] = useState('myself'); // 'myself' | 'ward'
  const [selectedWardId, setSelectedWardId] = useState('');

  const [selectedUserId, setSelectedUserId] = useState(
    deepLinkedUserId || (isBursaryStaff || isParent ? '' : selfId),
  );

  // Staff land on a populated page rather than an empty "pick someone"
  // state — the first programme/class/student cascade auto-selects, same
  // defaulting pattern as Class Ledger/Set Schedule. Skipped when deep-linked
  // to a specific student — that selection must not be overwritten.
  useEffect(() => {
    if (!isBursaryStaff || deepLinkedUserId) return;
    (async () => {
      try {
        const res = await fetchProgrammes();
        const progList = res.data.map((p) => ({ value: p.id, label: p.programme_name }));
        setProgrammes(progList);

        if (progList.length === 0) return;
        const firstProgrammeId = progList[0].value;
        setProgrammeId(firstProgrammeId);

        const classesRes = await fetchClassAndArmsByProgramme(firstProgrammeId);
        const classList = classesRes.data.map((c) => ({
          value: c.class_arm_id,
          label: `${c.class_code} (${c.class_arm_names})`,
        }));
        setClasses(classList);

        if (classList.length === 0) return;
        const firstClassArmId = classList[0].value;
        setClassArmId(firstClassArmId);

        setLoadingStudents(true);
        const studentsRes = await fetchPaymentHistoryClassStudents(firstClassArmId);
        const studentList = studentsRes.data || [];
        setStudents(studentList);

        if (studentList.length > 0) {
          setSelectedUserId(studentList[0].user_id);
        }
      } catch (error) {
        console.error('Failed to load programmes', error);
      } finally {
        setLoadingStudents(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBursaryStaff]);

  useEffect(() => {
    if (!isParent) return;
    (async () => {
      try {
        const res = await fetchMyWards();
        const loadedWards = res.data?.wards || [];
        setWards(loadedWards);
        setGuardian(res.data?.guardian || null);
        if (loadedWards.length > 0) {
          setSelectedWardId(loadedWards[0].id);
          setViewMode('ward');
        }
      } catch (error) {
        console.error('Failed to load wards', error);
        notify.error('Failed to load your wards');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParent]);

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
  const [payOption, setPayOption] = useState(''); // '' | 'compulsory' | 'optional' — the new tabs
  const [status, setStatus] = useState('');
  const [paymentNameId, setPaymentNameId] = useState('');
  const [paymentNameOptions, setPaymentNameOptions] = useState([]);

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
          ...res.data.map((st) => ({
            id: st.id,
            label: st.term?.term_name || st.term_name || '—',
          })),
        ]);
      } catch (error) {
        console.error('Failed to load terms', error);
      }
    })();
  }, [selectedSessionId]);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!isParent && !selectedUserId) return;
    setPayType('');
    setPayOption('');
    setStatus('');
    setPaymentNameId('');
    setPaymentNameOptions([]);
    setPage(0);

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

  const effectiveSessionTermId = selectedTermId !== 'all' ? selectedTermId : undefined;
  const effectiveSessionId =
    selectedTermId === 'all' && selectedSessionId !== 'all' ? selectedSessionId : undefined;

  const showingMyself = isParent && viewMode === 'myself';

  // Student-info header card — independent of the transactions list, so it
  // loads (and can fail) without blocking the table.
  useEffect(() => {
    if (showingMyself || !selectedUserId) {
      setStudentInfo(null);
      return;
    }
    setLoadingStudentInfo(true);
    (async () => {
      try {
        const res = await fetchPaymentHistoryStudentInfo({
          user_id: selectedUserId,
          session_term_id: effectiveSessionTermId,
        });
        setStudentInfo(res?.status ? res.data : null);
      } catch (error) {
        console.error('Failed to load student info', error);
        setStudentInfo(null);
      } finally {
        setLoadingStudentInfo(false);
      }
    })();
  }, [showingMyself, selectedUserId, effectiveSessionTermId]);

  const loadData = useCallback(async () => {
    if (!showingMyself && !selectedUserId) return;
    setLoading(true);
    try {
      if (showingMyself) {
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
            pay_option: payOption || undefined,
            status: status || undefined,
            payment_name_id: paymentNameId || undefined,
            page: page + 1,
            per_page: rowsPerPage,
          }),
        ]);
        setSummary(summaryRes.data || EMPTY_SUMMARY);
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
  }, [
    showingMyself,
    selectedUserId,
    effectiveSessionId,
    effectiveSessionTermId,
    payType,
    payOption,
    status,
    paymentNameId,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [expandedDescriptions, setExpandedDescriptions] = useState(() => new Set());
  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

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
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: res.transaction_status } : r)),
      );
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
    const token = encodeLinkParams({
      bulk_order_id: row.bulk_order_id,
      user_id: row.user_id || selectedUserId,
      session_term_id: row.session_term_id,
    });
    window.open(
      `/bursary/transactions/print_receipt?t=${token}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  // Export/Print both need the full filtered list, not just the current
  // page — a single shared fetch (generous per_page) keeps the two
  // features, and the on-screen table, from ever disagreeing about which
  // rows matched the active filters.
  const fetchAllFilteredTransactions = async () => {
    const res = await fetchPaymentHistoryTransactions({
      user_id: selectedUserId,
      session_id: effectiveSessionId,
      session_term_id: effectiveSessionTermId,
      pay_type: payType || undefined,
      pay_option: payOption || undefined,
      status: status || undefined,
      payment_name_id: paymentNameId || undefined,
      page: 1,
      per_page: 100,
    });
    return res.data || [];
  };

  const handleExportCsv = async () => {
    if (!selectedUserId) return;
    setExporting(true);
    try {
      const allRows = await fetchAllFilteredTransactions();
      const header = [
        'Date & Time',
        'Transaction ID',
        'Payment Name',
        'Description',
        'Type',
        'Amount',
        'Status',
        'Channel',
        'Wallet/Bank',
        'Paid By',
      ];
      const csvRows = [
        header,
        ...allRows.map((r) => [
          r.trans_date,
          r.order_id,
          r.payment_name,
          r.description,
          r.pay_option,
          r.amount_paid,
          r.status,
          CHANNEL_LABEL[r.payment_type] || r.payment_type,
          r.wallet_account_no
            ? `${r.wallet_account_no}${r.bank_name ? ` (${r.bank_name})` : ''}`
            : '',
          r.paid_by_name,
        ]),
      ];
      const csvContent = csvRows
        .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `payment_history_${studentInfo?.admission_no || selectedUserId}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV', error);
      notify.error('Failed to export payment history');
    } finally {
      setExporting(false);
    }
  };

  const handlePrintStatement = async () => {
    if (!selectedUserId) return;
    setPrinting(true);
    try {
      const allRows = await fetchAllFilteredTransactions();
      const rowsHtml = allRows
        .map(
          (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.trans_date || ''}</td>
            <td>${r.payment_name || ''}</td>
            <td>${r.pay_option || ''}</td>
            <td>${money(r.amount_paid)}</td>
            <td>${r.status || ''}</td>
            <td>${CHANNEL_LABEL[r.payment_type] || r.payment_type || ''}</td>
          </tr>`,
        )
        .join('');

      const html = `
        <html>
          <head>
            <title>Payment Statement - ${studentInfo?.full_name || ''}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
              h2 { margin-bottom: 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: left; }
              th { background: #f1f5f9; }
              .meta { margin-top: 8px; color: #555; font-size: 13px; }
            </style>
          </head>
          <body>
            <h2>${studentInfo?.full_name || 'Payment Statement'}</h2>
            <div class="meta">
              Admission No: ${studentInfo?.admission_no || '—'} | Class: ${studentInfo?.class_label || '—'}<br/>
              Session: ${studentInfo?.session?.name || '—'} | Term: ${studentInfo?.term?.name || '—'}<br/>
              Total Due: ${money(summary.total.due)} | Total Paid: ${money(summary.total.paid)} | Outstanding: ${money(summary.total.balance)}
            </div>
            <table>
              <thead>
                <tr><th>#</th><th>Date</th><th>Payment Name</th><th>Type</th><th>Amount</th><th>Status</th><th>Channel</th></tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </body>
        </html>`;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        notify.warning('Please allow pop-ups to print the statement');
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    } catch (error) {
      console.error('Failed to print statement', error);
      notify.error('Failed to prepare the statement');
    } finally {
      setPrinting(false);
    }
  };

  const tabValue = payOption || 'all';

  return (
    <PageContainer
      title="Payment History"
      description="Track individual bursary payment transactions"
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Breadcrumb
            title="Payment History"
            subtitle="Track individual student transactions made through Post Cash, Bank Teller, and Online."
            items={BCrumb}
          />
        </Box>
      </Box>

      {isParent && <WalletCard wallet={guardian?.wallet} guardianName={guardian?.name || 'You'} />}

      {isParent && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant={viewMode === 'myself' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('myself')}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
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
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
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
                    placeholder="Search student by name or admission number..."
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {searchLoading ? <CircularProgress size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Session"
                value={selectedSessionId}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  setSelectedTermId('all');
                  setPage(0);
                }}
              >
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Term"
                value={selectedTermId}
                disabled={selectedSessionId === 'all'}
                onChange={(e) => {
                  setSelectedTermId(e.target.value);
                  setPage(0);
                }}
              >
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={loadData}
                sx={{ height: 40 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Or narrow down by Programme → Class → Student:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }} alignItems="center">
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
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
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
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
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
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setSelectedStudentOption(null);
                }}
              >
                {students.map((s) => (
                  <MenuItem key={s.user_id} value={s.user_id}>
                    {`${s.fname || ''} ${s.lname || ''}`.trim()}{' '}
                    {s.admission_no ? `(${s.admission_no})` : ''}
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
            <StudentInfoCard info={studentInfo} loading={loadingStudentInfo} isDark={isDark} />
          )}

          {!showingMyself && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  icon={DescriptionOutlinedIcon}
                  iconBg={isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE'}
                  iconColor="#2563EB"
                  label="Compulsory Fees"
                  data={summary.compulsory}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  icon={PaymentsOutlinedIcon}
                  iconBg={isDark ? 'rgba(147,51,234,0.18)' : '#F3E8FF'}
                  iconColor="#9333EA"
                  label="Optional Fees"
                  data={summary.optional}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  icon={SavingsOutlinedIcon}
                  iconBg={isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7'}
                  iconColor="#16A34A"
                  label="Total Fees"
                  data={summary.total}
                />
              </Grid>
            </Grid>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8.5 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  {!isBursaryStaff && (
                    <>
                      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Session"
                          value={selectedSessionId}
                          onChange={(e) => {
                            setSelectedSessionId(e.target.value);
                            setSelectedTermId('all');
                            setPage(0);
                          }}
                        >
                          {sessions.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.label}
                            </MenuItem>
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
                          onChange={(e) => {
                            setSelectedTermId(e.target.value);
                            setPage(0);
                          }}
                        >
                          {terms.map((t) => (
                            <MenuItem key={t.id} value={t.id}>
                              {t.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </>
                  )}
                  {!showingMyself && (
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Payment Name"
                        value={paymentNameId}
                        onChange={(e) => {
                          setPaymentNameId(e.target.value);
                          setPage(0);
                        }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {paymentNameOptions.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
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
                      onChange={(e) => {
                        setPayType(e.target.value);
                        setPage(0);
                      }}
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
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(0);
                      }}
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
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    px: 1,
                    pt: 1,
                  }}
                >
                  {!showingMyself ? (
                    <Tabs
                      value={tabValue}
                      onChange={(e, v) => {
                        setPayOption(v === 'all' ? '' : v);
                        setPage(0);
                      }}
                      sx={{ minHeight: 40 }}
                    >
                      <Tab
                        value="all"
                        sx={{ minHeight: 40, textTransform: 'none', fontWeight: 700 }}
                        label={`All Transactions (${summary.counts?.all ?? 0})`}
                      />
                      <Tab
                        value="compulsory"
                        sx={{ minHeight: 40, textTransform: 'none', fontWeight: 700 }}
                        label={`Compulsory Fees (${summary.counts?.compulsory ?? 0})`}
                      />
                      <Tab
                        value="optional"
                        sx={{ minHeight: 40, textTransform: 'none', fontWeight: 700 }}
                        label={`Optional Fees (${summary.counts?.optional ?? 0})`}
                      />
                    </Tabs>
                  ) : (
                    <Typography variant="subtitle2" sx={{ py: 1.5, px: 1 }} fontWeight={700}>
                      Payment Transactions ({total})
                    </Typography>
                  )}

                  {!showingMyself && (
                    <Stack direction="row" spacing={1} sx={{ pb: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          exporting ? <CircularProgress size={14} /> : <FileDownloadOutlinedIcon />
                        }
                        onClick={handleExportCsv}
                        disabled={exporting}
                      >
                        Export
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          printing ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <PrintOutlinedIcon />
                          )
                        }
                        onClick={handlePrintStatement}
                        disabled={printing}
                      >
                        Print Statement
                      </Button>
                    </Stack>
                  )}
                </Box>
                <Divider />
                <TableContainer sx={{ maxHeight: 560, overflow: 'auto' }}>
                  <Table
                    stickyHeader
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': { fontSize: '12px', py: 0.75, px: 1 },
                      '& .MuiTableCell-head': {
                        fontSize: '11.5px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Payment Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Channel</TableCell>
                        <TableCell>Wallet / Bank</TableCell>
                        <TableCell>{showingMyself ? 'Paid For' : 'Paid By'}</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 12 }).map((__, j) => (
                              <TableCell key={j}>
                                <Skeleton variant="text" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12}>
                            <Alert severity="info" sx={{ my: 1 }}>
                              No transactions found.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row, index) => {
                          const ChannelIcon = CHANNEL_ICON[row.payment_type];

                          return (
                            <TableRow key={row.id} hover>
                              <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                              <TableCell>{row.trans_date}</TableCell>
                              <TableCell
                                sx={{ maxWidth: 180, whiteSpace: 'normal', wordBreak: 'break-all' }}
                              >
                                {row.order_id || '—'}
                              </TableCell>
                              <TableCell>{row.payment_name}</TableCell>
                              <TableCell sx={{ maxWidth: 220 }}>
                                {row.description
                                  ? (() => {
                                      const isLong = row.description.length > 45;
                                      const isExpanded = expandedDescriptions.has(row.id);

                                      return (
                                        <Box>
                                          <Typography
                                            component="span"
                                            sx={{
                                              fontSize: 'inherit',
                                              display:
                                                isExpanded || !isLong ? 'block' : '-webkit-box',
                                              WebkitLineClamp: isExpanded || !isLong ? 'unset' : 1,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden',
                                            }}
                                          >
                                            {row.description}
                                          </Typography>
                                          {isLong && (
                                            <Box
                                              component="span"
                                              onClick={() => toggleDescription(row.id)}
                                              sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                color: 'primary.main',
                                                fontWeight: 700,
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                mt: 0.25,
                                              }}
                                            >
                                              {isExpanded ? 'View less' : 'View more'}
                                              {isExpanded ? (
                                                <ExpandLessIcon sx={{ fontSize: 14 }} />
                                              ) : (
                                                <ExpandMoreIcon sx={{ fontSize: 14 }} />
                                              )}
                                            </Box>
                                          )}
                                        </Box>
                                      );
                                    })()
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                {row.pay_option && (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    color={
                                      row.pay_option === 'COMPULSORY' ? 'primary' : 'secondary'
                                    }
                                    label={
                                      row.pay_option === 'COMPULSORY' ? 'Compulsory' : 'Optional'
                                    }
                                  />
                                )}
                              </TableCell>
                              <TableCell>{money(row.amount_paid)}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={row.status}
                                  color={STATUS_COLOR[row.status] || 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  {ChannelIcon && (
                                    <ChannelIcon
                                      sx={{
                                        fontSize: 15,
                                        color: CHANNEL_COLOR[row.payment_type] || 'text.secondary',
                                      }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: 'inherit',
                                      fontWeight: 700,
                                      color: CHANNEL_COLOR[row.payment_type] || 'text.primary',
                                    }}
                                  >
                                    {CHANNEL_LABEL[row.payment_type] || row.payment_type}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                {row.wallet_account_no
                                  ? `${row.wallet_account_no}${row.bank_name ? ` (${row.bank_name})` : ''}`
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                {(showingMyself ? row.paid_for_name : row.paid_by_name)?.trim() ||
                                  '—'}
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
                          );
                        })
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
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[15, 30, 50, 100]}
                />
              </Paper>
            </Grid>

            {!showingMyself && (
              <Grid size={{ xs: 12, md: 3.5 }}>
                <PaymentTimeline row={rows[0]} />
                <TermPaymentSummary total={summary.total} />
              </Grid>
            )}
          </Grid>
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
