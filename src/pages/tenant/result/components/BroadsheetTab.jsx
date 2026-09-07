import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Grid, FormControl, InputLabel, Select, MenuItem, Alert, useTheme, Tooltip,
  Card, CardHeader, CardContent, Button, Avatar, TablePagination,
} from '@mui/material';
import { IconPrinter, IconDownload, IconCheck, IconX, IconMessage, IconWeight } from '@tabler/icons-react';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
  { id: 3, label: '2025/2026 - Third Term' },
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

const colorArray = ['#c3dfe3', '#c3dfe3', '#0ca6e8', '#0ca6e8'];

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
      const caScore = Math.floor(Math.random() * (subj.ca - 4)) + 4;
      const examScore = Math.floor(Math.random() * (subj.exam - 10)) + 10;
      const overallTotal = caScore + examScore;
      const percentage = (overallTotal / subj.total) * 100;
      let grade = 'F';
      if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C+';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D+';
      else if (percentage >= 30) grade = 'D';
      return {
        subject_id: subj.id,
        subject_name: subj.name,
        ca_total: caScore,
        exam_score: examScore,
        overall_total: overallTotal,
        grade,
      };
    });

    const totalScores = results.reduce((sum, r) => sum + r.overall_total, 0);
    const studentAvg = (totalScores / results.length).toFixed(2);
    const totalSubjects = results.length;

    return {
      id: i + 1,
      user: { lname: name.split(' ')[0], fname: name.split(' ')[1] || '', mname: name.split(' ')[2] || '', sex: genders[i], user_id: `STD/2025/${String(i + 1).padStart(3, '0')}` },
      results,
      student_average: studentAvg,
      overall_class_position: 0,
      total_subjects: totalSubjects,
      class_teachers_comment: '',
      hos_comment: '',
      bmi_params: { startTermWeight: '', endTermWeight: '', startTermHeight: '', endTermHeight: '', cleanliness: '' },
      promotion_recommendation: promotionOptions[i % promotionOptions.length],
      first_term_average: null,
      second_term_average: null,
      third_term_average: null,
      all_term_average: null,
      all_term_overall_class_position: null,
    };
  });
};

const BroadsheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [filter, setFilter] = useState({ session_term: '', programme: '', class: '', performance: '' });
  const [broadsheetData] = useState(() => generateBroadsheetData());
  const [showData, setShowData] = useState(false);
  const [showPromotionButtons, setShowPromotionButtons] = useState(false);
  const [nextClasses] = useState(['JSS 2A', 'JSS 2B', 'SS 1A', 'SS 1B', 'SS 2A']);
  const [selectedNextClass, setSelectedNextClass] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sortedData = useMemo(() => {
    const sorted = [...broadsheetData].sort((a, b) => {
      const avgA = parseFloat(a.student_average);
      const avgB = parseFloat(b.student_average);
      return avgB - avgA;
    });
    sorted.forEach((s, i) => { s.overall_class_position = i + 1; });
    return sorted;
  }, [broadsheetData]);

  const filteredData = useMemo(() => {
    if (!filter.performance) return sortedData;
    const count = parseInt(filter.performance, 10);
    return sortedData.filter(s => s.overall_class_position <= count);
  }, [sortedData, filter.performance]);

  const handleLoad = () => {
    if (filter.session_term && filter.programme && filter.class) {
      setShowData(true);
      const selectedTerm = dummySessionTerms.find(t => t.id === filter.session_term);
      setShowPromotionButtons(selectedTerm && selectedTerm.id === 3);
    }
  };

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  return (
    <Box>
      <Card elevation={2}>
        <CardHeader
          title="Result Broadsheet"
          action={
            showData && (
              <Button variant="contained" size="small" startIcon={<IconDownload size={16} />}>
                Export Broadsheet
              </Button>
            )
          }
        />
        <CardContent>
          {/* ── Filters ────────────────────────────────────────── */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
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
            {showData && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Performance</InputLabel>
                  <Select value={filter.performance} label="Performance" onChange={e => setFilter({ ...filter, performance: e.target.value })}>
                    <MenuItem value="">All Students</MenuItem>
                    <MenuItem value="3">Best 3</MenuItem>
                    <MenuItem value="5">Best 5</MenuItem>
                    <MenuItem value="10">Best 10</MenuItem>
                    <MenuItem value="15">Best 15</MenuItem>
                    <MenuItem value="20">Best 20</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {showData && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {showPromotionButtons && (
                <>
                  <Button variant="outlined" color="primary" size="small">
                    Recommend Promotion
                  </Button>
                  <Button variant="outlined" color="secondary" size="small">
                    Post Recommendation
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* ── School Info Header ─────────────────────────────── */}
          {showData && (
            <Box sx={{ mb: 2, border: `1px solid ${borderColor}`, borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${borderColor}` }}>
                <Box sx={{ flex: 1, p: 1, borderRight: `1px solid ${borderColor}`, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Name Of School</Box>
                <Box sx={{ flex: 3, p: 1, fontWeight: 600 }}>Greenfield Academy International</Box>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ flex: 1, p: 1, borderRight: `1px solid ${borderColor}`, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Session</Box>
                <Box sx={{ flex: 2, p: 1, fontWeight: 600, borderRight: `1px solid ${borderColor}` }}>2025/2026</Box>
                <Box sx={{ flex: 1, p: 1, borderRight: `1px solid ${borderColor}`, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}>Term</Box>
                <Box sx={{ flex: 2, p: 1, fontWeight: 600 }}>First Term</Box>
              </Box>
            </Box>
          )}

          {/* ── Broadsheet Table ───────────────────────────────── */}
          {showData && (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap', minWidth: 1200 }}>
                <TableHead>
                  {/* ── Subject Headers Row ──────────────────── */}
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        position: 'sticky', left: 0, zIndex: 3, bgcolor: '#fc9d49', color: '#fff',
                        fontWeight: 700, minWidth: 250, verticalAlign: 'middle', borderRight: `1px solid ${borderColor}`,
                      }}
                    >
                      Student Info
                    </TableCell>
                    {dummySubjects.map(subj => (
                      <TableCell
                        key={subj.id}
                        colSpan={4}
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, borderRight: `1px solid ${borderColor}`, minWidth: 200 }}
                      >
                        {subj.name}
                      </TableCell>
                    ))}
                    <TableCell colSpan={showPromotionButtons ? 7 : 4} align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, borderRight: `1px solid ${borderColor}` }}>
                      SUMMARY
                    </TableCell>
                  </TableRow>
                  {/* ── Sub-headers Row ──────────────────────── */}
                  <TableRow>
                    {dummySubjects.map(subj => (
                      <TableCell key={`sub-${subj.id}-ca`} align="center" sx={{ bgcolor: '#c3dfe3', fontWeight: 700, minWidth: 48 }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                          CA ({subj.ca})
                        </Typography>
                      </TableCell>
                    ))}
                    {dummySubjects.map(subj => (
                      <TableCell key={`sub-${subj.id}-ex`} align="center" sx={{ bgcolor: '#c3dfe3', fontWeight: 700, minWidth: 48 }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                          EXAM ({subj.exam})
                        </Typography>
                      </TableCell>
                    ))}
                    {dummySubjects.map(subj => (
                      <TableCell key={`sub-${subj.id}-tot`} align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: 48 }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                          TOTAL ({subj.total})
                        </Typography>
                      </TableCell>
                    ))}
                    {dummySubjects.map(subj => (
                      <TableCell key={`sub-${subj.id}-gr`} align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: 48 }}>
                        <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                          GRADE
                        </Typography>
                      </TableCell>
                    ))}
                    {/* Summary sub-headers */}
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 60 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        CUMM. WEIGHTED AVERAGE
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 50 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        POSITION
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 50 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        NO. OF SUBJECTS
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 50 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        REMARKS
                      </Typography>
                    </TableCell>
                    {showPromotionButtons && (
                      <>
                        <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 50 }}>
                          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                            RECOMMENDATION
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 50 }}>
                          <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                            PROMOTION ACTION
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: '#0ca6e8', fontWeight: 700, color: '#fff', minWidth: 80 }}>
                          NEXT CLASS
                        </TableCell>
                      </>
                    )}
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 120 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        CLASS TEACHER COMMENT
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 120 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        HEAD OF SCHOOL COMMENT
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 100 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        BMI PARAMETERS
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: 60 }}>
                      <Typography variant="caption" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                        ACTION
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                    <TableRow key={row.id} hover>
                      {/* ── Student Info (fixed) ──────────────── */}
                      <TableCell
                        sx={{
                          position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper',
                          borderRight: `1px solid ${borderColor}`, minWidth: 250, p: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                            {row.user.lname?.[0]}{row.user.fname?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{row.user.lname} {row.user.fname} {row.user.mname}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.user.sex === 'female' ? 'F' : 'M'} &middot; {row.user.user_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* ── Subject Scores ──────────────────── */}
                      {row.results.map((result, rIdx) => (
                        <TableCell key={`ca-${rIdx}`} align="center" sx={{ bgcolor: '#b0cbcf', fontWeight: 600, minWidth: 48 }}>
                          {result.ca_total}
                        </TableCell>
                      ))}
                      {row.results.map((result, rIdx) => (
                        <TableCell key={`ex-${rIdx}`} align="center" sx={{ bgcolor: '#b0cbcf', fontWeight: 600, minWidth: 48 }}>
                          {result.exam_score}
                        </TableCell>
                      ))}
                      {row.results.map((result, rIdx) => (
                        <TableCell key={`tot-${rIdx}`} align="center" sx={{ fontWeight: 600, minWidth: 48 }}>
                          {result.overall_total}
                        </TableCell>
                      ))}
                      {row.results.map((result, rIdx) => (
                        <TableCell key={`gr-${rIdx}`} align="center" sx={{ fontWeight: 600, minWidth: 48 }}>
                          {result.grade}
                        </TableCell>
                      ))}

                      {/* ── Summary ─────────────────────────── */}
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: 60 }}>
                        {row.student_average}
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: 50 }}>
                        {row.overall_class_position}
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#ffcb15', fontWeight: 600, minWidth: 50 }}>
                        {row.total_subjects}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, minWidth: 50 }}>
                        -
                      </TableCell>

                      {/* ── Promotion (term 3 only) ────────── */}
                      {showPromotionButtons && (
                        <>
                          <TableCell align="center" sx={{ fontWeight: 600, minWidth: 50, textTransform: 'capitalize' }}>
                            {row.promotion_recommendation}
                          </TableCell>
                          <TableCell align="center" sx={{ minWidth: 50 }}>
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
                          <TableCell align="center" sx={{ minWidth: 80 }}>
                            {(row.promotion_recommendation === 'promoted' || row.promotion_recommendation === 'promoted on trial') ? (
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={selectedNextClass[row.id] || ''}
                                  onChange={e => setSelectedNextClass({ ...selectedNextClass, [row.id]: e.target.value })}
                                  sx={{ fontSize: 12 }}
                                >
                                  {nextClasses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                              </FormControl>
                            ) : '-'}
                          </TableCell>
                        </>
                      )}

                      {/* ── Comments ────────────────────────── */}
                      <TableCell sx={{ minWidth: 120, fontSize: 12 }}>
                        {row.class_teachers_comment || '-'}
                      </TableCell>
                      <TableCell sx={{ minWidth: 120, fontSize: 12 }}>
                        {row.hos_comment || '-'}
                      </TableCell>

                      {/* ── BMI ─────────────────────────────── */}
                      <TableCell sx={{ minWidth: 100 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {row.bmi_params.startTermWeight && <Chip label={`Start: ${row.bmi_params.startTermWeight}`} size="small" color="success" variant="outlined" />}
                          {row.bmi_params.endTermWeight && <Chip label={`End: ${row.bmi_params.endTermWeight}`} size="small" color="warning" variant="outlined" />}
                          {!row.bmi_params.startTermWeight && !row.bmi_params.endTermWeight && <Typography variant="caption">-</Typography>}
                        </Box>
                      </TableCell>

                      {/* ── Action ──────────────────────────── */}
                      <TableCell sx={{ minWidth: 60 }}>
                        <Tooltip title="Add Comment">
                          <Button size="small" variant="outlined" sx={{ minWidth: 0, p: 0.5 }}>
                            <IconMessage size={14} />
                          </Button>
                        </Tooltip>
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
              />
            </>
          )}

          {!showData && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Select Session Term, Programme, and Class to view the broadsheet.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BroadsheetTab;
