import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  FormControlLabel,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  IconArrowLeft,
  IconChecks,
  IconFileText,
  IconPlayerPlay,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantStudentApi } from '@/api/tenant/e-resources/studentApi';
import { tenantForumApi, tenantSharedApi } from '@/api/tenant/e-resources/browseApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'Lesson Note' },
];

const ASSESSMENT_ROUTE = '/e-resources/student/assessment';

const forumGetMessages = tenantForumApi.getMessages || tenantForumApi.list;
const forumSendMessage = tenantForumApi.sendMessage || tenantForumApi.send;
const sharedGetRatings = tenantSharedApi.getRatings || tenantSharedApi.getLessonRatings;
const sharedRateLesson = tenantSharedApi.rateLesson || tenantSharedApi.rateLessons;

const parseChatMessage = (raw) => {
  if (!raw) return { text: '', media: '' };
  if (typeof raw === 'object') return { text: raw.text ?? '', media: raw.media ?? '' };
  try {
    const parsed = JSON.parse(raw);
    return { text: parsed?.text ?? '', media: parsed?.media ?? '' };
  } catch {
    return { text: String(raw), media: '' };
  }
};

const contentItems = (content) => {
  if (!content) return [];
  const list = Array.isArray(content) ? content : [content];
  return list.filter(Boolean);
};

const renderContentItem = (item, key) => {
  const src = typeof item === 'string' ? item : item?.url ?? item?.path ?? '';
  if (!src) return null;
  const lower = src.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return (
      <Paper key={key} variant="outlined" sx={{ height: 700, overflow: 'hidden' }}>
        <iframe title={`lesson-${key}`} src={src} width="100%" height="100%" style={{ border: 0 }} />
      </Paper>
    );
  }
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) {
    return (
      <Paper key={key} variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
        <Box component="img" src={src} alt="" sx={{ maxWidth: '100%', maxHeight: 700 }} />
      </Paper>
    );
  }
  return (
    <Button
      key={key}
      variant="outlined"
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<IconFileText size={16} />}
      sx={{ mb: 1 }}
    >
      Open lesson document
    </Button>
  );
};

const StudentLessonNoteView = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [searchParams] = useSearchParams();

  const schemeOfWorkId = searchParams.get('schemeOfWorkId');
  const subjectId = searchParams.get('subjectId');
  const classProgId = searchParams.get('classProgId');
  const weekId = searchParams.get('weekId');
  const sessionTermId = searchParams.get('sessionTermId');
  const classArmId = searchParams.get('classArmId');
  const authUserId = searchParams.get('userId');
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
  const [messages, setMessages] = useState([]);
  const [forumBusy, setForumBusy] = useState(false);
  const [forumText, setForumText] = useState('');
  const [sending, setSending] = useState(false);

  const lessonNote = useMemo(() => {
    const notes = contentData?.lessonNote;
    return Array.isArray(notes) && notes.length > 0 ? notes[0] : null;
  }, [contentData]);

  const lesson = contentData?.lesson ?? null;
  const lessonNoteId = lesson?.lesson_id ?? null;

  const loadContent = useCallback(async () => {
    if (!schemeOfWorkId) {
      setError('Missing lesson reference.');
      setLoading(false);
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
  }, [schemeOfWorkId, sessionTermId, subjectId, classProgId, weekId]);

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

  const loadForum = useCallback(async () => {
    if (!lessonNoteId || !forumGetMessages) return;
    setForumBusy(true);
    try {
      const res = await forumGetMessages({
        model_id: lessonNoteId,
        scope: 'lessonNote',
      });
      setMessages(Array.isArray(res) ? res : []);
    } catch {
      setMessages([]);
    } finally {
      setForumBusy(false);
    }
  }, [lessonNoteId]);

  useEffect(() => {
    loadForum();
    if (!lessonNoteId) return undefined;
    const timer = setInterval(loadForum, 15000);
    return () => clearInterval(timer);
  }, [loadForum, lessonNoteId]);

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

  const handleSendForumMessage = async () => {
    const text = forumText.trim();
    if (!text || !lessonNoteId || !forumSendMessage) return;
    setSending(true);
    try {
      await forumSendMessage({
        model_id: lessonNoteId,
        scope: 'lessonNote',
        message: text,
      });
      setForumText('');
      await loadForum();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Unable to send message');
    } finally {
      setSending(false);
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

  return (
    <PageContainer title="Lesson Note" description="View your lesson note content">
      <Breadcrumb title={subjectName || 'Lesson Note'} items={BCrumb} />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                startIcon={<IconArrowLeft size={15} />}
                onClick={() => navigate('/e-resources/student')}
              >
                Back
              </Button>
              {weekName && <Chip label={weekName} size="small" />}
              {meta?.student_name && (
                <Typography variant="body2" color="text.secondary">
                  {meta.student_name}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              {lessonNote?.qz_scheme_id != null && (
                <Button
                  variant="contained"
                  startIcon={<IconPlayerPlay size={15} />}
                  onClick={openAssessment}
                >
                  Take Assessment
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<IconRefresh size={15} />}
                onClick={loadContent}
              >
                Reload
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {unavailable && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={<Button color="inherit" onClick={loadContent}>Retry</Button>}
        >
          Lesson content service is temporarily unavailable. Please try again in a moment.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={loadContent}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={420} />
            </Stack>
          ) : (
            <>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Box>
                      {lessonNote?.topic && (
                        <Typography variant="subtitle2" textTransform="uppercase">
                          Topic: {lessonNote.topic}
                        </Typography>
                      )}
                      {lessonNote?.subtopic && (
                        <Typography variant="body2" color="text.secondary">
                          Sub-topic: {lessonNote.subtopic}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {lessonNote?.subject_teacher_id != null && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<IconChecks size={15} />}
                          disabled={marking}
                          onClick={handleMarkRead}
                        >
                          {marking ? 'Marking...' : 'Mark as Read'}
                        </Button>
                      )}
                      {lessonNote?.qz_scheme_id != null && (
                        <Button size="small" variant="contained" onClick={openAssessment}>
                          Take Formative
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                  {progress && (
                    <Box mt={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" fontWeight={700}>
                          Reading progress
                        </Typography>
                        <Typography variant="caption">
                          {progress.read_count}/{progress.total_subtopics} subtopics (
                          {progress.reading_progress_percent}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Number(progress.reading_progress_percent ?? 0)}
                        sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  {!unavailable && displayItems.length === 0 && (
                    <Alert severity="info">No content available for this lesson yet.</Alert>
                  )}
                  <Stack spacing={1.5}>
                    {displayItems.map((item, idx) => renderContentItem(item, idx))}
                  </Stack>
                </CardContent>
              </Card>
            </>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Rate this note
              </Typography>
              <Rating
                value={ratingValue}
                precision={1}
                disabled={ratingBusy}
                onChange={(_, value) => {
                  if (value) handleRate(value);
                }}
              />
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" gutterBottom>
                Class Interaction
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {messages.length} message{messages.length === 1 ? '' : 's'} on this lesson.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Lesson Forum</Typography>
                <IconButton size="small" onClick={loadForum} disabled={forumBusy}>
                  <IconRefresh size={16} />
                </IconButton>
              </Stack>
              <List
                sx={{
                  maxHeight: 360,
                  overflowY: 'auto',
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {messages.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No messages yet. Start the discussion.
                  </Typography>
                )}
                {messages.map((message) => {
                  const parsed = parseChatMessage(message.message);
                  const mine = authUserId
                    ? String(message.sender_id) === String(authUserId)
                    : false;
                  return (
                    <ListItem
                      key={message.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: mine ? 'flex-end' : 'flex-start',
                        px: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {message.user
                          ? `${message.user.fname ?? ''} ${message.user.lname ?? ''}`.trim()
                          : 'Participant'}
                      </Typography>
                      {parsed.media && (
                        <Box
                          sx={{ maxWidth: '100%', '& img, & video': { maxWidth: '100%' } }}
                          dangerouslySetInnerHTML={{ __html: parsed.media }}
                        />
                      )}
                      {parsed.text && (
                        <Paper
                          variant="outlined"
                          sx={{
                            px: 1,
                            py: 0.5,
                            mt: 0.25,
                            bgcolor: mine ? 'primary.light' : 'grey.100',
                            color: mine ? 'primary.contrastText' : 'text.primary',
                          }}
                        >
                          <Typography variant="body2">{parsed.text}</Typography>
                        </Paper>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {message.created_at
                          ? new Date(message.created_at).toLocaleString()
                          : ''}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
              {lessonNoteId && (
                <Stack direction="row" spacing={1} mt={1.5}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Type a message..."
                    value={forumText}
                    onChange={(e) => setForumText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendForumMessage();
                    }}
                  />
                  <Button
                    variant="contained"
                    disabled={sending || !forumText.trim()}
                    onClick={handleSendForumMessage}
                    startIcon={<IconSend size={15} />}
                  >
                    {sending ? <CircularProgress size={16} color="inherit" /> : 'Send'}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={readingDialogOpen}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{ sx: { borderTop: 4, borderColor: 'success.main' } }}
      >
        <DialogTitle fontWeight={700} textAlign="center">
          Just a Moment
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" textAlign="center" fontStyle="italic" mb={2}>
            Which of these applies to you?
          </Typography>
          <RadioGroup
            value={readingChoice}
            onChange={(e) => setReadingChoice(e.target.value)}
          >
            <FormControlLabel
              value="Ahead"
              control={<Radio />}
              label={<b>I am reading ahead of the class</b>}
            />
            <FormControlLabel
              value="After"
              control={<Radio />}
              label={<b>I am reading after the class</b>}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={() => setReadingDialogOpen(false)} disabled={savingReading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveReadingMode} disabled={savingReading}>
            {savingReading ? <CircularProgress size={16} color="inherit" /> : 'Save and Proceed'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StudentLessonNoteView;
