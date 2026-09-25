import { Box, Paper, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const ReviewSection = ({ number, title, subtitle, id, children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      id={id}
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        p: { xs: 1.75, sm: 2.25 },
        mb: 2,
        scrollMarginTop: 16,
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={1.25} mb={2}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
            mt: 0.15,
          }}
        >
          {number}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </Paper>
  );
};

ReviewSection.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.node,
};

export default ReviewSection;
