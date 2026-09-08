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
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={600}
      sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.68rem' }}
      display="block"
    >
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>
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
  const hasPayment = Boolean(totalPaid) && totalPaid !== '₦0';

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
        <Grid container rowSpacing={2} columnSpacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryField label="Applicant" value={applicantName || 'N/A'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryField label="Intending Class" value={intendingClass || 'N/A'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryField label="Admission Batch" value={admissionBatch || 'N/A'} />
          </Grid>
          {hasPayment && (
            <Grid size={{ xs: 6, sm: 3 }}>
              <SummaryField label="Total Paid" value={totalPaid} />
            </Grid>
          )}
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryField label="Documents" value={`${uploadedCount} of ${totalDocuments} uploaded`} />
          </Grid>
        </Grid>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={0.75}
          sx={{
            py: 2,
            mb: 2,
            borderRadius: '8px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#dcfce755'),
          }}
        >
          <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 30 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            All sections completed. Review your information before submitting.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handleSubmitClick}
          disabled={isLoading}
          sx={{ fontWeight: 700, py: 1.1, borderRadius: '8px', fontSize: '0.95rem', textTransform: 'none' }}
        >
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </ReviewSection>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-submit-application-dialog"
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle id="confirm-submit-application-dialog">Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to submit this application?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setConfirmOpen(false)}
            disabled={isLoading}
            sx={{ textTransform: 'none' }}
          >
            No, review again
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmSubmit}
            disabled={isLoading}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Yes, submit
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
