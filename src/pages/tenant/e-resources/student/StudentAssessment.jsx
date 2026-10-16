import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconPlayerPlay,
  IconRotateClockwise,
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

const OPTION_LABELS = ['(A)', '(B)', '(C)', '(D)', '(E)', '(F)', '(G)', '(H)'];

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

const StudentAssessment = () => {
  const navigate = useNavigate();
  const notify = useNotification();
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
    if (mode === 'lesson' && !schemeOfWorkId) {
      setError('Missing assessment reference.');
      setLoading(false);
      return;
    }
    if (mode === 'weekly' && (!weekId || !classProgId)) {
      setError('Missing weekly assessment reference.');
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

  const title = subjectName || weekName || 'Assessment';

  return (
    <PageContainer title="Take Assessment" description="Weekly and lesson formative assessments">
      <Breadcrumb title={title} items={BCrumb} />

      {loading && (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={70} />
          <Skeleton variant="rounded" height={320} />
        </Stack>
      )}

      {!loading && serviceDown && (
        <Alert
          severity="warning"
          action={<Button color="inherit" onClick={loadQuiz}>Retry</Button>}
        >
          Assessment service is temporarily unavailable. Please try again in a moment.
        </Alert>
      )}

      {!loading && error && (
        <Alert severity="error" action={<Button color="inherit" onClick={loadQuiz}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {!loading && !error && !serviceDown && questions.length === 0 && !submitted && (
        <Alert severity="info">No formative available for this week yet. Enjoy your break!</Alert>
      )}

      {!loading && !error && !serviceDown && (questions.length > 0 || submitted) && (
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
                  onClick={() => navigate(HUB_ROUTE)}
                >
                  Back
                </Button>
                <Typography variant="subtitle1" fontWeight={700}>
                  {mode === 'weekly'
                    ? `Take ${weekName ? `${weekName} ` : ''}Weekly Assessment`
                    : 'Take Formative'}
                </Typography>
                {questions.length > 0 && (
                  <Chip
                    size="small"
                    label={`Question ${Math.min(currentIdx + 1, questions.length)} / ${questions.length}`}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {remainingSeconds !== null && !submitted && (
                  <Chip
                    color={remainingSeconds <= 60 ? 'error' : 'success'}
                    variant="outlined"
                    label={`Time ${formatTime(remainingSeconds)}`}
                    icon={<IconPlayerPlay size={14} />}
                  />
                )}
                {!submitted && questions.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    disabled={submitting}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {submitting ? <CircularProgress size={16} color="inherit" /> : 'Submit'}
                  </Button>
                )}
              </Stack>
            </Stack>
            {questions.length > 0 && (
              <LinearProgress
                variant="determinate"
                value={((currentIdx + 1) / questions.length) * 100}
                sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && !serviceDown && submitted && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Assessment Completed
            </Typography>
            <Stack direction="row" spacing={4} divider={<Divider orientation="vertical" flexItem />}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {questions.length > 0
                    ? Math.round((answeredCount / questions.length) * 100)
                    : 0}
                  %
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Answered
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {questions.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Questions
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {answeredCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Responded
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Alert severity="success">
              Your responses have been recorded
              {reportData?.weekId ? ` for week reference ${reportData.weekId}` : ''}.
            </Alert>
            <Stack direction="row" spacing={1} mt={2}>
              <Button
                variant="outlined"
                startIcon={<IconRotateClockwise size={16} />}
                disabled={retaking}
                onClick={handleRetake}
              >
                {retaking ? <CircularProgress size={16} color="inherit" /> : 'Retake Assessment'}
              </Button>
              <Button variant="contained" onClick={() => navigate(HUB_ROUTE)}>
                Back to E-Resources
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!loading && !error && !serviceDown && !submitted && currentQuestion && (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Chip size="small" label={`${currentQuestion.mark ?? 1} Mark(s)`} color="primary" variant="outlined" />
              <Typography variant="caption" color="text.secondary">
                Question {currentIdx + 1} of {questions.length}
              </Typography>
            </Stack>
            <Box mb={2}>
              <Typography
                variant="subtitle1"
                component="div"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question ?? '' }}
              />
            </Box>
            <List>
              {currentOrder.map((originalIndex, displayIdx) => {
                const option = currentOptions[originalIndex];
                if (!option) return null;
                const selected = answers[currentQuestion.id]?.chosen === originalIndex;
                return (
                  <ListItemButton
                    key={originalIndex}
                    selected={selected}
                    onClick={() => selectAnswer(currentQuestion, originalIndex, option.text)}
                    sx={{
                      border: '1px solid',
                      borderColor: selected ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1}>
                          <Typography fontWeight={700}>
                            {OPTION_LABELS[displayIdx] ?? `${displayIdx + 1}.`}
                          </Typography>
                          <Typography
                            component="span"
                            dangerouslySetInnerHTML={{ __html: option.text ?? '' }}
                          />
                        </Stack>
                      }
                    />
                    {selected && <IconCheck size={18} color="currentColor" />}
                  </ListItemButton>
                );
              })}
            </List>
            <Stack
              direction="row"
              justifyContent="space-between"
              mt={2}
            >
              <Button
                startIcon={<IconArrowLeft size={16} />}
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((idx) => Math.max(0, idx - 1))}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                endIcon={<IconArrowRight size={16} />}
                disabled={currentIdx >= questions.length - 1}
                onClick={() =>
                  setCurrentIdx((idx) => Math.min(questions.length - 1, idx + 1))
                }
              >
                Next
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!loading && !submitted && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Question navigator
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {questions.map((q, idx) => (
                <Button
                  key={q.id}
                  size="small"
                  variant={idx === currentIdx ? 'contained' : 'outlined'}
                  color={answers[q.id] ? 'success' : 'primary'}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>End Assessment?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to submit your answers? You have responded to {answeredCount} of{' '}
            {questions.length} questions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>No, Continue</Button>
          <Button variant="contained" color="error" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={16} color="inherit" /> : 'Yes, Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StudentAssessment;
