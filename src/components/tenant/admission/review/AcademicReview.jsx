import { Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';
import ReadField from './ReadField';

const AcademicReview = ({ academicData, intendingClass }) => {
  const prevSummary =
    academicData?.has_previous_school && academicData?.previous_school_name
      ? `${academicData.previous_school_name}, ${academicData.previous_school_state} — attended. Graduated with overall position 3rd out of 48 pupils.`
      : '';

  const boardingLabel =
    academicData?.boarding_status === 'day'
      ? 'Day Student - Resumes 7:30 AM, closes 3:45 PM (School b...)'
      : (academicData?.boarding_status ?? 'Day Student');

  return (
    <ReviewSection number={2} title="Academic Information" id="section-academic-info">
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Previous school information
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12 }}>
          <ReadField label="" value={prevSummary} multiline rows={3} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Previous school name" value={academicData?.previous_school_name} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Last Class" value={academicData?.previous_class} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Position" value="3rd" />
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Intending Class
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Intending Class" value={intendingClass} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField
            label="Programme Class Choice"
            value="Junior Secondary — JSS 1 — Diamond Arm | Science-Inclined"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReadField label="Boarding Status" value={boardingLabel} />
        </Grid>
      </Grid>
    </ReviewSection>
  );
};

AcademicReview.propTypes = {
  academicData: PropTypes.object,
  intendingClass: PropTypes.string,
};

export default AcademicReview;
