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
  ToggleButton,
  ToggleButtonGroup,
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
  Checkbox,
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
  TrendingDown as TrendingDownIcon,
  EventNote as EventNoteIcon,
  NotificationsActive as NotificationsActiveIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  BarChart as BarChartIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';

import ReusableBarChart from '@/components/shared/charts/ReusableBarChart';
import AnalyticsModal from './AnalyticsModal';
import StatCardSkeleton from './StatCardSkeleton';
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
import { fetchAcademicInfo } from '@/api/tenant/tenant_api';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

// ── Theme-aware stat card ──────────────────────────────────────
const StatCard = ({ children, colorIndex = 0, clickable = false, onClick, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        ...(clickable
          ? {
            '&:hover': {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
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
const ModalFilterDropdowns = ({
  sessions,
  terms,
  weeks,
  programmes,
  classes,
  arms,
  initialFilters,
  onApply,
  applyLabel = 'Apply Filter',
  activeWeekId,
}) => {
  const activeWeekIdRef = useRef(activeWeekId);
  useEffect(() => {
    activeWeekIdRef.current = activeWeekId;
  }, [activeWeekId]);

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
  }, [
    normalizedInitial.session,
    normalizedInitial.term,
    normalizedInitial.week,
    normalizedInitial.programme,
    normalizedInitial.class,
    normalizedInitial.arm,
  ]);

  useEffect(() => {
    if (!localFilters.session) return;
    fetchTerms(localFilters.session)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setLocalTerms(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [localFilters.session]);

  useEffect(() => {
    if (!localFilters.session || !localFilters.term) return;
    let cancelled = false;
    attendanceApi
      .getWeeksBySessionTerm({ session_id: localFilters.session, term_id: localFilters.term })
      .then((r) => {
        if (cancelled) return;
        const d = r.data?.data || [];
        const weeks = Array.isArray(d) ? d : [];
        setLocalWeeks(weeks);
        const wkId = activeWeekIdRef.current;
        if (weeks.length > 0 && !localFilters.week) {
          const match = wkId ? weeks.find((w) => String(w.week_id) === wkId) : null;
          const active =
            match || weeks.find((w) => w.status === 'active') || weeks[weeks.length - 1];
          if (active) {
            setLocalFilters((prev) => {
              if (prev.week) return prev;
              return { ...prev, week: String(active.wk_id ?? active.week_id ?? active.id) };
            });
          }
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [localFilters.session, localFilters.term]);

  useEffect(() => {
    if (!localFilters.programme) return;
    fetchClassesByProgramme(localFilters.programme)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setLocalClasses(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
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
    <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Session</InputLabel>
          <Select
            value={String(localFilters.session || '')}
            label="Session"
            onChange={(e) => handleChange('session', e.target.value)}
          >
            {sessions.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.session_name || s.name || s.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Term</InputLabel>
          <Select
            value={String(localFilters.term || '')}
            label="Term"
            onChange={(e) => handleChange('term', e.target.value)}
          >
            {localTerms.map((t) => (
              <MenuItem key={t.id} value={String(t.id)}>
                {t.term_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Week</InputLabel>
          <Select
            value={String(localFilters.week || '')}
            label="Week"
            onChange={(e) => handleChange('week', e.target.value)}
          >
            {localWeeks.map((w) => {
              const weekId = String(w.wk_id ?? w.week_id ?? w.id);
              return (
                <MenuItem key={weekId} value={weekId}>
                  {w.week_name || `Week ${weekId}`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Programme</InputLabel>
          <Select
            value={String(localFilters.programme || '')}
            label="Programme"
            onChange={(e) => handleChange('programme', e.target.value)}
          >
            {programmes.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.programme_name || p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Class</InputLabel>
          <Select
            value={String(localFilters.class || '')}
            label="Class"
            onChange={(e) => handleChange('class', e.target.value)}
          >
            {localClasses.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.class_name || c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Class/Arm</InputLabel>
          <Select
            value={String(localFilters.arm || '')}
            label="Class/Arm"
            onChange={(e) => handleChange('arm', e.target.value)}
          >
            {localArms.map((a) => (
              <MenuItem key={a.id} value={String(a.id)}>
                {a.class_arm_names}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 1.8 }}>
        <Button variant="contained" size="small" fullWidth onClick={handleApply}>
          {applyLabel}
        </Button>
      </Grid>
    </Grid>
  );
};

// ── Week Breakdown Content (Chart + Table side by side) ──────
const WeekBreakdownContent = ({ dailyData, learners, dates, totalCount, theme }) => {
  const isDark = theme.palette.mode === 'dark';

  const getDayStatus = (attendance, date) => {
    const day = attendance?.[date];
    if (!day || day.__holiday) return { label: '—', color: 'text.secondary' };
    const morning = day.morning?.is_present;
    const afternoon = day.afternoon?.is_present;
    if (morning === 'present' || afternoon === 'present')
      return { label: 'Present', color: 'success.main' };
    if (morning || afternoon) return { label: 'Absent', color: 'error.main' };
    return { label: '—', color: 'text.secondary' };
  };

  const countPresentForDay = (attendance, date) => {
    const day = attendance?.[date];
    if (!day || day.__holiday) return 0;
    let count = 0;
    if (day.morning?.is_present === 'present') count++;
    if (day.afternoon?.is_present === 'present') count++;
    return count;
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Number of learners present per day and individual learner attendance status for the selected
        week.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ReusableBarChart
            series={[{ name: 'Students Present', data: dailyData.map((d) => d.present_count) }]}
            categories={dailyData.map((d) => d.day_name)}
            colors={[theme.palette.success.main]}
            height={280}
            yAxisFormatter={(val) => `${val} / ${totalCount}`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TableContainer
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2, height: 280, overflow: 'auto' }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      minWidth: 160,
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: isDark ? '#1e1e1e' : '#fff',
                    }}
                  >
                    Learner Name
                  </TableCell>
                  {dates.map((date) => {
                    const dayName = dailyData.find((d) => d.date === date)?.day_name || date;
                    return (
                      <TableCell key={date} align="center" sx={{ fontWeight: 700, minWidth: 80 }}>
                        <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>
                          {dayName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '10px' }}
                        >
                          {date}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 60 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {learners.map((learner) => {
                  const att = learner.attendance || {};
                  const totalPresent = dates.reduce(
                    (sum, date) => sum + countPresentForDay(att, date),
                    0,
                  );
                  return (
                    <TableRow key={learner.student_registration_id} hover>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          bgcolor: isDark ? '#1e1e1e' : '#fff',
                          borderRight: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {learner.name}
                      </TableCell>
                      {dates.map((date) => {
                        const { label, color } = getDayStatus(att, date);
                        return (
                          <TableCell key={date} align="center">
                            <Typography
                              variant="body2"
                              sx={{ color, fontWeight: label === 'Present' ? 700 : 400 }}
                            >
                              {label}
                            </Typography>
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">
                        <Chip label={totalPresent} size="small" color="success" variant="soft" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

// ── Term Trend Content (Chart + Table side by side) ──────────
const TermTrendContent = ({ weeklyData, theme }) => {
  const isDark = theme.palette.mode === 'dark';

  const fmtPct = (v) => (isNaN(v) ? '—' : `${Math.round(v)}%`);

  const weeklyRates = weeklyData.map((w) => {
    const rate = w.present + w.absent > 0 ? (w.present / (w.present + w.absent)) * 100 : 0;
    const completion =
      w.total_students * w.total_school_days > 0
        ? ((w.present + w.absent) / (w.total_students * w.total_school_days)) * 100
        : 0;
    return { ...w, rate, completion };
  });

  const totalPresent = weeklyRates.reduce((s, w) => s + w.present, 0);
  const totalAbsent = weeklyRates.reduce((s, w) => s + w.absent, 0);
  const totalPossible = weeklyRates.reduce((s, w) => s + w.total_students * w.total_school_days, 0);
  const termRate =
    totalPresent + totalAbsent > 0 ? (totalPresent / (totalPresent + totalAbsent)) * 100 : 0;
  const termCompletion =
    totalPossible > 0 ? ((totalPresent + totalAbsent) / totalPossible) * 100 : 0;

  const colorForRate = (rate) =>
    rate >= 75 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main';

  return (
    <Box>
      {/* ── Term Summary ── */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Term Attendance Rate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colorForRate(termRate) }}>
              {fmtPct(termRate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Term Completion Rate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {fmtPct(termCompletion)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4, sm: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Present
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              {totalPresent}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4, sm: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Absent
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
              {totalAbsent}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4, sm: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Possible
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {totalPossible}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Weekly attendance rate trend for the selected term.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ReusableBarChart
            series={[{ name: 'Attendance Rate', data: weeklyRates.map((w) => Math.round(w.rate)) }]}
            categories={weeklyRates.map((w) => w.week_name)}
            colors={[theme.palette.info.main]}
            height={280}
            yAxisFormatter={(val) => `${val}%`}
            xAxisTitle="Week"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TableContainer
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2, height: 320, overflow: 'auto' }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      minWidth: 100,
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: isDark ? '#1e1e1e' : '#fff',
                    }}
                  >
                    Week
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 55 }}>
                    Present
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 55 }}>
                    Absent
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 55 }}>
                    Not Marked
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 55 }}>
                    Rate
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 55 }}>
                    Completion
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeklyRates.map((week) => {
                  const totalPossibleW = week.total_students * week.total_school_days;
                  const notMarked = totalPossibleW - week.present - week.absent;
                  return (
                    <TableRow key={week.week_id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{week.week_name}</TableCell>
                      <TableCell align="center">
                        <Chip label={week.present} size="small" color="success" variant="soft" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={week.absent} size="small" color="error" variant="soft" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {notMarked}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: colorForRate(week.rate) }}
                        >
                          {fmtPct(week.rate)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {fmtPct(week.completion)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

// ── Main Component ─────────────────────────────────────────────
const AttendanceAnalyticsCards = ({
  metrics,
  schoolDaysMetrics,
  loading = false,
  classArmId,
  sessionId,
  termId,
  weekId,
  programmeId,
  classId,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({
    open: false,
    title: '',
    content: null,
    loading: false,
  });
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
  const [selectedRiskLearners, setSelectedRiskLearners] = useState({});
  const [sendingRiskAlert, setSendingRiskAlert] = useState(false);
  const [alertSnackbar, setAlertSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Risk modal data (stored separately to avoid stale closures in modal content)
  const [riskModalData, setRiskModalData] = useState(null);

  // Last-applied at-risk filters so the modal dropdowns don't revert to the preselected week
  const [atRiskFilters, setAtRiskFilters] = useState(null);

  // Active session / term / week IDs for pre-filling dropdowns
  const [activeSessionId, setActiveSessionId] = useState('');
  const [activeTermId, setActiveTermId] = useState('');
  const [activeWeekId, setActiveWeekId] = useState(null);

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
          const matchSession = sessionsData.find((s) => String(s.id) === String(activeSessId));
          setActiveSessionId(matchSession ? matchSession.id : activeSessId);
          if (activeTerm) setActiveTermId(activeTerm);

          const termsRes = await fetchTerms(activeSessId);
          const termsData = termsRes.data?.data || termsRes.data || [];
          setTerms(termsData);

          // Now match term ID against loaded terms
          if (activeTerm && termsData.length > 0) {
            const matchTerm = termsData.find((t) => String(t.id) === String(activeTerm));
            setActiveTermId(matchTerm ? matchTerm.id : activeTerm);
          }
        } else if (sessionsData.length > 0) {
          setActiveSessionId(sessionsData[0].id);
          const termsRes = await fetchTerms(sessionsData[0].id);
          const termsData = termsRes.data?.data || termsRes.data || [];
          setTerms(termsData);
        }

        // Fetch academic_week_id for week preselection
        try {
          const ackRes = await fetchAcademicInfo();
          if (ackRes?.academic_week_id) {
            setActiveWeekId(String(ackRes.academic_week_id));
          }
        } catch (e) {
          /* best-effort */
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const openCardModal = (cardTitle, modalBody) => {
    filterKeyRef.current += 1;
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  // ── Week Attendance Rate Analysis ────────────────────────────
  const openWeekBreakdown = useCallback(
    async (classArmId, _weekId, localFilters) => {
      const effectiveArmId = localFilters?.arm || classArmId;
      const effectiveWeekId = localFilters?.week || _weekId || weekId;
      const effectiveSession = localFilters?.session || sessionId || activeSessionId;
      const effectiveTerm = localFilters?.term || termId || activeTermId;

      if (!effectiveArmId || !effectiveWeekId) {
        openCardModal(
          'Week Attendance Rate Analysis',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: effectiveWeekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={(lf) => openWeekBreakdown(classArmId, undefined, lf)}
            />
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Select Filters to View Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                Please select a <strong>Class/Arm</strong> and <strong>Week</strong> from the
                dropdowns above, then click <strong>Apply Filter</strong> to view the daily
                attendance breakdown.
              </Typography>
            </Box>
          </Box>,
        );
        return;
      }

      setAnalyticsModal({
        open: true,
        title: 'Week Attendance Rate Analysis',
        content: null,
        loading: true,
      });
      try {
        const [breakdownRes, learnersRes] = await Promise.all([
          attendanceApi.getDailyBreakdown({
            class_arm_id: effectiveArmId || undefined,
            week_term_id: effectiveWeekId || undefined,
            session_id: effectiveSession || undefined,
            term_id: effectiveTerm || undefined,
          }),
          attendanceApi.getAttendanceLearners({
            class_arm_id: effectiveArmId || undefined,
            week_term_id: effectiveWeekId || undefined,
            session_id: effectiveSession || undefined,
            term_id: effectiveTerm || undefined,
          }),
        ]);
        const data = breakdownRes.data?.data || [];
        const learnerData = learnersRes.data?.data;
        const students = learnerData?.students || [];
        const dates = learnerData?.dates || data.map((d) => d.date) || [];
        const hasData = data.length > 0 && data.some((d) => d.present_count > 0);

        openCardModal(
          'Week Attendance Rate Analysis',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: effectiveWeekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={(lf) => openWeekBreakdown(classArmId, undefined, lf)}
            />
            {!hasData ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
                >
                  📊 No attendance data found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 360, mx: 'auto' }}
                >
                  No attendance records have been recorded for this week. Please mark attendance
                  first to see the daily breakdown.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ py: 1 }}>
                <WeekBreakdownContent
                  dailyData={data}
                  learners={students}
                  dates={dates}
                  totalCount={data.length > 0 ? data[0].total_count : 0}
                  theme={theme}
                />
              </Box>
            )}
          </Box>,
        );
      } catch (e) {
        console.error('Failed to fetch daily breakdown:', e);
        openCardModal(
          'Week Attendance Rate Analysis',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: localFilters?.session || sessionId || activeSessionId,
                term: localFilters?.term || termId || activeTermId,
                week: localFilters?.week || weekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: localFilters?.arm || classArmId,
              }}
              onApply={(lf) => openWeekBreakdown(classArmId, undefined, lf)}
            />
            <Typography color="error">Failed to load data.</Typography>
          </Box>,
        );
      }
    },
    [
      theme,
      sessionId,
      termId,
      weekId,
      activeSessionId,
      activeTermId,
      activeWeekId,
      sessions,
      terms,
      weeks,
      programmes,
      classes,
      arms,
    ],
  );

  // ── Term Attendance Trend ────────────────────────────────────
  const openTermTrend = useCallback(
    async (classArmId, localFilters) => {
      const effectiveArmId = localFilters?.arm || classArmId;
      const effectiveSession = localFilters?.session || sessionId || activeSessionId;
      const effectiveTerm = localFilters?.term || termId || activeTermId;

      if (!effectiveArmId) {
        openCardModal(
          'Term Attendance Trend',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: '',
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={(lf) => openTermTrend(classArmId, lf)}
            />
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Select Filters to View Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                Please select a <strong>Class/Arm</strong> from the dropdowns above, then click{' '}
                <strong>Apply Filter</strong> to view the term attendance trend.
              </Typography>
            </Box>
          </Box>,
        );
        return;
      }

      setAnalyticsModal({
        open: true,
        title: 'Term Attendance Trend',
        content: null,
        loading: true,
      });
      try {
        const res = await attendanceApi.getWeeklyTrend({
          class_arm_id: effectiveArmId || undefined,
          session_id: effectiveSession || undefined,
          term_id: effectiveTerm || undefined,
        });
        const data = res.data?.data || [];
        const hasData = data.length > 0 && data.some((w) => w.present > 0);

        openCardModal(
          'Term Attendance Trend',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: '',
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={(lf) => openTermTrend(classArmId, lf)}
            />
            {!hasData ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
                >
                  📈 No attendance data found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 360, mx: 'auto' }}
                >
                  No attendance records exist for this term yet. Start marking attendance to see the
                  term trend.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ py: 1 }}>
                <TermTrendContent weeklyData={data} theme={theme} />
              </Box>
            )}
          </Box>,
        );
      } catch (e) {
        console.error('Failed to fetch weekly trend:', e);
        openCardModal(
          'Term Attendance Trend',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: localFilters?.session || sessionId || activeSessionId,
                term: localFilters?.term || termId || activeTermId,
                week: localFilters?.week || '',
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: localFilters?.arm || classArmId,
              }}
              onApply={(lf) => openTermTrend(classArmId, lf)}
            />
            <Typography color="error">Failed to load data.</Typography>
          </Box>,
        );
      }
    },
    [
      theme,
      sessionId,
      termId,
      activeSessionId,
      activeTermId,
      activeWeekId,
      sessions,
      terms,
      weeks,
      programmes,
      classes,
      arms,
    ],
  );

  // ── Absentees Summary (Table) ────────────────────────────────
  const openAbsenteesBreakdown = useCallback(
    async (localFilters) => {
      const effectiveArmId = localFilters?.arm || classArmId;
      const effectiveWeekId = localFilters?.week || weekId;
      const effectiveSession = localFilters?.session || sessionId || activeSessionId;
      const effectiveTerm = localFilters?.term || termId || activeTermId;

      if (!effectiveArmId) {
        openCardModal(
          'Absentees Summary',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: effectiveWeekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={openAbsenteesBreakdown}
            />
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Select Filters to View Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                Please select a <strong>Class/Arm</strong> from the dropdowns above, then click{' '}
                <strong>Apply Filter</strong> to view the absentees list.
              </Typography>
            </Box>
          </Box>,
        );
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

        openCardModal(
          'Absentees Summary',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: effectiveWeekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={openAbsenteesBreakdown}
            />
            {learners.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No absentees recorded for the selected filters.
              </Typography>
            ) : (
              <Box sx={{ py: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {learners.length} absent learner(s) — list of absentee names with their class
                  arms.
                </Typography>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2, maxHeight: 350, overflow: 'auto' }}
                >
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
                        <TableRow key={l.student_registration_id || idx} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="body2" fontWeight={600}>
                                {l.name}
                              </Typography>
                              {l.gender && (
                                <Chip
                                  icon={
                                    l.gender === 'MALE' ? (
                                      <MaleIcon fontSize="small" />
                                    ) : (
                                      <FemaleIcon fontSize="small" />
                                    )
                                  }
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
                            <Chip
                              label={l.arm_name || 'N/A'}
                              size="small"
                              variant="outlined"
                              color="error"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {l.admission_no || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block', textAlign: 'right' }}
                >
                  Total: {learners.length} absentee(s)
                </Typography>
              </Box>
            )}
          </Box>,
        );
      } catch (e) {
        console.error('Failed to fetch absentees:', e);
        openCardModal(
          'Absentees Summary',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: localFilters?.session || sessionId || activeSessionId,
                term: localFilters?.term || termId || activeTermId,
                week: localFilters?.week || weekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: localFilters?.arm || classArmId,
              }}
              onApply={openAbsenteesBreakdown}
            />
            <Typography color="error">Failed to load data.</Typography>
          </Box>,
        );
      }
    },
    [
      classArmId,
      sessionId,
      termId,
      weekId,
      activeSessionId,
      activeTermId,
      activeWeekId,
      sessions,
      terms,
      weeks,
      programmes,
      classes,
      arms,
    ],
  );

  // ── At-Risk Learners Overview (Table) ────────────────────────
  const openAtRiskBreakdown = useCallback(
    async (localFilters) => {
      const effectiveArmId = localFilters?.arm || classArmId;
      const effectiveWeekId = localFilters?.week || weekId;
      const effectiveSession = localFilters?.session || sessionId || activeSessionId;
      const effectiveTerm = localFilters?.term || termId || activeTermId;

      const appliedFilters = {
        session: effectiveSession,
        term: effectiveTerm,
        week: effectiveWeekId,
        programme: localFilters?.programme || programmeId || '',
        class: localFilters?.class || classId || '',
        arm: effectiveArmId,
      };
      setAtRiskFilters(appliedFilters);

      if (!effectiveArmId) {
        openCardModal(
          'At-Risk Learners Overview',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: effectiveSession,
                term: effectiveTerm,
                week: effectiveWeekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: effectiveArmId,
              }}
              onApply={openAtRiskBreakdown}
            />
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Select Filters to View Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                Please select a <strong>Class/Arm</strong> from the dropdowns above, then click{' '}
                <strong>Apply Filter</strong> to view the at-risk learners list.
              </Typography>
            </Box>
          </Box>,
        );
        return;
      }

      setAnalyticsModal({
        open: true,
        title: 'At-Risk Learners Overview',
        content: null,
        loading: true,
      });
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
        // Reset selected learners to all checked by default
        const initialSelected = {};
        learners.forEach((l) => {
          initialSelected[l.student_registration_id] = true;
        });
        setSelectedRiskLearners(initialSelected);
        setRiskModalData(learners);
        setAnalyticsModal((prev) => ({ ...prev, loading: false }));
      } catch (e) {
        console.error('Failed to fetch at-risk learners:', e);
        openCardModal(
          'At-Risk Learners Overview',
          <Box>
            <ModalFilterDropdowns
              key={filterKeyRef.current}
              sessions={sessions}
              terms={terms}
              weeks={weeks}
              programmes={programmes}
              classes={classes}
              arms={arms}
              activeWeekId={activeWeekId}
              initialFilters={{
                session: localFilters?.session || sessionId || activeSessionId,
                term: localFilters?.term || termId || activeTermId,
                week: localFilters?.week || weekId,
                programme: localFilters?.programme || programmeId || '',
                class: localFilters?.class || classId || '',
                arm: localFilters?.arm || classArmId,
              }}
              onApply={openAtRiskBreakdown}
            />
            <Typography color="error">Failed to load data.</Typography>
          </Box>,
        );
      }
    },
    [
      classArmId,
      sessionId,
      termId,
      weekId,
      activeSessionId,
      activeTermId,
      activeWeekId,
      sessions,
      terms,
      weeks,
      programmes,
      classes,
      arms,
    ],
  );

  const handleSendRiskAlerts = async () => {
    // Only send alerts for selected learners
    const selectedIds = riskLearners
      .filter((l) => selectedRiskLearners[l.student_registration_id])
      .map((l) => Number(l.student_registration_id))
      .filter(Boolean);
    if (selectedIds.length === 0) {
      setAlertSnackbar({
        open: true,
        message: 'No learners selected to send risk alerts for',
        severity: 'warning',
      });
      return;
    }
    setSendingRiskAlert(true);
    try {
      const res = await attendanceApi.sendRiskAlerts(selectedIds, weekId, classArmId);
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

  const accentColors = {
    success: schemeMap[1].color,
    warning: schemeMap[3].color,
    info: schemeMap[2].color,
    error: schemeMap[4].color,
  };

  return (
    <>
      {loading ? (
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={`skeleton-${i}`}>
              <StatCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {/* Card 1: DAYS SCHOOL OPEN */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard colorIndex={1}>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.72)' : accentColors.success,
                  textTransform: 'uppercase',
                }}
              >
                DAYS SCHOOL OPEN
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: isDark ? '#fff' : accentColors.success }}
              >
                {Math.min(
                  Math.round(
                    schoolDaysMetrics?.scope === 'week'
                      ? schoolDaysMetrics.weekElapsedPercentage
                      : schoolDaysMetrics?.termElapsedPercentage || 0,
                  ),
                  100,
                )}
                %
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  Math.round(
                    schoolDaysMetrics?.scope === 'week'
                      ? schoolDaysMetrics.weekElapsedPercentage
                      : schoolDaysMetrics?.termElapsedPercentage || 0,
                  ),
                  100,
                )}
                sx={{
                  my: 1,
                  height: 5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: accentColors.success,
                  },
                }}
              />
              <Stack direction="column" alignItems="flex-start" spacing={0.4}>
                <Typography
                  variant="caption"
                  sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
                >
                  {schoolDaysMetrics?.scope === 'week' ? (
                    <>
                      {schoolDaysMetrics.weekDaysElapsed} used ·{' '}
                      {schoolDaysMetrics.weekDaysRemaining} days left{' '}
                      {/* {schoolDaysMetrics.weekDaysOpen} (this week) */}
                    </>
                  ) : (
                    <>
                      {schoolDaysMetrics?.termDaysElapsed || 0} used ·{' '}
                      {schoolDaysMetrics?.termDaysRemaining || 0} days left{' '}
                      {/* {schoolDaysMetrics?.termDaysOpen || 0} (school term) */}
                    </>
                  )}
                </Typography>
              </Stack>
            </StatCard>
          </Grid>

          {/* Card 2: WEEK ATTENDANCE RATE */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Tooltip title="Click to view weekly attendance breakdown" arrow placement="top">
              <StatCard
                colorIndex={3}
                clickable
                onClick={() => openWeekBreakdown(classArmId, undefined)}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : accentColors.warning,
                    textTransform: 'uppercase',
                  }}
                >
                  WEEK ATTENDANCE RATE
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: isDark ? '#fff' : accentColors.warning }}
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
                      bgcolor: accentColors.warning,
                    },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
                  >
                    {metrics.weekTrendText || 'No previous data'}
                  </Typography>
                  {metrics.weekRateChange > 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  ) : metrics.weekRateChange < 0 ? (
                    <TrendingDownIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  ) : (
                    <TrendingFlatIcon
                      sx={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }}
                    />
                  )}
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>

          {/* Card 3: TERM ATTENDANCE RATE */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Tooltip title="Click to view term attendance trend" arrow placement="top">
              <StatCard
                colorIndex={2}
                clickable
                onClick={() => openTermTrend(classArmId)}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : accentColors.info,
                    textTransform: 'uppercase',
                  }}
                >
                  TERM ATTENDANCE RATE
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: isDark ? '#fff' : accentColors.info }}
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
                      bgcolor: accentColors.info,
                    },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ color: accentColors.info }}
                  >
                    {metrics.termTrendText || 'No previous data'}
                  </Typography>
                  {metrics.termRateChange > 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  ) : metrics.termRateChange < 0 ? (
                    <TrendingDownIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  ) : (
                    <TrendingFlatIcon sx={{ fontSize: 14, color: accentColors.info }} />
                  )}
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>

          {/* Card 4: TOTAL ABSENTEES */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Tooltip title="Click to view absentees list" arrow placement="top">
              <StatCard
                colorIndex={4}
                clickable
                onClick={openAbsenteesBreakdown}
                sx={{ position: 'relative' }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : accentColors.error,
                    textTransform: 'uppercase',
                  }}
                >
                  TOTAL ABSENTEES
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: isDark ? '#fff' : accentColors.error }}
                >
                  {metrics.totalAbsentees}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    metrics.totalStudents > 0
                      ? Math.round((metrics.totalAbsentees / metrics.totalStudents) * 100)
                      : 0
                  }
                  sx={{
                    my: 1,
                    height: 5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: accentColors.error,
                    },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
                  >
                    Current Session Term
                  </Typography>
                  <EventNoteIcon
                    sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }}
                  />
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>

          {/* Card 5: AT-RISK STUDENTS */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Tooltip title="Click to view at-risk learners" arrow placement="top">
              <StatCard
                colorIndex={4}
                clickable
                onClick={openAtRiskBreakdown}
                sx={{
                  border: (t) =>
                    t.palette.mode === 'dark'
                      ? '2px solid rgba(239,68,68,0.5)'
                      : `2px solid ${accentColors.error}`,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ color: accentColors.error, textTransform: 'uppercase' }}
                >
                  AT-RISK STUDENTS
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: accentColors.error }}
                >
                  {metrics.atRisk}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    metrics.totalStudents > 0
                      ? Math.round((metrics.atRisk / metrics.totalStudents) * 100)
                      : 0
                  }
                  sx={{
                    my: 1,
                    height: 5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: accentColors.error,
                    },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <Typography variant="caption" sx={{ color: accentColors.error }}>
                    1+ Week Absence
                  </Typography>
                  <WarningIcon sx={{ fontSize: 13, color: accentColors.error }} />
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>
        </Grid>
      )}

      {riskModalData ? (
        <AnalyticsModal
          open={analyticsModal.open}
          onClose={() => {
            setAnalyticsModal({ open: false, title: '', content: null });
            setRiskModalData(null);
          }}
          title={analyticsModal.title}
          loading={analyticsModal.loading}
          content={(() => {
            const learners = riskModalData;
            return (
              <Box>
                <ModalFilterDropdowns
                  key={filterKeyRef.current}
                  sessions={sessions}
                  terms={terms}
                  weeks={weeks}
                  programmes={programmes}
                  classes={classes}
                  arms={arms}
                  activeWeekId={activeWeekId}
                  initialFilters={
                    atRiskFilters || {
                      session: sessionId || activeSessionId,
                      term: termId || activeTermId,
                      week: weekId,
                      programme: programmeId || '',
                      class: classId || '',
                      arm: classArmId,
                    }
                  }
                  onApply={(lf) => {
                    setRiskModalData(null);
                    openAtRiskBreakdown(lf);
                  }}
                />
                {learners.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No at-risk learners for the selected filters.
                  </Typography>
                ) : (
                  <Box sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {learners.length} at-risk learner(s) — learners with persistent absence.
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ borderRadius: 2, maxHeight: 350, overflow: 'auto' }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, width: 40 }}>
                              <Checkbox
                                size="small"
                                checked={
                                  learners.length > 0 &&
                                  learners.every(
                                    (l) => selectedRiskLearners[l.student_registration_id],
                                  )
                                }
                                indeterminate={
                                  learners.some(
                                    (l) => selectedRiskLearners[l.student_registration_id],
                                  ) &&
                                  !learners.every(
                                    (l) => selectedRiskLearners[l.student_registration_id],
                                  )
                                }
                                onChange={() => {
                                  const allSelected = learners.every(
                                    (l) => selectedRiskLearners[l.student_registration_id],
                                  );
                                  const updated = {};
                                  learners.forEach((l) => {
                                    updated[l.student_registration_id] = !allSelected;
                                  });
                                  setSelectedRiskLearners(updated);
                                }}
                                sx={{ p: 0.25 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Learner Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Class Arm</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {learners.map((l, idx) => (
                            <TableRow
                              key={l.student_registration_id || idx}
                              hover
                              selected={selectedRiskLearners[l.student_registration_id]}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
                              }}
                              onClick={() => {
                                setSelectedRiskLearners((prev) => ({
                                  ...prev,
                                  [l.student_registration_id]: !prev[l.student_registration_id],
                                }));
                              }}
                            >
                              <TableCell sx={{ width: 40 }}>
                                <Checkbox
                                  size="small"
                                  checked={!!selectedRiskLearners[l.student_registration_id]}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => {
                                    setSelectedRiskLearners((prev) => ({
                                      ...prev,
                                      [l.student_registration_id]: !prev[l.student_registration_id],
                                    }));
                                  }}
                                  sx={{ p: 0.25 }}
                                />
                              </TableCell>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {l.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={l.arm_name || 'N/A'}
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {Object.values(selectedRiskLearners).filter(Boolean).length} of{' '}
                        {learners.length} at-risk learner(s) selected
                      </Typography>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<NotificationsActiveIcon />}
                        onClick={() => {
                          const selectedCount =
                            Object.values(selectedRiskLearners).filter(Boolean).length;
                          if (selectedCount === 0) {
                            setAlertSnackbar({
                              open: true,
                              message: 'Please select at least one learner to send alerts for',
                              severity: 'warning',
                            });
                            return;
                          }
                          setRiskAlertOpen(true);
                        }}
                        disabled={
                          learners.length === 0 ||
                          Object.values(selectedRiskLearners).filter(Boolean).length === 0
                        }
                      >
                        Send Risk Alerts
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            );
          })()}
        />
      ) : (
        <AnalyticsModal
          open={analyticsModal.open}
          onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
          title={analyticsModal.title}
          content={analyticsModal.content}
          loading={analyticsModal.loading}
        />
      )}

      <ReusableDialog
        open={riskAlertOpen}
        onClose={() => setRiskAlertOpen(false)}
        title="Send Risk Alerts"
        content={
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom fontWeight={500}>
              You are about to send risk alerts to the guardians of{' '}
              {Object.values(selectedRiskLearners).filter(Boolean).length} selected at-risk
              learner(s).
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Risk alerts notify guardians that their ward is at risk due to poor attendance.
            </Typography>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => setRiskAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleSendRiskAlerts}
              disabled={
                sendingRiskAlert || Object.values(selectedRiskLearners).filter(Boolean).length === 0
              }
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
        <Alert
          severity={alertSnackbar.severity}
          onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))}
          variant="filled"
        >
          {alertSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AttendanceAnalyticsCards;
