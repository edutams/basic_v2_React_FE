import { Box, Grid, Avatar, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const STAGES = [
  { key: 'application', label: 'Application', sub: 'Complete', subColor: 'success.dark' },
  { key: 'entrance_exam', label: 'Entrance Exam', sub: 'In Progress', subColor: 'warning.main' },
  { key: 'admitted', label: 'Admitted', sub: 'Pending', subColor: 'text.disabled' },
  { key: 'print_form', label: 'Print Form', sub: 'Locked', subColor: 'error.dark' },
  { key: 'enrollment', label: 'Enrollment', sub: 'Locked', subColor: 'error.main' },
];

const ProgressTracker = ({ currentStage }) => (
  <Box
    sx={{
      border: '3px solid',
      borderColor: '#BDE0C7',
      borderRadius: 3,
      p: { xs: 1.5, sm: 2 },
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      height: '100%',
      minHeight: 80,
    }}
  >
    {STAGES.map((stage, i) => {
      const done = i < currentStage;
      const active = i === currentStage;

      return (
        <Box
          key={stage.key}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            minWidth: { xs: 52, sm: 64 },
            position: 'relative',
          }}
        >
          {/* Left connector */}
          {i > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 15,
                left: 0,
                width: '50%',
                height: 2,
                bgcolor: done || active ? 'success.dark' : 'grey.300',
                zIndex: 0,
              }}
            />
          )}
          {/* Right connector */}
          {i < STAGES.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 15,
                right: 0,
                width: '50%',
                height: 2,
                bgcolor: done ? 'success.dark' : 'grey.300',
                zIndex: 0,
              }}
            />
          )}

          {/* Circle */}
          <Box
            sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              borderRadius: '50%',
              zIndex: 1,
              position: 'relative',
              bgcolor: done || active ? 'success.dark' : 'grey.200',
              border: '2px solid',
              borderColor: done || active ? 'success.dark' : 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {done || active ? (
              <CheckCircleIcon sx={{ color: '#fff', fontSize: { xs: 15, sm: 18 } }} />
            ) : (
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ fontSize: { xs: 9, sm: 11 } }}
              >
                {i + 1}
              </Typography>
            )}
          </Box>

          {/* Stage label */}
          <Typography
            variant="caption"
            textAlign="center"
            mt={0.5}
            fontWeight={active ? 700 : 500}
            color={done || active ? 'text.primary' : 'text.secondary'}
            sx={{ fontSize: { xs: 9, sm: 10 }, lineHeight: 1.2 }}
          >
            {stage.label}
          </Typography>

          {/* Sub-label */}
          <Typography
            variant="caption"
            textAlign="center"
            sx={{
              fontSize: { xs: 8, sm: 9 },
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              color: active ? 'warning.main' : stage.subColor,
            }}
          >
            {stage.sub}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

const TrackerHeader = ({ name, intendingClass, gender, address, photo, currentStage }) => (
 <Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: { xs: 'flex-start', md: 'center' },
    gap: { xs: 2, md: 3 },
    background: 'linear-gradient(90deg, #FFF9ED 0%, #FFEFEC 100%)',
    borderRadius: 3,
    p: { xs: 2, sm: 3 },
    width: '100%',
    boxSizing: 'border-box',
    mb: 3,
  }}
>
  {/* Avatar + info */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
    <Avatar
      src={photo}
      sx={{
        width: { xs: 64, sm: 100 },
        height: { xs: 64, sm: 100 },
        border: '3px solid',
        borderColor: 'primary.light',
        flexShrink: 0,
      }}
    />
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" fontWeight={800} noWrap>{name}</Typography>
      <Typography variant="body2" color="success.dark" fontWeight={600}>Intending Class : {intendingClass}</Typography>
      <Typography variant="body2" fontWeight={500}>Gender : {gender}</Typography>
      <Typography variant="caption" color="warning.dark">Parent Address:</Typography>
      <Typography variant="caption" color="text.secondary" display="block">{address}</Typography>
    </Box>
  </Box>

  {/* Progress tracker */}
  <Box sx={{ ml: 'auto', flexShrink: 0, width: { xs: '100%', md: '55%' } }}>
    <ProgressTracker currentStage={currentStage} />
  </Box>
</Box>
);

TrackerHeader.propTypes = {
  name: PropTypes.string.isRequired,
  intendingClass: PropTypes.string,
  gender: PropTypes.string,
  address: PropTypes.string,
  photo: PropTypes.string,
  currentStage: PropTypes.number,
};

TrackerHeader.defaultProps = {
  currentStage: 1,
};

export default TrackerHeader;
