import { Box, Grid, Avatar, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

// ── Stage definitions ─────────────────────────────────────────────────────────
const STAGES = [
  { key: 'application', label: 'Application', sub: 'Complete', subColor: 'success.dark' },
  { key: 'entrance_exam', label: 'Entrance Exam', sub: 'In Progress', subColor: 'warning.main' },
  { key: 'admitted', label: 'Admitted', sub: 'Pending', subColor: 'text.disabled' },
  { key: 'print_form', label: 'Print Form', sub: 'Locked', subColor: 'error.dark' },
  { key: 'enrollment', label: 'Enrollment', sub: 'Locked', subColor: 'error.main' },
];

// ── Progress tracker ──────────────────────────────────────────────────────────
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
            minWidth: 64,
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
              width: 32,
              height: 32,
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
              <CheckCircleIcon sx={{ color: '#fff', fontSize: 18 }} />
            ) : (
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {i + 1}
              </Typography>
            )}
          </Box>

          <Typography
            variant="caption"
            textAlign="center"
            mt={0.5}
            fontWeight={active ? 700 : 500}
            color={done || active ? '#100f0ff1' : 'text.secondary'}
            sx={{ fontSize: 10, lineHeight: 1.2 }}
          >
            {stage.label}
          </Typography>

          <Typography
            variant="caption"
            textAlign="center"
            sx={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              color: 'success.dark',
              // color: active ? 'warning.dark' : stage.subColor,
            }}
          >
            {stage.sub}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

// ── Main export ───────────────────────────────────────────────────────────────
const TrackerHeader = ({ name, intendingClass, gender, address, photo, currentStage }) => (
  <Grid container spacing={2} sx={{ mb: 3 }} alignItems="stretch">
    {/* Applicant card */}
    <Grid size={{ lg: 12 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(90deg, #FFF9ED 0%, #FFEFEC 100%)',
          borderRadius: 3,
          p: 3,
          height: '100%',
        }}
      >
        {/* Avatar */}
        <Avatar
          // src={photo}
          sx={{
            width: 100,
            height: 100,
            border: '3px solid',
            // borderColor: 'primary.light',
            flexShrink: 0,
          }}
        />

        {/* Student info — allowed to shrink if needed */}
        <Box sx={{ flexShrink: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
            {name}
          </Typography>
          <Typography variant="body2" color="success.dark" fontWeight={600}>
            Intending Class : {intendingClass}
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            Gender : {gender}
          </Typography>
          <Typography variant="caption" color="warning.dark" fontWeight={500}>
            Parent Address:
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {address}
          </Typography>
        </Box>

        {/* Progress tracker — fixed space, never shrinks */}
        <Box sx={{ ml: 'auto', flexShrink: 0, flexBasis: '55%' }}>
          <ProgressTracker currentStage={currentStage} />
        </Box>
      </Box>
    </Grid>
  </Grid>
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
