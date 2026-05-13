import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const CurrentStageCard = ({
  stageTitle,
  stageDescription,
  requirementStatus,
  timeLimit,
  onStart,
  onPractice,
}) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 2, bgcolor: '#F7F9FF' }}>
    {/* Header row */}
    <Box display="flex" alignItems="center" gap={1} mb={1}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: '#E8EDF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <CalendarIcon sx={{ color: 'primary.main', fontSize: 22 }} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          Current Stage
        </Typography>
        <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
          {stageTitle}
        </Typography>
      </Box>

      <Chip
        label="ACTIVE NOW"
        size="small"
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          fontWeight: 700,
          fontSize: 11,
          borderRadius: 2,
          height: 28,
        }}
      />
    </Box>

    <Typography variant="body2" color="text.secondary" mb={2}>
      {stageDescription}
    </Typography>

    {/* Status row */}
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        px: 2.5,
        py: 1.5,
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          Requirement Status
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
          {requirementStatus}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          Time Limit
        </Typography>
        <Typography variant="subtitle1" fontWeight={700}>
          {timeLimit}
        </Typography>
      </Box>
    </Paper>

    {/* Action buttons */}
    <Box display="flex" gap={1.5}>
      <Button
        variant="contained"
        onClick={onStart}
        sx={{
          flex: 1,
          fontWeight: 700,
          py: 1.5,
          borderRadius: 2,
          bgcolor: '#1A2B5F',
          '&:hover': { bgcolor: '#0F1E4A' },
        }}
      >
        Start Entrance Exam
      </Button>
      <Button
        variant="outlined"
        onClick={onPractice}
        sx={{ flex: 1, fontWeight: 700, py: 1.5, borderRadius: 2 }}
      >
        Practice Test
      </Button>
    </Box>
  </Paper>
);

CurrentStageCard.propTypes = {
  stageTitle:        PropTypes.string.isRequired,
  stageDescription:  PropTypes.string,
  requirementStatus: PropTypes.string,
  timeLimit:         PropTypes.string,
  onStart:           PropTypes.func,
  onPractice:        PropTypes.func,
};

export default CurrentStageCard;
