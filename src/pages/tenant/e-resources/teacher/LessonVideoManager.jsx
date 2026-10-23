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
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconArrowLeft, IconSparkles, IconPlayerPlay, IconUpload } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantLessonNoteApi } from '@/api/tenant/e-resources/lessonNoteApi';
import { ForumThread, LessonUploadModal, aiErrorMessage, apiErrorMessage, firstFileUrl, getYouTubeId, toAbsoluteUrl } from './lessonNoteShared';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { to: '/e-resources/lesson-note', title: 'Lesson Notes' },
  { title: 'Video Content' },
];

const LessonVideoManager = ({ context, embedded = false }) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [searchParams] = useSearchParams();

  // `context` lets the Teaching Resources workspace embed this manager inside
  // its Video Content tab; standalone route usage still reads the URL.
  const param = (key) => context?.[key] ?? searchParams.get(key);
  const schemeOfWorkId = param('schemeOfWorkId');
  const staffSubjectId = param('staffSubjectId');
  const subjectName = param('subjectName');
  const className = param('className');
  const armName = param('armName');
  const weekName = param('weekName');
  const topic = param('topic');
  const subtopic = param('subtopic');
  const subTopicsId = param('subTopicsId');
  const subtopicScope = subTopicsId ? { sub_topics_id: Number(subTopicsId) } : {};

  const [record, setRecord] = useState(null);
  const [aiLink, setAiLink] = useState('');
  const [aiError, setAiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const contextMissing = !schemeOfWorkId || !staffSubjectId;
  const currentLink = record?.lesson_video_with_ai || '';
  const uploadedFiles = firstFileUrl(record?.lesson_video);

  const loadVideo = useCallback(async () => {
    if (!schemeOfWorkId || !staffSubjectId) return;
    setLoading(true);
    const scope = subTopicsId ? { sub_topics_id: Number(subTopicsId) } : {};
    try {
      const res = await tenantLessonNoteApi.getLessonVideos(schemeOfWorkId, {
        staff_subject_id: staffSubjectId,
        ...scope,
      });
      setRecord(res?.lesson_videos ?? null);
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Failed to load lesson video'));
    } finally {
      setLoading(false);
    }
  }, [notify, schemeOfWorkId, staffSubjectId, subTopicsId]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const handleGenerateAi = async () => {
    if (!schemeOfWorkId || !staffSubjectId) return;
    setGenerating(true);
    setAiError('');
    try {
      const res = await tenantLessonNoteApi.generateLessonVideoAi(schemeOfWorkId, staffSubjectId, {
        subject_name: subjectName,
        class_name: className,
        staff_subject_id: staffSubjectId,
        ...subtopicScope,
      });
      const link = res?.data ?? '';
      setAiLink(link);
      await loadVideo();
    } catch (err) {
      setAiError(
        aiErrorMessage(
          err,
          'The AI service could not be reached. Any uploaded file has been kept — please try again shortly.',
        ),
      );
    } finally {
      setGenerating(false);
    }
  };

  // Upload via modal — matches basic's "Create from scratch" / "Re-upload"
  const handleFileUpload = async (dataUrl) => {
    await tenantLessonNoteApi.uploadLessonVideo({
      ssi: staffSubjectId,
      sowi: schemeOfWorkId,
      videoData: dataUrl,
      ...subtopicScope,
    });
    notify.success('Video uploaded successfully');
    await loadVideo();
  };

  const youtubeId = getYouTubeId(aiLink || currentLink);

  const headerCard = (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">
                {subjectName || 'Lesson Video'}{' '}
                <Chip size="small" sx={{ ml: 1 }} label={[className, armName].filter(Boolean).join(' - ')} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {[weekName, topic, subtopic].filter(Boolean).join(' • ')}
              </Typography>
            </Box>
            <Button startIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/e-resources/lesson-note')}>
              Back to subjects
            </Button>
          </Stack>
        </CardContent>
      </Card>
  );

  const body = (
    <>
      {contextMissing && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Missing lesson context. Please return to the lesson notes page and select a subject, week and subtopic.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <IconPlayerPlay size={18} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Video Content
                </Typography>
                <Chip
                  size="small"
                  color={currentLink || uploadedFiles ? 'success' : 'default'}
                  variant={currentLink || uploadedFiles ? 'filled' : 'outlined'}
                  label={currentLink || uploadedFiles ? 'Available' : 'Not created yet'}
                />
              </Stack>

              {loading && <Skeleton variant="rounded" height={280} />}

              {!loading && (
                <>
                  {youtubeId ? (
                    <Box sx={{ position: 'relative', pt: '56.25%', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
                      <iframe
                        title="lesson-video"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </Box>
                  ) : currentLink ? (
                    <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" href={toAbsoluteUrl(currentLink)} target="_blank" rel="noopener noreferrer">Open</Button>}>
                      A video link is saved for this lesson.
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No video yet. Generate an AI video link or upload a video file below.
                    </Alert>
                  )}

                  {uploadedFiles && !youtubeId && (
                    <>
                      <Box
                        sx={{
                          position: 'relative',
                          pt: '56.25%',
                          borderRadius: 1,
                          overflow: 'hidden',
                          mb: 1.5,
                          bgcolor: '#000',
                        }}
                      >
                        <video
                          controls
                          src={toAbsoluteUrl(uploadedFiles)}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        href={toAbsoluteUrl(uploadedFiles)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open uploaded video file
                      </Button>
                    </>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" mb={1}>
                    Generate AI Video Link
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2}>
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={generating || contextMissing}
                      onClick={handleGenerateAi}
                      startIcon={generating ? <CircularProgress size={14} color="inherit" /> : <IconSparkles size={15} />}
                    >
                      Generate with AI
                    </Button>
                    {aiLink && (
                      <TextField size="small" fullWidth value={aiLink} InputProps={{ readOnly: true }} label="AI video link" />
                    )}
                  </Stack>

                  {aiError && (
                    <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={handleGenerateAi}>Retry</Button>}>
                      {aiError}
                    </Alert>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" mb={1}>
                    Upload Video File
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<IconUpload size={15} />}
                    disabled={contextMissing}
                    onClick={() => setUploadOpen(true)}
                  >
                    {uploadedFiles || currentLink ? 'Re-upload' : 'Create from scratch'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
                    MP4, MPEG or AVI supported
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Details
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Subject:</strong> {subjectName || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Class:</strong> {[className, armName].filter(Boolean).join(' - ') || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Subtopic:</strong> {subtopic || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {record?.status || 'not created'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <ForumThread modelId={record?.id ?? null} height={420} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload modal — matches basic's Create from scratch / Re-upload */}
      <LessonUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={uploadedFiles || currentLink ? 'Re-upload Video' : 'Upload Video'}
        subtitle="MP4, MPEG or AVI supported"
        accept="video/*"
        uploadLabel="video"
        maxMB={50}
        onUpload={handleFileUpload}
      />
    </>
  );

  if (embedded) return <Box>{body}</Box>;

  return (
    <PageContainer title="Lesson Video" description="Manage the lesson video for this subtopic">
      <Breadcrumb title="Lesson Video" items={BCrumb} />
      {headerCard}
      {body}
    </PageContainer>
  );
};

export default LessonVideoManager;
