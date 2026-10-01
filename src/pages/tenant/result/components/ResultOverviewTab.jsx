import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import Chart from 'react-apexcharts';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

// ── Dummy data — this page is a UI mockup only, not wired to a backend
// endpoint yet. Numbers mirror the reference design exactly so the shapes
// (ranking tables, trend chart, donuts) are easy to swap for real data
// later without reworking the layout. ──────────────────────────────────

// Same 4-colour scheme as the Admin Dashboard's StatCardItem
// (src/pages/tenant/school-dashboard/AdminDashboard/components/TopStatCards.jsx),
// extended with a 5th (red) for the "At Risk" card using the same red this
// app already uses for danger/at-risk elsewhere.
const SCHEME = {
  blue: { bg: '#EEF2FF', iconColor: '#2563EB' },
  green: { bg: '#DCFCE7', iconColor: '#16A34A' },
  purple: { bg: '#F3E8FF', iconColor: '#9333EA' },
  orange: { bg: '#FFEDD5', iconColor: '#EA580C' },
  red: { bg: '#FEE2E2', iconColor: '#DC2626' },
};

const STAT_CARDS = [
  { label: 'Total Students', value: '742', delta: '5.2%', deltaUp: true, icon: SchoolOutlinedIcon, scheme: 'blue' },
  { label: 'Overall Pass Rate', value: '86.4%', delta: '3.6%', deltaUp: true, icon: CheckCircleOutlineOutlinedIcon, scheme: 'green' },
  { label: 'Average Score', value: '74.8%', delta: '4.1%', deltaUp: true, icon: StarOutlineOutlinedIcon, scheme: 'orange' },
  { label: 'Distinction Rate', value: '28.6%', delta: '6.3%', deltaUp: true, icon: TrendingUpOutlinedIcon, scheme: 'purple' },
  { label: 'At Risk Students', value: '48', delta: '18.6%', deltaUp: false, icon: WarningAmberOutlinedIcon, scheme: 'red' },
];

const TREND_TERMS = [
  '2023/2024\n1st Term',
  '2023/2024\n2nd Term',
  '2023/2024\n3rd Term',
  '2024/2025\n1st Term',
  '2024/2025\n2nd Term',
  '2024/2025\n3rd Term',
];
const TREND_SCORES = [68, 70, 71.5, 73, 73.8, 74.8];
const TREND_PASS_RATES = [78, 80.5, 81.5, 84, 85.1, 86.4];

const GRADE_DISTRIBUTION = [
  { grade: 'A (70-100)', count: 212, pct: 28.6, color: '#16a34a' },
  { grade: 'B (60-69)', count: 241, pct: 32.5, color: '#2563eb' },
  { grade: 'C (50-59)', count: 176, pct: 23.7, color: '#f59e0b' },
  { grade: 'D (45-49)', count: 71, pct: 9.6, color: '#f97316' },
  { grade: 'E (40-44)', count: 35, pct: 4.7, color: '#ef4444' },
  { grade: 'F (0-39)', count: 7, pct: 0.9, color: '#991b1b' },
];

const SUBJECT_PERFORMANCE = [
  { subject: 'Mathematics', score: 78.4, passRate: 92.1, color: '#2563eb' },
  { subject: 'English Language', score: 76.1, passRate: 88.6, color: '#16a34a' },
  { subject: 'Basic Science', score: 72.3, passRate: 82.4, color: '#f59e0b' },
  { subject: 'Social Studies', score: 70.8, passRate: 80.1, color: '#ef4444' },
  { subject: 'Civic Education', score: 74.5, passRate: 86.7, color: '#06b6d4' },
  { subject: 'Agricultural Science', score: 68.2, passRate: 79.3, color: '#ec4899' },
  { subject: 'Computer Studies', score: 81.6, passRate: 94.2, color: '#7c3aed' },
];

const TOP_CLASSES = [
  { rank: 1, name: 'JSS 3', students: 98, average: 82.4, passRate: 95.9 },
  { rank: 2, name: 'SS 3', students: 92, average: 79.1, passRate: 93.5 },
  { rank: 3, name: 'JSS 2', students: 104, average: 76.8, passRate: 89.4 },
  { rank: 4, name: 'SS 2', students: 87, average: 74.6, passRate: 86.2 },
  { rank: 5, name: 'JSS 1', students: 96, average: 71.3, passRate: 81.5 },
];

const TOP_SUBJECTS = [
  { rank: 1, name: 'Computer Studies', average: 81.6, passRate: 94.2 },
  { rank: 2, name: 'Mathematics', average: 78.4, passRate: 92.1 },
  { rank: 3, name: 'English Language', average: 76.1, passRate: 88.6 },
  { rank: 4, name: 'Civic Education', average: 74.5, passRate: 86.7 },
  { rank: 5, name: 'Basic Science', average: 72.3, passRate: 82.4 },
];

const WEAK_SUBJECTS = [
  { rank: 1, name: 'Agricultural Science', average: 68.2, passRate: 79.3 },
  { rank: 2, name: 'Social Studies', average: 70.8, passRate: 80.1 },
  { rank: 3, name: 'Basic Science', average: 72.3, passRate: 82.4 },
  { rank: 4, name: 'Civic Education', average: 74.5, passRate: 86.7 },
  { rank: 5, name: 'English Language', average: 76.1, passRate: 88.6 },
];

const TOP_STUDENTS = [
  { rank: 1, name: 'Adebola, Temitope', className: 'SS 3', total: '564/600', average: 94, distinctions: 8 },
  { rank: 2, name: 'Okafor, Chisom', className: 'SS 3', total: '558/600', average: 93, distinctions: 7 },
  { rank: 3, name: 'Balogun, Ridwan', className: 'JSS 3', total: '552/600', average: 92, distinctions: 7 },
  { rank: 4, name: 'Yusuf, Amina', className: 'SS 2', total: '548/600', average: 91.3, distinctions: 7 },
  { rank: 5, name: 'Oladipo, Emmanuel', className: 'SS 3', total: '545/600', average: 90.8, distinctions: 6 },
];

const WEAK_STUDENTS = [
  { rank: 1, name: 'Ahmed, Rukayya', className: 'JSS 2', average: 34, weakSubjects: 'Maths, English' },
  { rank: 2, name: 'Anthony, David', className: 'SS 1', average: 38, weakSubjects: 'Maths, Basic Sci' },
  { rank: 3, name: 'Bello, Fatima', className: 'JSS 1', average: 42, weakSubjects: 'English, Social Std' },
  { rank: 4, name: 'Chukwu, James', className: 'SS 2', average: 45, weakSubjects: 'Agric Sci, Maths' },
  { rank: 5, name: 'Daniel, Grace', className: 'JSS 3', average: 46, weakSubjects: 'Basic Sci, Maths' },
];

const GENDER_STATS = [
  { metric: 'Average Score', male: '73.6%', female: '76.1%' },
  { metric: 'Pass Rate', male: '84.1%', female: '88.9%' },
  { metric: 'Distinction Rate', male: '26.2%', female: '31.1%' },
  { metric: 'At Risk Students', male: '26 (6.7%)', female: '22 (6.2%)' },
];

const CLASS_OPTIONS = ['All Classes', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];

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

// Small, compact dropdown used inside a card's own header — purely cosmetic
// on this mockup (no filtering logic wired yet).
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
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer', color: '#2563eb', flexShrink: 0 }}>
    <Typography sx={{ fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</Typography>
    <ArrowForwardIcon sx={{ fontSize: 11 }} />
  </Stack>
);

// Replicates the Admin Dashboard's StatCardItem exactly (icon + label/value
// flush left as one flex row so the card has no dead space on the sides,
// trend footer separated by a top border) — see TopStatCards.jsx.
const StatCard = ({ label, value, delta, deltaUp, icon: Icon, scheme }) => {
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : '#94a3b8', lineHeight: 1.3 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.25, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
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
        <Typography fontWeight={500} sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
          vs last term
        </Typography>
      </Box>
    </Paper>
  );
};

const RankedTable = ({ title, viewLabel, rows, columns }) => (
  <Box sx={cardSx}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
      <Typography sx={panelTitleSx}>{title}</Typography>
      <ViewLink label={viewLabel} />
    </Stack>
    <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' } }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>#</TableCell>
          {columns.map((c) => (
            <TableCell key={c.key} align={c.align || 'left'} sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>
              {c.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.rank}>
            <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>{row.rank}</TableCell>
            {columns.map((c) => (
              <TableCell key={c.key} align={c.align || 'left'} sx={{ fontSize: 10.5, fontWeight: c.bold ? 700 : 500, color: c.color ? c.color(row) : '#1e293b', whiteSpace: 'nowrap' }}>
                {c.render ? c.render(row) : row[c.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

const ResultOverviewTab = () => {
  const [session, setSession] = useState('2024/2025');
  const [term, setTerm] = useState('Third Term');
  const [classFilter, setClassFilter] = useState('All Classes');

  // Per-card "All Classes" (etc.) filters — cosmetic only on this mockup,
  // matching exactly which cards the reference design puts a dropdown on.
  const [trendClass, setTrendClass] = useState('All Classes');
  const [gradeClass, setGradeClass] = useState('All Classes');
  const [subjectClass, setSubjectClass] = useState('All Classes');
  const [topStudentsClass, setTopStudentsClass] = useState('All Classes');
  const [topStudentsSubject, setTopStudentsSubject] = useState('All Subjects');
  const [topStudentsCount, setTopStudentsCount] = useState('Top 10');
  const [genderClass, setGenderClass] = useState('All Classes');

  const totalStudents = GRADE_DISTRIBUTION.reduce((sum, g) => sum + g.count, 0);

  return (
    <Box>
      {/* Header — title/subtitle + session/term/class filters, given a
          distinct tinted background so it stands out from the plain page
          background below it (replaces the generic breadcrumb trail). */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>Results Overview</Typography>
          <Typography sx={{ fontSize: 12, color: '#475569', mt: 0.25 }}>
            Academic performance and analytics for your school
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} flexWrap="wrap" gap={1}>
          <TextField select size="small" value={session} onChange={(e) => setSession(e.target.value)} sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 1 }}>
            <MenuItem value="2024/2025">2024/2025</MenuItem>
            <MenuItem value="2023/2024">2023/2024</MenuItem>
          </TextField>
          <TextField select size="small" value={term} onChange={(e) => setTerm(e.target.value)} sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 1 }}>
            <MenuItem value="First Term">First Term</MenuItem>
            <MenuItem value="Second Term">Second Term</MenuItem>
            <MenuItem value="Third Term">Third Term</MenuItem>
          </TextField>
          <TextField select size="small" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} sx={{ minWidth: 130, bgcolor: '#fff', borderRadius: 1 }}>
            {CLASS_OPTIONS.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Row 1 — Stat cards, Admin Dashboard style */}
      <Grid container spacing={2} mb={0.25}>
        {STAT_CARDS.map((c) => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2 — Trend chart, Grade donut, Subject performance list */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2, mt: 2 }}>
        <Box sx={cardSx}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box>
              <Typography sx={panelTitleSx}>Performance Trend</Typography>
              <Typography sx={{ fontSize: 10, color: '#64748b' }}>
                Average score and pass rate over the last {TREND_TERMS.length} terms
              </Typography>
            </Box>
            <MiniSelect value={trendClass} onChange={setTrendClass} options={CLASS_OPTIONS} />
          </Stack>
          <Chart
            type="line"
            height={260}
            series={[
              { name: 'Average Score', type: 'column', data: TREND_SCORES },
              { name: 'Pass Rate', type: 'line', data: TREND_PASS_RATES },
            ]}
            options={{
              chart: { toolbar: { show: false } },
              stroke: { width: [0, 3], curve: 'smooth' },
              plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
              colors: ['#93c5fd', '#16a34a'],
              xaxis: {
                categories: TREND_TERMS,
                labels: { style: { fontSize: '9px' } },
              },
              yaxis: [
                { title: { text: 'Average Score (%)', style: { fontSize: '9px' } }, labels: { style: { fontSize: '9px' } }, min: 0, max: 100 },
                { opposite: true, title: { text: 'Pass Rate (%)', style: { fontSize: '9px' } }, labels: { style: { fontSize: '9px' } }, min: 0, max: 100 },
              ],
              legend: { fontSize: '10px', position: 'bottom' },
              dataLabels: { enabled: false },
              grid: { strokeDashArray: 3 },
            }}
          />
        </Box>

        <Box sx={cardSx}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1}>
            <Box>
              <Typography sx={panelTitleSx}>Grade Distribution</Typography>
              <Typography sx={{ fontSize: 10, color: '#64748b' }}>Overall performance distribution</Typography>
            </Box>
            <MiniSelect value={gradeClass} onChange={setGradeClass} options={CLASS_OPTIONS} />
          </Stack>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 150, height: 150, position: 'relative' }}>
              <Chart
                type="donut"
                width={150}
                height={150}
                series={GRADE_DISTRIBUTION.map((g) => g.count)}
                options={{
                  chart: { sparkline: { enabled: true } },
                  labels: GRADE_DISTRIBUTION.map((g) => g.grade),
                  colors: GRADE_DISTRIBUTION.map((g) => g.color),
                  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Students', formatter: () => totalStudents, fontSize: '16px', fontWeight: 800 } } } } },
                  dataLabels: { enabled: false },
                  legend: { show: false },
                  tooltip: { enabled: true },
                }}
              />
            </Box>
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              {GRADE_DISTRIBUTION.map((g) => (
                <Stack key={g.grade} direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={0.6}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: g.color }} />
                    <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: '#334155' }}>{g.grade}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a' }}>
                    {g.pct}% · {g.count}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box sx={cardSx}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} mb={0.75}>
            <Typography sx={panelTitleSx}>Subject Performance</Typography>
            <MiniSelect value={subjectClass} onChange={setSubjectClass} options={CLASS_OPTIONS} />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 0.75 }}>
            <Stack direction="row" spacing={2}>
              <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Avg. Score</Typography>
              <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Pass Rate</Typography>
            </Stack>
          </Stack>
          <Stack spacing={1.1}>
            {SUBJECT_PERFORMANCE.map((s) => (
              <Box key={s.subject}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.3}>
                  <Stack direction="row" alignItems="center" spacing={0.6} sx={{ minWidth: 0 }}>
                    <MenuBookOutlinedIcon sx={{ fontSize: 13, color: s.color }} />
                    <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.subject}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a', width: 36, textAlign: 'right' }}>{s.score}%</Typography>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a', width: 36, textAlign: 'right' }}>{s.passRate}%</Typography>
                  </Stack>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={s.score}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 3 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Row 3 — Top classes, Top subjects, Areas for improvement */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2 }}>
        <RankedTable
          title="Top Performing Classes"
          viewLabel="View All Classes"
          rows={TOP_CLASSES}
          columns={[
            { key: 'name', label: 'Class', bold: true },
            { key: 'students', label: 'Students', align: 'center' },
            { key: 'average', label: 'Average', align: 'center', render: (r) => `${r.average}%` },
            { key: 'passRate', label: 'Pass Rate', align: 'center', render: (r) => `${r.passRate}%`, color: () => '#16a34a' },
          ]}
        />
        <RankedTable
          title="Top Performing Subjects"
          viewLabel="View All Subjects"
          rows={TOP_SUBJECTS}
          columns={[
            { key: 'name', label: 'Subject', bold: true },
            { key: 'average', label: 'Average', align: 'center', render: (r) => `${r.average}%` },
            { key: 'passRate', label: 'Pass Rate', align: 'center', render: (r) => `${r.passRate}%`, color: () => '#16a34a' },
          ]}
        />
        <RankedTable
          title="Areas for Improvement"
          viewLabel="View Full Report"
          rows={WEAK_SUBJECTS}
          columns={[
            { key: 'name', label: 'Subject', bold: true },
            { key: 'average', label: 'Average', align: 'center', render: (r) => `${r.average}%`, color: () => '#dc2626' },
            { key: 'passRate', label: 'Pass Rate', align: 'center', render: (r) => `${r.passRate}%` },
          ]}
        />
      </Box>

      {/* Row 4 — Top students, Students needing support, Performance by gender */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1.3fr 1fr' }, gap: 1.5 }}>
        <Box sx={cardSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1} flexWrap="wrap" gap={0.75}>
            <Typography sx={panelTitleSx}>Top Performing Students</Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.5}>
              <MiniSelect value={topStudentsClass} onChange={setTopStudentsClass} options={CLASS_OPTIONS} />
              <MiniSelect value={topStudentsSubject} onChange={setTopStudentsSubject} options={['All Subjects', 'Mathematics', 'English Language', 'Basic Science']} />
              <MiniSelect value={topStudentsCount} onChange={setTopStudentsCount} options={['Top 10', 'Top 20', 'Top 50']} />
            </Stack>
          </Stack>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>#</TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Student</TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Class</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Total</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Average</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Distinctions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TOP_STUDENTS.map((s) => (
                <TableRow key={s.rank}>
                  <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>{s.rank}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#2563eb' }}>{s.name.charAt(0)}</Avatar>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 10.5 }}>{s.className}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700 }}>{s.total}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a' }}>{s.average}%</TableCell>
                  <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700 }}>{s.distinctions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={cardSx}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography sx={panelTitleSx}>Students Needing Support</Typography>
            <ViewLink label="View All" />
          </Stack>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.6, px: 0.5, borderBottom: '1px solid #f1f5f9' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', width: 20 }}>#</TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Student</TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Class</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Average</TableCell>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Weak Subjects</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {WEAK_STUDENTS.map((s) => (
                <TableRow key={s.rank}>
                  <TableCell sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748b' }}>{s.rank}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: '#dc2626' }}>{s.name.charAt(0)}</Avatar>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 10.5 }}>{s.className}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700, color: '#dc2626' }}>{s.average}%</TableCell>
                  <TableCell sx={{ fontSize: 9.5, color: '#64748b', whiteSpace: 'nowrap' }}>{s.weakSubjects}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box sx={cardSx}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Typography sx={panelTitleSx}>Performance by Gender</Typography>
            <MiniSelect value={genderClass} onChange={setGenderClass} options={CLASS_OPTIONS} />
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <Box sx={{ width: 130, height: 130 }}>
              <Chart
                type="donut"
                width={130}
                height={130}
                series={[386, 356]}
                options={{
                  chart: { sparkline: { enabled: true } },
                  labels: ['Male', 'Female'],
                  colors: ['#2563eb', '#ec4899'],
                  plotOptions: { pie: { donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Students', formatter: () => totalStudents, fontSize: '14px', fontWeight: 800 } } } } },
                  dataLabels: { enabled: false },
                  legend: { show: false },
                }}
              />
            </Box>
          </Box>
          <Stack direction="row" justifyContent="center" spacing={2} mb={1.25}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2563eb' }} />
              <Typography sx={{ fontSize: 9.5, fontWeight: 700 }}>Male 52% (386)</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#ec4899' }} />
              <Typography sx={{ fontSize: 9.5, fontWeight: 700 }}>Female 48% (356)</Typography>
            </Stack>
          </Stack>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, px: 0.4, borderBottom: '1px solid #f1f5f9' } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>Metric</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#2563eb' }}>Male</TableCell>
                <TableCell align="center" sx={{ fontSize: 9, fontWeight: 700, color: '#ec4899' }}>Female</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {GENDER_STATS.map((g) => (
                <TableRow key={g.metric}>
                  <TableCell sx={{ fontSize: 9.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{g.metric}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 9.5, fontWeight: 700 }}>{g.male}</TableCell>
                  <TableCell align="center" sx={{ fontSize: 9.5, fontWeight: 700 }}>{g.female}</TableCell>
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
