import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { IconArrowLeft, IconNotes, IconProgressCheck, IconUsers } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import useAuth from '@/hooks/useAuth';
import { tenantLessonNoteApi } from '@/api/tenant/e-resources/lessonNoteApi';
import { apiErrorMessage } from './lessonNoteShared';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { to: '/e-resources/lesson-note', title: 'Lesson Notes' },
  { title: 'Progress' },
];

const LessonNoteProgress = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const schemeOfWorkId = searchParams.get('schemeOfWorkId');
  const staffSubjectId = searchParams.get('staffSubjectId');
  const subjectId = searchParams.get('subjectId');
  const subjectName = searchParams.get('subjectName');
  const className = searchParams.get('className');
  const armName = searchParams.get('armName');
  const classArmId = searchParams.get('classArmId');
  const progId = searchParams.get('progId');
  const sessionTermId = searchParams.get('sessionTermId');

  const [teacherProgress, setTeacherProgress] = useState(null);
  const [classProgress, setClassProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProgress = useCallback(async () => {
    if (!schemeOfWorkId) return;
    setLoading(true);
    setError('');
    const [teacherRes, classRes] = await Promise.allSettled([
      tenantLessonNoteApi.getTeacherProgress(schemeOfWorkId, {
        subject_id: subjectId,
        sess_term_id: sessionTermId,
        prog_id: progId,
        class_description_id: classArmId,
        teacher_id: user?.id,
        staff_subject_id: staffSubjectId,
      }),
      tenantLessonNoteApi.getClassProgress(schemeOfWorkId, {
        session_term_id: sessionTermId,
        class_description_id: classArmId,
      }),
    ]);
    if (teacherRes.status === 'fulfilled') {
      setTeacherProgress(teacherRes.value);
    } else {
      setError(apiErrorMessage(teacherRes.reason, 'Failed to load teacher progress'));
    }
    if (classRes.status === 'fulfilled') {
      setClassProgress(classRes.value);
    } else {
      notify.error(apiErrorMessage(classRes.reason, 'Failed to load class progress'));
    }
    setLoading(false);
  }, [
    classArmId,
    notify,
    progId,
    schemeOfWorkId,
    sessionTermId,
    staffSubjectId,
    subjectId,
    user,
  ]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (!schemeOfWorkId) {
    return (
      <PageContainer title="Lesson Progress" description="Track lesson note and video coverage">
        <Breadcrumb title="Lesson Progress" items={BCrumb} />
        <Alert severity="error">
          Missing lesson context. Please return to the lesson notes page and select a subject first.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Lesson Progress" description="Track lesson note and video coverage">
      <Breadcrumb title="Lesson Progress" items={BCrumb} />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">
                {subjectName || 'Subject Progress'}{' '}
                <Chip size="small" sx={{ ml: 1 }} label={[className, armName].filter(Boolean).join(' - ')} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Notes, videos and student read coverage for this subject in the selected class and term.
              </Typography>
            </Box>
            <Button startIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/e-resources/lesson-note')}>
              Back to subjects
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={loadProgress}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <IconNotes size={18} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Teacher Coverage
                </Typography>
                {loading && <CircularProgress size={16} />}
              </Stack>

              {loading && !teacherProgress ? (
                <Stack spacing={1.5}>
                  <Skeleton variant="rounded" height={70} />
                  <Skeleton variant="rounded" height={70} />
                </Stack>
              ) : teacherProgress ? (
                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Typography variant="body2">Lesson Notes</Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        {teacherProgress.lesson_notes_percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Number(teacherProgress.lesson_notes_percent) || 0}
                      color="success"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {teacherProgress.note_total_count} of {teacherProgress.total_subtopics} subtopics covered
                    </Typography>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Typography variant="body2">Lesson Videos</Typography>
                      <Typography variant="body2" fontWeight={700} color="secondary.main">
                        {teacherProgress.lesson_videos_percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Number(teacherProgress.lesson_videos_percent) || 0}
                      color="secondary"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {teacherProgress.video_total_count} of {teacherProgress.total_subtopics} subtopics covered
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconProgressCheck size={16} />
                    <Typography variant="body2">
                      Overall status:{' '}
                      <strong>
                        {Number(teacherProgress.lesson_notes_percent) === 100 &&
                        Number(teacherProgress.lesson_videos_percent) === 100
                          ? 'Complete'
                          : 'In progress'}
                      </strong>
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">No teacher progress data available.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <IconUsers size={18} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Class Engagement
                </Typography>
                {loading && <CircularProgress size={16} />}
              </Stack>

              {loading && !classProgress ? (
                <Skeleton variant="rounded" height={140} />
              ) : classProgress ? (
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Typography variant="body2">Students who read this lesson</Typography>
                      <Typography variant="body2" fontWeight={700} color="info.main">
                        {classProgress.read_percentage}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Number(classProgress.read_percentage) || 0}
                      color="info"
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {classProgress.read_count} of {classProgress.enrolled_count} enrolled students
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Readers
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {classProgress.read_count}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Enrolled
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {classProgress.enrolled_count}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Non-readers
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="warning.main">
                        {Math.max(
                          (Number(classProgress.enrolled_count) || 0) - (Number(classProgress.read_count) || 0),
                          0,
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">No class progress data available.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default LessonNoteProgress;
