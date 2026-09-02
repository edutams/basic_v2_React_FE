import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  useMediaQuery,
  alpha,
  Divider,
  Alert,
  Snackbar,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  WbSunny as MorningIcon,
  NightsStay as AfternoonIcon,
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import ReusableDialog from '@/components/shared/ReusableDialog';
import ReusableGaugeChart from '@/components/shared/charts/ReusableGaugeChart';
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
import { useTenantAuth } from '@/hooks/useTenantAuth';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * Convert a date string (YYYY-MM-DD) to a weekday name.
 */
const formatDayHeader = (day) => {
  if (typeof day === 'string' && day.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(day + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return day;
};

/**
 * Generate 5 date strings (Mon–Fri) starting from the week's start_date.
 */
const generateWeekDates = (startDate) => {
  if (!startDate) return [];
  const dates = [];
  const start = new Date(startDate + 'T00:00:00');
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
};

/** Default morning/afternoon entry (mirrors backend). */
const defaultPeriodEntry = () => ({
  is_present: null,
  reason: null,
  datetime: null,
});

/** Build a full {morning, afternoon} content object. */
const defaultDateContent = () => ({
  morning: defaultPeriodEntry(),
  afternoon: defaultPeriodEntry(),
});

/**
 * Get the effective status string for a given period entry.
 * Returns 'unknown' if is_present is null.
 */
const getPeriodStatus = (periodEntry) => {
  if (!periodEntry || periodEntry.is_present === null || periodEntry.is_present === undefined)
    return 'unknown';
  return periodEntry.is_present;
};

/**
 * Deep-merge a new period value into an existing content object.
 */
const setPeriodInContent = (content, period, newStatus, reason) => {
  const base = content && typeof content === 'object' ? { ...content } : defaultDateContent();
  const morning = { ...(base.morning || defaultPeriodEntry()) };
  const afternoon = { ...(base.afternoon || defaultPeriodEntry()) };

  if (period === 'morning') {
    morning.is_present = newStatus;
    morning.reason = reason || morning.reason;
    morning.datetime = new Date().toISOString();
  } else {
    afternoon.is_present = newStatus;
    afternoon.reason = reason || afternoon.reason;
    afternoon.datetime = new Date().toISOString();
  }

  return { morning, afternoon };
};

const MarkAttendanceTab = ({ metrics, onFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ── Filter States ─────────────────────────────────────────
  const [filterApplied, setFilterApplied] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [attSession, setAttSession] = useState('');
  const [attTerm, setAttTerm] = useState('');
  const [attTermId, setAttTermId] = useState('');
  const [attWeek, setAttWeek] = useState('');
  const [activeWeekId, setActiveWeekId] = useState(null);
  const [attProgramme, setAttProgramme] = useState('');
  const [attClass, setAttClass] = useState('');
  const [attArm, setAttArm] = useState('');
  const [attendanceType, setAttendanceType] = useState('morning');

  const { roles } = useTenantAuth();
  const isClassTeacher =
    Array.isArray(roles) &&
    roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'class_teacher');

  // ── Learners & Attendance Data ────────────────────────────
  const [learners, setLearners] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [alertConfirmOpen, setAlertConfirmOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSnackbar, setAlertSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [autoSendReport, setAutoSendReport] = useState(false);
  const [togglingReport, setTogglingReport] = useState(false);

  // ── Week metadata from API ────────────────────────────────
  const [weekDates, setWeekDates] = useState([]);
  const [holidayDates, setHolidayDates] = useState({});

  // ── Export dropdown state ─────────────────────────────────
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // ── Selected weekdays (checkboxes) ────────────────────────
  const [selectedDays, setSelectedDays] = useState({});

  // ── Load filter options and auto-select active session/term ──
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
        const programmesData = progRes.data?.data || progRes.data || [];
        setProgrammes(programmesData);

        const activeStData = activeStRes.data?.data || activeStRes.data;
        if (activeStData?.session_id) {
          setAttSession(activeStData.session_id);
          if (activeStData.term_id) {
            setAttTermId(activeStData.term_id);
          }
        } else if (sessions.length > 0) {
          setAttSession(sessions[0].id);
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

        // If class teacher, auto-populate programme/class/arm and load report setting
        if (isClassTeacher) {
          try {
            const tcRes = await attendanceApi.getTeacherClass();
            const tcData = tcRes.data?.data;
            if (tcData) {
              setAutoSendReport(tcData.auto_send_weekly_report === true);
              setAttProgramme(tcData.programme_id);
              // Fetch classes and pre-select
              const clsRes = await fetchClassesByProgramme(tcData.programme_id);
              const classesData = clsRes.data?.data || clsRes.data || [];
              setClasses(Array.isArray(classesData) ? classesData : []);
              if (tcData.class_id) {
                setAttClass(tcData.class_id);
                // Fetch arms and pre-select
                const armRes = await fetchClassArmsByClass(tcData.class_id, {
                  programme_id: tcData.programme_id || undefined,
                });
                const armsData = armRes.data || [];
                setArms(Array.isArray(armsData) ? armsData : []);
                if (tcData.class_arm_id) {
                  setAttArm(tcData.class_arm_id);
                }
              }
            }
          } catch (e) {
            console.error('Failed to load teacher class:', e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!attSession) return;
    fetchTerms(attSession)
      .then((r) => {
        const termsData = r.data?.data || r.data || [];
        setTerms(termsData);
        if (Array.isArray(termsData) && termsData.length > 0) {
          const match = termsData.find((t) => String(t.id) === String(attTermId));
          if (match) {
            setAttTerm(match.id);
          } else {
            setAttTerm(termsData[0].id);
          }
        }
      })
      .catch(console.error);
  }, [attSession]);

  useEffect(() => {
    if (!attProgramme) return;
    fetchClassesByProgramme(attProgramme)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setClasses(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [attProgramme]);

  useEffect(() => {
    if (!attClass) return;
    fetchClassArmsByClass(attClass, { programme_id: attProgramme || undefined })
      .then((r) => {
        const d = r.data || [];
        setArms(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [attClass, attProgramme]);

  // ── Fetch Weeks when session or term changes ──────────────
  useEffect(() => {
    if (!attSession || !attTermId) return;
    const fetchWeeks = async () => {
      try {
        const res = await attendanceApi.getWeeksBySessionTerm({
          session_id: attSession,
          term_id: attTermId,
        });
        const data = res.data?.data || [];
        const weeks = Array.isArray(data) ? data : [];
        setWeeks(weeks);
        const match = activeWeekId ? weeks.find((w) => String(w.week_id) === activeWeekId) : null;
        if (match) {
          setAttWeek(match.wk_id ?? match.week_id ?? match.id);
        } else {
          const fallback =
            weeks.find((w) => w.status === 'active') ||
            (weeks.length > 0 ? weeks[weeks.length - 1] : null);
          if (fallback) {
            setAttWeek(fallback.wk_id ?? fallback.week_id ?? fallback.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchWeeks();
  }, [attSession, attTermId, activeWeekId]);

  // ── Find selected week object for its start_date ─────────
  const selectedWeek = React.useMemo(() => {
    if (!attWeek || weeks.length === 0) return null;
    return weeks.find((w) => {
      const weekId = w.wk_id ?? w.week_id ?? w.id;
      return String(weekId) === String(attWeek);
    });
  }, [attWeek, weeks]);

  const fallbackWeekDates = React.useMemo(() => {
    return selectedWeek?.start_date ? generateWeekDates(selectedWeek.start_date) : [];
  }, [selectedWeek]);

  // ── Initialize selected days when week changes ───────────
  // Restores previously checked days from localStorage for the same arm+week.
  useEffect(() => {
    const dates = weekDates.length > 0 ? weekDates : fallbackWeekDates;
    if (dates.length === 0) return;

    // Read saved days for this specific arm+week combination
    const storageKey = attArm && attWeek ? `attendance_selectedDays_${attArm}_${attWeek}` : null;
    let saved = {};
    if (storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) saved = JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }

    setSelectedDays((prev) => {
      // Use saved as the base (NOT merged with prev) to avoid stale data from other filter combos
      const updated = { ...saved };
      let changed = Object.keys(updated).length !== Object.keys(prev).length;
      dates.forEach((d) => {
        if (!(d in updated)) {
          updated[d] = false; // new dates default to unchecked
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [weekDates, fallbackWeekDates, attArm, attWeek]);

  // ── Fetch Learners & Attendance when filter applied ───────
  const fetchLearners = useCallback(async () => {
    if (!attArm || !attWeek) return;
    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.getAttendanceLearners({
        class_arm_id: attArm,
        week_term_id: attWeek,
        session_id: attSession || undefined,
        term_id: attTermId || undefined,
      });
      if (res.data?.status && res.data?.data) {
        const {
          dates = [],
          holidays = {},
          students = [],
          learners_present_count,
          total_learners,
          attendance_percent,
          comparison_diff,
          comparison_text,
        } = res.data.data;

        if (learners_present_count !== undefined) setLearnersPresentCount(learners_present_count);
        if (total_learners !== undefined) setTotalLearnerCount(total_learners);
        if (attendance_percent !== undefined) setAttendancePercent(attendance_percent);
        if (comparison_diff !== undefined) setComparisonDiff(comparison_diff);
        if (comparison_text !== undefined) setComparisonText(comparison_text);

        setWeekDates(dates.length > 0 ? dates : fallbackWeekDates);
        setHolidayDates(holidays);
        setLearners(students);

        if (!students || students.length === 0) {
          setLearnersPresentCount(0);
          setTotalLearnerCount(0);
          setAttendancePercent(0);
          setComparisonDiff(0);
          setComparisonText('');
        }

        const dayList = dates.length > 0 ? dates : fallbackWeekDates;
        const attMap = {};
        students.forEach((learner) => {
          const existing = learner.attendance || {};
          const seeded = {};
          dayList.forEach((date) => {
            if (holidays[date]) {
              seeded[date] = { __holiday: true };
            } else {
              const content =
                existing[date] && typeof existing[date] === 'object'
                  ? { ...existing[date] }
                  : defaultDateContent();
              seeded[date] = content;
            }
          });
          attMap[learner.student_registration_id] = seeded;
        });
        setAttendanceData(attMap);
      }
    } catch (e) {
      console.error('Failed to fetch learners:', e);
      setError('Failed to load learners. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [attArm, attWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────

  /** Update a single learner's attendance for a single date + period. */
  const setDayStatus = (learnerId, day, status, reason) => {
    setAttendanceData((prev) => {
      const learnerAtt = { ...(prev[learnerId] || {}) };
      const existingContent = learnerAtt[day] || defaultDateContent();
      learnerAtt[day] = setPeriodInContent(existingContent, attendanceType, status, reason);
      return { ...prev, [learnerId]: learnerAtt };
    });
  };

  /** Bulk-set all learners for a given day + period. */
  const bulkSetDayStatus = (day, status) => {
    setAttendanceData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        const learnerAtt = { ...(updated[id] || {}) };
        const entry = learnerAtt[day];
        if (entry && entry.__holiday) return;
        learnerAtt[day] = setPeriodInContent(entry, attendanceType, status, null);
        updated[id] = learnerAtt;
      });
      return updated;
    });
  };

  /** Toggle selected day for checkbox and persist to localStorage. */
  const toggleDaySelection = (day) => {
    setSelectedDays((prev) => {
      const next = { ...prev, [day]: prev[day] === true ? false : true };
      const storageKey = attArm && attWeek ? `attendance_selectedDays_${attArm}_${attWeek}` : null;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* localStorage full or unavailable */
        }
      }
      return next;
    });
  };

  const handleApplyFilter = () => {
    fetchLearners();
    setFilterApplied(true);
    if (onFilter) onFilter(attArm, attSession, attTermId, attWeek, attProgramme, attClass);
    // Load weekly report setting from backend when an arm is selected
    if (attArm) {
      attendanceApi
        .getTeacherClass()
        .then((res) => {
          const tcData = res.data?.data;
          if (tcData && String(tcData.class_arm_id) === String(attArm)) {
            setAutoSendReport(tcData.auto_send_weekly_report === true);
          } else {
            // For admin-selected arms (not the teacher's own), set to false
            // The toggle API will properly set it when user interacts with checkbox
          }
        })
        .catch(() => { });
    }
  };

  const openConfirmDialog = () => setConfirmDialogOpen(true);
  const closeConfirmDialog = () => setConfirmDialogOpen(false);

  const handleSubmitAttendance = async () => {
    if (!attArm || !attWeek || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const records = [];
      Object.entries(attendanceData).forEach(([learnerId, days]) => {
        Object.entries(days).forEach(([day, content]) => {
          if (!content || content.__holiday) return;
          if (selectedDays[day] === false) return; // Skip unselected days

          const morningStatus = content.morning?.is_present;
          const afternoonStatus = content.afternoon?.is_present;

          if (morningStatus !== null && morningStatus !== undefined) {
            records.push({
              student_registration_id: Number(learnerId),
              week_term_id: Number(attWeek),
              date: day,
              period: 'morning',
              status: morningStatus,
              reason: content.morning.reason || undefined,
            });
          }

          if (afternoonStatus !== null && afternoonStatus !== undefined) {
            records.push({
              student_registration_id: Number(learnerId),
              week_term_id: Number(attWeek),
              date: day,
              period: 'afternoon',
              status: afternoonStatus,
              reason: content.afternoon.reason || undefined,
            });
          }
        });
      });

      if (records.length > 0) {
        await attendanceApi.markBatchAttendance({ records });

        setAlertSnackbar({
          open: true,
          message:
            `Attendance submitted successfully — ${records.length} record(s) saved.` +
            (autoSendReport ? ' Weekly report will be sent automatically by the scheduler.' : ''),
          severity: 'success',
        });
      } else {
        setAlertSnackbar({
          open: true,
          message:
            'No attendance records to submit. Mark at least one student as present or absent on the selected days.',
          severity: 'warning',
        });
      }
    } catch (e) {
      console.error('Failed to submit attendance:', e);
      setAlertSnackbar({
        open: true,
        message: e.response?.data?.message || 'Failed to submit attendance. Please try again.',
        severity: 'error',
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // ── Summary Stats ─────────────────────────────────────────
  const [learnersPresentCount, setLearnersPresentCount] = useState(0);
  const [totalLearnerCount, setTotalLearnerCount] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [comparisonDiff, setComparisonDiff] = useState(0);
  const [comparisonText, setComparisonText] = useState('');

  // ── Export handlers ───────────────────────────────────────
  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    try {
      const res = await attendanceApi.exportAttendanceReport({
        class_arm_id: attArm || undefined,
        week_term_id: attWeek || undefined,
        session_id: attSession || undefined,
        term_id: attTermId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export Excel failed:', e);
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    setExportingPdf(true);
    try {
      const res = await attendanceApi.exportAttendancePdf({
        class_arm_id: attArm || undefined,
        week_term_id: attWeek || undefined,
        session_id: attSession || undefined,
        term_id: attTermId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export PDF failed:', e);
      setAlertSnackbar({ open: true, message: 'Failed to export PDF report', severity: 'error' });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSendAlerts = async () => {
    const ids = learners.map((l) => Number(l.student_registration_id)).filter(Boolean);
    if (ids.length === 0) {
      setAlertSnackbar({
        open: true,
        message: 'No learners to send alerts for',
        severity: 'warning',
      });
      return;
    }
    // Get only the checked (selected) days
    const selectedDaysList = Object.entries(selectedDays)
      .filter(([, checked]) => checked === true)
      .map(([day]) => day);
    setSendingAlert(true);
    try {
      const res = await attendanceApi.sendAttendanceAlerts(ids, attWeek, attArm, selectedDaysList);
      const msg = res.data?.message || 'Alerts sent successfully';
      setAlertSnackbar({ open: true, message: msg, severity: 'success' });
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send alerts';
      setAlertSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSendingAlert(false);
    }
  };

  const handleSendRiskAlerts = async () => {
    const ids = learners.map((l) => Number(l.student_registration_id)).filter(Boolean);
    if (ids.length === 0) {
      setAlertSnackbar({
        open: true,
        message: 'No learners to send risk alerts for',
        severity: 'warning',
      });
      return;
    }
    // Get only the checked (selected) days
    const selectedDaysList = Object.entries(selectedDays)
      .filter(([, checked]) => checked === true)
      .map(([day]) => day);
    setSendingAlert(true);
    try {
      const res = await attendanceApi.sendRiskAlerts(ids, attWeek, attArm, selectedDaysList);
      const msg = res.data?.message || 'Risk alerts sent successfully';
      setAlertSnackbar({ open: true, message: msg, severity: 'success' });
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send risk alerts';
      setAlertSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSendingAlert(false);
    }
  };

  const learnersPresent = learnersPresentCount;
  const totalLearners = totalLearnerCount || learners.length;

  // ── Derive days ────────────────────────────────────────────
  const days = React.useMemo(() => {
    if (weekDates.length > 0) return weekDates;
    if (learners.length > 0) {
      const firstLearner = Object.values(attendanceData)[0];
      if (firstLearner) {
        const dateKeys = Object.keys(firstLearner)
          .filter((d) => d.match(/^\d{4}-\d{2}-\d{2}$/))
          .sort();
        return dateKeys.length > 0 ? dateKeys : DAY_NAMES;
      }
    }
    return DAY_NAMES;
  }, [weekDates, learners, attendanceData]);

  // ── Period icon/label helper ───────────────────────────────
  const periodLabel = attendanceType === 'morning' ? 'Morning' : 'Afternoon';
  const PeriodIcon = attendanceType === 'morning' ? MorningIcon : AfternoonIcon;

  // Get gauge color based on percentage
  const gaugeColorRanges = [
    { from: 0, to: 25, color: theme.palette.error.main },
    { from: 26, to: 50, color: theme.palette.warning.main },
    { from: 51, to: 75, color: theme.palette.info.main },
    { from: 76, to: 100, color: theme.palette.success.main },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        mb={3}
        gap={1.5}
      >
        <Typography variant="h6" fontWeight={700}>
          Learner Attendance
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {/* Export Dropdown */}
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<DownloadIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
            disabled={!filterApplied || exportingPdf}
          >
            {exportingPdf ? 'Exporting...' : 'Export'}
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={() => setExportAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleExportExcel}>
              <ListItemIcon>
                <ExcelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Report by Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportPdf}>
              <ListItemIcon>
                <PdfIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Report by PDF</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* ── Filters ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select
              value={attSession}
              label="Session"
              onChange={(e) => setAttSession(e.target.value)}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name || s.name || s.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select
              value={attTerm}
              label="Term"
              onChange={(e) => {
                const val = e.target.value;
                setAttTerm(val);
                const term = terms.find((t) => t.id === val);
                if (term) setAttTermId(term.id);
              }}
            >
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Week</InputLabel>
            <Select value={attWeek} label="Week" onChange={(e) => setAttWeek(e.target.value)}>
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
        <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select
              value={attProgramme}
              label="Programme"
              onChange={(e) => setAttProgramme(e.target.value)}
              disabled={isClassTeacher}
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.programme_name || p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select
              value={attClass}
              label="Class"
              onChange={(e) => setAttClass(e.target.value)}
              disabled={isClassTeacher}
            >
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.class_name || c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class/Arm</InputLabel>
            <Select
              value={attArm}
              label="Class Arm"
              onChange={(e) => setAttArm(e.target.value)}
              disabled={isClassTeacher}
            >
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.class_arm_names}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<FilterIcon />}
            onClick={handleApplyFilter}
          >
            Filter
          </Button>
        </Grid>
      </Grid>

      {/* ── Morning/Afternoon Toggle ─────────────────────── */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor:
              attendanceType === 'morning'
                ? alpha(theme.palette.warning.main, isDark ? 0.15 : 0.1)
                : alpha(theme.palette.info.main, isDark ? 0.15 : 0.1),
            border: `1px solid ${attendanceType === 'morning'
              ? alpha(theme.palette.warning.main, 0.3)
              : alpha(theme.palette.info.main, 0.3)
              }`,
          }}
        >
          <PeriodIcon fontSize="small" color={attendanceType === 'morning' ? 'warning' : 'info'} />
          <Typography variant="caption" fontWeight={600}>
            {periodLabel} Session
          </Typography>
        </Box>
        <RadioGroup
          row
          value={attendanceType}
          onChange={(e) => setAttendanceType(e.target.value)}
          sx={{ ml: 0.5 }}
        >
          <FormControlLabel
            value="morning"
            control={<Radio size="small" sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} />}
            label={<Typography variant="body2">AM</Typography>}
            sx={{ m: 0, mr: 0.5 }}
          />
          <FormControlLabel
            value="afternoon"
            control={<Radio size="small" sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }} />}
            label={<Typography variant="body2">PM</Typography>}
            sx={{ m: 0 }}
          />
        </RadioGroup>
      </Box>

      {/* ── Info Banner: Reminder to Submit ────────────── */}
      {filterApplied && learners.length > 0 && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiAlert-message': { width: '100%', overflow: 'hidden' },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'wrap',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            <Box component="span" sx={{ mr: 0.5 }} role="img" aria-label="info">
              ℹ️
            </Box>
            {isMobile ? (
              <>
                Attendance marks are saved <strong>locally</strong>. Scroll down & tap{' '}
                <strong>Submit Attendance</strong> to save them permanently.
              </>
            ) : (
              <>
                Your attendance marks are saved <strong>locally</strong>. Click the{' '}
                <strong>Submit Attendance</strong> button on the right to permanently save them to
                the system.
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* ── Attendance Table & Summary ──────────────────── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TableContainer
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 320px)',
            }}
          >
            <Table sx={{ minWidth: 650 }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: 40,
                      ...(!isMobile && { position: 'sticky', left: 0, zIndex: 3 }),
                      bgcolor: isDark ? '#1e1e1e' : '#fff',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    S/N
                  </TableCell>
                  <TableCell
                    sx={{
                      minWidth: 200,
                      ...(!isMobile && { position: 'sticky', left: 40, zIndex: 3 }),
                      bgcolor: isDark ? '#1e1e1e' : '#fff',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    Learner's Name
                  </TableCell>
                  {days.map((day) => {
                    const dayLabel = formatDayHeader(day);
                    const isSelected = selectedDays[day] === true;
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          minWidth: 100,
                          bgcolor: isSelected
                            ? alpha(theme.palette.success.main, isDark ? 0.08 : 0.04)
                            : 'transparent',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <Box>
                          {/* Weekday Checkbox - above the day name */}
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => toggleDaySelection(day)}
                            sx={{
                              p: 0.25,
                              color: theme.palette.success.main,
                              '&.Mui-checked': {
                                color: theme.palette.success.main,
                              },
                              mb: 0.25,
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{ display: 'block' }}
                          >
                            {dayLabel}
                          </Typography>
                          {day !== dayLabel && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '10px', display: 'block' }}
                            >
                              {day}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={0.25} justifyContent="center" mt={0.5}>
                          <Tooltip title={`Mark all ${dayLabel} ${periodLabel} Present`}>
                            <IconButton
                              size="small"
                              onClick={() => bulkSetDayStatus(day, 'present')}
                            >
                              <CheckCircleIcon color="success" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={`Mark all ${dayLabel} ${periodLabel} Absent`}>
                            <IconButton
                              size="small"
                              onClick={() => bulkSetDayStatus(day, 'absent')}
                            >
                              <CancelOutlinedIcon color="error" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={`Clear all ${dayLabel} ${periodLabel}`}>
                            <IconButton
                              size="small"
                              onClick={() => bulkSetDayStatus(day, 'unknown')}
                            >
                              <RadioButtonUncheckedIcon color="action" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontSize: '9px',
                            fontWeight: 600,
                            color:
                              attendanceType === 'morning'
                                ? theme.palette.warning.main
                                : theme.palette.info.main,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {periodLabel}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">Periods Present</TableCell>
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
                      {attArm && attWeek ? (
                        <Typography variant="body1" color="text.secondary">
                          No learners found for the selected filters.
                        </Typography>
                      ) : (
                        <Alert severity="info" sx={{ justifyContent: 'center', py: 2 }}>
                          <Typography variant="body2">
                            Select a <strong>Session</strong>, <strong>Term</strong>,{' '}
                            <strong>Week</strong>, <strong>Programme</strong>,{' '}
                            <strong>Class</strong>, and <strong>Class/Arm</strong> from the
                            dropdowns above, then click the <strong>Filter</strong> button to load
                            the attendance list.
                          </Typography>
                        </Alert>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  learners.map((learner, idx) => {
                    const att = attendanceData[learner.student_registration_id] || {};
                    return (
                      <TableRow key={learner.student_registration_id} hover>
                        <TableCell
                          sx={{
                            ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                            bgcolor: isDark ? '#1e1e1e' : '#fff',
                            borderRight: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          {idx + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...(!isMobile && { position: 'sticky', left: 40, zIndex: 2 }),
                            bgcolor: isDark ? '#1e1e1e' : '#fff',
                            borderRight: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {learner.name}
                            </Typography>
                            <Chip
                              icon={
                                learner.gender === 'MALE' ? (
                                  <MaleIcon fontSize="small" />
                                ) : (
                                  <FemaleIcon fontSize="small" />
                                )
                              }
                              label={learner.gender}
                              size="small"
                              color={learner.gender === 'MALE' ? 'primary' : 'success'}
                              variant="soft"
                              sx={{ height: 20, fontSize: '10px', fontWeight: 600 }}
                            />
                          </Box>
                        </TableCell>
                        {days.map((day) => {
                          const content = att[day];
                          const isHoliday = content?.__holiday;
                          const status = isHoliday
                            ? 'holiday'
                            : getPeriodStatus(content?.[attendanceType]);
                          const isSelected = selectedDays[day] === true;

                          return (
                            <TableCell
                              key={day}
                              align="center"
                              sx={{
                                bgcolor: isSelected
                                  ? alpha(theme.palette.success.main, isDark ? 0.08 : 0.04)
                                  : 'transparent',
                                transition: 'background-color 0.3s ease',
                                opacity: isSelected ? 1 : 0.5,
                              }}
                            >
                              {isHoliday ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontStyle="italic"
                                >
                                  Holiday
                                </Typography>
                              ) : (
                                <RadioGroup
                                  row
                                  value={status}
                                  onChange={(e) =>
                                    isSelected &&
                                    setDayStatus(
                                      learner.student_registration_id,
                                      day,
                                      e.target.value,
                                    )
                                  }
                                  sx={{ justifyContent: 'center' }}
                                >
                                  <Tooltip title={isSelected ? 'Present' : 'Select this day first'}>
                                    <span>
                                      <FormControlLabel
                                        value="present"
                                        control={
                                          <Radio
                                            size="small"
                                            color="success"
                                            sx={{ p: 0.25 }}
                                            disabled={!isSelected}
                                          />
                                        }
                                        label=""
                                        sx={{ m: 0 }}
                                      />
                                    </span>
                                  </Tooltip>
                                  <Tooltip title={isSelected ? 'Absent' : 'Select this day first'}>
                                    <span>
                                      <FormControlLabel
                                        value="absent"
                                        control={
                                          <Radio
                                            size="small"
                                            color="error"
                                            sx={{ p: 0.25 }}
                                            disabled={!isSelected}
                                          />
                                        }
                                        label=""
                                        sx={{ m: 0 }}
                                      />
                                    </span>
                                  </Tooltip>
                                  <Tooltip title={isSelected ? 'Clear' : 'Select this day first'}>
                                    <span>
                                      <FormControlLabel
                                        value="unknown"
                                        control={
                                          <Radio
                                            size="small"
                                            color="default"
                                            sx={{ p: 0.25 }}
                                            disabled={!isSelected}
                                          />
                                        }
                                        label=""
                                        sx={{ m: 0 }}
                                      />
                                    </span>
                                  </Tooltip>
                                </RadioGroup>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={700}>
                            {Object.values(att).reduce((count, content) => {
                              if (!content || content.__holiday) return count;
                              if (content.morning?.is_present === 'present') count++;
                              if (content.afternoon?.is_present === 'present') count++;
                              return count;
                            }, 0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* ── Right Summary Card with Gauge & Submit Button ── */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: -1, lg: 0 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
              height: '100%',
              minHeight: { xs: 'auto', lg: '580px' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ textTransform: 'uppercase', mb: 1 }}
            >
              LEARNER ATTENDANCE
            </Typography>

            {/* Speedometer/Gauge Chart */}
            <ReusableGaugeChart
              key={`gauge-${attendancePercent}-${learnersPresent}`}
              value={attendancePercent}
              label="Attendance"
              subtitle={`${learnersPresent} present out of ${totalLearners} learners`}
              height={240}
              colorRanges={gaugeColorRanges}
            />

            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Learners
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {totalLearners}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  School Days
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {days.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Present
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {learnersPresent}
                </Typography>
              </Box>
            </Stack>

            {/* ── Send Attendance Notification Button ── */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              fullWidth
              startIcon={<EmailIcon />}
              onClick={() => {
                setAlertType('attendance');
                setAlertConfirmOpen(true);
              }}
              disabled={sendingAlert || learners.length === 0}
              sx={{ mb: 1 }}
            >
              {sendingAlert ? 'Sending...' : 'Send Attendance Notification'}
            </Button>

            <Box
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 1,
                bgcolor: isDark
                  ? 'rgba(255,255,255,0.04)'
                  : alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.08)'
                  : alpha(theme.palette.primary.main, 0.12),
                opacity: togglingReport ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Checkbox
                  checked={autoSendReport}
                  disabled={togglingReport || !attArm}
                  onChange={async (e) => {
                    const newVal = e.target.checked;
                    const previousVal = autoSendReport;
                    setAutoSendReport(newVal);
                    setTogglingReport(true);
                    try {
                      await attendanceApi.toggleWeeklyReport(attArm, newVal);
                    } catch (err) {
                      setAutoSendReport(previousVal);
                      setAlertSnackbar({
                        open: true,
                        message: 'Failed to update weekly report setting',
                        severity: 'error',
                      });
                    } finally {
                      setTogglingReport(false);
                    }
                  }}
                  size="small"
                  sx={{ p: 0.25, mt: -0.25 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
                    Weekly Report to Guardians
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {autoSendReport
                      ? 'A weekly attendance summary with PDF and Excel report will be automatically emailed to parents/guardians every week via the scheduler.'
                      : 'Enable to automatically send weekly attendance reports to parents/guardians via the scheduler.'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* ── Submit Attendance Button moved here ── */}
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={openConfirmDialog}
              disabled={
                submitting || learners.length === 0 || !Object.values(selectedDays).some(Boolean)
              }
              sx={{ mt: 'auto' }}
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Confirmation Dialog ──────────────────────── */}
      <ReusableDialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        title="Submit Attendance"
        content={
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom fontWeight={500}>
              You are about to mark the attendance.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {learners.length} learner(s) • {Object.values(selectedDays).filter(Boolean).length}{' '}
              day(s) • {periodLabel} periods will be submitted.
            </Typography>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={closeConfirmDialog}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                closeConfirmDialog();
                handleSubmitAttendance();
              }}
              autoFocus
            >
              Confirm
            </Button>
          </Stack>
        }
      />

      <ReusableDialog
        open={alertConfirmOpen}
        onClose={() => setAlertConfirmOpen(false)}
        title={alertType === 'risk' ? 'Send Risk Alerts' : 'Send Attendance Alerts'}
        content={
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom fontWeight={500}>
              You are about to send an email alert to the guardian
              {learners.length > 1
                ? 's of ' + learners.length + ' learners'
                : ' of ' + (learners[0]?.name || 'this learner')}
              .
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {alertType === 'risk'
                ? 'Risk alerts notify guardians that their ward is at risk due to poor attendance.'
                : 'Attendance alerts provide guardians with a weekly attendance summary for their ward.'}
            </Typography>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => setAlertConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={alertType === 'risk' ? 'contained' : 'contained'}
              color={alertType === 'risk' ? 'error' : 'primary'}
              size="small"
              onClick={() => {
                setAlertConfirmOpen(false);
                if (alertType === 'risk') {
                  handleSendRiskAlerts();
                } else {
                  handleSendAlerts();
                }
              }}
              autoFocus
            >
              Send
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
    </Box>
  );
};

export default MarkAttendanceTab;
