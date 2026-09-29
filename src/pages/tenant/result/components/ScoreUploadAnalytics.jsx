import { Box, Typography, Paper, Grid, LinearProgress, useTheme } from '@mui/material';

const ScoreUploadAnalytics = ({ analyticsData }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const caUploaded = analyticsData?.ca_scores?.uploaded || 0;
  const caTotal = analyticsData?.ca_scores?.total || 0;
  const caPercentage = analyticsData?.ca_scores?.percentage || 0;

  const examUploaded = analyticsData?.exam_scores?.uploaded || 0;
  const examTotal = analyticsData?.exam_scores?.total || 0;
  const examPercentage = analyticsData?.exam_scores?.percentage || 0;

  const submittedSubjects = analyticsData?.score_submission?.submitted || 0;
  const totalSubjects = analyticsData?.score_submission?.total || 0;
  const submissionPercentage = analyticsData?.score_submission?.percentage || 0;

  const formatNum = (num) => (num ? num.toLocaleString() : '0');

  const cardStyle = {
    p: { xs: 1.5, sm: 2 },
    borderRadius: '10px',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB',
    backgroundColor: isDark ? theme.palette.background.paper : '#FFFFFF',
    textAlign: 'center',
    height: '100%',
  };

  const progressBoxStyle = {
    p: 1.25,
    mt: 1,
    borderRadius: '6px',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E1E1E1',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFBFD',
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Grid container spacing={2}>
        {/* C.A Scores Upload */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={cardStyle}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" align="center" sx={{ fontSize: '0.875rem' }}>
              C.A Scores Upload
            </Typography>
            <Box sx={progressBoxStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, caPercentage))}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFA07A33',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: caPercentage > 0 ? '#4CAF50' : '#CCCCCC',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={800} sx={{ minWidth: 42, textAlign: 'right', fontSize: '0.95rem' }}>
                  {caPercentage}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                {formatNum(caUploaded)} C.A Scores out of {formatNum(caTotal)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Exam Scores Upload */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={cardStyle}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" align="center" sx={{ fontSize: '0.875rem' }}>
              Exam Scores Upload
            </Typography>
            <Box sx={progressBoxStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, examPercentage))}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFA07A33',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: examPercentage > 0 ? '#4CAF50' : '#CCCCCC',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={800} sx={{ minWidth: 42, textAlign: 'right', fontSize: '0.95rem' }}>
                  {examPercentage}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                {formatNum(examUploaded)} Exam Scores out of {formatNum(examTotal)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Score Submission */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={cardStyle}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" align="center" sx={{ fontSize: '0.875rem' }}>
              Score Submission
            </Typography>
            <Box sx={progressBoxStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, submissionPercentage))}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFA07A33',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: submissionPercentage > 0 ? '#4CAF50' : '#CCCCCC',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={800} sx={{ minWidth: 42, textAlign: 'right', fontSize: '0.95rem' }}>
                  {submissionPercentage}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                {formatNum(submittedSubjects)} Submitted out of {formatNum(totalSubjects)} Subjects
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScoreUploadAnalytics;
