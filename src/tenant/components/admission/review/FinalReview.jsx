import { Box, Grid, Typography, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';

const SummaryField = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value}</Typography>
  </Box>
);

const FinalReview = ({ applicantName, intendingClass, admissionBatch, totalPaid, onSubmit, isLoading }) => (
  <ReviewSection number={5} title="Review and submit" id="section-submit">
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      <Grid size={{ xs: 12, sm: 6 }}><SummaryField label="Applicant"       value={applicantName}  /></Grid>
      <Grid size={{ xs: 12, sm: 6 }}><SummaryField label="Intending Class" value={intendingClass} /></Grid>
      <Grid size={{ xs: 12, sm: 6 }}><SummaryField label="Admission Batch" value={admissionBatch} /></Grid>
      <Grid size={{ xs: 12, sm: 6 }}><SummaryField label="Total Paid"      value={totalPaid}      /></Grid>
      <Grid size={{ xs: 12, sm: 6 }}><SummaryField label="Documents"       value="4 of 4 uploaded" /></Grid>
      <Grid size={{ xs: 12, sm: 6 }}><SummaryField label="Application ID"  value="16,205-QA-65001" /></Grid>
    </Grid>

    <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ py: 2 }}>
      <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 32 }} />
      <Typography variant="body2" color="text.secondary">
        All sections completed. This is a preview only.
      </Typography>
    </Box>

    <Button
      variant="contained"
      fullWidth
      onClick={onSubmit}
      disabled={isLoading}
      sx={{ fontWeight: 700, py: 1.25, borderRadius: 2, fontSize: '0.95rem' }}
    >
      {isLoading ? 'Submitting...' : 'Submit Application'}
    </Button>
  </ReviewSection>
);

FinalReview.propTypes = {
  applicantName:  PropTypes.string,
  intendingClass: PropTypes.string,
  admissionBatch: PropTypes.string,
  totalPaid:      PropTypes.string,
  onSubmit:       PropTypes.func.isRequired,
  isLoading:      PropTypes.bool,
};

export default FinalReview;
