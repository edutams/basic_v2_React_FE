import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBook,
  IconCheck,
  IconExternalLink,
  IconGauge,
  IconInfoCircle,
  IconNotes,
  IconProgressCheck,
  IconUsers,
  IconVideo,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import useAuth from '@/hooks/useAuth';
import {
  fetchActiveTenantSessionTerm,
  fetchSessionTerms,
} from '@/api/tenant/session-term/sessionTermApi';
import { tenantLessonNoteApi } from '@/api/tenant/e-resources/lessonNoteApi';
import StatCard from '@/components/shared/StatCard';
import LessonContentTab from './LessonContentTab';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { title: 'Lesson Notes' },
];

// Clicking a subject opens this route in a new tab carrying one opaque,
// base64url-encoded token (see handleOpenSubject) instead of named ids.
const SUBJECT_WORKSPACE_PATH = '/e-resources/lesson-note';

// Workspace tabs — same order as the basic app's SubjectContentView:
// 1 Lesson Plan, 2 Lesson Note, 3 Video Content.
const CONTENT_TABS = [
  { key: 'plan', label: 'Lesson Plan', Icon: IconBook },
  { key: 'note', label: 'Lesson Note', Icon: IconNotes },
  { key: 'video', label: 'Video Content', Icon: IconVideo },
];

// Class Register-style Session options: unique sessions from session terms
const uniqueSessions = (rows) => {
  const map = new Map();
  (rows || []).forEach((row) => {
    const id = row.session?.id ?? row.session_id;
    if (id == null) return;
    const key = String(id);
    if (!map.has(key)) {
      map.set(key, {
        id,
        name:
          row.session?.session_name || row.session?.sesname || row.session_name || `Session ${key}`,
      });
    }
  });
  return Array.from(map.values());
};

// Subject card styled like the Score Upload cards (ScoreUploadCard.jsx):
// tinted status header + accent left border, progress block, status banner
// and a full-width action footer.
const SubjectCard = ({ item, onSelect }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const percent = item.lesson_plan_percentage ?? 0;
  const learners = item.registered_students || 0;
  const isComplete = percent >= 100;
  const isStarted = percent > 0;

  // Status accent — same idea as Score Upload: a left border + tinted header
  // so cards in different states are tellable apart at a glance.
  const accentColor = isComplete ? '#2E7D32' : isStarted ? '#1565C0' : '#E67E22';
  const headerTint = isComplete
    ? isDark
      ? 'rgba(46,125,50,0.14)'
      : '#DCEFDC'
    : isStarted
      ? isDark
        ? 'rgba(21,101,192,0.14)'
        : '#DCEAFB'
      : isDark
        ? 'rgba(230,126,34,0.16)'
        : '#FDF0E1';
  const statusLabel = isComplete ? 'Complete' : isStarted ? 'In progress' : 'Not started';
  const statusColor = isComplete ? 'success' : isStarted ? 'primary' : 'warning';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderLeft: '4px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
        borderLeftColor: accentColor,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 8px 20px rgba(15,23,42,0.1)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#94a3b8',
          borderLeftColor: accentColor,
        },
      }}
    >
      {/* ── Top Header Section — tinted by generation status ── */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: headerTint,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.75 }}>
          <Chip
            label={`${item.class_name} - ${item.arm_name}`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '11px',
              height: '22px',
              backgroundColor: isDark ? theme.palette.background.paper : '#FFFFFF',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#D0D5DD',
              color: theme.palette.text.primary,
            }}
          />
        </Box>

        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="text.primary"
          sx={{
            mb: 1,
            fontSize: '0.925rem',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={item.subject_name}
        >
          {item.subject_name}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={500}
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
          >
            Registered learners: <strong>{learners}</strong>
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            color={statusColor}
            icon={
              isComplete ? (
                <IconCheck size={12} />
              ) : isStarted ? (
                <IconProgressCheck size={12} />
              ) : undefined
            }
            sx={{ fontWeight: 600, fontSize: '11px', height: '22px' }}
          />
        </Box>
      </Box>

      {/* ── Content Section with Progress Bar ───────────────── */}
      <Box sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}
          >
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: '0.775rem' }}
            >
              Lesson Note Progress
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.primary"
              sx={{ fontSize: '0.775rem' }}
            >
              {percent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
              '& .MuiLinearProgress-bar': {
                backgroundColor: isStarted ? '#1B7A16' : '#CCCCCC',
                borderRadius: 3,
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.7rem' }}
          >
            {item.completed_weeks} out of {item.total_weeks} topics generated
          </Typography>
        </Box>

        {/* Generation Status Indicator Banner */}
        <Box
          sx={{
            py: 0.5,
            px: 1,
            borderRadius: '4px',
            backgroundColor: isComplete
              ? isDark
                ? 'rgba(76, 175, 80, 0.15)'
                : '#EAF4D8'
              : isStarted
                ? isDark
                  ? 'rgba(33, 150, 243, 0.15)'
                  : '#D7EEFD'
                : isDark
                  ? 'rgba(230, 126, 34, 0.15)'
                  : '#FDF0E1',
            textAlign: 'center',
            mt: 'auto',
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.primary"
            sx={{ fontSize: '0.725rem' }}
          >
            Generation Status:{' '}
            <Typography
              component="span"
              variant="caption"
              fontWeight={700}
              color={isComplete ? 'success.main' : isStarted ? 'primary.main' : 'warning.main'}
              sx={{ fontSize: '0.725rem' }}
            >
              {statusLabel}
            </Typography>
          </Typography>
        </Box>
      </Box>

      {/* ── Action Footer ──────────────────────────────────── */}
      <Box
        sx={{
          p: 1.25,
          pt: 1,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          startIcon={<IconNotes size={14} />}
          endIcon={<IconExternalLink size={14} />}
          title="Opens this subject's workspace in a new tab"
          onClick={() => onSelect && onSelect(item)}
          sx={{
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'none',
            py: 0.5,
            borderRadius: '5px',
          }}
        >
          Manage Content
        </Button>
      </Box>
    </Paper>
  );
};

const StaffLessonNoteIndex = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user, roles } = useAuth();

  const isAdmin = useMemo(
    () =>
      (roles || []).some((role) =>
        ['super_admin', 'school_admin'].includes(typeof role === 'string' ? role : role?.name),
      ),
    [roles],
  );

  // Deep link: the new tab carries a single opaque token holding the
  // subject/session-term/programme/class ids — no descriptive parameter
  // names in the URL.
  const [searchParams] = useSearchParams();
  const deepLink = useMemo(() => {
    const token = searchParams.get('d');
    if (!token) return null;
    try {
      const parsed = JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/')));
      const subjectId = parsed?.subject_id;
      const sessionTermId = parsed?.session_term_id;
      const progId = parsed?.programme_id;
      const classDesc = parsed?.class_id;
      if (subjectId == null || sessionTermId == null || progId == null || classDesc == null) {
        return null;
      }
      return {
        subjectId: String(subjectId),
        sessionTermId: String(sessionTermId),
        progId: String(progId),
        classDesc: String(classDesc),
        // Display/staff context travels in the token too, so the tab never
        // has to re-resolve the subject row through the teacher-subjects API.
        staffSubjectId: parsed?.staff_subject_id != null ? String(parsed.staff_subject_id) : '',
        subjectName: parsed?.subject_name ?? '',
        className: parsed?.class_name ?? '',
        armName: parsed?.arm_name ?? '',
      };
    } catch {
      return null;
    }
  }, [searchParams]);
  const isDeepLink = Boolean(deepLink);

  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedSesTerm, setSelectedSesTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [activeSesTerm, setActiveSesTerm] = useState(null);
  const [selectedProgId, setSelectedProgId] = useState('');
  const [selectedClassDesc, setSelectedClassDesc] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [teachingSubjects, setTeachingSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  // Scheme-of-work cascade: weeks → topics → subtopics, each level loaded by
  // its own API call (see loadTopics / loadSubtopics below).
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  // The id travels with the name: lesson notes are stored one row per
  // subtopic, so every load/upload has to carry which subtopic is picked.
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('');
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState(0);

  // Enrich a teacher-subject row with the progress fields the cards expect
  // (shared by the subject list and the deep-link boot).
  const enrichSubjectItem = (item) => {
    const completed = parseInt(item.total_lesson_notes || 0, 10);
    const total = Math.max(parseInt(item.total_topics || 0, 10), 1);
    const percentage = Math.min(Math.round((completed / total) * 100), 100);
    return {
      ...item,
      completed_weeks: completed,
      total_weeks: total,
      lesson_plan_percentage: Number.isFinite(percentage) ? percentage : 0,
    };
  };

  const loadProgrammes = useCallback(
    async (termId) => {
      setLoadingProgrammes(true);
      try {
        const res = await tenantLessonNoteApi.getProgramme({
          filter: { selectedTermId: termId, selectedSesTerm: termId },
        });
        const rows = Array.isArray(res) ? res : [];
        setProgrammes(rows);
        setSelectedProgId((prev) =>
          rows.some((row) => row.id === prev) ? prev : (rows[0]?.id ?? ''),
        );
      } catch (err) {
        notify.error(err?.response?.data?.message || 'Failed to load programmes');
      } finally {
        setLoadingProgrammes(false);
      }
    },
    [notify],
  );

  const loadClasses = useCallback(
    async (termId, progId) => {
      if (!progId) {
        setClasses([]);
        setSelectedClassDesc('');
        return;
      }
      setLoadingClasses(true);
      try {
        const res = await tenantLessonNoteApi.getClasses({
          filter: { progId, selectedSesTerm: termId },
        });
        const rows = Array.isArray(res) ? res : (res?.classes ?? []);
        setClasses(rows);
        setSelectedClassDesc((prev) =>
          rows.some((row) => row.class_description_id === prev)
            ? prev
            : (rows[0]?.class_description_id ?? ''),
        );
      } catch (err) {
        notify.error(err?.response?.data?.message || 'Failed to load classes');
      } finally {
        setLoadingClasses(false);
      }
    },
    [notify],
  );

  const loadTeachers = useCallback(
    async ({ termId, progId, classDesc }) => {
      if (!isAdmin || !progId || !classDesc) {
        setTeachers([]);
        setSelectedTeacherId('');
        return;
      }
      try {
        const res = await tenantLessonNoteApi.subjTchAll({
          filter: { progId, classDesc, selectedSesTerm: termId },
        });
        setTeachers(Array.isArray(res) ? res : []);
      } catch {
        setTeachers([]);
      }
    },
    [isAdmin],
  );

  const loadTeachingSubjects = useCallback(
    async ({ termId, progId, classDesc, teacherId = '', subjectId = '' }) => {
      if (!termId || !progId || !classDesc) return;
      setLoadingSubjects(true);
      try {
        const res = await tenantLessonNoteApi.getTeacherSubject({
          userId: teacherId || user?.id,
          filters: {
            selectedSesTerm: termId,
            selectedTermId: termId,
            progId,
            classDesc,
            subject_id: subjectId || null,
          },
        });
        const rows = res?.subjects ?? (Array.isArray(res) ? res : []);
        setTeachingSubjects(rows.map(enrichSubjectItem));
      } catch (err) {
        setTeachingSubjects([]);
        notify.error(err?.response?.data?.message || 'Failed to load teaching subjects');
      } finally {
        setLoadingSubjects(false);
      }
    },
    [notify, user],
  );

  useEffect(() => {
    if (isDeepLink) return; // new-tab workspace never needs the filter cascade
    const init = async () => {
      setLoadingTerms(true);
      try {
        const res = await fetchSessionTerms();
        const rows = res?.data ?? [];
        setSessionTerms(rows);

        let active = null;
        try {
          const activeRes = await fetchActiveTenantSessionTerm();
          active = activeRes?.data ?? activeRes ?? null;
        } catch {
          active = null;
        }
        setActiveSesTerm(active);

        // Session defaults from the tenant's active session-term (same rule
        // as the Class Register page), falling back to the first session.
        const options = uniqueSessions(rows);
        const defaultSessionId =
          active?.session_id != null && options.some((session) => session.id === active.session_id)
            ? active.session_id
            : (options[0]?.id ?? '');
        if (defaultSessionId) setSelectedSession(defaultSessionId);
      } catch (err) {
        notify.error(err?.response?.data?.message || 'Failed to load session terms');
      } finally {
        setLoadingTerms(false);
      }
    };
    init();
  }, [notify, isDeepLink]);

  // Session → Term cascade, Class Register style: pick the active term when
  // the selected session hosts it, otherwise the first term of the session.
  const sessionFilteredTerms = useMemo(
    () =>
      sessionTerms.filter(
        (row) => String(row.session?.id ?? row.session_id) === String(selectedSession || ''),
      ),
    [sessionTerms, selectedSession],
  );

  const sessionOptions = useMemo(() => uniqueSessions(sessionTerms), [sessionTerms]);

  useEffect(() => {
    if (isDeepLink) return;
    if (!selectedSession || sessionTerms.length === 0) return;
    if (sessionFilteredTerms.length === 0) {
      setSelectedSesTerm('');
      return;
    }
    const activeMatchesSession =
      activeSesTerm?.session_id != null &&
      String(activeSesTerm.session_id) === String(selectedSession);
    const activeMatch = activeMatchesSession
      ? sessionFilteredTerms.find((row) => row.id === activeSesTerm.id)
      : null;
    setSelectedSesTerm(activeMatch?.id ?? sessionFilteredTerms[0]?.id ?? '');
  }, [selectedSession, sessionTerms, sessionFilteredTerms, activeSesTerm, isDeepLink]);

  useEffect(() => {
    if (isDeepLink || !selectedSesTerm) return;
    setSelectedSubject(null);
    setSelectedWeek(null);
    setWeeks([]);
    loadProgrammes(selectedSesTerm);
  }, [selectedSesTerm, loadProgrammes, isDeepLink]);

  useEffect(() => {
    if (isDeepLink || !selectedSesTerm || !selectedProgId) return;
    setSelectedSubject(null);
    setSelectedWeek(null);
    setWeeks([]);
    loadClasses(selectedSesTerm, selectedProgId);
  }, [selectedSesTerm, selectedProgId, loadClasses, isDeepLink]);

  useEffect(() => {
    if (isDeepLink) return;
    loadTeachers({ termId: selectedSesTerm, progId: selectedProgId, classDesc: selectedClassDesc });
    loadTeachingSubjects({
      termId: selectedSesTerm,
      progId: selectedProgId,
      classDesc: selectedClassDesc,
      teacherId: selectedTeacherId,
      subjectId: selectedSubjectId,
    });
  }, [
    selectedSesTerm,
    selectedProgId,
    selectedClassDesc,
    selectedTeacherId,
    selectedSubjectId,
    loadTeachers,
    loadTeachingSubjects,
    isDeepLink,
  ]);

  const uniqueSubjects = useMemo(() => {
    const seen = new Set();
    return teachingSubjects
      .filter((item) => {
        if (seen.has(item.subject_id)) return false;
        seen.add(item.subject_id);
        return true;
      })
      .map((item) => ({ subject_id: item.subject_id, subject_name: item.subject_name }))
      .sort((a, b) => String(a.subject_name).localeCompare(String(b.subject_name)));
  }, [teachingSubjects]);

  // Clicking a subject card opens its workspace in a new tab. The context
  // travels as one base64url token so the URL exposes no parameter names.
  const handleOpenSubject = (item) => {
    const payload = {
      subject_id: item.subject_id,
      session_term_id: selectedSesTerm,
      programme_id: selectedProgId,
      class_id: item.class_description_id ?? item.class_id,
      staff_subject_id: item.staff_subject_id,
      subject_name: item.subject_name,
      class_name: item.class_name,
      arm_name: item.arm_name,
    };
    const token = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    window.open(`${SUBJECT_WORKSPACE_PATH}?d=${token}`, '_blank', 'noopener,noreferrer');
  };

  // ── Level 3 of the cascade: subtopics for the picked topic.
  const loadSubtopics = useCallback(
    async (topic) => {
      setLoadingSubtopics(true);
      setSubtopics([]);
      setSelectedSubtopic('');
      setSelectedSubtopicId('');
      try {
        if (!topic?.topic_id) return;
        const res = await tenantLessonNoteApi.getTopicSubtopics({ topic_id: topic.topic_id });
        const rows = Array.isArray(res) ? res : [];
        setSubtopics(rows);
        setSelectedSubtopic(rows[0]?.subtopic_name ?? '');
        setSelectedSubtopicId(rows[0]?.subtopic_id ?? '');
      } catch (err) {
        notify.error(err?.response?.data?.message || 'Failed to load subtopics for this topic');
      } finally {
        setLoadingSubtopics(false);
      }
    },
    [notify],
  );

  // ── Level 2 of the cascade: topics for the picked week (auto-picks the
  // first topic, which cascades into its subtopics).
  const loadTopics = useCallback(
    async (week) => {
      setLoadingTopics(true);
      setTopics([]);
      setSelectedTopic('');
      setSubtopics([]);
      setSelectedSubtopic('');
      setSelectedSubtopicId('');
      try {
        if (!week?.scheme_of_work_id) return;
        const res = await tenantLessonNoteApi.getSchemeWeekTopics({
          scheme_of_work_id: week.scheme_of_work_id,
        });
        const rows = Array.isArray(res) ? res : [];
        setTopics(rows);
        if (rows.length > 0) {
          setSelectedTopic(rows[0].topic_name ?? '');
          await loadSubtopics(rows[0]);
        }
      } catch (err) {
        notify.error(err?.response?.data?.message || 'Failed to load topics for this week');
      } finally {
        setLoadingTopics(false);
      }
    },
    [notify, loadSubtopics],
  );

  // ── Deep-link boot: the new tab carries its whole context in the URL
  // token, so it goes straight to the scheme-weeks endpoint (level 1 of the
  // cascade) — no subject re-lookup.
  useEffect(() => {
    if (!deepLink) return;
    let cancelled = false;

    const boot = async () => {
      setSelectedSesTerm(deepLink.sessionTermId);
      setSelectedProgId(deepLink.progId);
      setSelectedClassDesc(deepLink.classDesc);
      // Subject context is already known from the token — show the header
      // while the scheme weeks load.
      setSelectedSubject(
        enrichSubjectItem({
          subject_id: deepLink.subjectId,
          staff_subject_id: deepLink.staffSubjectId,
          subject_name: deepLink.subjectName,
          class_name: deepLink.className,
          arm_name: deepLink.armName,
          class_description_id: deepLink.classDesc,
        }),
      );
      setLoadingWeeks(true);
      setWeeks([]);
      setSelectedWeek(null);
      setTopics([]);
      setSelectedTopic('');
      setSubtopics([]);
      setSelectedSubtopic('');
      setSelectedSubtopicId('');
      setActiveContentTab(0);
      try {
        const res = await tenantLessonNoteApi.getSchemeWeeks({
          session_term_id: deepLink.sessionTermId,
          subject_id: deepLink.subjectId,
          prog_id: deepLink.progId,
          class_description_id: deepLink.classDesc,
        });
        if (cancelled) return;
        const rows = Array.isArray(res) ? res : [];
        setWeeks(rows);
        if (rows.length > 0) {
          const firstWeek = rows[0];
          setSelectedWeek(firstWeek);
          await loadTopics(firstWeek); // cascades into the first subtopic
        }
      } catch (err) {
        if (!cancelled) {
          notify.error(err?.response?.data?.message || 'Failed to load the scheme of work weeks');
        }
      } finally {
        if (!cancelled) setLoadingWeeks(false);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLink]);

  const handleWeekChange = (weekId) => {
    const week = weeks.find((row) => String(row.week_id) === String(weekId));
    setSelectedWeek(week || null);
    loadTopics(week ?? null);
  };

  const handleTopicChange = (topicName) => {
    setSelectedTopic(topicName);
    const topic = topics.find((row) => row.topic_name === topicName);
    loadSubtopics(topic ?? null);
  };

  const schemeOfWorkId = selectedWeek?.scheme_of_work_id ?? null;

  // Context handed to the embedded Lesson Plan / Note / Video editors —
  // rebuilt whenever the week, topic or subtopic changes.
  const editorContext = useMemo(() => {
    if (!selectedSubject || !schemeOfWorkId) return null;
    return {
      schemeOfWorkId: String(schemeOfWorkId),
      staffSubjectId: String(selectedSubject.staff_subject_id ?? ''),
      subjectId: String(selectedSubject.subject_id ?? ''),
      subjectName: String(selectedSubject.subject_name ?? ''),
      className: String(selectedSubject.class_name ?? ''),
      armName: String(selectedSubject.arm_name ?? ''),
      classArmId: String(selectedSubject.class_description_id ?? selectedSubject.class_id ?? ''),
      progId: String(selectedProgId ?? ''),
      sessionTermId: String(selectedSesTerm ?? ''),
      weekName: String(selectedWeek?.week_name ?? ''),
      topic: String(selectedTopic ?? ''),
      subtopic: String(selectedSubtopic ?? ''),
      subTopicsId: String(selectedSubtopicId ?? ''),
    };
  }, [
    selectedSubject,
    schemeOfWorkId,
    selectedProgId,
    selectedSesTerm,
    selectedWeek,
    selectedTopic,
    selectedSubtopic,
    selectedSubtopicId,
  ]);

  const filtersReady = selectedSesTerm && selectedProgId && selectedClassDesc;

  // ── Workspace intelligence — a quick read on coverage across every
  // subject the current filters return, before picking one to work on.
  const workspaceStats = useMemo(() => {
    const totalSubjects = teachingSubjects.length;
    const totalLearners = teachingSubjects.reduce(
      (sum, s) => sum + (s.registered_students || 0),
      0,
    );
    const completed = teachingSubjects.filter((s) => (s.lesson_plan_percentage ?? 0) >= 100).length;
    const notStarted = teachingSubjects.filter((s) => (s.lesson_plan_percentage ?? 0) === 0).length;
    const avgCoverage = totalSubjects
      ? Math.round(
          teachingSubjects.reduce((sum, s) => sum + (s.lesson_plan_percentage ?? 0), 0) /
            totalSubjects,
        )
      : 0;
    return { totalSubjects, totalLearners, completed, notStarted, avgCoverage };
  }, [teachingSubjects]);
  return (
    <PageContainer
      title="Lesson Notes"
      description="Create and manage lesson notes, plans and videos"
    >
      <Breadcrumb title="Teaching Resources" items={BCrumb} />

      {/* ── Workspace intelligence — coverage across the filtered subjects ── */}
      {!isDeepLink && !selectedSubject && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              count={workspaceStats.totalSubjects}
              label="Teaching Subjects"
              subtitle="In this filter"
              icon={IconNotes}
              colorIndex={0}
              loading={loadingSubjects}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              count={workspaceStats.totalLearners}
              label="Registered Learners"
              subtitle="Across these subjects"
              icon={IconUsers}
              colorIndex={1}
              loading={loadingSubjects}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              count={`${workspaceStats.avgCoverage}%`}
              label="Average Coverage"
              subtitle="Lesson notes generated"
              icon={IconGauge}
              colorIndex={2}
              loading={loadingSubjects}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              count={workspaceStats.completed}
              label="Fully Covered"
              subtitle="100% of topics logged"
              icon={IconCheck}
              colorIndex={3}
              loading={loadingSubjects}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard
              count={workspaceStats.notStarted}
              label="Needs Attention"
              subtitle="No content started yet"
              icon={IconAlertTriangle}
              colorIndex={4}
              loading={loadingSubjects}
            />
          </Grid>
        </Grid>
      )}

      {/* ── Filters + Content Card ───────────────────────────────────── */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        {/* ── Card header: filters + Fetch + Back to subjects ────────── */}
        {(!isDeepLink || selectedSubject) && (
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              {/* Subject-list filters (only while browsing subjects) */}
              {!isDeepLink && !selectedSubject && (
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Session"
                        value={selectedSession}
                        onChange={(e) => {
                          setSelectedSession(e.target.value);
                          setSelectedProgId('');
                          setSelectedClassDesc('');
                          setSelectedTeacherId('');
                          setSelectedSubjectId('');
                        }}
                        disabled={loadingTerms}
                      >
                        {sessionOptions.map((session) => (
                          <MenuItem key={session.id} value={session.id}>
                            {session.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 1.6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Term"
                        value={selectedSesTerm}
                        onChange={(e) => {
                          setSelectedSesTerm(e.target.value);
                          setSelectedProgId('');
                          setSelectedClassDesc('');
                          setSelectedTeacherId('');
                          setSelectedSubjectId('');
                        }}
                        disabled={loadingTerms || sessionFilteredTerms.length === 0}
                      >
                        {sessionFilteredTerms.map((term) => (
                          <MenuItem key={term.id} value={term.id}>
                            {term.term?.term_name || term.term_name || 'Term'}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Programme"
                        value={selectedProgId}
                        onChange={(e) => {
                          setSelectedProgId(e.target.value);
                          setSelectedClassDesc('');
                          setSelectedTeacherId('');
                        }}
                        disabled={loadingProgrammes || !selectedSesTerm}
                      >
                        {programmes.map((programme) => (
                          <MenuItem key={programme.id} value={programme.id}>
                            {programme.programme_name || programme.prog_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Class"
                        value={selectedClassDesc}
                        onChange={(e) => {
                          setSelectedClassDesc(e.target.value);
                          setSelectedTeacherId('');
                          setSelectedSubjectId('');
                        }}
                        disabled={loadingClasses || !selectedProgId}
                      >
                        {classes.map((cls) => (
                          <MenuItem key={cls.class_description_id} value={cls.class_description_id}>
                            {cls.class_name} {cls.arm_name ? `- ${cls.arm_name}` : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {isAdmin && (
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Teacher"
                          value={selectedTeacherId}
                          onChange={(e) => {
                            setSelectedTeacherId(e.target.value);
                            setSelectedSubjectId('');
                          }}
                          disabled={!selectedClassDesc}
                        >
                          <MenuItem value="">All Teachers</MenuItem>
                          {teachers.map((teacher, index) => (
                            <MenuItem
                              key={`${teacher.teacher_id}-${index}`}
                              value={teacher.teacher_id}
                            >
                              {teacher.fname} {teacher.lname} ({teacher.user_id})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Subject"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        disabled={!selectedClassDesc}
                      >
                        <MenuItem value="">All Subjects</MenuItem>
                        {uniqueSubjects.map((subject) => (
                          <MenuItem key={subject.subject_id} value={subject.subject_id}>
                            {subject.subject_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Week / Topic / Subtopic filters (only inside a subject) */}
              {selectedSubject && (
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Week"
                        value={selectedWeek?.week_id ?? ''}
                        onChange={(e) => handleWeekChange(e.target.value)}
                        disabled={loadingWeeks || weeks.length === 0}
                      >
                        {weeks.map((week) => (
                          <MenuItem key={week.week_id} value={week.week_id}>
                            {week.week_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Topic"
                        value={selectedTopic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        disabled={loadingTopics || topics.length === 0}
                      >
                        {topics.map((topic) => (
                          <MenuItem key={topic.topic_id} value={topic.topic_name}>
                            {topic.topic_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Subtopic"
                        value={selectedSubtopic}
                        onChange={(e) => {
                          setSelectedSubtopic(e.target.value);
                          setSelectedSubtopicId(
                            subtopics.find((row) => row.subtopic_name === e.target.value)
                              ?.subtopic_id ?? '',
                          );
                        }}
                        disabled={loadingSubtopics || subtopics.length === 0}
                      >
                        {subtopics.map((subtopic) => (
                          <MenuItem key={subtopic.subtopic_id} value={subtopic.subtopic_name}>
                            {subtopic.subtopic_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                {!isDeepLink && !selectedSubject && (
                  <Button
                    variant="contained"
                    sx={{ height: 40, px: 3 }}
                    disabled={!filtersReady || loadingSubjects}
                    onClick={() =>
                      loadTeachingSubjects({
                        termId: selectedSesTerm,
                        progId: selectedProgId,
                        classDesc: selectedClassDesc,
                        teacherId: selectedTeacherId,
                        subjectId: selectedSubjectId,
                      })
                    }
                  >
                    {loadingSubjects ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
                  </Button>
                )}
                {selectedSubject && (
                  <Button
                    startIcon={<IconArrowLeft size={16} />}
                    onClick={() =>
                      isDeepLink ? navigate(SUBJECT_WORKSPACE_PATH) : setSelectedSubject(null)
                    }
                    sx={{ height: 40 }}
                  >
                    Back to subjects
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        )}

        <CardContent>
          {!isDeepLink && !selectedSubject && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  p: 1.5,
                  mb: 2,
                  borderRadius: '12px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.08)' : '#EFF6FF',
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.25)' : '#BFDBFE',
                }}
              >
                <IconInfoCircle size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    color: (theme) => (theme.palette.mode === 'dark' ? '#cbd5e1' : '#1e3a8a'),
                  }}
                >
                  Pick a subject below to open its workspace — each one has a{' '}
                  <strong>Lesson Plan</strong>, <strong>Lesson Note</strong> and{' '}
                  <strong>Video Content</strong> tab for every week on the scheme of work.
                </Typography>
              </Box>

              {loadingSubjects ? (
                <Grid container spacing={2}>
                  {[0, 1, 2].map((item) => (
                    <Grid key={item} size={{ xs: 12, md: 4 }}>
                      <Skeleton variant="rounded" height={140} sx={{ borderRadius: '14px' }} />
                    </Grid>
                  ))}
                </Grid>
              ) : teachingSubjects.length === 0 ? (
                <Alert severity="info">
                  {filtersReady
                    ? 'No teaching resources found. Try changing the term, programme, class, teacher or subject filters.'
                    : 'Select a term, programme and class to see your teaching subjects.'}
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {teachingSubjects.map((item) => (
                    <Grid
                      key={`${item.subject_id}-${item.class_description_id || item.class_id}`}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    >
                      <SubjectCard item={item} onSelect={handleOpenSubject} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* First frame of a deep-link tab, before the boot effect seeds the
          subject from its token. */}
          {isDeepLink && !selectedSubject && (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={140} />
            </Stack>
          )}

          {selectedSubject && (
            <>
              {loadingWeeks && (
                <Stack spacing={1} mt={1}>
                  <Skeleton variant="rounded" height={40} />
                  <Skeleton variant="rounded" height={120} />
                </Stack>
              )}

              {!loadingWeeks && weeks.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No scheme of work weeks found for this subject, class and term.
                </Alert>
              )}

              {!loadingWeeks && schemeOfWorkId && editorContext && (
                <Box mt={1}>
                  <Tabs
                    value={activeContentTab}
                    onChange={(_, value) => setActiveContentTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    slotProps={{ indicator: { sx: { display: 'none' } } }}
                    sx={{
                      mb: 2.5,
                      minHeight: 44,
                      p: 0.5,
                      borderRadius: '12px',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                      '& .MuiTabs-flexContainer': { gap: 0.5 },
                    }}
                  >
                    {CONTENT_TABS.map((tab, index) => (
                      <Tab
                        key={tab.key}
                        value={index}
                        label={tab.label}
                        icon={<tab.Icon size={17} />}
                        iconPosition="start"
                        disableRipple
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: 12.5,
                          minHeight: 38,
                          borderRadius: '9px',
                          color: 'text.secondary',
                          transition: 'all 150ms ease',
                          '&.Mui-selected': {
                            color: '#fff',
                            bgcolor: '#2563EB',
                            boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
                          },
                        }}
                      />
                    ))}
                  </Tabs>

                  {/* Remount on selection change so unsaved edits never end up
                    saved against a different week/topic. */}
                  {activeContentTab === 0 && (
                    <LessonContentTab
                      key={`plan-${editorContext.schemeOfWorkId}-${editorContext.subTopicsId}`}
                      type="plan"
                      context={editorContext}
                    />
                  )}
                  {activeContentTab === 1 && (
                    <LessonContentTab
                      key={`note-${editorContext.schemeOfWorkId}-${editorContext.subTopicsId}`}
                      type="note"
                      context={editorContext}
                    />
                  )}
                  {activeContentTab === 2 && (
                    <LessonContentTab
                      key={`video-${editorContext.schemeOfWorkId}-${editorContext.subTopicsId}`}
                      type="video"
                      context={editorContext}
                    />
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default StaffLessonNoteIndex;
