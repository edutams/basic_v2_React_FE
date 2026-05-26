import { Box, Grid, Typography, Avatar } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Person as PersonIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import ReviewSection from './ReviewSection';
import ReadField from './ReadField';
import { getAllStates, getLgasByState } from '@/api/tenant/admission/admissionApi';

const WardReview = ({ wardData, intendingClass, selectedBatch, academicData }) => {
  const [stateName, setStateName] = useState('Loading...');
  const [lgaName, setLgaName] = useState('Loading...');

  const fullName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : '';

  // Get intending class - prioritize relationship data from academicData
  const selectedClass = academicData?.intending_class || selectedBatch?.classes?.find(
    cls => cls.id == academicData?.intending_class_id
  );
  const displayIntendingClass = selectedClass?.class_code || selectedClass?.class_name || intendingClass || 'N/A';

  // Fetch state and LGA names based on IDs
  useEffect(() => {
    const fetchLocationNames = async () => {
      try {
        // If wardData has the relationship loaded (from backend), use it
        if (wardData?.lga?.state?.state_name) {
          setStateName(wardData.lga.state.state_name);
          setLgaName(wardData.lga.lga_name);
          return;
        }

        // Otherwise, fetch from API using the IDs
        if (wardData?.state_of_origin) {
          const states = await getAllStates();
          const state = states.find(s => s.id === parseInt(wardData.state_of_origin));
          if (state) {
            setStateName(state.state_name);
            
            // Fetch LGAs for this state
            if (wardData?.lga_id) {
              const lgas = await getLgasByState(state.id);
              const lga = lgas.find(l => l.id === parseInt(wardData.lga_id));
              if (lga) {
                setLgaName(lga.lga_name);
              } else {
                setLgaName('N/A');
              }
            } else {
              setLgaName('N/A');
            }
          } else {
            setStateName('N/A');
            setLgaName('N/A');
          }
        } else {
          setStateName('N/A');
          setLgaName('N/A');
        }
      } catch (error) {
        console.error('Failed to fetch location names:', error);
        setStateName('N/A');
        setLgaName('N/A');
      }
    };

    if (wardData) {
      fetchLocationNames();
    }
  }, [wardData]);

  return (
    <ReviewSection number={1} title="Tell us about your ward" subtitle="Basic information" id="section-ward-detail">
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Box sx={{ position: 'relative', mb: 1 }}>
          <Avatar src={wardData?.passport_photo } sx={{ width: 72, height: 72, bgcolor: 'grey.300' }}>
            {(!wardData?.passport_photo) && <PersonIcon sx={{ color: '#000', fontSize: 40 }} />}
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
        <Typography variant="body2" fontWeight={700}>{fullName || 'N/A'}</Typography>
        <Typography variant="caption" color="text.secondary">
          Intending Class: {displayIntendingClass}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Surname"         value={wardData?.surname || 'N/A'}          /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="First Name"      value={wardData?.first_name || 'N/A'}       /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Other Name"      value={wardData?.other_name || 'N/A'}       /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Date of Birth"   value={wardData?.dob || 'N/A'}              /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Select Gender"   value={wardData?.gender ? wardData.gender.charAt(0).toUpperCase() + wardData.gender.slice(1) : 'N/A'}           /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="State of Origin" value={stateName}  /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="LGA of Origin"   value={lgaName}              /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><ReadField label="Home Address"    value={wardData?.home_address || 'N/A'}     /></Grid>
      </Grid>
    </ReviewSection>
  );
};

WardReview.propTypes = {
  wardData:      PropTypes.object,
  intendingClass: PropTypes.string,
  selectedBatch: PropTypes.object,
  academicData: PropTypes.object,
};

export default WardReview;
