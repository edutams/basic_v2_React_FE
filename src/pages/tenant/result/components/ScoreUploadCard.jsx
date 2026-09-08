import { Box, Typography, Paper, Chip, Button, LinearProgress, useTheme } from '@mui/material';
import { IconCloudUpload, IconEye, IconCheck, IconLoader } from '@tabler/icons-react';

const ScoreUploadCard = ({
  allocation,
  onUploadScore,
  onViewScoreSheet,
  onSubmitScore,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalReg = allocation?.total_reg || allocation?.studentCount || 0;
  const caUploaded = allocation?.ca1_count ?? allocation?.caUploaded ?? 0;
  const examUploaded = allocation?.exam_upload_count ?? allocation?.examUploaded ?? 0;

  const caProgress = totalReg > 0 ? Math.round((caUploaded / totalReg) * 100) : 0;
  const examProgress = totalReg > 0 ? Math.round((examUploaded / totalReg) * 100) : 0;

  const isSubmitted = allocation?.teacher_submit === 'yes' || allocation?.isSubmitted || allocation?.submissionStatus === 'Submitted';
  const isSubmitting = allocation?.isSubmitting || false;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)',
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      {/* ── Top Header Section (Light Green Tint) ─────────────── */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: isDark ? 'rgba(243, 247, 228, 0.06)' : '#F3F7E4',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E6EBCB',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.75 }}>
          <Chip
            label={allocation.className}
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
          sx={{ mb: 1, fontSize: '0.925rem', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={allocation.subject_name}
        >
          {allocation.subject_name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.75 }}>
          <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Registered learners: <strong>{totalReg}</strong>
          </Typography>

          <Box>
            {isSubmitting ? (
              <Chip
                icon={<IconLoader size={12} className="fa-spin" />}
                label="Processing..."
                size="small"
                color="secondary"
                sx={{ fontWeight: 600, fontSize: '11px', height: '22px' }}
              />
            ) : isSubmitted ? (
              <Chip
                icon={<IconCheck size={12} />}
                label="Submitted"
                size="small"
                color="success"
                sx={{ fontWeight: 600, fontSize: '11px', height: '22px' }}
              />
            ) : totalReg > 0 ? (
              <Button
                variant="contained"
                size="small"
                color="warning"
                onClick={() => onSubmitScore && onSubmitScore(allocation)}
                sx={{
                  fontWeight: 600,
                  fontSize: '11px',
                  textTransform: 'none',
                  px: 1.2,
                  py: 0.2,
                  minHeight: '24px',
                  borderRadius: '4px',
                  boxShadow: 'none',
                }}
              >
                Submit Score
              </Button>
            ) : null}
          </Box>
        </Box>
      </Box>

      {/* ── Content Section with Progress Bars ───────────────── */}
      <Box sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {/* C.A Upload Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: '0.775rem' }}>
              C.A Upload Progress
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontSize: '0.775rem' }}>
              {caProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={caProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
              '& .MuiLinearProgress-bar': {
                backgroundColor: caProgress > 0 ? '#1B7A16' : '#CCCCCC',
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.7rem' }}>
            {caUploaded} out of {totalReg} learners score record
          </Typography>
        </Box>

        {/* Exam Upload Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: '0.775rem' }}>
              Exam Upload Progress
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontSize: '0.775rem' }}>
              {examProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={examProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
              '& .MuiLinearProgress-bar': {
                backgroundColor: examProgress > 0 ? '#1B7A16' : '#CCCCCC',
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.7rem' }}>
            {examUploaded} out of {totalReg} learners score record
          </Typography>
        </Box>

        {/* Submission Status Indicator Banner */}
        <Box
          sx={{
            py: 0.5,
            px: 1,
            borderRadius: '4px',
            backgroundColor: isSubmitted
              ? (isDark ? 'rgba(76, 175, 80, 0.15)' : '#EAF4D8')
              : (isDark ? 'rgba(33, 150, 243, 0.15)' : '#D7EEFD'),
            textAlign: 'center',
            mt: 'auto',
          }}
        >
          <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ fontSize: '0.725rem' }}>
            Submission Status:{' '}
            <Typography
              component="span"
              variant="caption"
              fontWeight={700}
              color={isSubmitted ? 'success.main' : 'error.main'}
              sx={{ fontSize: '0.725rem' }}
            >
              {isSubmitted ? 'Submitted' : 'Pending'}
            </Typography>
          </Typography>
        </Box>
      </Box>

      {/* ── Action Buttons Footer ────────────────────────────── */}
      <Box
        sx={{
          p: 1.25,
          pt: 1,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {!isSubmitted && (
          <Button
            fullWidth
            variant="contained"
            color="warning"
            size="small"
            startIcon={<IconCloudUpload size={14} />}
            onClick={() => onUploadScore && onUploadScore(allocation)}
            sx={{
              fontWeight: 600,
              fontSize: '11px',
              textTransform: 'none',
              py: 0.5,
              borderRadius: '5px',
            }}
          >
            Upload Score
          </Button>
        )}
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<IconEye size={14} />}
          onClick={() => onViewScoreSheet && onViewScoreSheet(allocation)}
          sx={{
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'none',
            py: 0.5,
            borderRadius: '5px',
          }}
        >
          Score Sheet
        </Button>
      </Box>
    </Paper>
  );
};

export default ScoreUploadCard;
