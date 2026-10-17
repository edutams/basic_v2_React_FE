import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  IconAlertTriangle,
  IconBook,
  IconBulb,
  IconPlayerPlay,
  IconRefresh,
  IconSchool,
  IconTarget,
  IconTrendingUp,
  IconTrophy,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantStudentApi } from '@/api/tenant/e-resources/studentApi';
import StatCard from '@/components/shared/StatCard';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'My Progress' },
];

const HUB_ROUTE = '/e-resources/student';

const cardSx = (isDark) => ({
  borderRadius: '14px',
  border: '1px solid',
  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
});

const panelTitleSx = { fontSize: 13, fontWeight: 800, color: '#0f172a' };

const statusScheme = (percent) =>
  percent >= 100
    ? { label: 'Fully read', bg: '#DCFCE7', color: '#166534', bar: '#16A34A' }
    : percent > 0
      ? { label: 'In progress', bg: '#DCEAFB', color: '#1565C0', bar: '#2563EB' }
      : { label: 'Not started', bg: '#FDF0E1', color: '#9A3412', bar: '#CBD5E1' };

const StudentProgress = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();

  const schemeOfWorkId = searchParams.get('schemeOfWorkId');
  const schemeSubjectId = searchParams.get('subjectId');
  const schemeClassArmId = searchParams.get('classArmId');
  const schemeSessionTermId = searchParams.get('sessionTermId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hub, setHub] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [subjectsData, setSubjectsData] = useState(null);
  const [schemeProgress, setSchemeProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const index = await tenantStudentApi.getIndex();
      setHub(index);
      if (index?.userStatus !== 'Student') {
        setLoading(false);
        return;
      }
      const [analyticsRes, subjectsRes] = await Promise.all([
        tenantStudentApi.getAnalytics({ session_term_id: index.termId }),
        tenantStudentApi.getSubjectsWithAssessments({
          userId: index.userId,
          session_term: index.termId,
        }),
      ]);
      setAnalytics(analyticsRes);
      setSubjectsData(subjectsRes);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadSchemeProgress = useCallback(async () => {
    if (!schemeOfWorkId || !schemeSubjectId || !schemeClassArmId || !schemeSessionTermId) return;
    setProgressLoading(true);
    try {
      const res = await tenantStudentApi.getProgress(schemeOfWorkId, {
        subject_id: Number(schemeSubjectId),
        class_arm_id: Number(schemeClassArmId),
        session_term_id: Number(schemeSessionTermId),
      });
      setSchemeProgress(res);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to load lesson progress');
      setSchemeProgress(null);
    } finally {
      setProgressLoading(false);
    }
  }, [schemeOfWorkId, schemeSubjectId, schemeClassArmId, schemeSessionTermId, notify]);

  useEffect(() => {
    loadSchemeProgress();
  }, [loadSchemeProgress]);

  const subjects = subjectsData?.subjects_with_lessons ?? [];

  // ── Per-subject engagement + page-level intelligence, computed once from
  // the same data the raw table used to show as plain numbers.
  const subjectEngagement = useMemo(
    () =>
      subjects
        .map((sub) => {
          const noteReads = sub.report_counts?.['lesson-note'] ?? 0;
          const videoViews = sub.report_counts?.['video-content'] ?? 0;
          const topicCount = sub.topic_count || 0;
          const percent = topicCount > 0 ? Math.min(100, Math.round((noteReads / topicCount) * 100)) : 0;
          return {
            ...sub,
            noteReads,
            videoViews,
            topicCount,
            percent,
            weeksCovered: (sub.lesson_contents ?? []).length,
          };
        })
        .sort((a, b) => b.percent - a.percent),
    [subjects],
  );

  const pageStats = useMemo(() => {
    const totalTopics = subjectEngagement.reduce((sum, s) => sum + s.topicCount, 0);
    const totalReads = subjectEngagement.reduce((sum, s) => sum + s.noteReads, 0);
    const totalVideoViews = subjectEngagement.reduce((sum, s) => sum + s.videoViews, 0);
    const avgProgress = totalTopics > 0 ? Math.round((totalReads / totalTopics) * 100) : 0;
    return { totalTopics, totalReads, totalVideoViews, avgProgress };
  }, [subjectEngagement]);

  // ── Key insights — plain-language reads on the numbers above, same idea
  // as the Results Overview "Key Insights" panel.
  const insights = useMemo(() => {
    const list = [];
    const withTopics = subjectEngagement.filter((s) => s.topicCount > 0);
    const top = withTopics.find((s) => s.percent > 0);
    const needsAttention = [...withTopics].reverse().find((s) => s.percent === 0);

    if (top) {
      list.push({
        type: 'positive',
        text: `"${top.subject_name}" is your most-engaged subject — ${top.percent}% of its lesson notes read so far.`,
      });
    }
    if (needsAttention) {
      list.push({
        type: 'warning',
        text: `"${needsAttention.subject_name}" has no lesson notes read yet — a good place to start next.`,
      });
    }
    if (pageStats.avgProgress >= 70) {
      list.push({ type: 'positive', text: "You're keeping up well across all your subjects this term." });
    } else if (pageStats.avgProgress > 0) {
      list.push({ type: 'neutral', text: `You're at ${pageStats.avgProgress}% overall reading progress — steady work, keep it up.` });
    } else if (withTopics.length > 0) {
      list.push({ type: 'warning', text: "You haven't started reading your lesson notes this term yet." });
    }
    if (pageStats.totalVideoViews === 0 && withTopics.length > 0) {
      list.push({ type: 'neutral', text: 'You have not watched any lesson videos yet — Video Tutorials can help explain tricky topics.' });
    }
    return list;
  }, [subjectEngagement, pageStats]);

  const insightIcon = (type) => {
    if (type === 'warning') return { Icon: IconAlertTriangle, bg: '#FEE2E2', color: '#DC2626' };
    if (type === 'neutral') return { Icon: IconTarget, bg: '#DBEAFE', color: '#2563EB' };
    return { Icon: IconTrendingUp, bg: '#DCFCE7', color: '#16A34A' };
  };

  if (loading) {
    return (
      <PageContainer title="My Progress" description="E-resources learning progress">
        <Breadcrumb title="My Progress" items={BCrumb} />
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={90} sx={{ borderRadius: '14px' }} />
          <Grid container spacing={2}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={i}>
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: '14px' }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: '14px' }} />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Progress" description="E-resources learning progress">
      <Breadcrumb title="My Progress" items={BCrumb} />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} action={<Button onClick={loadAll}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {hub && hub.userStatus !== 'Student' && (
        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          Progress analytics are available to students only. Your account is registered as{' '}
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
                <Grid size={{ xs: 12, md: 8 }}>
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
                        Your learning activity across {subjects.length} registered subject{subjects.length === 1 ? '' : 's'} this term
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, gap: 1 }}>
                  <Button variant="outlined" startIcon={<IconRefresh size={16} />} onClick={loadAll} sx={{ borderRadius: '8px', fontWeight: 600 }}>
                    Refresh
                  </Button>
                  <Button variant="contained" onClick={() => navigate(HUB_ROUTE)} sx={{ borderRadius: '8px', fontWeight: 700 }}>
                    Back to Lesson Notes
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* ── Intelligence stat row ─────────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                count={analytics?.total_subjects ?? subjects.length}
                label="Registered Subjects"
                subtitle="This academic term"
                icon={IconBook}
                colorIndex={0}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                count={analytics?.total_topics ?? pageStats.totalTopics}
                label="Topics Available"
                subtitle="Across all subjects"
                icon={IconTarget}
                colorIndex={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                count={pageStats.totalReads}
                label="Lesson Notes Read"
                subtitle="Topics you've opened"
                icon={IconTrendingUp}
                colorIndex={1}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                count={pageStats.totalVideoViews}
                label="Video Views"
                subtitle="Lesson videos watched"
                icon={IconPlayerPlay}
                colorIndex={3}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard
                count={`${pageStats.avgProgress}%`}
                label="Overall Progress"
                subtitle="Lesson notes read"
                icon={IconTrophy}
                colorIndex={4}
                progress={pageStats.avgProgress}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* ── Key insights ──────────────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ ...cardSx(isDark), height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={0.75} alignItems="center" mb={1.5}>
                    <IconBulb size={16} color="#F59E0B" />
                    <Typography sx={panelTitleSx}>Key Insights</Typography>
                  </Stack>
                  {insights.length === 0 ? (
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                      Nothing notable yet — start reading a lesson note to see insights here.
                    </Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {insights.map((insight, i) => {
                        const { Icon, bg, color } = insightIcon(insight.type);
                        return (
                          <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '8px',
                                bgcolor: bg,
                                color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={14} />
                            </Box>
                            <Typography sx={{ fontSize: 11.5, color: '#334155', lineHeight: 1.45 }}>
                              {insight.text}
                            </Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ── Selected lesson progress (deep-linked gauge) ──────────── */}
            <Grid size={{ xs: 12, md: 8 }}>
              {schemeProgress ? (
                <Card sx={cardSx(isDark)}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography sx={panelTitleSx}>Selected Lesson Progress</Typography>
                      <Button
                        size="small"
                        startIcon={<IconRefresh size={14} />}
                        onClick={loadSchemeProgress}
                        disabled={progressLoading}
                        sx={{ fontWeight: 600 }}
                      >
                        Refresh
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={2.5} alignItems="center">
                      <Box sx={{ width: 100, height: 100, flexShrink: 0 }}>
                        <Chart
                          type="radialBar"
                          width={100}
                          height={100}
                          series={[Number(schemeProgress.reading_progress_percent ?? 0)]}
                          options={{
                            chart: { sparkline: { enabled: true } },
                            colors: ['#2563EB'],
                            plotOptions: {
                              radialBar: {
                                hollow: { size: '62%' },
                                track: { background: '#f1f5f9' },
                                dataLabels: {
                                  name: { show: false },
                                  value: {
                                    fontSize: '16px',
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    offsetY: 5,
                                    formatter: (v) => `${v}%`,
                                  },
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {schemeProgress.read_count} of {schemeProgress.total_subtopics} subtopics read
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25 }}>
                          This reflects the lesson you most recently opened — it updates automatically as you read more.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Card sx={{ ...cardSx(isDark), height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      py: 4,
                    }}
                  >
                    <Avatar sx={{ width: 44, height: 44, bgcolor: '#EEF2FF', color: '#2563EB', mb: 1.25 }}>
                      <IconTarget size={22} />
                    </Avatar>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                      Open a lesson note to track it here
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, maxWidth: 320 }}>
                      This panel shows a live reading gauge for whichever lesson you opened most recently from a subject outline.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          {/* ── Subject engagement ───────────────────────────────────────── */}
          <Card sx={{ ...cardSx(isDark), mt: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={0.75} alignItems="center" mb={1.5}>
                <IconTrendingUp size={16} color="#2563EB" />
                <Typography sx={panelTitleSx}>Subject Engagement</Typography>
              </Stack>
              {subjectEngagement.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: '10px' }}>No Record Found</Alert>
              ) : (
                <Stack spacing={1}>
                  {subjectEngagement.map((sub, idx) => {
                    const scheme = statusScheme(sub.percent);
                    const isTop = idx === 0 && sub.percent > 0;
                    return (
                      <Box
                        key={sub.subject_id}
                        sx={{
                          p: 1.25,
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFBFC',
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent="space-between"
                        >
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                            {isTop && <IconTrophy size={15} color="#F59E0B" style={{ flexShrink: 0 }} />}
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }} noWrap>
                              {sub.subject_name}
                            </Typography>
                            <Chip
                              label={scheme.label}
                              size="small"
                              sx={{ fontSize: 10, fontWeight: 700, bgcolor: scheme.bg, color: scheme.color, height: 20 }}
                            />
                          </Stack>
                          <Stack direction="row" spacing={1.5} flexShrink={0}>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                              {sub.topicCount} topics
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                              {sub.videoViews} video view{sub.videoViews === 1 ? '' : 's'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: scheme.bar }}>
                              {sub.percent}%
                            </Typography>
                          </Stack>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={sub.percent}
                          sx={{
                            mt: 0.75,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                            '& .MuiLinearProgress-bar': { bgcolor: scheme.bar, borderRadius: 3 },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
};

export default StudentProgress;
