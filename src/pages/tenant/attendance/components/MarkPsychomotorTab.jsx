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
  Menu,
  ListItemIcon,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
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
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const STORAGE_KEY = 'psychomotor_assessments';

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
  const [pTermId, setPTermId] = useState('');
  const [pProgramme, setPProgramme] = useState('');
  const [pClass, setPClass] = useState('');
  const [pArm, setPArm] = useState('');
  const [pWeek, setPWeek] = useState('');

  // ── Domain traits from API ───────────────────────────────
  const [affectiveTraits, setAffectiveTraits] = useState([]);
  const [psychomotorTraits, setPsychomotorTraits] = useState([]);

  // ── Assessment Data ───────────────────────────────────────
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const exportMenuOpen = Boolean(exportAnchorEl);
  const [alertSnackbar, setAlertSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [filterApplied, setFilterApplied] = useState(false);
  const [learners, setLearners] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load saved assessments from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setAssessments((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error('Failed to load saved assessments:', e);
    }
  }, []);

  // Persist assessments to localStorage on every change
  useEffect(() => {
    if (Object.keys(assessments).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
      } catch (e) {
        console.error('Failed to save assessments:', e);
      }
    }
  }, [assessments]);

  // ── Pagination ────────────────────────────────────────────
  const [pPage, setPPage] = useState(0);
  const [pRowsPerPage, setPRowsPerPage] = useState(10);

  // ── Load Filters and auto-select active session/term ────────
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes, activeStRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveSessionTerm(),
        ]);
        const sessions = sessRes.data?.data || sessRes.data || [];
        setSessions(sessions);
        setProgrammes(progRes.data?.data || progRes.data || []);

        // Auto-select session from active SessionTerm
        const activeStData = activeStRes.data?.data || activeStRes.data;
        if (activeStData?.session_id) {
          setPSession(activeStData.session_id);
          // Also pre-set term_id from the active SessionTerm
          if (activeStData.term_id) {
            setPTermId(activeStData.term_id);
          }
        } else if (sessions.length > 0) {
          setPSession(sessions[0].id);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!pSession) return;
    fetchTerms(pSession).then((r) => {
      const termsData = r.data?.data || r.data || [];
      setTerms(termsData);
      // Try to preselect the term matching the active SessionTerm's term_id
      if (Array.isArray(termsData) && termsData.length > 0) {
        const match = termsData.find((t) => String(t.id) === String(pTermId));
        if (match) {
          setPTerm(match.id);
        } else {
          setPTerm(termsData[0].id);
        }
      }
    }).catch(console.error);
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
    fetchClassArmsByClass(pClass, { programme_id: pProgramme || undefined }).then((r) => {
      const d = r.data || [];
      setArms(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [pClass, pProgramme]);

  // ── Fetch Weeks when session or term changes ──────────────
  useEffect(() => {
    if (!pSession || !pTermId) return;
    attendanceApi.getWeeksBySessionTerm({
      session_id: pSession,
      term_id: pTermId,
    }).then((r) => {
      const d = r.data?.data || [];
      const weeks = Array.isArray(d) ? d : [];
      setWeeks(weeks);
      const active = weeks.find((w) => w.status === 'active');
      if (active) {
        setPWeek(active.wk_id ?? active.week_id ?? active.id);
      } else if (weeks.length > 0) {
        setPWeek(weeks[weeks.length - 1].wk_id ?? weeks[weeks.length - 1].week_id ?? weeks[weeks.length - 1].id);
      }
    }).catch(console.error);
  }, [pSession, pTermId]);

  // ── Load domain traits from API ───────────────────────────
  useEffect(() => {
    attendanceApi.getPsychomotorDomains({
      session_id: pSession || undefined,
      term_id: pTermId || undefined,
    }).then((r) => {
      const d = r.data?.data;
      if (d) {
        if (Array.isArray(d.affective_traits)) setAffectiveTraits(d.affective_traits);
        if (Array.isArray(d.psychomotor_traits)) setPsychomotorTraits(d.psychomotor_traits);
      }
    }).catch(console.error);
  }, [pSession, pTermId]);

  // ── Fetch Learners ────────────────────────────────────────
  const fetchLearners = useCallback(async () => {
    if (!pArm || !pWeek) return;
    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.getPsychomotorLearners({
        class_arm_id: pArm,
        week_term_id: pWeek,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      if (res.data?.status && res.data?.data) {
        const payload = res.data.data;
        const students = payload.students || payload;

        // Update domain traits from response payload
        if (Array.isArray(payload.affective_traits)) setAffectiveTraits(payload.affective_traits);
        if (Array.isArray(payload.psychomotor_traits)) setPsychomotorTraits(payload.psychomotor_traits);

        setLearners(students);
        // Build assessments map
        const assMap = {};
        students.forEach((l) => {
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
    setFilterApplied(true);
    if (onFilter) onFilter(pArm, pSession, pTermId, pWeek);
  };

  const handleSubmitFinal = async () => {
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
        session_id: Number(pSession) || undefined,
        term_id: Number(pTermId) || undefined,
        assessments: assessmentData,
      });

      setAlertSnackbar({
        open: true,
        message: `Assessments submitted successfully — ${assessmentData.length} learner(s) saved.`,
        severity: 'success',
      });

      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to submit assessments:', e);
      setAlertSnackbar({
        open: true,
        message: e.response?.data?.message || 'Failed to submit assessments.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    try {
      const res = await attendanceApi.exportPsychomotorReport({
        class_arm_id: pArm || undefined,
        week_term_id: pWeek || undefined,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'psychomotor-report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Excel export failed:', e);
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    try {
      const res = await attendanceApi.exportPsychomotorPdf({
        class_arm_id: pArm || undefined,
        week_term_id: pWeek || undefined,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'psychomotor-report-' + new Date().toISOString().slice(0, 10) + '.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Filters Row ─────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
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
            <Select value={pTerm} label="Term" onChange={(e) => {
              const val = e.target.value;
              setPTerm(val);
              const term = terms.find((t) => t.id === val);
              if (term) setPTermId(term.id);
            }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
                <MenuItem key={c.id} value={c.id}>{c.class_name }</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class/Arm</InputLabel>
            <Select value={pArm} label="Class Arm" onChange={(e) => setPArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.arm_names}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ── Action Buttons Row (right-aligned) ─────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center" justifyContent="flex-end">
        <Grid size={{ xs: 12, sm: 'auto' }}>
          <Button variant="contained" size="small" startIcon={<FilterIcon />} onClick={handleApplyFilter}>
            Filter Results
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            disabled={!filterApplied}
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
          >
            Export Report
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={exportMenuOpen}
            onClose={() => setExportAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleExportExcel} dense>
              <ListItemIcon><ExcelIcon fontSize="small" /></ListItemIcon>
              Export to Excel
            </MenuItem>
            <MenuItem onClick={handleExportPdf} dense>
              <ListItemIcon><PdfIcon fontSize="small" /></ListItemIcon>
              Export to PDF
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {/* ── Assessment Table ─────────────────────────────── */}
      <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                width: 40,
                position: 'sticky',
                left: 0,
                zIndex: 2,
                bgcolor: isDark ? '#1e1e1e' : '#fff',
                borderRight: `1px solid ${theme.palette.divider}`,
              }}>S/N</TableCell>
              <TableCell sx={{
                minWidth: 200,
                position: 'sticky',
                left: 40,
                zIndex: 2,
                bgcolor: isDark ? '#1e1e1e' : '#fff',
                borderRight: `1px solid ${theme.palette.divider}`,
              }}>Learner's Name</TableCell>
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
                    <TableCell sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      bgcolor: isDark ? '#1e1e1e' : '#fff',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}>{String(idx + 1).padStart(2, '0')}</TableCell>
                    <TableCell sx={{
                      position: 'sticky',
                      left: 40,
                      zIndex: 1,
                      bgcolor: isDark ? '#1e1e1e' : '#fff',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}>
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
                        {affectiveTraits.length > 0 ? affectiveTraits.map((trait) => (
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
                        )) : (
                          <Typography variant="caption" color="text.secondary">
                            No affective domains configured.
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    {/* Psychomotor domain */}
                    <TableCell>
                      <Stack spacing={1}>
                        {psychomotorTraits.length > 0 ? psychomotorTraits.map((trait) => (
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
                        )) : (
                          <Typography variant="caption" color="text.secondary">
                            No psychomotor domains configured.
                          </Typography>
                        )}
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
        <Button variant="contained" size="small" onClick={handleSubmitFinal} disabled={submitting || learners.length === 0}>
          {submitting ? 'SUBMITTING...' : 'SUBMIT FINAL ASSESSMENTS'}
        </Button>
      </Box>

      <Snackbar
        open={alertSnackbar.open}
        autoHideDuration={5000}
        onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={alertSnackbar.severity}
          onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))}
          variant="filled"
        >
          {alertSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarkPsychomotorTab;
