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
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  IconActivity,
  IconBolt,
  IconBook,
  IconBooks,
  IconBulb,
  IconCheck,
  IconFileText,
  IconPlayerPlay,
  IconProgressCheck,
  IconRefresh,
  IconSchool,
  IconSparkles,
  IconTrophy,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import { encodeLinkParams } from '@/utils/scoreLinks';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantStudentApi } from '@/api/tenant/e-resources/studentApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'Lesson Notes' },
];

const LESSON_NOTE_ROUTE = '/e-resources/student/lesson-note';
const PROGRESS_ROUTE = '/e-resources/student/progress';

const isServiceUnavailable = (error) =>
  error?.response?.status === 503 ||
  error?.response?.data?.message === 'Assessment service unavailable';

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

// Subject card — the exact same shell as the teacher workspace's SubjectCard
// (StaffLessonNoteIndex): tinted status header with a colored subject
// initial badge, a class/arm chip, a topic-count + status-chip row,
// progress block, status banner, flat 2px border (no left accent), and a
// full-width gradient footer action — so the student and teacher lesson-note
// experiences read as one product. The teacher card's "taught by" / learner
// rows are dropped here since a student's subject list carries no teacher
// or roster data; the per-subject class/arm chip instead reuses the
// student's own class/arm, which is the same for every card.
const StudentSubjectCard = ({ sub, className, armName, opening, onOpen }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const noteReads = sub.report_counts?.['lesson-note'] ?? 0;
  const topicCount = sub.topic_count || 0;
  const percent = topicCount > 0 ? Math.min(100, Math.round((noteReads / topicCount) * 100)) : 0;
  const isComplete = percent >= 100;
  const isStarted = percent > 0;

  const statusLabel = isComplete ? 'Fully read' : isStarted ? 'In progress' : 'Not started';
  // Same trio as the teacher card's SubjectCard — keeps both lesson-note
  // experiences on one palette instead of two different ones.
  const accentColor = isComplete ? '#059669' : isStarted ? '#7C3AED' : '#F59E0B';

  const headerTint = isComplete
    ? isDark
      ? 'rgba(5,150,105,0.16)'
      : '#D1FAE5'
    : isStarted
      ? isDark
        ? 'rgba(124,58,237,0.16)'
        : '#EDE9FE'
      : isDark
        ? 'rgba(245,158,11,0.16)'
        : '#FEF3C7';

  const classLabel = [className, armName].filter(Boolean).join(' - ');

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '2px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.45)' : '0 4px 14px rgba(15,23,42,0.08)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.45)' : `0 10px 24px ${accentColor}26`,
          borderColor: accentColor,
        },
      }}
    >
      {/* ── Top Header Section — gradient tint by reading status ── */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: headerTint,
          backgroundImage: `linear-gradient(135deg, ${headerTint} 0%, transparent 115%)`,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: accentColor,
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: `0 4px 10px ${accentColor}4d`,
              }}
            >
              {String(sub.subject_name || '?')
                .charAt(0)
                .toUpperCase()}
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              sx={{
                fontSize: '0.925rem',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
              title={sub.subject_name}
            >
              {sub.subject_name}
            </Typography>
          </Box>
          {classLabel && (
            <Chip
              label={classLabel}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '11px',
                height: '22px',
                flexShrink: 0,
                backgroundColor: isDark ? theme.palette.background.paper : '#FFFFFF',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#D0D5DD',
                color: theme.palette.text.primary,
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
            <IconBook size={13} />
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
              <strong>{topicCount}</strong> topics
            </Typography>
          </Stack>
          <Chip
            label={statusLabel}
            size="small"
            icon={
              isComplete ? (
                <IconCheck size={12} />
              ) : isStarted ? (
                <IconProgressCheck size={12} />
              ) : undefined
            }
            sx={{
              fontWeight: 600,
              fontSize: '11px',
              height: '22px',
              bgcolor: alpha(accentColor, isDark ? 0.22 : 0.14),
              color: accentColor,
              '& .MuiChip-icon': { color: accentColor },
            }}
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
              sx={{ fontSize: '0.775rem', color: accentColor }}
            >
              {percent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 7,
              borderRadius: 4,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
              '& .MuiLinearProgress-bar': {
                backgroundColor: accentColor,
                borderRadius: 4,
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.7rem' }}
          >
            {noteReads} out of {topicCount} topics read
          </Typography>
        </Box>

        {/* Reading Status Indicator Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            py: 0.6,
            px: 1,
            borderRadius: '8px',
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
            mt: 'auto',
          }}
        >
          <Box
            sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }}
          />
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.primary"
            sx={{ fontSize: '0.725rem' }}
          >
            Reading Status:{' '}
            <Typography
              component="span"
              variant="caption"
              fontWeight={700}
              sx={{ fontSize: '0.725rem', color: accentColor }}
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
          size="small"
          disabled={opening}
          startIcon={
            opening ? <CircularProgress size={13} color="inherit" /> : <IconBooks size={14} />
          }
          onClick={() => onOpen(sub)}
          sx={{
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'none',
            py: 0.6,
            borderRadius: '8px',
            color: '#fff',
            backgroundImage: `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.8)} 100%)`,
            boxShadow: `0 4px 10px ${alpha(accentColor, 0.35)}`,
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor} 100%)`,
              boxShadow: `0 6px 14px ${alpha(accentColor, 0.45)}`,
            },
          }}
        >
          {opening ? 'Opening…' : 'Open Lesson Content'}
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
  const [openingSubjectId, setOpeningSubjectId] = useState(null);

  const subjects = useMemo(
    () => subjectsData?.subjects_with_lessons ?? [],
    [subjectsData],
  );

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

  // ── Smart study insights — replaces the old static "Weekly Assessment"
  // list with a read on each student's own reading habits: what to resume,
  // what's falling behind, and a nudge to use video content when it's being
  // skipped, computed entirely from data already on this page.
  const studyInsights = useMemo(() => {
    if (subjects.length === 0) return null;
    const withPercent = subjects.map((s) => {
      const topicCount = s.topic_count || 0;
      const reads = s.report_counts?.['lesson-note'] ?? 0;
      const videoViews = s.report_counts?.['video-content'] ?? 0;
      const percent = topicCount > 0 ? Math.min(100, Math.round((reads / topicCount) * 100)) : 0;
      return { ...s, percent, videoViews };
    });
    const inProgress = withPercent.filter((s) => s.percent > 0 && s.percent < 100);
    const notStarted = withPercent.filter((s) => s.percent === 0);
    const resume = [...inProgress].sort((a, b) => b.percent - a.percent)[0]
      || [...notStarted].sort((a, b) => (a.subject_name || '').localeCompare(b.subject_name || ''))[0]
      || null;
    const needsAttention = [...withPercent]
      .filter((s) => resume == null || s.subject_id !== resume.subject_id)
      .sort((a, b) => a.percent - b.percent)[0] || null;
    const allComplete = withPercent.every((s) => s.percent >= 100);
    const unwatchedVideoSubject = withPercent.find((s) => s.percent > 0 && s.videoViews === 0) || null;
    return { resume, needsAttention, allComplete, unwatchedVideoSubject };
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
      const subjectsRes = await tenantStudentApi.getSubjectsWithAssessments({
        userId: index.userId,
        session_term: index.termId,
      });
      setSubjectsData(subjectsRes);
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

  // Resolves the subject's earliest lesson up front — the same lookup the
  // outline used to do inline — then navigates straight to the Lesson
  // Content page with a concrete lesson already chosen, so the student
  // never lands on a page with nothing to show.
  const openSubject = async (sub) => {
    if (!hub || openingSubjectId) return;
    setOpeningSubjectId(sub.subject_id);
    try {
      const weeks = await tenantStudentApi.getSubjectOutline({
        subject_id: sub.subject_id,
        class_prog_id: hub.classProgId,
        session_term_id: hub.termId,
      });
      const list = Array.isArray(weeks) ? weeks : [];
      const first = list.find((week) => week.has_lesson_note) || list[0] || null;

      if (!first) {
        notify.error(`No lesson content has been set up for ${sub.subject_name} yet.`);
        return;
      }

      const token = encodeLinkParams({
        schemeOfWorkId: first.scheme_of_work_id,
        subjectId: sub.subject_id,
        classProgId: hub.classProgId,
        weekId: first.week_id,
        sessionTermId: hub.termId,
        classArmId: subjectsData?.cd_id,
        userId: hub.userId,
        subjectName: sub.subject_name,
        weekName: first.week_name,
      });
      navigate(`${LESSON_NOTE_ROUTE}?t=${token}`);
    } catch (err) {
      notify.error(err?.response?.data?.message || `Failed to open ${sub.subject_name}'s lesson content`);
    } finally {
      setOpeningSubjectId(null);
    }
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
          {/* ── Reading intelligence ─────────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', boxSizing: 'border-box' }}>
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
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', boxSizing: 'border-box' }}>
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
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', boxSizing: 'border-box' }}>
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
              <Box sx={{ ...cardSx(isDark), p: 1.5, bgcolor: isDark ? 'background.paper' : '#fff', display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', boxSizing: 'border-box' }}>
                <Avatar sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#FFEDD5', color: '#EA580C' }}>
                  <IconActivity size={20} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#EA580C', lineHeight: 1 }}>{pageStats.avgProgress}%</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Overall Reading Progress</Typography>
                </Box>
                {/* Progress bar commented out
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
                */}
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* ── Left panel — subjects ────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Card sx={{ ...cardSx(isDark), overflow: 'hidden' }}>
                <SectionHeader
                  icon={IconBooks}
                  title="Subjects with Lesson Analysis"
                  subtitle="Open a subject to read its lesson note, track progress and chat about it"
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
                            className={hub.className}
                            armName={hub.armName}
                            opening={openingSubjectId === sub.subject_id}
                            onOpen={openSubject}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ── Right panel — smart study insights ──────────────────── */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ ...cardSx(isDark), overflow: 'hidden' }}>
                <SectionHeader
                  icon={IconSparkles}
                  title="Smart Study Insights"
                  subtitle="Personalised to your reading habits"
                  accent="#9333EA"
                  accentBg="#F3E8FF"
                />
                <CardContent sx={{ pt: 1.25 }}>
                  {!studyInsights ? (
                    <Typography variant="body2" color="text.secondary">
                      Start a subject to see personalised insights here.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {studyInsights.resume && (
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: '10px',
                            bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF',
                            border: '1px solid',
                            borderColor: 'rgba(37,99,235,0.2)',
                          }}
                        >
                          <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                            <IconBolt size={13} color="#2563EB" />
                            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#2563EB', letterSpacing: 0.3 }}>
                              CONTINUE LEARNING
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 700, mb: 0.25 }}>
                            {studyInsights.resume.subject_name}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>
                            {studyInsights.resume.percent > 0
                              ? `${studyInsights.resume.percent}% read so far — pick up where you left off.`
                              : "You haven't started this one yet — it's next in line."}
                          </Typography>
                          <Button
                            size="small"
                            fullWidth
                            variant="contained"
                            disabled={openingSubjectId === studyInsights.resume.subject_id}
                            startIcon={
                              openingSubjectId === studyInsights.resume.subject_id ? (
                                <CircularProgress size={13} color="inherit" />
                              ) : null
                            }
                            onClick={() => openSubject(studyInsights.resume)}
                            sx={{ borderRadius: '8px', fontWeight: 700, fontSize: 11.5 }}
                          >
                            Resume Lesson
                          </Button>
                        </Box>
                      )}

                      {studyInsights.needsAttention && studyInsights.needsAttention.percent < 50 && (
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: '10px',
                            bgcolor: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7ED',
                            border: '1px solid',
                            borderColor: 'rgba(234,88,12,0.2)',
                          }}
                        >
                          <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                            <IconBulb size={13} color="#EA580C" />
                            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#EA580C', letterSpacing: 0.3 }}>
                              NEEDS ATTENTION
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 700, mb: 0.25 }}>
                            {studyInsights.needsAttention.subject_name}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>
                            Only {studyInsights.needsAttention.percent}% read — you're at risk of falling behind.
                          </Typography>
                          <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                            color="warning"
                            disabled={openingSubjectId === studyInsights.needsAttention.subject_id}
                            startIcon={
                              openingSubjectId === studyInsights.needsAttention.subject_id ? (
                                <CircularProgress size={13} color="inherit" />
                              ) : null
                            }
                            onClick={() => openSubject(studyInsights.needsAttention)}
                            sx={{ borderRadius: '8px', fontWeight: 700, fontSize: 11.5 }}
                          >
                            Start Reading
                          </Button>
                        </Box>
                      )}

                      {studyInsights.unwatchedVideoSubject && (
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: '10px',
                            bgcolor: isDark ? 'rgba(147,51,234,0.08)' : '#FAF5FF',
                            border: '1px solid',
                            borderColor: 'rgba(147,51,234,0.2)',
                          }}
                        >
                          <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                            <IconPlayerPlay size={13} color="#9333EA" />
                            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#9333EA', letterSpacing: 0.3 }}>
                              TIP
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                            You haven't watched any video content for{' '}
                            <strong>{studyInsights.unwatchedVideoSubject.subject_name}</strong> yet — videos can help
                            topics click faster.
                          </Typography>
                        </Box>
                      )}

                      {studyInsights.allComplete && (
                        <Alert severity="success" icon={<IconTrophy size={16} />} sx={{ borderRadius: '8px' }}>
                          Great job! You're fully caught up on every subject.
                        </Alert>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </PageContainer>
  );
};

export default StudentEResource;
