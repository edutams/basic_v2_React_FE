import { Box, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ReviewSection = ({ number, title, subtitle, id, children }) => (
  <Paper sx={{ borderRadius: 2, p: 2.5, mb: 2 }} id={id}>
    <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {number}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
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
