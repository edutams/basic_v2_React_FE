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
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconArrowLeft, IconSparkles, IconBook, IconBulb, IconCheck, IconDeviceFloppy, IconEye, IconUpload, IconX } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import useNotification from '@/hooks/useNotification';
import { tenantLessonNoteApi } from '@/api/tenant/e-resources/lessonNoteApi';
import { DocxPreview, LessonUploadModal, RichContentView, aiErrorMessage, apiErrorMessage, isDocumentLink } from './lessonNoteShared';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { to: '/e-resources/lesson-note', title: 'Lesson Notes' },
  { title: 'Plan Editor' },
];

// Tips shown in the Lesson Plan sidebar (matches basic's Plan tab)
const TIPS = [
  'Keep content age-appropriate and engaging.',
  'Include interactive elements when possible.',
  'Use clear and simple language.',
  'Add visual aids to support learning.',
];

const textToDataUrl = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return `data:text/html;base64,${btoa(binary)}`;
};

const LessonPlanEditor = ({ context, embedded = false }) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [searchParams] = useSearchParams();

  // `context` lets the Teaching Resources workspace embed this editor inside
  // its Lesson Plan tab; standalone route usage still reads the URL.
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

  const [record, setRecord] = useState(null);
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiError, setAiError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const isDirty = content !== initialContent;
  const contextMissing = !schemeOfWorkId || !staffSubjectId;

  const loadPlan = useCallback(async () => {
    if (!schemeOfWorkId || !staffSubjectId) return;
    setLoading(true);
    try {
      const res = await tenantLessonNoteApi.getLessonPlans(schemeOfWorkId, {
        staff_subject_id: staffSubjectId,
      });
      const plan = res?.lesson_plans ?? null;
      setRecord(plan);
      // Never seed the textarea with an uploaded document URL (docx is previewed inline).
      const editable = plan?.lesson_plan_with_ai
        ?? (plan?.lesson_plan && !isDocumentLink(plan.lesson_plan) ? plan.lesson_plan : '');
      setContent(editable || '');
      setInitialContent(editable || '');
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Failed to load lesson plan'));
    } finally {
      setLoading(false);
    }
  }, [notify, schemeOfWorkId, staffSubjectId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleGenerateAi = async () => {
    if (!schemeOfWorkId || !staffSubjectId) return;
    setGenerating(true);
    setAiError('');
    try {
      const res = await tenantLessonNoteApi.generateLessonPlanAi(schemeOfWorkId, staffSubjectId, {
        subject_name: subjectName,
        class_name: className,
        staff_subject_id: staffSubjectId,
      });
      setAiContent(res?.data ?? '');
    } catch (err) {
      setAiError(
        aiErrorMessage(
          err,
          'The AI service could not be reached. Your unsaved content has been kept — please try again shortly.',
        ),
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleUseAi = () => {
    if (!aiContent) return;
    setContent(aiContent);
    setAiContent('');
  };

  const handleSave = async () => {
    const value = content.trim();
    if (!value) {
      setSaveError('Write or generate content before saving.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      if (record?.id) {
        await tenantLessonNoteApi.updateLessonPlan(schemeOfWorkId, {
          staff_subject_id: staffSubjectId,
          scheme_of_work_id: Number(schemeOfWorkId),
          updated_lesson_plan: value,
        });
      } else {
        await tenantLessonNoteApi.lessonPlanContent({
          ssi: staffSubjectId,
          sowi: schemeOfWorkId,
          textData: textToDataUrl(value),
          ...(subTopicsId ? { sub_topics_id: Number(subTopicsId) } : {}),
        });
      }
      notify.success('Lesson plan saved successfully');
      await loadPlan();
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'Failed to save the lesson plan'));
    } finally {
      setSaving(false);
    }
  };

  // Upload a Word document — matches basic's "Create from scratch" / "Re-upload"
  const handleFileUpload = async (dataUrl) => {
    await tenantLessonNoteApi.lessonPlanContent({
      ssi: staffSubjectId,
      sowi: schemeOfWorkId,
      textData: dataUrl,
      ...(subTopicsId ? { sub_topics_id: Number(subTopicsId) } : {}),
    });
    notify.success('Lesson plan document uploaded successfully');
    await loadPlan();
  };

  const statusChip = useMemo(() => {
    const status = record?.status;
    if (!status) return <Chip size="small" variant="outlined" label="Not saved yet" />;
    if (status === 'inactive') return <Chip size="small" color="warning" label="Pending approval" />;
    if (status === 'active') return <Chip size="small" color="success" label="Approved" />;
    if (status === 'rejected') return <Chip size="small" color="error" label="Rejected" />;
    return <Chip size="small" label={String(status)} />;
  }, [record]);

  const isApproved = record?.status === 'active';
  const approveLabel = isApproved ? 'Disapprove Lesson Plan' : 'Approve Lesson Plan';

  const handleApproveToggle = async () => {
    setApproveConfirmOpen(false);
    setApproving(true);
    try {
      const res = await tenantLessonNoteApi.approveLessonPlan({
        staff_subject_id: staffSubjectId,
        scheme_of_work_id: Number(schemeOfWorkId),
      });
      const newStatus = res?.new_status;
      setRecord((prev) => (prev ? { ...prev, status: newStatus } : prev));
      notify.success(res?.message || `Lesson plan status updated to ${newStatus}`);
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Failed to update the lesson plan status'));
    } finally {
      setApproving(false);
    }
  };

  const headerCard = (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">
                {subjectName || 'Lesson Plan'}{' '}
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
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" useFlexGap spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconBook size={18} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Plan Content
                  </Typography>
                  {statusChip}
                  {isDirty && <Chip size="small" color="info" variant="outlined" label="Unsaved changes" />}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconEye size={15} />}
                    onClick={() => setViewMode((prev) => !prev)}
                  >
                    {viewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disabled={contextMissing}
                    onClick={() => setUploadOpen(true)}
                    startIcon={<IconUpload size={15} />}
                  >
                    {record?.id ? 'Re-upload' : 'Upload document'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    disabled={generating || contextMissing}
                    onClick={handleGenerateAi}
                    startIcon={generating ? <CircularProgress size={14} color="inherit" /> : <IconSparkles size={15} />}
                  >
                    Generate with AI
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={saving || contextMissing}
                    onClick={handleSave}
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <IconDeviceFloppy size={15} />}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>

              {loading && <Skeleton variant="rounded" height={320} />}

              {!loading && viewMode && (
                <Box sx={{ minHeight: 320 }}>
                  <RichContentView content={content} emptyMessage="Nothing to preview yet — write or generate content first." />
                </Box>
              )}

              {!loading && !viewMode && (
                <TextField
                  fullWidth
                  multiline
                  minRows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the lesson plan here, or generate it with AI..."
                  disabled={contextMissing}
                />
              )}

              {saveError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {saveError}
                </Alert>
              )}
              {aiError && (
                <Alert severity="warning" sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={handleGenerateAi}>Retry</Button>}>
                  {aiError}
                </Alert>
              )}

              {aiContent && (
                <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" mb={1}>
                      AI Generated Content
                    </Typography>
                    <Box sx={{ maxHeight: 360, overflowY: 'auto', mb: 2 }}>
                      <RichContentView content={aiContent} />
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" size="small" onClick={handleUseAi}>
                        Insert into editor
                      </Button>
                      <Button variant="outlined" size="small" onClick={() => setAiContent('')}>
                        Dismiss
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Saved Plan
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {loading ? (
                <Skeleton variant="rounded" height={140} />
              ) : record?.id ? (
                record.lesson_plan_with_ai ? (
                  <RichContentView content={record.lesson_plan_with_ai} emptyMessage="No saved content yet." />
                ) : isDocumentLink(record.lesson_plan) ? (
                  <DocxPreview url={record.lesson_plan} height={360} />
                ) : (
                  <RichContentView content={record.lesson_plan} emptyMessage="No saved content yet." />
                )
              ) : (
                <Alert severity="info">This lesson plan has not been created yet. Save to create it.</Alert>
              )}

              {/* Approve / Disapprove (matches basic's Plan tab) */}
              {!loading && record?.id && (
                <Stack direction="row" justifyContent="flex-end" mt={2}>
                  <Button
                    variant={isApproved ? 'outlined' : 'contained'}
                    color={isApproved ? 'error' : 'success'}
                    size="small"
                    disabled={approving}
                    onClick={() => setApproveConfirmOpen(true)}
                    startIcon={
                      approving ? (
                        <CircularProgress size={13} color="inherit" />
                      ) : isApproved ? (
                        <IconX size={14} />
                      ) : (
                        <IconCheck size={14} />
                      )
                    }
                  >
                    {approveLabel}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Tips & Best Practices (Plan tab has Tips, not the forum — matches basic) */}
          <Card variant="outlined" sx={{ borderRadius: '12px', borderColor: '#F59E0B44' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <IconBulb size={16} color="#F59E0B" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Tips &amp; Best Practices
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {TIPS.map((tip, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#F59E0B',
                        mt: 0.75,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      {tip}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload modal — matches basic's Create from scratch / Re-upload */}
      <LessonUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={record?.id ? 'Re-upload Lesson Plan' : 'Upload Lesson Plan'}
        subtitle="Word document (.doc, .docx)"
        accept=".doc,.docx"
        uploadLabel="document"
        maxMB={10}
        onUpload={handleFileUpload}
      />

      {/* Approve / Disapprove confirmation */}
      <Dialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle fontWeight={700}>{approveLabel}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>
            Are you sure you want to {isApproved ? 'disapprove' : 'approve'} this lesson plan?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setApproveConfirmOpen(false)}
            disabled={approving}
          >
            No, exit
          </Button>
          <Button
            variant="contained"
            color={isApproved ? 'error' : 'success'}
            onClick={handleApproveToggle}
            disabled={approving}
            startIcon={approving ? <CircularProgress size={15} color="inherit" /> : null}
          >
            Yes, continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  if (embedded) return <Box>{body}</Box>;

  return (
    <PageContainer title="Lesson Plan Editor" description="Create or edit the lesson plan for this subtopic">
      <Breadcrumb title="Lesson Plan Editor" items={BCrumb} />
      {headerCard}
      {body}
    </PageContainer>
  );
};

export default LessonPlanEditor;
