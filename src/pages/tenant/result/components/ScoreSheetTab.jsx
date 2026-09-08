import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Alert, useTheme,
  IconButton, Menu, ListItemIcon, ListItemText, Avatar, Tooltip,
} from '@mui/material';
import {
  IconClipboardCheck, IconPrinter, IconChartBar, IconEye, IconEdit, IconSend,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];
const dummySubjects = [
  { id: 1, name: 'Mathematics' }, { id: 2, name: 'English' }, { id: 3, name: 'Physics' },
];
const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
];

const dummyCaType = [
  { display_name: 'CA1', entities: [{ display_name: 'Test', max_score: 10 }, { display_name: 'Assignment', max_score: 10 }] },
  { display_name: 'CA2', entities: [{ display_name: 'Quiz', max_score: 10 }, { display_name: 'Project', max_score: 10 }] },
];

const dummyResults = [
  { id: 1, user_id: 'STD/2025/001', lname: 'Tunde', fname: 'Adebayo', mname: '', image: '', uuid: 'uuid-001',
    ca: [
      { entities: { e1: { score: 18 }, e2: { score: 17 } } },
      { entities: { e1: { score: 15 }, e2: { score: 14 } } },
    ],
    exam_score: 55, teacher_submit: 'yes', spa_publish: 'no', head_of_school_publish: 'no' },
  { id: 2, user_id: 'STD/2025/002', lname: 'Obi', fname: 'Chidinma', mname: '', image: '', uuid: 'uuid-002',
    ca: [
      { entities: { e1: { score: 15 }, e2: { score: 14 } } },
      { entities: { e1: { score: 12 }, e2: { score: 13 } } },
    ],
    exam_score: 48, teacher_submit: 'yes', spa_publish: 'no', head_of_school_publish: 'no' },
  { id: 3, user_id: 'STD/2025/003', lname: 'Uche', fname: 'Emeka', mname: '', image: '', uuid: 'uuid-003',
    ca: [
      { entities: { e1: { score: 12 }, e2: { score: 13 } } },
      { entities: { e1: { score: 10 }, e2: { score: 11 } } },
    ],
    exam_score: 42, teacher_submit: 'yes', spa_publish: 'yes', head_of_school_publish: 'no' },
  { id: 4, user_id: 'STD/2025/004', lname: 'Mohammed', fname: 'Aisha', mname: '', image: '', uuid: 'uuid-004',
    ca: [
      { entities: { e1: { score: 16 }, e2: { score: 15 } } },
      { entities: { e1: { score: 14 }, e2: { score: 13 } } },
    ],
    exam_score: 50, teacher_submit: 'yes', spa_publish: 'yes', head_of_school_publish: 'yes' },
  { id: 5, user_id: 'STD/2025/005', lname: 'Abubakar', fname: 'Fatima', mname: '', image: '', uuid: 'uuid-005',
    ca: [
      { entities: { e1: { score: 10 }, e2: { score: 11 } } },
      { entities: { e1: { score: 8 }, e2: { score: 9 } } },
    ],
    exam_score: 38, teacher_submit: 'no', spa_publish: 'no', head_of_school_publish: 'no' },
  { id: 6, user_id: 'STD/2025/006', lname: 'Musa', fname: 'Ibrahim', mname: '', image: '', uuid: 'uuid-006',
    ca: [
      { entities: { e1: { score: 14 }, e2: { score: 13 } } },
      { entities: { e1: { score: 12 }, e2: { score: 11 } } },
    ],
    exam_score: 45, teacher_submit: 'yes', spa_publish: 'no', head_of_school_publish: 'no' },
];

const getEntityTotal = (entities) => {
  if (!entities) return 0;
  return Object.values(entities).reduce((sum, e) => sum + Number(e.score || 0), 0);
};

const getOverallTotal = (ca, exam) => {
  const caTotal = (ca || []).reduce((sum, caItem) => sum + getEntityTotal(caItem?.entities), 0);
  return caTotal + Number(exam || 0);
};

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const ScoreSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);

  const showTable = selectedClass && selectedSubject && selectedSessionTerm;
  const submissionStatus = showTable ? dummyResults[0]?.teacher_submit : null;

  const handleReverseSubmission = () => {};
  const handleSubmitScores = () => {};

  const viewCAReport = (student) => {
    setActionMenuAnchor(null);
    window.open('/result-cabreakdown', '_blank', 'noopener,noreferrer');
  };

  const viewResult = (student) => {
    setActionMenuAnchor(null);
    window.open('/result-reportsheet', '_blank', 'noopener,noreferrer');
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {showTable
            ? `Score Sheet — ${dummyClasses.find(c => c.id === selectedClass)?.name} • ${dummySubjects.find(s => s.id === selectedSubject)?.name} • ${dummySessionTerms.find(s => s.id === selectedSessionTerm)?.label}`
            : 'View Score Sheet'}
        </Typography>
        {showTable && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" size="small" color="info" startIcon={<IconPrinter size={16} />}>
              Print Score Sheet
            </Button>
            <Button variant="contained" size="small" color="success" startIcon={<IconChartBar size={16} />}
              onClick={() => window.open('/result-analytics', '_blank', 'noopener,noreferrer')}>
              View Performance Analytics
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Filters ─────────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: showTable ? 1 : 0, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
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
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select value={selectedSubject} label="Subject"
                onChange={e => setSelectedSubject(e.target.value)}>
                <MenuItem value="">-- Select Subject --</MenuItem>
                {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* ── Submission Status ────────────────────────────────── */}
      {showTable && (
        <Box sx={{ px: 2, pt: 2 }}>
          {submissionStatus === 'no' && (
            <Alert severity="info" sx={{ borderRadius: '10px' }}
              action={
                <Button size="small" variant="contained" color="success" startIcon={<IconSend size={14} />} onClick={handleSubmitScores}>
                  SUBMIT SCORES
                </Button>
              }>
              <Typography variant="subtitle2">Scores Submission Status</Typography>
              Scores not submitted by Subject Teacher yet
            </Alert>
          )}
          {submissionStatus === 'yes' && dummyResults[0]?.spa_publish === 'no' && (
            <Alert severity="warning" sx={{ borderRadius: '10px' }}
              action={
                <Button size="small" variant="contained" color="warning" onClick={handleReverseSubmission}>
                  Reverse Submission
                </Button>
              }>
              <Typography variant="subtitle2">Scores Submission Status</Typography>
              Result submitted awaiting SPA approval. Should you wish to alter this result, click Reverse Submission.
            </Alert>
          )}
          {dummyResults[0]?.spa_publish === 'yes' && dummyResults[0]?.head_of_school_publish === 'no' && (
            <Alert severity="success" sx={{ borderRadius: '10px' }}
              action={
                <Button size="small" variant="contained" color="warning" onClick={handleSubmitScores}>
                  Re-Submit
                </Button>
              }>
              <Typography variant="subtitle2">Scores Submission Status</Typography>
              Result submitted and approved by SPA
            </Alert>
          )}
        </Box>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      {showTable && (
        <Box sx={{ p: 3, pt: 2 }}>
          <TableContainer sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '3%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '5%' }}>Photo</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '9%' }}>Reg ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}>Student Name</TableCell>
                  {dummyCaType.map((ca) => (
                    <TableCell key={ca.display_name} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '10%' }} align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {ca.display_name}
                        <Tooltip title={`Print ${ca.display_name} Report`}>
                          <IconButton size="small" sx={{ p: 0.25 }}>
                            <IconPrinter size={13} color="#0288D1" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`View ${ca.display_name} Analytics`}>
                          <IconButton size="small" sx={{ p: 0.25 }}>
                            <IconChartBar size={13} color="#16A34A" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '10%' }} align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Exam
                      <Tooltip title="Print Exam Report">
                        <IconButton size="small" sx={{ p: 0.25 }}>
                          <IconPrinter size={13} color="#0288D1" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Exam Analytics">
                        <IconButton size="small" sx={{ p: 0.25 }}>
                          <IconChartBar size={13} color="#16A34A" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '7%' }} align="center">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', width: '4%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyResults.map((res, i) => (
                  <TableRow key={res.id} hover>
                    <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                    <TableCell sx={cellBorderSx}>
                      <Avatar src={res.image} sx={{ width: 30, height: 30, fontSize: 12 }}>
                        {!res.image && `${res.fname?.[0]}${res.lname?.[0]}`}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={cellBorderSx}>{res.user_id}</TableCell>
                    <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>{res.lname} {res.fname} {res.mname}</TableCell>
                    {(res.ca || []).map((caItem, ci) => (
                      <TableCell key={ci} align="center" sx={cellBorderSx}>
                        {getEntityTotal(caItem?.entities) || '-'}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={cellBorderSx}>{res.exam_score || '-'}</TableCell>
                    <TableCell align="center" sx={cellBorderSx}>
                      {/* <Chip label={getOverallTotal(res.ca, res.exam_score) || '-'} size="small"
                        sx={{ fontWeight: 700, minWidth: 40 }} /> */}
                        {getOverallTotal(res.ca, res.exam_score) || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { setActionMenuAnchor(e.currentTarget); setActionMenuRow(res); }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ── Empty State ─────────────────────────────────────── */}
      {!showTable && (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <IconClipboardCheck size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Select a session-term, class and subject to view the score sheet
          </Typography>
        </Box>
      )}

      {/* ── Bottom Submit Button ─────────────────────────────── */}
      {showTable && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: 1, borderColor: 'divider' }}>
          {submissionStatus === 'no' && (
            <Button variant="contained" color="success" size="small" startIcon={<IconSend size={14} />} onClick={handleSubmitScores}>
              SUBMIT SCORES
            </Button>
          )}
          {submissionStatus === 'yes' && dummyResults[0]?.spa_publish === 'no' && (
            <Button variant="contained" color="warning" size="small" onClick={handleReverseSubmission}>
              Reverse Submission
            </Button>
          )}
          {dummyResults[0]?.spa_publish === 'yes' && dummyResults[0]?.head_of_school_publish === 'no' && (
            <Button variant="contained" color="warning" size="small" onClick={handleSubmitScores}>
              Re-Submit
            </Button>
          )}
        </Box>
      )}

      {/* ── Row Action Menu ─────────────────────────────────── */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => { setActionMenuAnchor(null); setActionMenuRow(null); }}>
        <MenuItem onClick={() => viewCAReport(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View CA Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => viewResult(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View Result</ListItemText>
        </MenuItem>
        {actionMenuRow?.teacher_submit === 'no' && (
          <MenuItem onClick={() => setActionMenuAnchor(null)}>
            <ListItemIcon><IconEdit size={18} /></ListItemIcon>
            <ListItemText>Edit Score</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default ScoreSheetTab;
