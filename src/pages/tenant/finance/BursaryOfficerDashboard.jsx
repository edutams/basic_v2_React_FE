import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stack,
  useTheme,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Event,
  Download,
  FilterAlt,
  ReceiptLong,
  AccountBalanceWallet,
  ErrorOutline,
  Description,
  TaskAlt,
  Grade,
  Insights,
  PieChartOutline,
  Groups,
  NotificationsActive,
  TableChart,
  HourglassEmpty,
  Schedule,
  TrackChanges,
  ChevronRight,
  InfoOutlined,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { getStatCardColor } from '@/utils/statCardColors';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';

const COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'];

const STATUS_META = {
  excellent: { label: 'Excellent', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  poor: { label: 'Poor', color: 'error' },
};

const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const formatCompact = (amount) => {
  const n = Number(amount || 0);
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(2)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
};

// Safe percentage (avoids NaN when the whole is 0 or missing)
const safePct = (part, whole) => {
  const w = Number(whole);
  if (!w || w <= 0) return 0;
  return Math.min((Number(part || 0) / w) * 100, 100);
};

/**
 * ── Small building blocks ──────────────────────────────────────────
 */

// KPI card — project-standard stat card (same pattern as PsychomotorAnalyticsCards /
// DashboardStatCard): getStatCardColor gradient background, accent-colored uppercase
// caption, big accent value, LinearProgress bar, and trend indicator.
const KpiCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  colorName = 'primary',
  colorIndex = 0,
  progress,
  trend,
  trendLabel,
  rightElement,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isDark
            ? '0 8px 30px rgba(0,0,0,0.35)'
            : '0 6px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Label row */}
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{
          color: isDark ? 'rgba(255,255,255,0.72)' : colors.accentColor,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
          fontSize: 11,
          display: 'block',
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {/* Content row - different layout for rightElement vs icon */}
      {rightElement ? (
        // Layout for cards with charts (efficiency ring, sparkline): value left, chart right
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: isDark ? '#fff' : colors.accentColor,
                fontSize: { xs: 22, md: 26 },
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            {rightElement}
          </Box>
        </Box>
      ) : (
        // Layout for cards with icons: icon top-right, value below label
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            {Icon && (
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '8px',
                  background: `${colors.iconBg} !important`,
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0,0,0,0.3)'
                    : `0 4px 14px ${colors.iconGlow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 20, color: colors.iconColor || '#fff' }} />
              </Box>
            )}
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 0.5,
              color: isDark ? '#fff' : colors.accentColor,
              fontSize: { xs: 22, md: 26 },
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </>
      )}

      {typeof progress === 'number' && (
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            my: 1,
            height: 5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: colors.accentColor,
            },
          }}
        />
      )}

      {/* Sublabel and trend row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary">
          {sublabel}
        </Typography>
        {trend !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.4}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: trend > 0 ? theme.palette.success.main : theme.palette.error.main }}
            >
              {trendLabel || `${trend > 0 ? '+' : ''}${trend}%`}
            </Typography>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
            ) : trend < 0 ? (
              <TrendingDownIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
            ) : (
              <TrendingFlatIcon sx={{ fontSize: 14, color: colors.accentColor }} />
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

// Efficiency ring
const EfficiencyRing = ({ value }) => {
  const theme = useTheme();
  const color =
    value >= 75
      ? theme.palette.success.main
      : value >= 50
        ? theme.palette.warning.main
        : theme.palette.error.main;
  return (
    <Box sx={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(value, 100)}
        size={52}
        thickness={4.5}
        sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" fontWeight={800} sx={{ fontSize: 11 }}>
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
};

// Upward trend sparkline
const GrowthSparkline = () => (
  <svg width="72" height="40" viewBox="0 0 72 40" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M2,32 C10,30 14,22 22,24 C30,26 36,14 44,14 C52,14 58,7 70,4 L70,40 L2,40 Z"
      fill="url(#growthFill)"
    />
    <path
      d="M2,32 C10,30 14,22 22,24 C30,26 36,14 44,14 C52,14 58,7 70,4"
      fill="none"
      stroke="#22C55E"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// Card wrapper with icon + uppercase title
const SectionCard = ({ icon: Icon, title, color, children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color || 'primary.main', 0.12),
            color: color || 'primary.main',
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{ fontSize: 14, letterSpacing: 0.4, textTransform: 'uppercase' }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
};

// Status chip with colored dot
const StatusChip = ({ status }) => {
  const theme = useTheme();
  const meta = STATUS_META[status] || { label: status || '—', color: 'default' };
  const c =
    meta.color === 'default' ? theme.palette.text.secondary : theme.palette[meta.color].main;
  return (
    <Chip
      size="small"
      icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} />}
      label={meta.label}
      sx={{
        bgcolor: alpha(c, 0.1),
        color: c,
        fontWeight: 700,
        fontSize: 11.5,
        '& .MuiChip-icon': { ml: 0.75, mr: -0.25 },
      }}
    />
  );
};

// Operational alert card — matches the reference layout: a tinted severity box with a
// solid circular icon + bold colored title, a bold dark value with muted sublabel, a
// secondary count stat line, and a chevron on the right. The efficiency-target alert
// shows a progress bar with a target marker and red variance line instead.
const AlertCard = ({ alert }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isTarget = alert.type === 'efficiency_target';

  const colorMap = {
    outstanding_fees: '#DC2626',
    settlements_pending: '#F97316',
    late_payment: '#D97706',
    efficiency_target: '#059669',
  };
  const iconMap = {
    outstanding_fees: ErrorOutline,
    settlements_pending: HourglassEmpty,
    late_payment: Schedule,
    efficiency_target: TrackChanges,
  };
  // Subtitle line (value label) per alert type — avoids repeating the footer text
  const subtitleMap = {
    outstanding_fees: 'Total Unpaid Balance',
    settlements_pending: 'Unsettled Transactions',
    late_payment: 'Overdue Amount',
    efficiency_target: 'Current Efficiency',
  };
  // Footer line: bold count + unit, then the trailing label
  const footerMap = {
    outstanding_fees: { unit: 'Students', label: 'Have outstanding fees' },
    settlements_pending: { unit: 'Transactions', label: 'Awaiting settlement' },
    late_payment: { unit: 'Students', label: 'Payments overdue' },
  };
  const color = colorMap[alert.type] || theme.palette.info.main;
  const Icon = iconMap[alert.type] || InfoOutlined;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.75,
        borderRadius: '14px',
        bgcolor: isDark ? alpha(color, 0.14) : alpha(color, 0.07),
        border: '1px solid',
        borderColor: isDark ? alpha(color, 0.32) : alpha(color, 0.16),
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          bgcolor: isDark ? alpha(color, 0.18) : alpha(color, 0.09),
          boxShadow: `0 6px 18px ${alpha(color, 0.16)}`,
        },
      }}
    >
      {/* Solid circular severity icon */}
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          bgcolor: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 10px ${alpha(color, 0.35)}`,
        }}
      >
        <Icon sx={{ fontSize: 19 }} />
      </Box>

      {/* Content: title / value / sublabel / secondary stat */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ color, fontSize: 13, lineHeight: 1.3 }}
        >
          {alert.title}
        </Typography>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ mt: 0.5, color: 'text.primary', fontSize: 21, lineHeight: 1.15 }}
        >
          {isTarget ? `${alert.percentage}%` : formatCurrency(alert.amount)}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {subtitleMap[alert.type] || alert.description}
        </Typography>

        {isTarget ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.primary">
              Target: {alert.target}%
            </Typography>
            <Box sx={{ position: 'relative', mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(alert.percentage, 100)}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: isDark ? 'rgba(255,255,255,0.14)' : alpha(color, 0.14),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 4,
                  },
                }}
              />
              {/* Dark target marker */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  height: 11,
                  width: 3,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(255,255,255,0.9)' : '#1F2937',
                  left: `calc(${Math.min(alert.target, 100)}% - 1.5px)`,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
            >
              {alert.variance}% to target
            </Typography>
          </Box>
        ) : (
          footerMap[alert.type] && (
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontSize: 13 }}>
                {alert.count} {footerMap[alert.type].unit}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                / {footerMap[alert.type].label}
              </Typography>
            </Box>
          )
        )}
      </Box>

      {/* Chevron */}
      <ChevronRight sx={{ color: alpha(color, 0.55), flexShrink: 0 }} />
    </Box>
  );
};

/**
 * ── Main dashboard ─────────────────────────────────────────────────
 */
const BursaryOfficerDashboard = () => {
  const theme = useTheme();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Session / term filtering
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionTermsLoaded, setSessionTermsLoaded] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [sessionTermId, setSessionTermId] = useState('');

  // Class matrix status filter
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch session terms for the selectors
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSessionTerms();
        if (res?.status) setSessionTerms(res.data || []);
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      } finally {
        setSessionTermsLoaded(true);
      }
    };
    load();
  }, []);

  // Default to the first session/term once terms arrive
  useEffect(() => {
    if (!sessionTerms.length || selectedSession) return;
    const first = sessionTerms[0];
    setSelectedSession(first.session?.sesname || '');
    setSelectedTerm(first.display_term?.display_name || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionTerms]);

  // Derive the session_term_id from the two selectors
  useEffect(() => {
    if (!sessionTerms.length) return;
    const match = sessionTerms.find(
      (s) =>
        s.session?.sesname === selectedSession && s.display_term?.display_name === selectedTerm,
    );
    setSessionTermId(match ? String(match.id) : '');
  }, [sessionTerms, selectedSession, selectedTerm]);

  const sessions = useMemo(
    () => [...new Set(sessionTerms.map((s) => s.session?.sesname).filter(Boolean))],
    [sessionTerms],
  );

  const termsForSession = useMemo(
    () =>
      sessionTerms
        .filter((s) => s.session?.sesname === selectedSession)
        .map((s) => s.display_term?.display_name)
        .filter(Boolean),
    [sessionTerms, selectedSession],
  );

  // Fetch stats whenever a term is selected (skip until terms resolve)
  useEffect(() => {
    if (!sessionTermsLoaded) return;

    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const params = sessionTermId ? { session_term_id: sessionTermId } : {};
        const response = await tenantApi.get('/dashboard/bursary/stats', { params });

        if (response.data.status) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        notify.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [sessionTermId, sessionTermsLoaded, notify]);

  const dataAsOf = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading || !dashboardData) {
    return (
      <PageContainer title="Bursary Dashboard" description="Overview of revenue performance and collections">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  const {
    revenue_performance: rp = {},
    fee_intelligence = [],
    revenue_distribution = [],
    payment_categories = [],
    operational_alerts = [],
    class_level_collection_matrix: matrix = [],
  } = dashboardData;

  const filteredMatrix =
    statusFilter === 'all' ? matrix : matrix.filter((r) => r.status === statusFilter);

  const totals = filteredMatrix.reduce(
    (acc, row) => ({
      expected: acc.expected + (row.expected_fees || 0),
      collected: acc.collected + (row.collected_fees || 0),
      outstanding: acc.outstanding + (row.outstanding_fees || 0),
    }),
    { expected: 0, collected: 0, outstanding: 0 },
  );
  const totalEfficiency = totals.expected
    ? ((totals.collected / totals.expected) * 100).toFixed(1)
    : '0.0';

  const totalRevenue = revenue_distribution.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleExport = () => {
    const rows = [
      ['Class', 'Expected Fees (₦)', 'Collected Fees (₦)', 'Outstanding Fees (₦)', 'Efficiency (%)', 'Status'],
      ...filteredMatrix.map((r) => [
        r.class,
        r.expected_fees,
        r.collected_fees,
        r.outstanding_fees,
        r.efficiency,
        r.status,
      ]),
      ['Total', totals.expected, totals.collected, totals.outstanding, totalEfficiency, ''],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bursary-collection-matrix-${(selectedSession || 'all').replace(/[\\/]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify.success('Report exported successfully');
  };

  const feeIcons = [Description, TaskAlt, Grade];
  const feeColors = [
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];
  const catColors = [
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
  ];
  const catIcons = [Groups, Groups, Groups, Groups];

  return (
    <PageContainer title="Bursary Dashboard" description="Overview of revenue performance and collections">
      {/* ── Header ─────────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Bursary Officer Dashboard
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
            Overview of revenue performance and collections
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
            <Event sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Data as of {dataAsOf}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          {/* Session */}
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value);
                const firstTerm = sessionTerms.find((s) => s.session?.sesname === e.target.value)
                  ?.display_term?.display_name;
                setSelectedTerm(firstTerm || '');
              }}
              displayEmpty
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                fontWeight: 600,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
              }}
            >
              {sessions.length === 0 && <MenuItem value="">All Sessions</MenuItem>}
              {sessions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Term */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              displayEmpty
              renderValue={(v) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {v && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                  )}
                  <Typography variant="body2" fontWeight={600}>
                    {v || 'Select Term'}
                  </Typography>
                </Box>
              )}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
              }}
            >
              {termsForSession.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              borderRadius: 2,
              borderColor: theme.palette.divider,
              color: 'text.primary',
              fontWeight: 600,
              '&:hover': { borderColor: 'text.secondary' },
            }}
          >
            Export Report
          </Button>

          <Button
            variant="contained"
            startIcon={<FilterAlt />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Filter
          </Button>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            {[
              { value: 'all', label: 'All Classes' },
              { value: 'excellent', label: 'Excellent' },
              { value: 'pending', label: 'Pending' },
              { value: 'poor', label: 'Poor' },
            ].map((opt) => (
              <MenuItem
                key={opt.value}
                selected={statusFilter === opt.value}
                onClick={() => {
                  setStatusFilter(opt.value);
                  setFilterAnchor(null);
                }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <Grid container columns={10} spacing={2} mb={3}>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Total Expected Income"
            value={formatCurrency(rp.total_expected_income)}
            sublabel="Projected for term"
            icon={ReceiptLong}
            colorName="info"
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Total Collected Income"
            value={formatCurrency(rp.total_collected_income)}
            sublabel="Actual collected"
            icon={AccountBalanceWallet}
            colorName="success"
            trend={rp.revenue_growth}
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Total Outstanding Balance"
            value={formatCurrency(rp.total_outstanding_balance)}
            sublabel="Remaining unpaid"
            icon={ErrorOutline}
            colorName="warning"
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Collection Efficiency"
            value={`${rp.collection_efficiency}%`}
            sublabel="Collected vs Expected"
            colorName="primary"
            rightElement={<EfficiencyRing value={rp.collection_efficiency} />}
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Revenue Growth"
            value={`+${rp.revenue_growth}%`}
            sublabel="vs 1st Term"
            colorName="success"
            rightElement={<GrowthSparkline />}
          />
        </Grid>
      </Grid>

      {/* ── Fee Intelligence, Revenue Distribution, Payment Categories ─── */}
      <Grid container spacing={3} mb={3}>
        {/* Fee Intelligence */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <SectionCard icon={Insights} title="Fee Intelligence" color={theme.palette.info.main}>
            <Stack spacing={2}>
              {fee_intelligence.map((fee, i) => {
                const Icon = feeIcons[i % feeIcons.length];
                return (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(feeColors[i % feeColors.length], 0.12),
                          color: feeColors[i % feeColors.length],
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
                        {fee.name}
                      </Typography>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800} whiteSpace="nowrap">
                          {formatCurrency(fee.collected)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {fee.label}
                        </Typography>
                      </Box>
                    </Box>
                    {i < fee_intelligence.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>

        {/* Revenue Distribution */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <SectionCard
            icon={PieChartOutline}
            title="Revenue Distribution"
            color={theme.palette.primary.main}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Box sx={{ position: 'relative', width: 150, height: 150, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={revenue_distribution}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={70}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {revenue_distribution.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(value) => formatCurrency(value)} />
                  </RePieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 14 }}>
                    {formatCompact(totalRevenue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Collected
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                {revenue_distribution.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: COLORS[i % COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}>
                      {item.category}
                    </Typography>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} whiteSpace="nowrap">
                        {item.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </SectionCard>
        </Grid>

        {/* Payment Categories */}
        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
          <SectionCard
            icon={Groups}
            title="Payment Categories"
            color={theme.palette.secondary.main}
          >
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {payment_categories.map((cat, i) => {
                const CatIcon = catIcons[i % catIcons.length];
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(catColors[i % catColors.length], 0.12),
                        color: catColors[i % catColors.length],
                        fontSize: 14,
                      }}
                    >
                      <CatIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
                      {cat.category}
                    </Typography>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} whiteSpace="nowrap">
                        {formatCurrency(cat.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {cat.percentage}% of total
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Class-Level Collection Matrix + Operational Alerts ─────── */}
      <Grid container spacing={3}>
        {/* Class-Level Collection Matrix */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: '1px solid',
              borderColor: theme.palette.divider,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {/* Banner */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: '#fff',
              }}
            >
              <TableChart sx={{ fontSize: 22 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 14, letterSpacing: 0.4 }}>
                Class-Level Collection Matrix
              </Typography>
              {statusFilter !== 'all' && (
                <Chip
                  size="small"
                  label={`Filtered: ${STATUS_META[statusFilter]?.label || statusFilter}`}
                  sx={{
                    ml: 'auto',
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>

            <TableContainer sx={{ flexGrow: 1 }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: 12.5 }}>Class</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12.5 }}>
                      Expected Fees (₦)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12.5 }}>
                      Collected Fees (₦)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12.5 }}>
                      Outstanding Fees (₦)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: 12.5, minWidth: 140 }}>
                      Efficiency (%)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, fontSize: 12.5 }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMatrix.map((row, index) => {
                    const statusColor =
                      STATUS_META[row.status]?.color === 'success'
                        ? theme.palette.success.main
                        : STATUS_META[row.status]?.color === 'warning'
                          ? theme.palette.warning.main
                          : theme.palette.error.main;
                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{ cursor: 'pointer', '&:last-of-type td': { borderBottom: 'none' } }}
                        onClick={() =>
                          notify.info(`Detailed breakdown for ${row.class} is coming soon`)
                        }
                      >
                        <TableCell>
                          <Chip
                            label={row.class}
                            size="small"
                            sx={{
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? theme.palette.grey[800]
                                  : theme.palette.grey[100],
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(row.expected_fees)}</TableCell>
                        <TableCell align="right">
                          <Typography color="success.main" fontWeight={700}>
                            {formatCurrency(row.collected_fees)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="error.main" fontWeight={700}>
                            {formatCurrency(row.outstanding_fees)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Box sx={{ width: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(row.efficiency, 100)}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: alpha(statusColor, 0.15),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: statusColor,
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight={700} sx={{ width: 40 }}>
                              {row.efficiency}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <StatusChip status={row.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Totals row */}
                  <TableRow
                    sx={{
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                      '& td': { borderTop: `2px solid ${theme.palette.divider}` },
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={800}>
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={800}>
                        {formatCurrency(totals.expected)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={800} color="success.main">
                        {formatCurrency(totals.collected)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={800} color="error.main">
                        {formatCurrency(totals.outstanding)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={800}>
                        {totalEfficiency}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={totalEfficiency >= 75 ? 'excellent' : totalEfficiency >= 60 ? 'pending' : 'poor'} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              }}
            >
              <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Click on any class row to view a detailed breakdown of students and transactions.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Operational Alerts sidebar - spans alongside matrix */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <SectionCard
            icon={NotificationsActive}
            title="Operational Alerts"
            color={theme.palette.error.main}
            sx={{ height: '100%' }}
          >
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {operational_alerts.map((alert, i) => (
                <AlertCard key={i} alert={alert} />
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

    </PageContainer>
  );
};

export default BursaryOfficerDashboard;
