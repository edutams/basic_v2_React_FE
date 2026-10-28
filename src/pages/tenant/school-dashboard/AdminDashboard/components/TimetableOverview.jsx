import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  useTheme,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
} from '@mui/material';
import { ArrowForward, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const pct = (numerator, denominator) =>
  denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;

const ProgressBar = ({ numerator, denominator, isDark, height = 6 }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <LinearProgress
      variant="determinate"
      value={pct(numerator, denominator)}
      sx={{
        flex: 1,
        height,
        borderRadius: height / 2,
        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
        '& .MuiLinearProgress-bar': { borderRadius: height / 2, bgcolor: '#2563eb' },
      }}
    />
    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', minWidth: 30, textAlign: 'right' }}>
      {pct(numerator, denominator)}%
    </Typography>
  </Box>
);

const StatRow = ({ label, numerator, denominator, isDark, onClick }) => (
  <TableRow
    hover
    onClick={onClick}
    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
  >
    <TableCell sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1e293b', py: 0.5, px: 1 }}>
      {label}
    </TableCell>
    <TableCell align="center" sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155', py: 0.5, px: 1 }}>
      {numerator}/{denominator}
    </TableCell>
    <TableCell sx={{ py: 0.5, px: 1, width: '40%' }}>
      <ProgressBar numerator={numerator} denominator={denominator} isDark={isDark} />
    </TableCell>
  </TableRow>
);

const TimetableOverview = ({ data = {}, loading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedMetric, setSelectedMetric] = useState(null);

  const {
    periods_assigned = 0,
    periods_target = 0,
    unassigned_periods = 0,
    conflicts = 0,
    teachers_assigned = 0,
    teachers_total = 0,
    subjects_used = 0,
    subjects_total = 0,
    rooms_in_use = 0,
    rooms_total = 0,
    completion_trend = null,
    last_saved_at = null,
  } = data;

  const metrics = [
    {
      key: 'periods',
      label: 'Periods Scheduled',
      numerator: periods_assigned,
      denominator: periods_target,
      extra: [
        { label: 'Unassigned Periods', value: unassigned_periods },
        { label: 'Conflicts', value: conflicts },
        {
          label: 'Completion Trend',
          value: completion_trend != null ? `${completion_trend > 0 ? '+' : ''}${completion_trend}%` : '—',
        },
        { label: 'Last Saved', value: last_saved_at ? new Date(last_saved_at).toLocaleString() : '—' },
      ],
    },
    {
      key: 'teachers',
      label: 'Teachers Assigned',
      numerator: teachers_assigned,
      denominator: teachers_total,
      extra: [{ label: 'Teachers Without a Schedule', value: Math.max(teachers_total - teachers_assigned, 0) }],
    },
    {
      key: 'subjects',
      label: 'Subjects Covered',
      numerator: subjects_used,
      denominator: subjects_total,
      extra: [{ label: 'Subjects Not Yet Scheduled', value: Math.max(subjects_total - subjects_used, 0) }],
    },
    {
      key: 'rooms',
      label: 'Rooms In Use',
      numerator: rooms_in_use,
      denominator: rooms_total,
      extra: [{ label: 'Rooms Available', value: Math.max(rooms_total - rooms_in_use, 0) }],
    },
  ];

  const activeMetric = metrics.find((m) => m.key === selectedMetric) || null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.75,
        borderRadius: '14px',
        height: 250,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            TIMETABLE OVERVIEW
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/timetable/generate')}
            endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
            sx={{ fontSize: '12px' }}
          >
            Manage Timetable
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ py: 1 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, px: 1.25, py: 0.85 }}>
                <Skeleton variant="text" width="30%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="40%" height={20} sx={{ ml: 'auto' }} />
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Metric</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Count</TableCell>
                  <TableCell sx={{ fontSize: '11px', fontWeight: 700, color: '#64748b', py: 0.5, px: 1, bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>Coverage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.map((m) => (
                  <StatRow
                    key={m.key}
                    label={m.label}
                    numerator={m.numerator}
                    denominator={m.denominator}
                    isDark={isDark}
                    onClick={() => setSelectedMetric(m.key)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={!!activeMetric} onClose={() => setSelectedMetric(null)} maxWidth="xs" fullWidth>
        {activeMetric && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
              {activeMetric.label}
              <IconButton size="small" onClick={() => setSelectedMetric(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, color: isDark ? '#fff' : '#0f172a' }}>
                    {activeMetric.numerator}
                    <Typography component="span" sx={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>
                      {' '}/ {activeMetric.denominator}
                    </Typography>
                  </Typography>
                  <ProgressBar
                    numerator={activeMetric.numerator}
                    denominator={activeMetric.denominator}
                    isDark={isDark}
                    height={8}
                  />
                </Box>
                <Stack spacing={1}>
                  {activeMetric.extra.map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.75,
                        px: 1,
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                      }}
                    >
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>{row.label}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#1e293b' }}>
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<ArrowForward sx={{ fontSize: '14px !important' }} />}
                  onClick={() => navigate('/timetable/generate')}
                >
                  Go to Timetable
                </Button>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default TimetableOverview;
