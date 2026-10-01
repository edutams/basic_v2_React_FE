import React, { useState } from 'react';
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
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';

// ── Dummy data — this page is a UI mockup only, not wired to a backend
// endpoint yet. Shapes/labels mirror the CEO-approved reference design
// exactly so swapping in real data later doesn't require reworking the
// layout. ──────────────────────────────────────────────────────────────

const SCHEME = {
  blue: { bg: '#EEF2FF', iconColor: '#2563EB' },
  green: { bg: '#DCFCE7', iconColor: '#16A34A' },
  purple: { bg: '#F3E8FF', iconColor: '#9333EA' },
  orange: { bg: '#FFEDD5', iconColor: '#EA580C' },
  red: { bg: '#FEE2E2', iconColor: '#DC2626' },
};

const STAT_CARDS = [
  {
    label: 'Total Students',
    value: '1,248',
    delta: '3.2%',
    deltaUp: true,
    icon: GroupsOutlinedIcon,
    scheme: 'blue',
  },
  {
    label: 'Passed',
    value: '1,023',
    subPercent: '86.6%',
    delta: '4.8%',
    deltaUp: true,
    icon: CheckCircleOutlineOutlinedIcon,
    scheme: 'green',
  },
  {
    label: 'Distinctions',
    value: '72',
    subPercent: '5.8%',
    delta: '1.6%',
    deltaUp: true,
    icon: EmojiEventsOutlinedIcon,
    scheme: 'orange',
  },
  {
    label: 'Average Score',
    value: '72.4%',
    delta: '5.6%',
    deltaUp: true,
    icon: StarOutlineOutlinedIcon,
    scheme: 'purple',
  },
  {
    label: 'At Risk Students',
    value: '159',
    subPercent: '12.7%',
    delta: '5.1%',
    deltaUp: false,
    icon: WarningAmberOutlinedIcon,
    scheme: 'red',
  },
];

const TREND_TERMS = [
  '2023/2024\n1st Term',
  '2023/2024\n2nd Term',
  '2023/2024\n3rd Term',
  '2024/2025\n1st Term',
  '2024/2025\n2nd Term',
  '2024/2025\n3rd Term',
  '2025/2026\n1st Term',
];

const TREND_METRICS = [
  {
    key: 'passRate',
    label: 'Pass Rate',
    shortLabel: 'Pass Rate (%)',
    color: '#2563eb',
    data: [68.2, 72.5, 76.1, 79.3, 82.4, 84.9, 86.6],
  },
  {
    key: 'avgScore',
    label: 'Average Score',
    shortLabel: 'Average Score',
    color: '#16a34a',
    data: [64.1, 66.8, 69.3, 71.6, 73.8, 70.1, 72.4],
  },
  {
    key: 'distinctionRate',
    label: 'Distinction Rate',
    shortLabel: 'Distinction Rate',
    color: '#9333ea',
    data: [3.2, 3.8, 4.1, 4.6, 4.9, 4.2, 5.8],
  },
  {
    key: 'failRate',
    label: 'Fail Rate',
    shortLabel: 'Fail Rate',
    color: '#dc2626',
    data: [18.5, 15.8, 13.2, 10.9, 8.6, 10.2, 13.4],
  },
];

const HEATMAP_SUBJECTS = [
  'Mathematics',
  'English',
  'Basic Science',
  'Social Studies',
  'Civic Education',
  'Agric. Science',
  'Computer Studies',
];

const HEATMAP_ROWS = [
  { className: 'JS1', scores: [78, 82, 76, 71, 74, 69, 81], overall: 75.9 },
  { className: 'JS2', scores: [81, 84, 79, 76, 77, 72, 85], overall: 79.1 },
  { className: 'JS3', scores: [76, 78, 72, 69, 70, 66, 77], overall: 73.4 },
  { className: 'SS1', scores: [68, 72, 70, 65, 66, 61, 73], overall: 67.9 },
  { className: 'SS2', scores: [71, 76, 74, 70, 72, 67, 78], overall: 71.1 },
  { className: 'SS3', scores: [74, 79, 77, 72, 75, 70, 82], overall: 74.1 },
];

const getHeatCellStyle = (score) => {
  if (score >= 80) return { bg: '#bbf7d0', color: '#166534' };
  if (score >= 75) return { bg: '#d9f99d', color: '#3f6212' };
  if (score >= 70) return { bg: '#fef08a', color: '#854d0e' };
  if (score >= 65) return { bg: '#fed7aa', color: '#9a3412' };
  return { bg: '#fecaca', color: '#991b1b' };
};

const PERFORMANCE_DISTRIBUTION = [
  { grade: 'Distinction (70 - 100)', count: 72, pct: 5.8, color: '#16a34a' },
  { grade: 'Credit (60 - 69)', count: 285, pct: 22.8, color: '#2563eb' },
  { grade: 'Pass (50 - 59)', count: 724, pct: 58.0, color: '#f59e0b' },
  { grade: 'Fail (0 - 49)', count: 167, pct: 13.4, color: '#dc2626' },
];

const GENDER_DATA = {
  male: {
    label: 'Male',
    students: 645,
    passRate: 84.1,
    avgScore: 70.8,
    distinctionRate: 20.3,
    color: '#2563eb',
  },
  female: {
    label: 'Female',
    students: 603,
    passRate: 89.3,
    avgScore: 74.1,
    distinctionRate: 25.1,
    color: '#ec4899',
  },
};

const KEY_INSIGHTS = [
  {
    icon: TrendingUpOutlinedIcon,
    bg: '#DCFCE7',
    color: '#16A34A',
    text: 'Pass rate improved by 4.8% from 81.8% last term to 86.6% this term.',
  },
  {
    icon: StarOutlineOutlinedIcon,
    bg: '#EEF2FF',
    color: '#2563EB',
    text: 'Average score increased by 5.6% from 68.5% last term to 72.4% this term.',
  },
  {
    icon: EmojiEventsOutlinedIcon,
    bg: '#F3E8FF',
    color: '#9333EA',
    text: 'Distinction rate improved by 1.6% from 4.2% last term to 5.8% this term.',
  },
  {
    icon: WarningAmberOutlinedIcon,
    bg: '#FEE2E2',
    color: '#DC2626',
    text: '159 students (12.7%) are at risk and require intervention.',
  },
];

const TOP_STUDENTS = [
  { rank: 1, name: 'Adebayo, Temilade', className: 'JS3', total: '578/600', average: 96.3 },
  { rank: 2, name: 'Okonkwo, Chisom', className: 'SS1', total: '572/600', average: 95.3 },
  { rank: 3, name: 'Salami, Habeeb', className: 'JS2', total: '568/600', average: 94.7 },
  { rank: 4, name: 'Oladipo, Zainab', className: 'SS2', total: '566/600', average: 94.3 },
  { rank: 5, name: 'Usman, Amina', className: 'JS3', total: '560/600', average: 93.3 },
];

const MEDAL_COLORS = { 1: '#f59e0b', 2: '#94a3b8', 3: '#b45309' };

const TOP_SUBJECTS = [
  { rank: 1, name: 'Mathematics', average: 78.4, passRate: 88.1, distinctionRate: 26.4 },
  { rank: 2, name: 'English Language', average: 75.2, passRate: 82.1, distinctionRate: 22.3 },
  { rank: 3, name: 'Civic Education', average: 72.6, passRate: 84.6, distinctionRate: 20.1 },
  { rank: 4, name: 'Basic Science', average: 70.4, passRate: 76.3, distinctionRate: 17.8 },
  { rank: 5, name: 'Social Studies', average: 68.9, passRate: 69.8, distinctionRate: 12.4 },
  { rank: 6, name: 'Agricultural Science', average: 63.5, passRate: 71.2, distinctionRate: 14.6 },
  { rank: 7, name: 'Computer Studies', average: 61.8, passRate: 68.1, distinctionRate: 11.5 },
];

const ATTENTION_TABS = [
  { key: 'all', label: 'All', count: 159 },
  { key: 'low', label: 'Low Performance', count: 94 },
  { key: 'declining', label: 'Declining Trend', count: 38 },
  { key: 'frequent_fail', label: 'Frequent Fail', count: 27 },
];

const ATTENTION_STUDENTS = [
  { rank: 1, name: 'Bello, Sodiq', className: 'JS1', issues: '3 subjects', average: 32.5 },
  { rank: 2, name: 'Musa, Rukayat', className: 'JS1', issues: '3 subjects', average: 40.0 },
  { rank: 3, name: 'Adekunle, Femi', className: 'SS2', issues: '2 subjects', average: 41.3 },
  { rank: 4, name: 'Ibrahim, Zahra', className: 'SS1', issues: '2 subjects', average: 44.0 },
  { rank: 5, name: 'Ogunleye, Daniel', className: 'JS3', issues: '1 subject', average: 45.7 },
];

const CLASS_OPTIONS = ['All Classes', 'JS1', 'JS2', 'JS3', 'SS1', 'SS2', 'SS3'];

const cardSx = {
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  bgcolor: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  p: 1.75,
  height: '100%',
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

const ViewLink = ({ label }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.5}
    sx={{ cursor: 'pointer', color: '#2563eb', flexShrink: 0 }}
  >
    <Typography sx={{ fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</Typography>
    <ArrowForwardIcon sx={{ fontSize: 11 }} />
  </Stack>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {deltaUp ? (
            <ArrowUpwardIcon sx={{ fontSize: 14, color: trendColor }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 14, color: trendColor }} />
          )}
          <Typography fontWeight={700} sx={{ fontSize: 11.5, color: trendColor }}>
            {delta}
          </Typography>
        </Box>
        <Typography
          fontWeight={500}
          sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}
        >
          vs last term
        </Typography>
      </Box>
    </Paper>
  );
};

const PositionBadge = ({ rank }) => {
  if (rank > 3) {
    return (
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>{rank}</Typography>
    );
  }
  return <EmojiEventsIcon sx={{ fontSize: 18, color: MEDAL_COLORS[rank] }} />;
};

const GenderDonut = ({ data }) => (
  <Box sx={{ flex: 1, textAlign: 'center' }}>
    <Box sx={{ width: 108, height: 108, mx: 'auto' }}>
      <Chart
        type="radialBar"
        width={108}
        height={108}
        series={[data.passRate]}
        options={{
          chart: { sparkline: { enabled: true } },
          colors: [data.color],
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
      {data.label}
    </Typography>
    <Typography sx={{ fontSize: 10, color: '#94a3b8', mb: 0.75 }}>
      {data.students} students
    </Typography>
    <Stack spacing={0.3}>
      <Stack direction="row" justifyContent="space-between">
        <Typography sx={{ fontSize: 9.5, color: '#64748b' }}>Average Score</Typography>
        <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>
          {data.avgScore}%
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography sx={{ fontSize: 9.5, color: '#64748b' }}>Distinction Rate</Typography>
        <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>
          {data.distinctionRate}%
        </Typography>
      </Stack>
    </Stack>
  </Box>
);

const ResultOverviewTab = () => {
  const [session, setSession] = useState('2024/2025');
  const [term, setTerm] = useState('Third Term');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [compareTerm, setCompareTerm] = useState('Previous Term');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeTrendMetrics, setActiveTrendMetrics] = useState(new Set(['passRate', 'avgScore']));
  const [heatmapView, setHeatmapView] = useState('Average Score');
  const [distributionView, setDistributionView] = useState('Overall');
  const [genderMetric, setGenderMetric] = useState('Average Score');
  const [attentionTab, setAttentionTab] = useState('all');

  const totalStudents = PERFORMANCE_DISTRIBUTION.reduce((sum, g) => sum + g.count, 0);

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

  const resetFilters = () => {
    setSession('2024/2025');
    setTerm('Third Term');
    setClassFilter('All Classes');
    setCompareTerm('Previous Term');
  };

  const visibleTrendMetrics = TREND_METRICS.filter((m) => activeTrendMetrics.has(m.key));

  return (
    <Box>
      {/* Header — filters + compare-with + a one-line summary of what's shown */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          p: 2,
          mb: 2,
        }}
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
                value={session}
                onChange={(e) => setSession(e.target.value)}
                sx={{ minWidth: 130, bgcolor: '#fff', borderRadius: 1 }}
              >
                <MenuItem value="2024/2025">2024/2025</MenuItem>
                <MenuItem value="2023/2024">2023/2024</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 1 }}
              >
                <MenuItem value="First Term">First Term</MenuItem>
                <MenuItem value="Second Term">Second Term</MenuItem>
                <MenuItem value="Third Term">Third Term</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                sx={{ minWidth: 130, bgcolor: '#fff', borderRadius: 1 }}
              >
                {CLASS_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" size="small" sx={{ height: 40 }}>
                Apply
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
                onClick={resetFilters}
                sx={{ height: 40, bgcolor: '#fff' }}
              >
                Reset
              </Button>
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search for a student, class, or report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ bgcolor: '#fff', borderRadius: 1 }}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} />,
                },
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <TextField
              select
              size="small"
              label="Compare with"
              value={compareTerm}
              onChange={(e) => setCompareTerm(e.target.value)}
              sx={{ minWidth: 150, bgcolor: '#fff', borderRadius: 1 }}
            >
              <MenuItem value="Previous Term">Previous Term</MenuItem>
              <MenuItem value="Same Term Last Session">Same Term Last Session</MenuItem>
            </TextField>
            <Typography sx={{ fontSize: 10.5, color: '#475569', mt: 0.75 }}>
              Showing results for {session} – {term}
              <br />
              Compared with {session} –{' '}
              {compareTerm === 'Previous Term' ? 'Second Term' : `${term} (${compareTerm})`}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Row 1 — Stat cards */}
      <Grid container spacing={2} mb={0.25}>
        {STAT_CARDS.map((c) => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

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
                Performance Trend (Last {TREND_TERMS.length} Terms)
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
              {TREND_METRICS.map((m) => (
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
          <Chart
            type="line"
            height={280}
            series={visibleTrendMetrics.map((m) => ({ name: m.shortLabel, data: m.data }))}
            options={{
              chart: { toolbar: { show: false } },
              stroke: { width: 3, curve: 'smooth' },
              colors: visibleTrendMetrics.map((m) => m.color),
              markers: { size: 4 },
              dataLabels: {
                enabled: true,
                style: { fontSize: '9px', fontWeight: 700 },
                formatter: (v) => `${v}%`,
                background: { enabled: false },
              },
              xaxis: {
                categories: TREND_TERMS,
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
          <Box sx={{ overflowX: 'auto', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Table
              size="small"
              sx={{
                width: '100%',
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
                  {HEATMAP_SUBJECTS.map((s) => (
                    <TableCell key={s} sx={{ fontSize: 10.5, fontWeight: 800, color: '#334155' }}>
                      {s}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{ fontSize: 11.5, fontWeight: 800, color: '#3730a3', bgcolor: '#e0e7ff' }}
                  >
                    Overall
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {HEATMAP_ROWS.map((row) => {
                  return (
                    <TableRow key={row.className}>
                      <TableCell
                        sx={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#1e293b',
                          textAlign: 'left !important',
                        }}
                      >
                        {row.className}
                      </TableCell>
                      {row.scores.map((score, i) => {
                        const style = getHeatCellStyle(score);
                        return (
                          <TableCell
                            key={i}
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              bgcolor: style.bg,
                              color: style.color,
                            }}
                          >
                            {score}
                          </TableCell>
                        );
                      })}
                      <TableCell
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          bgcolor: '#e0e7ff',
                          color: '#3730a3',
                        }}
                      >
                        {row.overall}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
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
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={1}
            mb={1}
          >
            <Typography sx={panelTitleSx}>Performance Distribution ({distributionView})</Typography>
          </Stack>
          <Stack direction="row" spacing={0.6} sx={{ mb: 1.25 }}>
            {['Overall', 'By Class', 'By Gender'].map((v) => (
              <TabChip
                key={v}
                label={v}
                active={distributionView === v}
                onClick={() => setDistributionView(v)}
              />
            ))}
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 120, height: 120, flexShrink: 0 }}>
              <Chart
                type="donut"
                width={120}
                height={120}
                series={PERFORMANCE_DISTRIBUTION.map((g) => g.count)}
                options={{
                  chart: { sparkline: { enabled: true } },
                  labels: PERFORMANCE_DISTRIBUTION.map((g) => g.grade),
                  colors: PERFORMANCE_DISTRIBUTION.map((g) => g.color),
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
                            fontSize: '14px',
                            fontWeight: 800,
                          },
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
            <Stack spacing={0.65} sx={{ flexGrow: 1, minWidth: 0 }}>
              {PERFORMANCE_DISTRIBUTION.map((g) => (
                <Stack
                  key={g.grade}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={0.6} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: g.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 9.5,
                        fontWeight: 600,
                        color: '#334155',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {g.grade}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: '#0f172a',
                      flexShrink: 0,
                      ml: 0.5,
                    }}
                  >
                    {g.pct}% · {g.count}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
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
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <GenderDonut data={GENDER_DATA.male} />
            <GenderDonut data={GENDER_DATA.female} />
          </Stack>
        </Box>

        <Box sx={cardSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
              <Typography sx={panelTitleSx}>Key Insights</Typography>
            </Stack>
            <ViewLink label="View All" />
          </Stack>
          <Stack spacing={1.25}>
            {KEY_INSIGHTS.map((insight, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '8px',
                    bgcolor: insight.bg,
                    color: insight.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <insight.icon sx={{ fontSize: 14 }} />
                </Box>
                <Typography sx={{ fontSize: 10.5, color: '#334155', lineHeight: 1.4 }}>
                  {insight.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Row 4 — Top students, Top subjects, Students requiring attention */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 1.5 }}
      >
        <Box sx={cardSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography sx={panelTitleSx}>Top Performing Students (Overall)</Typography>
            <ViewLink label="View All" />
          </Stack>
          <Table
            size="small"
            sx={{ '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' } }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>
                  #
                </TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Student
                </TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Class</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Total Score
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Average
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Position
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TOP_STUDENTS.map((s) => (
                <TableRow key={s.rank}>
                  <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                    {s.rank}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#2563eb' }}>
                        {s.name.charAt(0)}
                      </Avatar>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {s.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 10.5 }}>{s.className}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700 }}>
                    {s.total}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}
                  >
                    {s.average}%
                  </TableCell>
                  <TableCell align="center">
                    <PositionBadge rank={s.rank} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={cardSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography sx={panelTitleSx}>Top Performing Subjects (by Average Score)</Typography>
            <ViewLink label="View All" />
          </Stack>
          <Table
            size="small"
            sx={{ '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' } }}
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
                  Average Score
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Pass Rate
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Distinction Rate
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TOP_SUBJECTS.map((s) => (
                <TableRow key={s.rank}>
                  <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                    {s.rank}
                  </TableCell>
                  <TableCell sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {s.name}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700 }}>
                    {s.average}%
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}
                  >
                    {s.passRate}%
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: 10.5, fontWeight: 700, color: '#9333ea' }}
                  >
                    {s.distinctionRate}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={cardSx}>
          <Typography sx={panelTitleSx} mb={1}>
            Students Requiring Attention
          </Typography>
          <Stack direction="row" spacing={0.6} flexWrap="wrap" gap={0.5} sx={{ mb: 1.25 }}>
            {ATTENTION_TABS.map((t) => (
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
            sx={{ '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' } }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>
                  #
                </TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Student
                </TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Class</TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Issues
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
                  Average
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ATTENTION_STUDENTS.map((s) => (
                <TableRow key={s.rank}>
                  <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>
                    {s.rank}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#dc2626' }}>
                        {s.name.charAt(0)}
                      </Avatar>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {s.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 10.5 }}>{s.className}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.issues}
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
                    {s.average}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Chip
        label="UI Preview — sample data, not yet connected to live results"
        size="small"
        sx={{ mt: 2, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: 10.5 }}
      />
    </Box>
  );
};

export default ResultOverviewTab;
