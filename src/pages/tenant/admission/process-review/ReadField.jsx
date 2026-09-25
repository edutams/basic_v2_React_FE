import { Box, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * A single read-only value on a review/summary screen. Rendered as a soft
 * tile rather than plain floating label/value text — gives each field a
 * visible boundary so a grid of them reads as structured data, without
 * borrowing input-box chrome (no outline/notch) that would make a review
 * step look like the same editable form again.
 */
const ReadField = ({ label, value }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minWidth: 0,
        p: 1.1,
        borderRadius: '8px',
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.66rem' }}
        display="block"
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.35, wordBreak: 'break-word' }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  );
};

ReadField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  // Kept for API compatibility with existing call sites — no longer used
  // now that this renders as a plain tile rather than a multiline TextField.
  multiline: PropTypes.bool,
  rows: PropTypes.number,
};

export default ReadField;
