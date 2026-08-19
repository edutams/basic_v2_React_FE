import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import Chart from 'react-apexcharts';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import InsightsDetailModal from './insights-detail-modal';

const SUBJECT_PERFORMANCE = [
  { subject: 'Mathematics', score: 88, grade: 'A', trend: 'up', trendColor: '#16a34a' },
  { subject: 'English Language', score: 75, grade: 'B', trend: 'up', trendColor: '#16a34a' },
  { subject: 'Basic Science', score: 70, grade: 'B-', trend: 'down', trendColor: '#d97706' },
  { subject: 'Civic Education', score: 92, grade: 'A', trend: 'up', trendColor: '#16a34a' },
  { subject: 'Further Mathematics', score: 65, grade: 'C+', trend: 'down', trendColor: '#dc2626' },
];

const ASSESSMENT_DONUT = {
  series: [4, 3, 1, 1],
  labels: ['Excellent (80-100%)', 'Good (60-79%)', 'Average (40-59%)', 'Below Average (0-39%)'],
  colors: ['#16a34a', '#2563eb', '#ea580c', '#dc2626'],
  counts: ['4 Subjects', '3 Subjects', '1 Subject', '1 Subject'],
};

const LEARNING_ACTIVITIES = [
  { icon: MenuBookOutlinedIcon, iconBg: '#dcfce7', iconColor: '#16a34a', title: 'Lesson Plans Completed', count: 18, period: 'This Term' },
  { icon: QuizOutlinedIcon, iconBg: '#dbeafe', iconColor: '#2563eb', title: 'Quizzes Taken', count: 22, period: 'This Term' },
  { icon: AssignmentOutlinedIcon, iconBg: '#ffedd5', iconColor: '#ea580c', title: 'Assignments Submitted', count: 16, period: 'This Term' },
  { icon: VideoLibraryOutlinedIcon, iconBg: '#f3e8ff', iconColor: '#9333ea', title: 'Reading Materials Accessed', count: 12, period: 'This Term' },
];

const statBoxSx = {
  p: 1.25,
  borderRadius: '9px',
  bgcolor: '#f8fafc',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  cursor: 'pointer',
  transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  '&:hover': {
    borderColor: '#94a3b8',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  },
};

const StatBox = ({ label, onClick, children }) => (
  <Tooltip title={`Click to view ${label} breakdown`} placement="top" arrow>
    <Box onClick={onClick} sx={statBoxSx}>
      {children}
    </Box>
  </Tooltip>
);

const AcademicOverview = ({ selectedWard, wards = [], onSelectWard }) => {
  const [detailType, setDetailType] = useState(null);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        p: 2,
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 26px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header: Title + Ward Selector */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.75}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1e293b', letterSpacing: -0.3 }}>
          Academic Overview
        </Typography>

        {wards.length > 0 && (
          <Select
            value={selectedWard?.id || wards[0]?.id}
            onChange={(e) => {
              const w = wards.find((item) => item.id === e.target.value);
              if (w && onSelectWard) onSelectWard(w);
            }}
            size="small"
            sx={{
              borderRadius: '7px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#0f172a',
              bgcolor: '#f8fafc',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
            }}
          >
            {wards.map((w) => (
              <MenuItem key={w.id} value={w.id} sx={{ fontSize: 11.5, fontWeight: 600 }}>
                {w.name} ({w.className || w.class})
              </MenuItem>
            ))}
          </Select>
        )}
      </Stack>

      {/* Top 5 Stat Cards Row — on a white background wrapper */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          p: 1.5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 1.25,
          }}
        >
        {/* Stat 1: Overall Average */}
        <StatBox label="Overall Average" onClick={() => setDetailType('academic')}>
          <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
            <CircularProgress variant="determinate" value={100} size={34} thickness={4.5} sx={{ color: '#e2e8f0' }} />
            <CircularProgress variant="determinate" value={78} size={34} thickness={4.5} sx={{ color: '#16a34a', position: 'absolute', left: 0 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Overall Average</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.1}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>78%</Typography>
              <Box sx={{ bgcolor: '#dcfce7', color: '#16a34a', px: 0.6, py: 0.1, borderRadius: '5px', fontSize: 9.5, fontWeight: 700 }}>Good</Box>
            </Stack>
          </Box>
        </StatBox>

        {/* Stat 2: Class Rank */}
        <StatBox label="Class Rank" onClick={() => setDetailType('performance')}>
          <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EmojiEventsOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Class Rank</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>5/35</Typography>
            <Typography sx={{ fontSize: 9.5, color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>Top 14%</Typography>
          </Box>
        </StatBox>

        {/* Stat 3: Total Subjects */}
        <StatBox label="Total Subjects" onClick={() => setDetailType('academic')}>
          <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MenuBookOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Total Subjects</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>9</Typography>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>This Term</Typography>
          </Box>
        </StatBox>

        {/* Stat 4: Pass Rate */}
        <StatBox label="Pass Rate" onClick={() => setDetailType('academic')}>
          <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Pass Rate</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>100%</Typography>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>All Subjects</Typography>
          </Box>
        </StatBox>

        {/* Stat 5: Assignments */}
        <StatBox label="Assignments" onClick={() => setDetailType('engagement')}>
          <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AssignmentOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Assignments</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>16 / 20</Typography>
            <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Submitted</Typography>
          </Box>
        </StatBox>
        </Box>
      </Box>

      {/* Bottom 3 Sub-Panels */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {/* Sub-panel 1: Subject Performance Table */}
        <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', p: 1.75, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#0f172a', mb: 1 }}>
              Subject Performance
            </Typography>
            <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, px: 0.4, borderBottom: '1px solid #f1f5f9' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>Subject</TableCell>
                  <TableCell align="center" sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>Avg Score</TableCell>
                  <TableCell align="center" sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>Grade</TableCell>
                  <TableCell align="right" sx={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {SUBJECT_PERFORMANCE.map((row) => (
                  <TableRow key={row.subject}>
                    <TableCell sx={{ fontSize: 10.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{row.subject}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}>{row.score}%</TableCell>
                    <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 800, color: row.score >= 80 ? '#16a34a' : row.score >= 70 ? '#2563eb' : '#ea580c' }}>{row.grade}</TableCell>
                    <TableCell align="right">
                      {row.trend === 'up' ? (
                        <TrendingUpIcon sx={{ fontSize: 13, color: row.trendColor }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 13, color: row.trendColor }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25, cursor: 'pointer', color: '#2563eb' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>View All Subjects</Typography>
            <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </Stack>
        </Box>

        {/* Sub-panel 2: Assessment Summary Donut */}
        <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', p: 1.75, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#0f172a', mb: 0.75 }}>
              Assessment Summary
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25, my: 0.75 }}>
              <Box sx={{ width: 90, height: 90, flexShrink: 0 }}>
                <Chart
                  type="donut"
                  series={ASSESSMENT_DONUT.series}
                  width={90}
                  height={90}
                  options={{
                    chart: { type: 'donut', sparkline: { enabled: true } },
                    labels: ASSESSMENT_DONUT.labels,
                    colors: ASSESSMENT_DONUT.colors,
                    plotOptions: { pie: { donut: { size: '65%' } } },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    tooltip: { enabled: true },
                  }}
                />
              </Box>

              <Stack spacing={0.5} alignItems="center">
                {ASSESSMENT_DONUT.labels.map((lbl, idx) => (
                  <Stack key={lbl} direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ASSESSMENT_DONUT.colors[idx], flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                      {lbl.split(' ')[0]}
                    </Typography>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                      {ASSESSMENT_DONUT.counts[idx]}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25, cursor: 'pointer', color: '#2563eb' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>View Assessment Details</Typography>
            <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </Stack>
        </Box>

        {/* Sub-panel 3: Learning Activities List */}
        <Box sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', p: 1.75, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#0f172a', mb: 1 }}>
              Learning Activities
            </Typography>

            <Stack spacing={1}>
              {LEARNING_ACTIVITIES.map((act) => {
                const Icon = act.icon;
                return (
                  <Stack key={act.title} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '5px', bgcolor: act.iconBg, color: act.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.title}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0, ml: 0.5 }}>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: '#0f172a' }}>
                        {act.count}
                      </Typography>
                      <Typography sx={{ fontSize: 9, color: '#64748b', fontWeight: 500 }}>
                        {act.period}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25, cursor: 'pointer', color: '#2563eb' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700 }}>View All Activities</Typography>
            <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </Stack>
        </Box>
      </Box>

      {/* Detail modal — fetches from /admission/parent-insights/detail on open */}
      <InsightsDetailModal
        open={!!detailType}
        type={detailType || 'academic'}
        onClose={() => setDetailType(null)}
      />
    </Card>
  );
};

export default AcademicOverview;
