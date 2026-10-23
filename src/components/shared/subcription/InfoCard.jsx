import { Box, Typography, Skeleton, Tooltip, Stack } from '@mui/material';
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

/** Shared overview-card shell for both Subscriptions tabs — icon badge +
 * title + info tooltip + big value, with the card-specific breakdown passed
 * in as children (dot counts, plan bars, a due-date/action row). */
const InfoCard = ({ icon: Icon, color, title, tooltip, value, loading, children }) => (
  <Box
    sx={{
      p: '10px 12px',
      height: '100%',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '8px',
          bgcolor: `${color}1A`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }} noWrap>
        {title}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        </Tooltip>
      )}
    </Stack>

    {loading ? (
      <Skeleton variant="text" width="50%" height={36} />
    ) : (
      value !== '' && (
        <Typography variant="h5" fontWeight={800} sx={{ mb: 0.25 }}>
          {value}
        </Typography>
      )
    )}

    <Box sx={{ mt: 'auto' }}>{children}</Box>
  </Box>
);

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  loading: PropTypes.bool,
  children: PropTypes.node,
};

export default InfoCard;
