import { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  IconStack2,
  IconCash,
  IconTag,
  IconUsers,
  IconSettings,
  IconCalendarEvent,
} from '@tabler/icons-react';
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
  fetchTermsBySessionTerm,
  importPaymentSchedule,
} from '@/api/tenant/bursary/bursarySettingsApi';
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
const StatFigure = ({ value, label, color, notSet, achievedBy }) => (
  <Box flex={1} textAlign="center">
    {notSet ? (
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ lineHeight: 1, mb: 0.5, color: 'error.main' }}
      >
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
    {!notSet && achievedBy && (
      <Box
        sx={{
          mt: 0.75,
          mx: 'auto',
          maxWidth: '100%',
          px: 1,
          py: 0.5,
          borderRadius: 1.5,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)',
        }}
      >
        <Typography variant="caption" fontWeight={700} display="block" noWrap sx={{ color }}>
          {achievedBy}
        </Typography>
      </Box>
    )}
  </Box>
);

const PaymentShedule = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

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
  // Active payment categories — now the grid's column dimension (one
  // column per category for the selected class), not a single filter.
  const [categories, setCategories] = useState([]);

  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  // The Set Schedule grid is now pivoted on class (selected via the Classes
  // row below) with category as the table's own column dimension — the
  // inverse of the old single-category-dropdown + class-columns layout.
  const [selectedScheduleClassId, setSelectedScheduleClassId] = useState('');
  const [activeSubTermId, setActiveSubTermId] = useState(null);
  const [subTerms, setSubTerms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({
    paymentItemsTotal: 0,
    paymentItemsCompulsory: 0,
    paymentItemsOptional: 0,
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
          const {
            payment_items_total,
            payment_items_compulsory,
            payment_items_optional,
            schedule,
            missing_schedules,
            amount,
            student_category,
          } = res.data;
          setScheduleStats({
            paymentItemsTotal: payment_items_total ?? 0,
            paymentItemsCompulsory: payment_items_compulsory ?? 0,
            paymentItemsOptional: payment_items_optional ?? 0,
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
        const res = await fetchScheduleClassesOverview(selectedSession, activeSubTermId);
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

  // The first class loads by default; if the previously-selected class
  // disappears (e.g. a term switch), fall back to the new first class
  // rather than leaving the grid pointed at a class that's no longer listed.
  useEffect(() => {
    if (classesOverview.length === 0) return;
    const stillValid = classesOverview.some(
      (cls) => String(cls.id) === String(selectedScheduleClassId),
    );
    if (!stillValid) {
      setSelectedScheduleClassId(String(classesOverview[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classesOverview]);

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

  // The full active-category list — used as the grid's column set for
  // whichever class is selected below, so it's independent of any one
  // class/category pairing.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetchActiveCategories({
          sessionId: selectedSession || undefined,
          termId: activeSubTermId || undefined,
          payType: 'bursary',
        });

        setCategories(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        showSnackbar('Failed to load categories', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession, activeSubTermId]);

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

  // Fetch stats + classes overview when session or term changes.
  useEffect(() => {
    refreshStats();
    refreshClassesOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession, activeSubTermId]);

  const stats = scheduleStats;

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
      />

      <Box
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
          '& .MuiTabs-root': { minWidth: '300px' },
        }}
      >
        <Tabs
          value={actionTab}
          onChange={(e, newValue) => setActionTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
        >
          <Tab
            label="Set Schedule"
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
          />
          <Tab
            label="Generate Invoice"
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
          />
          <Tab
            label="Send Invoice"
            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
          />
        </Tabs>
      </Box>

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
                    <>
                      <Box flex={1} textAlign="center">
                        <Skeleton variant="text" width={40} height={40} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={85} height={18} sx={{ mx: 'auto' }} />
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <Box flex={1} textAlign="center">
                        <Skeleton variant="text" width={40} height={40} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={100} height={18} sx={{ mx: 'auto' }} />
                      </Box>
                    </>
                  ) : (
                    <>
                      <StatFigure
                        value={stats.paymentItemsTotal}
                        label="Payment Items"
                        color={s0.color}
                      />
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <StatFigure
                        value={categories.length}
                        label="Payment Categories"
                        color={s2.color}
                      />
                    </>
                  )}
                </Box>
                {!loadingStats && (
                  <Stack direction="row" spacing={1} mt={1.5}>
                    <Box
                      flex={1}
                      sx={{
                        borderRadius: 1.5,
                        p: 1,
                        textAlign: 'center',
                        bgcolor: isDark ? 'rgba(22,163,74,0.14)' : '#DCFCE7',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#15803D' }}>
                        {stats.paymentItemsCompulsory} Compulsory Item
                        {stats.paymentItemsCompulsory === 1 ? '' : 's'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Items required for all students
                      </Typography>
                    </Box>
                    <Box
                      flex={1}
                      sx={{
                        borderRadius: 1.5,
                        p: 1,
                        textAlign: 'center',
                        bgcolor: isDark ? 'rgba(217,119,6,0.14)' : '#FFEDD5',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#C2410C' }}>
                        {stats.paymentItemsOptional} Optional Item
                        {stats.paymentItemsOptional === 1 ? '' : 's'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Items selected by category
                      </Typography>
                    </Box>
                  </Stack>
                )}
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
                    <>
                      <Box flex={1} textAlign="center">
                        <Skeleton variant="text" width={70} height={36} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={90} height={18} sx={{ mx: 'auto' }} />
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <Box flex={1} textAlign="center">
                        <Skeleton variant="text" width={70} height={36} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={95} height={18} sx={{ mx: 'auto' }} />
                      </Box>
                    </>
                  ) : (
                    <>
                      <StatFigure
                        value={`₦${stats.studentCategory.withMinSchedule?.toLocaleString()}`}
                        label="Minimum Amount"
                        color="success.main"
                        notSet={stats.schedule.total === 0}
                        achievedBy={
                          stats.studentCategory.minLabel !== 'N/A'
                            ? `${stats.studentCategory.minLabel} — ₦${stats.studentCategory.withMinSchedule?.toLocaleString()}`
                            : null
                        }
                      />
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <StatFigure
                        value={`₦${stats.studentCategory.withMaxSchedule?.toLocaleString()}`}
                        label="Maximum Amount"
                        color={s1.color}
                        notSet={stats.schedule.total === 0}
                        achievedBy={
                          stats.studentCategory.maxLabel !== 'N/A'
                            ? `${stats.studentCategory.maxLabel} — ₦${stats.studentCategory.withMaxSchedule?.toLocaleString()}`
                            : null
                        }
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
                    <>
                      <Box flex={1} textAlign="center">
                        <Skeleton variant="text" width={70} height={36} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={90} height={18} sx={{ mx: 'auto' }} />
                      </Box>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <Box flex={1} textAlign="center">
                        <Skeleton variant="text" width={70} height={36} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={95} height={18} sx={{ mx: 'auto' }} />
                      </Box>
                    </>
                  ) : (
                    <>
                      <StatFigure
                        value={`₦${stats.paymentName.withMinSchedule?.toLocaleString()}`}
                        label="Minimum Amount"
                        color="success.main"
                        notSet={stats.schedule.total === 0}
                        achievedBy={
                          stats.paymentName.minLabel !== 'N/A'
                            ? `${stats.paymentName.minLabel} — ₦${stats.paymentName.withMinSchedule?.toLocaleString()}`
                            : null
                        }
                      />
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <StatFigure
                        value={`₦${stats.paymentName.withMaxSchedule?.toLocaleString()}`}
                        label="Maximum Amount"
                        color={s2.color}
                        notSet={stats.schedule.total === 0}
                        achievedBy={
                          stats.paymentName.maxLabel !== 'N/A'
                            ? `${stats.paymentName.maxLabel} — ₦${stats.paymentName.withMaxSchedule?.toLocaleString()}`
                            : null
                        }
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

            {/* Click a class to select it — the table below always shows
             * one class at a time, by category. The first class loads by
             * default (see the classesOverview effect above). */}
            <Grid container spacing={2}>
              {(loadingClassesOverview ? Array.from({ length: 6 }) : classesOverview).map(
                (cls, idx) => {
                  const scheme = schemeMap[idx % schemeMap.length];
                  const pct = cls
                    ? Math.round((cls.priced_items / Math.max(cls.total_items, 1)) * 100)
                    : 0;
                  const notSet = cls && cls.priced_items === 0;
                  const isSelected = cls && String(cls.id) === String(selectedScheduleClassId);
                  // Fit every class into a single row at wide screens — a
                  // primary school's crèche-to-primary-6 lineup (8-10
                  // classes) shouldn't wrap to a 2nd row just because 6
                  // happened to fit a secondary school's class count.
                  const lgSize = Math.min(2, 12 / Math.max(classesOverview.length || 6, 1));
                  return (
                    <Grid key={cls?.id ?? idx} size={{ xs: 12, sm: 6, md: 4, lg: lgSize }}>
                      <Tooltip
                        title={
                          cls
                            ? `${cls.class_code} — ${cls.student_count} student${cls.student_count === 1 ? '' : 's'}. ${cls.priced_items} of ${cls.total_items} item/category combinations priced (${pct}%). ${isSelected ? 'Currently selected below.' : 'Click to view and edit its schedule below.'}`
                            : ''
                        }
                        arrow
                      >
                        <Paper
                          variant="outlined"
                          onClick={() => cls && setSelectedScheduleClassId(String(cls.id))}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : scheme.bg + '33',
                            cursor: cls ? 'pointer' : 'default',
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? scheme.color : 'divider',
                            boxShadow: isSelected ? `0 0 0 2px ${scheme.color}33` : 'none',
                            transition: 'transform 150ms ease, box-shadow 150ms ease',
                            '&:hover': cls
                              ? {
                                  transform: 'translateY(-2px)',
                                  boxShadow: isSelected
                                    ? `0 0 0 2px ${scheme.color}33`
                                    : '0 4px 12px rgba(15,23,42,0.08)',
                                }
                              : undefined,
                          }}
                        >
                          {!cls ? (
                            <>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={1}
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Skeleton
                                    variant="rounded"
                                    width={28}
                                    height={28}
                                    sx={{ borderRadius: '8px' }}
                                  />
                                  <Skeleton variant="text" width={70} height={22} />
                                </Box>
                              </Box>
                              <Skeleton variant="text" width={80} height={18} sx={{ mb: 0.5 }} />
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Skeleton
                                  variant="rounded"
                                  width="100%"
                                  height={6}
                                  sx={{ borderRadius: 3 }}
                                />
                                <Skeleton variant="text" width={28} height={18} />
                              </Box>
                              <Skeleton variant="text" width={110} height={18} />
                            </>
                          ) : (
                            <>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={1}
                              >
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
                                    {cls.class_code}
                                  </Typography>
                                </Box>
                                {isSelected ? (
                                  <CheckCircleIcon
                                    sx={{ color: scheme.color, flexShrink: 0, fontSize: 20 }}
                                  />
                                ) : (
                                  <ChevronRightIcon
                                    sx={{ color: 'text.disabled', flexShrink: 0 }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                display="block"
                                mb={0.5}
                              >
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
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: notSet ? 'error.main' : scheme.color,
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  sx={{ color: notSet ? 'error.main' : scheme.color }}
                                >
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
                      </Tooltip>
                    </Grid>
                  );
                },
              )}
            </Grid>
          </Paper>
        </>
      )}

      <Box>
        {actionTab === 0 && (
          <PaymentScheduleGrid
            showSnackbar={showSnackbar}
            sessionId={selectedSession}
            activeTermId={activeSubTermId}
            classId={selectedScheduleClassId}
            className={
              classesOverview.find((cls) => String(cls.id) === String(selectedScheduleClassId))
                ?.class_code ||
              classesOverview.find((cls) => String(cls.id) === String(selectedScheduleClassId))
                ?.class_name
            }
            payType="bursary"
            categoriesList={categories}
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
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              onReviewPricing={() => setActionTab(0)}
            />
          </Paper>
        )}
        {actionTab === 2 && <SendInvoiceTab showSnackbar={showSnackbar} />}
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
