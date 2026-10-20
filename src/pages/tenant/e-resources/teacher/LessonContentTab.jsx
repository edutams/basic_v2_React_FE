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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  IconBook,
  IconBulb,
  IconCalendar,
  IconCheck,
  IconInfoCircle,
  IconNotes,
  IconPlayerPlay,
  IconRefresh,
  IconSparkles,
  IconTrendingUp,
  IconUpload,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import useNotification from '@/hooks/useNotification';
import useAuth from '@/hooks/useAuth';
import { tenantLessonNoteApi } from '@/api/tenant/e-resources/lessonNoteApi';
import {
  ForumThread,
  DocxPreview,
  LessonUploadModal,
  RichContentView,
  aiErrorMessage,
  apiErrorMessage,
  firstFileUrl,
  getYouTubeId,
  isDocumentLink,
  toAbsoluteUrl,
} from './lessonNoteShared';

// Tips shown in the Lesson Plan sidebar
const TIPS = [
  'Keep content age-appropriate and engaging.',
  'Include interactive elements when possible.',
  'Use clear and simple language.',
  'Add visual aids to support learning.',
];

// Per-tab configuration
const TAB_CONFIG = {
  plan: {
    label: 'Lesson Plan',
    Icon: IconBook,
    accent: '#16A34A',
    accentLight: 'rgba(22,163,74,0.1)',
    storedKey: 'lesson_plan',
    aiKey: 'lesson_plan_with_ai',
    emptyTitle: 'No lesson plan yet',
    emptyHint: 'Upload a Word document or let AI draft the plan for this subtopic.',
    aiConfirmTitle: 'Generate Lesson Plan with AI',
    aiConfirmText:
      'AI will draft a lesson plan for this topic based on your subject, class and subtopic. Any existing AI content will be overwritten. Continue?',
    aiSuccess: 'Lesson plan generated successfully',
    viewLabel: 'Lesson Plan Preview',
  },
  note: {
    label: 'Lesson Note',
    Icon: IconNotes,
    accent: '#7C3AED',
    accentLight: 'rgba(124,58,237,0.1)',
    storedKey: 'lesson_note',
    aiKey: 'lesson_note_with_ai',
    emptyTitle: 'No lesson note yet',
    emptyHint: 'Upload a Word document or let AI draft the note for this subtopic.',
    aiConfirmTitle: 'Generate Lesson Note with AI',
    aiConfirmText:
      'AI will draft a lesson note for this topic based on your subject, class and subtopic. Any existing AI content will be overwritten. Continue?',
    aiSuccess: 'Lesson note generated successfully',
    viewLabel: 'Lesson Note Preview',
  },
  video: {
    label: 'Video Content',
    Icon: IconVideo,
    accent: '#9333EA',
    accentLight: 'rgba(147,51,234,0.1)',
    storedKey: 'lesson_video',
    aiKey: 'lesson_video_with_ai',
    emptyTitle: 'No video yet',
    emptyHint: 'Upload a video file or let AI generate a video link for this subtopic.',
    aiConfirmTitle: 'Generate Video Link with AI',
    aiConfirmText:
      'AI will generate a video link for this topic based on your subject, class and subtopic. Any existing AI video link will be overwritten. Continue?',
    aiSuccess: 'Video link generated successfully',
    viewLabel: 'Video Preview',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Status chip helper
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  inactive: { label: 'Pending approval', bg: '#FEF3C7', color: '#92400E' },
  active: { label: 'Approved', bg: '#DCFCE7', color: '#166534', icon: IconCheck },
  rejected: { label: 'Rejected', bg: '#FEE2E2', color: '#991B1B' },
};

const StatusChip = ({ status }) => {
  if (!status) {
    return (
      <Chip
        size="small"
        label="Not created yet"
        sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B' }}
      />
    );
  }
  const style = STATUS_STYLE[status] ?? { label: String(status), bg: '#F1F5F9', color: '#64748B' };
  const Icon = style.icon;
  return (
    <Chip
      size="small"
      label={style.label}
      icon={Icon ? <Icon size={13} /> : undefined}
      sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: style.bg, color: style.color, '& .MuiChip-icon': { color: style.color } }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Context header — shows subject, class, week, topic & subtopic at a glance
// ─────────────────────────────────────────────────────────────────────────────
const ContextHeader = ({ cfg, context, statusChip }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2.5,
        borderRadius: '14px',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : cfg.accent + '44',
        background: isDark
          ? `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, ${cfg.accentLight} 100%)`
          : `linear-gradient(135deg, #ffffff 0%, ${cfg.accentLight} 100%)`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}88)` }} />

      <Box sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: cfg.accentLight, color: cfg.accent }}>
              <cfg.Icon size={19} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                {context?.subjectName || 'Subject'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[context?.className, context?.armName].filter(Boolean).join(' – ')}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            {context?.weekName && (
              <Chip
                icon={<IconCalendar size={12} />}
                label={context.weekName}
                size="small"
                sx={{ fontSize: 11, fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}
              />
            )}
            {context?.topic && (
              <Chip
                label={context.topic}
                size="small"
                sx={{ fontSize: 11, fontWeight: 600, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', maxWidth: 180 }}
              />
            )}
            {context?.subtopic && (
              <Chip
                label={context.subtopic}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11, fontWeight: 700, borderColor: cfg.accent, color: cfg.accent, maxWidth: 180 }}
              />
            )}
            {statusChip}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Action chooser cards (Create / Edit | Generate with AI | Upload)
// Matches LessonPlanIndexx/LessonNoteIndexx/LessonVideoIndex pattern
// ─────────────────────────────────────────────────────────────────────────────
const ActionCard = ({ icon: IconC, title, subtitle, onClick, disabled = false, busy = false, variant = 'default' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const styles = {
    default: {
      border: `2px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'}`,
      bg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
      hoverBorder: '#3B82F6',
      hoverBg: isDark ? 'rgba(59,130,246,0.08)' : '#F0F7FF',
      iconBg: isDark ? 'rgba(59,130,246,0.15)' : '#DBEAFE',
      iconColor: '#3B82F6',
    },
    ai: {
      border: `2px solid ${isDark ? 'rgba(139,92,246,0.4)' : '#DDD6FE'}`,
      bg: isDark ? 'rgba(139,92,246,0.08)' : '#FAF5FF',
      hoverBorder: '#8B5CF6',
      hoverBg: isDark ? 'rgba(139,92,246,0.14)' : '#F3EEFF',
      iconBg: isDark ? 'rgba(139,92,246,0.2)' : '#EDE9FE',
      iconColor: '#8B5CF6',
    },
    regenerate: {
      border: `2px solid ${isDark ? 'rgba(245,158,11,0.4)' : '#FEF3C7'}`,
      bg: isDark ? 'rgba(245,158,11,0.08)' : '#FFFBEB',
      hoverBorder: '#F59E0B',
      hoverBg: isDark ? 'rgba(245,158,11,0.14)' : '#FFF9EC',
      iconBg: isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7',
      iconColor: '#F59E0B',
    },
    upload: {
      border: `2px dashed ${isDark ? 'rgba(20,184,166,0.4)' : '#CCFBF1'}`,
      bg: isDark ? 'rgba(20,184,166,0.06)' : '#F0FDFA',
      hoverBorder: '#14B8A6',
      hoverBg: isDark ? 'rgba(20,184,166,0.12)' : '#E6FFFA',
      iconBg: isDark ? 'rgba(20,184,166,0.2)' : '#CCFBF1',
      iconColor: '#14B8A6',
    },
  };

  const s = styles[variant] || styles.default;

  return (
    <Box
      component="button"
      onClick={disabled || busy ? undefined : onClick}
      disabled={disabled || busy}
      sx={{
        width: '100%',
        background: s.bg,
        border: s.border,
        borderRadius: '14px',
        p: 2,
        cursor: disabled || busy ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover:not(:disabled)': {
          borderColor: s.hoverBorder,
          borderStyle: 'solid',
          background: s.hoverBg,
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${s.hoverBorder}22`,
        },
        '&:active:not(:disabled)': { transform: 'translateY(0)' },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 40, height: 40, bgcolor: s.iconBg, color: s.iconColor, flexShrink: 0 }}>
          {busy ? <CircularProgress size={18} sx={{ color: s.iconColor }} /> : <IconC size={20} />}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.3 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress gauge (Teaching Progress sidebar) — a small radial dial reads
// faster than a thin bar at this size, and pairs two side by side so
// "content created" and "actually read by the class" are easy to compare.
// ─────────────────────────────────────────────────────────────────────────────
const ProgressGauge = ({ label, percent, caption, color }) => {
  const value = Math.round(Number(percent) || 0);
  return (
    <Box sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
      <Box sx={{ width: 84, height: 84, mx: 'auto' }}>
        <Chart
          type="radialBar"
          width={84}
          height={84}
          series={[value]}
          options={{
            chart: { sparkline: { enabled: true } },
            colors: [color],
            plotOptions: {
              radialBar: {
                hollow: { size: '60%' },
                track: { background: 'rgba(148,163,184,0.18)' },
                dataLabels: {
                  name: { show: false },
                  value: {
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0f172a',
                    offsetY: 4,
                    formatter: (v) => `${v}%`,
                  },
                },
              },
            },
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#0f172a', mt: 0.25 }}>{label}</Typography>
      <Typography sx={{ fontSize: 9.5, color: 'text.secondary', lineHeight: 1.3, mt: 0.1 }}>
        {caption}
      </Typography>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const LessonContentTab = ({ type, context }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const notify = useNotification();
  const { user } = useAuth();
  const cfg = TAB_CONFIG[type] ?? TAB_CONFIG.note;
  const isVideo = type === 'video';

  const schemeOfWorkId = context?.schemeOfWorkId ?? '';
  const staffSubjectId = context?.staffSubjectId ?? '';
  // Content lives one row per subtopic, so every load, upload, AI call and
  // approval has to say which subtopic of the week it is about.
  const subTopicsId = context?.subTopicsId ?? '';
  const subtopicScope = subTopicsId ? { sub_topics_id: Number(subTopicsId) } : {};

  // ── State ─────────────────────────────────────────────────────────────────
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [teacherProgress, setTeacherProgress] = useState(null);
  const [classProgress, setClassProgress] = useState(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  const stored = record?.[cfg.storedKey] ?? null;
  const aiContent = record?.[cfg.aiKey] ?? null;
  const hasContent = Boolean(stored || aiContent);
  const hasAiContent = Boolean(aiContent);
  const status = record?.status ?? null;
  const contextMissing = !schemeOfWorkId || !staffSubjectId;
  const isApproved = status === 'active';
  const approveLabel = isApproved ? 'Disapprove Lesson Plan' : 'Approve Lesson Plan';

  // ── Data loaders ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (contextMissing) return;
    setLoading(true);
    // Built inside the callback: a fresh object literal in the dependency
    // array would re-run this effect on every render.
    const scope = subTopicsId ? { sub_topics_id: Number(subTopicsId) } : {};
    try {
      const res =
        type === 'plan'
          ? await tenantLessonNoteApi.getLessonPlans(schemeOfWorkId, {
              staff_subject_id: staffSubjectId,
              ...scope,
            })
          : type === 'video'
            ? await tenantLessonNoteApi.getLessonVideos(schemeOfWorkId, {
                staff_subject_id: staffSubjectId,
                ...scope,
              })
            : await tenantLessonNoteApi.getLessonNotes(schemeOfWorkId, {
                staff_subject_id: staffSubjectId,
                ...scope,
              });
      const payload =
        type === 'plan' ? res?.lesson_plans : type === 'video' ? res?.lesson_videos : res?.lesson_notes;
      setRecord(payload ?? null);
    } catch (err) {
      notify.error(apiErrorMessage(err, `Failed to load the ${cfg.label.toLowerCase()}`));
    } finally {
      setLoading(false);
    }
  }, [cfg.label, contextMissing, notify, schemeOfWorkId, staffSubjectId, subTopicsId, type]);

  useEffect(() => {
    load();
  }, [load]);

  // Progress data (Lesson Note sidebar only)
  useEffect(() => {
    if (type !== 'note' || contextMissing) return;
    let cancelled = false;
    const loadProgress = async () => {
      const [teacherRes, classRes] = await Promise.allSettled([
        tenantLessonNoteApi.getTeacherProgress(schemeOfWorkId, {
          subject_id: context?.subjectId,
          sess_term_id: context?.sessionTermId,
          prog_id: context?.progId,
          class_description_id: context?.classArmId,
          teacher_id: user?.id,
          staff_subject_id: staffSubjectId,
        }),
        tenantLessonNoteApi.getClassProgress(schemeOfWorkId, {
          session_term_id: context?.sessionTermId,
          class_description_id: context?.classArmId,
        }),
      ]);
      if (cancelled) return;
      if (teacherRes.status === 'fulfilled') setTeacherProgress(teacherRes.value);
      if (classRes.status === 'fulfilled') setClassProgress(classRes.value);
    };
    loadProgress();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, schemeOfWorkId, contextMissing]);

  const statusChip = useMemo(() => <StatusChip status={status} />, [status]);

  // ── AI generation ─────────────────────────────────────────────────────────
  const handleGenerateAi = async () => {
    setConfirmOpen(false);
    setGenerating(true);
    try {
      const payload = {
        subject_name: context?.subjectName,
        class_name: context?.className,
        staff_subject_id: staffSubjectId,
        ...subtopicScope,
      };
      if (type === 'plan') {
        await tenantLessonNoteApi.generateLessonPlanAi(schemeOfWorkId, user?.id, payload);
      } else if (type === 'video') {
        await tenantLessonNoteApi.generateLessonVideoAi(schemeOfWorkId, user?.id, payload);
      } else {
        await tenantLessonNoteApi.generateLessonNoteAi(schemeOfWorkId, user?.id, payload);
      }
      notify.success(cfg.aiSuccess);
      await load();
    } catch (err) {
      notify.error(aiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  // ── Uploads via modal (matches basic's Create from scratch / Re-upload) ──
  const handleFileUpload = async (dataUrl) => {
    if (isVideo) {
      await tenantLessonNoteApi.uploadLessonVideo({
        ssi: staffSubjectId,
        sowi: schemeOfWorkId,
        videoData: dataUrl,
        ...subtopicScope,
      });
      notify.success('Video uploaded successfully');
    } else if (type === 'plan') {
      await tenantLessonNoteApi.lessonPlanContent({
        ssi: staffSubjectId,
        sowi: schemeOfWorkId,
        textData: dataUrl,
        ...subtopicScope,
      });
      notify.success('Lesson plan document uploaded successfully');
    } else {
      await tenantLessonNoteApi.addlessonNoteContent({
        scheme_of_work_id: Number(schemeOfWorkId),
        staff_subject_id: staffSubjectId,
        textData: dataUrl,
        ...subtopicScope,
      });
      notify.success('Lesson note document uploaded successfully');
    }
    await load();
  };

  const youtubeId = getYouTubeId(aiContent || '');
  const uploadedVideo = firstFileUrl(record?.lesson_video);

  // ── Approve / Disapprove (Lesson Plan, matches basic) ─────────────────────
  const handleApproveToggle = async () => {
    setApproveConfirmOpen(false);
    setApproving(true);
    try {
      const res = await tenantLessonNoteApi.approveLessonPlan({
        staff_subject_id: staffSubjectId,
        scheme_of_work_id: Number(schemeOfWorkId),
        ...subtopicScope,
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

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (contextMissing) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Missing lesson context. Close this tab, open the subject again from the Teaching Resources list.
      </Alert>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Context header ──────────────────────────────────────────────── */}
      <ContextHeader cfg={cfg} context={context} statusChip={statusChip} />

      <Grid container spacing={1}>
        {/* ── Main column ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 8 }}>

          {/* ── Action chooser row (matches basic: Upload | AI) ───────── */}
          <Grid container spacing={1} mb={1}>
            {isVideo ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ActionCard
                    icon={IconUpload}
                    title={hasContent ? 'Re-upload' : 'Create from scratch'}
                    subtitle={hasContent ? 'Upload a new video file' : 'Upload a video file to start'}
                    variant="upload"
                    busy={generating}
                    onClick={() => setUploadModalOpen(true)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ActionCard
                    icon={hasAiContent ? IconRefresh : IconSparkles}
                    title={hasAiContent ? 'Re-generate with AI' : 'Generate with AI'}
                    subtitle={hasAiContent ? 'Generate a fresh AI video link for this subtopic' : 'Let AI find a video link for this subtopic'}
                    variant={hasAiContent ? 'regenerate' : 'ai'}
                    busy={generating}
                    onClick={() => setConfirmOpen(true)}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ActionCard
                    icon={IconUpload}
                    title={hasContent ? 'Re-upload' : 'Create from scratch'}
                    subtitle={hasContent ? 'Upload a new Word document' : 'Upload a Word document (.doc, .docx)'}
                    variant="upload"
                    busy={generating}
                    onClick={() => setUploadModalOpen(true)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ActionCard
                    icon={hasAiContent ? IconRefresh : IconSparkles}
                    title={hasAiContent ? 'Re-generate with AI' : 'Generate with AI'}
                    subtitle={hasAiContent ? 'Generate fresh AI content for this subtopic' : 'Let AI draft this content for you'}
                    variant={hasAiContent ? 'regenerate' : 'ai'}
                    busy={generating}
                    onClick={() => setConfirmOpen(true)}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* ── Loading skeleton ─────────────────────────────────────── */}
          {loading && <Skeleton variant="rounded" height={340} sx={{ borderRadius: '14px' }} />}

          {/* ── Empty state ──────────────────────────────────────────── */}
          {!loading && !hasContent && (
            <Paper
              variant="outlined"
              sx={{
                borderStyle: 'dashed',
                borderRadius: '14px',
                textAlign: 'center',
                py: 6,
                px: 3,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: cfg.accentLight,
                  color: cfg.accent,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <cfg.Icon size={32} />
              </Avatar>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {cfg.emptyTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" maxWidth={400} mx="auto">
                {cfg.emptyHint}
              </Typography>
            </Paper>
          )}

          {/* ── Saved content viewer (plan / note) ──────────────────── */}
          {!loading && hasContent && !isVideo && (
            <Card
              variant="outlined"
              sx={{
                borderRadius: '14px',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'center' }}
                  spacing={1}
                  mb={1.5}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <cfg.Icon size={18} color={cfg.accent} />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Saved {cfg.label}
                    </Typography>
                    <StatusChip status={status} />
                    {hasAiContent && (
                      <Chip
                        label="AI generated"
                        size="small"
                        icon={<IconSparkles size={11} />}
                        sx={{ fontSize: 10, fontWeight: 600, bgcolor: 'rgba(139,92,246,0.1)', color: '#7C3AED' }}
                      />
                    )}
                  </Stack>
                  {record?.updated_at && (
                    <Typography variant="caption" color="text.secondary">
                      Updated {record.updated_at}
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* An upload and an AI draft are not mutually exclusive — a
                    teacher who uploaded a file and later generated AI content
                    (or vice versa) should still be able to see both, each
                    clearly labelled, instead of one silently hiding the other. */}
                <Stack spacing={2}>
                  {stored && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
                        border: '1px solid',
                        borderColor: 'divider',
                        minHeight: 120,
                      }}
                    >
                      {hasAiContent && (
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25 }}>
                          <IconUpload size={13} color={cfg.accent} />
                          <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: cfg.accent, letterSpacing: 0.3 }}>
                            UPLOADED {cfg.label.toUpperCase()}
                          </Typography>
                        </Stack>
                      )}
                      {isDocumentLink(stored) ? (
                        <DocxPreview url={stored} />
                      ) : (
                        <RichContentView content={stored} />
                      )}
                    </Box>
                  )}

                  {aiContent && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(124,58,237,0.05)' : '#FAF5FF',
                        border: '1px solid',
                        borderColor: 'rgba(124,58,237,0.2)',
                        minHeight: 120,
                      }}
                    >
                      {stored && (
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25 }}>
                          <IconSparkles size={13} color="#7C3AED" />
                          <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#7C3AED', letterSpacing: 0.3 }}>
                            AI-GENERATED {cfg.label.toUpperCase()}
                          </Typography>
                        </Stack>
                      )}
                      <RichContentView content={aiContent} />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ── Saved video viewer ────────────────────────────────── */}
          {!loading && hasContent && isVideo && (
            <Card
              variant="outlined"
              sx={{ borderRadius: '14px', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <cfg.Icon size={18} color={cfg.accent} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Saved Video
                  </Typography>
                  <StatusChip status={status} />
                  {hasAiContent && (
                    <Chip
                      label="AI generated link"
                      size="small"
                      icon={<IconSparkles size={11} />}
                      sx={{ fontSize: 10, fontWeight: 600, bgcolor: 'rgba(139,92,246,0.1)', color: '#7C3AED' }}
                    />
                  )}
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* An AI-found link doesn't erase an uploaded file — both can
                    show, each labelled, the same as the plan/note tabs. */}
                {uploadedVideo && (
                  <Box sx={{ mb: 2 }}>
                    {(youtubeId || aiContent) && (
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                        <IconUpload size={13} color={cfg.accent} />
                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: cfg.accent, letterSpacing: 0.3 }}>
                          UPLOADED VIDEO
                        </Typography>
                      </Stack>
                    )}
                    <Box
                      sx={{
                        position: 'relative',
                        pt: '56.25%',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        mb: 1,
                        bgcolor: '#000',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      }}
                    >
                      <video
                        controls
                        src={toAbsoluteUrl(uploadedVideo)}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderRadius: '10px' }}
                      href={toAbsoluteUrl(uploadedVideo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<IconVideo size={16} />}
                    >
                      Open uploaded video file
                    </Button>
                  </Box>
                )}

                {youtubeId ? (
                  <Box>
                    {uploadedVideo && (
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                        <IconSparkles size={13} color="#7C3AED" />
                        <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: '#7C3AED', letterSpacing: 0.3 }}>
                          AI-GENERATED VIDEO
                        </Typography>
                      </Stack>
                    )}
                    <Box
                      sx={{
                        position: 'relative',
                        pt: '56.25%',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        mb: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      }}
                    >
                      <iframe
                        title="lesson-video"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </Box>
                  </Box>
                ) : aiContent ? (
                  <Alert
                    severity="info"
                    sx={{ mb: 2, borderRadius: '10px' }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        href={toAbsoluteUrl(aiContent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<IconPlayerPlay size={13} />}
                      >
                        Open
                      </Button>
                    }
                  >
                    A video link is saved for this lesson.
                  </Alert>
                ) : null}

                {/* Replace CTA */}
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconUpload size={14} />}
                    onClick={() => setUploadModalOpen(true)}
                    sx={{ borderColor: cfg.accent, color: cfg.accent }}
                  >
                    Re-upload
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ── Approve / Disapprove Lesson Plan (matches basic) ──────── */}
          {type === 'plan' && !loading && hasContent && (
            <Stack direction="row" justifyContent="flex-end" mt={2.5}>
              <Button
                variant={isApproved ? 'outlined' : 'contained'}
                color={isApproved ? 'error' : 'success'}
                disabled={approving}
                onClick={() => setApproveConfirmOpen(true)}
                startIcon={
                  approving ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : isApproved ? (
                    <IconX size={16} />
                  ) : (
                    <IconCheck size={16} />
                  )
                }
              >
                {approveLabel}
              </Button>
            </Stack>
          )}
        </Grid>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, lg: 4 }}>

          {/* Tips (Lesson Plan) */}
          {type === 'plan' && (
            <Card
              variant="outlined"
              sx={{ mb: 2.5, borderRadius: '14px', borderColor: '#F59E0B44' }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#FFFBEB', color: '#F59E0B' }}>
                    <IconBulb size={15} />
                  </Avatar>
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
                          bgcolor: cfg.accent,
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
          )}

          {/* Teaching progress (Lesson Note) — two gauges + a plain-language
              read on whether the class is keeping up with what's published */}
          {type === 'note' && (
            <Card
              variant="outlined"
              sx={{ mb: 2.5, borderRadius: '14px', borderColor: '#0284C744', overflow: 'hidden' }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#E0F2FE', color: '#0284C7' }}>
                    <IconTrendingUp size={15} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Teaching Progress
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <ProgressGauge
                    label="Lessons Generated"
                    percent={teacherProgress?.lesson_notes_percent}
                    caption={`${teacherProgress?.note_total_count ?? 0} of ${teacherProgress?.total_subtopics ?? 0} topics`}
                    color="#0284C7"
                  />
                  <ProgressGauge
                    label="Class Engagement"
                    percent={classProgress?.read_percentage}
                    caption={`${classProgress?.read_count ?? 0} of ${classProgress?.enrolled_count ?? 0} learners`}
                    color="#16A34A"
                  />
                </Stack>

                {(() => {
                  const genPercent = Number(teacherProgress?.lesson_notes_percent) || 0;
                  const engPercent = Number(classProgress?.read_percentage) || 0;
                  let insight;
                  if (genPercent === 0) {
                    insight = {
                      Icon: IconBulb,
                      bg: '#FEF3C7',
                      color: '#92400E',
                      text: "Nothing generated yet for this subject — this subtopic is a good place to start.",
                    };
                  } else if (engPercent + 5 >= genPercent) {
                    insight = {
                      Icon: IconCheck,
                      bg: '#DCFCE7',
                      color: '#166534',
                      text: 'Your class is keeping pace with what you’ve published — nice work.',
                    };
                  } else {
                    insight = {
                      Icon: IconTrendingUp,
                      bg: '#FFEDD5',
                      color: '#9A3412',
                      text: 'Content is ahead of class engagement — consider nudging learners to catch up.',
                    };
                  }
                  return (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                      sx={{ mt: 1.75, p: 1.1, borderRadius: '10px', bgcolor: insight.bg }}
                    >
                      <insight.Icon size={15} color={insight.color} style={{ flexShrink: 0, marginTop: 1 }} />
                      <Typography sx={{ fontSize: 11, color: insight.color, fontWeight: 600, lineHeight: 1.4 }}>
                        {insight.text}
                      </Typography>
                    </Stack>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Video details (Video tab) — a quick snapshot rather than a
              plain label/value list, so the source and status jump out */}
          {isVideo && (
            <Card
              variant="outlined"
              sx={{ mb: 2.5, borderRadius: '14px', overflow: 'hidden' }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: cfg.accentLight, color: cfg.accent }}>
                    <IconInfoCircle size={15} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Lesson Snapshot
                  </Typography>
                </Stack>

                {/* Source + status banner */}
                {(() => {
                  const source = youtubeId
                    ? { label: 'YouTube link', bg: '#FEE2E2', color: '#991B1B' }
                    : uploadedVideo
                      ? { label: 'Uploaded file', bg: '#CCFBF1', color: '#0D9488' }
                      : hasAiContent
                        ? { label: 'AI-generated link', bg: '#F3E8FF', color: '#7C3AED' }
                        : { label: 'No video yet', bg: '#F1F5F9', color: '#64748B' };
                  return (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1.5, p: 1, borderRadius: '10px', bgcolor: source.bg }}
                    >
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: source.color }}>
                        {source.label}
                      </Typography>
                      <StatusChip status={status} />
                    </Stack>
                  );
                })()}

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0.9,
                  }}
                >
                  {[
                    { label: 'Subject', value: context?.subjectName },
                    { label: 'Class', value: [context?.className, context?.armName].filter(Boolean).join(' – ') },
                    { label: 'Subtopic', value: context?.subtopic },
                    { label: 'Week', value: context?.weekName },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{
                        p: 1,
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FAFBFC',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                        minWidth: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.3 }}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', wordBreak: 'break-word', mt: 0.1 }}
                      >
                        {value || '—'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Class Interaction forum (Lesson Note + Video tabs only — matches basic) */}
          {(type === 'note' || isVideo) && (
            <Card
              variant="outlined"
              sx={{ mb: 2.5, borderRadius: '14px', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
            >
              <CardContent>
                {record?.id ? (
                  <ForumThread modelId={record.id} height={380} />
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '8px' }}>
                    Create the {cfg.label.toLowerCase()} first to enable the class discussion thread.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* ── AI generation confirmation modal ───────────────────────────── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 38, height: 38, bgcolor: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
              <IconSparkles size={20} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {cfg.aiConfirmTitle}
              </Typography>
              {context?.subtopic && (
                <Typography variant="caption" color="text.secondary">
                  For: {context.subtopic}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>
            {cfg.aiConfirmText}
          </DialogContentText>

          {/* Context preview inside modal */}
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(139,92,246,0.05)' : '#FAF5FF',
              borderColor: 'rgba(139,92,246,0.2)',
            }}
          >
            <Grid container spacing={1}>
              {[
                { label: 'Subject', value: context?.subjectName },
                { label: 'Class', value: [context?.className, context?.armName].filter(Boolean).join(' – ') },
                { label: 'Topic', value: context?.topic },
                { label: 'Subtopic', value: context?.subtopic },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <Grid key={label} size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                  <Typography variant="caption" fontWeight={700}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setConfirmOpen(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateAi}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={15} color="inherit" /> : <IconSparkles size={16} />}
            sx={{ bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' }, minWidth: 140 }}
          >
            {generating ? 'Generating…' : 'Yes, generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Approve / Disapprove confirmation (Lesson Plan) ────────────── */}
      <Dialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
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

      {/* ── Upload modal (matches basic's Create from scratch / Re-upload) ─ */}
      <LessonUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={
          isVideo
            ? hasContent ? 'Re-upload Video' : 'Upload Video'
            : hasContent ? `Re-upload ${cfg.label}` : `Upload ${cfg.label}`
        }
        subtitle={isVideo ? 'MP4, MPEG or AVI supported' : 'Word document (.doc, .docx)'}
        accept={isVideo ? 'video/*' : '.doc,.docx'}
        uploadLabel={isVideo ? 'video' : 'document'}
        maxMB={isVideo ? 50 : 10}
        onUpload={handleFileUpload}
      />
    </Box>
  );
};

export default LessonContentTab;