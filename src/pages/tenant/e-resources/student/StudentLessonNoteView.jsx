import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconArrowLeft,
  IconBook2,
  IconChecks,
  IconMessageCircle2,
  IconNotes,
  IconPlayerPlay,
  IconRefresh,
  IconSparkles,
  IconStarFilled,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantStudentApi } from '@/api/tenant/e-resources/studentApi';
import { tenantSharedApi } from '@/api/tenant/e-resources/browseApi';
import {
  DocxPreview,
  ForumThread,
  RichContentView,
} from '@/pages/tenant/e-resources/teacher/lessonNoteShared';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'Lesson Note' },
];

const ASSESSMENT_ROUTE = '/e-resources/student/assessment';

const sharedGetRatings = tenantSharedApi.getRatings || tenantSharedApi.getLessonRatings;
const sharedRateLesson = tenantSharedApi.rateLesson || tenantSharedApi.rateLessons;

const contentItems = (content) => {
  if (!content) return [];
  const list = Array.isArray(content) ? content : [content];
  return list.filter(Boolean);
};

const cardSx = {
  borderRadius: '14px',
  border: '1px solid',
  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB'),
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

// A small labeled section wrapper so, when both an uploaded document and an
// AI-drafted note exist for the same lesson, the student sees both clearly
// told apart instead of only whichever one the page picked to show.
const ContentSection = ({ icon: Icon, label, accent, children }) => (
  <Box>
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
      <Icon size={14} color={accent} />
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </Typography>
    </Stack>
    {children}
  </Box>
);

const renderContentItem = (item, key) => {
  // AI-drafted note content — rendered through the same sanitised rich-text
  // viewer the teacher workspace uses.
  if (item && typeof item === 'object' && item.type === 'html') {
    return (
      <ContentSection key={key} icon={IconSparkles} label="AI-generated note" accent="#7C3AED">
        <Box
          sx={{
            p: 2,
            borderRadius: '10px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(124,58,237,0.06)' : '#FAF5FF'),
            border: '1px solid',
            borderColor: 'rgba(124,58,237,0.2)',
          }}
        >
          <RichContentView content={item.value} />
        </Box>
      </ContentSection>
    );
  }

  const src = typeof item === 'string' ? item : item?.url ?? item?.path ?? '';
  if (!src) return null;
  const lower = src.toLowerCase();

  if (lower.endsWith('.pdf')) {
    return (
      <ContentSection key={key} icon={IconUpload} label="Uploaded document" accent="#2563EB">
        <Paper
          variant="outlined"
          sx={{ height: 700, overflow: 'hidden', borderRadius: '10px', borderColor: '#E5E7EB' }}
        >
          <iframe title={`lesson-${key}`} src={src} width="100%" height="100%" style={{ border: 0 }} />
        </Paper>
      </ContentSection>
    );
  }
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) {
    return (
      <ContentSection key={key} icon={IconUpload} label="Uploaded document" accent="#2563EB">
        <Paper
          variant="outlined"
          sx={{ p: 1, textAlign: 'center', borderRadius: '10px', borderColor: '#E5E7EB' }}
        >
          <Box component="img" src={src} alt="" sx={{ maxWidth: '100%', maxHeight: 700, borderRadius: '6px' }} />
        </Paper>
      </ContentSection>
    );
  }
  // Any other uploaded file (Word, PowerPoint, Excel, or anything else the
  // teacher uploaded) renders inline via the same docs-preview component the
  // teacher workspace uses — the lesson should be readable on this page
  // itself, never require leaving to a new tab to see it.
  return (
    <ContentSection key={key} icon={IconUpload} label="Uploaded document" accent="#2563EB">
      <DocxPreview url={src} />
    </ContentSection>
  );
};

const StudentLessonNoteView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();

  const schemeOfWorkId = searchParams.get('schemeOfWorkId');
  const subjectId = searchParams.get('subjectId');
  const classProgId = searchParams.get('classProgId');
  const weekId = searchParams.get('weekId');
  const sessionTermId = searchParams.get('sessionTermId');
  const classArmId = searchParams.get('classArmId');
  const subjectName = searchParams.get('subjectName') || '';
  const weekName = searchParams.get('weekName') || '';

  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState('');
  const [contentData, setContentData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [progress, setProgress] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [marking, setMarking] = useState(false);
  const [readingDialogOpen, setReadingDialogOpen] = useState(false);
  const [readingChoice, setReadingChoice] = useState('Ahead');
  const [savingReading, setSavingReading] = useState(false);
  const [outline, setOutline] = useState([]);
  const [outlineAttempted, setOutlineAttempted] = useState(false);

  const lessonNote = useMemo(() => {
    const notes = contentData?.lessonNote;
    return Array.isArray(notes) && notes.length > 0 ? notes[0] : null;
  }, [contentData]);

  const lesson = contentData?.lesson ?? null;
  const lessonNoteId = lesson?.lesson_id ?? null;

  // ── Subject outline — week → topic → subtopic, read from this tenant's
  // own database (not the OGSERA-backed assessment endpoint). In this
  // schema scheme_of_work_id is bound per week, so each entry here IS a
  // week — this lets a student land here from a subject card (no specific
  // lesson chosen yet) and switch weeks in-place, the same way the legacy
  // app's Lesson Content page works.
  const loadOutline = useCallback(async () => {
    if (!subjectId || !classProgId || !sessionTermId) return;
    try {
      const res = await tenantStudentApi.getSubjectOutline({
        subject_id: subjectId,
        class_prog_id: classProgId,
        session_term_id: sessionTermId,
      });
      setOutline(Array.isArray(res) ? res : []);
    } catch {
      setOutline([]);
    } finally {
      setOutlineAttempted(true);
    }
  }, [subjectId, classProgId, sessionTermId]);

  useEffect(() => {
    loadOutline();
  }, [loadOutline]);

  const currentWeek = useMemo(
    () => outline.find((w) => String(w.scheme_of_work_id) === String(schemeOfWorkId)) || null,
    [outline, schemeOfWorkId],
  );

  const selectWeek = useCallback(
    (week) => {
      if (!week) return;
      const params = new URLSearchParams({
        schemeOfWorkId: String(week.scheme_of_work_id),
        subjectId: String(subjectId || ''),
        classProgId: String(classProgId || ''),
        weekId: String(week.week_id ?? ''),
        sessionTermId: String(sessionTermId || ''),
        classArmId: String(classArmId || ''),
        subjectName,
        weekName: week.week_name ?? '',
      });
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [navigate, location.pathname, subjectId, classProgId, sessionTermId, classArmId, subjectName],
  );

  // No specific week chosen yet (arrived straight from the subject card) —
  // auto-pick the earliest week with a lesson note so the page always
  // lands on something useful instead of a dead end.
  useEffect(() => {
    if (schemeOfWorkId || outline.length === 0) return;
    const first = outline.find((week) => week.has_lesson_note) || outline[0];
    if (first) selectWeek(first);
  }, [schemeOfWorkId, outline, selectWeek]);

  // Topic/Subtopic — cascading, same as the legacy Week/Topic/Subtopic
  // dropdowns in LessonPlan.vue. The lesson note shown only ever changes
  // with the week (scheme_of_work_id is bound per-week in this schema), so
  // these two are a drill-down view of what's in the chosen week rather
  // than a separate fetch — matching how the legacy page itself behaves.
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');

  const topicOptions = currentWeek?.topics ?? [];
  const currentTopic = useMemo(
    () => topicOptions.find((t) => t.topic_name === selectedTopic) || topicOptions[0] || null,
    [topicOptions, selectedTopic],
  );
  const subtopicOptions = currentTopic?.sub_topics ?? [];

  useEffect(() => {
    setSelectedTopic(topicOptions[0]?.topic_name ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  useEffect(() => {
    setSelectedSubtopic(subtopicOptions[0] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopic]);

  const loadContent = useCallback(async () => {
    if (!schemeOfWorkId) {
      if (!subjectId) {
        setLoading(false);
        setError('Missing lesson reference.');
        return;
      }
      if (!outlineAttempted || outline.length > 0) {
        // Outline is still being fetched, or it came back with lessons and
        // the auto-select effect is about to redirect to one of them —
        // either way this resolves on its own in a moment.
        setLoading(true);
        return;
      }
      setLoading(false);
      setError('No lesson content has been set up for this subject yet.');
      return;
    }
    setLoading(true);
    setError('');
    setUnavailable(false);
    try {
      const res = await tenantStudentApi.getLessonContent(schemeOfWorkId);
      setContentData(res);
      const visitedLessonId = res?.lesson?.lesson_id;
      if (sessionTermId && visitedLessonId) {
        tenantStudentApi
          .saveVisitRecord({
            type: 'lesson-note',
            lesson_note_id: visitedLessonId,
            session_term_id: Number(sessionTermId),
          })
          .catch(() => {});
      }
      if (subjectId && weekId) {
        tenantStudentApi
          .getLessonNoteMeta(subjectId, classProgId)
          .then(setMeta)
          .catch(() => {});
      }
    } catch (err) {
      if (err?.response?.status === 503) {
        setUnavailable(true);
      } else {
        setError(err?.response?.data?.message || 'Failed to load lesson content');
      }
    } finally {
      setLoading(false);
    }
  }, [schemeOfWorkId, sessionTermId, subjectId, classProgId, weekId, outlineAttempted, outline.length]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const loadReadingMode = useCallback(async () => {
    if (!classProgId || !sessionTermId || !subjectId || !weekId) return;
    try {
      const exists = await tenantStudentApi.getReadingMode({
        class_prog_id: Number(classProgId),
        session_term_id: Number(sessionTermId),
        subject_id: Number(subjectId),
        week_id: Number(weekId),
      });
      if (exists !== true) setReadingDialogOpen(true);
    } catch {
      setReadingDialogOpen(true);
    }
  }, [classProgId, sessionTermId, subjectId, weekId]);

  useEffect(() => {
    if (contentData) loadReadingMode();
  }, [contentData, loadReadingMode]);

  const loadProgress = useCallback(async () => {
    if (!schemeOfWorkId || !subjectId || !classArmId || !sessionTermId) return;
    try {
      const res = await tenantStudentApi.getProgress(schemeOfWorkId, {
        subject_id: Number(subjectId),
        class_arm_id: Number(classArmId),
        session_term_id: Number(sessionTermId),
      });
      setProgress(res);
    } catch {
      setProgress(null);
    }
  }, [schemeOfWorkId, subjectId, classArmId, sessionTermId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const loadRatings = useCallback(async () => {
    if (!schemeOfWorkId || !sharedGetRatings) return;
    try {
      const res = await sharedGetRatings(schemeOfWorkId, { lesson_type: 'lesson_note' });
      setRatingValue(Number(res?.lesson_ratings ?? 0));
    } catch {
      setRatingValue(0);
    }
  }, [schemeOfWorkId]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleRate = async (value) => {
    if (!schemeOfWorkId || !sharedRateLesson) return;
    setRatingBusy(true);
    try {
      await sharedRateLesson(schemeOfWorkId, { rating: value, lesson_type: 'lesson_note' });
      setRatingValue(value);
      notify.success('Rating saved successfully');
    } catch (err) {
      notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error saving rating');
    } finally {
      setRatingBusy(false);
    }
  };

  const handleSaveReadingMode = async () => {
    setSavingReading(true);
    try {
      await tenantStudentApi.saveReadingMode({
        class_prog_id: Number(classProgId),
        session_term_id: Number(sessionTermId),
        subject_id: Number(subjectId),
        week_id: Number(weekId),
        readingMode: readingChoice,
      });
      setReadingDialogOpen(false);
      notify.success('Reading mode saved successfully');
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to save reading mode');
    } finally {
      setSavingReading(false);
    }
  };

  const handleMarkRead = async () => {
    if (!schemeOfWorkId || !lessonNote?.subject_teacher_id) return;
    setMarking(true);
    try {
      const res = await tenantStudentApi.markRead(schemeOfWorkId, {
        subject_teacher_id: lessonNote.subject_teacher_id,
      });
      notify.success(res?.message || 'Subtopic marked as read successfully');
      loadProgress();
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 409 || data?.status === 409) {
        notify.info(data?.message || 'Subtopic already marked as read');
      } else {
        notify.error(data?.message || 'Failed to mark subtopic as read');
      }
    } finally {
      setMarking(false);
    }
  };

  const openAssessment = () => {
    const params = new URLSearchParams({
      mode: 'lesson',
      sow: String(schemeOfWorkId),
      weekId: String(weekId ?? lessonNote?.week_id ?? ''),
      subjectId: String(subjectId ?? ''),
      classProgId: String(classProgId ?? ''),
      sessTermId: String(sessionTermId ?? ''),
      subjectName,
    });
    navigate(`${ASSESSMENT_ROUTE}?${params.toString()}`);
  };

  const displayItems = contentItems(contentData?.content);
  const readingPercent = Number(progress?.reading_progress_percent ?? 0);

  return (
    <PageContainer title="Lesson Note" description="View your lesson note content">
      <Breadcrumb title={subjectName || 'Lesson Note'} items={BCrumb} />

      {/* ── Hero header — subject, week & actions at a glance ────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#BFDBFE',
          background: isDark
            ? 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(37,99,235,0.1) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #EFF6FF 100%)',
        }}
      >
        <Box sx={{ height: 3, background: 'linear-gradient(90deg, #2563EB, #2563EB88)' }} />
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                <IconBook2 size={21} />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.2 }}>
                  {subjectName || 'Lesson Note'}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mt: 0.4 }}>
                  {weekName && (
                    <Chip
                      label={weekName}
                      size="small"
                      sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: '#DBEAFE', color: '#1E40AF' }}
                    />
                  )}
                  {meta?.student_name && (
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                      {meta.student_name}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<IconArrowLeft size={15} />}
                onClick={() => navigate('/e-resources/student')}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconRefresh size={15} />}
                onClick={loadContent}
                sx={{ borderRadius: '8px', fontWeight: 600 }}
              >
                Reload
              </Button>
              {lessonNote?.qz_scheme_id != null && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<IconPlayerPlay size={15} />}
                  onClick={openAssessment}
                  sx={{ borderRadius: '8px', fontWeight: 700 }}
                >
                  Take Assessment
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* ── Lesson Content tab strip — matches the legacy app's Lesson
          Content page (Lesson Note tab active; Video Content reserved for
          when video lessons are enabled for students). ──────────────────── */}
      <Paper elevation={0} sx={{ ...cardSx, mb: 2, overflow: 'hidden' }}>
        <Tabs
          value="note"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            px: 1,
            '& .MuiTab-root': { minHeight: 44, fontWeight: 700, fontSize: 12.5, textTransform: 'none' },
          }}
        >
          <Tab icon={<IconNotes size={16} />} iconPosition="start" value="note" label="Lesson Note" />
          <Tab icon={<IconVideo size={16} />} iconPosition="start" value="video" label="Video Content" disabled />
        </Tabs>
      </Paper>

      {/* ── Week / Topic / Subtopic switcher — mirrors the legacy app's
          LessonPlan.vue dropdown row. scheme_of_work_id (and so the lesson
          note shown) is bound per-week in this schema, so only the Week
          dropdown changes the fetched content; Topic/Subtopic drill down
          into what's in that week, same as the legacy page. ───────────── */}
      {outline.length > 0 && (
        <Paper elevation={0} sx={{ ...cardSx, mb: 2, p: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="lesson-week-label">Week</InputLabel>
              <Select
                labelId="lesson-week-label"
                label="Week"
                value={currentWeek ? String(currentWeek.scheme_of_work_id) : ''}
                onChange={(e) => {
                  const week = outline.find((w) => String(w.scheme_of_work_id) === e.target.value);
                  if (week) selectWeek(week);
                }}
              >
                {outline.map((w) => (
                  <MenuItem key={w.scheme_of_work_id} value={String(w.scheme_of_work_id)}>
                    {w.week_name}
                    {!w.has_lesson_note ? ' (no note yet)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180, flex: 1 }} disabled={topicOptions.length === 0}>
              <InputLabel id="lesson-topic-label">Topic</InputLabel>
              <Select
                labelId="lesson-topic-label"
                label="Topic"
                value={currentTopic?.topic_name || ''}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                {topicOptions.map((t, i) => (
                  <MenuItem key={`${t.topic_name}-${i}`} value={t.topic_name}>
                    {t.topic_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180, flex: 1 }} disabled={subtopicOptions.length === 0}>
              <InputLabel id="lesson-subtopic-label">Subtopic</InputLabel>
              <Select
                labelId="lesson-subtopic-label"
                label="Subtopic"
                value={selectedSubtopic || ''}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
              >
                {subtopicOptions.map((s, i) => (
                  <MenuItem key={`${s}-${i}`} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      )}

      {unavailable && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: '10px' }}
          action={<Button color="inherit" onClick={loadContent}>Retry</Button>}
        >
          Lesson content service is temporarily unavailable. Please try again in a moment.
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '10px' }}
          action={<Button color="inherit" onClick={loadContent}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Main column ─────────────────────────────────────────────── */}
        <Box>
          {loading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={90} sx={{ borderRadius: '14px' }} />
              <Skeleton variant="rounded" height={420} sx={{ borderRadius: '14px' }} />
            </Stack>
          ) : (
            <>
              <Card sx={{ ...cardSx, mb: 2 }}>
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      {lessonNote?.topic && (
                        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#2563EB', letterSpacing: 0.4 }}>
                          TOPIC
                        </Typography>
                      )}
                      {lessonNote?.topic && (
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                          {lessonNote.topic}
                        </Typography>
                      )}
                      {lessonNote?.subtopic && (
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.25 }}>
                          Sub-topic: {lessonNote.subtopic}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1} flexShrink={0}>
                      {lessonNote?.subject_teacher_id != null && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<IconChecks size={15} />}
                          disabled={marking}
                          onClick={handleMarkRead}
                          sx={{ borderRadius: '8px', fontWeight: 600 }}
                        >
                          {marking ? 'Marking…' : 'Mark as Read'}
                        </Button>
                      )}
                      {lessonNote?.qz_scheme_id != null && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={openAssessment}
                          sx={{ borderRadius: '8px', fontWeight: 700 }}
                        >
                          Take Formative
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  {progress && (
                    <Box mt={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>
                          Reading progress
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#16A34A' }}>
                          {progress.read_count}/{progress.total_subtopics} subtopics · {readingPercent}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={readingPercent}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                          '& .MuiLinearProgress-bar': { bgcolor: '#16A34A', borderRadius: 4 },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card sx={cardSx}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                    <IconBook2 size={16} color="#2563EB" />
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      Lesson Content
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.75 }} />
                  {!unavailable && displayItems.length === 0 && (
                    <Alert severity="info" sx={{ borderRadius: '10px' }}>
                      No content available for this lesson yet.
                    </Alert>
                  )}
                  <Stack spacing={1.5}>
                    {displayItems.map((item, idx) => renderContentItem(item, idx))}
                  </Stack>
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <Stack spacing={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#FFFBEB', color: '#F59E0B' }}>
                  <IconStarFilled size={14} />
                </Avatar>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  Rate this lesson
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mb: 1.25 }}>
                Your feedback helps your teacher improve future lessons.
              </Typography>
              <Rating
                value={ratingValue}
                precision={1}
                disabled={ratingBusy}
                onChange={(_, value) => {
                  if (value) handleRate(value);
                }}
              />
              {ratingBusy && (
                <Stack direction="row" spacing={0.75} alignItems="center" mt={0.75}>
                  <CircularProgress size={12} />
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Saving…</Typography>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card sx={cardSx}>
            <CardContent>
              {lessonNoteId ? (
                <ForumThread modelId={lessonNoteId} height={360} />
              ) : (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(37,99,235,0.1)',
                        color: '#2563EB',
                      }}
                    >
                      <IconMessageCircle2 size={15} />
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>Class Interaction</Typography>
                  </Stack>
                  <Alert severity="info" icon={<IconSparkles size={16} />} sx={{ borderRadius: '8px' }}>
                    The discussion thread will appear once this lesson is published.
                  </Alert>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* ── Reading-mode dialog ───────────────────────────────────────── */}
      <Dialog
        open={readingDialogOpen}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown
        slotProps={{ paper: { sx: { borderRadius: '16px', overflow: 'hidden' } } }}
      >
        <Box sx={{ height: 4, bgcolor: '#16A34A' }} />
        <DialogTitle sx={{ textAlign: 'center', pt: 2.5 }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: '#DCFCE7', color: '#16A34A', mx: 'auto', mb: 1 }}>
            <IconChecks size={22} />
          </Avatar>
          <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Just a Moment</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', textAlign: 'center', mb: 2 }}>
            Which of these applies to you?
          </Typography>
          <RadioGroup value={readingChoice} onChange={(e) => setReadingChoice(e.target.value)}>
            <FormControlLabel
              value="Ahead"
              control={<Radio />}
              label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>I am reading ahead of the class</Typography>}
              sx={{
                m: 0,
                mb: 1,
                px: 1.5,
                py: 1,
                borderRadius: '10px',
                border: '1px solid',
                borderColor: readingChoice === 'Ahead' ? '#16A34A' : 'divider',
                bgcolor: readingChoice === 'Ahead' ? 'rgba(22,163,74,0.06)' : 'transparent',
              }}
            />
            <FormControlLabel
              value="After"
              control={<Radio />}
              label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>I am reading after the class</Typography>}
              sx={{
                m: 0,
                px: 1.5,
                py: 1,
                borderRadius: '10px',
                border: '1px solid',
                borderColor: readingChoice === 'After' ? '#16A34A' : 'divider',
                bgcolor: readingChoice === 'After' ? 'rgba(22,163,74,0.06)' : 'transparent',
              }}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2.5 }}>
          <Button onClick={() => setReadingDialogOpen(false)} disabled={savingReading} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveReadingMode}
            disabled={savingReading}
            sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
          >
            {savingReading ? <CircularProgress size={16} color="inherit" /> : 'Save and Proceed'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StudentLessonNoteView;
