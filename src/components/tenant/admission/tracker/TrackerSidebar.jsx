import { Box, Paper, Typography, Button, useTheme } from '@mui/material';
import {
  Print as PrintIcon,
  QuestionMark as QuestionIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const REQUIREMENTS = [
  {
    icon: PrintIcon,
    label: 'Print Application Form',
    sub: 'Available after admission offer.',
    action: '/admission/form-details',
  },
  {
    icon: PrintIcon,
    label: 'Print Offer letter',
    sub: 'Available after admission offer.',
    id: 'print_offer',
  },
];

const TrackerSidebar = ({ admission }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isAdmitted = admission?.admission_status === 'admitted';

  const cardSx = {
    borderRadius: '10px',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ ...cardSx, p: { xs: 1.5, sm: 1.75 }, mb: 1.5 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
          display="block"
          mb={1.5}
        >
          Actionable Processes
        </Typography>

        {REQUIREMENTS.map(({ icon: Icon, label, sub, action, id }) => (
          <Box
            key={label}
            onClick={() => {
              if (!isAdmitted) return;

              if (id === 'print_offer' && admission) {
                window.open(`/admission-letter/${admission.id}`, '_blank');
                return;
              }
              if (action && admission) {
                const formData = {
                  wardData: {
                    surname: admission.surname,
                    first_name: admission.first_name,
                    other_name: admission.other_name,
                    dob: admission.dob,
                    gender: admission.gender,
                    home_address: admission.home_address,
                    lga: admission.lga,
                  },
                  academicData: {
                    has_previous_school: admission.has_previous_school,
                    prev_school_name: admission.prev_school_name,
                    prev_school_state: admission.prev_school_state,
                    prev_school_lga: admission.prev_school_lga,
                    previous_class: admission.previous_class,
                    intending_programme: admission.intending_programme,
                    intending_class: admission.intending_class,
                    study_mode: admission.study_mode,
                  },
                  documentsData: {
                    birth_cert: admission.birth_cert,
                    prev_school_report: admission.prev_school_report,
                    passport_photo: admission.passport_photo,
                    medical_record: admission.medical_record,
                  },
                  selectedBatch: admission.admission_batch,
                  viewMode: true,
                };
                sessionStorage.setItem('formDetailsData', JSON.stringify(formData));
                window.open(action, '_blank');
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.300',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'grey.300',
              mb: 0.75,
              cursor: isAdmitted ? 'pointer' : 'not-allowed',
              opacity: isAdmitted ? 1 : 0.6,
              transition: 'all 0.2s ease',
              '&:hover': isAdmitted
                ? {
                    bgcolor: 'primary.light',
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  }
                : {},
              '&:active': {
                transform: isAdmitted ? 'translateY(0)' : 'none',
              },
              '&:last-of-type': {
                mb: 0,
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isAdmitted ? (
                <Icon sx={{ color: 'text.secondary', fontSize: 20 }} />
              ) : (
                <LockIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      <Paper elevation={0} sx={{ ...cardSx, p: { xs: 1.5, sm: 1.75 }, bgcolor: isDark ? theme.palette.background.paper : '#e0f2fe55' }}>
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <QuestionIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700}>
              Need Assistance?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our admissions office is available Mon-Fri, 8am-4pm.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            borderColor: 'grey.400',
            color: 'text.primary',
            bgcolor: isDark ? 'transparent' : '#fff',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              color: 'text.primary',
            },
          }}
        >
          Contact Support
        </Button>
      </Paper>
    </Box>
  );
};

export default TrackerSidebar;
