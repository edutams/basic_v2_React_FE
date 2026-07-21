import { Box, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ReviewSection = ({ number, title, subtitle, id, children }) => (
  <Paper
    id={id}
    sx={{
      borderRadius: 3,
      p: 3,
      mb: 2.5,
      bgcolor: (theme) => theme.palette.background.paper,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: (theme) =>
        theme.palette.mode === 'dark'
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s ease',
      '&:hover': {
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 16px rgba(0,0,0,0.08)',
      },
    }}
  >
    <Box display="flex" alignItems="flex-start" gap={1.5} mb={2.5}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.25,
          boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
        }}
      >
        {number}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
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

ReviewSection.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.node,
};

export default ReviewSection;
