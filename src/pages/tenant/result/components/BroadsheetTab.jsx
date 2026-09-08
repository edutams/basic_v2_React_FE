import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, FormControl, InputLabel, Select, MenuItem, Menu, Alert, useTheme, Tooltip, Tabs, Tab,
  Card, CardHeader, CardContent, Button, Avatar, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert as MuiAlert,
} from '@mui/material';
import { IconDownload, IconCheck, IconX, IconMessage, IconEdit, IconArrowsHorizontal } from '@tabler/icons-react';

const dummySessions = [
  { id: 1, name: '2025/2026' },
];
const dummyTerms = [
  { id: 1, name: 'First Term' },
  { id: 2, name: 'Second Term' },
  { id: 3, name: 'Third Term' },
];
const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' },
  { id: 2, name: 'Senior Secondary' },
];
const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummySubjects = [
  { id: 1, name: 'English Language', ca: 20, exam: 60, total: 80 },
  { id: 2, name: 'Mathematics', ca: 20, exam: 60, total: 80 },
  { id: 3, name: 'Physics', ca: 20, exam: 60, total: 80 },
  { id: 4, name: 'Chemistry', ca: 20, exam: 60, total: 80 },
  { id: 5, name: 'Biology', ca: 20, exam: 60, total: 80 },
  { id: 6, name: 'Civic Education', ca: 20, exam: 60, total: 80 },
];

const gradeFor = (overallTotal, total) => {
  const percentage = (overallTotal / total) * 100;
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C+';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D+';
  if (percentage >= 30) return 'D';
  return 'F';
};

const generateBroadsheetData = () => {
  const names = [
    'Adebayo Tunde', 'Chidinma Obi', 'Emeka Uche', 'Aisha Mohammed', 'Fatima Abubakar',
    'Ibrahim Musa', 'Ngozi Eze', 'Oluwaseun Adeyemi', 'Blessing Okoro', 'Yusuf Abdullahi',
    'Grace Nnamdi', 'Tunde Bakare', 'Nneka Okwu', 'Segun Alabi', 'Amara Nwosu',
  ];
  const genders = ['male', 'female', 'male', 'female', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female'];
  const promotionOptions = ['promoted', 'not promoted', 'promoted', 'promoted on trial', 'promoted'];

  return names.map((name, i) => {
    const results = dummySubjects.map(subj => {
      const caGroups = [
        { display_name: 'CA1', entities: [{ display_name: 'Test 1', max_score: 10, score: Math.floor(Math.random() * 7) + 4 }] },
        { display_name: 'CA2', entities: [{ display_name: 'Test 2', max_score: 10, score: Math.floor(Math.random() * 7) + 4 }] },
      ];
      const caScore = caGroups.reduce((sum, g) => sum + g.entities.reduce((s, e) => s + e.score, 0), 0);
      const examScore = Math.floor(Math.random() * (subj.exam - 10)) + 10;
      const overallTotal = caScore + examScore;
      return { subject_id: subj.id, subject_name: subj.name, ca_total: caScore, exam_score: examScore, overall_total: overallTotal, grade: gradeFor(overallTotal, subj.total), ca_breakdown: caGroups };
    });
    const totalScores = results.reduce((sum, r) => sum + r.overall_total, 0);
    const studentAvg = (totalScores / results.length).toFixed(2);
    return {
      id: i + 1,
      user: { lname: name.split(' ')[0], fname: name.split(' ')[1] || '', mname: name.split(' ')[2] || '', sex: genders[i], user_id: `STD/2025/${String(i + 1).padStart(3, '0')}` },
      results, student_average: studentAvg, overall_class_position: 0, total_subjects: results.length,
      class_teachers_comment: '', hos_comment: '',
      bmi_params: { startTermWeight: '', endTermWeight: '', startTermHeight: '', endTermHeight: '', cleanliness: '' },
      promotion_recommendation: promotionOptions[i % promotionOptions.length],
      first_term_average: (Math.random() * 40 + 50).toFixed(2),
      second_term_average: (Math.random() * 40 + 50).toFixed(2),
      third_term_average: (Math.random() * 40 + 50).toFixed(2),
      all_term_average: (Math.random() * 40 + 50).toFixed(2),
      all_term_overall_class_position: 0,
    };
  });
};

const BroadsheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({ session_id: '', term_id: '', programme_id: '', classId: '', perf_range: '' });
  const [broadsheetData, setBroadsheetData] = useState(() => generateBroadsheetData());
  const [showData, setShowData] = useState(false);
  const [showPromotionButtons, setShowPromotionButtons] = useState(false);
  const [nextClasses] = useState(['JSS 2A', 'JSS 2B', 'SS 1A', 'SS 1B', 'SS 2A']);
  const [selectedNextClass, setSelectedNextClass] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [commentDialog, setCommentDialog] = useState({ open: false, student: null, mode: 'teacher' });
  const [commentForm, setCommentForm] = useState({ teacher_comment: '', hos_comment: '' });
  const [addEditMenu, setAddEditMenu] = useState({ rowId: null, anchorEl: null });
  const [editScoresDialog, setEditScoresDialog] = useState({ open: false, student: null });
  const [scoreForm, setScoreForm] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sortedData = useMemo(() => {
    const sorted = [...broadsheetData].sort((a, b) => parseFloat(b.student_average) - parseFloat(a.student_average));
    sorted.forEach((s, i) => { s.overall_class_position = i + 1; });
    return sorted;
  }, [broadsheetData]);

  const cumulativeSortedData = useMemo(() => {
    const sorted = [...broadsheetData].sort((a, b) => parseFloat(b.all_term_average) - parseFloat(a.all_term_average));
    sorted.forEach((s, i) => { s.all_term_overall_class_position = i + 1; });
    return sorted;
  }, [broadsheetData]);

  const filteredData = useMemo(() => {
    const data = activeTab === 0 ? sortedData : cumulativeSortedData;
    if (!filters.perf_range) return data;
    const count = parseInt(filters.perf_range, 10);
    return data.filter(s => activeTab === 0 ? s.overall_class_position <= count : s.all_term_overall_class_position <= count);
  }, [sortedData, cumulativeSortedData, filters.perf_range, activeTab]);

  const handleFilter = () => {
    if (activeTab === 0) {
      if (filters.session_id && filters.term_id && filters.programme_id && filters.classId) {
        setShowData(true);
        setShowPromotionButtons(filters.term_id === 3);
      }
    } else {
      if (filters.session_id && filters.programme_id && filters.classId) {
        setShowData(true);
      }
    }
  };

  const handleOpenComment = (student, mode = 'teacher') => {
    setCommentForm({
      teacher_comment: student.class_teachers_comment || '',
      hos_comment: student.hos_comment || '',
    });
    setCommentDialog({ open: true, student, mode });
  };

  const handleSaveComment = () => {
    const { student, mode } = commentDialog;
    if (student) {
      setBroadsheetData(prev => prev.map(row => {
        if (row.id !== student.id) return row;
        return {
          ...row,
          class_teachers_comment: mode === 'teacher' ? commentForm.teacher_comment : row.class_teachers_comment,
          hos_comment: mode === 'hos' ? commentForm.hos_comment : row.hos_comment,
        };
      }));
    }
    setSnackbar({ open: true, message: 'Comment saved successfully', severity: 'success' });
    setCommentDialog({ open: false, student: null, mode: 'teacher' });
  };

  const isScoreInvalid = (value, max) => {
    if (value === '' || value === null || value === undefined) return false;
    const n = Number(value);
    return Number.isNaN(n) || n < 0 || n > max;
  };

  const handleAddEditClick = (e, row) => {
    setAddEditMenu({ rowId: row.id, anchorEl: e.currentTarget });
  };

  const closeAddEditMenu = () => setAddEditMenu({ rowId: null, anchorEl: null });

  const handleOpenEditScores = (row) => {
    const form = row.results.map(r => {
      const def = dummySubjects.find(s => s.id === r.subject_id) || { ca: 20, exam: 60, total: 80 };
      return {
        subject_id: r.subject_id,
        subject_name: r.subject_name,
        ca_breakdown: (r.ca_breakdown || []).map(g => ({
          display_name: g.display_name,
          entities: g.entities.map(e => ({ display_name: e.display_name, max_score: e.max_score, score: String(e.score) })),
        })),
        exam_score: String(r.exam_score),
        max_exam: def.exam,
        total: def.total,
      };
    });
    setScoreForm(form);
    setEditScoresDialog({ open: true, student: row });
  };

  const handleCloseEditScores = () => {
    setEditScoresDialog({ open: false, student: null });
    setScoreForm([]);
  };

  const handleScoreChange = (subjectIdx, groupIdx, entityIdx, value) => {
    setScoreForm(prev => prev.map((subj, i) => {
      if (i !== subjectIdx) return subj;
      return {
        ...subj,
        ca_breakdown: subj.ca_breakdown.map((g, gi) => gi !== groupIdx ? g : {
          ...g,
          entities: g.entities.map((e, ei) => ei !== entityIdx ? e : { ...e, score: value }),
        }),
      };
    }));
  };

  const handleExamChange = (subjectIdx, value) => {
    setScoreForm(prev => prev.map((subj, i) => i !== subjectIdx ? subj : { ...subj, exam_score: value }));
  };

  const handleSaveScoreRow = (subjectIdx) => {
    const subj = scoreForm[subjectIdx];
    if (!subj) return;
    const invalidEntity = subj.ca_breakdown.some(g => g.entities.some(e => e.score === '' || isScoreInvalid(e.score, e.max_score)));
    const invalidExam = subj.exam_score === '' || isScoreInvalid(subj.exam_score, subj.max_exam);
    if (invalidEntity || invalidExam) {
      setSnackbar({ open: true, message: 'Fix invalid scores before saving', severity: 'error' });
      return;
    }
    const caTotal = subj.ca_breakdown.reduce((sum, g) => sum + g.entities.reduce((s, e) => s + (Number(e.score) || 0), 0), 0);
    const examScore = Number(subj.exam_score) || 0;
    const overallTotal = caTotal + examScore;
    const grade = gradeFor(overallTotal, subj.total);
    const student = editScoresDialog.student;
    setBroadsheetData(prev => prev.map(row => {
      if (row.id !== student.id) return row;
      const results = row.results.map((r, i) => i !== subjectIdx ? r : {
        ...r,
        ca_total: caTotal,
        exam_score: examScore,
        overall_total: overallTotal,
        grade,
        ca_breakdown: subj.ca_breakdown.map(g => ({ ...g, entities: g.entities.map(e => ({ ...e, score: Number(e.score) || 0 })) })),
      });
      const studentAverage = (results.reduce((s, r) => s + r.overall_total, 0) / results.length).toFixed(2);
      return { ...row, results, student_average: studentAverage };
    }));
    setSnackbar({ open: true, message: `${subj.subject_name} score updated`, severity: 'success' });
  };

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  return (
    <Box>
      <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, borderRadius: 1 }}>
        <CardHeader
          title="Result Broadsheet"
          action={showData && <Button variant="contained" size="small" startIcon={<IconDownload size={16} />}>Export Broadsheet</Button>}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 0 },
            '& .MuiCardHeader-action': { m: 0 },
          }}
        />

        {/* ── Nested Tabs ────────────────────────────────────── */}
        <Box sx={{ px: 2 }}>
          <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setShowData(false); }} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Termly" />
            <Tab label="Term Cummulative" />
          </Tabs>
        </Box>

        {/* ── Shared Filters ─────────────────────────────────── */}
        <CardContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select value={filters.session_id} label="Session" onChange={e => setFilters({ ...filters, session_id: e.target.value })}>
                  <MenuItem value="">-- choose --</MenuItem>
                  {dummySessions.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {activeTab === 0 && (
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select value={filters.term_id} label="Term" onChange={e => setFilters({ ...filters, term_id: e.target.value })}>
                    <MenuItem value="">-- choose --</MenuItem>
                    {dummyTerms.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={filters.programme_id} label="Programme" onChange={e => setFilters({ ...filters, programme_id: e.target.value })}>
                  <MenuItem value="">--Select Programme--</MenuItem>
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filters.classId} label="Class" onChange={e => setFilters({ ...filters, classId: e.target.value })}>
                  <MenuItem value="">-- Select Class --</MenuItem>
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {showData && (
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Performance</InputLabel>
                  <Select value={filters.perf_range} label="Performance" onChange={e => setFilters({ ...filters, perf_range: e.target.value })}>
                    <MenuItem value="">-- Select Range --</MenuItem>
                    <MenuItem value="3">Best 3</MenuItem>
                    <MenuItem value="5">Best 5</MenuItem>
                    <MenuItem value="10">Best 10</MenuItem>
                    <MenuItem value="15">Best 15</MenuItem>
                    <MenuItem value="20">Best 20</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button variant="contained" fullWidth onClick={handleFilter}>Filter</Button>
            </Grid>
          </Grid>

          {showData && showPromotionButtons && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button variant="outlined" color="primary" size="small">Recommend Promotion</Button>
              <Button variant="outlined" color="secondary" size="small">Post Recommendation</Button>
            </Box>
          )}

          {/* ── School Info Header ─────────────────────────────── */}
          {showData && (
            <Box sx={{ mb: 2, border: `1px solid ${borderColor}`, borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, borderBottom: `1px solid ${borderColor}` }}>
                <Box sx={{ flex: 1, p: 1, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, sm: 'none' }, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Name Of School</Box>
                <Box sx={{ flex: 3, p: 1, fontWeight: 600 }}>Greenfield Academy International</Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1, p: 1, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, sm: 'none' }, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Session</Box>
                <Box sx={{ flex: 2, p: 1, fontWeight: 600, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, sm: 'none' } }}>{dummySessions.find(s => s.id === filters.session_id)?.name || ''}</Box>
                {activeTab === 0 && (
                  <>
                    <Box sx={{ flex: 1, p: 1, borderRight: { xs: 'none', sm: `1px solid ${borderColor}` }, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Term</Box>
                    <Box sx={{ flex: 2, p: 1, fontWeight: 600 }}>{dummyTerms.find(t => t.id === filters.term_id)?.name || ''}</Box>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* ── Broadsheet Table ───────────────────────────────── */}
          {showData && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.5, mb: 1 }}>
                <IconArrowsHorizontal size={14} /> Swipe horizontally to view all columns
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } }, whiteSpace: 'nowrap', minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell rowSpan={2} sx={{ position: 'sticky', left: 0, zIndex: 3, bgcolor: '#fc9d49', color: '#fff', fontWeight: 700, minWidth: { xs: 150, sm: 250 }, verticalAlign: 'middle', borderRight: `1px solid ${borderColor}` }}>
                        Student Info
                      </TableCell>
                      {dummySubjects.map(subj => (
                        <TableCell key={subj.id} colSpan={4} align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, borderRight: `1px solid ${borderColor}`, minWidth: 200 }}>
                          {subj.name}
                        </TableCell>
                      ))}
                      <TableCell colSpan={activeTab === 1 ? 7 : (showPromotionButtons ? 7 : 4)} align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, borderRight: `1px solid ${borderColor}` }}>
                        SUMMARY
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {dummySubjects.map(subj => (
                        <TableCell key={`sub-${subj.id}-ca`} align="center" sx={{ bgcolor: '#c3dfe3', fontWeight: 700, minWidth: { xs: 40, sm: 48 } }}>
                          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CA ({subj.ca})</Typography>
                        </TableCell>
                      ))}
                      {dummySubjects.map(subj => (
                        <TableCell key={`sub-${subj.id}-ex`} align="center" sx={{ bgcolor: '#c3dfe3', fontWeight: 700, minWidth: { xs: 40, sm: 48 } }}>
                          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>EXAM ({subj.exam})</Typography>
                        </TableCell>
                      ))}
                      {dummySubjects.map(subj => (
                        <TableCell key={`sub-${subj.id}-tot`} align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: { xs: 40, sm: 48 } }}>
                          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>TOTAL ({subj.total})</Typography>
                        </TableCell>
                      ))}
                      {dummySubjects.map(subj => (
                        <TableCell key={`sub-${subj.id}-gr`} align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: { xs: 40, sm: 48 } }}>
                          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>GRADE</Typography>
                        </TableCell>
                      ))}
                      {activeTab === 1 && (
                        <>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>1ST TERM</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>2ND TERM</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>3RD TERM</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CUM AVG</Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CWA</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>POSITION</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>NO. SUBJ</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>REMARK</Typography>
                      </TableCell>
                      {activeTab === 0 && showPromotionButtons && (
                        <>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>RECOMMENDATION</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}>
                            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>PROMOTION</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: { xs: 72, sm: 80 } }}>NEXT CLASS</TableCell>
                        </>
                      )}
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 110, sm: 120 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>CLASS TEACHER COMMENT</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 110, sm: 120 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>HEAD OF SCHOOL COMMENT</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 96, sm: 100 } }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>ACTION</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper', borderRight: `1px solid ${borderColor}`, minWidth: { xs: 150, sm: 250 }, p: { xs: 0.5, sm: 1 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                            <Avatar sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, bgcolor: 'primary.main', fontSize: { xs: 12, sm: 14 } }}>{row.user.lname?.[0]}{row.user.fname?.[0]}</Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 12, sm: 14 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.user.lname} {row.user.fname} {row.user.mname}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{row.user.sex === 'female' ? 'F' : 'M'} &middot; {row.user.user_id}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {row.results.map((result, rIdx) => (
                          <TableCell key={`ca-${rIdx}`} align="center" sx={{ bgcolor: '#b0cbcf', fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>{result.ca_total}</TableCell>
                        ))}
                        {row.results.map((result, rIdx) => (
                          <TableCell key={`ex-${rIdx}`} align="center" sx={{ bgcolor: '#b0cbcf', fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>{result.exam_score}</TableCell>
                        ))}
                        {row.results.map((result, rIdx) => (
                          <TableCell key={`tot-${rIdx}`} align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>{result.overall_total}</TableCell>
                        ))}
                        {row.results.map((result, rIdx) => (
                          <TableCell key={`gr-${rIdx}`} align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 48 } }}>{result.grade}</TableCell>
                        ))}
                        {activeTab === 1 && (
                          <>
                            <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{row.first_term_average}</TableCell>
                            <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{row.second_term_average}</TableCell>
                            <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{row.third_term_average}</TableCell>
                            <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>{row.all_term_average}</TableCell>
                          </>
                        )}
                        <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 44, sm: 60 } }}>
                          {activeTab === 0 ? row.student_average : row.all_term_average}
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}>
                          {activeTab === 0 ? row.overall_class_position : row.all_term_overall_class_position}
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}>{row.total_subjects}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}>-</TableCell>
                        {activeTab === 0 && showPromotionButtons && (
                          <>
                            <TableCell align="center" sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 50 }, textTransform: 'capitalize' }}>{row.promotion_recommendation}</TableCell>
                            <TableCell align="center" sx={{ minWidth: { xs: 40, sm: 50 } }}>
                              <Tooltip title={row.promotion_recommendation === 'promoted' ? 'Promoted' : 'Not Promoted'}>
                                {row.promotion_recommendation === 'promoted' ? (
                                  <IconCheck size={18} color="#16A34A" style={{ cursor: 'pointer' }} />
                                ) : row.promotion_recommendation === 'promoted on trial' ? (
                                  <IconCheck size={18} color="#D97706" style={{ cursor: 'pointer' }} />
                                ) : (
                                  <IconX size={18} color="#DC2626" style={{ cursor: 'pointer' }} />
                                )}
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center" sx={{ minWidth: { xs: 72, sm: 80 } }}>
                              {(row.promotion_recommendation === 'promoted' || row.promotion_recommendation === 'promoted on trial') ? (
                                <FormControl size="small" fullWidth>
                                  <Select value={selectedNextClass[row.id] || ''} onChange={e => setSelectedNextClass({ ...selectedNextClass, [row.id]: e.target.value })} sx={{ fontSize: 12 }}>
                                    {nextClasses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                  </Select>
                                </FormControl>
                              ) : '-'}
                            </TableCell>
                          </>
                        )}
                        <TableCell sx={{ minWidth: { xs: 110, sm: 120 }, fontSize: 12 }}>{row.class_teachers_comment || '-'}</TableCell>
                        <TableCell sx={{ minWidth: { xs: 110, sm: 120 }, fontSize: 12 }}>{row.hos_comment || '-'}</TableCell>
                        <TableCell sx={{ minWidth: { xs: 96, sm: 100 } }}>
                          <Button size="small" variant="contained" color="primary" sx={{ fontSize: 12, px: 1, minWidth: 0, textTransform: 'none' }} onClick={(e) => handleAddEditClick(e, row)}>
                            Add/Edit
                          </Button>
                          <Menu anchorEl={addEditMenu.anchorEl} open={Boolean(addEditMenu.anchorEl) && addEditMenu.rowId === row.id} onClose={closeAddEditMenu}>
                            <MenuItem dense onClick={() => { closeAddEditMenu(); handleOpenComment(row, 'teacher'); }}>
                              <IconMessage size={16} style={{ marginRight: 8 }} /> Class Teacher
                            </MenuItem>
                            <MenuItem dense onClick={() => { closeAddEditMenu(); handleOpenComment(row, 'hos'); }}>
                              <IconMessage size={16} style={{ marginRight: 8 }} /> HoS Comment
                            </MenuItem>
                            <MenuItem dense onClick={() => { closeAddEditMenu(); handleOpenEditScores(row); }}>
                              <IconEdit size={16} style={{ marginRight: 8 }} /> Edit Scores
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 0.5 },
                  '& .MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
                }}
              />
            </>
          )}

          {!showData && (
            <Alert severity="info" sx={{ mt: 1 }}>
              {activeTab === 0
                ? 'Select Session, Term, Programme, and Class, then click Filter to view the broadsheet.'
                : 'Select Session, Programme, and Class, then click Filter to view the term cumulative broadsheet.'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ── Comment Dialog ──────────────────────────────────── */}
      <Dialog open={commentDialog.open} onClose={() => setCommentDialog({ open: false, student: null, mode: 'teacher' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {commentDialog.mode === 'hos' ? 'Head of School Comment' : 'Class Teacher Comment'} — {commentDialog.student?.user?.lname} {commentDialog.student?.user?.fname}
        </DialogTitle>
        <DialogContent dividers>
          {commentDialog.mode === 'hos' ? (
            <TextField
              label="Head of School Comment" fullWidth multiline rows={4}
              value={commentForm.hos_comment}
              onChange={e => setCommentForm({ ...commentForm, hos_comment: e.target.value })}
            />
          ) : (
            <TextField
              label="Class Teacher Comment" fullWidth multiline rows={4}
              value={commentForm.teacher_comment}
              onChange={e => setCommentForm({ ...commentForm, teacher_comment: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog({ open: false, student: null, mode: 'teacher' })}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveComment}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Scores Dialog (DirectScoreModal-style) ──────── */}
      <Dialog open={editScoresDialog.open} onClose={handleCloseEditScores} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit Scores — {editScoresDialog.student?.user?.lname} {editScoresDialog.student?.user?.fname}
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  {scoreForm[0]?.ca_breakdown.map(g => (
                    <TableCell key={g.display_name} colSpan={g.entities.length} align="center" sx={{ fontWeight: 700 }}>
                      {g.display_name}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700 }}>CA Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Exam Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} />
                  {scoreForm[0]?.ca_breakdown.map(g => g.entities.map(e => (
                    <TableCell key={e.display_name} align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {e.display_name}({e.max_score})
                    </TableCell>
                  )))}
                  <TableCell align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    (Max {scoreForm[0]?.ca_breakdown.reduce((s, g) => s + g.entities.reduce((x, e) => x + e.max_score, 0), 0)})
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    (Max {scoreForm[0]?.max_exam})
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {scoreForm.map((subj, i) => {
                  const caTotal = subj.ca_breakdown.reduce((sum, g) => sum + g.entities.reduce((s, e) => s + (Number(e.score) || 0), 0), 0);
                  return (
                    <TableRow key={subj.subject_id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{subj.subject_name}</TableCell>
                      {subj.ca_breakdown.map((g, gi) => g.entities.map((e, ei) => (
                        <TableCell key={`${gi}-${ei}`} align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={e.score}
                            onChange={ev => handleScoreChange(i, gi, ei, ev.target.value)}
                            error={isScoreInvalid(e.score, e.max_score)}
                            helperText={isScoreInvalid(e.score, e.max_score) ? 'Invalid score' : ' '}
                            inputProps={{ min: 0, max: e.max_score, style: { textAlign: 'center', width: 64, padding: '6px 4px' } }}
                            sx={{ '& .MuiFormHelperText-root': { m: 0, fontSize: 10 } }}
                          />
                        </TableCell>
                      )))}
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{caTotal}</TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={subj.exam_score}
                          onChange={ev => handleExamChange(i, ev.target.value)}
                          error={isScoreInvalid(subj.exam_score, subj.max_exam)}
                          helperText={isScoreInvalid(subj.exam_score, subj.max_exam) ? 'Invalid score' : ' '}
                          inputProps={{ min: 0, max: subj.max_exam, style: { textAlign: 'center', width: 64, padding: '6px 4px' } }}
                          sx={{ '& .MuiFormHelperText-root': { m: 0, fontSize: 10 } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small"  onClick={() => handleSaveScoreRow(i)}>
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditScores}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────── */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default BroadsheetTab;
