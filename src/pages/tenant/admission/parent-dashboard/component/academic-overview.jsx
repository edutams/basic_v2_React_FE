import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Skeleton,
  Alert,
} from '@mui/material';
import Chart from 'react-apexcharts';
import { getParentAcademics } from '@/api/tenant/admission/admissionApi';
import {
  fetchTenantSessions,
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import InsightsDetailModal from './insights-detail-modal';

// Score-band thresholds shared by the average badge and the assessment
// donut — kept in one place so a subject bucketed "Excellent" always
// matches the color/label the overall-average badge would give that score.
const SCORE_BANDS = [
  { key: 'excellent', min: 80, label: 'Excellent', color: '#16a34a' },
  { key: 'good', min: 60, label: 'Good', color: '#2563eb' },
  { key: 'average', min: 40, label: 'Average', color: '#ea580c' },
  { key: 'below', min: 0, label: 'Below Average', color: '#dc2626' },
];

const bandFor = (score) => SCORE_BANDS.find((b) => score >= b.min) || SCORE_BANDS[SCORE_BANDS.length - 1];

// Keeps the Subject Performance card the same height as its neighbours
// (Assessment Summary, Learning Activities) instead of growing past them
// for a student with many subjects — "View All Subjects" opens the full
// list in the detail modal instead.
const SUBJECT_PERFORMANCE_PREVIEW_LIMIT = 5;

// Placeholder until the Digital Class module exists to actually track this —
// intentionally static, not wired to any API.
const LEARNING_ACTIVITIES = [
  { icon: MenuBookOutlinedIcon, iconBg: '#dcfce7', iconColor: '#16a34a', title: 'Lesson Plans Completed', count: 18, period: 'This Term' },
  { icon: QuizOutlinedIcon, iconBg: '#dbeafe', iconColor: '#2563eb', title: 'Quizzes Taken', count: 22, period: 'This Term' },
  { icon: AssignmentOutlinedIcon, iconBg: '#ffedd5', iconColor: '#ea580c', title: 'Assignments Submitted', count: 16, period: 'This Term' },
  { icon: VideoLibraryOutlinedIcon, iconBg: '#f3e8ff', iconColor: '#9333ea', title: 'Reading Materials Accessed', count: 12, period: 'This Term' },
];

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUpIcon sx={{ fontSize: 13, color: '#16a34a' }} />;
  if (trend === 'down') return <TrendingDownIcon sx={{ fontSize: 13, color: '#dc2626' }} />;
  return <TrendingFlatIcon sx={{ fontSize: 13, color: '#94a3b8' }} />;
};

const statBoxSx = {
  p: 1.25,
  borderRadius: '9px',
  bgcolor: '#ffffff',
  border: '2px solid #94a3b8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  cursor: 'pointer',
  transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
  '&:hover': {
    borderColor: '#64748b',
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
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [academicSessionTermId, setAcademicSessionTermId] = useState('');
  const [wardAcademics, setWardAcademics] = useState([]);
  const [academicsLoading, setAcademicsLoading] = useState(false);
  const [wardSwitching, setWardSwitching] = useState(false);

  // Load the session list once, preselecting the active session + term —
  // same pattern as the Bursary Payment History session/term filter.
  useEffect(() => {
    (async () => {
      try {
        const [sessionsRes, activeRes] = await Promise.all([
          fetchTenantSessions({ pagination: false }),
          fetchActiveTenantSessionTerm().catch(() => null),
        ]);
        setSessions(sessionsRes?.data || []);

        const active = activeRes?.data;
        if (active?.session_id) {
          setSelectedSessionId(active.session_id);
          setAcademicSessionTermId(active.id);
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    })();
  }, []);

  // Terms cascade from the selected session. If the currently-selected term
  // doesn't belong to the newly-loaded list (e.g. the user just switched
  // sessions), fall back to that session's first term rather than an
  // orphaned id.
  useEffect(() => {
    if (!selectedSessionId) {
      setTerms([]);
      return;
    }
    let mounted = true;
    fetchSessionTerms(selectedSessionId)
      .then((res) => {
        if (!mounted) return;
        const list = res?.data || [];
        setTerms(list);
        setAcademicSessionTermId((prev) => (list.some((t) => t.id === prev) ? prev : list[0]?.id || ''));
      })
      .catch((err) => console.error('Failed to load terms:', err));
    return () => {
      mounted = false;
    };
  }, [selectedSessionId]);

  // Fetched once per session-term change, for every ward at once —
  // switching the ward dropdown just re-selects from this same array below,
  // it doesn't need its own fetch.
  useEffect(() => {
    if (!academicSessionTermId) return;
    let mounted = true;
    setAcademicsLoading(true);
    getParentAcademics(academicSessionTermId)
      .then((res) => {
        if (mounted && res?.status) setWardAcademics(res.data?.wards || []);
      })
      .catch((err) => console.error('Failed to load ward academics:', err))
      .finally(() => {
        if (mounted) setAcademicsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [academicSessionTermId]);

  const activeWardId = selectedWard?.id || wards[0]?.id;
  const activeWardAcademics = wardAcademics.find((w) => w.id === activeWardId);
  const totalSubjects = activeWardAcademics?.subjects?.total ?? null;
  const paymentRequired = activeWardAcademics?.payment_required === true;

  const overallAverage = activeWardAcademics?.overall_average ?? null;
  const averageBand = overallAverage !== null ? bandFor(overallAverage) : null;
  const classRank = activeWardAcademics?.class_rank ?? null;
  const classPopulation = activeWardAcademics?.class_population ?? 0;
  const rankPercentile =
    classRank && classPopulation ? Math.round((classRank / classPopulation) * 100) : null;
  const passRate = activeWardAcademics?.pass_rate ?? null;
  const resultsScored = activeWardAcademics?.results_recorded?.scored ?? 0;
  const resultsTotal = activeWardAcademics?.results_recorded?.total ?? 0;
  const subjectPerformance = activeWardAcademics?.subject_performance ?? [];
  const assessmentSummary = activeWardAcademics?.assessment_summary ?? {
    excellent: 0,
    good: 0,
    average: 0,
    below: 0,
  };
  const assessmentDonut = {
    series: SCORE_BANDS.map((b) => assessmentSummary[b.key] ?? 0),
    labels: SCORE_BANDS.map((b) => b.label),
    colors: SCORE_BANDS.map((b) => b.color),
  };
  const hasAnyAssessment = assessmentDonut.series.some((v) => v > 0);

  // Switching the ward dropdown re-selects from the same already-fetched
  // wardAcademics array (see above — no separate network call per ward),
  // but that switch should still read as "loading this ward's data" to the
  // parent, same as the session-term filter, not an instant silent swap.
  useEffect(() => {
    if (!activeWardId) return;
    setWardSwitching(true);
    const t = setTimeout(() => setWardSwitching(false), 300);
    return () => clearTimeout(t);
  }, [activeWardId]);

  const showLoadingSkeleton = academicsLoading || wardSwitching;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        p: 1,
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 26px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header: Title + Session/Term + Ward Selector */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.75} flexWrap="wrap" gap={1}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1e293b', letterSpacing: -0.3 }}>
          Academic Overview
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.75}>
          {/* Session / Term filters — same split pattern as Bursary Payment
              History, preselected to the active session + term. */}
          {sessions.length === 0 ? (
            <Skeleton variant="rounded" width={210} height={32} sx={{ borderRadius: '7px' }} />
          ) : (
            <>
              <TextField
                select
                size="small"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                sx={{ minWidth: { xs: 100, sm: 125 }, '& .MuiInputBase-input': { fontSize: 11.5, fontWeight: 700 } }}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 260 } } } }}
              >
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: 12.5 }}>
                    {s.session_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                value={academicSessionTermId}
                onChange={(e) => setAcademicSessionTermId(e.target.value)}
                disabled={terms.length === 0}
                sx={{ minWidth: { xs: 100, sm: 130 }, '& .MuiInputBase-input': { fontSize: 11.5, fontWeight: 700 } }}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 260 } } } }}
              >
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id} sx={{ fontSize: 12.5 }}>
                    {t.term_name}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

          {/* Ward selector */}
          {wards.length === 0 && (
            <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: '7px' }} />
          )}
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
      </Stack>

      {showLoadingSkeleton ? (
        <>
          {/* Skeleton for the 5 stat tiles */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 1.25,
              mb: 2,
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: '9px' }} />
            ))}
          </Box>

          {/* Skeleton for the 3 bottom sub-panels */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: '14px' }} />
            ))}
          </Box>
        </>
      ) : paymentRequired ? (
        <Alert severity="info" icon={<LockOutlinedIcon />} sx={{ borderRadius: '10px' }}>
          <Typography variant="body2" fontWeight={600}>
            Payment Required
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {activeWardAcademics?.name || 'This ward'}&apos;s results are withheld until the
            required school fees are paid. Visit the Payments page to settle the balance.
          </Typography>
        </Alert>
      ) : (
        <>
      {/* Top 5 Stat Cards Row — on a white background wrapper */}
      <Box
      // sx={{
      //   bgcolor: '#ffffff',
      //   border: '1px solid #E5E7EB',
      //   borderRadius: '14px',
      //   p: 1.5,
      //   boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      //   mb: 2,
      // }}
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
            mb: 2,
          }}
        >
          {/* Stat 1: Overall Average */}
          <StatBox label="Overall Average" onClick={() => setDetailType('subject_scores')}>
            <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <CircularProgress variant="determinate" value={100} size={34} thickness={4.5} sx={{ color: '#e2e8f0' }} />
              <CircularProgress
                variant="determinate"
                value={overallAverage ?? 0}
                size={34}
                thickness={4.5}
                sx={{ color: averageBand?.color || '#94a3b8', position: 'absolute', left: 0 }}
              />
            </Box>
            <Box sx={{ minWidth: 0, ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Overall Average</Typography>
              <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} mt={0.1}>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {overallAverage !== null ? `${overallAverage}%` : '—'}
                </Typography>
                {averageBand && (
                  <Box sx={{ bgcolor: `${averageBand.color}1a`, color: averageBand.color, px: 0.6, py: 0.1, borderRadius: '5px', fontSize: 9.5, fontWeight: 700 }}>
                    {averageBand.label}
                  </Box>
                )}
              </Stack>
            </Box>
          </StatBox>

          {/* Stat 2: Class Rank */}
          <StatBox label="Class Rank" onClick={() => setDetailType('class_rank')}>
            <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EmojiEventsOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0, ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Class Rank</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {classRank ? `${classRank}/${classPopulation}` : '—'}
              </Typography>
              {rankPercentile !== null && (
                <Typography sx={{ fontSize: 9.5, color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Top {rankPercentile}%
                </Typography>
              )}
            </Box>
          </StatBox>

          {/* Stat 3: Total Subjects */}
          <StatBox label="Total Subjects" onClick={() => setDetailType('subjects')}>
            <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MenuBookOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0, ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Total Subjects</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {totalSubjects ?? '—'}
              </Typography>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>This Term</Typography>
            </Box>
          </StatBox>

          {/* Stat 4: Pass Rate */}
          <StatBox label="Pass Rate" onClick={() => setDetailType('subject_scores')}>
            <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0, ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Pass Rate</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {passRate !== null ? `${passRate}%` : '—'}
              </Typography>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Scored Subjects</Typography>
            </Box>
          </StatBox>

          {/* Stat 5: Results Recorded — how much of this term's assessment
              is actually in, the Result Module's equivalent of the old
              (non-existent) "assignments submitted" tracker. */}
          <StatBox label="Results Recorded" onClick={() => setDetailType('results_recorded')}>
            <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AssignmentOutlinedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0, ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Results Recorded</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {resultsTotal ? `${resultsScored} / ${resultsTotal}` : '—'}
              </Typography>
              <Typography sx={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Subjects</Typography>
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
                {subjectPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ fontSize: 10.5, color: '#94a3b8', textAlign: 'center', py: 1.5 }}>
                      No results recorded yet this term
                    </TableCell>
                  </TableRow>
                ) : (
                  subjectPerformance.slice(0, SUBJECT_PERFORMANCE_PREVIEW_LIMIT).map((row) => {
                    const band = bandFor(row.score);
                    return (
                      <TableRow key={row.subject}>
                        <TableCell sx={{ fontSize: 10.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{row.subject}</TableCell>
                        <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 700, color: '#0f172a' }}>{row.score}%</TableCell>
                        <TableCell align="center" sx={{ fontSize: 10.5, fontWeight: 800, color: band.color }}>{row.grade ?? '—'}</TableCell>
                        <TableCell align="right">
                          <TrendIcon trend={row.trend} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={() => setDetailType('subject_scores')}
            sx={{ mt: 1.25, cursor: 'pointer', color: '#2563eb' }}
          >
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

            {!hasAnyAssessment ? (
              <Typography sx={{ fontSize: 10.5, color: '#94a3b8', textAlign: 'center', py: 2 }}>
                No results recorded yet this term
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25, my: 0.75 }}>
                <Box sx={{ width: 90, height: 90, flexShrink: 0 }}>
                  <Chart
                    type="donut"
                    series={assessmentDonut.series}
                    width={90}
                    height={90}
                    options={{
                      chart: { type: 'donut', sparkline: { enabled: true } },
                      labels: assessmentDonut.labels,
                      colors: assessmentDonut.colors,
                      plotOptions: { pie: { donut: { size: '65%' } } },
                      dataLabels: { enabled: false },
                      legend: { show: false },
                      tooltip: { enabled: true },
                    }}
                  />
                </Box>

                <Stack spacing={0.5} alignItems="center">
                  {assessmentDonut.labels.map((lbl, idx) => (
                    <Stack key={lbl} direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: assessmentDonut.colors[idx], flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 9.5, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                        {lbl.split(' ')[0]}
                      </Typography>
                      <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                        {assessmentDonut.series[idx]} Subject{assessmentDonut.series[idx] === 1 ? '' : 's'}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            onClick={() => setDetailType('subject_scores')}
            sx={{ mt: 1.25, cursor: 'pointer', color: '#2563eb' }}
          >
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
        </>
      )}

      {/* Detail modal — fetches from /admission/parent-insights/detail on open */}
      <InsightsDetailModal
        open={!!detailType}
        type={detailType || 'academic'}
        sessionTermId={academicSessionTermId}
        onClose={() => setDetailType(null)}
      />
    </Card>
  );
};

export default AcademicOverview;
