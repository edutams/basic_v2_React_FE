import { Box, Paper, Button, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { School as SchoolIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const AdmissionBanner = ({ session, onApply, hasOpenBatches }) => {
  const theme = useTheme();
  const bg = `linear-gradient(90deg, #020411 0%, ${theme.palette.primary.main} 100%)`;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        mb: 3,
        overflow: 'hidden',
        background: bg,
        color: '#fff',
        p: { xs: 2.5, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', sm: 'space-between' },
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '1px solid #FFFBB7',
            bgcolor: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
        </Box>

        <Box>
          {hasOpenBatches && (
            <Chip
              label={`Session ${session}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mb: 0.5, fontWeight: 600 }}
            />
          )}
          <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
            {hasOpenBatches ? 'Admission is now open!' : 'Welcome back'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            {hasOpenBatches
              ? 'Apply for your child today. Application closes Oct 30, 2025.'
              : 'We are excited to welcome you back. Always check here for your ward activities and updates.'}
          </Typography>
        </Box>
      </Box>

      {hasOpenBatches && (
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onApply}
          sx={{
            bgcolor: '#fff',
            color: 'primary.main',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            whiteSpace: 'nowrap',
          }}
        >
          Apply Now
        </Button>
      )}
    </Paper>
  );
};

AdmissionBanner.propTypes = {
  session: PropTypes.string,
  hasOpenBatches: PropTypes.bool,
  onApply: PropTypes.func.isRequired,
};

export default AdmissionBanner;
