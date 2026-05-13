import { Box, Paper, Typography, Button } from '@mui/material';
import { RadioButtonUnchecked as LockedIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const NextStepCard = ({ title, description, actionLabel, actionDisabled, onAction }) => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
    <Box display="flex" alignItems="center" gap={2}>
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
        <LockedIcon sx={{ color: 'grey.400', fontSize: 22 }} />
      </Box>

      <Box sx={{ flex: 1 }}>
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
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>

      <Button
        variant="contained"
        disabled={actionDisabled}
        onClick={onAction}
        sx={{ fontWeight: 700, borderRadius: 2, flexShrink: 0 }}
      >
        {actionLabel}
      </Button>
    </Box>
  </Paper>
);

NextStepCard.propTypes = {
  title:          PropTypes.string.isRequired,
  description:    PropTypes.string,
  actionLabel:    PropTypes.string,
  actionDisabled: PropTypes.bool,
  onAction:       PropTypes.func,
};

export default NextStepCard;
