import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Alert, useTheme,
  Card, CardHeader, CardContent, TablePagination,
} from '@mui/material';
import { IconClipboardCheck } from '@tabler/icons-react';

const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummySubjects = [
  { id: 1, name: 'Mathematics' }, { id: 2, name: 'English' }, { id: 3, name: 'Physics' },
];
const dummyScoreSheet = [
  { name: 'Adebayo Tunde', reg_id: 'STD/2025/001', ca1: 18, ca2: 17, exam: 55, total: 90, grade: 'A' },
  { name: 'Chidinma Obi', reg_id: 'STD/2025/002', ca1: 15, ca2: 14, exam: 48, total: 77, grade: 'B' },
  { name: 'Emeka Uche', reg_id: 'STD/2025/003', ca1: 12, ca2: 13, exam: 42, total: 67, grade: 'C+' },
  { name: 'Aisha Mohammed', reg_id: 'STD/2025/004', ca1: 16, ca2: 15, exam: 50, total: 81, grade: 'B+' },
  { name: 'Fatima Abubakar', reg_id: 'STD/2025/005', ca1: 10, ca2: 11, exam: 38, total: 59, grade: 'C' },
  { name: 'Ibrahim Musa', reg_id: 'STD/2025/006', ca1: 14, ca2: 13, exam: 45, total: 72, grade: 'B' },
  { name: 'Ngozi Eze', reg_id: 'STD/2025/007', ca1: 19, ca2: 18, exam: 58, total: 95, grade: 'A+' },
  { name: 'Oluwaseun Adeyemi', reg_id: 'STD/2025/008', ca1: 8, ca2: 9, exam: 30, total: 47, grade: 'D' },
];

const gradeColors = { 'A+': '#16A34A', 'A': '#22C55E', 'B+': '#3B82F6', 'B': '#60A5FA', 'C+': '#D97706', 'C': '#F59E0B', 'D': '#EA580C', 'F': '#DC2626' };

const ScoreSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showScores, setShowScores] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleView = () => {
    if (selectedClass && selectedSubject) setShowScores(true);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Select a class and subject to view individual student score sheets.
      </Alert>

      <Card elevation={2}>
        <CardHeader title="Score Sheet" />
        <CardContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={selectedClass} label="Class" onChange={e => { setSelectedClass(e.target.value); setShowScores(false); }}>
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select value={selectedSubject} label="Subject" onChange={e => { setSelectedSubject(e.target.value); setShowScores(false); }}>
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button variant="contained" size="small" fullWidth onClick={handleView} disabled={!selectedClass || !selectedSubject}>
                View Score Sheet
              </Button>
            </Grid>
          </Grid>

          {showScores && (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '5%' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '22%' }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '15%' }}>Reg ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">CA1</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">CA2</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">Exam</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">Total</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '8%' }} align="center">Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dummyScoreSheet.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                        <TableCell>{s.reg_id}</TableCell>
                        <TableCell align="center">{s.ca1}</TableCell>
                        <TableCell align="center">{s.ca2}</TableCell>
                        <TableCell align="center">{s.exam}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{s.total}</TableCell>
                        <TableCell align="center">
                          <Chip label={s.grade} size="small" sx={{ fontWeight: 700, color: '#fff', bgcolor: gradeColors[s.grade] || '#6B7280' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={dummyScoreSheet.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}

          {!showScores && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <IconClipboardCheck size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>Select a class and subject to view the score sheet</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScoreSheetTab;
