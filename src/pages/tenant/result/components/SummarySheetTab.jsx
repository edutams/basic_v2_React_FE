import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, useTheme,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
];
const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummySubjects = ['ENG', 'MATH', 'PHY', 'CHEM', 'BIO', 'CIVIC', 'FRENCH', 'LIT', 'AGR', 'BTS', 'COMP', 'MGT'];
const grades = [
  { grade: 'A+', min: 90, max: 100 },
  { grade: 'A', min: 80, max: 89 },
  { grade: 'B+', min: 70, max: 79 },
  { grade: 'B', min: 60, max: 69 },
  { grade: 'C+', min: 50, max: 59 },
  { grade: 'C', min: 40, max: 49 },
  { grade: 'D', min: 30, max: 39 },
  { grade: 'E', min: 20, max: 29 },
  { grade: 'F', min: 0, max: 19 },
];

const dummyBreakdown = {
  ENG: [
    { user_id: 'STD/2025/001', lname: 'Tunde', fname: 'Adebayo', image: '', ca_score: 18, exam_score: 55, total: 73 },
    { user_id: 'STD/2025/002', lname: 'Obi', fname: 'Chidinma', image: '', ca_score: 15, exam_score: 48, total: 63 },
  ],
  MATH: [
    { user_id: 'STD/2025/003', lname: 'Uche', fname: 'Emeka', image: '', ca_score: 12, exam_score: 42, total: 54 },
  ],
};

const generateSummary = () => {
  const summary = {};
  dummySubjects.forEach(subj => { summary[subj] = grades.map(() => Math.floor(Math.random() * 8)); });
  return summary;
};

const SummarySheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [summary] = useState(() => generateSummary());
  const [breakdownDialog, setBreakdownDialog] = useState({ open: false, subject: '', gradeIdx: 0 });

  const getGradeCount = (subj, gradeIdx) => summary[subj]?.[gradeIdx] || 0;
  const getSubjectTotal = (subj) => grades.reduce((sum, g, i) => sum + getGradeCount(subj, i), 0);

  const showData = selectedSessionTerm && selectedClass;
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="h6" fontWeight={700}>SUMMARY SHEET ON GRADE DISTRIBUTIONS.</Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* ── Filters (inline, same card) ──────────────────────── */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Session Term</InputLabel>
              <Select value={selectedSessionTerm} label="Session Term" onChange={e => setSelectedSessionTerm(e.target.value)}>
                <MenuItem value="">-- Select Session Term --</MenuItem>
                {dummySessionTerms.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
                <MenuItem value="">-- Select Class --</MenuItem>
                {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* ── Table Container (scrollable) ────────────────────── */}
        {showData && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 600, display: 'flex', flexDirection: 'column' }}>

              {/* ── Main Data Row ─────────────────────────────── */}
              <Box sx={{ display: 'flex', mb: 0 }}>
                {/* Left: GRADE header + grade labels */}
                <Box sx={{ flexShrink: 0 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 140, height: 280, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: isDark ? 'grey.900' : '#f5f5f5' }}>
                          GRADE
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grades.map((g) => (
                        <TableRow key={g.grade}>
                          <TableCell sx={{ height: 49, fontWeight: 700, border: `1px solid ${borderColor}`, whiteSpace: 'nowrap' }}>
                            {g.grade} ({g.min} - {g.max})
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>

                {/* Right: Subject columns */}
                <Box sx={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
                  {dummySubjects.map(subj => (
                    <Box key={subj} sx={{ flexShrink: 0, minWidth: 70 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ height: 280, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: isDark ? 'grey.900' : '#f5f5f5', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>
                              {subj}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {grades.map((g, gi) => (
                            <TableRow key={g.grade}>
                              <TableCell
                                sx={{ height: 49, fontWeight: 600, textAlign: 'center', border: `1px solid ${borderColor}`, cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setBreakdownDialog({ open: true, subject: subj, gradeIdx: gi })}
                              >
                                {getGradeCount(subj, gi)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ── OUTLIER Row ───────────────────────────────── */}
              <Box sx={{ display: 'flex', mb: 0 }}>
                <Box sx={{ flexShrink: 0 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: '#DC2626', color: '#fff' }}>
                          OUTLIER
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </Box>
                <Box sx={{ display: 'flex', flex: 1 }}>
                  {dummySubjects.map(subj => (
                    <Box key={`outlier-${subj}`} sx={{ flexShrink: 0, minWidth: 70 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: '#DC2626', color: '#fff' }}>
                              0
                            </TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ── Total Row ─────────────────────────────────── */}
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ flexShrink: 0 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}` }}>
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </Box>
                <Box sx={{ display: 'flex', flex: 1 }}>
                  {dummySubjects.map(subj => (
                    <Box key={`total-${subj}`} sx={{ flexShrink: 0, minWidth: 70 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}` }}>
                              {getSubjectTotal(subj)}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </Box>
                  ))}
                </Box>
              </Box>

            </Box>
          </Box>
        )}

        {/* ── Export Button ──────────────────────────────────── */}
        {showData && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="small" color="success">Export to Excel</Button>
          </Box>
        )}
      </Box>

      {/* ── Breakdown Dialog ────────────────────────────────── */}
      <Dialog open={breakdownDialog.open} onClose={() => setBreakdownDialog({ open: false, subject: '', gradeIdx: 0 })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Summary Breakdown for {breakdownDialog.subject} Grade {grades[breakdownDialog.gradeIdx]?.grade} Distribution
          </Typography>
          <IconX size={20} style={{ cursor: 'pointer' }} onClick={() => setBreakdownDialog({ open: false, subject: '', gradeIdx: 0 })} />
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                {['#', 'Photo', 'Participant ID', 'Participant Name', 'CA Score', 'Exam Score', 'Total'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(dummyBreakdown[breakdownDialog.subject] || []).map((p, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{i + 1}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                    <Avatar src={p.image} sx={{ width: 28, height: 28, fontSize: 10 }}>{!p.image && `${p.fname?.[0]}${p.lname?.[0]}`}</Avatar>
                  </TableCell>
                  <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.user_id}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontWeight: 500 }}>{p.lname} {p.fname}</TableCell>
                  <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.ca_score}</TableCell>
                  <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.exam_score}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{p.total}</TableCell>
                </TableRow>
              ))}
              {!(dummyBreakdown[breakdownDialog.subject]?.length > 0) && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No students in this range</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreakdownDialog({ open: false, subject: '', gradeIdx: 0 })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SummarySheetTab;
