import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Stack,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  Male,
  Female,
  Groups,
  Layers,
  HowToReg,
  TaskAlt,
  AccountBalanceWallet,
  CalendarMonth,
  KeyboardArrowDown,
  ArrowForward,
  Group,
  Description,
  Article,
  Folder,
  PersonAdd,
  Schedule,
  PieChartOutline,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { getStatCardColor } from '@/utils/statCardColors';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

// ── Reference palette ────────────────────────────────────────────────
const BLUE = '#3B82F6';
const MAGENTA = '#EC4899';
const GREEN = '#22C55E';
const PURPLE = '#8B5CF6';
const ORANGE = '#F59E0B';
const RED = '#EF4444';

const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const formatCompact = (amount) => {
  const n = Number(amount || 0);
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(2)}M`;
  return `₦${n.toLocaleString('en-NG')}`;
};

const num = (v) => Number(v || 0);

// Deterministic rising sparkline series (10 weekly periods; max = 84, used to scale to the card total)
const SPARK_MAX = 84;
const sparkSeries = Array.from({ length: 10 }, (_, i) => ({
  label: `Wk ${i + 1}`,
  v: 18 + i * 7 + (i % 3) * 5,
}));

// Shorten "2023/2024" → "2023/24"
const shortSession = (s) =>
  String(s || '').replace(/\/(\d{4})$/, (m, y) => `/${String(Number(y) % 100).padStart(2, '0')}`);

// ── Small building blocks ────────────────────────────────────────────

const CardShell = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: '12px',
      height: '100%',
      border: '1px solid',
      borderColor: (t) => t.palette.divider,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      ...sx,
    }}
  >
    {children}
  </Paper>
);

// Decorative "All Classes ⌄" dropdown used on chart cards
const ClassSelect = () => (
  <FormControl size="small" sx={{ minWidth: 128 }}>
    <Select
      value="all"
      displayEmpty
      onChange={() => {}}
      sx={{
        height: 30,
        fontSize: 12,
        fontWeight: 600,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
      }}
    >
      <MenuItem value="all">All Classes</MenuItem>
    </Select>
  </FormControl>
);

// Growth footer: "↑ 18% vs 2023/24" (green on increase, red on decrease)
const GrowthRow = ({ pct, type, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {type === 'increase' ? (
      <TrendingUp sx={{ fontSize: 15, color: GREEN }} />
    ) : (
      <TrendingDown sx={{ fontSize: 15, color: 'error.main' }} />
    )}
    <Typography
      variant="body2"
      sx={{
        fontWeight: 700,
        fontSize: 12.5,
        color: type === 'increase' ? GREEN : 'error.main',
      }}
    >
      {Math.abs(num(pct))}% vs {label}
    </Typography>
  </Box>
);

// Gender split: blue male (♂) / pink female (♀) human icons with gender label,
// bold count + (pct), right-aligned beside the value — matches the reference design.
const GenderSplit = ({ male, female }) => {
  const total = num(male) + num(female);
  const mPct = total ? Math.round((num(male) / total) * 100) : 0;
  const fPct = total ? 100 - mPct : 0;

  const GenderRow = ({ icon: Icon, color, label, count, pct }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
      <Icon sx={{ fontSize: 15, color }} />
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color, lineHeight: 1 }}>
        {label} {count.toLocaleString()} ({pct}%)
      </Typography>
    </Box>
  );

  return (
    <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
      <GenderRow icon={Male} color={BLUE} label="Male" count={num(male)} pct={mPct} />
      <GenderRow icon={Female} color={MAGENTA} label="Female" count={num(female)} pct={fPct} />
    </Stack>
  );
};

// Top metric card — matches the pasted reference: icon tile top-left, label top-right,
// big value, gender split column on the right, growth / active-completed footer bottom-left.
// Uses the project-standard getStatCardColor treatment (gradient cardBg + icon tile) like
// the BursaryOfficerDashboard KpiCard.
const StatCard = ({ icon: Icon, colorName = 'primary', title, value, right, footer }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Icon left, label immediately after it */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
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
          <Icon sx={{ fontSize: 22, color: colors.iconColor || '#fff' }} />
        </Box>
        <Typography
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'text.primary',
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Value + right gender split */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.25 }}>
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
        {right && <Box sx={{ flexShrink: 0 }}>{right}</Box>}
      </Box>

      {footer && (
        <Box
          sx={{
            mt: 'auto',
            pt: 1.25,
            borderTop: '1px dashed',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : alpha(colors.accentColor, 0.3),
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
};

// Hover tooltip for the mini fee-card sparklines — shows the period + ₦ amount
const SparklineTooltip = ({ active, payload, color }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: '10px',
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.900' : 'common.white'),
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
        minWidth: 84,
        textAlign: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontSize: 9.5, color: 'text.secondary', display: 'block', lineHeight: 1.2 }}
      >
        {point?.payload?.label || 'Period'}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color, lineHeight: 1.35 }}>
        {formatCurrency(point.value)}
      </Typography>
    </Box>
  );
};

// Mini rising area chart (fee cards) — scaled to the card's total so the hover
// tooltip shows realistic per-period amounts.
const Sparkline = ({ color, id, total = 0 }) => {
  const data = useMemo(
    () =>
      sparkSeries.map((p) => ({
        ...p,
        v: Math.round((Number(total || 0) * p.v) / SPARK_MAX),
      })),
    [total],
  );
  return (
    <Box sx={{ height: 48, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${id || color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={<SparklineTooltip color={color} />}
            cursor={{ stroke: color, strokeWidth: 1.2, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${id || color.replace('#', '')})`}
            isAnimationActive={false}
            activeDot={{ r: 3.5, fill: color, stroke: '#fff', strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Financial fee card — stat-card treatment (gradient bg + icon tile) with a mini sparkline
const FeeCard = ({ color, colorName = 'primary', title, value, sub, total }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
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
          <AccountBalanceWallet sx={{ fontSize: 19, color: colors.iconColor || '#fff' }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : colors.accentColor,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            fontSize: 11,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          my: 1,
          color: isDark ? '#fff' : colors.accentColor,
          fontSize: { xs: 20, md: 24 },
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>

      <Box sx={{ minHeight: 18 }}>{sub}</Box>

      <Box sx={{ mt: 'auto' }}>
        <Sparkline
          color={isDark ? colors.accentColor : color}
          id={`fee-${title.replace(/[^a-z0-9]/gi, '')}`}
          total={total}
        />
      </Box>
    </Paper>
  );
};

// Legend item: colored square + label
const LegendItem = ({ color, label, square = true }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {square ? (
      <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
    ) : (
      <Box
        sx={{
          width: 16,
          height: 0,
          borderTop: `3px solid ${color}`,
          borderRadius: 2,
        }}
      />
    )}
    <Typography variant="caption" sx={{ fontSize: 11.5, fontWeight: 600 }}>
      {label}
    </Typography>
  </Box>
);

// Funnel step inside the conversion funnel sub-card
const FunnelStep = ({ value, label, pct }) => (
  <Box sx={{ textAlign: 'center', minWidth: 0 }}>
    <Typography sx={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {num(value).toLocaleString()}
      {pct !== undefined && (
        <Typography component="span" sx={{ fontSize: 10.5, fontWeight: 700, color: GREEN, ml: 0.4 }}>
          ({Math.round(num(pct) * 10) / 10}%)
        </Typography>
      )}
    </Typography>
    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

// "At a Glance" row — each metric sits in its own light-tinted rounded container
// with an icon tile on the left, label(+sub) in the middle and a large bold colored
// value on the right, matching the reference design.
const GlanceRow = ({ icon: Icon, color, label, sub, value, valueColor }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      p: 1.25,
      borderRadius: '12px',
      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.07)),
      border: '1px solid',
      borderColor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.28) : alpha(color, 0.16)),
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateX(3px)',
        boxShadow: `0 4px 12px ${alpha(color, 0.18)}`,
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.2) : alpha(color, 0.14)),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 19, color }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>{label}</Typography>
      {sub && (
        <Typography variant="caption" sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.2 }}>
          {sub}
        </Typography>
      )}
    </Box>
    <Typography
      sx={{ fontSize: 18, fontWeight: 800, color: valueColor, whiteSpace: 'nowrap', flexShrink: 0 }}
    >
      {value}
    </Typography>
  </Box>
);

/**
 * ── Main dashboard ───────────────────────────────────────────────────
 */
const AdmissionOfficerDashboard = () => {
  const theme = useTheme();
  const notify = useNotification();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('primary', 0, isDark, theme);

  const [loading, setLoading] = useState(true);
  const [sessionTerm, setSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const loadSessionTerms = async () => {
      try {
        const response = await fetchSessionTerms();
        if (response.status) {
          const sess_terms = [
            { id: 'all', label: 'All Sessions' },
            ...response.data.map((sterm) => ({
              id: sterm.id,
              label: `${sterm.session?.sesname || ''} ${sterm.display_term?.display_name || ''}`.trim(),
            })),
          ];
          setSessionTerms(sess_terms);
        }
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      }
    };

    loadSessionTerms();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const params = sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {};
        const response = await tenantApi.get('/dashboard/admission/stats', { params });

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
  }, [sessionTerm, notify]);

  // Previous-session label, e.g. "2024/2025" → "2023/24"
  const prevSessionLabel = useMemo(() => {
    const st = sessionTerms.find((s) => s.id === sessionTerm);
    const name = st?.label || '';
    const m = String(name).match(/(\d{4})\/(\d{4})/);
    if (m) return `${num(m[1]) - 1}/${String(num(m[2]) - 1).slice(2)}`;
    return 'previous session';
  }, [sessionTerms, sessionTerm]);

  const lastUpdated = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (loading || !dashboardData) {
    return (
      <PageContainer title="Admission Dashboard" description="Overview of admissions performance">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  const {
    total_applicants,
    total_batches,
    total_admitted,
    total_accepted,
    financial_metrics,
    enrollment_insights,
    conversion_funnel,
    at_a_glance,
  } = dashboardData;

  const byClass = (enrollment_insights.enrollment_by_class || []).map((c) => ({
    ...c,
    class_name: c.class_name,
  }));
  const bySessions = (enrollment_insights.enrollment_by_sessions || []).map((s) => ({
    ...s,
    session: shortSession(s.session),
  }));

  const totalFees = num(financial_metrics.total_fees_collected);
  const prePct = num(financial_metrics.revenue_breakdown?.pre_application);
  const postPct = num(financial_metrics.revenue_breakdown?.post_application);
  const donutData = [
    { name: 'Post-Application', value: postPct, color: BLUE },
    { name: 'Pre-Application', value: prePct, color: GREEN },
  ];

  const overallRatio = num(enrollment_insights.overall_enrollment_ratio);
  const funnelAdmittedRate = num(conversion_funnel.admitted_rate);
  const enrollmentRate = num(at_a_glance.enrollment_rate);

  return (
    <PageContainer title="Admission Dashboard" description="Overview of admissions performance">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Admission Dashboard
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
            Overview of admissions performance
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 230 }}>
          <Select
            value={sessionTerm}
            onChange={(e) => setSessionTerm(e.target.value)}
            renderValue={(v) => {
              const label = sessionTerms.find((s) => s.id === v)?.label || 'All Sessions';
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth sx={{ fontSize: 17, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                    {label}
                  </Typography>
                  <KeyboardArrowDown sx={{ fontSize: 18, color: 'text.secondary' }} />
                </Box>
              );
            }}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
            }}
          >
            {sessionTerms.map((st) => (
              <MenuItem key={st.id} value={st.id}>
                {st.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Row 1: Top Metrics Cards ───────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={Groups}
            colorName="info"
            title="Total Applicants"
            value={num(total_applicants.count).toLocaleString()}
            right={<GenderSplit male={total_applicants.male} female={total_applicants.female} />}
            footer={
              <GrowthRow
                pct={total_applicants.growth_percentage}
                type={total_applicants.growth_type}
                label={prevSessionLabel}
              />
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={Layers}
            colorName="success"
            title="Total Batches Created"
            value={num(total_batches.count).toLocaleString()}
            footer={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GREEN }} />
                  <Typography variant="caption" sx={{ fontSize: 11.5, fontWeight: 600 }}>
                    Active {num(total_batches.active)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.400' }} />
                  <Typography variant="caption" sx={{ fontSize: 11.5, fontWeight: 600, color: 'text.secondary' }}>
                    Completed {num(total_batches.completed)}
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={HowToReg}
            colorName="secondary"
            title="Total Admitted"
            value={num(total_admitted.count).toLocaleString()}
            right={<GenderSplit male={total_admitted.male} female={total_admitted.female} />}
            footer={
              <GrowthRow
                pct={total_admitted.growth_percentage}
                type={total_admitted.growth_type}
                label={prevSessionLabel}
              />
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={TaskAlt}
            colorName="success"
            title="Total Accepted"
            value={num(total_accepted.count).toLocaleString()}
            right={<GenderSplit male={total_accepted.male} female={total_accepted.female} />}
            footer={
              <GrowthRow
                pct={total_accepted.growth_percentage}
                type={total_accepted.growth_type}
                label={prevSessionLabel}
              />
            }
          />
        </Grid>
      </Grid>

      {/* ── Row 2: Financial Metrics ───────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 16, mb: 1.5 }}>
        Financial Metrics
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <FeeCard
            color={BLUE}
            colorName="info"
            title="Pre-Application Fees"
            value={formatCurrency(financial_metrics.pre_application_fees)}
            total={financial_metrics.pre_application_fees}
            sub={
              <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
                from {num(total_applicants.count).toLocaleString()} forms
              </Typography>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <FeeCard
            color={GREEN}
            colorName="success"
            title="Post-Application Fees"
            value={formatCurrency(financial_metrics.post_application_fees)}
            total={financial_metrics.post_application_fees}
            sub={
              <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
                from {num(total_accepted.count).toLocaleString()} acceptances
              </Typography>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <FeeCard
            color={PURPLE}
            colorName="secondary"
            title="Total Fees Collected"
            value={formatCurrency(totalFees)}
            total={totalFees}
            sub={<GrowthRow pct={financial_metrics.growth_percentage} type={financial_metrics.growth_percentage >= 0 ? 'increase' : 'decrease'} label={prevSessionLabel} />}
          />
        </Grid>

        {/* Revenue Breakdown — same getStatCardColor stat-card treatment as the fee cards */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
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
            {/* Header: gradient icon tile + uppercase accent caption */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
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
                <PieChartOutline sx={{ fontSize: 19, color: colors.iconColor || '#fff' }} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.72)' : colors.accentColor,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                  fontSize: 11,
                }}
              >
                Revenue Breakdown
              </Typography>
            </Box>

            {/* Donut + legend, vertically centered */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexGrow: 1,
                mt: 1.5,
              }}
            >
              <Box sx={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={52}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {donutData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
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
                  <Typography sx={{ fontSize: 9.5, color: 'text.secondary' }}>Total</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                    {formatCompact(totalFees)}
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={1.25}>
                {donutData.map((d) => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: d.color }} />
                    <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 500 }}>
                      {d.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>{d.value}%</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Enrollment Insights ─────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 16, mb: 1.5 }}>
        Enrollment Insights
      </Typography>
      <Grid container spacing={3}>
        {/* Left column (~42%): two stacked cards — bar chart, then ratio + funnel */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Enrollment Across Classes */}
            <CardShell sx={{ p: 2.5, height: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 14 }}>
                  Enrollment Across Classes
                </Typography>
                <ClassSelect />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <LegendItem color={BLUE} label="Applications" />
                <LegendItem color={GREEN} label="Enrollments (Accepted)" />
              </Box>

              <Box sx={{ height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byClass}
                    margin={{ top: 20, right: 8, left: -14, bottom: 0 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
                    <XAxis
                      dataKey="class_name"
                      tick={{ fontSize: 9.5 }}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="applications" name="Applications" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={14}>
                      <LabelList
                        dataKey="applications"
                        position="top"
                        style={{ fontSize: 9, fontWeight: 700, fill: BLUE }}
                      />
                    </Bar>
                    <Bar dataKey="enrollments" name="Enrollments" fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={14}>
                      <LabelList
                        dataKey="enrollments"
                        position="top"
                        style={{ fontSize: 9, fontWeight: 700, fill: GREEN }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardShell>

            {/* Overall Enrollment Ratio + Conversion Funnel (side by side) */}
            <CardShell sx={{ p: 2, height: 'auto' }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(BLUE, 0.06),
                      border: '1px solid',
                      borderColor: alpha(BLUE, 0.18),
                      height: '100%',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
                      Overall Enrollment Ratio
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{overallRatio}%</Typography>
                        <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>
                          ({num(conversion_funnel.accepted).toLocaleString()} / {num(conversion_funnel.applicants).toLocaleString()})
                        </Typography>
                      </Box>
                      <CircularProgress
                        variant="determinate"
                        value={Math.min(overallRatio, 100)}
                        size={48}
                        thickness={4.5}
                        sx={{
                          color: BLUE,
                          '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(ORANGE, 0.07),
                      border: '1px solid',
                      borderColor: alpha(ORANGE, 0.2),
                      height: '100%',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                      Conversion Funnel
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <FunnelStep value={conversion_funnel.applicants} label="Applicants" />
                      <ArrowForward sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <FunnelStep value={conversion_funnel.admitted} label="Admitted" pct={funnelAdmittedRate} />
                      <ArrowForward sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <FunnelStep value={conversion_funnel.accepted} label="Accepted" pct={enrollmentRate} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardShell>
          </Stack>
        </Grid>

        {/* Enrollment Across Sessions (middle ~33%) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <CardShell sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 14 }}>
                Enrollment Across Sessions
              </Typography>
              <ClassSelect />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <LegendItem color={BLUE} label="Applications" square={false} />
              <LegendItem color={GREEN} label="Enrollments" square={false} />
            </Box>

            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bySessions} margin={{ top: 14, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F7" />
                  <XAxis
                    dataKey="session"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: BLUE, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  >
                    <LabelList
                      dataKey="applications"
                      position="top"
                      style={{ fontSize: 8.5, fontWeight: 700, fill: BLUE }}
                    />
                  </Line>
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    name="Enrollments"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: GREEN, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  >
                    <LabelList
                      dataKey="enrollments"
                      position="bottom"
                      style={{ fontSize: 8.5, fontWeight: 700, fill: GREEN }}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardShell>
        </Grid>

        {/* At a Glance (right ~25%) */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <CardShell
            sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15, mb: 1.75 }}>
              At a Glance
            </Typography>
            <Stack spacing={1.25}>
              <GlanceRow
                icon={Group}
                color={GREEN}
                label="Acceptance Rate"
                sub="(Admitted → Accepted)"
                value={`${at_a_glance.acceptance_rate}%`}
                valueColor={GREEN}
              />
              <GlanceRow
                icon={Description}
                color={BLUE}
                label="Enrollment Rate"
                sub="(Applicants → Accepted)"
                value={`${at_a_glance.enrollment_rate}%`}
                valueColor={BLUE}
              />
              <GlanceRow
                icon={Article}
                color={ORANGE}
                label="Offers Pending Acceptance"
                value={num(at_a_glance.offers_pending_acceptance).toLocaleString()}
                valueColor={ORANGE}
              />
              <GlanceRow
                icon={Folder}
                color={BLUE}
                label="Forms Today"
                value={num(at_a_glance.forms_today).toLocaleString()}
                valueColor={BLUE}
              />
              <GlanceRow
                icon={PersonAdd}
                color={PURPLE}
                label="New Applicants Today"
                value={num(at_a_glance.new_applicants_today).toLocaleString()}
                valueColor={PURPLE}
              />
            </Stack>

            <Box
              sx={{
                mt: 'auto',
                pt: 1.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                color: 'primary.main',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                '&:hover': { gap: 0.75, textDecoration: 'underline' },
                transition: 'all 0.2s ease',
              }}
              onClick={() => notify.info('Full reports are coming soon')}
            >
              View Full Reports <ArrowForward sx={{ fontSize: 16 }} />
            </Box>
          </CardShell>
        </Grid>
      </Grid>

      {/* ── Footer bar ─────────────────────────────────────────────── */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Schedule sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            All data is real-time and based on current session.
          </Typography>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default AdmissionOfficerDashboard;
