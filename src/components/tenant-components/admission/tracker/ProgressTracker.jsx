import { Box, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const STAGES = [
  { key: 'application',   label: 'Application',   sub: 'Complete'    },
  { key: 'entrance_exam', label: 'Entrance Exam',  sub: 'In Progress' },
  { key: 'admitted',      label: 'Admitted',       sub: 'Pending'     },
  { key: 'print_form',    label: 'Print Form',     sub: 'Locked'      },
  { key: 'enrollment',    label: 'Enrollment',     sub: 'Locked'      },
];

/**
 * 5-stage horizontal progress tracker.
 * @param {number} currentStage - 0-based index of the active stage.
 */
const ProgressTracker = ({ currentStage = 1 }) => (
  <Box
    sx={{
      border: '2px solid',
      borderColor: 'success.light',
      borderRadius: 3,
      p: { xs: 1.5, sm: 2 },
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      height: '100%',
    }}
  >
    {STAGES.map((stage, i) => {
      const done   = i < currentStage;
      const active = i === currentStage;
      const locked = i > currentStage;

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
                bgcolor: done || active ? 'success.main' : 'grey.300',
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
                bgcolor: done ? 'success.main' : 'grey.300',
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
              bgcolor: done || active ? 'success.main' : 'grey.200',
              border: '2px solid',
              borderColor: done || active ? 'success.main' : 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              position: 'relative',
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

          {/* Stage label */}
          <Typography
            variant="caption"
            fontWeight={active ? 700 : 500}
            color={active || done ? 'success.dark' : 'text.secondary'}
            textAlign="center"
            mt={0.5}
            sx={{ fontSize: 10, lineHeight: 1.2 }}
          >
            {stage.label}
          </Typography>

          {/* Sub-label */}
          <Typography
            variant="caption"
            textAlign="center"
            sx={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              color: active
                ? 'warning.main'
                : done
                ? 'success.main'
                : locked
                ? 'error.main'
                : 'text.disabled',
            }}
          >
            {stage.sub}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

ProgressTracker.propTypes = {
  currentStage: PropTypes.number,
};

export default ProgressTracker;
