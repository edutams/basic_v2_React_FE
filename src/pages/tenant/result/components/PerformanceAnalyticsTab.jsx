import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, useTheme,
} from '@mui/material';
import { IconChartBar, IconPrinter, IconX } from '@tabler/icons-react';
import Chart from 'react-apexcharts';

const dummyResults = [
  { id: 1, user_id: 'STD/2025/001', lname: 'Tunde', fname: 'Adebayo', mname: '', image: '', ca_score: 18, exam_score: 55, total: 73, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 2, user_id: 'STD/2025/002', lname: 'Obi', fname: 'Chidinma', mname: '', image: '', ca_score: 15, exam_score: 48, total: 63, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 3, user_id: 'STD/2025/003', lname: 'Uche', fname: 'Emeka', mname: '', image: '', ca_score: 12, exam_score: 42, total: 54, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 4, user_id: 'STD/2025/004', lname: 'Mohammed', fname: 'Aisha', mname: '', image: '', ca_score: 16, exam_score: 50, total: 66, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 5, user_id: 'STD/2025/005', lname: 'Abubakar', fname: 'Fatima', mname: '', image: '', ca_score: 10, exam_score: 38, total: 48, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 6, user_id: 'STD/2025/006', lname: 'Musa', fname: 'Ibrahim', mname: '', image: '', ca_score: 14, exam_score: 45, total: 59, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 7, user_id: 'STD/2025/007', lname: 'Okafor', fname: 'Chioma', mname: '', image: '', ca_score: 19, exam_score: 60, total: 79, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 8, user_id: 'STD/2025/008', lname: 'Adeyemi', fname: 'Bolaji', mname: '', image: '', ca_score: 8, exam_score: 30, total: 38, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 9, user_id: 'STD/2025/009', lname: 'Ibrahim', fname: 'Yusuf', mname: '', image: '', ca_score: 13, exam_score: 40, total: 53, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
  { id: 10, user_id: 'STD/2025/010', lname: 'Bello', fname: 'Zainab', mname: '', image: '', ca_score: 17, exam_score: 52, total: 69, subject_name: 'Mathematics', class_name: 'JSS 1', arm_name: 'A' },
];

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const PerformanceAnalyticsTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [scoreRange, setScoreRange] = useState(10);
  const [participantsDialog, setParticipantsDialog] = useState({ open: false, range: null });
  const [distribution, setDistribution] = useState({ labels: [], values: [], ranges: [] });

  const computeDistribution = (range) => {
    const totalScores = dummyResults.map(r => r.total);
    const maxScore = 100;
    const labels = [];
    const values = [];
    const ranges = [];
    let cumulative = 0;
    let high = range - 1;
    let low = 0;

    while (low <= maxScore) {
      const label = `${low} - ${high}`;
      const count = totalScores.filter(s => s >= low && s <= high).length;
      cumulative += count;
      labels.push(label);
      values.push(count);
      ranges.push({ range: label, range_count: count, cumulative, high_interval: high, low_interval: low });
      high += range;
      low += range;
    }
    setDistribution({ labels, values, ranges });
  };

  useEffect(() => {
    computeDistribution(scoreRange);
  }, [scoreRange]);

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
    return dummyResults.filter(r => r.total >= rangeData.low_interval && r.total <= rangeData.high_interval);
  };

  const handlePrint = () => window.print();

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Mathematics (JSS 1 A) Performance Analytics
        </Typography>
        <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
          Print Analytics
        </Button>
      </Box>

      <Box sx={{ p: 3 }}>
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
                  onChange={e => setScoreRange(Number(e.target.value))}>
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
                    <TableCell align="center" sx={cellBorderSx}>{p.ca_score}</TableCell>
                    <TableCell align="center" sx={cellBorderSx}>{p.exam_score}</TableCell>
                    <TableCell align="center" sx={{ ...cellBorderSx, fontWeight: 700 }}>{p.total}</TableCell>
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
