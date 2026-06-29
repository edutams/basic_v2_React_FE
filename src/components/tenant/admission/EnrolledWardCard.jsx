import { Box, Paper, Avatar, Typography, Stack, Chip, Button } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const EnrolledWardCard = ({ ward, onViewDetails }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
      <Avatar src={ward.avatar} sx={{ width: 40, height: 40, flexShrink: 0 }}>
        {ward.name?.[0]}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {ward.name}
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.3}>
          {ward.tags?.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              sx={{ fontSize: 10, bgcolor: '#E7F3D4', color: '#000000', fontWeight: 600 }}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {ward.regNo}
        </Typography>
      </Box>
    </Box>

    <Box
      sx={{
        textAlign: 'left',
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Compulsory:{' '}
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ₦{ward.compulsory?.toLocaleString()}
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Optional:{' '}
            <Typography
              variant="caption"
              component="span"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              ₦{ward.optional?.toLocaleString()}
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#E28327' }}>
            Total Payable
          </Typography>
          <Box
            sx={{
              mt: 0.5,
              px: 1.5,
              bgcolor: '#C5A07A',
              color: '#fff',
              fontWeight: 700,
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '0.75rem',
            }}
          >
            ₦ {ward.total?.toLocaleString()}
          </Box>
        </Box>
      </Box>
    </Box>

    <Button variant="contained" size="small" endIcon={<ArrowForwardIcon />}
      onClick={() => onViewDetails?.(ward)}
      sx={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: '0.75rem' }}
    >
      View Details
    </Button>
  </Paper>
);

EnrolledWardCard.propTypes = {
  ward: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    regNo: PropTypes.string,
    compulsory: PropTypes.number,
    optional: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  onViewDetails: PropTypes.func,
};

export default EnrolledWardCard;
