import { Box, Avatar, Typography, Chip, useTheme } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

// Solid hex tokens instead of theme.palette.warning/success — the theme's
// "warning" is a pale gold (#fdc90f) that reads as washed-out for text,
// matching the darker set used across the rest of the reworked admission UI.
const STAGE_COLOR = {
  done: '#16a34a',
  active: '#d97706',
  locked: '#94a3b8',
};

/**
 * Overall status → accent color + icon, same convention as ApplicationCard
 * on the list page, so a card colored amber there stays amber here.
 */
const statusMeta = (rawStatus) => {
  const status = (rawStatus || 'pending').toLowerCase();

  if (status === 'admitted') {
    return { color: '#16a34a', bg: '#dcfce7', label: 'Admitted', icon: CheckCircleIcon };
  }
  if (status === 'declined') {
    return { color: '#dc2626', bg: '#fee2e2', label: 'Declined', icon: CancelIcon };
  }

  return { color: '#d97706', bg: '#fef3c7', label: 'Pending', icon: ScheduleIcon };
};

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
      subColor: isSubmitted ? STAGE_COLOR.done : STAGE_COLOR.active,
      done: isSubmitted,
      active: !isSubmitted
    }
  ];

  if (hasEntranceExam) {
    stages.push({
      key: 'entrance_exam',
      label: 'Entrance Exam',
      sub: isExamDone ? 'Complete' : (isSubmitted ? 'In Progress' : 'Locked'),
      subColor: isExamDone ? STAGE_COLOR.done : (isSubmitted ? STAGE_COLOR.active : STAGE_COLOR.locked),
      done: isExamDone,
      active: !isExamDone && isSubmitted
    });
  }

  stages.push({
    key: 'admitted',
    label: 'Admitted',
    sub: isAdmitted ? 'Complete' : (isExamDone || !hasEntranceExam && isSubmitted ? 'Pending' : 'Locked'),
    subColor: isAdmitted ? STAGE_COLOR.done : (isExamDone || !hasEntranceExam && isSubmitted ? STAGE_COLOR.active : STAGE_COLOR.locked),
    done: isAdmitted,
    active: !isAdmitted && (isExamDone || !hasEntranceExam && isSubmitted)
  });

  stages.push({
    key: 'print_form',
    label: 'Print Form',
    sub: isPrinted ? 'Complete' : (isAdmitted ? 'Pending' : 'Locked'),
    subColor: isPrinted ? STAGE_COLOR.done : (isAdmitted ? STAGE_COLOR.active : STAGE_COLOR.locked),
    done: isPrinted,
    active: !isPrinted && isAdmitted
  });

  stages.push({
    key: 'enrollment',
    label: 'Enrollment',
    sub: isEnrolled ? 'Complete' : (isPrinted ? 'Pending' : 'Locked'),
    subColor: isEnrolled ? STAGE_COLOR.done : (isPrinted ? STAGE_COLOR.active : STAGE_COLOR.locked),
    done: isEnrolled,
    active: !isEnrolled && isPrinted
  });

  return stages;
};

const ProgressTracker = ({ admission, isDark }) => {
  const STAGES = buildStages(admission);
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        borderRadius: '10px',
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
        p: { xs: 1, sm: 1.5 },
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        height: '100%',
        minHeight: 84,
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
              minWidth: { xs: 56, sm: 68 },
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
                  bgcolor: done || active ? STAGE_COLOR.done : 'grey.300',
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
                  bgcolor: done ? STAGE_COLOR.done : 'grey.300',
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
                bgcolor: done || active ? STAGE_COLOR.done : 'grey.200',
                border: '2px solid',
                borderColor: done || active ? STAGE_COLOR.done : 'grey.300',
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
                color: stage.subColor,
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
  dob,
  admission,
  form_number
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const meta = statusMeta(admission?.admission_status);
  const StatusIcon = meta.icon;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: { xs: 2.5, md: 3 },
        bgcolor: isDark ? theme.palette.background.paper : `${meta.bg}55`,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        p: { xs: 1.5, sm: 2 },
        pl: { xs: 2.25, sm: 2.75 },
        width: '100%',
        boxSizing: 'border-box',
        mb: 2,
      }}
    >
      {/* Status accent rail */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: meta.color,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 0 }}>
        <Box
          sx={{
            p: '3px',
            borderRadius: '50%',
            border: '2.5px solid',
            borderColor: meta.color,
            flexShrink: 0,
          }}
        >
          <Avatar
            src={photo}
            sx={{
              width: { xs: 68, sm: 92 },
              height: { xs: 68, sm: 92 },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {name}
            </Typography>
            <Chip
              icon={<StatusIcon sx={{ fontSize: '13px !important', color: `${meta.color} !important` }} />}
              label={meta.label}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                color: meta.color,
                border: '1px solid',
                borderColor: meta.color,
              }}
            />
          </Box>
          <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mt: 0.5 }}>
            Gender : {gender} &nbsp;·&nbsp; DoB : {dob}
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#16a34a', mt: 0.25 }}>
            Intending Class : {intendingClass}
          </Typography>
          <Chip
            label={`Form No: ${form_number}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 600, borderRadius: 2, mt: 1 }}
          />
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
        <ProgressTracker admission={admission} isDark={isDark} />
      </Box>
    </Box>
  );
};

TrackerHeader.propTypes = {
  name: PropTypes.string.isRequired,
  intendingClass: PropTypes.string,
  gender: PropTypes.string,
  address: PropTypes.string,
  photo: PropTypes.string,
  admission: PropTypes.object,
};

export default TrackerHeader;
