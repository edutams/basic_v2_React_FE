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
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  TextField,
  Avatar,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon,
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
import ParentCard from '@/components/shared/ParentCard';

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

/**
 * Whether a "YYYY-MM-DD" date string is strictly after today — used to lock
 * out marking attendance for days/weeks that haven't happened yet. Parsed
 * as a local midnight Date (not `new Date(str)` directly, which reads
 * "YYYY-MM-DD" as UTC and can shift a day off depending on timezone).
 */
const isFutureDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const datePart = dateStr.slice(0, 10);
  if (!datePart.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
  const date = new Date(datePart + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
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
 * Case-insensitive gender check — the API sends `sex` lowercase
 * ('male'/'female'), but this used to be compared against the literal
 * 'MALE', so it always fell through to "female" regardless of the actual
 * value.
 */
const isMaleGender = (gender) => String(gender || '').toLowerCase() === 'male';

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
  // Ticking "Excused" doesn't mark it right away — it opens this modal to
  // collect a reason first. student_registration_id/day null = closed.
  const [excuseDialog, setExcuseDialog] = useState({
    open: false,
    learnerId: null,
    day: null,
    reason: '',
  });
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
          comparison_diff,
          comparison_text,
        } = res.data.data;

        if (learners_present_count !== undefined) setLearnersPresentCount(learners_present_count);
        if (total_learners !== undefined) setTotalLearnerCount(total_learners);
        if (comparison_diff !== undefined) setComparisonDiff(comparison_diff);
        if (comparison_text !== undefined) setComparisonText(comparison_text);

        setWeekDates(dates.length > 0 ? dates : fallbackWeekDates);
        setHolidayDates(holidays);
        setLearners(students);

        if (!students || students.length === 0) {
          setLearnersPresentCount(0);
          setTotalLearnerCount(0);
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

  /** Open the reason modal instead of marking "excused" immediately. */
  const openExcuseDialog = (learnerId, day) =>
    setExcuseDialog({ open: true, learnerId, day, reason: '' });

  const closeExcuseDialog = () =>
    setExcuseDialog({ open: false, learnerId: null, day: null, reason: '' });

  /** Only actually marks "excused" — with the reason — once the modal is submitted. */
  const confirmExcuseDialog = () => {
    const { learnerId, day, reason } = excuseDialog;
    if (learnerId && day) {
      setDayStatus(learnerId, day, 'excused', reason.trim() || null);
    }
    closeExcuseDialog();
  };

  /** Bulk-set all learners for a given day + period. */
  const bulkSetDayStatus = (day, status) => {
    // A day that hasn't happened yet can't be marked, no matter which
    // shortcut button triggered this — only guarding the checkbox toggle
    // wouldn't stop this "mark all" bulk action from still reaching it.
    if (isFutureDate(day)) return;
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
    // Future days aren't markable yet — today and every day before it
    // (this week or any earlier one) are, so a teacher can still catch up
    // on a whole week at once on, say, Friday.
    if (isFutureDate(day)) return;
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
        .catch(() => {});
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

        // Refresh the stat cards now that real data changed — was only
        // ever triggered by the Filter button or a tab switch, so the
        // cards kept showing stale numbers right after a submit.
        if (onFilter) onFilter(attArm, attSession, attTermId, attWeek, attProgramme, attClass);
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
  // learnersPresentCount/totalLearnerCount are last-fetch fallbacks used
  // only before any learners are loaded — the live gauge/percent below is
  // recomputed from the in-memory grid instead (see liveAttendanceStats).
  const [learnersPresentCount, setLearnersPresentCount] = useState(0);
  const [totalLearnerCount, setTotalLearnerCount] = useState(0);
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

  // ── Live summary-card stats ─────────────────────────────────
  // Recomputed straight from the in-memory marking grid on every render, so
  // the gauge/counts in the side card update instantly as a teacher taps
  // radios — previously frozen at whatever the last fetch/submit returned.
  // Formula mirrors the backend's computeLearnersPresentPercent() exactly:
  // a student "counts present" for a day if morning OR afternoon is
  // present/late; the percent is present-student-days over
  // (learners × non-holiday school days).
  const liveAttendanceStats = React.useMemo(() => {
    const isPresentStatus = (status) => status === 'present' || status === 'late';
    const schoolDays = days.filter((day) => !holidayDates?.[day]);

    let presentStudentDayCount = 0;
    let learnersPresentCount = 0;
    learners.forEach((learner) => {
      const att = attendanceData[learner.student_registration_id] || {};
      let hasPresent = false;
      schoolDays.forEach((day) => {
        const content = att[day];
        if (!content || content.__holiday) return;
        const dayPresent =
          isPresentStatus(content.morning?.is_present) ||
          isPresentStatus(content.afternoon?.is_present);
        if (dayPresent) {
          presentStudentDayCount++;
          hasPresent = true;
        }
      });
      if (hasPresent) learnersPresentCount++;
    });

    const totalPossible = learners.length * schoolDays.length;
    const percent =
      totalPossible > 0 ? Math.round((presentStudentDayCount / totalPossible) * 100) : 0;

    return { learnersPresentCount, percent, schoolDaysCount: schoolDays.length };
  }, [learners, attendanceData, days, holidayDates]);

  const learnersPresent =
    learners.length > 0 ? liveAttendanceStats.learnersPresentCount : learnersPresentCount;
  const totalLearners = totalLearnerCount || learners.length;
  const attendancePercentLive = learners.length > 0 ? liveAttendanceStats.percent : 0;

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
                // A week that hasn't started yet has nothing to mark —
                // only weeks up to and including the current one are
                // selectable. Past weeks stay open so a teacher can catch
                // up on attendance they missed.
                const notReachedYet = isFutureDate(w.start_date);
                return (
                  <MenuItem key={weekId} value={weekId} disabled={notReachedYet}>
                    {w.week_name || `Week ${weekId}`}
                    {notReachedYet ? ' (upcoming)' : ''}
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
              label="Class/Arm"
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

      {/* ── Info Banner: Reminder to Submit ────────────── */}
      {filterApplied && learners.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {isMobile ? (
            <>
              Attendance marks are saved <strong>locally</strong>. Scroll down & tap{' '}
              <strong>Submit Attendance</strong> to save them permanently.
            </>
          ) : (
            <>
              Your attendance marks are saved <strong>locally</strong>. Click the{' '}
              <strong>Submit Attendance</strong> button on the right to permanently save them to the
              system.
            </>
          )}
        </Alert>
      )}

      {/* ── Learner Attendance heading + AM/PM toggle — moved below the
          filters/banner so it reads as part of the table beneath it, not
          the page chrome above the filters. ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" fontWeight={700}>
            Learner Attendance
          </Typography>

          <ToggleButtonGroup
          value={attendanceType}
          exclusive
          size="small"
          onChange={(_, val) => val && setAttendanceType(val)}
          sx={{
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
            p: 0.5,
            borderRadius: '10px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'}`,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '8px',
              px: 1.75,
              py: 0.5,
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'none',
              gap: 0.75,
              color: isDark ? '#94a3b8' : '#475569',
              transition: 'all 0.2s ease',
            },
          }}
        >
          <ToggleButton
            value="morning"
            sx={{
              '&.Mui-selected': {
                bgcolor: '#f97316 !important',
                color: '#ffffff !important',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
                '&:hover': {
                  bgcolor: '#ea580c !important',
                },
              },
            }}
          >
            <MorningIcon
              sx={{
                fontSize: 16,
                color: attendanceType === 'morning' ? '#ffffff' : '#f97316',
              }}
            />{' '}
            Morning (AM)
          </ToggleButton>

          <ToggleButton
            value="afternoon"
            sx={{
              '&.Mui-selected': {
                bgcolor: '#0284c7 !important',
                color: '#ffffff !important',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
                '&:hover': {
                  bgcolor: '#0369a1 !important',
                },
              },
            }}
          >
            <AfternoonIcon
              sx={{
                fontSize: 16,
                color: attendanceType === 'afternoon' ? '#ffffff' : '#0284c7',
              }}
            />{' '}
            Afternoon (PM)
          </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Same action as the button at the bottom of the summary card —
              duplicated here so marking a whole week doesn't require
              scrolling all the way down just to submit it. */}
          <Button
            variant="contained"
            size="small"
            onClick={openConfirmDialog}
            disabled={
              submitting || learners.length === 0 || !Object.values(selectedDays).some(Boolean)
            }
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>

          {/* Export Dropdown */}
          <Button
            variant="outlined"
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
      </Box>

      {/* ── Attendance Table & Summary ──────────────────── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 9.5 }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1.5px solid rgba(255, 255, 255, 0.15)'
                  : '1.5px solid #cbd5e1',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.35)'
                  : '0 4px 16px rgba(15, 23, 42, 0.05)',
              overflowX: 'auto',
              overflowY: 'auto',
              height: { xs: '450px', md: '520px' },
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #1e293b 268px, rgba(255, 255, 255, 0.18) 268px, rgba(255, 255, 255, 0.18) 270px, #121827 270px)'
                  : 'linear-gradient(90deg, #f1f5f9 268px, #cbd5e1 268px, #cbd5e1 270px, #ffffff 270px)',
              '& .MuiTableHead-root .MuiTableCell-root': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc'),
                fontWeight: 700,
                color: (theme) => (theme.palette.mode === 'dark' ? '#f1f5f9' : '#0f172a'),
                borderBottom: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.12)'
                    : '2px solid #cbd5e1',
              },
              '& .MuiTableCell-root': {
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
              },
            }}
          >
            <Table sx={{ minWidth: 650, tableLayout: 'fixed' }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: 50,
                      minWidth: 50,
                      maxWidth: 50,
                      fontWeight: 700,
                      ...(!isMobile && { position: 'sticky', left: 0, zIndex: 3 }),
                      bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                      borderRight: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.15)'
                          : '1px solid #cbd5e1',
                    }}
                  >
                    S/N
                  </TableCell>
                  <TableCell
                    sx={{
                      width: 220,
                      minWidth: 220,
                      maxWidth: 220,
                      fontWeight: 700,
                      ...(!isMobile && { position: 'sticky', left: 50, zIndex: 3 }),
                      bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                      borderRight: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '2px solid rgba(255, 255, 255, 0.2)'
                          : '2px solid #cbd5e1',
                    }}
                  >
                    Learner's Name
                  </TableCell>
                  {days.map((day) => {
                    const dayLabel = formatDayHeader(day);
                    const isFuture = isFutureDate(day);
                    // A future day never renders as checked, even if stale
                    // localStorage says otherwise (e.g. it was checked before
                    // this restriction existed) — checked-but-disabled would
                    // be more confusing than just greyed out and unchecked.
                    const isSelected = selectedDays[day] === true && !isFuture;
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          minWidth: 105,
                          bgcolor: isSelected
                            ? isDark
                              ? 'rgba(16, 185, 129, 0.18)'
                              : '#ecfdf5'
                            : isDark
                              ? '#1e293b'
                              : '#f8fafc',
                          borderTop: isSelected ? '3px solid #10b981' : '3px solid transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box>
                          {/* Weekday Checkbox - above the day name */}
                          <Tooltip title={isFuture ? "Can't mark a day that hasn't happened yet" : ''}>
                            <span>
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                disabled={isFuture}
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
                            </span>
                          </Tooltip>
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
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                          alignItems="center"
                          mt={0.5}
                        >
                          <Tooltip
                            title={
                              isFuture
                                ? "Can't mark a day that hasn't happened yet"
                                : `Mark all ${dayLabel} ${periodLabel} Present`
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => bulkSetDayStatus(day, 'present')}
                                disabled={isFuture}
                                sx={{ p: 0, width: 28, height: 28, minWidth: 28 }}
                              >
                                <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              isFuture
                                ? "Can't mark a day that hasn't happened yet"
                                : `Mark all ${dayLabel} ${periodLabel} Absent`
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => bulkSetDayStatus(day, 'absent')}
                                disabled={isFuture}
                                sx={{ p: 0, width: 28, height: 28, minWidth: 28 }}
                              >
                                <CancelOutlinedIcon color="error" sx={{ fontSize: 18 }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              isFuture
                                ? "Can't mark a day that hasn't happened yet"
                                : `Clear all ${dayLabel} ${periodLabel}`
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => bulkSetDayStatus(day, 'unknown')}
                                disabled={isFuture}
                                sx={{ p: 0, width: 28, height: 28, minWidth: 28 }}
                              >
                                <RadioButtonUncheckedIcon color="action" sx={{ fontSize: 18 }} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontSize: '9px',
                            fontWeight: 600,
                            // Same exact orange/blue as the Morning (AM) /
                            // Afternoon (PM) toggle above — theme.palette.
                            // warning/info.main rendered noticeably
                            // brighter here and didn't visually match it.
                            color: attendanceType === 'morning' ? '#f97316' : '#0284c7',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {periodLabel}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      bgcolor: isDark ? '#1e293b' : '#f8fafc',
                    }}
                  >
                    Periods Present
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Skeleton rows matching the real table's column layout —
                  // S/N + Name + one block per day + a tally column — instead
                  // of a generic centered spinner.
                  Array.from({ length: 6 }).map((_, rowIdx) => (
                    <TableRow key={`skeleton-row-${rowIdx}`}>
                      <TableCell
                        sx={{
                          width: 50,
                          minWidth: 50,
                          maxWidth: 50,
                          ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                          borderRight: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.12)'
                              : '1px solid #cbd5e1',
                        }}
                      >
                        <Skeleton variant="text" width={16} />
                      </TableCell>
                      <TableCell
                        sx={{
                          width: 220,
                          minWidth: 220,
                          maxWidth: 220,
                          ...(!isMobile && { position: 'sticky', left: 50, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                          borderRight: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '2px solid rgba(255, 255, 255, 0.18)'
                              : '2px solid #cbd5e1',
                        }}
                      >
                        <Skeleton variant="text" width="70%" />
                      </TableCell>
                      {days.map((day) => (
                        <TableCell key={`skeleton-${rowIdx}-${day}`} align="center">
                          <Skeleton
                            variant="rounded"
                            height={28}
                            sx={{ mx: 'auto', maxWidth: 90 }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Skeleton variant="text" width={30} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : learners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      sx={{
                        width: 50,
                        minWidth: 50,
                        maxWidth: 50,
                        ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        borderRight: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid #cbd5e1',
                      }}
                    />
                    <TableCell
                      sx={{
                        width: 220,
                        minWidth: 220,
                        maxWidth: 220,
                        ...(!isMobile && { position: 'sticky', left: 50, zIndex: 2 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        borderRight: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '2px solid rgba(255, 255, 255, 0.18)'
                            : '2px solid #cbd5e1',
                      }}
                    />
                    <TableCell colSpan={days.length + 1} align="center" sx={{ py: 6, px: 2 }}>
                      {attArm && attWeek ? (
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          No learners found for the selected filters.
                        </Alert>
                      ) : (
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          <Typography variant="body2">
                            Select a <strong>Session</strong>, <strong>Term</strong>,{' '}
                            <strong>Week</strong>, <strong>Programme</strong>,{' '}
                            <strong>Class</strong>, and <strong>Arm</strong> then click the{' '}
                            <strong>Filter</strong> button to load the attendance list.
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
                            width: 50,
                            minWidth: 50,
                            maxWidth: 50,
                            ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                            borderRight: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.12)'
                                : '1px solid #cbd5e1',
                          }}
                        >
                          {idx + 1}
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 220,
                            minWidth: 220,
                            maxWidth: 220,
                            ...(!isMobile && { position: 'sticky', left: 50, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                            borderRight: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.18)'
                                : '2px solid #cbd5e1',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={learner.avatar || undefined}
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: 13,
                                fontWeight: 700,
                                bgcolor: 'primary.main',
                                flexShrink: 0,
                              }}
                            >
                              {(learner.name || '?').charAt(0)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {learner.name}
                                </Typography>
                                {/* Single-letter M/F badge, after the name now — the old
                                    chip compared gender against the literal 'MALE', but
                                    the API sends it lowercase, so it always fell through
                                    to the female icon regardless of actual gender. */}
                                <Box
                                  title={learner.gender}
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    bgcolor: alpha(
                                      isMaleGender(learner.gender)
                                        ? theme.palette.primary.main
                                        : theme.palette.success.main,
                                      isDark ? 0.28 : 0.14,
                                    ),
                                    color: isMaleGender(learner.gender)
                                      ? theme.palette.primary.main
                                      : theme.palette.success.main,
                                  }}
                                >
                                  {isMaleGender(learner.gender) ? 'M' : 'F'}
                                </Box>
                              </Stack>
                              {learner.admission_no && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', lineHeight: 1.2 }}
                                  noWrap
                                >
                                  {learner.admission_no}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        {days.map((day) => {
                          const content = att[day];
                          const isHoliday = content?.__holiday;
                          const status = isHoliday
                            ? 'holiday'
                            : getPeriodStatus(content?.[attendanceType]);
                          const isSelected = selectedDays[day] === true && !isFutureDate(day);
                          // The radio group only ever offers present/late/
                          // absent/unknown — 'excused' is a qualifier on an
                          // absence (see the checkbox below), not a 5th
                          // equally-weighted tap for every cell, so it
                          // still shows as "Absent" selected here.
                          const radioValue = status === 'excused' ? 'absent' : status;
                          const isExcused = status === 'excused';

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
                                  {holidayDates[day] || 'Holiday'}
                                </Typography>
                              ) : (
                                <RadioGroup
                                  row
                                  value={radioValue}
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
                                  <Tooltip
                                    title={
                                      isSelected
                                        ? 'Late — arrival time is recorded automatically'
                                        : 'Select this day first'
                                    }
                                  >
                                    <span>
                                      <FormControlLabel
                                        value="late"
                                        control={
                                          <Radio
                                            size="small"
                                            color="warning"
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
                              {!isHoliday && radioValue === 'absent' && (
                                <Tooltip
                                  title={
                                    isSelected
                                      ? 'Excused absence — does not count against the attendance rate'
                                      : 'Select this day first'
                                  }
                                >
                                  <span>
                                    <FormControlLabel
                                      sx={{ m: 0, display: 'flex', justifyContent: 'center' }}
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={isExcused}
                                          disabled={!isSelected}
                                          onChange={(e) =>
                                            e.target.checked
                                              ? openExcuseDialog(
                                                  learner.student_registration_id,
                                                  day,
                                                )
                                              : setDayStatus(
                                                  learner.student_registration_id,
                                                  day,
                                                  'absent',
                                                )
                                          }
                                          sx={{ p: 0.25 }}
                                        />
                                      }
                                      label={
                                        <Typography variant="caption" color="text.secondary">
                                          Excused
                                        </Typography>
                                      }
                                    />
                                  </span>
                                </Tooltip>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={700}>
                            {Object.values(att).reduce((count, content) => {
                              if (!content || content.__holiday) return count;
                              // Late counts as present for this tally too —
                              // same rule as the backend's attendance rate.
                              const isPresent = (status) =>
                                status === 'present' || status === 'late';
                              if (isPresent(content.morning?.is_present)) count++;
                              if (isPresent(content.afternoon?.is_present)) count++;
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
        <Grid size={{ xs: 12, lg: 2.5 }}>
          <ParentCard
            elevation={0}
            sx={{
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

            {/* Speedometer/Gauge Chart — live: recomputed from the grid on
                every mark, not frozen at the last fetch/submit response. */}
            <ReusableGaugeChart
              key={`gauge-${attendancePercentLive}-${learnersPresent}`}
              value={attendancePercentLive}
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
                  {liveAttendanceStats.schoolDaysCount}
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
              sx={{ mb: 1, fontSize: 13 }}
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
                      : 'Auto-send weekly attendance reports to guardians.'}
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
          </ParentCard>
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

      {/* ── Excused-absence reason ──────────────────── */}
      <ReusableDialog
        open={excuseDialog.open}
        onClose={closeExcuseDialog}
        title="Excuse This Absence"
        content={
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              An excused absence doesn't count against the attendance rate. Enter the reason
              below.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              label="Reason"
              placeholder="e.g. Medical appointment, family emergency..."
              value={excuseDialog.reason}
              onChange={(e) =>
                setExcuseDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={closeExcuseDialog}>
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={confirmExcuseDialog}>
              Submit
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
