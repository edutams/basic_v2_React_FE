import React, { useState, useMemo, useEffect, useContext } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  TableFooter,
  TablePagination,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Avatar,
  Stack,
  Chip,
  Grid,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { TenantAuthContext } from '@/context/TenantContext/auth';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  PrintOutlined as PrintOutlinedIcon,
} from '@mui/icons-material';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StatCard from './components/StatCard';
import FeeChart from './components/FeeChart';
import { IconDotsVertical, IconEye, IconEdit } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import {
  fetchActiveSessionTerm,
  fetchClassAndArmsByProgramme,
  fetchProgrammes,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { VisibilityOutlined as VisibilityOutlinedIcon } from '@mui/icons-material';
import {
  fetchClassLedgerAnalytics,
  fetchDrilldownStudents,
  generateClassLedgerExcel,
  getClassStudentsPaymentStatus,
  printClassLedgerPaymentList,
} from '@/api/tenant/bursary/classLedger';
import useNotification from '@/hooks/useNotification';
import StudentLedgerModal from './StudentLedgerModal';
import LearnerWalletTransactionsModal from './LearnerWalletTransactionsModal';
import StudentCategoryPlacementTab from './components/StudentCategoryPlacementTab';
import ReassignPaymentModal from './components/ReassignPaymentModal';
import { fetchSessions, fetchTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary' }, { title: 'class ledger' }];

const ClassLedger = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { impersonateStudent } = useContext(TenantAuthContext);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState('bar');

  const [isCompulsory, setIsCompulsory] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [isPayable, setIsPayable] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedStudentForLedger, setSelectedStudentForLedger] = useState(null);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedUserIdForWallet, setSelectedUserIdForWallet] = useState(null);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState(null);

  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);

  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');

  // Viewing a previous session/term's class ledger — empty means "use the
  // school's current active term", same default as before this existed.
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');

  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [ledgerData, setLedgerData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [meta, setMeta] = useState(null);
  const [bursarySessionTermId, setBursarySessionTermId] = useState(null);

  const notify = useNotification();

  const [mainTab, setMainTab] = useState(0);

  const handleFilterChange = React.useCallback(async (key, val) => {
    if (key === 'programme') {
      try {
        const classesRes = await fetchClassAndArmsByProgramme(val);
        setClasses(
          classesRes.data.map((c) => ({
            value: c.class_arm_id,
            label: c.class_code,
            class_arm_names: c.class_arm_names,
            class_id: c.class_id,
          })),
        );
        setClassLevel(''); // reset class when programme changes
      } catch (error) {
        console.error('Failed to fetch classes', error);
      }
    }
  }, []);

  const handleFetchDrilldown = async (type) => {
    const payload = {
      filters: {
        programme_id: programme,
        class_arm_id: classLevel,
        type,
      },
    };
    const res = await fetchDrilldownStudents(payload);
    return res?.data || [];
  };

  // find the selected class label for display
  const selectedClassName = useMemo(() => {
    const cls = classes.find((c) => c.value === classLevel);
    return cls ? `${cls.label} ${cls.class_arm_names}` : '';
  }, [classes, classLevel]);

  const handleDownloadExcel = async () => {
    if (!programme || !classLevel) {
      notify.warning('Please select Programme and Class');
      return;
    }

    try {
      notify.info('Generating Excel...');
      const payload = {
        filters: {
          programme_id: programme,
          class_arm_id: classLevel,
        },
      };

      const blob = await generateClassLedgerExcel(payload);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment_list.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      notify.error('Failed to generate Excel');
    }
  };

  const handlePrintPaymentList = async () => {
    if (!programme || !classLevel) {
      notify.warning('Please select Programme and Class');
      return;
    }

    try {
      notify.info('Preparing print view...');
      const payload = {
        filters: {
          programme_id: programme,
          class_arm_id: classLevel,
        },
      };

      const { students, class_name, sess_term, school_name } =
        await printClassLedgerPaymentList(payload);

      const rows = students
        .map(
          (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${[s.fname, s.lname, s.mname].filter(Boolean).join(' ')}</td>
        <td>${Number(s.total_compulsory).toLocaleString()}</td>
        <td>${Number(s.total_optional).toLocaleString()}</td>
        <td>${Number(s.total_payable).toLocaleString()}</td>
        <td>${Number(s.total_paid).toLocaleString()}</td>
        <td class="${s.total_balance > 0 ? 'owing' : 'cleared'}">
          ${Number(s.total_balance).toLocaleString()}
        </td>
      </tr>
    `,
        )
        .join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payment List - ${class_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 24px; }
    h2, h3, p { text-align: center; margin-bottom: 4px; }
    h2 { font-size: 16px; text-transform: uppercase; }
    h3 { font-size: 14px; }
    p  { font-size: 12px; color: #444; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #1a1a2e; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .owing   { font-weight: 600; color: #dc2626; }
    .cleared { font-weight: 600; color: #16a34a; }
    .footer  { margin-top: 24px; font-size: 11px; color: #888; text-align: center; }
    @media print {
      body { padding: 8px; }
      .no-print { display: none !important; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <h2>Payment List</h2>
  <h2>${school_name}</h2>
  <h3>Class: ${class_name}</h3>
  <p>Session Term: ${sess_term}</p>

  <div class="no-print" style="text-align:right; margin-bottom:12px;">
    <button onclick="window.print()"
      style="padding:8px 18px; background:#1a1a2e; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px;">
      🖨️ Print
    </button>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Student Name</th>
        <th>Compulsory Bill (₦)</th>
        <th>Optional Bill (₦)</th>
        <th>Total Payable (₦)</th>
        <th>Total Paid (₦)</th>
        <th>Balance (₦)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

      const printWindow = window.open('', '_blank');
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error(error);
      notify.error('Failed to load print view');
    }
  };

  const loadProgrammes = async () => {
    try {
      const res = await fetchProgrammes();
      setProgrammes(
        res.data.map((p) => ({
          value: p.id,
          label: p.programme_name,
        })),
      );
    } catch (error) {
      console.error('Failed to load programmes');
    }
  };

  const fetchInFlightRef = React.useRef(false);

  const fetchClassLedgerData = async (overrides = {}) => {
    if (!programme || !classLevel) {
      notify.warning('Please select Programme and Class');
      return;
    }

    fetchInFlightRef.current = true;
    setLoadingTable(true);
    setLoadingAnalytics(true);

    try {
      const payload = {
        filters: {
          programme_id: programme,
          class_arm_id: classLevel,
          payment_status: paymentStatusFilter,
          search: search,
          ...overrides,
          session_id: sessionId || null,
          term_id: termId || null,
          page: page + 1,
          per_page: rowsPerPage,
        },
      };

      // Fetch Analytics for Stat Cards
      const analyticsRes = await fetchClassLedgerAnalytics(payload);
      setAnalyticsData(analyticsRes);

      // Fetch Table Data
      const tableRes = await getClassStudentsPaymentStatus(payload);
      setLedgerData(tableRes.students?.data || []);
      setMeta(tableRes.students);
      setBursarySessionTermId(tableRes.bursary_session_term_id ?? null);
    } catch (error) {
      console.error(error);
      notify.error('Failed to load class ledger data');
    } finally {
      setLoadingTable(false);
      setLoadingAnalytics(false);
      fetchInFlightRef.current = false;
    }
  };

  const fetchAnalyticsOnly = async () => {
    if (!programme || !classLevel) return;
    if (fetchInFlightRef.current) return;

    setLoadingAnalytics(true);
    try {
      const payload = {
        filters: {
          progId: programme,
          class_arm_id: classLevel,
          payment_status: paymentStatusFilter || null,
          search: search,
          session_id: sessionId || null,
          term_id: termId || null,
        },
      };

      const analyticsRes = await fetchClassLedgerAnalytics(payload);
      setAnalyticsData(analyticsRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Auto-select first Programme
  useEffect(() => {
    if (programmes.length > 0 && !programme) {
      const firstProg = programmes[0].value;
      setProgramme(firstProg);
      // handleFilterChange('programme', firstProg);

      // Fetch classes for first programme, then auto-select first class
      fetchClassAndArmsByProgramme(firstProg)
        .then((classesRes) => {
          const mapped = classesRes.data.map((c) => ({
            value: c.class_arm_id,
            label: c.class_code,
            class_arm_names: c.class_arm_names,
          }));
          setClasses(mapped);
          if (mapped.length > 0) {
            setClassLevel(mapped[0].value); // ← auto-select first class
          }
        })
        .catch((err) => console.error('Failed to fetch classes', err));
    }
  }, [programmes]);

  // Auto-load Analytics when Programme or Class changes
  useEffect(() => {
    if (programme && classLevel) {
      fetchAnalyticsOnly();
    }
  }, [programme, classLevel, paymentStatusFilter]);

  useEffect(() => {
    if (programme && classLevel && ledgerData.length > 0) {
      fetchClassLedgerData();
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadProgrammes();
    fetchSessions()
      .then((res) => setSessions(res.data || res || []))
      .catch((err) => console.error('Failed to fetch sessions', err));
    // Terms aren't session-scoped (a fixed list — First/Second/Third
    // Term), so this loads once, not per session.
    fetchTerms()
      .then((res) => setTerms(res.data || res || []))
      .catch((err) => console.error('Failed to fetch terms', err));
    // Pre-select the school's real current session + term, so the
    // filters always show a concrete value instead of a vague "Current"
    // placeholder — picking a different one is still just as available.
    fetchActiveSessionTerm()
      .then((res) => {
        if (res?.data?.session_id) setSessionId(res.data.session_id);
        if (res?.data?.term_id) setTermId(res.data.term_id);
      })
      .catch((err) => console.error('Failed to fetch active session term', err));
  }, []);

  const buildChartOptions = (categories) => ({
    chart: {
      type: chartType,
      stacked: false,
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

    legend: {
      position: 'top', // 👈 key change
      horizontalAlign: 'center',
      fontSize: '13px',
      labels: {
        colors: isDark ? '#aaa' : '#64748B',
      },
    },

    plotOptions: {
      bar: { borderRadius: 3, columnWidth: '55%' },
    },

    dataLabels: { enabled: false },

    colors: ['#6366F1', '#22C55E', '#EF4444'],

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
        formatter: (val) =>
          val >= 1000000
            ? (val / 1000000).toFixed(1) + 'M'
            : val >= 1000
              ? (val / 1000).toFixed(0) + 'K'
              : val,
      },
    },

    grid: {
      borderColor: isDark ? '#333' : '#f1f1f1',
      strokeDashArray: 4,
    },

    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val) => `₦${val.toLocaleString()}`,
      },
    },
  });

  /* Shared compact cell styles — same pattern used across the invoice pages */
  const thCell = {
    fontWeight: 600,
    color: isDark ? '#94a3b8' : '#475569',
    py: 0.75,
    px: 1.5,
  };
  const tdCell = { py: 0.5, px: 1.5 };

  return (
    <PageContainer title="Class Ledger">
      <Breadcrumb title="Class Ledger" items={BCrumb} />

      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={mainTab}
          onChange={(e, val) => setMainTab(val)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
        >
          <Tab label="Class Ledger" />
          <Tab label="Student Category Placement" />
        </Tabs>
      </Box>

      {mainTab === 1 && <StudentCategoryPlacementTab />}

      {mainTab === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                icon={DescriptionOutlinedIcon}
                iconBg={isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE'}
                iconColor="#2563EB"
                label="Compulsory Invoiced"
                studentCount={`${analyticsData?.students_with_compulsory ?? 0} students`}
                value={`₦${(analyticsData?.total_comp_schedule || 0).toLocaleString()}`}
                loading={loadingAnalytics}
                progressCaption={`Total Paid: ₦${(analyticsData?.total_comp_transaction || 0).toLocaleString()} (${
                  analyticsData?.total_comp_schedule
                    ? Math.round(
                        ((analyticsData.total_comp_transaction || 0) /
                          analyticsData.total_comp_schedule) *
                          100,
                      )
                    : 0
                }%)`}
                progressPercent={
                  analyticsData?.total_comp_schedule
                    ? ((analyticsData.total_comp_transaction || 0) /
                        analyticsData.total_comp_schedule) *
                      100
                    : 0
                }
                progressColor="success"
                onIconClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Compulsory Fees');
                  setChartType('bar');
                  setIsCompulsory(true);
                }}
                onClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Compulsory Fees');
                  setChartType('bar');
                  setIsCompulsory(true);
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                icon={PaymentsOutlinedIcon}
                iconBg={isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7'}
                iconColor="#16A34A"
                label="Optional Invoiced"
                studentCount={`${analyticsData?.students_with_optional ?? 0} students`}
                value={`₦${(analyticsData?.total_opt_schedule || 0).toLocaleString()}`}
                loading={loadingAnalytics}
                progressCaption={`Total Paid: ₦${(analyticsData?.total_opt_transaction || 0).toLocaleString()} (${
                  analyticsData?.total_opt_schedule
                    ? Math.round(
                        ((analyticsData.total_opt_transaction || 0) /
                          analyticsData.total_opt_schedule) *
                          100,
                      )
                    : 0
                }%)`}
                progressPercent={
                  analyticsData?.total_opt_schedule
                    ? ((analyticsData.total_opt_transaction || 0) /
                        analyticsData.total_opt_schedule) *
                      100
                    : 0
                }
                progressColor="success"
                onIconClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Optional Fees');
                  setChartType('bar');
                  setIsOptional(true);
                }}
                onClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Optional Fees');
                  setChartType('bar');
                  setIsOptional(true);
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                icon={CreditCardOutlinedIcon}
                iconBg={isDark ? 'rgba(147,51,234,0.18)' : '#F3E8FF'}
                iconColor="#9333EA"
                label="Total Collected"
                studentCount={`${analyticsData?.students_with_payment ?? 0} students`}
                value={`₦${(analyticsData?.total_transaction || 0).toLocaleString()}`}
                loading={loadingAnalytics}
                progressCaption={(() => {
                  const totalInvoice =
                    (analyticsData?.total_comp_schedule || 0) +
                    (analyticsData?.total_opt_schedule || 0);
                  const pct = totalInvoice
                    ? Math.round(((analyticsData?.total_transaction || 0) / totalInvoice) * 100)
                    : 0;
                  return `${pct}% of Total Invoice`;
                })()}
                progressPercent={(() => {
                  const totalInvoice =
                    (analyticsData?.total_comp_schedule || 0) +
                    (analyticsData?.total_opt_schedule || 0);
                  return totalInvoice
                    ? ((analyticsData?.total_transaction || 0) / totalInvoice) * 100
                    : 0;
                })()}
                progressColor="success"
                onIconClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Total Collected');
                  setChartType('bar');
                  setIsPayable(true);
                }}
                onClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Total Collected');
                  setChartType('bar');
                  setIsPayable(true);
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                icon={PendingActionsOutlinedIcon}
                iconBg={isDark ? 'rgba(217,119,6,0.18)' : '#FFEDD5'}
                iconColor="#D97706"
                label="Outstanding Balance"
                studentCount={`${analyticsData?.students_with_outstanding ?? 0} students`}
                value={`₦${(analyticsData?.total_balance || 0).toLocaleString()}`}
                loading={loadingAnalytics}
                progressCaption={(() => {
                  const totalInvoice =
                    (analyticsData?.total_comp_schedule || 0) +
                    (analyticsData?.total_opt_schedule || 0);
                  const pct = totalInvoice
                    ? Math.round(((analyticsData?.total_balance || 0) / totalInvoice) * 100)
                    : 0;
                  return `${pct}% of Total Invoice`;
                })()}
                progressPercent={(() => {
                  const totalInvoice =
                    (analyticsData?.total_comp_schedule || 0) +
                    (analyticsData?.total_opt_schedule || 0);
                  return totalInvoice
                    ? ((analyticsData?.total_balance || 0) / totalInvoice) * 100
                    : 0;
                })()}
                progressColor="error"
                onIconClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Outstanding Balance');
                  setChartType('bar');
                  setIsPayable(true);
                }}
                onClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Outstanding Balance');
                  setChartType('bar');
                  setIsPayable(true);
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                icon={GroupsOutlinedIcon}
                iconBg={isDark ? 'rgba(220,38,38,0.18)' : '#FEE2E2'}
                iconColor="#DC2626"
                label="Students with Outstanding Balance"
                studentCount={`${analyticsData?.total_students ?? 0} students`}
                value={`${analyticsData?.students_with_outstanding ?? 0} / ${analyticsData?.total_students ?? 0}`}
                loading={loadingAnalytics}
                progressCaption={`${
                  analyticsData?.total_students
                    ? Math.round(
                        ((analyticsData.students_with_outstanding || 0) /
                          analyticsData.total_students) *
                          100,
                      )
                    : 0
                }% of class`}
                progressPercent={
                  analyticsData?.total_students
                    ? ((analyticsData.students_with_outstanding || 0) /
                        analyticsData.total_students) *
                      100
                    : 0
                }
                progressColor="error"
                onIconClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Students with Outstanding Balance');
                  setChartType('bar');
                  setIsPayable(true);
                }}
                onClick={() => {
                  setIsFeeModalOpen(true);
                  setChartTitle('Students with Outstanding Balance');
                  setChartType('bar');
                  setIsPayable(true);
                }}
              />
            </Grid>
          </Grid>
          <ParentCard
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            <Grid container spacing={3} sx={{ mb: 2, mt: 0 }} alignItems="center">
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Programme"
                  size="small"
                  value={programme}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProgramme(val);
                    handleFilterChange('programme', val);
                  }}
                >
                  {programmes.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.4 }}>
                <TextField
                  select
                  fullWidth
                  label="Class"
                  size="small"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                >
                  {classes.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label} ({c.class_arm_names})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.4 }}>
                <TextField
                  select
                  fullWidth
                  label="Session"
                  size="small"
                  value={sessionId}
                  onChange={(e) => {
                    setSessionId(e.target.value);
                    setTermId('');
                  }}
                >
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.5 }}>
                <TextField
                  select
                  fullWidth
                  label="Term"
                  size="small"
                  value={termId}
                  onChange={(e) => setTermId(e.target.value)}
                >
                  {terms.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.term_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.7 }}>
                <TextField
                  select
                  fullWidth
                  label="Payment Status"
                  size="small"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Students</MenuItem>
                  <MenuItem value="cleared">Payment List (Cleared)</MenuItem>
                  <MenuItem value="owing">Debtor's List (Owing)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 3.5 }}>
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

              <Grid size={{ xs: 12, md: 2 }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => fetchClassLedgerData()}
                    disabled={!programme || !classLevel}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<RefreshIcon fontSize="small" />}
                    onClick={() => {
                      setSearch('');
                      setPaymentStatusFilter('');
                      fetchClassLedgerData();
                    }}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Grid>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadExcel}
                  sx={{
                    bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                    color: '#2563EB',
                  }}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintOutlinedIcon />}
                  onClick={handlePrintPaymentList}
                  sx={{
                    bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                    color: '#2563EB',
                  }}
                >
                  Print Payment List
                </Button>
              </Box>
            </Grid>

            {Number(analyticsData?.students_with_outstanding || 0) > 0 && (
              <Alert
                severity="warning"
                icon={<WarningAmberOutlinedIcon fontSize="inherit" />}
                sx={{
                  mb: 2,
                  alignItems: 'center',
                  bgcolor: isDark ? 'rgba(217,119,6,0.12)' : '#FFFBEB',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(217,119,6,0.3)' : '#FDE68A',
                  color: isDark ? '#FBBF24' : '#C2410C',
                }}
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => {
                      setPaymentStatusFilter('owing');
                      fetchClassLedgerData({ payment_status: 'owing' });
                    }}
                  >
                    View outstanding
                  </Button>
                }
              >
                {analyticsData.students_with_outstanding} of {analyticsData.total_students} students
                in this class have an outstanding balance.
              </Alert>
            )}

            <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={thCell}>S/N</TableCell>
                    <TableCell sx={thCell}>Student Name</TableCell>
                    <TableCell sx={thCell}>Pay Category</TableCell>
                    <TableCell sx={thCell}>Compulsory Bill (₦)</TableCell>
                    <TableCell sx={thCell}>Optional Bill (₦)</TableCell>
                    <TableCell sx={thCell}>Total Payable (₦)</TableCell>
                    <TableCell sx={thCell}>Total Paid (₦)</TableCell>
                    <TableCell sx={thCell}>Penalty (₦)</TableCell>
                    <TableCell sx={thCell}>Discount (₦)</TableCell>
                    <TableCell sx={thCell}>Oustanding Balance (₦)</TableCell>
                    <TableCell sx={thCell}>Payment Progress</TableCell>
                    <TableCell sx={thCell}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingTable ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Skeleton variant="circular" width={36} height={36} />
                            <Skeleton variant="text" width={140} height={20} />
                          </Box>
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={100} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={90} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={90} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={90} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={90} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={60} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={60} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={90} height={20} />
                        </TableCell>
                        <TableCell sx={tdCell}>
                          <Skeleton variant="text" width={110} height={20} />
                        </TableCell>
                        <TableCell align="center" sx={tdCell}>
                          <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : ledgerData.length > 0 ? (
                    ledgerData.map((student, index) => {
                      return (
                        <TableRow key={student.user_id || index} hover>
                          {/* <TableCell>{index + 1}</TableCell> */}
                          <TableCell sx={tdCell}>{(meta?.from || 0) + index}</TableCell>
                          <TableCell sx={tdCell}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={student.avatar} sx={{ width: 36, height: 36 }}>
                                <PersonOutlineIcon sx={{ fontSize: 20 }} />
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {student.full_name}
                                  </Typography>
                                  {student.has_stuck_payment && (
                                    <Tooltip
                                      title={`₦${Number(student.stuck_payment_total || 0).toLocaleString()} in unapplied payments — see "Reassign a Payment"`}
                                    >
                                      <WarningAmberOutlinedIcon
                                        sx={{ fontSize: 16, color: 'warning.main' }}
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {student.student_number || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={tdCell}>
                            {student.bursary_payment_category_name
                              ? (() => {
                                  const name = student.bursary_payment_category_name;
                                  const isNew = /new/i.test(name);
                                  const isReturning = /returning/i.test(name);
                                  return (
                                    <Chip
                                      label={name}
                                      size="small"
                                      sx={
                                        isNew
                                          ? {
                                              bgcolor: '#DBEAFE',
                                              color: '#2563EB',
                                              fontWeight: 600,
                                            }
                                          : isReturning
                                            ? {
                                                bgcolor: '#F3E8FF',
                                                color: '#9333EA',
                                                fontWeight: 600,
                                              }
                                            : undefined
                                      }
                                      color={isNew || isReturning ? undefined : 'primary'}
                                      variant={isNew || isReturning ? 'filled' : 'outlined'}
                                    />
                                  );
                                })()
                              : '—'}
                          </TableCell>
                          <TableCell sx={tdCell}>
                            ₦
                            {(
                              student.total_compulsory ||
                              student.total_compulsorys ||
                              0
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell sx={tdCell}>
                            ₦{(student.total_optional || 0).toLocaleString()}
                          </TableCell>
                          <TableCell sx={tdCell}>
                            ₦{(student.total_payable || 0).toLocaleString()}
                          </TableCell>
                          <TableCell sx={tdCell}>
                            ₦{(student.total_paid || 0).toLocaleString()}
                          </TableCell>
                          <TableCell sx={tdCell}>
                            ₦{(student.total_penalty || 0).toLocaleString()}
                          </TableCell>{' '}
                          <TableCell sx={tdCell}>
                            ₦{(student.total_discount || 0).toLocaleString()}
                          </TableCell>{' '}
                          <TableCell sx={tdCell}>
                            <Chip
                              label={`₦${(student.total_balance || 0).toLocaleString()}`}
                              size="small"
                              color={(student.total_balance || 0) > 0 ? 'error' : 'success'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={tdCell}>
                            {(() => {
                              const payable = Number(student.total_payable || 0);
                              const paid = Number(student.total_paid || 0);
                              const pct =
                                payable > 0 ? Math.min(100, Math.round((paid / payable) * 100)) : 0;
                              const color = pct >= 100 ? 'success' : pct > 0 ? 'warning' : 'error';
                              return (
                                <Box sx={{ minWidth: 90 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {pct}%
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={pct}
                                    color={color}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      mt: 0.25,
                                      bgcolor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                                    }}
                                  />
                                </Box>
                              );
                            })()}
                          </TableCell>
                          <TableCell align="right" sx={tdCell}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setActiveRow(student);
                              }}
                            >
                              <IconDotsVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          No students found for the selected class.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[10, 20, 30, 50]}
                      count={meta?.total || 0}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 190 } }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setSelectedStudentForLedger(activeRow);
                  setIsLedgerModalOpen(true);
                }}
              >
                <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                Student Ledger
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow) {
                    const sUserId =
                      activeRow?.users?.id || activeRow?.user?.id || activeRow?.user_id;
                    window.open(
                      `/class-ledger/${activeRow.invoice_number}/${sUserId}/pay-invoice`,
                      '_blank',
                    );
                  }
                }}
              >
                <PaymentsOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                Pay for Student
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow) {
                    window.open(
                      `/class-ledger/${activeRow.invoice_number}/${activeRow.user_id}/invoice`,
                      '_blank',
                    );
                  }
                }}
              >
                <EditNoteOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                Update Invoice
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow) {
                    const selectedClassObj = classes.find((c) => c.value === classLevel);
                    const currentClassId = selectedClassObj?.class_id || activeRow.class_id;
                    window.open(
                      `/payment-schedule/invoice/print/${activeRow.session_term_id}/${currentClassId}/${activeRow.user_id}?source=class-ledger`,
                      '_blank',
                    );
                  }
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                View Invoice
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow) {
                    window.open(
                      `/class-ledger/${activeRow.invoice_number}/${activeRow.user_id}/cash-post`,
                      '_blank',
                    );
                  }
                }}
              >
                <CurrencyExchangeOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                Cash Posting
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow) {
                    setSelectedUserIdForWallet(activeRow.user_id);
                    setIsWalletModalOpen(true);
                  }
                }}
              >
                <AccountBalanceWalletOutlinedIcon
                  fontSize="small"
                  sx={{ color: '#6b7280', mr: 1 }}
                />
                Wallet Transaction
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow) {
                    setReassignTarget({ userId: activeRow.user_id, fullName: activeRow.full_name });
                    setIsReassignModalOpen(true);
                  }
                }}
              >
                <SwapHorizOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                Reassign a Payment
              </MenuItem>

              <MenuItem
                disabled={!activeRow?.latest_bulk_order_id}
                onClick={() => {
                  setAnchorEl(null);
                  if (activeRow?.latest_bulk_order_id) {
                    const params = new URLSearchParams({
                      bulk_order_id: activeRow.latest_bulk_order_id,
                      user_id: activeRow.user_id,
                      session_term_id: bursarySessionTermId,
                    });
                    window.open(
                      `/bursary/transactions/print_receipt?${params.toString()}`,
                      '_blank',
                    );
                  }
                }}
              >
                <ReceiptOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
                View Receipt
              </MenuItem>
            </Menu>
            <FeeChart
              open={isFeeModalOpen}
              onClose={() => {
                setIsFeeModalOpen(false);
                setIsCompulsory(false);
                setIsOptional(false);
                setIsPayable(false);
              }}
              title={chartTitle}
              chartType={chartType}
              chartOptions={buildChartOptions([selectedClassName])}
              isPayable={isPayable}
              isOptional={isOptional}
              isCompulsory={isCompulsory}
              analyticsData={analyticsData}
              className={selectedClassName}
              onFetchDrilldown={handleFetchDrilldown}
            />
          </ParentCard>
        </>
      )}

      <StudentLedgerModal
        open={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setSelectedStudentForLedger(null);
        }}
        student={selectedStudentForLedger}
      />

      <LearnerWalletTransactionsModal
        open={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setSelectedUserIdForWallet(null);
        }}
        userId={selectedUserIdForWallet}
      />

      <ReassignPaymentModal
        open={isReassignModalOpen}
        target={reassignTarget}
        onClose={() => {
          setIsReassignModalOpen(false);
          setReassignTarget(null);
        }}
        onSuccess={fetchClassLedgerData}
      />
    </PageContainer>
  );
};

export default ClassLedger;
