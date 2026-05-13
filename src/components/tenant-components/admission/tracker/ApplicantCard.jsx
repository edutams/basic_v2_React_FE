import { Box, Avatar, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ApplicantCard = ({ name, intendingClass, gender, address, photo }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      bgcolor: '#FFF8F0',
      borderRadius: 3,
      p: 2,
      height: '100%',
    }}
  >
    <Avatar
      src={photo}
      sx={{
        width: 72,
        height: 72,
        border: '3px solid',
        borderColor: 'primary.light',
        flexShrink: 0,
      }}
    />
    <Box>
      <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
        {name}
      </Typography>
      <Typography variant="body2" color="success.dark" fontWeight={600}>
        Intending Class : {intendingClass}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        Gender : {gender}
      </Typography>
      <Typography variant="caption" color="warning.dark" fontWeight={500}>
        Parent Address:
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {address}
      </Typography>
    </Box>
  </Box>
);

ApplicantCard.propTypes = {
  name:           PropTypes.string.isRequired,
  intendingClass: PropTypes.string,
  gender:         PropTypes.string,
  address:        PropTypes.string,
  photo:          PropTypes.string,
};

export default ApplicantCard;
