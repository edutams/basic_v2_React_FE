import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, useTheme, Alert, CircularProgress,
} from '@mui/material';
import { IconChartBar, IconPrinter, IconX } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';

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

  // Context from the score sheet page
  const context = useMemo(() => ({
    sessionId: searchParams.get('session_id') || '',
    termId: searchParams.get('term_id') || '',
    programmeId: searchParams.get('programme_id') || '',
    classId: searchParams.get('class_id') || '',
    classArmId: searchParams.get('class_arm_id') || '',
    subjectId: searchParams.get('subject_id') || '',
    column: searchParams.get('column') || '', // '', 'exam' or 'ca:N'
  }), [searchParams]);

  const hasContext = Boolean(context.sessionId && context.termId && context.classArmId && context.subjectId);

  // Column label for the header
  const columnLabel = context.column === 'exam'
    ? 'Exam'
    : context.column.startsWith('ca:')
      ? `CA ${Number(context.column.slice(3)) + 1}`
      : 'Overall';

  // Fetch real score-sheet data and reduce it to the selected column's scores
  const fetchAnalytics = useCallback(async () => {
    if (!hasContext) return;
    setLoading(true);
    setError('');
    try {
      // Resolve session_term_id from session + term
      const stRes = await fetchSessionTerms();
      const stData = stRes?.data || [];
      const match = stData.find(
        (st) => String(st.session?.id) === String(context.sessionId) && String(st.term?.id) === String(context.termId)
      );
      if (!match) {
        setError('Session term not found for the selected filters.');
        setResults([]);
        return;
      }

      const res = await scoreManagerApi.getScoreSheetData({
        session_term_id: match.id,
        subject_id: context.subjectId,
        class_arm_id: context.classArmId,
      });
      const students = res?.data?.data?.students || [];

      // Reduce each student's result to the score for the selected column
      const reduced = students.map((r, i) => {
        let caScore = 0;
        let score = 0;
        if (context.column === 'exam') {
          score = Number(r.exam_score || 0);
        } else if (context.column.startsWith('ca:')) {
          const ci = Number(context.column.slice(3));
          const entities = r.ca?.[ci]?.entities;
          caScore = entities
            ? Object.values(entities).reduce((sum, e) => sum + Number(e?.score || 0), 0)
            : 0;
          score = caScore;
        } else {
          const caTotal = (r.ca || []).reduce(
            (sum, caItem) => sum + (caItem?.entities
              ? Object.values(caItem.entities).reduce((s, e) => s + Number(e?.score || 0), 0)
              : 0),
            0
          );
          score = caTotal + Number(r.exam_score || 0);
        }
        return {
          id: r.course_registration_id || i,
          user_id: r.student_id || r.user_id,
          lname: r.lname,
          fname: r.fname,
          mname: r.mname || '',
          image: r.avatar || '',
          ca_score: caScore,
          exam_score: Number(r.exam_score || 0),
          total: score,
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
  }, [context]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const computeDistribution = useCallback((range) => {
    const totalScores = results.map((r) => r.total);
    // The theoretical max for the selected column determines the top of the scale
    const maxScore = 100;
    const labels = [];
    const values = [];
    const ranges = [];
    let cumulative = 0;
    let high = range - 1;
    let low = 0;

    while (low <= maxScore) {
      const label = `${low} - ${high}`;
      const count = totalScores.filter((s) => s >= low && s <= high).length;
      cumulative += count;
      labels.push(label);
      values.push(count);
      ranges.push({ range: label, range_count: count, cumulative, high_interval: high, low_interval: low });
      high += range;
      low += range;
    }
    setDistribution({ labels, values, ranges });
  }, [results]);

  useEffect(() => {
    computeDistribution(scoreRange);
  }, [scoreRange, computeDistribution]);

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: { categories: distribution.labels, labels: { rotate: -45, style: { fontSize: '11px' } } },
    yaxis: { title: { text: 'No. of Participants' }, beginAtZero: true, ticks: { stepSize: 1 } },
    colors: ['rgba(54, 162, 235, 0.6)'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val} participant(s)` } },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const chartSeries = [{ name: 'No. of Participants', data: distribution.values }];

  const getParticipantsForRange = (rangeData) => {
    return results.filter((r) => r.total >= rangeData.low_interval && r.total <= rangeData.high_interval);
  };

  const handlePrint = () => window.print();

  if (!hasContext) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', p: 4 }}>
        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          Open the analytics from a score sheet (View Analytics) to see performance for a specific subject and class.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Performance Analytics — {columnLabel}
        </Typography>
        <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
          Print Analytics
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>
        ) : results.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '10px' }}>
            No student results available for this subject/class yet.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* ── Bar Chart ────────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Bar-Chart View</Typography>
                <Box sx={{ height: 360 }}>
                  <Chart options={chartOptions} series={chartSeries} type="bar" height="100%" />
                </Box>
              </Paper>
            </Grid>

            {/* ── Analysis Table ───────────────────────────────── */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Analysis Table</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Choose a Range</InputLabel>
                  <Select value={scoreRange} label="Choose a Range"
                    onChange={(e) => setScoreRange(Number(e.target.value))}>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                  </Select>
                </FormControl>

                <TableContainer sx={{ maxHeight: 320 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, fontSize: '0.75rem' }}>Score Range</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, fontSize: '0.75rem' }} align="center">No. of Participants</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', fontSize: '0.75rem' }} align="center">Cumulative Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {distribution.ranges.map((r) => (
                        <TableRow key={r.range} hover>
                          <TableCell sx={{ ...cellBorderSx, fontSize: '0.8rem' }}>{r.range}</TableCell>
                          <TableCell align="center" sx={{ ...cellBorderSx, fontSize: '0.8rem' }}>
                            <Chip label={r.range_count} size="small" color="primary" variant="outlined"
                              onClick={() => r.range_count > 0 && setParticipantsDialog({ open: true, range: r })}
                              clickable={r.range_count > 0}
                              sx={{ cursor: r.range_count > 0 ? 'pointer' : 'default', minWidth: 32 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                            <Chip label={r.cumulative} size="small" color="success" variant="outlined"
                              onClick={() => setParticipantsDialog({ open: true, range: { ...r, low_interval: 0 } })}
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
        )}
      </Box>

      {/* ── Participants Dialog ─────────────────────────────── */}
      <Dialog open={participantsDialog.open} onClose={() => setParticipantsDialog({ open: false, range: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            View Participants — {participantsDialog.range?.range}
          </Typography>
          <IconX size={20} style={{ cursor: 'pointer' }} onClick={() => setParticipantsDialog({ open: false, range: null })} />
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['#', 'Photo', 'Participant ID', 'Participant Name', 'CA Score', 'Exam Score', 'Total'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {participantsDialog.range && getParticipantsForRange(participantsDialog.range).map((p, i) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                    <TableCell sx={cellBorderSx}>
                      <Avatar src={p.image} sx={{ width: 32, height: 32, fontSize: 12 }}>
                        {!p.image && `${p.fname?.[0]}${p.lname?.[0]}`}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={cellBorderSx}>{p.user_id}</TableCell>
                    <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>{p.lname} {p.fname} {p.mname}</TableCell>
                    <TableCell align="center" sx={cellBorderSx}>{p.ca_score || '-'}</TableCell>
                    <TableCell align="center" sx={cellBorderSx}>{p.exam_score || '-'}</TableCell>
                    <TableCell align="center" sx={{ ...cellBorderSx, fontWeight: 700 }}>{p.total || '-'}</TableCell>
                  </TableRow>
                ))}
                {participantsDialog.range && getParticipantsForRange(participantsDialog.range).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No participants in this range</Typography>
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
