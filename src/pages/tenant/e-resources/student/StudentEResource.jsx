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
  Collapse,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconActivity,
  IconBooks,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClipboardList,
  IconFileText,
  IconPlayerPlay,
  IconProgressCheck,
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

const cardSx = (isDark) => ({
  borderRadius: '14px',
  border: '1px solid',
  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
});

// Section header used across this page in place of the old flat colour bars
// — an icon badge + title reads calmer and matches the rest of e-resources.
const SectionHeader = ({ icon: Icon, title, subtitle, accent = '#2563EB', accentBg = '#DBEAFE', action }) => (
  <Box
    sx={{
      px: 2,
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      borderBottom: '1px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar sx={{ width: 34, height: 34, bgcolor: accentBg, color: accent, flexShrink: 0 }}>
        <Icon size={18} />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.1 }}>{subtitle}</Typography>
        )}
      </Box>
    </Stack>
    {action}
  </Box>
);

// Subject card — mirrors the teacher workspace's SubjectCard (tinted status
// header + accent left border + progress block + status banner + footer
// action) so the student and teacher lesson-note experiences read as one
// product instead of two different styles.
const StudentSubjectCard = ({ sub, isSelected, onOpen }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const noteReads = sub.report_counts?.['lesson-note'] ?? 0;
  const videoViews = sub.report_counts?.['video-content'] ?? 0;
  const topicCount = sub.topic_count || 0;
  const weeksCovered = (sub.lesson_contents ?? []).length;
  const percent = topicCount > 0 ? Math.min(100, Math.round((noteReads / topicCount) * 100)) : 0;
  const isComplete = percent >= 100;
  const isStarted = percent > 0;

  const accentColor = isComplete ? '#2E7D32' : isStarted ? '#1565C0' : '#E67E22';
  const headerTint = isComplete
    ? isDark ? 'rgba(46,125,50,0.14)' : '#DCEFDC'
    : isStarted
      ? isDark ? 'rgba(21,101,192,0.14)' : '#DCEAFB'
      : isDark ? 'rgba(230,126,34,0.16)' : '#FDF0E1';
  const statusLabel = isComplete ? 'Fully read' : isStarted ? 'In progress' : 'Not started';
  const statusColor = isComplete ? 'success' : isStarted ? 'primary' : 'warning';

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen(sub.subject_id)}
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderLeft: '4px solid',
        borderColor: isSelected ? '#2563EB' : isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
        borderLeftColor: accentColor,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 0 0 2px rgba(37,99,235,0.18), 0 4px 14px rgba(15,23,42,0.08)'
          : isDark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 8px 20px rgba(15,23,42,0.1)',
        },
      }}
    >
      {/* ── Top header — tinted by reading status ── */}
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
            label={`${weeksCovered} week${weeksCovered === 1 ? '' : 's'}`}
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
          title={sub.subject_name}
        >
          {sub.subject_name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.75 }}>
          <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Total topics: <strong>{topicCount}</strong>
          </Typography>
          <Chip
            label={statusLabel}
            size="small"
            color={statusColor}
            icon={isComplete ? <IconCheck size={12} /> : isStarted ? <IconProgressCheck size={12} /> : undefined}
            sx={{ fontWeight: 600, fontSize: '11px', height: '22px' }}
          />
        </Box>
      </Box>

      {/* ── Content — progress + secondary stat + status banner ── */}
      <Box sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: '0.775rem' }}>
              Lesson Note Progress
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontSize: '0.775rem' }}>
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
            {noteReads} of {topicCount} topics read
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
          <IconPlayerPlay size={13} color="#64748B" />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {videoViews} video view{videoViews === 1 ? '' : 's'}
          </Typography>
        </Stack>

        <Box
          sx={{
            py: 0.5,
            px: 1,
            borderRadius: '4px',
            backgroundColor: isComplete
              ? isDark ? 'rgba(76, 175, 80, 0.15)' : '#EAF4D8'
              : isStarted
                ? isDark ? 'rgba(33, 150, 243, 0.15)' : '#D7EEFD'
                : isDark ? 'rgba(230, 126, 34, 0.15)' : '#FDF0E1',
            textAlign: 'center',
            mt: 'auto',
          }}
        >
          <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: '0.725rem' }}>
            Reading status:{' '}
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

      {/* ── Footer action ── */}
      <Box sx={{ p: 1.25, pt: 1, borderTop: '1px solid', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6' }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          startIcon={<IconBooks size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(sub.subject_id);
          }}
          sx={{ fontWeight: 600, fontSize: '11px', textTransform: 'none', py: 0.5, borderRadius: '5px' }}
        >
          View Lesson Outline
        </Button>
      </Box>
    </Paper>
  );
};

const StudentEResource = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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

  // ── Page-level intelligence — a quick read on reading habits across all
  // registered subjects, shown as stat cards above the subject grid.
  const pageStats = useMemo(() => {
    const totalSubjects = subjects.length;
    const totalTopics = subjects.reduce((sum, s) => sum + (s.topic_count || 0), 0);
    const totalReads = subjects.reduce((sum, s) => sum + (s.report_counts?.['lesson-note'] ?? 0), 0);
    const totalVideoViews = subjects.reduce((sum, s) => sum + (s.report_counts?.['video-content'] ?? 0), 0);
    const avgProgress = totalTopics > 0 ? Math.round((totalReads / totalTopics) * 100) : 0;
    return { totalSubjects, totalTopics, totalReads, totalVideoViews, avgProgress };
  }, [subjects]);

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
          <Skeleton variant="rounded" height={90} sx={{ borderRadius: '14px' }} />
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: '14px' }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2}>
            {[0, 1, 2].map((i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rounded" height={220} sx={{ borderRadius: '14px' }} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="E-Resources" description="Student lesson notes and assessments">
      <Breadcrumb title="Lesson Notes" items={BCrumb} />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} action={<Button onClick={loadHub}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {serviceDown && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }} action={<Button onClick={loadHub}>Retry</Button>}>
          Some services are temporarily unavailable. Please try again shortly.
        </Alert>
      )}

      {hub && hub.userStatus !== 'Student' && (
        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          E-Resources lesson notes are available to students only. Your account is registered as{' '}
          {hub.userStatus}.
        </Alert>
      )}

      {hub?.userStatus === 'Student' && (
        <>
          {/* ── Hero header ──────────────────────────────────────────── */}
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
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                      <IconSchool size={21} />
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                        <Typography sx={{ fontWeight: 800, fontSize: 15.5 }}>{hub.className}</Typography>
                        {hub.armName && (
                          <Chip label={hub.armName} size="small" sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
                        )}
                        {hub.progCode && (
                          <Chip label={hub.progCode} size="small" variant="outlined" sx={{ fontSize: 10.5, fontWeight: 700 }} />
                        )}
                      </Stack>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                        {subjects.length} registered subject{subjects.length === 1 ? '' : 's'} for the active term
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<IconRefresh size={16} />} onClick={loadHub} sx={{ borderRadius: '8px', fontWeight: 600 }}>
                      Refresh
                    </Button>
                    <Button variant="contained" startIcon={<IconActivity size={16} />} onClick={() => navigate(PROGRESS_ROUTE)} sx={{ borderRadius: '8px', fontWeight: 700 }}>
                      My Progress
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* ── Reading intelligence ─────────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#DBEAFE', color: '#2563EB' }}>
                  <IconBooks size={20} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>{pageStats.totalSubjects}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Registered Subjects</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#DCFCE7', color: '#16A34A' }}>
                  <IconFileText size={20} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#16A34A', lineHeight: 1 }}>{pageStats.totalReads}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Lesson Notes Read</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#F3E8FF', color: '#9333EA' }}>
                  <IconPlayerPlay size={20} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#9333EA', lineHeight: 1 }}>{pageStats.totalVideoViews}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Video Views</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff' }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: pageStats.totalSubjects ? 1 : 0 }}>
                  <Avatar sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#FFEDD5', color: '#EA580C' }}>
                    <IconActivity size={20} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#EA580C', lineHeight: 1 }}>{pageStats.avgProgress}%</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Overall Reading Progress</Typography>
                  </Box>
                </Stack>
                {pageStats.totalSubjects > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={pageStats.avgProgress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#EA580C', borderRadius: 3 },
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* ── Left panel — subjects + outline ─────────────────────── */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Card sx={{ ...cardSx(isDark), mb: 2, overflow: 'hidden' }}>
                <SectionHeader
                  icon={IconBooks}
                  title="Subjects with Lesson Analysis"
                  subtitle="Pick a subject to see its weekly breakdown and take formative assessments"
                />
                <CardContent>
                  {subjects.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '10px' }}>No Record Found</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {subjects.map((sub) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sub.subject_id}>
                          <StudentSubjectCard
                            sub={sub}
                            isSelected={sub.subject_id === selectedSubjectId}
                            onOpen={loadOutline}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>

              {selectedSubject && (
                <Card sx={{ ...cardSx(isDark), overflow: 'hidden' }}>
                  <SectionHeader
                    icon={IconClipboardList}
                    title={`${selectedSubject.subject_name} Outline`}
                    subtitle={`${selectedSubject.topic_count} topics across ${groupedOutline.length} week${groupedOutline.length === 1 ? '' : 's'}`}
                    accent="#9333EA"
                    accentBg="#F3E8FF"
                    action={
                      <Button
                        size="small"
                        onClick={() => loadOutline(selectedSubject.subject_id)}
                        startIcon={<IconRefresh size={14} />}
                        sx={{ fontWeight: 600, flexShrink: 0 }}
                      >
                        Reload
                      </Button>
                    }
                  />
                  <CardContent>
                    {outlineLoading && (
                      <Stack alignItems="center" py={4}>
                        <CircularProgress size={28} />
                      </Stack>
                    )}
                    {!outlineLoading && groupedOutline.length === 0 && (
                      <Alert severity="info" sx={{ borderRadius: '10px' }}>No outline available for this subject yet.</Alert>
                    )}
                    {!outlineLoading &&
                      groupedOutline.map((week, weekIdx) => {
                        const isOpen = openWeekIndex === weekIdx;
                        return (
                          <Box
                            key={week.week_name || weekIdx}
                            sx={{
                              mb: 1.25,
                              borderRadius: '12px',
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#EEF2F6',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              onClick={() => setOpenWeekIndex(isOpen ? null : weekIdx)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 1.5,
                                py: 1,
                                cursor: 'pointer',
                                bgcolor: isOpen ? (isDark ? 'rgba(147,51,234,0.08)' : '#FAF5FF') : 'transparent',
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ width: 26, height: 26, borderRadius: '8px', bgcolor: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Typography sx={{ fontSize: 11.5, fontWeight: 800 }}>{weekIdx + 1}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                  {week.week_name}
                                </Typography>
                                <Chip
                                  label={`${week.topics.reduce((sum, t) => sum + t.subtopics.length, 0)} lesson${week.topics.reduce((sum, t) => sum + t.subtopics.length, 0) === 1 ? '' : 's'}`}
                                  size="small"
                                  sx={{ fontSize: 10, fontWeight: 700, bgcolor: '#F3E8FF', color: '#7C3AED' }}
                                />
                              </Stack>
                              {isOpen ? <IconChevronUp size={16} color="#9333EA" /> : <IconChevronDown size={16} color="#94A3B8" />}
                            </Box>
                            <Collapse in={isOpen}>
                              <Box sx={{ px: 1.5, pb: 1.25, pt: 0.25 }}>
                                {week.topics.map((topic, tIdx) => (
                                  <Box key={`${topic.topic}-${tIdx}`} sx={{ mb: 1.25 }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9333EA', letterSpacing: 0.3, mb: 0.75 }}>
                                      TOPIC · {topic.topic}
                                    </Typography>
                                    <Stack spacing={0.75}>
                                      {topic.subtopics.map((sub, sIdx) => {
                                        const taken = isQuizTaken(quizVisitCount, sub.qz_scheme_of_work_id);
                                        return (
                                          <Stack
                                            key={`${sub.scheme_of_work_id}-${sIdx}`}
                                            direction={{ xs: 'column', sm: 'row' }}
                                            spacing={1}
                                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            justifyContent="space-between"
                                            sx={{
                                              p: 1,
                                              borderRadius: '10px',
                                              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC',
                                              border: '1px solid',
                                              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                                            }}
                                          >
                                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                                              Lesson {sIdx + 1}: {sub.subtopic}
                                            </Typography>
                                            <Stack direction="row" spacing={0.75} flexShrink={0}>
                                              {sub.lesson_id != null && (
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openLessonNote(sub);
                                                  }}
                                                  sx={{ borderRadius: '7px', fontWeight: 600, fontSize: 11 }}
                                                >
                                                  View Note
                                                </Button>
                                              )}
                                              {sub.qz_scheme_of_work_id != null && (
                                                <Button
                                                  size="small"
                                                  variant={taken ? 'outlined' : 'contained'}
                                                  color={taken ? 'success' : 'primary'}
                                                  disabled={taken}
                                                  startIcon={taken ? <IconCheck size={13} /> : null}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAssessment(sub);
                                                  }}
                                                  sx={{ borderRadius: '7px', fontWeight: 700, fontSize: 11 }}
                                                >
                                                  {taken ? 'Formative Taken' : 'Take Formative'}
                                                </Button>
                                              )}
                                            </Stack>
                                          </Stack>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      })}
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* ── Right panel — weekly assessments + selected-subject recap ─ */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ ...cardSx(isDark), overflow: 'hidden' }}>
                <SectionHeader
                  icon={IconActivity}
                  title="Weekly Assessment"
                  accent="#16A34A"
                  accentBg="#DCFCE7"
                />
                <Box sx={{ px: 1.5, pt: 1.25 }}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="flex-start"
                    sx={{ p: 1, borderRadius: '10px', bgcolor: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB' }}
                  >
                    <IconBulb size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                    <Typography sx={{ fontSize: 10.5, color: '#92400E', fontWeight: 600, lineHeight: 1.4 }}>
                      Finish the previous assessment before you can start the next one.
                    </Typography>
                  </Stack>
                </Box>
                <CardContent sx={{ pt: 1.25 }}>
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
                          startIcon={<IconPlayerPlay size={14} />}
                          onClick={() => openWeeklyAssessment(week)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: '8px', fontWeight: 600, fontSize: 12.5 }}
                        >
                          {week.week_name} Assessment
                        </Button>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {selectedSubject && (
                <Card sx={{ ...cardSx(isDark), mt: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#EEF2FF', color: '#2563EB' }}>
                        <IconFileText size={14} />
                      </Avatar>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {selectedSubject.subject_name}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.5 }}>
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
