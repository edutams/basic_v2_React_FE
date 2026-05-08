import { Box, Grid, Typography, Avatar } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Person as PersonIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';
import ReadField from './ReadField';

const WardReview = ({ wardData, intendingClass }) => {
  const fullName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : '';

  return (
    <ReviewSection number={1} title="Tell us about your ward" subtitle="Basic information" id="section-ward-detail">
      {/* Avatar */}
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Box sx={{ position: 'relative', mb: 1 }}>
          <Avatar src={wardData?.imageUrl} sx={{ width: 72, height: 72, bgcolor: 'grey.300' }}>
            {!wardData?.imageUrl && <PersonIcon sx={{ color: '#000', fontSize: 40 }} />}
          </Avatar>
          <Box
            sx={{
              position: 'absolute', bottom: 0, right: 0,
              width: 20, height: 20, borderRadius: '50%',
              bgcolor: 'primary.dark', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 12, color: '#fff' }} />
          </Box>
        </Box>
        <Typography variant="body2" fontWeight={700}>{fullName}</Typography>
        <Typography variant="caption" color="text.secondary">
          Intending Class : {intendingClass}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Surname"         value={wardData?.surname}          /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="First Name"      value={wardData?.first_name}       /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Other Name"      value={wardData?.other_name}       /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Date of Birth"   value={wardData?.dob}              /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Select Gender"   value={wardData?.gender}           /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="State of Origin" value={wardData?.state_of_origin}  /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="LGA of Origin"   value={wardData?.lga}              /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Home Address"    value={wardData?.home_address}     /></Grid>
      </Grid>
    </ReviewSection>
  );
};

WardReview.propTypes = {
  wardData:      PropTypes.object,
  intendingClass: PropTypes.string,
};

export default WardReview;
