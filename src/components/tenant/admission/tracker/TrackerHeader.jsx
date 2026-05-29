import { Box, Avatar, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const buildStages = (admission) => {
  const hasEntranceExam = admission?.admission_batch?.has_entrance_exam;
  const isSubmitted = admission?.form_submit_status === 'yes';
  const isExamDone = admission?.entrance_exam_score != null;
  const isAdmitted = admission?.admission_status === 'admitted';
  const isPrinted = admission?.print_form_status === 'yes';
  const isEnrolled = admission?.accept_admission_offer === 'yes';

  const stages = [
    {
      key: 'application',
      label: 'Application',
      sub: isSubmitted ? 'Complete' : 'In Progress',
      subColor: isSubmitted ? 'success.dark' : 'warning.main',
      done: isSubmitted,
      active: !isSubmitted
    }
  ];

  if (hasEntranceExam) {
    stages.push({
      key: 'entrance_exam',
      label: 'Entrance Exam',
      sub: isExamDone ? 'Complete' : (isSubmitted ? 'In Progress' : 'Locked'),
      subColor: isExamDone ? 'success.dark' : (isSubmitted ? 'warning.main' : 'text.disabled'),
      done: isExamDone,
      active: !isExamDone && isSubmitted
    });
  }

  stages.push({
    key: 'admitted',
    label: 'Admitted',
    sub: isAdmitted ? 'Complete' : (isExamDone || !hasEntranceExam && isSubmitted ? 'Pending' : 'Locked'),
    subColor: isAdmitted ? 'success.dark' : (isExamDone || !hasEntranceExam && isSubmitted ? 'warning.main' : 'text.disabled'),
    done: isAdmitted,
    active: !isAdmitted && (isExamDone || !hasEntranceExam && isSubmitted)
  });

  stages.push({
    key: 'print_form',
    label: 'Print Form',
    sub: isPrinted ? 'Complete' : (isAdmitted ? 'Pending' : 'Locked'),
    subColor: isPrinted ? 'success.dark' : (isAdmitted ? 'warning.main' : 'error.dark'),
    done: isPrinted,
    active: !isPrinted && isAdmitted
  });

  stages.push({
    key: 'enrollment',
    label: 'Enrollment',
    sub: isEnrolled ? 'Complete' : (isPrinted ? 'Pending' : 'Locked'),
    subColor: isEnrolled ? 'success.dark' : (isPrinted ? 'warning.main' : 'error.main'),
    done: isEnrolled,
    active: !isEnrolled && isPrinted
  });

  return stages;
};

const ProgressTracker = ({ admission }) => {
  const STAGES = buildStages(admission);
  return (
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
        const { done, active } = stage;

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

            <Typography
              variant="caption"
              textAlign="center"
              sx={{
                fontSize: { xs: 8, sm: 9 },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.3,
                // color: active ? 'warning.main' : stage.subColor,
                color: 'success.dark',
              }}
            >
              {stage.sub}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const TrackerHeader = ({
  name,
  intendingClass,
  gender,
  address,
  photo,
  admission,
}) => (
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
        <Typography variant="body2" color="success.dark" fontWeight={600}>
          Intending Class : {intendingClass}
        </Typography>
        <Typography variant="body2" fontWeight={500}>Gender : {gender}</Typography>
        <Typography variant="caption" color="warning.dark">Parent Address:</Typography>
        <Typography variant="caption" color="text.secondary" display="block">{address}</Typography>
      </Box>
    </Box>

    <Box
      sx={{
        ml: { xs: 0, md: 'auto' },
        flexShrink: 0,
        width: { xs: '100%', md: '55%' },
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <ProgressTracker admission={admission} />
    </Box>
  </Box>
);

TrackerHeader.propTypes = {
  name: PropTypes.string.isRequired,
  intendingClass: PropTypes.string,
  gender: PropTypes.string,
  address: PropTypes.string,
  photo: PropTypes.string,
  admission: PropTypes.object,
};

export default TrackerHeader;