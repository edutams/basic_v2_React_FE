import { Box, Paper, Typography, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const FormSubmittedCard = ({ submittedDate, onViewDetails }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 3,
      p: 2.5,
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderLeft: '4px solid',
      borderLeftColor: 'success.main',
    }}
  >
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

    <Box sx={{ flex: 1 }}>
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

    <Button
      variant="outlined"
      size="small"
      onClick={onViewDetails}
      sx={{ fontWeight: 600, borderRadius: 2, flexShrink: 0, whiteSpace: 'nowrap' }}
    >
      View Form Details
    </Button>
  </Paper>
);

FormSubmittedCard.propTypes = {
  submittedDate: PropTypes.string,
  onViewDetails: PropTypes.func,
};

export default FormSubmittedCard;
