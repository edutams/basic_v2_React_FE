import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  IconBook,
  IconRefresh,
  IconSchool,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantStudentApi } from '@/api/tenant/e-resources/studentApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources/student', title: 'E-Resources' },
  { title: 'My Progress' },
];

const HUB_ROUTE = '/e-resources/student';

const StudentProgress = () => {
  const navigate = useNavigate();
  const notify = useNotification();
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

  if (loading) {
    return (
      <PageContainer title="My Progress" description="E-resources learning progress">
        <Breadcrumb title="My Progress" items={BCrumb} />
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={100} />
          <Grid container spacing={2}>
            {[0, 1].map((i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={260} />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Progress" description="E-resources learning progress">
      <Breadcrumb title="My Progress" items={BCrumb} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={loadAll}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {hub && hub.userStatus !== 'Student' && (
        <Alert severity="info">
          Progress analytics are available to students only. Your account is registered as{' '}
          {hub.userStatus}.
        </Alert>
      )}

      {hub?.userStatus === 'Student' && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconSchool size={22} stroke={1.7} />
                    <Typography variant="h6">{hub.className}</Typography>
                    {hub.armName && <Chip size="small" label={hub.armName} />}
                    {hub.progCode && <Chip size="small" variant="outlined" label={hub.progCode} />}
                  </Stack>
                </Grid>
                <Grid
                  size={{ xs: 12, md: 4 }}
                  sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<IconRefresh size={16} />}
                    onClick={loadAll}
                  >
                    Refresh
                  </Button>
                  <Button variant="contained" onClick={() => navigate(HUB_ROUTE)}>
                    Back to Lesson Notes
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <IconBook size={26} stroke={1.6} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {analytics?.total_subjects ?? 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Registered subjects
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <IconTrendingUp size={26} stroke={1.6} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {analytics?.total_topics ?? 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lesson topics available
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {schemeProgress && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  mb={1}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Selected lesson progress
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<IconRefresh size={14} />}
                    onClick={loadSchemeProgress}
                    disabled={progressLoading}
                  >
                    Refresh
                  </Button>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {schemeProgress.read_count} of {schemeProgress.total_subtopics} subtopics read
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {schemeProgress.reading_progress_percent}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Number(schemeProgress.reading_progress_percent ?? 0)}
                  sx={{ mt: 1, height: 10, borderRadius: 5 }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                Subject engagement
              </Typography>
              {subjects.length === 0 ? (
                <Alert severity="info">No Record Found</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell align="right">Topics</TableCell>
                        <TableCell align="right">Lesson note visits</TableCell>
                        <TableCell align="right">Video views</TableCell>
                        <TableCell align="right">Weeks published</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subjects.map((sub) => (
                        <TableRow key={sub.subject_id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {sub.subject_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{sub.topic_count}</TableCell>
                          <TableCell align="right">
                            {sub.report_counts?.['lesson-note'] ?? 0}
                          </TableCell>
                          <TableCell align="right">
                            {sub.report_counts?.['video-content'] ?? 0}
                          </TableCell>
                          <TableCell align="right">
                            {(sub.lesson_contents ?? []).length}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
};

export default StudentProgress;
