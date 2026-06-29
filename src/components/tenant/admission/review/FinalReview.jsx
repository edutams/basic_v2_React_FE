import {
  Box,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ReviewSection from './ReviewSection';

const SummaryField = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

const FinalReview = ({
  applicantName,
  intendingClass,
  admissionBatch,
  totalPaid,
  onSubmit,
  isLoading,
  documentsData,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Count uploaded documents
  const uploadedCount = documentsData
    ? Object.values(documentsData).filter(
        (doc) => doc instanceof File || (typeof doc === 'string' && doc),
      ).length
    : 0;
  const totalDocuments = 4; // birth_cert, prev_school_report, passport_photo, medical_record

  const handleSubmitClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    onSubmit();
  };

  return (
    <>
      <ReviewSection number={5} title="Review and submit" id="section-submit">
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryField label="Applicant" value={applicantName || 'N/A'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryField label="Intending Class" value={intendingClass || 'N/A'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryField label="Admission Batch" value={admissionBatch || 'N/A'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryField label="Total Paid" value={totalPaid || '₦0'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryField
              label="Documents"
              value={`${uploadedCount} of ${totalDocuments} uploaded`}
            />
          </Grid>
        </Grid>

        <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ py: 2 }}>
          <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 32 }} />
          <Typography variant="body2" color="text.secondary">
            All sections completed. Review your information before submitting.
          </Typography>
        </Box>

        <Button variant="contained" size="small" fullWidth onClick={handleSubmitClick} disabled={isLoading} sx={{ fontWeight: 700, py: 1.25, borderRadius: 2, fontSize: '0.95rem' }}>
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </ReviewSection>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-submit-application-dialog"
      >
        <DialogTitle id="confirm-submit-application-dialog">Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to submit this application?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setConfirmOpen(false)} disabled={isLoading}>
            No
          </Button>
          <Button variant="contained" size="small" onClick={handleConfirmSubmit} disabled={isLoading}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

FinalReview.propTypes = {
  applicantName: PropTypes.string,
  intendingClass: PropTypes.string,
  admissionBatch: PropTypes.string,
  totalPaid: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  documentsData: PropTypes.object,
};

export default FinalReview;
