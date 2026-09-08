import { Box, Grid, Typography, Avatar, Chip } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Person as PersonIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import ReviewSection from './ReviewSection';
import ReadField from './ReadField';
import { getAllStates, getLgasByState } from '@/api/tenant/admission/admissionApi';
import dayjs from 'dayjs';

const WardReview = ({ wardData, intendingClass, selectedBatch, academicData }) => {
  const [stateName, setStateName] = useState('Loading...');
  const [lgaName, setLgaName] = useState('Loading...');

  const fullName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : '';

  // Get intending class - prioritize relationship data from academicData
  const selectedClass =
    academicData?.intending_class ||
    selectedBatch?.classes?.find((cls) => cls.id == academicData?.intending_class_id);
  const displayIntendingClass =
    selectedClass?.class_code || selectedClass?.class_name || intendingClass || 'N/A';

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
          const state = states.find((s) => s.id === parseInt(wardData.state_of_origin));
          if (state) {
            setStateName(state.state_name);

            // Fetch LGAs for this state
            if (wardData?.lga_id) {
              const lgas = await getLgasByState(state.id);
              const lga = lgas.find((l) => l.id === parseInt(wardData.lga_id));
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
    <ReviewSection
      number={1}
      title="Tell us about your ward"
      subtitle="Basic information"
      id="section-ward-detail"
    >
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        gap={2}
        mb={2.5}
        sx={{
          p: 1.75,
          borderRadius: '8px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#eff6ff'),
        }}
      >
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            src={wardData?.passport_photo}
            sx={{
              width: 68,
              height: 68,
              bgcolor: 'primary.light',
              border: '2.5px solid',
              borderColor: 'primary.main',
            }}
          >
            {!wardData?.passport_photo && <PersonIcon sx={{ color: 'primary.dark', fontSize: 34 }} />}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: '#16a34a',
              border: '2px solid',
              borderColor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 12, color: '#fff' }} />
          </Box>
        </Box>

        <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
            {fullName || 'N/A'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 0.75 }}>
            <Chip
              label={`Intending: ${displayIntendingClass}`}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: 11, fontWeight: 600 }}
            />
            <Chip
              label={`Batch: ${selectedBatch?.batch_name || 'N/A'}`}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontSize: 11, fontWeight: 600 }}
            />
            <Chip
              label={`Session: ${
                selectedBatch?.session_term
                  ? `${selectedBatch.session_term.session?.session_name || ''} ${selectedBatch.session_term.term?.term_name || ''}`.trim() ||
                    'N/A'
                  : 'N/A'
              }`}
              size="small"
              variant="outlined"
              color="info"
              sx={{ fontSize: 11, fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box>

      <Grid container rowSpacing={1.5} columnSpacing={1.5}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField label="Surname" value={wardData?.surname || 'N/A'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField label="First Name" value={wardData?.first_name || 'N/A'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField label="Other Name" value={wardData?.other_name || 'N/A'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField
            label="Date of Birth"
            value={wardData?.dob ? dayjs(wardData.dob).format('DD MMM YYYY') : 'N/A'}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField
            label="Gender"
            value={
              wardData?.gender
                ? wardData.gender.charAt(0).toUpperCase() + wardData.gender.slice(1)
                : 'N/A'
            }
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField label="Religion" value={wardData?.religion || 'N/A'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField label="State of Origin" value={stateName} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <ReadField label="LGA of Origin" value={lgaName} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Home Address" value={wardData?.home_address || 'N/A'} />
        </Grid>
      </Grid>
    </ReviewSection>
  );
};

WardReview.propTypes = {
  wardData: PropTypes.object,
  intendingClass: PropTypes.string,
  selectedBatch: PropTypes.object,
  academicData: PropTypes.object,
};

export default WardReview;
