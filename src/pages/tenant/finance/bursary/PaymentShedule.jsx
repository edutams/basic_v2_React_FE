import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Portal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Wallet as WalletIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  Article as ArticleIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { IconStack2, IconCash, IconTag, IconUsers, IconSettings, IconCalendarEvent } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import PaymentScheduleGrid from '@/components/tenant/bursary/payment-shedule/PaymentScheduleGrid';
import GenerateInvoiceTab from '@/components/tenant/bursary/payment-shedule/GenerateInvoiceTab';
import SendInvoiceTab from '@/components/tenant/bursary/payment-shedule/SendInvoiceTab';
import {
  fetchBursarySessionTerms,
  fetchActiveCategories,
  fetchPaymentScheduleStats,
  fetchScheduleClassesOverview,
  fetchGenerateInvoiceStats,
  fetchTermsBySessionTerm,
  importPaymentSchedule,
} from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchSendInvoiceStats } from '@/api/tenant/bursary/sendInvoiceApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import TermMigrationModal from '@/components/shared/term-migration/TermMigrationModal';
import { migrateBursarySchedules } from '@/api/tenant/term-migration/termMigrationApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment Schedule' }];

/** Stat-card header: icon tile + title + subtitle, chevron pinned right —
 * shared by all 3 top stat cards. */
const StatCardHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.25}>
    <Box display="flex" alignItems="center" gap={1}>
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
        }}
      >
        <Icon size={18} />
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
    <ChevronRightIcon sx={{ color: 'text.disabled' }} />
  </Box>
);

/** The two figures inside a stat card, separated by a vertical divider —
 * "Not Set" renders in red whenever the underlying value is genuinely
 * absent (no schedule data at all yet), never a fabricated ₦0. */
const StatFigure = ({ value, label, color, notSet }) => (
  <Box flex={1} textAlign="center">
    {notSet ? (
      <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5, color: 'error.main' }}>
        Not Set
      </Typography>
    ) : (
      <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5, color }}>
        {value}
      </Typography>
    )}
    <Typography variant="caption" color="textSecondary">
      {label}
    </Typography>
  </Box>
);

/** Numbered 3-step stepper (Set Schedule / Generate Invoice / Send
 * Invoice) rendered inside the Breadcrumb's right-aligned slot. */
const ActionStepper = ({ activeTab, onChange }) => {
  const steps = ['Set Schedule', 'Generate Invoice', 'Send Invoice'];
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {steps.map((label, idx) => (
        <Stack key={label} direction="row" alignItems="center" spacing={1}>
          {idx > 0 && <Box sx={{ width: 24, height: 2, bgcolor: 'divider' }} />}
          <Box
            onClick={() => onChange(idx)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                bgcolor: idx === activeTab ? 'primary.main' : idx < activeTab ? 'success.main' : 'grey.300',
                color: '#fff',
              }}
            >
              {idx + 1}
            </Box>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: idx === activeTab ? 700 : 500, color: idx === activeTab ? 'primary.main' : 'text.secondary' }}
            >
              {label}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

const PaymentShedule = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const scheduleGridRef = useRef(null);

  const schemeMap = [
    { bg: '#DBEAFE', color: '#2563EB' },
    { bg: '#DCFCE7', color: '#16A34A' },
    { bg: '#F3E8FF', color: '#9333EA' },
    { bg: '#FEF3C7', color: '#D97706' },
    { bg: '#FEE2E2', color: '#DC2626' },
  ];
  const s0 = schemeMap[0];
  const s1 = schemeMap[1];
  const s2 = schemeMap[2];

  const [actionTab, setActionTab] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  // null = not evaluated yet; false only once the backend confirms zero
  // payment items exist for the current pay_option — a state every
  // category's own missing_count can't tell apart from "fully scheduled".
  const [hasPaymentItems, setHasPaymentItems] = useState(null);

  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeSubTermId, setActiveSubTermId] = useState(null);
  const [subTerms, setSubTerms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({
    paymentItemsTotal: 0,
    schedule: { total: 0, classes: 0 },
    missingSchedules: { total: 0 },
    paymentName: { withMinSchedule: 0, withMaxSchedule: 0, minLabel: 'N/A', maxLabel: 'N/A' },
    studentCategory: { withMinSchedule: 0, withMaxSchedule: 0, minLabel: 'N/A', maxLabel: 'N/A' },
  });
  const [loadingStats, setLoadingStats] = useState(false);
  // "Classes" row — real enrolled headcount + how many of the active
  // payment items (both Compulsory and Optional combined) already have a
  // price set for that class, for the Set Schedule step only.
  const [classesOverview, setClassesOverview] = useState([]);
  const [loadingClassesOverview, setLoadingClassesOverview] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState({
    invoiceGenerated: 0,
    totalAmount: 0,
    paymentNames: [
      { name: 'With Minimum Invoice', count: 0, amount: 0, label: 'N/A' },
      { name: 'With Maximum Invoice', count: 0, amount: 0, label: 'N/A' },
    ],
    categories: [
      { name: 'With Minimum Invoice', count: 0, amount: 0, label: 'N/A' },
      { name: 'With Maximum Invoice', count: 0, amount: 0, label: 'N/A' },
    ],
  });
  const [loadingInvoiceStats, setLoadingInvoiceStats] = useState(false);
  const [importing, setImporting] = useState(false);
  const [migrateModalOpen, setMigrateModalOpen] = useState(false);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);

  const refreshStats = () => {
    if (!selectedSession || !activeSubTermId) return;
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        // No pay_option — combines Compulsory + Optional, matching the
        // merged Set Schedule grid.
        const res = await fetchPaymentScheduleStats(selectedSession, activeSubTermId);
        if (res?.success && res.data) {
          const { payment_items_total, schedule, missing_schedules, amount, student_category } = res.data;
          setScheduleStats({
            paymentItemsTotal: payment_items_total ?? 0,
            schedule: { total: schedule?.total ?? 0, classes: schedule?.classes ?? 0 },
            missingSchedules: { total: missing_schedules?.total ?? 0 },
            paymentName: {
              withMinSchedule: amount?.min?.amount ?? 0,
              withMaxSchedule: amount?.max?.amount ?? 0,
              minLabel: amount?.min?.name ?? 'N/A',
              maxLabel: amount?.max?.name ?? 'N/A',
            },
            studentCategory: {
              withMinSchedule: student_category?.min?.amount ?? 0,
              withMaxSchedule: student_category?.max?.amount ?? 0,
              minLabel: student_category?.min?.name ?? 'N/A',
              maxLabel: student_category?.max?.name ?? 'N/A',
            },
          });
        }
      } catch (err) {
        console.error('Failed to refresh stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  };

  const refreshClassesOverview = () => {
    if (!selectedSession || !activeSubTermId) return;
    const loadOverview = async () => {
      try {
        setLoadingClassesOverview(true);
        const res = await fetchScheduleClassesOverview(selectedSession, activeSubTermId, selectedCategory || undefined);
        if (res?.success && Array.isArray(res.data)) {
          setClassesOverview(res.data);
        }
      } catch (err) {
        console.error('Failed to load classes overview:', err);
      } finally {
        setLoadingClassesOverview(false);
      }
    };
    loadOverview();
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    const loadSessionTerms = async () => {
      try {
        setLoadingSessions(true);
        // fetchBursarySessionTerms() is ordered newest-first — that's "most
        // recently created", not "actually active". Default off
        // getActiveSessionTerm() (via fetchActiveTenantSessionTerm) instead,
        // same single source of truth every other picker in the app uses.
        const [res, activeRes] = await Promise.all([
          fetchBursarySessionTerms(),
          fetchActiveTenantSessionTerm(),
        ]);

        const list = Array.isArray(res?.data) ? res.data : [];
        setSessions(list);

        if (list.length > 0) {
          const activeSessionTerm = activeRes?.status ? activeRes.data : null;
          const defaultItem =
            (activeSessionTerm && list.find((item) => item.id === activeSessionTerm.id)) || list[0];
          setSelectedSessionTerm(defaultItem.id);
          setSelectedSession(defaultItem.session_id);
          setSelectedTerm(defaultItem.term_id);
        }
      } catch (err) {
        showSnackbar('Failed to load session terms', 'error');
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessionTerms();
  }, []);

  // Refetches whenever the session or term changes so each category's
  // `missing_count` reflects what's actually selected — a category can be
  // fully scheduled for one term and missing for another. Doesn't reset
  // `selectedCategory` on refetch so switching term doesn't yank the
  // bursar's current pick away. Unscoped by pay_option — counts Compulsory
  // + Optional combined, matching the merged Set Schedule grid.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetchActiveCategories({
          sessionId: selectedSession || undefined,
          termId: activeSubTermId || undefined,
          payType: 'bursary',
        });

        const list = Array.isArray(res?.data) ? res.data : [];
        setCategories(list);
        setHasPaymentItems(res?.has_payment_items ?? null);

        if (list.length > 0 && !selectedCategory) {
          setSelectedCategory(String(list[0].id));
        }
      } catch (err) {
        showSnackbar('Failed to load categories', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession, activeSubTermId]);

  // Flags categories with zero prices set for the current session/term/tab
  // before the bursar even opens the dropdown — the whole point being they
  // shouldn't have to click through each one just to find the gaps.
  const categoriesMissingCount = categories.filter((c) => (c.missing_count ?? 0) > 0).length;
  const totalMissingAcrossCategories = categories.reduce((sum, c) => sum + (c.missing_count ?? 0), 0);
  // Categories with literally nothing priced yet vs. ones that are only
  // partially done — same missing_count > 0 either way, but a bursar
  // needs to know which is which.
  const categoriesFullyUnsetCount = categories.filter((c) => c.has_none_set).length;
  const categoriesPartiallyMissingCount = categoriesMissingCount - categoriesFullyUnsetCount;

  // hasPaymentItems === false takes priority: with zero payment items,
  // every category's missing_count is silently 0 (nothing to schedule
  // against yet), which would otherwise look identical to "fully done".
  const categoryCalloutMessage =
    hasPaymentItems === false
      ? 'No payment items created yet — add one to start scheduling'
      : categoriesFullyUnsetCount > 0
        ? `${categoriesFullyUnsetCount} categor${categoriesFullyUnsetCount === 1 ? 'y has' : 'ies have'} no schedule/price set for any class${
            categoriesPartiallyMissingCount > 0
              ? ` — ${categoriesPartiallyMissingCount} more only partially priced across classes`
              : ''
          }`
        : categoriesMissingCount > 0
          ? `${categoriesMissingCount} categor${categoriesMissingCount === 1 ? 'y' : 'ies'} missing schedules${
              totalMissingAcrossCategories > 0 ? ` — ${totalMissingAcrossCategories} class/item pairs` : ''
            }`
          : null;

  // The Set Schedule tab's own picker is session-only — which term is
  // active gets picked via the term pills inside PaymentScheduleGrid.
  // `sessions` is a flat list of session_term rows though (one per term),
  // so it's deduped here to one entry per session for this dropdown's options.
  const distinctSessions = useMemo(() => {
    const bySessionId = new Map();
    sessions.forEach((item) => {
      if (!bySessionId.has(item.session_id)) {
        bySessionId.set(item.session_id, item);
      }
    });
    return Array.from(bySessionId.values());
  }, [sessions]);

  const handleSessionTermChange = (sessionTermId) => {
    const selectedItem = sessions.find((s) => s.id === sessionTermId);
    if (selectedItem) {
      setSelectedSessionTerm(sessionTermId);
      setSelectedSession(selectedItem.session_id);
      setSelectedTerm(selectedItem.term_id);
      setActiveSubTermId(null);
    }
  };

  // Session-only change for the Set Schedule tab's picker — still resolves
  // to a representative session_term row (any term of that session) so
  // selectedSessionTerm/selectedTerm stay populated for the other tabs
  // that do need a specific term, but the dropdown itself only asks "which
  // session".
  const handleSessionOnlyChange = (sessionId) => {
    const representative = sessions.find((s) => s.session_id === sessionId);
    if (representative) {
      setSelectedSessionTerm(representative.id);
      setSelectedSession(sessionId);
      setSelectedTerm(representative.term_id);
      setActiveSubTermId(null);
    }
  };

  useEffect(() => {
    if (!selectedSession) {
      setSubTerms([]);
      return;
    }

    const loadSubTerms = async () => {
      try {
        const res = await fetchTermsBySessionTerm(selectedSession, selectedTerm);
        const list = Array.isArray(res?.data) ? res.data : [];
        setSubTerms(list);
      } catch (err) {
        console.error('Failed to load sub-terms:', err);
        setSubTerms([]);
      }
    };

    loadSubTerms();
  }, [selectedSession, selectedTerm]);

  // Defaults the Term select to the first term once its list loads (e.g.
  // after a session change reset it to null) — the Term select itself now
  // owns this choice; there's no more per-tab term-pill component resolving
  // it internally.
  useEffect(() => {
    if (subTerms.length > 0 && !activeSubTermId) {
      setActiveSubTermId(subTerms[0].term_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTerms]);

  const activeSubTermIndex = subTerms.findIndex((term) => term.term_id === activeSubTermId);
  const previousSubTerm = activeSubTermIndex > 0 ? subTerms[activeSubTermIndex - 1] : null;
  const currentSubTerm = activeSubTermIndex >= 0 ? subTerms[activeSubTermIndex] : null;

  const getSubTermLabel = (term) =>
    term?.term?.term_name ||
    term?.display_term?.display_name ||
    term?.displayTerm?.display_name ||
    'Term';

  const handleUpdateCategory = (categoryId, sessionTermId) => {
    setActionTab(0);
    setSelectedCategory(String(categoryId));
    handleSessionTermChange(sessionTermId);
  };

  // Fetch stats + classes overview when session, term, or category changes.
  useEffect(() => {
    refreshStats();
    refreshClassesOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession, activeSubTermId, selectedCategory]);

  const stats = scheduleStats;

  // Fetch invoice stats when session term changes or when Generate Invoice
  // tab is active. GenerateInvoiceTab's own table is already hardcoded to
  // 'compulsory' internally (unaffected by the Set Schedule merge), so this
  // stats-only fetch matches that rather than reading a removed scheduleTab.
  useEffect(() => {
    if (!selectedSessionTerm || actionTab !== 1) return;
    const payOption = 'compulsory';

    const loadInvoiceStats = async () => {
      try {
        setLoadingInvoiceStats(true);
        const res = await fetchGenerateInvoiceStats(selectedSessionTerm, selectedClass, payOption);
        if (res?.success && res.data) {
          const { invoice_generated, total_amount, payment_names, categories } = res.data;
          setInvoiceStats({
            invoiceGenerated: invoice_generated ?? 0,
            totalAmount: total_amount ?? 0,
            paymentNames: [
              {
                name: 'With Minimum Invoice',
                count: payment_names?.min?.count ?? 0,
                amount: payment_names?.min?.amount ?? 0,
                label: payment_names?.min?.name ?? 'N/A',
              },
              {
                name: 'With Maximum Invoice',
                count: payment_names?.max?.count ?? 0,
                amount: payment_names?.max?.amount ?? 0,
                label: payment_names?.max?.name ?? 'N/A',
              },
            ],
            categories: [
              {
                name: 'With Minimum Invoice',
                count: categories?.min?.count ?? 0,
                amount: categories?.min?.amount ?? 0,
                label: categories?.min?.name ?? 'N/A',
              },
              {
                name: 'With Maximum Invoice',
                count: categories?.max?.count ?? 0,
                amount: categories?.max?.amount ?? 0,
                label: categories?.max?.name ?? 'N/A',
              },
            ],
          });
        }
      } catch (err) {
        console.error('Failed to load invoice stats:', err);
      } finally {
        setLoadingInvoiceStats(false);
      }
    };
    loadInvoiceStats();
  }, [selectedSessionTerm, actionTab, selectedClass]);

  const [sendInvoiceStatsData, setSendInvoiceStatsData] = useState({
    total_sent: 0,
    sent_by_mail: 0,
    sent_by_sms: 0,
    excel_generated: 0,
  });
  const [loadingSendInvoiceStats, setLoadingSendInvoiceStats] = useState(false);
  const [sendInvoiceRefreshKey, setSendInvoiceRefreshKey] = useState(0);

  const refreshSendInvoiceStats = () => {
    setSendInvoiceRefreshKey((prev) => prev + 1);
  };

  // Fetch send invoice stats
  useEffect(() => {
    if (!selectedSessionTerm || actionTab !== 2) return;
    const loadSendInvoiceStats = async () => {
      try {
        setLoadingSendInvoiceStats(true);
        const res = await fetchSendInvoiceStats({
          sessionTermId: selectedSessionTerm,
          classId: selectedClass || undefined,
        });
        if (res?.success && res.data) {
          setSendInvoiceStatsData({
            total_sent: res.data.total_sent || 0,
            sent_by_mail: res.data.sent_by_mail || 0,
            sent_by_sms: res.data.sent_by_sms || 0,
            excel_generated: res.data.excel_generated || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load send invoice stats:', err);
      } finally {
        setLoadingSendInvoiceStats(false);
      }
    };
    loadSendInvoiceStats();
  }, [selectedSessionTerm, actionTab, selectedClass, sendInvoiceRefreshKey]);

  const formatCurrency = (value) =>
    `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sendInvoiceStats = [
    { label: 'Total Invoice Sent', value: sendInvoiceStatsData.total_sent, icon: MessageIcon },
    { label: 'Invoice Sent by Mail', value: sendInvoiceStatsData.sent_by_mail, icon: EmailIcon },
    { label: 'Invoice Sent by SMS', value: sendInvoiceStatsData.sent_by_sms, icon: EmailIcon },
    { label: 'Excel Generated', value: sendInvoiceStatsData.excel_generated, icon: ArticleIcon },
  ];

  return (
    <PageContainer title="Payment Schedule" description="Configure fees and payment settings">
      <Breadcrumb
        title={
          <Box display="flex" alignItems="center" gap={1.25}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconCalendarEvent size={18} />
            </Box>
            <span>Payment Schedule</span>
          </Box>
        }
        subtitle="Configure payment amounts across classes for the selected term."
        items={BCrumb}
      >
        <ActionStepper activeTab={actionTab} onChange={setActionTab} />
      </Breadcrumb>

      {actionTab === 0 && (
        <>
          {/* Set Schedule summary cards — Compulsory + Optional combined,
           * matching the merged grid below. */}
          <Grid container spacing={2} mb={2} alignItems="stretch">
            <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '14px',
                  bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <StatCardHeader
                  icon={IconStack2}
                  iconBg={isDark ? 'rgba(255,255,255,0.08)' : s0.bg}
                  iconColor={isDark ? '#fff' : s0.color}
                  title="Payment Items & Categories"
                  subtitle="Breakdown of configured items"
                />
                <Box display="flex" flex={1} alignItems="stretch">
                  {loadingStats || loadingCategories ? (
                    <Skeleton width="100%" height={48} />
                  ) : (
                    <>
                      <StatFigure value={stats.paymentItemsTotal} label="Payment Items" color={s0.color} />
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <StatFigure value={categories.length} label="Payment Categories" color={s2.color} />
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '14px',
                  bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <StatCardHeader
                  icon={IconCash}
                  iconBg={isDark ? 'rgba(255,255,255,0.08)' : s1.bg}
                  iconColor={isDark ? '#fff' : s1.color}
                  title="Payment Category Amount Range"
                  subtitle="Across all payment items and classes"
                />
                <Box display="flex" flex={1} alignItems="stretch">
                  {loadingStats ? (
                    <Skeleton width="100%" height={40} />
                  ) : (
                    <>
                      <StatFigure
                        value={`₦${stats.studentCategory.withMinSchedule?.toLocaleString()}`}
                        label="Minimum Amount"
                        color="success.main"
                        notSet={stats.schedule.total === 0}
                      />
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <StatFigure
                        value={`₦${stats.studentCategory.withMaxSchedule?.toLocaleString()}`}
                        label="Maximum Amount"
                        color={s1.color}
                        notSet={stats.schedule.total === 0}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '14px',
                  bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <StatCardHeader
                  icon={IconTag}
                  iconBg={isDark ? 'rgba(255,255,255,0.08)' : s2.bg}
                  iconColor={isDark ? '#fff' : s2.color}
                  title="Payment Name Amount Range"
                  subtitle="Across all categories and classes"
                />
                <Box display="flex" flex={1} alignItems="stretch">
                  {loadingStats ? (
                    <Skeleton width="100%" height={40} />
                  ) : (
                    <>
                      <StatFigure
                        value={`₦${stats.paymentName.withMinSchedule?.toLocaleString()}`}
                        label="Minimum Amount"
                        color="success.main"
                        notSet={stats.schedule.total === 0}
                      />
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <StatFigure
                        value={`₦${stats.paymentName.withMaxSchedule?.toLocaleString()}`}
                        label="Maximum Amount"
                        color={s2.color}
                        notSet={stats.schedule.total === 0}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Classes row — real enrolled headcount, and how many of the
           * active payment items (both Compulsory and Optional) already
           * have a price set for that class. Deliberately NOT "students
           * scheduled": prices are set per class, not per student, so that
           * figure can't vary gradually per student the way it might look. */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '14px',
              bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
              flexDirection={{ xs: 'column', lg: 'row' }}
              gap={2}
              mb={2}
            >
              <Box display="flex" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: s0.bg,
                    color: s0.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconUsers size={18} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Classes
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Configure classes to setup payment amounts.
                  </Typography>
                </Box>
              </Box>

              {/* Session / Term / Student Pay Category — the Session/Term
               * tabs removed from Set Schedule now live here, alongside the
               * category selector this page still needs (a schedule can't
               * be saved without one; not shown in the reference but
               * required for the existing data model). */}
              <Box display="flex" flexWrap="wrap" alignItems="center" gap={1.5}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Academic Session</InputLabel>
                  <Select
                    value={selectedSession}
                    label="Academic Session"
                    onChange={(e) => handleSessionOnlyChange(e.target.value)}
                    disabled={loadingSessions}
                  >
                    {loadingSessions ? (
                      <MenuItem disabled>
                        <CircularProgress size={16} />
                      </MenuItem>
                    ) : (
                      distinctSessions.map((item) => (
                        <MenuItem key={item.session_id} value={item.session_id}>
                          {item.session?.session_name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Term</InputLabel>
                  <Select
                    value={activeSubTermId ?? ''}
                    label="Term"
                    onChange={(e) => setActiveSubTermId(e.target.value)}
                    disabled={subTerms.length === 0}
                  >
                    {subTerms.map((term) => (
                      <MenuItem key={term.term_id} value={term.term_id}>
                        {getSubTermLabel(term)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>Student Pay Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Student Pay Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={loadingCategories}
                    renderValue={(val) => categories.find((c) => String(c.id) === String(val))?.name || ''}
                  >
                    {loadingCategories ? (
                      <MenuItem disabled>
                        <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                      </MenuItem>
                    ) : (
                      categories.map((category) => (
                        <MenuItem key={category.id} value={String(category.id)}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" gap={1}>
                            {category.name}
                            {category.missing_count > 0 && (
                              <Box
                                component="span"
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: '#fff',
                                  bgcolor: 'error.main',
                                  borderRadius: '10px',
                                  px: 1,
                                  py: 0.25,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {category.missing_count} missing
                              </Box>
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconSettings size={16} />}
                  onClick={() => navigate('/class-structure-manager')}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Manage Classes
                </Button>
              </Box>
            </Box>

            {/* Always-visible category callout, relocated here now that the
             * category selector itself lives in this card. */}
            {categoryCalloutMessage && (
              <Alert severity="error" variant="outlined" sx={{ mb: 2, py: 0.25 }}>
                {categoryCalloutMessage}
              </Alert>
            )}

            <Grid container spacing={2}>
              {(loadingClassesOverview ? Array.from({ length: 6 }) : classesOverview).map((cls, idx) => {
                const scheme = schemeMap[idx % schemeMap.length];
                const pct = cls ? Math.round((cls.priced_items / Math.max(cls.total_items, 1)) * 100) : 0;
                const notSet = cls && cls.priced_items === 0;
                return (
                  <Grid key={cls?.id ?? idx} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => cls && scheduleGridRef.current?.scrollToClass(cls.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : scheme.bg + '33',
                        cursor: cls ? 'pointer' : 'default',
                        transition: 'transform 150ms ease, box-shadow 150ms ease',
                        '&:hover': cls ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' } : undefined,
                      }}
                    >
                      {!cls ? (
                        <Skeleton variant="rounded" height={90} />
                      ) : (
                        <>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '8px',
                                  bgcolor: scheme.bg,
                                  color: scheme.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <IconUsers size={16} />
                              </Box>
                              <Typography variant="body2" fontWeight={700} noWrap>
                                {cls.class_code || cls.class_name}
                              </Typography>
                            </Box>
                            <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                          </Box>
                          <Typography variant="caption" color="textSecondary" display="block" mb={0.5}>
                            {cls.student_count} students
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                                '& .MuiLinearProgress-bar': { bgcolor: notSet ? 'error.main' : scheme.color, borderRadius: 3 },
                              }}
                            />
                            <Typography variant="caption" fontWeight={700} sx={{ color: notSet ? 'error.main' : scheme.color }}>
                              {pct}%
                            </Typography>
                          </Box>
                          {notSet ? (
                            <Typography variant="caption" fontWeight={700} color="error.main">
                              Not Set
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              {cls.priced_items} of {cls.total_items} items scheduled
                            </Typography>
                          )}
                        </>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </>
      )}

      {actionTab === 1 && (
        // Generate Invoice Stats
        <Grid container spacing={3} mb={1}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: '14px',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s0.bg,
                    color: isDark ? '#fff' : s0.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ fontSize: 18 }} color="currentColor" />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Invoice Generated
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2} mt={3}>
                <Box
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s0.bg,
                    borderRadius: 1,
                    px: 3,
                    py: 1.5,
                    mt: 3.5,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  {loadingInvoiceStats ? (
                    <Skeleton width={80} height={36} />
                  ) : (
                    <Typography
                      variant="h2"
                      fontWeight={700}
                      sx={{ color: isDark ? '#ffffff' : s0.color }}
                    >
                      {invoiceStats.invoiceGenerated}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" ml="auto" flexDirection="column" justifyContent="end">
                  {loadingInvoiceStats ? (
                    <Skeleton width={100} height={32} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(invoiceStats.totalAmount)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: '14px',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s1.bg,
                    color: isDark ? '#fff' : s1.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ fontSize: 18 }} color="currentColor" />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  Payment Name
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5}>
                {invoiceStats.paymentNames.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      bgcolor: idx === 0 ? 'rgba(139, 195, 74, 0.12)' : 'rgba(103, 58, 183, 0.12)',
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      {item.name}
                    </Typography>
                    {loadingInvoiceStats ? (
                      <Skeleton width={120} height={32} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} mb={0.5}>
                        {formatCurrency(item.amount)} ({item.count})
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: '14px',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s2.bg,
                    color: isDark ? '#fff' : s2.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ fontSize: 18 }} color="currentColor" />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  Category Name
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5}>
                {invoiceStats.categories.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      bgcolor: idx === 0 ? 'rgba(139, 195, 74, 0.12)' : 'rgba(103, 58, 183, 0.12)',
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      {item.name}
                    </Typography>
                    {loadingInvoiceStats ? (
                      <Skeleton width={120} height={32} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} mb={0.5}>
                        {formatCurrency(item.amount)} ({item.count})
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {actionTab === 2 && (
        <Grid container spacing={3} mb={1}>
          {sendInvoiceStats.map((stat, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: '14px',
                  borderRadius: '14px',
                  bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition:
                    'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: '#94a3b8',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : schemeMap[i].bg,
                      color: isDark ? '#fff' : schemeMap[i].color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <stat.icon sx={{ fontSize: 18 }} color="currentColor" />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Box>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{ color: isDark ? '#ffffff' : schemeMap[i].color }}
                >
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box>
        {actionTab === 0 && (
          <PaymentScheduleGrid
            ref={scheduleGridRef}
            showSnackbar={showSnackbar}
            sessionId={selectedSession}
            activeTermId={activeSubTermId}
            categoryId={selectedCategory}
            payType="bursary"
            classesOverview={classesOverview}
            onOpenMigrate={() => setMigrateModalOpen(true)}
            refreshStats={() => {
              refreshStats();
              refreshClassesOverview();
            }}
            scheduleRefreshKey={scheduleRefreshKey}
          />
        )}
        {actionTab === 1 && (
          <Paper sx={{ borderRadius: 2, p: 1.5 }}>
            <GenerateInvoiceTab
              showSnackbar={showSnackbar}
              onUpdateCategory={handleUpdateCategory}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
            />
          </Paper>
        )}
        {actionTab === 2 && (
          <Paper sx={{ borderRadius: 2, p: 1.5 }}>
            <SendInvoiceTab showSnackbar={showSnackbar} refreshStats={refreshSendInvoiceStats} />
          </Paper>
        )}
      </Box>

      <TermMigrationModal
        open={migrateModalOpen}
        onClose={() => setMigrateModalOpen(false)}
        title="Migrate Fee Schedules"
        description="Carries every active fee schedule (and its installment options) forward from the term you pick into the term you're moving to. Only works within the same session — fees for a new academic session should be reviewed, not assumed."
        migrateFn={migrateBursarySchedules}
        onSuccess={() => {
          setScheduleRefreshKey((key) => key + 1);
          refreshStats();
        }}
      />

      {/* Portal — Snackbar doesn't portal itself (unlike Dialog), so it can
          get trapped under an open Dialog's stacking context regardless of
          z-index. Portal escapes it to document.body, same as Dialog. */}
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </PageContainer>
  );
};

export default PaymentShedule;
