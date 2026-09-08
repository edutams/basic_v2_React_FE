import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, useTheme,
  Card, CardHeader, CardContent, TablePagination,
} from '@mui/material';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
];
const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' },
  { id: 2, name: 'Senior Secondary' },
];
const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummySubjects = [
  { id: 1, name: 'Mathematics' }, { id: 2, name: 'English' }, { id: 3, name: 'Physics' },
];

const initialResults = [
  { id: 1, student: 'Adebayo Tunde', reg_id: 'STD/2025/001', image: null, ca1: 18, ca2: 17, exam: 55, total: 90, status: 'approved' },
  { id: 2, student: 'Chidinma Obi', reg_id: 'STD/2025/002', image: null, ca1: 15, ca2: 14, exam: 48, total: 77, status: 'approved' },
  { id: 3, student: 'Emeka Uche', reg_id: 'STD/2025/003', image: null, ca1: 12, ca2: 13, exam: 42, total: 67, status: 'dissapproved' },
  { id: 4, student: 'Aisha Mohammed', reg_id: 'STD/2025/004', image: null, ca1: 16, ca2: 15, exam: 50, total: 81, status: 'approved' },
  { id: 5, student: 'Fatima Abubakar', reg_id: 'STD/2025/005', image: null, ca1: 10, ca2: 11, exam: 38, total: 59, status: 'pending' },
  { id: 6, student: 'Ibrahim Musa', reg_id: 'STD/2025/006', image: null, ca1: 14, ca2: 13, exam: 45, total: 72, status: 'pending' },
  { id: 7, student: 'Ngozi Eze', reg_id: 'STD/2025/007', image: null, ca1: 19, ca2: 18, exam: 58, total: 95, status: 'approved' },
  { id: 8, student: 'Oluwaseun Adeyemi', reg_id: 'STD/2025/008', image: null, ca1: 8, ca2: 9, exam: 30, total: 47, status: 'dissapproved' },
];

const ResultConsiderationTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [results, setResults] = useState(initialResults);
  const [filter, setFilter] = useState({ session_term: '', programme: '', class: '', subject: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const changeStatus = (status) => {
    setResults(results.map(r => ({ ...r, status })));
    showSnackbar(`All results ${status === 'approved' ? 'approved' : 'disapproved'} successfully`);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 1 }}>
        Review and approve or disapprove student results before publishing.
      </Alert>

      <Card elevation={2}>
        
        <CardContent>
          {/* ── Filters ─────────────────────────────────────── */}
          <Grid container spacing={2} alignItems="center" >
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session Term</InputLabel>
                <Select value={filter.session_term} label="Session Term" onChange={e => setFilter({ ...filter, session_term: e.target.value })}>
                  {dummySessionTerms.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={filter.programme} label="Programme" onChange={e => setFilter({ ...filter, programme: e.target.value })}>
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filter.class} label="Class" onChange={e => setFilter({ ...filter, class: e.target.value })}>
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select value={filter.subject} label="Subject" onChange={e => setFilter({ ...filter, subject: e.target.value })}>
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ── Results Table ───────────────────────────────── */}
          <TableContainer sx={{ overflowX: 'auto',mt:1 }}>
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
                  <TableCell sx={{ fontWeight: 700, width: '12%' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r, i) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{r.student}</TableCell>
                    <TableCell>{r.reg_id}</TableCell>
                    <TableCell align="center">{r.ca1}</TableCell>
                    <TableCell align="center">{r.ca2}</TableCell>
                    <TableCell align="center">{r.exam}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{r.total}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        size="small"
                        color={r.status === 'approved' ? 'success' : r.status === 'dissapproved' ? 'error' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={results.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* ── Action Buttons ──────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
        <Button variant="contained" color="error" onClick={() => changeStatus('dissapproved')}>
          Disapprove All
        </Button>
        <Button variant="contained" color="success" onClick={() => changeStatus('approved')}>
          Approve All
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultConsiderationTab;
