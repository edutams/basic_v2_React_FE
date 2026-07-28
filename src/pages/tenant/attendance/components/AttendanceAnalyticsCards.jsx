import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  useTheme,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  alpha,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  WarningAmberOutlined as WarningIcon,
  CalendarMonth as CalendarMonthIcon,
  TrendingFlat as TrendingFlatIcon,
  TrendingUp as TrendingUpIcon,
  EventNote as EventNoteIcon,
  NotificationsActive as NotificationsActiveIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import ReusableBarChart from '@/components/shared/charts/ReusableBarChart';
import AnalyticsModal from './AnalyticsModal';
import ReusableDialog from '@/components/shared/ReusableDialog';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

// ── Theme-aware stat card ──────────────────────────────────────
const StatCard = ({ children, colorName, colorIndex = 0, clickable = false, onClick, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(clickable
          ? {
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDark
                  ? '0 8px 30px rgba(0,0,0,0.35)'
                  : '0 6px 24px rgba(0,0,0,0.12)',
              },
            }
          : {}),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

// ── Reusable filter dropdowns for modals (local state) ────────
const ModalFilterDropdowns = ({ sessions, terms, weeks, programmes, classes, arms, initialFilters, onApply, applyLabel = 'Apply Filter' }) => {
  // Ensure initial filters use string IDs for consistent Select matching
  const normalizedInitial = {
    session: String(initialFilters?.session || ''),
    term: String(initialFilters?.term || ''),
    week: String(initialFilters?.week || ''),
    programme: String(initialFilters?.programme || ''),
    class: String(initialFilters?.class || ''),
    arm: String(initialFilters?.arm || ''),
  };

  const [localFilters, setLocalFilters] = useState(normalizedInitial);

  const [localTerms, setLocalTerms] = useState(terms);
  const [localWeeks, setLocalWeeks] = useState(weeks);
  const [localClasses, setLocalClasses] = useState(classes);
  const [localArms, setLocalArms] = useState(arms);

  // Sync localFilters when initialFilters change (key may not always trigger remount)
  useEffect(() => {
    setLocalFilters(normalizedInitial);
  }, [normalizedInitial.session, normalizedInitial.term, normalizedInitial.week, normalizedInitial.programme, normalizedInitial.class, normalizedInitial.arm]);

  useEffect(() => {
    if (!localFilters.session) return;
    fetchTerms(localFilters.session).then((r) => {
      const d = r.data?.data || r.data || [];
      setLocalTerms(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [localFilters.session]);

  useEffect(() => {
    if (!localFilters.session || !localFilters.term) return;
    attendanceApi.getWeeksBySessionTerm({ session_id: localFilters.session, term_id: localFilters.term })
      .then((r) => {
        const d = r.data?.data || [];
        setLocalWeeks(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [localFilters.session, localFilters.term]);

  useEffect(() => {
    if (!localFilters.programme) return;
    fetchClassesByProgramme(localFilters.programme).then((r) => {
      const d = r.data?.data || r.data || [];
      setLocalClasses(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [localFilters.programme]);

  useEffect(() => {
    if (!localFilters.class) return;
    fetchClassArmsByClass(localFilters.class, { programme_id: localFilters.programme || undefined })
      .then((r) => {
        const d = r.data || [];
        setLocalArms(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [localFilters.class, localFilters.programme]);

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Grid container spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Session</InputLabel>
          <Select value={String(localFilters.session || '')} label="Session" onChange={(e) => handleChange('session', e.target.value)}>
            {sessions.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>{s.sesname || s.name || s.id}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Term</InputLabel>
          <Select value={String(localFilters.term || '')} label="Term" onChange={(e) => handleChange('term', e.target.value)}>
            {localTerms.map((t) => (
              <MenuItem key={t.id} value={String(t.id)}>{t.term_name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Week</InputLabel>
          <Select value={String(localFilters.week || '')} label="Week" onChange={(e) => handleChange('week', e.target.value)}>
            {localWeeks.map((w) => {
              const weekId = String(w.wk_id ?? w.week_id ?? w.id);
              return (
                <MenuItem key={weekId} value={weekId}>{w.week_name || `Week ${weekId}`}</MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Programme</InputLabel>
          <Select value={String(localFilters.programme || '')} label="Programme" onChange={(e) => handleChange('programme', e.target.value)}>
            {programmes.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>{p.programme_name || p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Class</InputLabel>
          <Select value={String(localFilters.class || '')} label="Class" onChange={(e) => handleChange('class', e.target.value)}>
            {localClasses.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>{c.class_name || c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Class/Arm</InputLabel>
          <Select value={String(localFilters.arm || '')} label="Class/Arm" onChange={(e) => handleChange('arm', e.target.value)}>
            {localArms.map((a) => (
              <MenuItem key={a.id} value={String(a.id)}>{a.arm_names}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="small" onClick={handleApply}>
          {applyLabel}
        </Button>
      </Grid>
    </Grid>
  );
};

// ── Main Component ─────────────────────────────────────────────
const AttendanceAnalyticsCards = ({ metrics, classArmId, sessionId, termId, weekId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null, loading: false });
  // Ref counter forces ModalFilterDropdowns to remount fresh each time
  // Using a ref instead of state avoids stale closure issues
  const filterKeyRef = useRef(0);

  // Filter data arrays for dropdowns inside modals
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  // Alert dialog state for risk alerts
  const [riskAlertOpen, setRiskAlertOpen] = useState(false);
  const [riskLearners, setRiskLearners] = useState([]);
  const [sendingRiskAlert, setSendingRiskAlert] = useState(false);
  const [alertSnackbar, setAlertSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Active session / term IDs for pre-filling dropdowns
  const [activeSessionId, setActiveSessionId] = useState('');
  const [activeTermId, setActiveTermId] = useState('');

  // Load filter options
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes, activeStRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveSessionTerm(),
        ]);
        const sessionsData = sessRes.data?.data || sessRes.data || [];
        setSessions(sessionsData);
        setProgrammes(progRes.data?.data || progRes.data || []);

        const activeStData = activeStRes.data?.data || activeStRes.data;
        const activeSessId = activeStData?.session_id;
        const activeTerm = activeStData?.term_id;

        if (activeSessId) {
          // Find matching session to preserve the correct type (string vs number)
          const matchSession = sessionsData.find(
            (s) => String(s.id) === String(activeSessId)
          );
          setActiveSessionId(matchSession ? matchSession.id : activeSessId);
          if (activeTerm) setActiveTermId(activeTerm);

          const termsRes = await fetchTerms(activeSessId);
          const termsData = termsRes.data?.data || termsRes.data || [];
          setTerms(termsData);

          // Now match term ID against loaded terms
          if (activeTerm && termsData.length > 0) {
            const matchTerm = termsData.find(
              (t) => String(t.id) === String(activeTerm)
            );
            setActiveTermId(matchTerm ? matchTerm.id : activeTerm);
          }
        } else if (sessionsData.length > 0) {
          setActiveSessionId(sessionsData[0].id);
          const termsRes = await fetchTerms(sessionsData[0].id);
          const termsData = termsRes.data?.data || termsRes.data || [];
          setTerms(termsData);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const openCardModal = (cardTitle, modalBody) => {
    filterKeyRef.current += 1;
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  // ── Week Attendance Rate Analysis ────────────────────────────
  const openWeekBreakdown = useCallback(async (classArmId, _weekId, localFilters) => {
    const effectiveArmId = localFilters?.arm || classArmId;
    const effectiveWeekId = localFilters?.week || _weekId || weekId;
    const effectiveSession = localFilters?.session || sessionId || activeSessionId;
    const effectiveTerm = localFilters?.term || termId || activeTermId;

    if (!effectiveArmId || !effectiveWeekId) {
      openCardModal('Week Attendance Rate Analysis', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: effectiveWeekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={(lf) => openWeekBreakdown(classArmId, undefined, lf)}
          />
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Select Filters to View Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Please select a <strong>Class/Arm</strong> and <strong>Week</strong> from the dropdowns above, then click <strong>Apply Filter</strong> to view the daily attendance breakdown.
            </Typography>
          </Box>
        </Box>
      ));
      return;
    }

    setAnalyticsModal({ open: true, title: 'Week Attendance Rate Analysis', content: null, loading: true });
    try {
      const res = await attendanceApi.getDailyBreakdown({
        class_arm_id: effectiveArmId || undefined,
        week_term_id: effectiveWeekId || undefined,
        session_id: effectiveSession || undefined,
        term_id: effectiveTerm || undefined,
      });
      const data = res.data?.data || [];
      const hasData = data.length > 0 && data.some(d => d.rate > 0);

      openCardModal('Week Attendance Rate Analysis', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: effectiveWeekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={(lf) => openWeekBreakdown(classArmId, undefined, lf)}
          />
          {!hasData ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}>
                📊 No attendance data found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                No attendance records have been recorded for this week. Please mark attendance first to see the daily breakdown.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Daily learner attendance rate for the selected week.
              </Typography>
              <ReusableBarChart
                series={[{ name: 'Attendance %', data: data.map((d) => d.rate) }]}
                categories={data.map((d) => d.day_name)}
                colors={[theme.palette.warning.main]}
                height={280}
                yAxisFormatter={(val) => `${val}%`}
              />
            </Box>
          )}
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch daily breakdown:', e);
      openCardModal('Week Attendance Rate Analysis', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: localFilters?.session || sessionId || activeSessionId, term: localFilters?.term || termId || activeTermId, week: localFilters?.week || weekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: localFilters?.arm || classArmId }}
            onApply={(lf) => openWeekBreakdown(classArmId, undefined, lf)}
          />
          <Typography color="error">Failed to load data.</Typography>
        </Box>
      ));
    }
  }, [theme, sessionId, termId, weekId, activeSessionId, activeTermId, sessions, terms, weeks, programmes, classes, arms]);

  // ── Term Attendance Trend ────────────────────────────────────
  const openTermTrend = useCallback(async (classArmId, localFilters) => {
    const effectiveArmId = localFilters?.arm || classArmId;
    const effectiveSession = localFilters?.session || sessionId || activeSessionId;
    const effectiveTerm = localFilters?.term || termId || activeTermId;

    if (!effectiveArmId) {
      openCardModal('Term Attendance Trend', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: '', programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={(lf) => openTermTrend(classArmId, lf)}
          />
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Select Filters to View Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Please select a <strong>Class/Arm</strong> from the dropdowns above, then click <strong>Apply Filter</strong> to view the term attendance trend.
            </Typography>
          </Box>
        </Box>
      ));
      return;
    }

    setAnalyticsModal({ open: true, title: 'Term Attendance Trend', content: null, loading: true });
    try {
      const res = await attendanceApi.getWeeklyTrend({
        class_arm_id: effectiveArmId || undefined,
        session_id: effectiveSession || undefined,
        term_id: effectiveTerm || undefined,
      });
      const data = res.data?.data || [];
      const hasData = data.length > 0 && data.some(w => w.rate > 0);

      openCardModal('Term Attendance Trend', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: '', programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={(lf) => openTermTrend(classArmId, lf)}
          />
          {!hasData ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}>
                📈 No attendance data found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                No attendance records exist for this term yet. Start marking attendance to see the term trend.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Term-to-date attendance performance trend across all weeks.
              </Typography>
              <ReusableBarChart
                series={[{ name: 'Attendance %', data: data.map((w) => w.rate) }]}
                categories={data.map((w) => w.week_name)}
                colors={[theme.palette.info.main]}
                height={280}
                yAxisFormatter={(val) => `${val}%`}
                xAxisTitle="Week"
              />
            </Box>
          )}
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch weekly trend:', e);
      openCardModal('Term Attendance Trend', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: localFilters?.session || sessionId || activeSessionId, term: localFilters?.term || termId || activeTermId, week: localFilters?.week || '', programme: localFilters?.programme || '', class: localFilters?.class || '', arm: localFilters?.arm || classArmId }}
            onApply={(lf) => openTermTrend(classArmId, lf)}
          />
          <Typography color="error">Failed to load data.</Typography>
        </Box>
      ));
    }
  }, [theme, sessionId, termId, activeSessionId, activeTermId, sessions, terms, weeks, programmes, classes, arms]);

  // ── Absentees Summary (Table) ────────────────────────────────
  const openAbsenteesBreakdown = useCallback(async (localFilters) => {
    const effectiveArmId = localFilters?.arm || classArmId;
    const effectiveWeekId = localFilters?.week || weekId;
    const effectiveSession = localFilters?.session || sessionId || activeSessionId;
    const effectiveTerm = localFilters?.term || termId || activeTermId;

    if (!effectiveArmId) {
      openCardModal('Absentees Summary', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: effectiveWeekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={openAbsenteesBreakdown}
          />
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Select Filters to View Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Please select a <strong>Class/Arm</strong> from the dropdowns above, then click <strong>Apply Filter</strong> to view the absentees list.
            </Typography>
          </Box>
        </Box>
      ));
      return;
    }

    setAnalyticsModal({ open: true, title: 'Absentees Summary', content: null, loading: true });
    try {
      const res = await attendanceApi.getAbsenteesList({
        class_arm_id: effectiveArmId || undefined,
        week_term_id: effectiveWeekId || undefined,
        session_id: effectiveSession || undefined,
        term_id: effectiveTerm || undefined,
      });
      const payload = res.data?.data || {};
      const learners = payload.learners || [];

      openCardModal('Absentees Summary', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: effectiveWeekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={openAbsenteesBreakdown}
          />
          {learners.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No absentees recorded for the selected filters.</Typography>
          ) : (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {learners.length} absent learner(s) — list of absentee names with their class arms.
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 350, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Learner Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Class Arm</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Admission No.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {learners.map((l, idx) => (
                      <TableRow key={l.student_reg_id || idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="body2" fontWeight={600}>{l.name}</Typography>
                            {l.gender && (
                              <Chip
                                icon={l.gender === 'MALE' ? <MaleIcon fontSize="small" /> : <FemaleIcon fontSize="small" />}
                                label={l.gender}
                                size="small"
                                color={l.gender === 'MALE' ? 'primary' : 'success'}
                                variant="soft"
                                sx={{ height: 18, fontSize: '9px', fontWeight: 600 }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={l.arm_name || 'N/A'} size="small" variant="outlined" color="error" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{l.admission_no || '—'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                Total: {learners.length} absentee(s)
              </Typography>
            </Box>
          )}
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch absentees:', e);
      openCardModal('Absentees Summary', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: localFilters?.session || sessionId || activeSessionId, term: localFilters?.term || termId || activeTermId, week: localFilters?.week || weekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: localFilters?.arm || classArmId }}
            onApply={openAbsenteesBreakdown}
          />
          <Typography color="error">Failed to load data.</Typography>
        </Box>
      ));
    }
  }, [classArmId, sessionId, termId, weekId, activeSessionId, activeTermId, sessions, terms, weeks, programmes, classes, arms]);

  // ── At-Risk Learners Overview (Table) ────────────────────────
  const openAtRiskBreakdown = useCallback(async (localFilters) => {
    const effectiveArmId = localFilters?.arm || classArmId;
    const effectiveWeekId = localFilters?.week || weekId;
    const effectiveSession = localFilters?.session || sessionId || activeSessionId;
    const effectiveTerm = localFilters?.term || termId || activeTermId;

    if (!effectiveArmId) {
      openCardModal('At-Risk Learners Overview', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: effectiveWeekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={openAtRiskBreakdown}
          />
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Select Filters to View Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Please select a <strong>Class/Arm</strong> from the dropdowns above, then click <strong>Apply Filter</strong> to view the at-risk learners list.
            </Typography>
          </Box>
        </Box>
      ));
      return;
    }

    setAnalyticsModal({ open: true, title: 'At-Risk Learners Overview', content: null, loading: true });
    try {
      const res = await attendanceApi.getAtRiskLearners({
        class_arm_id: effectiveArmId || undefined,
        week_term_id: effectiveWeekId || undefined,
        session_id: effectiveSession || undefined,
        term_id: effectiveTerm || undefined,
      });
      const payload = res.data?.data || {};
      const learners = payload.learners || [];
      setRiskLearners(learners);

      openCardModal('At-Risk Learners Overview', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: effectiveSession, term: effectiveTerm, week: effectiveWeekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: effectiveArmId }}
            onApply={openAtRiskBreakdown}
          />
          {learners.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No at-risk learners for the selected filters.</Typography>
          ) : (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {learners.length} at-risk learner(s) — learners with persistent absence.
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 350, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Learner Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Class Arm</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {learners.map((l, idx) => (
                      <TableRow key={l.student_reg_id || idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{l.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={l.arm_name || 'N/A'} size="small" variant="outlined" color="error" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Total: {learners.length} at-risk learner(s)
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<NotificationsActiveIcon />}
                  onClick={() => setRiskAlertOpen(true)}
                  disabled={learners.length === 0}
                >
                  Send Risk Alerts
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch at-risk learners:', e);
      openCardModal('At-Risk Learners Overview', (
        <Box>
          <ModalFilterDropdowns key={filterKeyRef.current}
            sessions={sessions} terms={terms} weeks={weeks}
            programmes={programmes} classes={classes} arms={arms}
            initialFilters={{ session: localFilters?.session || sessionId || activeSessionId, term: localFilters?.term || termId || activeTermId, week: localFilters?.week || weekId, programme: localFilters?.programme || '', class: localFilters?.class || '', arm: localFilters?.arm || classArmId }}
            onApply={openAtRiskBreakdown}
          />
          <Typography color="error">Failed to load data.</Typography>
        </Box>
      ));
    }
  }, [classArmId, sessionId, termId, weekId, activeSessionId, activeTermId, sessions, terms, weeks, programmes, classes, arms]);

  const handleSendRiskAlerts = async () => {
    const ids = riskLearners.map((l) => Number(l.student_reg_id)).filter(Boolean);
    if (ids.length === 0) {
      setAlertSnackbar({ open: true, message: 'No learners to send risk alerts for', severity: 'warning' });
      return;
    }
    setSendingRiskAlert(true);
    try {
      const res = await attendanceApi.sendRiskAlerts(ids, weekId, classArmId);
      const msg = res.data?.message || 'Risk alerts sent successfully';
      setAlertSnackbar({ open: true, message: msg, severity: 'success' });
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send risk alerts';
      setAlertSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSendingRiskAlert(false);
      setRiskAlertOpen(false);
    }
  };

  const colors = {
    success: getStatCardColor('success', 1, isDark, theme),
    warning: getStatCardColor('warning', 3, isDark, theme),
    info: getStatCardColor('info', 2, isDark, theme),
    error: getStatCardColor('error', 4, isDark, theme),
    secondary: getStatCardColor('secondary', 5, isDark, theme),
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: DAYS SCHOOL OPEN */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard colorName="success" colorIndex={1}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.72)' : colors.success.accentColor,
                textTransform: 'uppercase',
              }}
            >
              DAYS SCHOOL OPEN
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: isDark ? '#fff' : colors.success.accentColor }}
            >
              {metrics.daysOpen}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.daysOpen}
              sx={{
                my: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.success.accentColor,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>
                126 out of 130
              </Typography>
              <CalendarMonthIcon sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
            </Stack>
          </StatCard>
        </Grid>

        {/* Card 2: WEEK ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view weekly attendance breakdown" arrow placement="top">
            <StatCard
              colorName="warning"
              colorIndex={3}
              clickable
              onClick={() => openWeekBreakdown(classArmId, undefined)}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.72)' : colors.warning.accentColor,
                  textTransform: 'uppercase',
                }}
              >
                WEEK ATTENDANCE RATE
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: isDark ? '#fff' : colors.warning.accentColor }}
              >
                {metrics.weekRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.weekRate}
                sx={{
                  my: 1,
                  height: 5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.warning.accentColor,
                  },
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>
                  0% Same as last week
                </Typography>
                <TrendingFlatIcon sx={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
              </Stack>
            </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 3: TERM ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view term attendance trend" arrow placement="top">
            <StatCard
              colorName="info"
              colorIndex={2}
              clickable
              onClick={() => openTermTrend(classArmId)}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.72)' : colors.info.accentColor,
                  textTransform: 'uppercase',
                }}
              >
                TERM ATTENDANCE RATE
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: isDark ? '#fff' : colors.info.accentColor }}
              >
                {metrics.termRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.termRate}
                sx={{
                  my: 1,
                  height: 5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.info.accentColor,
                  },
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Typography variant="caption" fontWeight={600} sx={{ color: colors.info.accentColor }}>
                  ↑ 44% Higher last term
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 14, color: colors.info.accentColor }} />
              </Stack>
            </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 4: TOTAL ABSENTEES */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view absentees list" arrow placement="top">
            <StatCard
              colorName="error"
              colorIndex={4}
              clickable
              onClick={openAbsenteesBreakdown}
              sx={{ position: 'relative' }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.72)' : colors.error.accentColor,
                  textTransform: 'uppercase',
                }}
              >
                TOTAL ABSENTEES
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: isDark ? '#fff' : colors.error.accentColor }}
              >
                {metrics.totalAbsentees}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={30}
                sx={{
                  my: 1,
                  height: 5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.error.accentColor,
                  },
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>
                  Current Session
                </Typography>
                <EventNoteIcon sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
              </Stack>
            </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 5: AT-RISK STUDENTS */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view at-risk learners" arrow placement="top">
            <StatCard
              colorName="error"
              colorIndex={4}
              clickable
              onClick={openAtRiskBreakdown}
              sx={{
                border: (t) =>
                  t.palette.mode === 'dark'
                    ? '2px solid rgba(239,68,68,0.5)'
                    : `2px solid ${colors.error.accentColor}`,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: colors.error.accentColor, textTransform: 'uppercase' }}
              >
                AT-RISK STUDENTS
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: colors.error.accentColor }}
              >
                {metrics.atRisk}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={15}
                sx={{
                  my: 1,
                  height: 5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.error.accentColor,
                  },
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Typography variant="caption" sx={{ color: colors.error.accentColor }}>
                  1+ Week Absence
                </Typography>
                <WarningIcon sx={{ fontSize: 13, color: colors.error.accentColor }} />
              </Stack>
            </StatCard>
          </Tooltip>
        </Grid>
      </Grid>

      <AnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        title={analyticsModal.title}
        content={analyticsModal.content}
        loading={analyticsModal.loading}
      />

      <ReusableDialog
        open={riskAlertOpen}
        onClose={() => setRiskAlertOpen(false)}
        title="Send Risk Alerts"
        content={
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom fontWeight={500}>
              You are about to send risk alerts to the guardians of {riskLearners.length} at-risk learner(s).
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Risk alerts notify guardians that their ward is at risk due to poor attendance.
            </Typography>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => setRiskAlertOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleSendRiskAlerts}
              disabled={sendingRiskAlert}
              autoFocus
            >
              {sendingRiskAlert ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        }
      />

      <Snackbar
        open={alertSnackbar.open}
        autoHideDuration={5000}
        onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alertSnackbar.severity} onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))} variant="filled">
          {alertSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AttendanceAnalyticsCards;
