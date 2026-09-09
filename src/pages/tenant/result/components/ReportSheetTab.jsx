import { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, Divider,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconPrinter, IconClipboardCheck, IconArrowLeft, IconEye, IconFolder } from '@tabler/icons-react';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import { getResultTemplate } from './templates';

const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummyStudents = [
  { id: 1, class_id: 1, user_id: 'STD/2025/001', fname: 'Adebayo', lname: 'Tunde', mname: '', sex: 'Male', paid: true },
  { id: 2, class_id: 1, user_id: 'STD/2025/002', fname: 'Chidinma', lname: 'Obi', mname: '', sex: 'Female', paid: true },
  { id: 3, class_id: 1, user_id: 'STD/2025/003', fname: 'Emeka', lname: 'Uche', mname: '', sex: 'Male', paid: true },
  { id: 4, class_id: 1, user_id: 'STD/2025/004', fname: 'Aisha', lname: 'Mohammed', mname: '', sex: 'Female', paid: false },
  { id: 5, class_id: 1, user_id: 'STD/2025/005', fname: 'Fatima', lname: 'Abubakar', mname: '', sex: 'Female', paid: true },
  { id: 6, class_id: 2, user_id: 'STD/2025/006', fname: 'Ibrahim', lname: 'Musa', mname: '', sex: 'Male', paid: true },
  { id: 7, class_id: 2, user_id: 'STD/2025/007', fname: 'Ngozi', lname: 'Eze', mname: '', sex: 'Female', paid: true },
  { id: 8, class_id: 4, user_id: 'STD/2025/008', fname: 'Oluwaseun', lname: 'Adeyemi', mname: '', sex: 'Male', paid: false },
];
const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term', closing_date: '2026-07-12', resumption_date: '2026-09-08' },
];

const dummyReport = {
  position: '2nd', class_population: 42,
  subjects: [
    { subject_name: 'English Language', ca1: 18, ca2: 17, exam: 55, total: 90, grade: 'A', remark: 'Excellent', highest: 95, lowest: 32, position: 3 },
    { subject_name: 'Mathematics', ca1: 15, ca2: 14, exam: 48, total: 77, grade: 'B', remark: 'Good', highest: 88, lowest: 28, position: 8 },
    { subject_name: 'Physics', ca1: 12, ca2: 13, exam: 42, total: 67, grade: 'C+', remark: 'Above Average', highest: 82, lowest: 22, position: 15 },
    { subject_name: 'Chemistry', ca1: 16, ca2: 15, exam: 50, total: 81, grade: 'B+', remark: 'Very Good', highest: 90, lowest: 30, position: 6 },
    { subject_name: 'Biology', ca1: 10, ca2: 11, exam: 38, total: 59, grade: 'C', remark: 'Average', highest: 78, lowest: 18, position: 22 },
    { subject_name: 'Civic Education', ca1: 14, ca2: 13, exam: 45, total: 72, grade: 'B', remark: 'Good', highest: 85, lowest: 25, position: 10 },
  ],
  affective: { Punctuality: 4, Honesty: 5, Reliability: 4, Respect: 5, 'Self-Control': 4, 'Co-operation': 4, Neatness: 3, Politeness: 5, 'Industry': 4, 'Sense of Responsibility': 4 },
  psychomotor: { Handwriting: 4, Fluency: 3, Drawing: 5, 'Creative Art': 4, 'Speech Fluency': 3, 'Sports/Game': 4 },
  teacherComment: 'A hardworking student who shows great potential. Keep it up!',
  adminComment: 'Consistent effort and good conduct. Continue to strive for excellence.',
  attendance: { opened: 120, present: 115, absent: 5 },
  terms_opened: 3, total_score: 446,
};

const gradeScale = [
  { range: '75 - 100', grade: 'A', remark: 'Excellent' },
  { range: '65 - 74', grade: 'B', remark: 'Good' },
  { range: '55 - 64', grade: 'C+', remark: 'Above Average' },
  { range: '45 - 54', grade: 'C', remark: 'Average' },
  { range: '35 - 44', grade: 'D', remark: 'Fair' },
  { range: '0 - 34', grade: 'F', remark: 'Fail' },
];

const gradeColors = { 'A+': '#16A34A', 'A': '#22C55E', 'B+': '#3B82F6', 'B': '#60A5FA', 'C+': '#D97706', 'C': '#F59E0B', 'D': '#EA580C', 'F': '#DC2626' };

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const nextClassFor = (className) => {
  const map = { 'JSS 1A': 'JSS 2A', 'JSS 2A': 'JSS 3A', 'SS 1A': 'SS 2A', 'SS 2A': 'SS 3A' };
  return map[className] || 'Next Class';
};

const ReportSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { getTemplateIndex } = useResultTemplate();
  const [selectedClass, setSelectedClass] = useState(1);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState(1);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  // view: { mode: 'list' } | { mode: 'single', student } | { mode: 'class', students }
  const [view, setView] = useState({ mode: 'list' });
  const printRef = useRef(null);

  const className = dummyClasses.find(c => c.id === selectedClass)?.name || '';
  const classStudents = dummyStudents.filter(s => s.class_id === selectedClass);
  const paidStudents = classStudents.filter(s => s.paid);
  const sessionTerm = dummySessionTerms.find(s => s.id === selectedSessionTerm);
  const activeStudent = view.mode === 'single' ? view.student : null;
  const dossierStudents = view.mode === 'class' ? (view.students || []) : [];

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Dossier</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            table { border-collapse: collapse; width: 100%; }
            table, th, td { border: 1px solid #000; }
            th, td { padding: 4px 8px; text-align: left; vertical-align: middle; }
            th { font-weight: 700; }
            img { max-width: 100%; height: auto; }
            strong { font-weight: 700; }
            u { text-decoration: underline; }
            .tpl1-header-box, .tpl2-header-box { display: flex; flex-wrap: wrap; }
            .tpl1-header-box > div, .tpl2-header-box > div { flex: 1 1 200px; }
            .tpl1-main, .tpl2-main { display: flex; flex-wrap: wrap; }
            .tpl1-cognitive, .tpl2-cognitive { flex: 3 1 0%; }
            .tpl1-affective, .tpl2-right { flex: 1 1 0%; }
            .tpl1-bottom-row, .tpl2-keys-row { display: flex; flex-wrap: wrap; }
            .tpl1-bottom-row > div, .tpl2-keys-row > div { flex: 1 1 0%; }
            @page { size: A4 portrait; margin: 10mm 10mm 10mm 10mm; }
            @media print { body { margin: 0; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 800);
  };

  const renderDossier = (s, term) => {
    const cls = dummyClasses.find(c => c.id === s.class_id);
    const TemplateComponent = getResultTemplate(getTemplateIndex());
    return (
      <TemplateComponent
        student={s}
        report={dummyReport}
        sessionTerm={term}
        className={cls?.name}
        gradeScale={gradeScale}
      />
    );
  };

  /* ── Dossier (single / class) view ─────────────────────── */
  if (view.mode === 'single' || view.mode === 'class') {
    const students = view.mode === 'single' ? [activeStudent] : dossierStudents;
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" startIcon={<IconArrowLeft size={16} />} onClick={() => setView({ mode: 'list' })}>
              Back to Class List
            </Button>
            <Typography variant="h6" fontWeight={600}>
              {view.mode === 'single'
                ? `Student Dossier — ${activeStudent?.lname} ${activeStudent?.fname}`
                : `Class Dossier — ${className} (${students.length})`}
            </Typography>
          </Box>
          {students.length > 0 && (
            <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
              Print Dossier
            </Button>
          )}
        </Box>

        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto', width: '100%', maxWidth: '100%' }} ref={printRef}>
          {students.length > 0 ? (
            students.map((s, i) => (
              <Box key={s.id} sx={{ mb: 2, '@media print': { pageBreakAfter: 'always' } }}>
                {renderDossier(s, sessionTerm)}
                {i < students.length - 1 && <Divider sx={{ my: 4 }} />}
              </Box>
            ))
          ) : (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <IconClipboardCheck size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No dossiers available
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                There are no paid students with results to display for the selected class.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  /* ── Class list (dossier landing) view ─────────────────── */
  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Students List — {className || 'Select a class'}
        </Typography>
        {classStudents.length > 0 && (
          <Button
            variant="contained"
            size="small"
            startIcon={<IconPrinter size={16} />}
            onClick={() => setView({ mode: 'class', students: paidStudents })}
          >
            View / Print Class Dossier
            <Chip label={paidStudents.length} size="small" sx={{ ml: 1, bgcolor: 'success.main', color: '#fff', fontWeight: 700 }} />
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
        </Grid>
      </Box>

      {/* ── Students Table ──────────────────────────────────── */}
      {selectedClass && selectedSessionTerm && classStudents.length > 0 ? (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                {['#', 'Student', 'Sex', 'Action'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align={h === 'Student' ? 'left' : 'center'}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {classStudents.map((s, i) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                  <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>{s.fname?.[0]}{s.lname?.[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{s.lname} {s.fname} {s.mname}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.user_id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={cellBorderSx}>{s.sex}</TableCell>
                  <TableCell align="center" sx={cellBorderSx}>
                    <IconButton size="small" onClick={(e) => { setActionMenuAnchor(e.currentTarget); setActionMenuRow(s); }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <IconFolder size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {selectedClass && selectedSessionTerm
              ? 'No students found in this class'
              : 'Select a session-term and class to view the student list'}
          </Typography>
        </Box>
      )}

      {/* ── Row Action Menu ─────────────────────────────────── */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => { setActionMenuAnchor(null); setActionMenuRow(null); }}
      >
        <MenuItem onClick={() => {
          setView({ mode: 'single', student: actionMenuRow });
          setActionMenuAnchor(null);
          setActionMenuRow(null);
        }}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View Result</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default ReportSheetTab;