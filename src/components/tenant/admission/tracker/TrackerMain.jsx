import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as LockedIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const FormSubmittedCard = ({ submittedDate, onViewDetails }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 3,
      p: { xs: 2, sm: 2.5 },
      mb: 2,
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: 2,
      borderLeft: '4px solid',
      borderLeftColor: 'success.dark',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: 'success.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 28 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="success.dark"
          fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          Form Submitted
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Application form has been reviewed and validated.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Submitted on {submittedDate}
        </Typography>
      </Box>
    </Box>

    <Button
      variant="outlined"
      size="small"
      onClick={onViewDetails}
      sx={{
        fontWeight: 600,
        borderRadius: 2,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        alignSelf: { xs: 'flex-end', sm: 'center' },
      }}
    >
      View Form Details
    </Button>
  </Paper>
);

FormSubmittedCard.propTypes = {
  submittedDate: PropTypes.string,
  onViewDetails: PropTypes.func,
};

const CurrentStageCard = ({
  stageTitle,
  stageDescription,
  requirementStatus,
  timeLimit,
  onStart,
  onPractice,
}) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, mb: 2, bgcolor: '#F7F9FF' }}>
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

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          Current Stage
        </Typography>
        <Typography
          variant="h5"
          fontWeight={800}
          lineHeight={1.2}
          sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
        >
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
          fontSize: { xs: 10, sm: 11 },
          borderRadius: 2,
          height: 28,
          flexShrink: 0,
        }}
      />
    </Box>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ pl: { xs: 0, sm: 7 }, mb: 2, lineHeight: 1.6 }}
    >
      {stageDescription}
    </Typography>

    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: 'info.light',
        px: { xs: 2, sm: 2.5 },
        py: { xs: 1.5, sm: 2 },
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
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

    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1.5}>
      <Button
        variant="contained"
        onClick={onStart}
        fullWidth
        sx={{ fontWeight: 700, py: 1.5, borderRadius: 2 }}
      >
        Start {stageTitle}
      </Button>
      <Button
        variant="outlined"
        onClick={onPractice}
        fullWidth
        sx={{ fontWeight: 700, py: 1.5, borderRadius: 2 }}
      >
        Practice Test
      </Button>
    </Box>
  </Paper>
);

CurrentStageCard.propTypes = {
  stageTitle: PropTypes.string.isRequired,
  stageDescription: PropTypes.string,
  requirementStatus: PropTypes.string,
  timeLimit: PropTypes.string,
  onStart: PropTypes.func,
  onPractice: PropTypes.func,
};

const NextStepCard = ({ title, description, actionLabel, actionDisabled, onAction }) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      gap={2}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'grey.100',
            border: '1px solid',
            borderColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LockedIcon sx={{ color: 'grey.500', fontSize: 22 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Next Step
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        disabled={actionDisabled}
        onClick={onAction}
        sx={{
          fontWeight: 700,
          borderRadius: 2,
          flexShrink: 0,
          alignSelf: { xs: 'flex-end', sm: 'center' },
          whiteSpace: 'nowrap',
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  </Paper>
);

NextStepCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  actionDisabled: PropTypes.bool,
  onAction: PropTypes.func,
};

const TrackerMain = ({
  submittedDate,
  onViewDetails = () => {},
  stageTitle,
  stageDescription,
  requirementStatus,
  timeLimit,
  onStart = () => {},
  onPractice = () => {},
  nextTitle,
  nextDescription,
  nextActionLabel,
  nextActionDisabled = false,
  onNextAction = () => {},
}) => (
  <Box>
    <FormSubmittedCard submittedDate={submittedDate} onViewDetails={onViewDetails} />
    <CurrentStageCard
      stageTitle={stageTitle}
      stageDescription={stageDescription}
      requirementStatus={requirementStatus}
      timeLimit={timeLimit}
      onStart={onStart}
      onPractice={onPractice}
    />
    <NextStepCard
      title={nextTitle}
      description={nextDescription}
      actionLabel={nextActionLabel}
      actionDisabled={nextActionDisabled}
      onAction={onNextAction}
    />
  </Box>
);

TrackerMain.propTypes = {
  submittedDate: PropTypes.string,
  onViewDetails: PropTypes.func,
  stageTitle: PropTypes.string.isRequired,
  stageDescription: PropTypes.string,
  requirementStatus: PropTypes.string,
  timeLimit: PropTypes.string,
  onStart: PropTypes.func,
  onPractice: PropTypes.func,
  nextTitle: PropTypes.string.isRequired,
  nextDescription: PropTypes.string,
  nextActionLabel: PropTypes.string,
  nextActionDisabled: PropTypes.bool,
  onNextAction: PropTypes.func,
};

export default TrackerMain;