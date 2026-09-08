import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, Snackbar, Alert, useTheme,
  Card, CardHeader, CardContent, TablePagination,
} from '@mui/material';
import { IconEdit, IconSearch } from '@tabler/icons-react';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
];
const dummySubjects = [
  { id: 1, name: 'Mathematics' }, { id: 2, name: 'English' }, { id: 3, name: 'Physics' },
];
const dummyStudents = [
  { id: 1, name: 'Adebayo Tunde', reg_id: 'STD/2025/001', image: null },
  { id: 2, name: 'Chidinma Obi', reg_id: 'STD/2025/002', image: null },
  { id: 3, name: 'Emeka Uche', reg_id: 'STD/2025/003', image: null },
  { id: 4, name: 'Aisha Mohammed', reg_id: 'STD/2025/004', image: null },
];

const dummyResults = [
  { id: 1, ca1: 18, ca2: 17, exam: 55, total: 90, status: 'approved' },
  { id: 2, ca1: 15, ca2: 14, exam: 48, total: 77, status: 'approved' },
];

const ResultEditTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [filter, setFilter] = useState({ session_term: '', subject: '', query: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [editForm, setEditForm] = useState({ ca1: '', ca2: '', exam: '' });
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ ca1: '', ca2: '', exam: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSearch = (q) => {
    setFilter({ ...filter, query: q });
    if (q.length >= 2) {
      setSearchResults(dummyStudents.filter(s => s.name.toLowerCase().includes(q.toLowerCase())));
    } else {
      setSearchResults([]);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setFilter({ ...filter, query: '' });
    setSearchResults([]);
    setStudentResults(dummyResults);
  };

  const handleEditSave = () => {
    const total = Number(editForm.ca1) + Number(editForm.ca2) + Number(editForm.exam);
    setStudentResults(studentResults.map(r => r.id === editDialog.data.id ? { ...r, ca1: Number(editForm.ca1), ca2: Number(editForm.ca2), exam: Number(editForm.exam), total } : r));
    setEditDialog({ open: false, data: null });
    showSnackbar('Score updated successfully');
  };

  const handleCreateSave = () => {
    const total = Number(createForm.ca1) + Number(createForm.ca2) + Number(createForm.exam);
    setStudentResults([...studentResults, { id: Date.now(), ca1: Number(createForm.ca1), ca2: Number(createForm.ca2), exam: Number(createForm.exam), total, status: 'pending' }]);
    setCreateDialog(false);
    setCreateForm({ ca1: '', ca2: '', exam: '' });
    showSnackbar('Score added successfully');
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Search for a student and edit their result scores for the selected subject.
      </Alert>

      {/* ── Filters ─────────────────────────────────────────── */}
      {/* <Card elevation={2}>
        <CardHeader title="Student Result Edit" />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
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
                <InputLabel>Subject</InputLabel>
                <Select value={filter.subject} label="Subject" onChange={e => setFilter({ ...filter, subject: e.target.value })}>
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth size="small" label="Search Student" value={filter.query}
                onChange={e => handleSearch(e.target.value)}
                InputProps={{ startAdornment: <IconSearch size={16} style={{ marginRight: 8 }} /> }}
              />
              {searchResults.length > 0 && (
                <Paper elevation={3} sx={{ position: 'absolute', zIndex: 1000, width: '100%', mt: 0.5, maxHeight: 200, overflow: 'auto' }}>
                  {searchResults.map(s => (
                    <Box key={s.id} sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => selectStudent(s)}>
                      <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">({s.reg_id})</Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card> */}

      {/* ── Student Card ────────────────────────────────────── */}
      {selectedStudent && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            {selectedStudent.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>{selectedStudent.name}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedStudent.reg_id}</Typography>
          </Box>
        </Paper>
      )}

      {/* ── Results Table ───────────────────────────────────── */}
      {selectedStudent && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Student Results</Typography>
            <Button variant="contained" size="small" onClick={() => setCreateDialog(true)}>Add Result</Button>
          </Box>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '5%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }} align="center">CA1</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }} align="center">CA2</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }} align="center">Exam</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }} align="center">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '12%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r, i) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                    <TableCell align="center">{r.ca1}</TableCell>
                    <TableCell align="center">{r.ca2}</TableCell>
                    <TableCell align="center">{r.exam}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{r.total}</TableCell>
                    <TableCell><Chip label={r.status} size="small" color={r.status === 'approved' ? 'success' : 'warning'} /></TableCell>
                    <TableCell>
                      {r.status === 'approved' && (
                        <Button size="small" startIcon={<IconEdit size={14} />} onClick={() => { setEditDialog({ open: true, data: r }); setEditForm({ ca1: r.ca1, ca2: r.ca2, exam: r.exam }); }}>
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {studentResults.length > 0 && (
            <TablePagination
              component="div"
              count={studentResults.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          )}
        </Box>
      )}

      {!selectedStudent && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '14px', border: '1px dashed', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1', textAlign: 'center' }}>
          <IconSearch size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>Search for a student to edit their results</Typography>
        </Paper>
      )}

      {/* ── Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Score</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 4 }}><TextField label="CA1" fullWidth size="small" type="number" value={editForm.ca1} onChange={e => setEditForm({ ...editForm, ca1: e.target.value })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField label="CA2" fullWidth size="small" type="number" value={editForm.ca2} onChange={e => setEditForm({ ...editForm, ca2: e.target.value })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField label="Exam" fullWidth size="small" type="number" value={editForm.exam} onChange={e => setEditForm({ ...editForm, exam: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Create Dialog ───────────────────────────────────── */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Score</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 4 }}><TextField label="CA1" fullWidth size="small" type="number" value={createForm.ca1} onChange={e => setCreateForm({ ...createForm, ca1: e.target.value })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField label="CA2" fullWidth size="small" type="number" value={createForm.ca2} onChange={e => setCreateForm({ ...createForm, ca2: e.target.value })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField label="Exam" fullWidth size="small" type="number" value={createForm.exam} onChange={e => setCreateForm({ ...createForm, exam: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultEditTab;
