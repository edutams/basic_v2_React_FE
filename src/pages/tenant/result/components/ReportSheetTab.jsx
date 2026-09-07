import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, Divider,
  Snackbar, Alert, useTheme,
} from '@mui/material';
import { IconAward, IconPrinter } from '@tabler/icons-react';

const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummyStudents = [
  { id: 1, name: 'Adebayo Tunde', reg_id: 'STD/2025/001' },
  { id: 2, name: 'Chidinma Obi', reg_id: 'STD/2025/002' },
  { id: 3, name: 'Emeka Uche', reg_id: 'STD/2025/003' },
  { id: 4, name: 'Aisha Mohammed', reg_id: 'STD/2025/004' },
];
const dummyReportData = {
  subjects: [
    { name: 'English Language', ca1: 18, ca2: 17, exam: 55, total: 90, grade: 'A', remark: 'Excellent' },
    { name: 'Mathematics', ca1: 15, ca2: 14, exam: 48, total: 77, grade: 'B', remark: 'Good' },
    { name: 'Physics', ca1: 12, ca2: 13, exam: 42, total: 67, grade: 'C+', remark: 'Above Average' },
    { name: 'Chemistry', ca1: 16, ca2: 15, exam: 50, total: 81, grade: 'B+', remark: 'Very Good' },
    { name: 'Biology', ca1: 10, ca2: 11, exam: 38, total: 59, grade: 'C', remark: 'Average' },
  ],
  affective: { Punctuality: 4, Honesty: 5, Reliability: 4, Respect: 5, 'Self-Control': 4, 'Co-operation': 4 },
  psychomotor: { Handwriting: 4, Fluency: 3, 'Drawing': 5, 'Creative Art': 4, 'Speech Fluency': 3 },
  teacherComment: 'A hardworking student who shows great potential. Keep it up!',
  adminComment: 'Consistent effort and good conduct. Continue to strive for excellence.',
  position: '2nd',
  classPopulation: 42,
  average: 74.8,
};

const gradeColors = { 'A+': '#16A34A', 'A': '#22C55E', 'B+': '#3B82F6', 'B': '#60A5FA', 'C+': '#D97706', 'C': '#F59E0B', 'D': '#EA580C', 'F': '#DC2626' };

const ReportSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleView = () => {
    if (selectedClass && selectedStudent) setShowReport(true);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Select a class and student to view their individual report card.
      </Alert>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => { setSelectedClass(e.target.value); setShowReport(false); }}>
                {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Student</InputLabel>
              <Select value={selectedStudent} label="Student" onChange={e => { setSelectedStudent(e.target.value); setShowReport(false); }}>
                {dummyStudents.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button variant="contained" size="small" fullWidth onClick={handleView} disabled={!selectedClass || !selectedStudent}>
              View Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {showReport && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          {/* ── Student Header ──────────────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>AT</Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>Adebayo Tunde</Typography>
              <Typography variant="body2" color="text.secondary">STD/2025/001 • JSS 1A • First Term 2025/2026</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* ── Summary Cards ───────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 4 }}><Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}><Typography variant="h5" fontWeight={700} color="primary">2nd</Typography><Typography variant="caption">Position</Typography></Paper></Grid>
            <Grid size={{ xs: 4 }}><Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}><Typography variant="h5" fontWeight={700} color="primary">74.8</Typography><Typography variant="caption">Average</Typography></Paper></Grid>
            <Grid size={{ xs: 4 }}><Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}><Typography variant="h5" fontWeight={700} color="primary">42</Typography><Typography variant="caption">Class Size</Typography></Paper></Grid>
          </Grid>

          {/* ── Subject Results ─────────────────────────────── */}
          <Typography variant="h6" fontWeight={600} mb={1}>Academic Performance</Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">CA1</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">CA2</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Exam</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Remark</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyReportData.subjects.map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                    <TableCell align="center">{s.ca1}</TableCell>
                    <TableCell align="center">{s.ca2}</TableCell>
                    <TableCell align="center">{s.exam}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{s.total}</TableCell>
                    <TableCell align="center">
                      <Chip label={s.grade} size="small" sx={{ fontWeight: 700, color: '#fff', bgcolor: gradeColors[s.grade] || '#6B7280' }} />
                    </TableCell>
                    <TableCell>{s.remark}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Affective & Psychomotor ─────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Affective Domain</Typography>
              {Object.entries(dummyReportData.affective).map(([key, val]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">{key}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}/5</Typography>
                </Box>
              ))}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Psychomotor Domain</Typography>
              {Object.entries(dummyReportData.psychomotor).map(([key, val]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">{key}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}/5</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          {/* ── Comments ────────────────────────────────────── */}
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Class Teacher's Comment</Typography>
              <Typography variant="body1">{dummyReportData.teacherComment}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Admin's Comment</Typography>
              <Typography variant="body1">{dummyReportData.adminComment}</Typography>
            </Grid>
          </Grid>

          {/* ── Print Button ────────────────────────────────── */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" startIcon={<IconPrinter size={16} />} onClick={() => showSnackbar('Print functionality coming soon!')}>
              Print Report Card
            </Button>
          </Box>
        </Paper>
      )}

      {!showReport && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '14px', border: '1px dashed', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1', textAlign: 'center' }}>
          <IconAward size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>Select a class and student to view their report card</Typography>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportSheetTab;
