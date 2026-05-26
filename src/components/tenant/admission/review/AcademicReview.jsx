import { Grid, Typography,Box } from '@mui/material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';
import ReadField from './ReadField';

const AcademicReview = ({ academicData, intendingClass, selectedBatch }) => {
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
              <ReadField label="State" value={academicData?.prev_school_state || 'N/A'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="LGA" value={academicData?.prev_school_lga || 'N/A'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadField label="Last Class" value={academicData?.prev_class || 'N/A'} />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Intending Class
      </Typography> */}
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
