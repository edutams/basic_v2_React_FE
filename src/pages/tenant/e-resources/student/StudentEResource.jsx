import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconBooks,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconPlayerPlay,
  IconRefresh,
  IconSchool,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantStudentApi } from '@/api/tenant/e-resources/studentApi';
import { tenantAssessmentApi } from '@/api/tenant/e-resources/assessmentApi';
import { fetchWeeks } from '@/api/tenant/term-weeks/weekApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'Lesson Notes' },
];

const LESSON_NOTE_ROUTE = '/e-resources/student/lesson-note';
const ASSESSMENT_ROUTE = '/e-resources/student/assessment';
const PROGRESS_ROUTE = '/e-resources/student/progress';

const isServiceUnavailable = (error) =>
  error?.response?.status === 503 ||
  error?.response?.data?.message === 'Assessment service unavailable';

const isQuizTaken = (quizVisitCount, qzSchemeId) => {
  if (!quizVisitCount) return false;
  if (typeof quizVisitCount === 'number') return quizVisitCount >= 1;
  return quizVisitCount.scheme_of_work_id === qzSchemeId;
};

const StudentEResource = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceDown, setServiceDown] = useState(false);
  const [hub, setHub] = useState(null);
  const [subjectsData, setSubjectsData] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [outline, setOutline] = useState(null);
  const [quizVisitCount, setQuizVisitCount] = useState(null);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [openWeekIndex, setOpenWeekIndex] = useState(0);

  const subjects = useMemo(
    () => subjectsData?.subjects_with_lessons ?? [],
    [subjectsData],
  );

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.subject_id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  );

  const groupedOutline = useMemo(() => {
    if (!Array.isArray(outline)) return [];
    const weeksMap = [];
    outline.forEach((item) => {
      let week = weeksMap.find((w) => w.week_name === item.week_name);
      if (!week) {
        week = { week_name: item.week_name, topics: [] };
        weeksMap.push(week);
      }
      let topic = week.topics.find((t) => t.topic === item.topic);
      if (!topic) {
        topic = { topic: item.topic, subtopics: [] };
        week.topics.push(topic);
      }
      topic.subtopics.push(item);
    });
    return weeksMap;
  }, [outline]);

  const loadHub = useCallback(async () => {
    setLoading(true);
    setError('');
    setServiceDown(false);
    try {
      const index = await tenantStudentApi.getIndex();
      if (index?.userStatus !== 'Student') {
        setHub(index);
        setLoading(false);
        return;
      }
      setHub(index);
      const [subjectsRes, weeksRes] = await Promise.all([
        tenantStudentApi.getSubjectsWithAssessments({
          userId: index.userId,
          session_term: index.termId,
        }),
        fetchWeeks(index.termId).catch(() => ({ data: [] })),
      ]);
      setSubjectsData(subjectsRes);
      const weeksBody = Array.isArray(weeksRes) ? weeksRes : weeksRes?.data ?? [];
      setWeeks(Array.isArray(weeksBody) ? weeksBody : []);
    } catch (err) {
      if (isServiceUnavailable(err)) {
        setServiceDown(true);
      } else {
        setError(err?.response?.data?.message || 'Failed to load your e-resources');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHub();
  }, [loadHub]);

  const loadOutline = useCallback(
    async (subjectId) => {
      if (!hub) return;
      setSelectedSubjectId(subjectId);
      setOutlineLoading(true);
      setOutline(null);
      setQuizVisitCount(null);
      setOpenWeekIndex(0);
      try {
        const res = await tenantAssessmentApi.getSubjectAssessment({
          subId: subjectId,
          classProgId: hub.classProgId,
          termId: hub.termId,
        });
        const lessons = Array.isArray(res) ? res[0] : [];
        const visit = Array.isArray(res) ? res[1] : null;
        setOutline(Array.isArray(lessons) ? lessons : []);
        setQuizVisitCount(visit ?? null);
      } catch (err) {
        if (isServiceUnavailable(err)) {
          notify.error('Assessment service is temporarily unavailable. Please try again shortly.');
        } else {
          notify.error(err?.response?.data?.message || 'Failed to load subject outline');
        }
      } finally {
        setOutlineLoading(false);
      }
    },
    [hub, notify],
  );

  const openLessonNote = (sub) => {
    const params = new URLSearchParams({
      schemeOfWorkId: String(sub.scheme_of_work_id),
      subjectId: String(sub.subject_id ?? selectedSubjectId ?? ''),
      classProgId: String(hub?.classProgId ?? ''),
      weekId: String(sub.week_id ?? ''),
      sessionTermId: String(hub?.termId ?? ''),
      classArmId: String(subjectsData?.cd_id ?? ''),
      userId: String(hub?.userId ?? ''),
      subjectName: selectedSubject?.subject_name ?? '',
      weekName: sub.week_name ?? '',
    });
    navigate(`${LESSON_NOTE_ROUTE}?${params.toString()}`);
  };

  const openAssessment = (sub) => {
    const params = new URLSearchParams({
      mode: 'lesson',
      sow: String(sub.scheme_of_work_id),
      weekId: String(sub.week_id ?? ''),
      subjectId: String(sub.subject_id ?? selectedSubjectId ?? ''),
      classProgId: String(hub?.classProgId ?? ''),
      sessTermId: String(hub?.termId ?? ''),
      subjectName: selectedSubject?.subject_name ?? '',
    });
    navigate(`${ASSESSMENT_ROUTE}?${params.toString()}`);
  };

  const openWeeklyAssessment = (week) => {
    const params = new URLSearchParams({
      mode: 'weekly',
      weekId: String(week.id),
      classProgId: String(hub?.classProgId ?? ''),
      weekName: week.week_name ?? '',
    });
    navigate(`${ASSESSMENT_ROUTE}?${params.toString()}`);
  };

  if (loading) {
    return (
      <PageContainer title="E-Resources" description="Student lesson notes and assessments">
        <Breadcrumb title="Lesson Notes" items={BCrumb} />
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={90} />
          <Grid container spacing={2}>
            {[0, 1, 2].map((i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rounded" height={180} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={240} />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="E-Resources" description="Student lesson notes and assessments">
      <Breadcrumb title="Lesson Notes" items={BCrumb} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={loadHub}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {serviceDown && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={<Button onClick={loadHub}>Retry</Button>}
        >
          Some services are temporarily unavailable. Please try again shortly.
        </Alert>
      )}

      {hub && hub.userStatus !== 'Student' && (
        <Alert severity="info">
          E-Resources lesson notes are available to students only. Your account is registered as{' '}
          {hub.userStatus}.
        </Alert>
      )}

      {hub?.userStatus === 'Student' && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconSchool size={22} stroke={1.7} />
                    <Typography variant="h6">{hub.className}</Typography>
                    {hub.armName && <Chip size="small" label={hub.armName} />}
                    {hub.progCode && <Chip size="small" variant="outlined" label={hub.progCode} />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {subjects.length} registered subject{subjects.length === 1 ? '' : 's'} for the
                    active term
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<IconRefresh size={16} />}
                      onClick={loadHub}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<IconBooks size={16} />}
                      onClick={() => navigate(PROGRESS_ROUTE)}
                    >
                      My Progress
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 9 }}>
              <Card sx={{ mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: theme.palette.primary.main,
                    color: 'primary.contrastText',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Subjects with Lesson Analysis
                  </Typography>
                </Box>
                <CardContent>
                  {subjects.length === 0 ? (
                    <Alert severity="info">No Record Found</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {subjects.map((sub) => {
                        const noteReads = sub.report_counts?.['lesson-note'] ?? 0;
                        const videoViews = sub.report_counts?.['video-content'] ?? 0;
                        const isSelected = sub.subject_id === selectedSubjectId;
                        return (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sub.subject_id}>
                            <Card
                              variant="outlined"
                              sx={{
                                height: '100%',
                                cursor: 'pointer',
                                borderColor: isSelected ? 'primary.main' : undefined,
                                borderWidth: isSelected ? 2 : 1,
                              }}
                              onClick={() => loadOutline(sub.subject_id)}
                            >
                              <CardContent sx={{ pb: 1.5 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  textTransform="uppercase"
                                  gutterBottom
                                >
                                  {sub.subject_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Total Topics: {sub.topic_count}
                                </Typography>
                                <Box mt={1}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={sub.topic_count > 0 ? (noteReads / sub.topic_count) * 100 : 0}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                  <Typography variant="caption" display="block" mt={0.5}>
                                    {noteReads} lesson note visit{noteReads === 1 ? '' : 's'}
                                  </Typography>
                                </Box>
                                <Divider sx={{ my: 1.25 }} />
                                <Typography variant="caption" color="text.secondary">
                                  Video views: {videoViews}
                                </Typography>
                                <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                                  {(sub.lesson_contents ?? []).map((lc) => (
                                    <Chip
                                      key={`${sub.subject_id}-${lc.week_id}`}
                                      size="small"
                                      variant="outlined"
                                      label={lc.week_name || `Week ${lc.week_id}`}
                                    />
                                  ))}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </CardContent>
              </Card>

              {selectedSubject && (
                <Card>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: theme.palette.primary.main,
                      color: 'primary.contrastText',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {selectedSubject.subject_name} Outline
                    </Typography>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => loadOutline(selectedSubject.subject_id)}
                      startIcon={<IconRefresh size={14} />}
                    >
                      Reload
                    </Button>
                  </Box>
                  <CardContent>
                    {outlineLoading && (
                      <Stack alignItems="center" py={4}>
                        <CircularProgress size={28} />
                      </Stack>
                    )}
                    {!outlineLoading && groupedOutline.length === 0 && (
                      <Alert severity="info">No outline available for this subject yet.</Alert>
                    )}
                    {!outlineLoading &&
                      groupedOutline.map((week, weekIdx) => (
                        <Box key={week.week_name || weekIdx} mb={1.5}>
                          <Button
                            fullWidth
                            color="inherit"
                            onClick={() =>
                              setOpenWeekIndex(openWeekIndex === weekIdx ? null : weekIdx)
                            }
                            endIcon={
                              openWeekIndex === weekIdx ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
                            }
                            sx={{ justifyContent: 'space-between', textTransform: 'none', fontWeight: 700 }}
                          >
                            {week.week_name} Outline
                          </Button>
                          <Collapse in={openWeekIndex === weekIdx}>
                            <Box pl={3} pt={0.5}>
                              {week.topics.map((topic, tIdx) => (
                                <Box key={`${topic.topic}-${tIdx}`} mb={1.5}>
                                  <Typography variant="caption" fontWeight={700} textTransform="uppercase">
                                    Topic: {topic.topic}
                                  </Typography>
                                  <List dense disablePadding>
                                    {topic.subtopics.map((sub, sIdx) => {
                                      const taken = isQuizTaken(quizVisitCount, sub.qz_scheme_of_work_id);
                                      return (
                                        <ListItemButton
                                          key={`${sub.scheme_of_work_id}-${sIdx}`}
                                          sx={{ border: '1px solid', borderColor: 'divider', mb: 0.75, borderRadius: 1 }}
                                          alignItems="flex-start"
                                        >
                                          <ListItemText
                                            primary={
                                              <Typography variant="body2" fontWeight={600}>
                                                Lesson {sIdx + 1}: {sub.subtopic}
                                              </Typography>
                                            }
                                          />
                                          <Stack direction="row" spacing={0.75} flexShrink={0}>
                                            {sub.lesson_id != null && (
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openLessonNote(sub);
                                                }}
                                              >
                                                View Note
                                              </Button>
                                            )}
                                            {sub.qz_scheme_of_work_id != null && (
                                              <Button
                                                size="small"
                                                variant={taken ? 'outlined' : 'contained'}
                                                disabled={taken}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openAssessment(sub);
                                                }}
                                              >
                                                {taken ? 'Formative Taken' : 'Take Formative'}
                                              </Button>
                                            )}
                                          </Stack>
                                        </ListItemButton>
                                      );
                                    })}
                                  </List>
                                </Box>
                              ))}
                            </Box>
                          </Collapse>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <Box sx={{ p: 1.5, bgcolor: 'success.main', color: 'success.contrastText' }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Take Weekly Assessment
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'warning.light', border: '1px dashed', borderColor: 'warning.dark' }}>
                  <Typography variant="caption">
                    <b>Note:</b> You must finish the previous assessment before you can assess the
                    next.
                  </Typography>
                </Box>
                <CardContent sx={{ pt: 1 }}>
                  {weeks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No weeks available yet.
                    </Typography>
                  ) : (
                    <Stack spacing={0.75}>
                      {weeks.map((week) => (
                        <Button
                          key={week.id}
                          fullWidth
                          variant="outlined"
                          startIcon={<IconPlayerPlay size={15} />}
                          onClick={() => openWeeklyAssessment(week)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          {week.week_name} Assessment
                        </Button>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {selectedSubject && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <IconFileText size={18} />
                      <Typography variant="subtitle2">{selectedSubject.subject_name}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSubject.topic_count} unique topics across{' '}
                      {(selectedSubject.lesson_contents ?? []).length} week
                      {(selectedSubject.lesson_contents ?? []).length === 1 ? '' : 's'}.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </PageContainer>
  );
};

export default StudentEResource;
