import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, IconButton, Menu, ListItemIcon, ListItemText,
  TextField, Divider, useTheme, CircularProgress, TablePagination,
} from '@mui/material';
import {
  IconCloudUpload, IconDownload, IconEye, IconCheck, IconFileSpreadsheet,
  IconUpload, IconEdit, IconTrash, IconSend,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconChevronDown } from '@tabler/icons-react';

const dummySessions = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
  { id: 3, label: '2025/2026 - Third Term' },
];

const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' },
  { id: 2, name: 'Senior Secondary' },
];

const dummyClasses = [
  { id: 1, name: 'JSS 1A', programme_id: 1 },
  { id: 2, name: 'JSS 1B', programme_id: 1 },
  { id: 3, name: 'JSS 2A', programme_id: 1 },
  { id: 4, name: 'JSS 2B', programme_id: 1 },
  { id: 5, name: 'SS 1A', programme_id: 2 },
  { id: 6, name: 'SS 1B', programme_id: 2 },
  { id: 7, name: 'SS 2A', programme_id: 2 },
  { id: 8, name: 'SS 2B', programme_id: 2 },
];

const dummySubjects = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'English Language' },
  { id: 3, name: 'Physics' },
  { id: 4, name: 'Chemistry' },
  { id: 5, name: 'Biology' },
  { id: 6, name: 'Civic Education' },
];

const initialUploads = [
  { id: 1, programme: 'Junior Secondary', class: 'JSS 1A', subject: 'Mathematics', session_term: '2025/2026 - First Term', uploaded_by: 'Mr. Ade', uploaded_at: '2026-06-15', status: 'approved', count: 42, ca_type: 'CA1 & CA2', submission: true },
  { id: 2, programme: 'Junior Secondary', class: 'JSS 1A', subject: 'English Language', session_term: '2025/2026 - First Term', uploaded_by: 'Mrs. Bola', uploaded_at: '2026-06-15', status: 'approved', count: 42, ca_type: 'CA1 & CA2', submission: true },
  { id: 3, programme: 'Junior Secondary', class: 'JSS 2A', subject: 'Physics', session_term: '2025/2026 - First Term', uploaded_by: 'Mr. Chidi', uploaded_at: '2026-06-16', status: 'approved', count: 38, ca_type: 'CA1 & CA2', submission: false },
  { id: 4, programme: 'Junior Secondary', class: 'JSS 2A', subject: 'Chemistry', session_term: '2025/2026 - First Term', uploaded_by: 'Mrs. Funke', uploaded_at: '2026-06-16', status: 'pending', count: 38, ca_type: 'CA1 & CA2', submission: false },
  { id: 5, programme: 'Senior Secondary', class: 'SS 1A', subject: 'Biology', session_term: '2025/2026 - First Term', uploaded_by: 'Mr. Emeka', uploaded_at: '2026-06-17', status: 'approved', count: 35, ca_type: 'CA1 & CA2', submission: true },
  { id: 6, programme: 'Senior Secondary', class: 'SS 1A', subject: 'Civic Education', session_term: '2025/2026 - First Term', uploaded_by: 'Mrs. Aisha', uploaded_at: '2026-06-17', status: 'pending', count: 35, ca_type: 'CA1 & CA2', submission: false },
  { id: 7, programme: 'Senior Secondary', class: 'SS 2A', subject: 'Mathematics', session_term: '2025/2026 - First Term', uploaded_by: 'Mr. Tunde', uploaded_at: '2026-06-18', status: 'approved', count: 30, ca_type: 'CA1 & CA2', submission: true },
];

const dummyUploadedScores = [
  { name: 'Adebayo Tunde', reg_id: 'STD/2025/001', ca1: 18, ca2: 17, exam: 55, total: 90 },
  { name: 'Chidinma Obi', reg_id: 'STD/2025/002', ca1: 15, ca2: 14, exam: 48, total: 77 },
  { name: 'Emeka Uche', reg_id: 'STD/2025/003', ca1: 12, ca2: 13, exam: 42, total: 67 },
  { name: 'Aisha Mohammed', reg_id: 'STD/2025/004', ca1: 16, ca2: 15, exam: 50, total: 81 },
  { name: 'Fatima Abubakar', reg_id: 'STD/2025/005', ca1: 10, ca2: 11, exam: 38, total: 59 },
  { name: 'Ibrahim Musa', reg_id: 'STD/2025/006', ca1: 14, ca2: 13, exam: 45, total: 72 },
];

const dummyInputStudents = [
  { name: 'Adebayo Tunde', reg_id: 'STD/2025/001', ca1: '', ca2: '', exam: '' },
  { name: 'Chidinma Obi', reg_id: 'STD/2025/002', ca1: '', ca2: '', exam: '' },
  { name: 'Emeka Uche', reg_id: 'STD/2025/003', ca1: '', ca2: '', exam: '' },
  { name: 'Aisha Mohammed', reg_id: 'STD/2025/004', ca1: '', ca2: '', exam: '' },
  { name: 'Fatima Abubakar', reg_id: 'STD/2025/005', ca1: '', ca2: '', exam: '' },
  { name: 'Ibrahim Musa', reg_id: 'STD/2025/006', ca1: '', ca2: '', exam: '' },
];

const UploadScoresTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [uploads] = useState(initialUploads);
  const [filter, setFilter] = useState({ session_term: '', programme: '', class_id: '', subject_id: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewDialog, setViewDialog] = useState({ open: false, data: null });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadCaExamDialog, setUploadCaExamDialog] = useState(false);
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [downloadCaExamDialog, setDownloadCaExamDialog] = useState(false);
  const [inputScoresDialog, setInputScoresDialog] = useState({ open: false, data: null });
  const [inputStudents, setInputStudents] = useState([]);
  const [inputSaving, setInputSaving] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [topMenuAnchor, setTopMenuAnchor] = useState(null);
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const filteredClasses = filter.programme
    ? dummyClasses.filter(c => c.programme_id === filter.programme)
    : dummyClasses;

  const filteredUploads = uploads.filter(u => {
    if (filter.session_term && u.session_term !== dummySessions.find(s => s.id === filter.session_term)?.label) return false;
    if (filter.programme && u.programme !== dummyProgrammes.find(p => p.id === filter.programme)?.name) return false;
    if (filter.class_id && u.class !== dummyClasses.find(c => c.id === filter.class_id)?.name) return false;
    if (filter.subject_id && u.subject !== dummySubjects.find(s => s.id === filter.subject_id)?.name) return false;
    return true;
  });

  const openInputScores = (row) => {
    setInputStudents(dummyInputStudents.map(s => ({ ...s, ca1: '', ca2: '', exam: '' })));
    setInputScoresDialog({ open: true, data: row });
  };

  const handleInputScoreChange = (index, field, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const updated = [...inputStudents];
    updated[index] = { ...updated[index], [field]: numeric };
    setInputStudents(updated);
  };

  const handleInputScoreBlur = (index, field, max) => {
    const val = Number(inputStudents[index][field]);
    if (val > max) {
      const updated = [...inputStudents];
      updated[index] = { ...updated[index], [field]: '' };
      setInputStudents(updated);
      showSnackbar(`Score cannot exceed ${max}`, 'warning');
    }
  };

  const handleSaveStudentScore = (index) => {
    setInputSaving({ ...inputSaving, [index]: true });
    setTimeout(() => {
      setInputSaving({ ...inputSaving, [index]: false });
      showSnackbar(`Score saved for ${inputStudents[index].name}`);
    }, 800);
  };

  return (
    <Box>
      {/* ── Main Card ──────────────────────────────────────── */}
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        {/* ── Card Header with Actions ──────────────────────── */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>Result Upload</Typography>
          <Button variant="contained" size="small" endIcon={<IconChevronDown size={16} />} onClick={(e) => setTopMenuAnchor(e.currentTarget)}>
            Actions
          </Button>
          <Menu anchorEl={topMenuAnchor} open={Boolean(topMenuAnchor)} onClose={() => setTopMenuAnchor(null)}>
            <MenuItem onClick={() => { setTopMenuAnchor(null); setDownloadDialog(true); }}>
              <ListItemIcon><IconDownload size={18} /></ListItemIcon>
              <ListItemText>Download Template</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setTopMenuAnchor(null); setDownloadCaExamDialog(true); }}>
              <ListItemIcon><IconFileSpreadsheet size={18} /></ListItemIcon>
              <ListItemText>Download CA/Exam Scoresheet</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setTopMenuAnchor(null); setUploadDialog(true); }}>
              <ListItemIcon><IconCloudUpload size={18} /></ListItemIcon>
              <ListItemText>Upload Scores</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setTopMenuAnchor(null); setUploadCaExamDialog(true); }}>
              <ListItemIcon><IconUpload size={18} /></ListItemIcon>
              <ListItemText>Upload CA & Exam Scores</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setTopMenuAnchor(null); showSnackbar('All subject scores submitted!'); }}>
              <ListItemIcon><IconSend size={18} /></ListItemIcon>
              <ListItemText>Submit All Scores</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* ── Filters inside Card ───────────────────────────── */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select value={filter.session_term} label="Session/Term" onChange={e => setFilter({ ...filter, session_term: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {dummySessions.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={filter.programme} label="Programme" onChange={e => setFilter({ ...filter, programme: e.target.value, class_id: '' })}>
                  <MenuItem value="">All</MenuItem>
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filter.class_id} label="Class" onChange={e => setFilter({ ...filter, class_id: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {filteredClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select value={filter.subject_id} label="Subject" onChange={e => setFilter({ ...filter, subject_id: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* ── Uploads Table ─────────────────────────────────── */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: '4%' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '14%' }}>Session-Term</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '12%' }}>Programme</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '12%' }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }}>Registered</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }}>CA Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>Exam Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '10%' }}>Submission</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '8%' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUploads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u, i) => (
                <TableRow key={u.id} hover>
                  <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                  <TableCell>{u.session_term}</TableCell>
                  <TableCell>{u.programme}</TableCell>
                  <TableCell>{u.class}</TableCell>
                  <TableCell>{u.subject}</TableCell>
                  <TableCell>{u.count}</TableCell>
                  <TableCell>
                    <Chip label={u.status === 'approved' ? u.count : 0} size="small" color={u.status === 'approved' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.status === 'approved' ? u.count : 0} size="small" color={u.status === 'approved' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    {u.submission ? (
                      <Chip icon={<IconCheck size={14} />} label="Submitted" size="small" color="success" />
                    ) : (
                      <Chip label="Pending" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => { setActionMenuAnchor(e.currentTarget); setActionMenuRow(u); }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor) && actionMenuRow?.id === u.id} onClose={() => { setActionMenuAnchor(null); setActionMenuRow(null); }}>
                      <MenuItem onClick={() => { setActionMenuAnchor(null); setDownloadDialog(true); }}>
                        <ListItemIcon><IconDownload size={18} /></ListItemIcon>
                        <ListItemText>Download Score Sheet</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setActionMenuAnchor(null); setDownloadCaExamDialog(true); }}>
                        <ListItemIcon><IconFileSpreadsheet size={18} /></ListItemIcon>
                        <ListItemText>CA/Exam Scoresheet</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => { setActionMenuAnchor(null); setUploadDialog(true); }}>
                        <ListItemIcon><IconCloudUpload size={18} /></ListItemIcon>
                        <ListItemText>Upload Scores</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setActionMenuAnchor(null); setUploadCaExamDialog(true); }}>
                        <ListItemIcon><IconUpload size={18} /></ListItemIcon>
                        <ListItemText>Upload CA & Exam Scores</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => { setActionMenuAnchor(null); openInputScores(u); }}>
                        <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                        <ListItemText>Input Scores</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setActionMenuAnchor(null); setViewDialog({ open: true, data: u }); }}>
                        <ListItemIcon><IconEye size={18} /></ListItemIcon>
                        <ListItemText>View Score Sheet</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => { setActionMenuAnchor(null); showSnackbar('Scores purged successfully!'); }} sx={{ color: 'error.main' }}>
                        <ListItemIcon><IconTrash size={18} color="error" /></ListItemIcon>
                        <ListItemText>Purge Scores</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUploads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>No upload records found for the selected filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUploads.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* ════════════════════════════════════════════════════════
          VIEW UPLOADED SCORES DIALOG
          ════════════════════════════════════════════════════════ */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle>
          Uploaded Scores — {viewDialog.data?.class} • {viewDialog.data?.subject}
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reg ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">CA1</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">CA2</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Exam</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyUploadedScores.map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.reg_id}</TableCell>
                    <TableCell align="center">{s.ca1}</TableCell>
                    <TableCell align="center">{s.ca2}</TableCell>
                    <TableCell align="center">{s.exam}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{s.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
          UPLOAD SCORES DIALOG (Single Subject)
          ════════════════════════════════════════════════════════ */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Scores</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select label="Session/Term">
                  {dummySessions.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select label="Programme">
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select label="Class">
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select label="Subject">
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="ca">CA</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 2, borderStyle: 'dashed' }}>
                Select Excel File (.xlsx)
                <input type="file" hidden accept=".xlsx,.xls" />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setUploadDialog(false); showSnackbar('Scores uploaded successfully!'); }}>
            <IconCheck size={16} style={{ marginRight: 4 }} /> Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
          UPLOAD CA & EXAM DIALOG (Combined)
          ════════════════════════════════════════════════════════ */}
      <Dialog open={uploadCaExamDialog} onClose={() => setUploadCaExamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload CA & Exam Scores</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
            Upload a single Excel file containing both CA and Exam scores for all students.
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 3, borderStyle: 'dashed' }}>
                Select Excel File (.xlsx)
                <input type="file" hidden accept=".xlsx" />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadCaExamDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setUploadCaExamDialog(false); showSnackbar('CA & Exam scores uploaded successfully!'); }}>
            <IconCheck size={16} style={{ marginRight: 4 }} /> Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
          DOWNLOAD TEMPLATE DIALOG (Single Subject)
          ════════════════════════════════════════════════════════ */}
      <Dialog open={downloadDialog} onClose={() => setDownloadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Download Score Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select label="Session/Term">
                  {dummySessions.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select label="Programme">
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select label="Class">
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select label="Subject">
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="ca">CA</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<IconDownload size={16} />} onClick={() => { setDownloadDialog(false); showSnackbar('Template downloaded successfully!'); }}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
          DOWNLOAD CA/EXAM SCORESHEET DIALOG
          ════════════════════════════════════════════════════════ */}
      <Dialog open={downloadCaExamDialog} onClose={() => setDownloadCaExamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Download CA/Exam Scoresheet</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
            Download a combined Excel template for both CA and Exam scores.
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select label="Session/Term">
                  {dummySessions.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select label="Programme">
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select label="Class">
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select label="Subject">
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadCaExamDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<IconDownload size={16} />} onClick={() => { setDownloadCaExamDialog(false); showSnackbar('CA/Exam scoresheet downloaded!'); }}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════════════════════
          INPUT SCORES DIALOG (Manual Entry)
          ════════════════════════════════════════════════════════ */}
      <Dialog open={inputScoresDialog.open} onClose={() => setInputScoresDialog({ open: false, data: null })} maxWidth="lg" fullWidth>
        <DialogTitle>
          Input Scores — {inputScoresDialog.data?.class} • {inputScoresDialog.data?.subject}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter scores manually for each student. Max scores: CA1 = 20, CA2 = 20, Exam = 60.
          </Alert>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reg ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">CA1 (20)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">CA2 (20)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Exam (60)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inputStudents.map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.reg_id}</TableCell>
                    <TableCell align="center">
                      <TextField size="small" type="number" placeholder="0" sx={{ width: 70 }}
                        value={s.ca1}
                        onChange={e => handleInputScoreChange(i, 'ca1', e.target.value)}
                        onBlur={() => handleInputScoreBlur(i, 'ca1', 20)} />
                    </TableCell>
                    <TableCell align="center">
                      <TextField size="small" type="number" placeholder="0" sx={{ width: 70 }}
                        value={s.ca2}
                        onChange={e => handleInputScoreChange(i, 'ca2', e.target.value)}
                        onBlur={() => handleInputScoreBlur(i, 'ca2', 20)} />
                    </TableCell>
                    <TableCell align="center">
                      <TextField size="small" type="number" placeholder="0" sx={{ width: 70 }}
                        value={s.exam}
                        onChange={e => handleInputScoreChange(i, 'exam', e.target.value)}
                        onBlur={() => handleInputScoreBlur(i, 'exam', 60)} />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="contained" disabled={inputSaving[i]} onClick={() => handleSaveStudentScore(i)}>
                        {inputSaving[i] ? <CircularProgress size={16} color="inherit" /> : 'Save'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInputScoresDialog({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadScoresTab;
