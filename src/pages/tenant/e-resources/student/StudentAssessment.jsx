import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconClipboardCheck,
  IconMoodHappy,
  IconRotateClockwise,
  IconTrophy,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantAssessmentApi } from '@/api/tenant/e-resources/assessmentApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'Assessment' },
];

const HUB_ROUTE = '/e-resources/student';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const isServiceUnavailable = (error) =>
  error?.response?.status === 503 ||
  error?.response?.data?.message === 'Assessment service unavailable';

const parseOptions = (options) => {
  try {
    const parsed = typeof options === 'string' ? JSON.parse(options) : options;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const cardSx = (isDark) => ({
  borderRadius: '14px',
  border: '1px solid',
  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
});

const StudentAssessment = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') || 'weekly';
  const weekId = searchParams.get('weekId');
  const classProgId = searchParams.get('classProgId');
  const schemeOfWorkId = searchParams.get('sow');
  const subjectId = searchParams.get('subjectId');
  const sessTermId = searchParams.get('sessTermId');
  const subjectName = searchParams.get('subjectName') || '';
  const weekName = searchParams.get('weekName') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [missingReference, setMissingReference] = useState(false);
  const [serviceDown, setServiceDown] = useState(false);
  const [quizMeta, setQuizMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [optionOrders, setOptionOrders] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const deadlineRef = useRef(null);

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id]).length,
    [questions, answers],
  );

  const buildOptionOrders = useCallback((questionsList, enableRandom) => {
    const orders = {};
    questionsList.forEach((q) => {
      const opts = parseOptions(q.options);
      const indices = opts.map((_, i) => i);
      orders[q.id] = enableRandom === 'yes' ? shuffle(indices) : indices;
    });
    setOptionOrders(orders);
  }, []);

  const applyQuizPayload = useCallback((quiz, questionsList) => {
    const meta = Array.isArray(quiz) ? quiz[0] ?? null : quiz ?? null;
    const list = Array.isArray(questionsList) ? questionsList : meta?.questions ?? [];
    setQuizMeta(meta);
    setQuestions(list);
    buildOptionOrders(list, meta?.enable_random);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setReportData(null);
    const duration = Number(meta?.duration ?? 0);
    if (duration > 0) {
      deadlineRef.current = Date.now() + duration * 60000;
      setRemainingSeconds(duration * 60);
    } else {
      deadlineRef.current = null;
      setRemainingSeconds(null);
    }
  }, [buildOptionOrders]);

  const loadQuiz = useCallback(async () => {
    setMissingReference(false);
    if (mode === 'lesson' && !schemeOfWorkId) {
      setMissingReference(true);
      setError('This lesson assessment link is missing required information.');
      setLoading(false);
      return;
    }
    if (mode === 'weekly' && (!weekId || !classProgId)) {
      setMissingReference(true);
      setError(
        !weekId
          ? 'This weekly assessment link is missing the week reference.'
          : 'This weekly assessment link is missing your class/programme reference.',
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setServiceDown(false);
    try {
      if (mode === 'lesson') {
        const res = await tenantAssessmentApi.getStudentAssessment(schemeOfWorkId, weekId);
        applyQuizPayload(res?.quizProp, res?.quizProp?.questions);
      } else {
        tenantAssessmentApi.attemptQuiz(weekId).catch(() => {});
        const res = await tenantAssessmentApi.getRandomAssessment(weekId, classProgId);
        applyQuizPayload(res?.quizProp, res?.quizQuestion);
      }
    } catch (err) {
      if (isServiceUnavailable(err)) {
        setServiceDown(true);
      } else {
        setError(err?.response?.data?.message || 'Failed to load assessment');
      }
    } finally {
      setLoading(false);
    }
  }, [mode, schemeOfWorkId, weekId, classProgId, applyQuizPayload]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (submitted || deadlineRef.current === null) return undefined;
    const timer = setInterval(() => {
      const left = Math.max(
        0,
        Math.round((deadlineRef.current - Date.now()) / 1000),
      );
      setRemainingSeconds(left);
      if (left <= 1) {
        clearInterval(timer);
        setConfirmOpen(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [quizMeta, submitted]);

  const currentQuestion = questions[currentIdx] ?? null;
  const currentOptions = useMemo(
    () => parseOptions(currentQuestion?.options),
    [currentQuestion],
  );
  const currentOrder = currentQuestion ? optionOrders[currentQuestion.id] ?? [] : [];

  const selectAnswer = (question, originalIndex, text) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { chosen: originalIndex, text },
    }));
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const res = await tenantAssessmentApi.submitReport({
        weekId: weekId ? Number(weekId) : null,
        subjectId: subjectId ? Number(subjectId) : null,
        class_prog_id: classProgId ? Number(classProgId) : null,
        sessTermId: sessTermId ? Number(sessTermId) : null,
        topic_reference_id: quizMeta?.topic_reference_id ?? null,
      });
      setReportData(res);
      setSubmitted(true);
      notify.success('Assessment submitted successfully');
    } catch (err) {
      if (isServiceUnavailable(err)) {
        notify.error('Assessment service is temporarily unavailable. Please try again.');
      } else {
        notify.error(err?.response?.data?.message || 'Failed to submit assessment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = async () => {
    if (mode !== 'lesson' || !schemeOfWorkId) {
      loadQuiz();
      return;
    }
    setRetaking(true);
    try {
      const res = await tenantAssessmentApi.retakeAssessment(schemeOfWorkId, weekId);
      applyQuizPayload(res?.quizProp, res?.quizProp?.questions);
      notify.success('You can now retake this formative');
    } catch (err) {
      if (isServiceUnavailable(err)) {
        notify.error('Assessment service is temporarily unavailable. Please try again.');
      } else {
        notify.error(err?.response?.data?.message || 'Unable to retake assessment');
      }
    } finally {
      setRetaking(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timerScheme =
    remainingSeconds === null
      ? null
      : remainingSeconds <= 60
        ? { bg: '#FEE2E2', color: '#991B1B' }
        : remainingSeconds <= 120
          ? { bg: '#FFEDD5', color: '#9A3412' }
          : { bg: '#DCFCE7', color: '#166534' };

  const title = subjectName || weekName || 'Assessment';
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  return (
    <PageContainer title="Take Assessment" description="Weekly and lesson formative assessments">
      <Breadcrumb title={title} items={BCrumb} />

      {loading && (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: '14px' }} />
          <Skeleton variant="rounded" height={340} sx={{ borderRadius: '14px' }} />
        </Stack>
      )}

      {!loading && serviceDown && (
        <Paper elevation={0} sx={{ ...cardSx(isDark), p: 3, textAlign: 'center' }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: '#FFEDD5', color: '#EA580C', mx: 'auto', mb: 1.5 }}>
            <IconAlertTriangle size={26} />
          </Avatar>
          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 0.5 }}>
            Assessment service is temporarily unavailable
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 2 }}>
            Please try again in a moment.
          </Typography>
          <Button variant="contained" onClick={loadQuiz} sx={{ borderRadius: '8px', fontWeight: 700 }}>
            Retry
          </Button>
        </Paper>
      )}

      {!loading && error && (
        <Paper
          elevation={0}
          sx={{
            ...cardSx(isDark),
            p: 3,
            textAlign: 'center',
            borderColor: missingReference ? '#FECACA' : undefined,
            bgcolor: missingReference ? (isDark ? 'rgba(220,38,38,0.08)' : '#FEF2F2') : undefined,
          }}
        >
          <Avatar sx={{ width: 52, height: 52, bgcolor: '#FEE2E2', color: '#DC2626', mx: 'auto', mb: 1.5 }}>
            <IconAlertTriangle size={26} />
          </Avatar>
          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 0.5 }}>
            {missingReference ? 'This assessment link looks incomplete' : 'Could not load this assessment'}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 2, maxWidth: 420, mx: 'auto' }}>
            {error}
            {missingReference &&
              ' Go back and open the assessment again from the weekly or lesson list — the link it uses should carry everything this page needs.'}
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button variant="outlined" startIcon={<IconArrowLeft size={15} />} onClick={() => navigate(HUB_ROUTE)} sx={{ borderRadius: '8px', fontWeight: 600 }}>
              Back to E-Resources
            </Button>
            {!missingReference && (
              <Button variant="contained" onClick={loadQuiz} sx={{ borderRadius: '8px', fontWeight: 700 }}>
                Retry
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {!loading && !error && !serviceDown && questions.length === 0 && !submitted && (
        <Paper elevation={0} sx={{ ...cardSx(isDark), p: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#DCFCE7', color: '#16A34A', mx: 'auto', mb: 1.5 }}>
            <IconMoodHappy size={28} />
          </Avatar>
          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 0.5 }}>Nothing to do here yet</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 2 }}>
            No formative assessment has been set for this {mode === 'weekly' ? 'week' : 'lesson'} yet. Enjoy your break!
          </Typography>
          <Button variant="outlined" startIcon={<IconArrowLeft size={15} />} onClick={() => navigate(HUB_ROUTE)} sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Back to E-Resources
          </Button>
        </Paper>
      )}

      {!loading && !error && !serviceDown && (questions.length > 0 || submitted) && (
        <Paper
          elevation={0}
          sx={{
            ...cardSx(isDark),
            mb: 2,
            overflow: 'hidden',
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
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                  <IconClipboardCheck size={19} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.2 }}>
                    {mode === 'weekly' ? `${weekName ? `${weekName} ` : ''}Weekly Assessment` : 'Formative Assessment'}
                  </Typography>
                  {subjectName && (
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{subjectName}</Typography>
                  )}
                </Box>
                {questions.length > 0 && (
                  <Chip
                    size="small"
                    label={`Question ${Math.min(currentIdx + 1, questions.length)} / ${questions.length}`}
                    sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: '#DBEAFE', color: '#1E40AF' }}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {timerScheme && !submitted && (
                  <Chip
                    icon={<IconClock size={14} color={timerScheme.color} />}
                    label={formatTime(remainingSeconds)}
                    sx={{ fontWeight: 800, fontSize: 12, bgcolor: timerScheme.bg, color: timerScheme.color }}
                  />
                )}
                {!submitted && questions.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    disabled={submitting}
                    onClick={() => setConfirmOpen(true)}
                    sx={{ borderRadius: '8px', fontWeight: 700 }}
                  >
                    {submitting ? <CircularProgress size={16} color="inherit" /> : 'Submit'}
                  </Button>
                )}
                <Button
                  size="small"
                  startIcon={<IconArrowLeft size={14} />}
                  onClick={() => navigate(HUB_ROUTE)}
                  sx={{ fontWeight: 600 }}
                >
                  Exit
                </Button>
              </Stack>
            </Stack>
            {questions.length > 0 && (
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  mt: 1.5,
                  height: 7,
                  borderRadius: 4,
                  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                  '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 4 },
                }}
              />
            )}
          </Box>
        </Paper>
      )}

      {!loading && !error && !serviceDown && submitted && (
        <Card sx={cardSx(isDark)}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', color: '#16A34A' }}>
                <IconTrophy size={24} />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 16 }}>Assessment Completed</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  Your responses have been recorded
                  {reportData?.weekId ? ` for week reference ${reportData.weekId}` : ''}.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2.5 }}>
              <Box sx={{ ...cardSx(isDark), p: 1.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#2563EB' }}>
                  {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}%
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 600 }}>Answered</Typography>
              </Box>
              <Box sx={{ ...cardSx(isDark), p: 1.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#9333EA' }}>{questions.length}</Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 600 }}>Questions</Typography>
              </Box>
              <Box sx={{ ...cardSx(isDark), p: 1.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#16A34A' }}>{answeredCount}</Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 600 }}>Responded</Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<IconRotateClockwise size={16} />}
                disabled={retaking}
                onClick={handleRetake}
                sx={{ borderRadius: '8px', fontWeight: 600 }}
              >
                {retaking ? <CircularProgress size={16} color="inherit" /> : 'Retake Assessment'}
              </Button>
              <Button variant="contained" onClick={() => navigate(HUB_ROUTE)} sx={{ borderRadius: '8px', fontWeight: 700 }}>
                Back to E-Resources
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!loading && !error && !serviceDown && !submitted && currentQuestion && (
        <Card sx={cardSx(isDark)}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Chip
                size="small"
                label={`${currentQuestion.mark ?? 1} Mark${(currentQuestion.mark ?? 1) === 1 ? '' : 's'}`}
                sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: '#F3E8FF', color: '#7C3AED' }}
              />
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                Question {currentIdx + 1} of {questions.length}
              </Typography>
            </Stack>
            <Box
              sx={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.5, mb: 2 }}
              dangerouslySetInnerHTML={{ __html: currentQuestion.question ?? '' }}
            />
            <Stack spacing={1}>
              {currentOrder.map((originalIndex, displayIdx) => {
                const option = currentOptions[originalIndex];
                if (!option) return null;
                const selected = answers[currentQuestion.id]?.chosen === originalIndex;
                return (
                  <Box
                    key={originalIndex}
                    onClick={() => selectAnswer(currentQuestion, originalIndex, option.text)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      p: 1.25,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selected ? '#2563EB' : isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                      bgcolor: selected ? (isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF') : 'transparent',
                      transition: 'all 150ms ease',
                      '&:hover': {
                        borderColor: '#2563EB',
                        bgcolor: isDark ? 'rgba(37,99,235,0.06)' : '#F8FAFF',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: 11.5,
                        fontWeight: 800,
                        bgcolor: selected ? '#2563EB' : isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                        color: selected ? '#fff' : '#64748B',
                        flexShrink: 0,
                      }}
                    >
                      {OPTION_LABELS[displayIdx] ?? displayIdx + 1}
                    </Avatar>
                    <Typography
                      component="span"
                      sx={{ fontSize: 13, color: '#1e293b', flex: 1 }}
                      dangerouslySetInnerHTML={{ __html: option.text ?? '' }}
                    />
                    {selected && <IconCheck size={18} color="#2563EB" style={{ flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Stack>
            <Stack direction="row" justifyContent="space-between" mt={2.5}>
              <Button
                startIcon={<IconArrowLeft size={16} />}
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((idx) => Math.max(0, idx - 1))}
                sx={{ borderRadius: '8px', fontWeight: 600 }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                endIcon={<IconArrowRight size={16} />}
                disabled={currentIdx >= questions.length - 1}
                onClick={() => setCurrentIdx((idx) => Math.min(questions.length - 1, idx + 1))}
                sx={{ borderRadius: '8px', fontWeight: 700 }}
              >
                Next
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!loading && !submitted && questions.length > 0 && (
        <Card sx={{ ...cardSx(isDark), mt: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>Question Navigator</Typography>
              <Stack direction="row" spacing={1.5}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#16A34A' }} />
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Answered</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#2563EB' }} />
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Current</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', border: '1px solid #CBD5E1' }} />
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Unanswered</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = Boolean(answers[q.id]);
                return (
                  <Box
                    key={q.id}
                    component="button"
                    onClick={() => setCurrentIdx(idx)}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '9px',
                      border: '1px solid',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                      borderColor: isCurrent ? '#2563EB' : isAnswered ? '#16A34A' : isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB',
                      bgcolor: isCurrent ? '#2563EB' : isAnswered ? '#DCFCE7' : 'transparent',
                      color: isCurrent ? '#fff' : isAnswered ? '#166534' : '#64748B',
                    }}
                  >
                    {idx + 1}
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#FFEDD5', color: '#EA580C' }}>
              <IconAlertTriangle size={20} />
            </Avatar>
            <Typography sx={{ fontWeight: 800, fontSize: 15 }}>End Assessment?</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 1 }}>
            Are you sure you want to submit your answers? You have responded to{' '}
            <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ fontWeight: 600 }}>
            No, Continue
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ borderRadius: '8px', fontWeight: 700 }}
          >
            {submitting ? <CircularProgress size={16} color="inherit" /> : 'Yes, Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StudentAssessment;
