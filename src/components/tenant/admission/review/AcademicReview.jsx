import { Grid, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import ReviewSection from './ReviewSection';
import ReadField from './ReadField';
import { getAllStates, getLgasByState } from '@/api/tenant/admission/admissionApi';

const AcademicReview = ({ academicData, intendingClass, selectedBatch }) => {
  const [prevStateName, setPrevStateName] = useState('');
  const [prevLgaName, setPrevLgaName] = useState('');

  // Get programme and class details
  // Priority: 1. From academicData relationships (when resuming), 2. From selectedBatch lookup
  const programme = academicData?.intending_programme || selectedBatch?.programme;
  const selectedClass = academicData?.intending_class || selectedBatch?.classes?.find(
    cls => cls.id == academicData?.intending_class_id
  );

  // Build programme class choice string
  const programmeClassChoice = programme && selectedClass
    ? `${programme.programme_name || programme.programme_code} — ${selectedClass.class_name || selectedClass.class_code}`
    : 'N/A';

  // Use intending class from relationship data if available, otherwise use prop
  const displayIntendingClass = selectedClass?.class_code || selectedClass?.class_name || intendingClass || 'N/A';

  // Format boarding status
  const studyMode = academicData?.study_mode;
  const boardingLabel = studyMode === 'day'
    ? 'Day Student'
    : studyMode === 'boarding'
    ? 'Boarding Student'
    : 'N/A';

  // Check if has previous school
  const hasPreviousSchool = academicData?.has_previous_school === true || academicData?.has_previous_school === 1;

  // Resolve prev_school_state and prev_school_lga IDs → human-readable names
  useEffect(() => {
    if (!hasPreviousSchool) return;

    const stateId = academicData?.prev_school_state;
    const lgaId = academicData?.prev_school_lga;

    if (!stateId) {
      setPrevStateName('N/A');
      setPrevLgaName('N/A');
      return;
    }

    setPrevStateName('Loading...');
    setPrevLgaName(lgaId ? 'Loading...' : 'N/A');

    const resolve = async () => {
      try {
        const states = await getAllStates();
        const state = states.find(s => s.id === parseInt(stateId));

        if (!state) {
          setPrevStateName('N/A');
          setPrevLgaName('N/A');
          return;
        }

        setPrevStateName(state.state_name);

        if (!lgaId) {
          setPrevLgaName('N/A');
          return;
        }

        const lgas = await getLgasByState(state.id);
        const lga = lgas.find(l => l.id === parseInt(lgaId));
        setPrevLgaName(lga?.lga_name || 'N/A');
      } catch (err) {
        console.error('Failed to resolve previous school location names:', err);
        setPrevStateName('N/A');
        setPrevLgaName('N/A');
      }
    };

    resolve();
  }, [hasPreviousSchool, academicData?.prev_school_state, academicData?.prev_school_lga]);

  return (
    <ReviewSection number={2} title="Academic Information" id="section-academic-info">
      {hasPreviousSchool && (
        <Box mb={3}>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Previous school information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Previous school name" value={academicData?.prev_school_name || 'N/A'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="State" value={prevStateName || 'N/A'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="LGA" value={prevLgaName || 'N/A'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Last Class" value={academicData?.previous_class || 'N/A'} />
            </Grid>
          </Grid>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Intending Class" value={displayIntendingClass} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField
            label="Programme Class Choice"
            value={programmeClassChoice}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Study Mode" value={boardingLabel} />
        </Grid>
      </Grid>
    </ReviewSection>
  );
};

AcademicReview.propTypes = {
  academicData: PropTypes.object,
  intendingClass: PropTypes.string,
  selectedBatch: PropTypes.object,
};

export default AcademicReview;
