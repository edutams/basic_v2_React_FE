import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Skeleton,
  InputAdornment,
  useTheme,
} from '@mui/material';
import Chart from 'react-apexcharts';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { IconFilter } from '@tabler/icons-react';
import resultOverviewApi from '@/api/tenant/result-overview/resultOverviewApi';
import {
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';
import { fetchSessions } from '@/api/tenant/curriculum/tenantCurriculumApi';

const SCHEME = {
  blue: { bg: '#EEF2FF', iconColor: '#2563EB' },
  green: { bg: '#DCFCE7', iconColor: '#16A34A' },
  purple: { bg: '#F3E8FF', iconColor: '#9333EA' },
  orange: { bg: '#FFEDD5', iconColor: '#EA580C' },
  red: { bg: '#FEE2E2', iconColor: '#DC2626' },
};

const getHeatCellStyle = (score) => {
  if (score === null || score === undefined) return { bg: '#f1f5f9', color: '#94a3b8' };
  if (score >= 80) return { bg: '#bbf7d0', color: '#166534' };
  if (score >= 75) return { bg: '#d9f99d', color: '#3f6212' };
  if (score >= 70) return { bg: '#fef08a', color: '#854d0e' };
  if (score >= 65) return { bg: '#fed7aa', color: '#9a3412' };
  return { bg: '#fecaca', color: '#991b1b' };
};

const cardSx = {
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  bgcolor: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  p: 1.75,
  height: '100%',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
};

const panelTitleSx = { fontWeight: 800, fontSize: 13, color: '#0f172a' };

const MiniSelect = ({ value, onChange, options }) => (
  <TextField
    select
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    sx={{
      minWidth: 92,
      '& .MuiInputBase-input': { fontSize: 10, fontWeight: 700, py: 0.5 },
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
    }}
  >
    {options.map((o) => (
      <MenuItem key={o} value={o} sx={{ fontSize: 11.5 }}>
        {o}
      </MenuItem>
    ))}
  </TextField>
);

// Multi-select pill row — toggles which lines/segments a chart shows.
const TabChip = ({ label, active, color = '#2563eb', onClick, count }) => (
  <Box
    onClick={onClick}
    sx={{
      px: 1.1,
      py: 0.45,
      borderRadius: '999px',
      fontSize: 10.5,
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      bgcolor: active ? color : '#f1f5f9',
      color: active ? '#fff' : '#475569',
      transition: 'all 120ms ease',
    }}
  >
    {label}
    {count !== undefined ? ` (${count})` : ''}
  </Box>
);

const StatCard = ({ label, value, subPercent, delta, deltaUp, icon: Icon, scheme }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = SCHEME[scheme];
  const trendColor = deltaUp ? '#16A34A' : '#DC2626';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: subPercent ? 1 : 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : colors.bg,
            color: isDark ? '#fff' : colors.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 24 },
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.55)' : '#94a3b8',
              lineHeight: 1.3,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>

      {subPercent && (
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.iconColor, mb: 1 }}>
          {subPercent} of total
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.25,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        }}
      >
        {delta !== null && delta !== undefined ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {deltaUp ? (
                <ArrowUpwardIcon sx={{ fontSize: 14, color: trendColor }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 14, color: trendColor }} />
              )}
              <Typography fontWeight={700} sx={{ fontSize: 11.5, color: trendColor }}>
                {Math.abs(delta)}%
              </Typography>
            </Box>
            <Typography
              fontWeight={500}
              sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}
            >
              vs compare period
            </Typography>
          </>
        ) : (
          <Typography
            fontWeight={500}
            sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}
          >
            No comparison data to previous term
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const StatCardSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Skeleton
          variant="rounded"
          width={48}
          height={48}
          sx={{ borderRadius: '12px', flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="80%" height={16} />
        </Box>
      </Box>
      <Box
        sx={{
          pt: 1.25,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        }}
      >
        <Skeleton variant="text" width="50%" height={14} />
      </Box>
    </Paper>
  );
};

const PositionBadge = ({ rank }) => {
  const medalColors = { 1: '#f59e0b', 2: '#94a3b8', 3: '#b45309' };
  if (rank > 3) {
    return (
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>{rank}</Typography>
    );
  }
  return <EmojiEventsIcon sx={{ fontSize: 18, color: medalColors[rank] }} />;
};

const GenderDonut = ({ data, label, color, metric }) => {
  const value =
    metric === 'Pass Rate'
      ? data.pass_rate
      : metric === 'Distinction Rate'
        ? data.distinction_rate
        : data.average_score;

  return (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Box sx={{ width: 108, height: 108, mx: 'auto' }}>
        <Chart
          key={metric}
          type="radialBar"
          width={108}
          height={108}
          series={[value ?? 0]}
          options={{
            chart: { sparkline: { enabled: true } },
            colors: [color],
            plotOptions: {
              radialBar: {
                hollow: { size: '62%' },
                track: { background: '#f1f5f9' },
                dataLabels: {
                  name: { show: false },
                  value: {
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a',
                    offsetY: 5,
                    formatter: (v) => `${v}%`,
                  },
                },
              },
            },
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 10, color: '#94a3b8', mb: 0.75 }}>
        {data.students} students
      </Typography>
      <Stack spacing={0.3}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 9.5, color: '#64748b' }}>Average Score</Typography>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>
            {data.average_score ?? '—'}%
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: 9.5, color: '#64748b' }}>Distinction Rate</Typography>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>
            {data.distinction_rate ?? '—'}%
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

const insightIcon = (type) => {
  if (type === 'warning')
    return { Icon: WarningAmberOutlinedIcon, bg: '#FEE2E2', color: '#DC2626' };
  if (type === 'negative')
    return { Icon: TrendingDownOutlinedIcon, bg: '#FEE2E2', color: '#DC2626' };
  return { Icon: TrendingUpOutlinedIcon, bg: '#DCFCE7', color: '#16A34A' };
};

const ResultOverviewTab = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [sessionTermId, setSessionTermId] = useState('');
  const [classId, setClassId] = useState('');
  const [compareWith, setCompareWith] = useState('previous_term');
  const [classOptions, setClassOptions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce the search box — it drives a client-side filter re-render on
  // every keystroke otherwise, which is wasted work while the user is still
  // typing a name.
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [heatmapView, setHeatmapView] = useState('Average Score');
  const [genderMetric, setGenderMetric] = useState('Average Score');
  const [attentionTab, setAttentionTab] = useState('all');
  const [activeTrendMetrics, setActiveTrendMetrics] = useState(
    () => new Set(['pass_rate', 'average_score']),
  );

  const [drilldown, setDrilldown] = useState({
    open: false,
    loading: false,
    title: '',
    data: null,
  });

  // ── Initial dropdowns + default to the school's active session/term ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [sessRes, activeRes, classesRes] = await Promise.all([
          fetchSessions(),
          fetchActiveTenantSessionTerm(),
          resultOverviewApi.getClasses(),
        ]);
        if (cancelled) return;

        const sessionList = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        setSessions(sessionList);
        const classList = (classesRes?.data?.data ?? []).map((c) => ({ id: c.id, name: c.class_name }));
        setClassOptions(classList);
        setClassId(classList[0]?.id ?? '');

        const active = activeRes?.status ? activeRes.data : null;
        const defaultSessionId = active?.session_id || sessionList[0]?.id || '';
        setSessionId(defaultSessionId);

        if (defaultSessionId) {
          const stRes = await fetchSessionTerms(defaultSessionId);
          if (cancelled) return;
          const terms = stRes?.data ?? [];
          setSessionTerms(terms);

          const defaultTermId =
            active?.session_term_id ||
            terms.find((t) => t.status === 'active')?.id ||
            terms[0]?.id ||
            '';
          setSessionTermId(defaultTermId);
        }
      } catch (err) {
        console.error('Failed to load session filters:', err);
        setError('Failed to load session/term filters');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Term list follows the selected session ──
  const handleSessionChange = async (newSessionId) => {
    setSessionId(newSessionId);
    setSessionTermId('');
    try {
      const stRes = await fetchSessionTerms(newSessionId);
      const terms = stRes?.data ?? [];
      setSessionTerms(terms);
      setSessionTermId(terms.find((t) => t.status === 'active')?.id || terms[0]?.id || '');
    } catch (err) {
      console.error('Failed to load terms for session:', err);
    }
  };

  const loadOverview = useCallback(
    async (termId, cls) => {
      if (!termId) return;
      setLoading(true);
      setError('');
      try {
        const res = await resultOverviewApi.getOverview({
          session_term_id: termId,
          class_id: cls || null,
          compare_with: compareWith,
        });
        const payload = res?.data?.data;
        setData(payload);
      } catch (err) {
        console.error('Failed to load result overview:', err);
        setError(err?.response?.data?.message || 'Failed to load result overview');
        setData(null);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [compareWith],
  );

  // Auto-load once, on the initial default session/term/class — every
  // filter change after that (session, term, class, or compare-with) only
  // takes effect when Fetch is clicked, same convention as the Report
  // Sheet page.
  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (sessionTermId && !initialFetchDone.current) {
      initialFetchDone.current = true;
      loadOverview(sessionTermId, classId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionTermId]);

  const applyFilters = () => loadOverview(sessionTermId, classId);

  const toggleTrendMetric = (key) => {
    setActiveTrendMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const openDrilldown = async (classRow, subjectId, subjectName) => {
    setDrilldown({
      open: true,
      loading: true,
      title: subjectName
        ? `${classRow.class_name} — ${subjectName}`
        : `${classRow.class_name} — Overall`,
      data: null,
    });
    try {
      const res = await resultOverviewApi.getHeatmapDrilldown({
        session_term_id: sessionTermId,
        class_id: classRow.class_id,
        subject_id: subjectId || null,
      });
      setDrilldown((prev) => ({ ...prev, loading: false, data: res?.data?.data || null }));
    } catch (err) {
      console.error('Failed to load heatmap drilldown:', err);
      setDrilldown((prev) => ({ ...prev, loading: false, data: null }));
    }
  };

  const stats = data?.stats;
  const heatmap = data?.heatmap;
  const trend = data?.trend ?? [];
  const distribution = data?.distribution ?? [];
  const gender = data?.gender;
  const topSubjects = data?.top_subjects ?? [];
  const attention = data?.attention;
  const insights = data?.insights ?? [];

  // Search filters by name/class — applied client-side to the two
  // student-list tables (the heatmap/trend/stat cards are school-wide
  // aggregates a name search doesn't meaningfully narrow).
  const search = searchQuery.trim().toLowerCase();
  const matchesSearch = (s) =>
    !search || s.name.toLowerCase().includes(search) || s.class_name.toLowerCase().includes(search);

  const topStudents = (data?.top_students ?? []).filter(matchesSearch);
  const attentionStudents = (attention?.students?.[attentionTab] ?? []).filter(matchesSearch);

  const totalStudents = distribution.reduce((sum, g) => sum + g.count, 0);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Total Students',
        value: stats.total_students.value,
        delta: stats.total_students.delta,
        deltaUp: (stats.total_students.delta ?? 0) >= 0,
        icon: GroupsOutlinedIcon,
        scheme: 'blue',
      },
      {
        label: 'Passed',
        value: stats.passed.value ?? '—',
        subPercent: stats.passed.percent !== null ? `${stats.passed.percent}%` : null,
        delta: stats.passed.delta,
        deltaUp: (stats.passed.delta ?? 0) >= 0,
        icon: CheckCircleOutlineOutlinedIcon,
        scheme: 'green',
      },
      {
        label: 'Distinctions',
        value: stats.distinctions.value,
        subPercent: `${stats.distinctions.percent}%`,
        delta: stats.distinctions.delta,
        deltaUp: (stats.distinctions.delta ?? 0) >= 0,
        icon: EmojiEventsOutlinedIcon,
        scheme: 'orange',
      },
      {
        label: 'Average Score',
        value: `${stats.average_score.value}%`,
        delta: stats.average_score.delta,
        deltaUp: (stats.average_score.delta ?? 0) >= 0,
        icon: StarOutlineOutlinedIcon,
        scheme: 'purple',
      },
      {
        label: 'At Risk Students',
        value: stats.at_risk.value,
        subPercent: `${stats.at_risk.percent}%`,
        delta: stats.at_risk.delta,
        deltaUp: false,
        icon: WarningAmberOutlinedIcon,
        scheme: 'red',
      },
    ];
  }, [stats]);

  const trendMetrics = [
    { key: 'pass_rate', label: 'Pass Rate', shortLabel: 'Pass Rate (%)', color: '#2563eb' },
    { key: 'average_score', label: 'Average Score', shortLabel: 'Average Score', color: '#16a34a' },
    {
      key: 'distinction_rate',
      label: 'Distinction Rate',
      shortLabel: 'Distinction Rate',
      color: '#9333ea',
    },
    { key: 'fail_rate', label: 'Fail Rate', shortLabel: 'Fail Rate', color: '#dc2626' },
  ];
  const visibleTrendMetrics = trendMetrics.filter((m) => activeTrendMetrics.has(m.key));

  const currentClassName = classOptions.find((c) => String(c.id) === String(classId))?.name;
  const currentSessionName = sessions.find((s) => String(s.id) === String(sessionId))?.session_name;
  const currentTermName = sessionTerms.find(
    (t) => String(t.id) === String(sessionTermId),
  )?.term_name;

  return (
    <Box>
      {/* Header — filters + compare-with + a one-line summary of what's shown */}
      <Paper
        elevation={0}
        sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', p: 2, mb: 2 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Stack direction="row" spacing={1.25} flexWrap="wrap" gap={1} alignItems="center">
              <TextField
                select
                size="small"
                label="Academic Session"
                value={sessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
                sx={{ minWidth: 160, bgcolor: '#fff', borderRadius: 1 }}
              >
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.session_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Term"
                value={sessionTermId}
                onChange={(e) => setSessionTermId(e.target.value)}
                sx={{ minWidth: 150, bgcolor: '#fff', borderRadius: 1 }}
              >
                {sessionTerms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.term_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                sx={{ minWidth: 180, bgcolor: '#fff', borderRadius: 1 }}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classOptions.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                size="small"
                startIcon={loading ? null : <IconFilter size={16} />}
                sx={{ height: 40, fontWeight: 600 }}
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : 'Fetch'}
              </Button>
            </Stack>

            <TextField
              size="small"
              placeholder="Search for a student or class..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ bgcolor: '#fff', borderRadius: 1, minWidth: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <TextField
              select
              size="small"
              label="Compare with"
              value={compareWith}
              onChange={(e) => setCompareWith(e.target.value)}
              sx={{ minWidth: 170, bgcolor: '#fff', borderRadius: 1 }}
            >
              <MenuItem value="previous_term">Previous Term</MenuItem>
              <MenuItem value="same_term_last_session">Same Term Last Session</MenuItem>
            </TextField>
            <Typography sx={{ fontSize: 10.5, color: '#475569', mt: 0.75 }}>
              Showing results for {currentSessionName} – {currentTermName}
              {currentClassName ? ` – ${currentClassName}` : ''}
              <br />
              Compared with {data?.compare_label ?? '—'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: '#991b1b', fontWeight: 600 }}>
            {error}
          </Typography>
        </Paper>
      )}

      {/* Row 1 — Stat cards: every card has its own skeleton, shown
          whenever a fetch is in flight (first load AND filter changes),
          not just before the first response ever arrives. */}
      <Grid container spacing={2} mb={0.25}>
        {(loading ? Array.from({ length: 5 }) : statCards).map((c, i) =>
          loading ? (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCardSkeleton />
            </Grid>
          ) : (
            <Grid key={c.label} size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard {...c} />
            </Grid>
          ),
        )}
      </Grid>

      <>
        {/* Row 2 — Performance Trend (wide) + Class Performance Heatmap */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '6fr 6fr' },
            gap: 1.5,
            mb: 2,
            mt: 2,
          }}
        >
          <Box sx={cardSx}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1}
              mb={1}
            >
              <Box>
                <Typography sx={panelTitleSx}>
                  Performance Trend (Last {trend.length} Terms)
                </Typography>
                <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                  Click a metric to show/hide its line
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={0.6}
                flexWrap="wrap"
                gap={0.5}
                justifyContent="flex-end"
              >
                {trendMetrics.map((m) => (
                  <TabChip
                    key={m.key}
                    label={m.label}
                    color={m.color}
                    active={activeTrendMetrics.has(m.key)}
                    onClick={() => toggleTrendMetric(m.key)}
                  />
                ))}
              </Stack>
            </Stack>
            {loading ? (
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: '10px' }} />
            ) : (
              <Chart
                type="line"
                height={280}
                series={visibleTrendMetrics.map((m) => ({
                  name: m.shortLabel,
                  data: trend.map((t) => t[m.key]),
                }))}
                options={{
                  chart: { toolbar: { show: false } },
                  stroke: { width: 3, curve: 'smooth' },
                  colors: visibleTrendMetrics.map((m) => m.color),
                  markers: { size: 4 },
                  dataLabels: {
                    enabled: true,
                    style: { fontSize: '9px', fontWeight: 700 },
                    formatter: (v) => (v === null || v === undefined ? '' : `${v}%`),
                    background: { enabled: false },
                  },
                  xaxis: {
                    categories: trend.map((t) => t.label),
                    labels: { style: { fontSize: '9px' } },
                  },
                  yaxis: {
                    min: 0,
                    max: 100,
                    labels: { style: { fontSize: '9px' }, formatter: (v) => `${v}%` },
                  },
                  legend: { fontSize: '10px', position: 'bottom' },
                  grid: { strokeDashArray: 3 },
                }}
              />
            )}
          </Box>

          <Box sx={cardSx}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1}
              mb={1}
            >
              <Typography sx={panelTitleSx}>Class Performance Heatmap ({heatmapView})</Typography>
              <MiniSelect
                value={heatmapView}
                onChange={setHeatmapView}
                options={['Average Score', 'Pass Rate']}
              />
            </Stack>
            <Typography sx={{ fontSize: 9.5, color: '#94a3b8', mb: 0.5 }}>
              Click any cell to see the students behind that number, by arm.
            </Typography>
            {loading ? (
              <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={34} sx={{ borderRadius: '6px' }} />
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  overflowX: 'auto',
                  flexGrow: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <Table
                  size="small"
                  sx={{
                    width: 'max-content',
                    minWidth: '100%',
                    '& .MuiTableCell-root': {
                      py: 1.6,
                      px: 0.75,
                      border: '1px solid #f1f5f9',
                      textAlign: 'center',
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#94a3b8',
                          textAlign: 'left !important',
                        }}
                      >
                        Class
                      </TableCell>
                      {(heatmap?.subjects ?? []).map((s) => (
                        <TableCell
                          key={s.subject_id}
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: '#334155',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.subject_name}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: '#3730a3',
                          bgcolor: '#e0e7ff',
                        }}
                      >
                        Overall
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(heatmap?.rows ?? []).map((row) => {
                      const metricKey = heatmapView === 'Pass Rate' ? 'pass_rate' : 'average_score';
                      return (
                        <TableRow key={row.class_id}>
                          <TableCell
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: '#1e293b',
                              textAlign: 'left !important',
                            }}
                          >
                            {row.class_name}
                          </TableCell>
                          {(heatmap?.subjects ?? []).map((s) => {
                            const cell = row.cells?.[s.subject_id];
                            const score = cell ? cell[metricKey] : null;
                            const style = getHeatCellStyle(score);
                            return (
                              <TableCell
                                key={s.subject_id}
                                onClick={() => openDrilldown(row, s.subject_id, s.subject_name)}
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  bgcolor: style.bg,
                                  color: style.color,
                                  cursor: 'pointer',
                                  '&:hover': { opacity: 0.8 },
                                }}
                              >
                                {score ?? '—'}
                              </TableCell>
                            );
                          })}
                          <TableCell
                            onClick={() => openDrilldown(row, null, null)}
                            sx={{
                              fontSize: 14,
                              fontWeight: 800,
                              bgcolor: '#e0e7ff',
                              color: '#3730a3',
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 },
                            }}
                          >
                            {row.overall?.[metricKey] ?? '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(heatmap?.rows ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={(heatmap?.subjects?.length ?? 0) + 2}
                          sx={{ textAlign: 'center', color: '#94a3b8' }}
                        >
                          No scored results yet for this selection.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Box>

        {/* Row 3 — Performance Distribution, Gender Performance, Key Insights */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box sx={cardSx}>
            <Typography sx={panelTitleSx} mb={1}>
              Performance Distribution
            </Typography>
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={2.5} sx={{ flexGrow: 1 }}>
                <Skeleton variant="circular" width={160} height={160} sx={{ flexShrink: 0 }} />
                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} variant="text" height={20} />
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexGrow: 1 }}>
                <Box sx={{ width: 160, height: 160, flexShrink: 0 }}>
                  <Chart
                    type="donut"
                    width={160}
                    height={160}
                    series={distribution.map((g) => g.count)}
                    options={{
                      chart: { sparkline: { enabled: true } },
                      labels: distribution.map((g) => g.label),
                      colors: ['#16a34a', '#2563eb', '#f59e0b', '#dc2626', '#64748b', '#9333ea'],
                      plotOptions: {
                        pie: {
                          donut: {
                            size: '68%',
                            labels: {
                              show: true,
                              total: {
                                show: true,
                                label: 'Students',
                                formatter: () => totalStudents,
                                fontSize: '17px',
                                fontWeight: 800,
                              },
                              value: { fontSize: '20px', fontWeight: 800 },
                            },
                          },
                        },
                      },
                      dataLabels: { enabled: false },
                      legend: { show: false },
                      tooltip: { enabled: true },
                    }}
                  />
                </Box>
                <Stack spacing={1.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                  {distribution.map((g, i) => (
                    <Stack
                      key={g.label + i}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 11,
                            height: 11,
                            borderRadius: '50%',
                            bgcolor: [
                              '#16a34a',
                              '#2563eb',
                              '#f59e0b',
                              '#dc2626',
                              '#64748b',
                              '#9333ea',
                            ][i % 6],
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#334155',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {g.label} ({g.min_score}-{g.max_score})
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#0f172a',
                          flexShrink: 0,
                          ml: 0.5,
                        }}
                      >
                        {g.percent}% · {g.count}
                      </Typography>
                    </Stack>
                  ))}
                  {distribution.length === 0 && (
                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                      No grade bands configured.
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
          </Box>

          <Box sx={cardSx}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1}
              mb={0.5}
            >
              <Typography sx={panelTitleSx}>Gender Performance</Typography>
              <MiniSelect
                value={genderMetric}
                onChange={setGenderMetric}
                options={['Average Score', 'Pass Rate', 'Distinction Rate']}
              />
            </Stack>
            {loading ? (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Skeleton variant="circular" width={88} height={88} />
                <Skeleton variant="circular" width={88} height={88} />
              </Stack>
            ) : (
              gender && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <GenderDonut
                    data={gender.male}
                    label="Male"
                    color="#2563eb"
                    metric={genderMetric}
                  />
                  <GenderDonut
                    data={gender.female}
                    label="Female"
                    color="#ec4899"
                    metric={genderMetric}
                  />
                </Stack>
              )
            )}
          </Box>

          <Box sx={cardSx}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                <Typography sx={panelTitleSx}>Key Insights</Typography>
              </Stack>
            </Stack>
            {loading ? (
              <Stack spacing={1.25}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Skeleton
                      variant="rounded"
                      width={26}
                      height={26}
                      sx={{ borderRadius: '8px', flexShrink: 0 }}
                    />
                    <Skeleton variant="text" sx={{ flexGrow: 1 }} height={20} />
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Stack spacing={1.25}>
                {insights.map((insight, i) => {
                  const { Icon, bg, color } = insightIcon(insight.type);
                  return (
                    <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '8px',
                          bgcolor: bg,
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography sx={{ fontSize: 10.5, color: '#334155', lineHeight: 1.4 }}>
                        {insight.text}
                      </Typography>
                    </Stack>
                  );
                })}
                {insights.length === 0 && (
                  <Typography sx={{ fontSize: 10.5, color: '#94a3b8' }}>
                    Nothing notable yet — check back once more results are scored.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Box>

        {/* Row 4 — Top students, Top subjects, Students requiring attention */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          <Box sx={cardSx}>
            <Typography sx={panelTitleSx} mb={1}>
              Top Performing Students (Overall)
            </Typography>
            <Table
              size="small"
              sx={{
                '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>
                    #
                  </TableCell>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Student
                  </TableCell>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Class
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Total
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Average
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Rank
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton variant="text" height={24} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {topStudents.map((s) => (
                      <TableRow key={s.student_registration_id}>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                          {s.rank}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Avatar
                              sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#2563eb' }}
                            >
                              {s.name.charAt(0)}
                            </Avatar>
                            <Typography
                              sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                              {s.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 10.5 }}>{s.class_name}</TableCell>
                        <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700 }}>
                          {s.total_score}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}
                        >
                          {s.average_score}%
                        </TableCell>
                        <TableCell align="center">
                          <PositionBadge rank={s.rank} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {topStudents.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{ textAlign: 'center', color: '#94a3b8', fontSize: 11 }}
                        >
                          No fully-scored students yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </Box>

          <Box sx={cardSx}>
            <Typography sx={panelTitleSx} mb={1}>
              Top Performing Subjects (by Average Score)
            </Typography>
            <Table
              size="small"
              sx={{
                '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>
                    #
                  </TableCell>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Subject
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Average
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Pass Rate
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Distinction
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton variant="text" height={24} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {topSubjects.map((s) => (
                      <TableRow key={s.subject_name}>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                          {s.rank}
                        </TableCell>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {s.subject_name}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700 }}>
                          {s.average_score}%
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}
                        >
                          {s.pass_rate ?? '—'}%
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 10.5, fontWeight: 700, color: '#9333ea' }}
                        >
                          {s.distinction_rate ?? '—'}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {topSubjects.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ textAlign: 'center', color: '#94a3b8', fontSize: 11 }}
                        >
                          No scored subjects yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </Box>

          <Box sx={cardSx}>
            <Typography sx={panelTitleSx} mb={1}>
              Students Requiring Attention
            </Typography>
            <Stack direction="row" spacing={0.6} flexWrap="wrap" gap={0.5} sx={{ mb: 1.25 }}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      width={80}
                      height={22}
                      sx={{ borderRadius: '11px' }}
                    />
                  ))
                : (attention?.tabs ?? []).map((t) => (
                    <TabChip
                      key={t.key}
                      label={t.label}
                      count={t.count}
                      color="#dc2626"
                      active={attentionTab === t.key}
                      onClick={() => setAttentionTab(t.key)}
                    />
                  ))}
            </Stack>
            <Table
              size="small"
              sx={{
                '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>
                    #
                  </TableCell>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Student
                  </TableCell>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Class
                  </TableCell>
                  <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Subjects Failed
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                    Average
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton variant="text" height={24} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {attentionStudents.map((s) => (
                      <TableRow key={s.student_registration_id}>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                          {s.rank}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Avatar
                              sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#dc2626' }}
                            >
                              {s.name.charAt(0)}
                            </Avatar>
                            <Typography
                              sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                              {s.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 10.5 }}>{s.class_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${s.subjects_failed} subject${s.subjects_failed === 1 ? '' : 's'}`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 9,
                              fontWeight: 700,
                              bgcolor: '#fee2e2',
                              color: '#991b1b',
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 10.5, fontWeight: 700, color: '#dc2626' }}
                        >
                          {s.average_score}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {attentionStudents.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ textAlign: 'center', color: '#94a3b8', fontSize: 11 }}
                        >
                          No students in this category.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </>

      {/* ── Heatmap drilldown ─────────────────────────────────── */}
      <Dialog
        open={drilldown.open}
        onClose={() => setDrilldown({ open: false, loading: false, title: '', data: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {drilldown.title}
          <CloseIcon
            sx={{ cursor: 'pointer', fontSize: 20 }}
            onClick={() => setDrilldown({ open: false, loading: false, title: '', data: null })}
          />
        </DialogTitle>
        <DialogContent dividers>
          {drilldown.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : drilldown.data?.arms?.length ? (
            <Stack spacing={2.5}>
              {drilldown.data.arms.map((arm) => (
                <Box key={arm.arm_name}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.75 }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Arm {arm.arm_name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#64748b' }}>
                      {arm.student_count} student{arm.student_count === 1 ? '' : 's'} · avg{' '}
                      {arm.average_score}%
                    </Typography>
                  </Stack>
                  <Table
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': { py: 0.5, px: 1, borderBottom: '1px solid #f1f5f9' },
                    }}
                  >
                    <TableBody>
                      {arm.students.map((s) => (
                        <TableRow key={s.student_registration_id}>
                          <TableCell sx={{ fontSize: 11.5 }}>{s.name}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 11.5, fontWeight: 700 }}>
                            {s.score}%
                          </TableCell>
                          <TableCell align="right" sx={{ width: 70 }}>
                            {s.passed !== null && (
                              <Chip
                                label={s.passed ? 'Pass' : 'Fail'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  bgcolor: s.passed ? '#dcfce7' : '#fee2e2',
                                  color: s.passed ? '#166534' : '#991b1b',
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 3 }}>
              No students found.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ResultOverviewTab;
