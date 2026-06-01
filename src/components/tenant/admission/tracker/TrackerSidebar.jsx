import { Box, Paper, Typography, Button } from '@mui/material';
import {
  Print as PrintIcon,
  HowToReg as EnrollIcon,
  QuestionMark as QuestionIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const REQUIREMENTS = [
  { icon: PrintIcon, label: 'Print Application Form', sub: 'Available after admission offer.', action: '/admission/form-details' },
  { icon: PrintIcon, label: 'Print Offer letter', sub: 'Available after admission offer.', id: 'print_offer' },
];

const TrackerSidebar = ({ admission }) => {
  const navigate = useNavigate();
  return (
  <Box>
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, mb: 2 }}>
      <Typography
        variant="caption"
        fontWeight={700}
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
  gap: 1.5,
  p: { xs: 1.5, sm: 2 },
  borderRadius: 2,
  bgcolor: 'grey.300',
  border: '1px solid',
  borderColor: 'primary.100',
  mb: 1,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: 'primary.100',
    borderColor: 'primary.main',
    transform: 'translateY(-2px)',
    boxShadow: 2,
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:last-child': {
    mb: 0,
  },
}}        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: 'text.disabled', fontSize: 20 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
  variant="body2"
  fontWeight={700}
  color="text.primary"
>
  {label}
</Typography>
           <Typography
  variant="caption"
  color="text.secondary"
>
  {sub}
</Typography>
          </Box>
        </Box>
      ))}
    </Paper>

    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, bgcolor: 'info.light' }}>
      <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'primary.light',
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
        fullWidth
        sx={{
          fontWeight: 600,
          borderRadius: 2,
          borderColor: 'grey.400',
          color: 'text.primary',
          bgcolor: '#fff',
          '&:hover': { borderColor: 'primary.main', bgcolor: '#fff' },
        }}
      >
        Contact Support
      </Button>
    </Paper>
  </Box>
  );
};

export default TrackerSidebar;
