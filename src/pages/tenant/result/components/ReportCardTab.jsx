import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, IconButton, Menu,
  ListItemIcon, ListItemText, Chip, useTheme, InputAdornment, TextField,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Search as SearchIcon } from '@mui/icons-material';
import { IconPrinter, IconEye } from '@tabler/icons-react';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
];

const dummyClasses = [
  { id: 1, name: 'JSS 1A', class_name: 'JSS 1', arm_name: 'A' },
  { id: 2, name: 'JSS 2A', class_name: 'JSS 2', arm_name: 'A' },
  { id: 3, name: 'SS 1A', class_name: 'SS 1', arm_name: 'A' },
  { id: 4, name: 'SS 2A', class_name: 'SS 2', arm_name: 'A' },
];

const dummyStudents = [
  { id: 1, user_id: 'STD/2025/001', fname: 'Adebayo', lname: 'Tunde', mname: '', image: '', sex: 'Male', class_name: 'JSS 1', arm_name: 'A', class_desc_id: 1 },
  { id: 2, user_id: 'STD/2025/002', fname: 'Chidinma', lname: 'Obi', mname: '', image: '', sex: 'Female', class_name: 'JSS 1', arm_name: 'A', class_desc_id: 1 },
  { id: 3, user_id: 'STD/2025/003', fname: 'Emeka', lname: 'Uche', mname: '', image: '', sex: 'Male', class_name: 'JSS 1', arm_name: 'A', class_desc_id: 1 },
  { id: 4, user_id: 'STD/2025/004', fname: 'Aisha', lname: 'Mohammed', mname: '', image: '', sex: 'Female', class_name: 'JSS 2', arm_name: 'A', class_desc_id: 2 },
  { id: 5, user_id: 'STD/2025/005', fname: 'Fatima', lname: 'Abubakar', mname: '', image: '', sex: 'Female', class_name: 'JSS 2', arm_name: 'A', class_desc_id: 2 },
  { id: 6, user_id: 'STD/2025/006', fname: 'Ibrahim', lname: 'Musa', mname: '', image: '', sex: 'Male', class_name: 'SS 1', arm_name: 'A', class_desc_id: 3 },
];

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const ReportCardTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  const filteredStudents = dummyStudents.filter(s => {
    if (selectedClass && s.class_desc_id !== selectedClass) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = `${s.lname} ${s.fname} ${s.mname}`.toLowerCase();
      if (!fullName.includes(q) && !s.user_id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectedClassName = dummyClasses.find(c => c.id === selectedClass)?.name || '';

  const viewReportCard = (student) => {
    setActionMenuAnchor(null);
    window.open('/result-reportsheet', '_blank', 'noopener,noreferrer');
  };

  const viewCAReport = (student) => {
    setActionMenuAnchor(null);
    window.open('/result-cabreakdown', '_blank', 'noopener,noreferrer');
  };

  const viewClassDossier = () => {
    window.open('/result-reportcard-dossier', '_blank', 'noopener,noreferrer');
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {selectedClass
            ? `All Registered Students for ${selectedClassName}`
            : 'View Class Student Result'}
        </Typography>
        {selectedClass && (
          <Button variant="contained" size="small" color="info" startIcon={<IconPrinter size={16} />} onClick={viewClassDossier}>
            View / Print Class Dossier
          </Button>
        )}
      </Box>

      {/* ── Filters ─────────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Session-Term</InputLabel>
              <Select value={selectedSessionTerm} label="Session-Term"
                onChange={e => setSelectedSessionTerm(e.target.value)}>
                <MenuItem value="">-- Select Term --</MenuItem>
                {dummySessionTerms.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class"
                onChange={e => setSelectedClass(e.target.value)}>
                <MenuItem value="">-- Select Class --</MenuItem>
                {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField fullWidth size="small" placeholder="Name or User ID" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }} />
          </Grid>
        </Grid>
      </Box>

      {/* ── Table ───────────────────────────────────────────── */}
      <Box sx={{ p: 2 }}>
        <TableContainer sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                {['#', 'Session-Term', 'Full Details', 'Class', 'Gender', 'Action'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((s, i) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                  <TableCell sx={cellBorderSx}>{selectedSessionTerm ? dummySessionTerms.find(t => t.id === selectedSessionTerm)?.label : '-'}</TableCell>
                  <TableCell sx={cellBorderSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={s.image} sx={{ width: 36, height: 36, fontSize: 12 }}>
                        {!s.image && `${s.fname?.[0]}${s.lname?.[0]}`}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{s.lname} {s.fname} {s.mname}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.user_id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={cellBorderSx}>{s.class_name} {s.arm_name}</TableCell>
                  <TableCell sx={cellBorderSx}>{s.sex}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => { setActionMenuAnchor(e.currentTarget); setActionMenuRow(s); }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      No Student record found !!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Student Count ─────────────────────────────────── */}
        {filteredStudents.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Chip label={`${filteredStudents.length} student(s) found`} size="small" color="primary" variant="outlined" />
          </Box>
        )}
      </Box>

      {/* ── Row Action Menu ─────────────────────────────────── */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => { setActionMenuAnchor(null); setActionMenuRow(null); }}>
        <MenuItem onClick={() => viewCAReport(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View C.A Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => viewReportCard(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View Result</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default ReportCardTab;
