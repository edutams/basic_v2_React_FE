import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Tooltip,
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
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon,
  Add as AddIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const MarkAttendanceTab = ({ metrics, onFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [attSession, setAttSession] = useState('');
  const [attTerm, setAttTerm] = useState('');
  const [attWeek, setAttWeek] = useState('');
  const [attProgramme, setAttProgramme] = useState('');
  const [attClass, setAttClass] = useState('');
  const [attArm, setAttArm] = useState('');
  const [attendanceType, setAttendanceType] = useState('morning');

  // ── Learners & Attendance Data ────────────────────────────
  const [learners, setLearners] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Load filter options ───────────────────────────────────
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
    if (!attSession) return;
    fetchTerms(attSession).then((r) => setTerms(r.data?.data || r.data || [])).catch(console.error);
  }, [attSession]);

  useEffect(() => {
    if (!attProgramme) return;
    fetchClassesByProgramme(attProgramme).then((r) => {
      const d = r.data?.data || r.data || [];
      setClasses(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [attProgramme]);

  useEffect(() => {
    if (!attClass) return;
    fetchClassArmsByClass(attClass).then((r) => {
      const d = r.data?.data || [];
      setArms(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [attClass]);

  // ── Fetch Weeks when term changes ─────────────────────────
  useEffect(() => {
    if (!attTerm) return;
    const fetchWeeks = async () => {
      try {
        const res = await attendanceApi.getWeeks(attTerm);
        const data = res.data?.data || [];
        setWeeks(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };
    fetchWeeks();
  }, [attTerm]);

  // ── Fetch Learners & Attendance when filter applied ───────
  const fetchLearners = useCallback(async () => {
    if (!attArm || !attWeek) return;
    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.getAttendanceLearners({
        class_arm_id: attArm,
        week_term_id: attWeek,
      });
      if (res.data?.status && res.data?.data) {
        const data = res.data.data;
        setLearners(data);
        // Build attendanceData map from API
        const attMap = {};
        data.forEach((learner) => {
          attMap[learner.student_reg_id] = learner.attendance || {};
        });
        setAttendanceData(attMap);
      }
    } catch (e) {
      console.error('Failed to fetch learners:', e);
      setError('Failed to load learners. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [attArm, attWeek]);

  // ── Handlers ──────────────────────────────────────────────
  const setDayStatus = (learnerId, day, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [learnerId]: { ...(prev[learnerId] || {}), [day]: status },
    }));
  };

  const bulkSetDayStatus = (day, status) => {
    setAttendanceData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id][day] !== 'holiday') {
          updated[id] = { ...updated[id], [day]: status };
        }
      });
      return updated;
    });
  };

  const handleApplyFilter = () => {
    fetchLearners();
    if (onFilter) onFilter(attArm);
  };

  const handleSubmitAttendance = async () => {
    if (!attArm || !attWeek) return;
    setSubmitting(true);
    try {
      // Group attendance changes by (day, status) and fire concurrently
      const bulkOps = [];
      Object.entries(attendanceData).forEach(([learnerId, days]) => {
        Object.entries(days).forEach(([day, status]) => {
          if (status && status !== 'unknown' && status !== 'holiday') {
            bulkOps.push(
              attendanceApi.markAttendance({
                student_id: Number(learnerId),
                week_term_id: Number(attWeek),
                date: day,
                status,
              })
            );
          }
        });
      });

      // Fire all requests concurrently
      await Promise.allSettled(bulkOps);
    } catch (e) {
      console.error('Failed to submit attendance:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Summary Stats ─────────────────────────────────────────
  const totalPresent = Object.values(attendanceData).reduce(
    (sum, att) => sum + Object.values(att).filter((v) => v === 'present').length, 0
  );
  const totalLearners = learners.length;
  const attendancePercent = totalLearners > 0
    ? Math.round((totalPresent / (totalLearners * DAY_NAMES.length)) * 100)
    : 0;

  // ── Derive days from learners' attendance data ────────────
  const days = learners.length > 0
    ? Object.keys(Object.values(attendanceData)[0] || {}).filter((d) => d.match(/^\d{4}-\d{2}-\d{2}$/))
    : DAY_NAMES;

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Action Buttons Row ──────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={1.5}>
        <Typography variant="h6" fontWeight={700}>
          Learner Attendance
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" size="small" startIcon={<EmailIcon />}>Send Alerts</Button>
          <Button variant="outlined" color="error" size="small" startIcon={<NotificationsActiveIcon />}>Risk Alerts</Button>
          <Button variant="contained" color="success" size="small" startIcon={<AddIcon />}>Attendance Report</Button>
        </Stack>
      </Stack>

      {/* ── Filters ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={attSession} label="Session" onChange={(e) => setAttSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={attTerm} label="Term" onChange={(e) => setAttTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.display_name || t.name || t.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Week</InputLabel>
            <Select value={attWeek} label="Week" onChange={(e) => setAttWeek(e.target.value)}>
              {weeks.map((w) => (
                <MenuItem key={w.id} value={w.id}>{w.week_name || `Week ${w.week_id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={attProgramme} label="Programme" onChange={(e) => setAttProgramme(e.target.value)}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class/Arm</InputLabel>
            <Select value={attArm} label="Class/Arm" onChange={(e) => setAttArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.arm_names || `Arm ${a.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button variant="contained" size="small" fullWidth startIcon={<FilterIcon />} onClick={handleApplyFilter}>
            Filter
          </Button>
        </Grid>
      </Grid>

      {/* ── Morning/Afternoon Toggle ─────────────────────── */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
        <RadioGroup row value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)}>
          <FormControlLabel value="morning" control={<Radio size="small" />} label="Morning" />
          <FormControlLabel value="afternoon" control={<Radio size="small" />} label="Afternoon" />
        </RadioGroup>
      </Box>

      {/* ── Attendance Table & Summary ──────────────────── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
          )}
          <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>S/N</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Learner's Name</TableCell>
                  {days.map((day) => (
                    <TableCell key={day} align="center" sx={{ minWidth: 100 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {day}
                      </Typography>
                      <Stack direction="row" spacing={0.25} justifyContent="center" mt={0.5}>
                        <Tooltip title={`Mark all ${day} Present`}>
                          <IconButton size="small" onClick={() => bulkSetDayStatus(day, 'present')}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Mark all ${day} Absent`}>
                          <IconButton size="small" onClick={() => bulkSetDayStatus(day, 'absent')}>
                            <CancelOutlinedIcon color="error" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Clear all ${day}`}>
                          <IconButton size="small" onClick={() => bulkSetDayStatus(day, 'unknown')}>
                            <RadioButtonUncheckedIcon color="action" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  ))}
                  <TableCell align="center">Weekly Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={days.length + 2} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : learners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={days.length + 2} align="center" sx={{ py: 6 }}>
                      {attArm && attWeek ? 'No learners found. Please apply filters.' : 'Select a class/arm and week, then click Filter.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  learners.map((learner, idx) => {
                    const att = attendanceData[learner.student_reg_id] || {};
                    return (
                      <TableRow key={learner.student_reg_id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight={600}>{learner.name}</Typography>
                            <Chip
                              icon={learner.gender === 'MALE' ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}
                              label={learner.gender}
                              size="small"
                              color={learner.gender === 'MALE' ? 'primary' : 'success'}
                              variant="soft"
                              sx={{ height: 20, fontSize: '10px', fontWeight: 600 }}
                            />
                          </Box>
                        </TableCell>
                        {days.map((day) => (
                          <TableCell key={day} align="center">
                            {att[day] === 'holiday' ? (
                              <Typography variant="caption" color="text.secondary" fontStyle="italic">Holiday</Typography>
                            ) : (
                              <RadioGroup
                                row
                                value={att[day] || 'unknown'}
                                onChange={(e) => setDayStatus(learner.student_reg_id, day, e.target.value)}
                                sx={{ justifyContent: 'center' }}
                              >
                                <FormControlLabel value="present" control={<Radio size="small" color="success" sx={{ p: 0.25 }} />} label="" sx={{ m: 0 }} />
                                <FormControlLabel value="absent" control={<Radio size="small" color="error" sx={{ p: 0.25 }} />} label="" sx={{ m: 0 }} />
                                <FormControlLabel value="unknown" control={<Radio size="small" color="default" sx={{ p: 0.25 }} />} label="" sx={{ m: 0 }} />
                              </RadioGroup>
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={700}>
                            {Object.values(att).filter((v) => v === 'present').length}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmitAttendance}
              disabled={submitting || learners.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </Box>
        </Grid>

        {/* ── Right Summary Card ─────────────────────────── */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                TOTAL ATTENDANCE
              </Typography>
              <Typography variant="h2" fontWeight={800} color="text.primary" sx={{ my: 1 }}>
                {attendancePercent}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalPresent} present out of {totalLearners} learners
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarkAttendanceTab;
