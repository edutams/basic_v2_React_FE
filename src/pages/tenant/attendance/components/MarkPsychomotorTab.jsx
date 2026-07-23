import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  TablePagination,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Save as SaveIcon,
  FileDownload as DownloadIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const AFFECTIVE_TRAITS = ['Punctuality', 'Neatness', 'Honesty'];
const PSYCHOMOTOR_TRAITS = ['Handwriting', 'Games & Sports', 'Drawing & Painting'];

const MarkPsychomotorTab = ({ metrics, onFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [weeks, setWeeks] = useState([]);

  const [pSession, setPSession] = useState('');
  const [pTerm, setPTerm] = useState('');
  const [pProgramme, setPProgramme] = useState('');
  const [pClass, setPClass] = useState('');
  const [pArm, setPArm] = useState('');
  const [pWeek, setPWeek] = useState('');

  // ── Assessment Data ───────────────────────────────────────
  const [learners, setLearners] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Pagination ────────────────────────────────────────────
  const [pPage, setPPage] = useState(0);
  const [pRowsPerPage, setPRowsPerPage] = useState(10);

  // ── Load Filters ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
        ]);
        setSessions(sessRes.data?.data || sessRes.data || []);
        setProgrammes(progRes.data?.data || progRes.data || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!pSession) return;
    fetchTerms(pSession).then((r) => setTerms(r.data?.data || r.data || [])).catch(console.error);
  }, [pSession]);

  useEffect(() => {
    if (!pProgramme) return;
    fetchClassesByProgramme(pProgramme).then((r) => {
      const d = r.data?.data || r.data || [];
      setClasses(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [pProgramme]);

  useEffect(() => {
    if (!pClass) return;
    fetchClassArmsByClass(pClass).then((r) => {
      const d = r.data?.data || r.data || [];
      setArms(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [pClass]);

  useEffect(() => {
    if (!pTerm) return;
    attendanceApi.getWeeks(pTerm).then((r) => {
      const d = r.data?.data || [];
      setWeeks(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [pTerm]);

  // ── Fetch Learners ────────────────────────────────────────
  const fetchLearners = useCallback(async () => {
    if (!pArm || !pWeek) return;
    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.getPsychomotorLearners({
        class_arm_id: pArm,
        week_term_id: pWeek,
      });
      if (res.data?.status && res.data?.data) {
        const data = res.data.data;
        setLearners(data);
        // Build assessments map
        const assMap = {};
        data.forEach((l) => {
          assMap[l.student_reg_id] = {
            affective: l.affective || {},
            psychomotor: l.psychomotor || {},
          };
        });
        setAssessments(assMap);
      }
    } catch (e) {
      console.error('Failed to fetch learners:', e);
      setError('Failed to load learners.');
    } finally {
      setLoading(false);
    }
  }, [pArm, pWeek]);

  // ── Handlers ──────────────────────────────────────────────
  const setRating = (studentRegId, domain, trait, value) => {
    setAssessments((prev) => ({
      ...prev,
      [studentRegId]: {
        ...(prev[studentRegId] || { affective: {}, psychomotor: {} }),
        [domain]: {
          ...(prev[studentRegId]?.[domain] || {}),
          [trait]: value,
        },
      },
    }));
  };

  const handleApplyFilter = () => {
    fetchLearners();
    if (onFilter) onFilter(pArm);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const assessmentData = Object.entries(assessments).map(([studentId, data]) => ({
        student_id: Number(studentId),
        affective: Object.entries(data.affective || {}).map(([trait, rating]) => ({ trait, rating })),
        psychomotor: Object.entries(data.psychomotor || {}).map(([trait, rating]) => ({ trait, rating })),
      }));

      await attendanceApi.submitAssessments({
        class_arm_id: Number(pArm),
        week_term_id: Number(pWeek),
        assessments: assessmentData,
      });
    } catch (e) {
      console.error('Failed to submit assessments:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    // Will integrate with export API
  };

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filters ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={pSession} label="Session" onChange={(e) => setPSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={pTerm} label="Term" onChange={(e) => setPTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Week</InputLabel>
            <Select value={pWeek} label="Week" onChange={(e) => setPWeek(e.target.value)}>
              {weeks.map((w) => {
                const weekId = w.wk_id ?? w.week_id ?? w.id;
                return (
                  <MenuItem key={weekId} value={weekId}>
                    {w.week_name || `Week ${weekId}`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={pProgramme} label="Programme" onChange={(e) => setPProgramme(e.target.value)}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={pClass} label="Class" onChange={(e) => setPClass(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.class_name || c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class/Arm</InputLabel>
            <Select value={pArm} label="Class/Arm" onChange={(e) => setPArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.arm_names || `Arm ${a.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ── Action Buttons ───────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
        <Button variant="contained" size="small" startIcon={<FilterIcon />} onClick={handleApplyFilter}>
          Filter Results
        </Button>
        <Button variant="contained" color="success" size="small" startIcon={<SaveIcon />} onClick={handleSubmit} disabled={submitting || learners.length === 0}>
          {submitting ? 'Saving...' : 'Save Selections'}
        </Button>
        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export Report
        </Button>
      </Stack>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {/* ── Assessment Table ─────────────────────────────── */}
      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>S/N</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Learner's Name</TableCell>
              <TableCell sx={{ minWidth: 280 }}>Mark Affective Domain</TableCell>
              <TableCell sx={{ minWidth: 280 }}>Mark Psychomotor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : learners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  {pArm && pWeek ? 'No learners found.' : 'Select class/arm and week, then click Filter.'}
                </TableCell>
              </TableRow>
            ) : (
              learners.map((learner, idx) => {
                const studentAssess = assessments[learner.student_reg_id] || { affective: {}, psychomotor: {} };
                return (
                  <TableRow key={learner.student_reg_id} hover sx={{ verticalAlign: 'top' }}>
                    <TableCell>{String(idx + 1).padStart(2, '0')}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}>
                          {(learner.name || '?').charAt(0)}
                        </Avatar>
                        <Box>
                          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                            <Typography variant="body2" fontWeight={600}>{learner.name}</Typography>
                            <Chip
                              icon={learner.gender === 'MALE' ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}
                              label={learner.gender}
                              size="small"
                              color={learner.gender === 'MALE' ? 'primary' : 'success'}
                              variant="soft"
                              sx={{ height: 20, fontSize: '10px', fontWeight: 600 }}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>
                    {/* Affective domain */}
                    <TableCell>
                      <Stack spacing={1}>
                        {AFFECTIVE_TRAITS.map((trait) => (
                          <Stack key={trait} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                            <Typography variant="caption" sx={{ minWidth: 80, color: 'text.secondary', fontWeight: 500 }}>
                              {trait}
                            </Typography>
                            <RadioGroup
                              row
                              value={studentAssess.affective[trait] ?? ''}
                              onChange={(e) => setRating(learner.student_reg_id, 'affective', trait, Number(e.target.value))}
                            >
                              {[1, 2, 3, 4, 5].map((val) => (
                                <FormControlLabel
                                  key={val}
                                  value={val}
                                  control={<Radio size="small" sx={{ p: 0.5 }} />}
                                  label={val}
                                  labelPlacement="bottom"
                                  sx={{ mx: 0.25, '& .MuiFormControlLabel-label': { fontSize: '10px' } }}
                                />
                              ))}
                            </RadioGroup>
                          </Stack>
                        ))}
                      </Stack>
                    </TableCell>
                    {/* Psychomotor domain */}
                    <TableCell>
                      <Stack spacing={1}>
                        {PSYCHOMOTOR_TRAITS.map((trait) => (
                          <Stack key={trait} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                            <Typography variant="caption" sx={{ minWidth: 110, color: 'text.secondary', fontWeight: 500 }}>
                              {trait}
                            </Typography>
                            <RadioGroup
                              row
                              value={studentAssess.psychomotor[trait] ?? ''}
                              onChange={(e) => setRating(learner.student_reg_id, 'psychomotor', trait, Number(e.target.value))}
                            >
                              {[1, 2, 3, 4, 5].map((val) => (
                                <FormControlLabel
                                  key={val}
                                  value={val}
                                  control={<Radio size="small" sx={{ p: 0.5 }} />}
                                  label={val}
                                  labelPlacement="bottom"
                                  sx={{ mx: 0.25, '& .MuiFormControlLabel-label': { fontSize: '10px' } }}
                                />
                              ))}
                            </RadioGroup>
                          </Stack>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination ──────────────────────────────────── */}
      <Box sx={{ pt: 2 }}>
        <TablePagination
          component="div"
          count={learners.length}
          page={pPage}
          onPageChange={(_, newPage) => setPPage(newPage)}
          rowsPerPage={pRowsPerPage}
          onRowsPerPageChange={(e) => {
            setPRowsPerPage(parseInt(e.target.value, 10));
            setPPage(0);
          }}
        />
      </Box>

      {/* ── Submit Footer ──────────────────────────────── */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {learners.length > 0 ? `${learners.length} learners loaded.` : 'No data loaded.'}
        </Typography>
        <Button variant="contained" size="small" onClick={handleSubmit} disabled={submitting || learners.length === 0}>
          {submitting ? 'SUBMITTING...' : 'SUBMIT FINAL ASSESSMENTS'}
        </Button>
      </Box>
    </Box>
  );
};

export default MarkPsychomotorTab;
