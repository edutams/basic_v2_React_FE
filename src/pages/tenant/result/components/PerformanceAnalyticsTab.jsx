import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Skeleton,
  useTheme,
  Alert,
} from '@mui/material';
import {
  IconPrinter,
  IconX,
  IconBulb,
  IconUsers,
  IconTrophy,
  IconArrowUp,
  IconArrowDown,
  IconPercentage,
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import StatCard from '@/components/shared/StatCard';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { decodeLinkParams } from '@/utils/scoreLinks';

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const PerformanceAnalyticsTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();
  const [scoreRange, setScoreRange] = useState(10);
  const [participantsDialog, setParticipantsDialog] = useState({ open: false, range: null });
  const [distribution, setDistribution] = useState({ labels: [], values: [], ranges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [sheetData, setSheetData] = useState(null);

  // Context comes from one opaque token — this page is always reached from
  // a Score Sheet's "View Analytics" button (overall, or a specific CA/exam
  // column's own analytics icon), never from its own filter form.
  const context = useMemo(() => {
    const p = decodeLinkParams(searchParams.get('t'));
    return {
      sessionTermId: p.session_term_id || '',
      classArmId: p.class_arm_id || '',
      subjectId: p.subject_id || '',
      column: p.column || '', // '', 'exam' or 'ca:N'
    };
  }, [searchParams]);

  const hasContext = Boolean(context.sessionTermId && context.classArmId && context.subjectId);
  const isOverall = context.column === '';

  const columnLabel =
    context.column === 'exam'
      ? 'Exam'
      : context.column.startsWith('ca:')
        ? `CA ${Number(context.column.slice(3)) + 1}`
        : 'Overall';

  // Fetch the score sheet once and reduce it to the selected column's
  // scores — same endpoint and shape the Score Sheet page itself reads, so
  // this is always in sync with what the teacher is looking at there.
  const fetchAnalytics = useCallback(async () => {
    if (!hasContext) return;
    setLoading(true);
    setError('');
    try {
      const res = await scoreManagerApi.getScoreSheetData({
        session_term_id: context.sessionTermId,
        subject_id: context.subjectId,
        class_arm_id: context.classArmId,
      });
      const data = res?.data?.data;
      setSheetData(data || null);
      const students = data?.students || [];

      const reduced = students.map((r, i) => {
        let caScore = null;
        let score;
        let entered = false;
        if (context.column === 'exam') {
          entered = r.exam_score !== null && r.exam_score !== undefined;
          score = Number(r.exam_score || 0);
        } else if (context.column.startsWith('ca:')) {
          const ci = Number(context.column.slice(3));
          const entities = r.ca?.[ci]?.entities;
          const values = entities ? Object.values(entities) : [];
          entered = values.some(
            (e) => e?.score !== null && e?.score !== undefined && e?.score !== '',
          );
          caScore = values.reduce((sum, e) => sum + Number(e?.score || 0), 0);
          score = caScore;
        } else {
          const caTotal = (r.ca || []).reduce(
            (sum, caItem) =>
              sum +
              (caItem?.entities
                ? Object.values(caItem.entities).reduce((s, e) => s + Number(e?.score || 0), 0)
                : 0),
            0,
          );
          caScore = caTotal;
          entered = r.exam_score !== null && r.exam_score !== undefined;
          score = caTotal + Number(r.exam_score || 0);
        }
        return {
          id: r.course_registration_id || i,
          user_id: r.student_id || r.user_id,
          lname: r.lname,
          fname: r.fname,
          mname: r.mname || '',
          image: r.avatar || '',
          sex: r.sex,
          ca_score: caScore,
          exam_score:
            r.exam_score === null || r.exam_score === undefined ? null : Number(r.exam_score),
          total: score,
          entered,
        };
      });
      setResults(reduced);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [hasContext, context.sessionTermId, context.subjectId, context.classArmId, context.column]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // The real ceiling for this column — CA max + exam max for "Overall", or
  // just the one column's own max — not a hardcoded 100, so a school
  // configured for e.g. 30 CA + 50 exam doesn't get a bogus "80 - 89" bucket
  // that score could never reach.
  const columnMaxScore = useMemo(() => {
    const markConfig = sheetData?.mark_config;
    if (!markConfig) return 100;
    if (context.column === 'exam') return markConfig.exam_max_score || 100;
    if (context.column.startsWith('ca:')) {
      const ci = Number(context.column.slice(3));
      return markConfig.ca_content?.[ci]?.max_score || 100;
    }
    return (markConfig.ca_max_score || 0) + (markConfig.exam_max_score || 0) || 100;
  }, [sheetData, context.column]);

  const computeDistribution = useCallback(
    (range) => {
      const totalScores = results.map((r) => r.total);
      const labels = [];
      const values = [];
      const ranges = [];
      let cumulative = 0;
      let low = 0;

      while (low <= columnMaxScore) {
        const high = Math.min(low + range - 1, columnMaxScore);
        const label = `${low} - ${high}`;
        const count = totalScores.filter((s) => s >= low && s <= high).length;
        cumulative += count;
        labels.push(label);
        values.push(count);
        ranges.push({
          range: label,
          range_count: count,
          cumulative,
          high_interval: high,
          low_interval: low,
        });
        if (high >= columnMaxScore) break;
        low += range;
      }
      setDistribution({ labels, values, ranges });
    },
    [results, columnMaxScore],
  );

  useEffect(() => {
    computeDistribution(scoreRange);
  }, [scoreRange, computeDistribution]);

  // ── Derived stats ───────────────────────────────────────────
  const totals = results.map((r) => r.total);
  const enteredCount = results.filter((r) => r.entered).length;
  const average = totals.length
    ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10
    : 0;
  const highest = totals.length ? Math.max(...totals) : 0;
  const lowest = totals.length ? Math.min(...totals) : 0;

  // Pass rate / grade distribution / gender split only make sense for the
  // Overall column — a single CA or exam sub-score isn't itself a pass/fail
  // or grade-band figure, and grading before the exam is entered would be
  // the exact "pending ≠ failed" mistake the Score Sheet page already
  // guards against.
  const gradeSettings = sheetData?.grade_settings || [];
  const gradeDistribution = useMemo(() => {
    if (!isOverall || gradeSettings.length === 0) return [];
    return gradeSettings.map((band) => ({
      grade: band.grade,
      count: results.filter(
        (r) => r.exam_score !== null && r.total >= band.min_score && r.total <= band.max_score,
      ).length,
    }));
  }, [isOverall, gradeSettings, results]);

  // Counts only — the real pass-rate percentages come straight from the
  // server's own analytics object (computed against the actual configured
  // pass mark), not recomputed client-side.
  const genderStats = useMemo(() => {
    if (!isOverall) return null;
    return {
      male: results.filter((r) => r.sex === 'male' && r.exam_score !== null),
      female: results.filter((r) => r.sex === 'female' && r.exam_score !== null),
    };
  }, [isOverall, results]);

  const analytics = sheetData?.analytics;

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: {
      categories: distribution.labels,
      labels: { rotate: -45, style: { fontSize: '11px' } },
    },
    yaxis: { title: { text: 'No. of Participants' }, beginAtZero: true, ticks: { stepSize: 1 } },
    colors: ['#2563eb'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val} participant(s)` } },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const chartSeries = [{ name: 'No. of Participants', data: distribution.values }];

  const gradeChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: { categories: gradeDistribution.map((g) => g.grade) },
    colors: ['#16a34a'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
    dataLabels: { enabled: true },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const gradeChartSeries = [{ name: 'Students', data: gradeDistribution.map((g) => g.count) }];

  const getParticipantsForRange = (rangeData) =>
    results.filter((r) => r.total >= rangeData.low_interval && r.total <= rangeData.high_interval);

  const handlePrint = () => window.print();

  const subjectLabel = sheetData?.subject?.subject_name || '';
  const classLabel = sheetData
    ? `${sheetData.class_arm?.class_name || ''} ${sheetData.class_arm?.arm_name || ''}`.trim()
    : '';
  const termLabel = sheetData
    ? `${sheetData.session_term?.session_name || ''} - ${sheetData.session_term?.term_name || ''}`
    : '';

  if (!hasContext) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          p: 4,
        }}
      >
        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          Open analytics from a Score Sheet's "View Analytics" button (or a CA/Exam column's own
          chart icon) to see performance for a specific subject and class — this page doesn't have
          its own filters.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
      }}
    >
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {loading ? <Skeleton width={220} /> : `${subjectLabel} — ${columnLabel} Performance`}
          </Typography>
          {!loading && sheetData && (
            <Typography variant="caption" color="text.secondary">
              {classLabel} · {termLabel}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconPrinter size={16} />}
          onClick={handlePrint}
        >
          Print Analytics
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* ── Guidance banner ──────────────────────────────── */}
        {!loading && !error && (
          <Alert
            icon={<IconBulb size={18} />}
            severity="info"
            sx={{ borderRadius: '10px', mb: 2.5 }}
          >
            {isOverall
              ? 'This shows how the whole class performed overall — grade distribution, pass rate and gender split only apply here, not to a single CA or the exam alone.'
              : `Viewing the ${columnLabel} column only — scores here aren't graded or pass/fail on their own; click any bar below or a range chip in the table to see exactly who's in it.`}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={96} />
              </Grid>
            ))}
            <Grid size={12}>
              <Skeleton variant="rounded" height={360} />
            </Grid>
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '10px' }}>
            {error}
          </Alert>
        ) : results.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '10px' }}>
            No student results available for this subject/class yet.
          </Alert>
        ) : (
          <>
            {/* ── Stat cards ───────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={results.length}
                  label="Total Students"
                  subtitle="Registered"
                  icon={IconUsers}
                  colorIndex={0}
                  loading={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={average}
                  label="Average Score"
                  subtitle={`Out of 100 (${columnLabel})`}
                  icon={IconTrophy}
                  colorIndex={1}
                  loading={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={highest}
                  label="Highest Score"
                  subtitle="Top performer"
                  icon={IconArrowUp}
                  colorIndex={2}
                  loading={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={lowest}
                  label="Lowest Score"
                  subtitle="Needs attention"
                  icon={IconArrowDown}
                  colorIndex={3}
                  loading={false}
                />
              </Grid>
              {isOverall && (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <StatCard
                    count={`${analytics?.class_pass_rate ?? 0}%`}
                    label="Pass Rate"
                    subtitle={`${analytics?.passed_students ?? 0} of ${analytics?.total_students ?? results.length} passed`}
                    icon={IconPercentage}
                    colorIndex={4}
                    loading={false}
                  />
                </Grid>
              )}
              {!isOverall && (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <StatCard
                    count={`${enteredCount} / ${results.length}`}
                    label="Scores Entered"
                    subtitle={`Still pending for ${results.length - enteredCount}`}
                    icon={IconPercentage}
                    colorIndex={4}
                    loading={false}
                  />
                </Grid>
              )}
            </Grid>

            {/* ── Gender + Grade Distribution (overall only) ──── */}
            {isOverall && (
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      height: '100%',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                      Performance by Gender
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.25,
                          borderRadius: 1,
                          bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#EEF2FF',
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Male ({genderStats?.male?.length ?? 0})
                        </Typography>
                        <Chip
                          size="small"
                          label={`Avg ${analytics?.male_pass_rate ?? 0}% pass`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.25,
                          borderRadius: 1,
                          bgcolor: isDark ? 'rgba(236,72,153,0.1)' : '#FCE7F3',
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Female ({genderStats?.female?.length ?? 0})
                        </Typography>
                        <Chip
                          size="small"
                          label={`Avg ${analytics?.female_pass_rate ?? 0}% pass`}
                          sx={{ color: '#ec4899', borderColor: '#ec4899' }}
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      height: '100%',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      Grade Distribution
                    </Typography>
                    {gradeDistribution.length > 0 ? (
                      <Box sx={{ height: 180 }}>
                        <Chart
                          options={gradeChartOptions}
                          series={gradeChartSeries}
                          type="bar"
                          height="100%"
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No grade bands configured for this term.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}

            <Grid container spacing={3}>
              {/* ── Bar Chart ────────────────────────────────────── */}
              <Grid size={{ xs: 12, md: 9 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Score Distribution
                  </Typography>
                  <Box sx={{ height: 360 }}>
                    <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" />
                  </Box>
                </Paper>
              </Grid>

              {/* ── Analysis Table ───────────────────────────────── */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Analysis Table
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Choose a Range</InputLabel>
                    <Select
                      value={scoreRange}
                      label="Choose a Range"
                      onChange={(e) => setScoreRange(Number(e.target.value))}
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                    </Select>
                  </FormControl>

                  <TableContainer sx={{ maxHeight: 320 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              bgcolor: isDark ? 'grey.900' : 'grey.50',
                              ...cellBorderSx,
                              fontSize: '0.75rem',
                            }}
                          >
                            Score Range
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              bgcolor: isDark ? 'grey.900' : 'grey.50',
                              ...cellBorderSx,
                              fontSize: '0.75rem',
                            }}
                            align="center"
                          >
                            No. of Participants
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              bgcolor: isDark ? 'grey.900' : 'grey.50',
                              fontSize: '0.75rem',
                            }}
                            align="center"
                          >
                            Cumulative
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {distribution.ranges.map((r) => (
                          <TableRow key={r.range} hover>
                            <TableCell sx={{ ...cellBorderSx, fontSize: '0.8rem' }}>
                              {r.range}
                            </TableCell>
                            <TableCell align="center" sx={{ ...cellBorderSx, fontSize: '0.8rem' }}>
                              <Chip
                                label={r.range_count}
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() =>
                                  r.range_count > 0 &&
                                  setParticipantsDialog({ open: true, range: r })
                                }
                                clickable={r.range_count > 0}
                                sx={{
                                  cursor: r.range_count > 0 ? 'pointer' : 'default',
                                  minWidth: 32,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                              <Chip
                                label={r.cumulative}
                                size="small"
                                color="success"
                                variant="outlined"
                                onClick={() =>
                                  setParticipantsDialog({
                                    open: true,
                                    range: { ...r, low_interval: 0 },
                                  })
                                }
                                clickable
                                sx={{ minWidth: 32 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>

      {/* ── Participants Dialog ─────────────────────────────── */}
      <Dialog
        open={participantsDialog.open}
        onClose={() => setParticipantsDialog({ open: false, range: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6" fontWeight={600}>
            View Participants — {participantsDialog.range?.range}
          </Typography>
          <IconX
            size={20}
            style={{ cursor: 'pointer' }}
            onClick={() => setParticipantsDialog({ open: false, range: null })}
          />
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    '#',
                    'Photo',
                    'Participant ID',
                    'Participant Name',
                    'CA Score',
                    'Exam Score',
                    'Total',
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        ...cellBorderSx,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {participantsDialog.range &&
                  getParticipantsForRange(participantsDialog.range).map((p, i) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                      <TableCell sx={cellBorderSx}>
                        <Avatar src={p.image} sx={{ width: 32, height: 32, fontSize: 12 }}>
                          {!p.image && `${p.fname?.[0]}${p.lname?.[0]}`}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={cellBorderSx}>{p.user_id}</TableCell>
                      <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>
                        {p.lname} {p.fname} {p.mname}
                      </TableCell>
                      <TableCell align="center" sx={cellBorderSx}>
                        {p.ca_score ?? '-'}
                      </TableCell>
                      <TableCell align="center" sx={cellBorderSx}>
                        {p.exam_score ?? '-'}
                      </TableCell>
                      <TableCell align="center" sx={{ ...cellBorderSx, fontWeight: 700 }}>
                        {p.total || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                {participantsDialog.range &&
                  getParticipantsForRange(participantsDialog.range).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No participants in this range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantsDialog({ open: false, range: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PerformanceAnalyticsTab;
