import { Box, Grid, Typography, Stack, Link, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

import WardReview from './review/WardReview';
import AcademicReview from './review/AcademicReview';
import PaymentReview from './review/PaymentReview';
import DocumentsReview from './review/DocumentsReview';
import FinalReview from './review/FinalReview';

const handleJump = (e, id) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
};

const QuickJump = ({ viewMode = false, requirePayment = false }) => {
  // Build links dynamically based on payment requirement
  const baseLinks = ['Ward Detail', 'Academic Info'];
  if (requirePayment) {
    baseLinks.push('Payment');
  }
  baseLinks.push('Documents');
  if (!viewMode) {
    baseLinks.push('Submit');
  }

  const links = baseLinks;

  return (
    <Paper sx={{ borderRadius: 2, p: 2.5, mb: 2, position: 'sticky', top: 24 }}>
      <Typography variant="h6" fontWeight={700} color="text.secondary" display="block" mb={1}>
        Quick jump
      </Typography>
      <Stack spacing={0.5}>
        {links.map((s) => {
          const id = `section-${s.toLowerCase().replace(' ', '-')}`;
          return (
            <Link
              key={s}
              href={`#${id}`}
              underline="hover"
              variant="h6"
              color="primary.main"
              sx={{ fontWeight: 500 }}
              onClick={(e) => handleJump(e, id)}
            >
              · {s}
            </Link>
          );
        })}
      </Stack>
    </Paper>
  );
};

const SubmitStep = ({
  wardData,
  academicData,
  documentsData,
  selectedBatch,
  onBack,
  onSubmit,
  isLoading = false,
  viewMode = false,
  hasPreviousSchool = false,
  admissionId = null,
}) => {
  // Build applicant name from ward data
  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : '';

  // Get intending class from selected batch and academic data
  const intendingClass =
    selectedBatch?.classes?.find((cls) => cls.id == academicData?.intending_class_id)?.class_code ||
    selectedBatch?.classes?.find((cls) => cls.id == academicData?.intending_class_id)?.class_name ||
    'N/A';

  // Build admission batch string
  const admissionBatch = selectedBatch
    ? `${selectedBatch.session_term?.session?.session_name || ''} ${selectedBatch.session_term?.term?.term_name || ''} - ${selectedBatch.batch_name || ''}`
    : '';

  // Calculate total paid (if payment is required)
  const totalPaid = selectedBatch?.require_payment
    ? `₦${(
        parseFloat(selectedBatch.application_fee || 0) +
        parseFloat(selectedBatch.acceptance_fee || 0)
      ).toLocaleString()}`
    : '₦0';

  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 9 }}>
        <WardReview
          wardData={wardData}
          intendingClass={intendingClass}
          selectedBatch={selectedBatch}
          academicData={academicData}
        />
        <AcademicReview
          academicData={academicData}
          intendingClass={intendingClass}
          selectedBatch={selectedBatch}
        />
        {selectedBatch?.require_payment && <PaymentReview admissionId={admissionId} />}
        <DocumentsReview
          documentsData={documentsData}
          hasPreviousSchool={Boolean(academicData?.has_previous_school)}
        />
        {!viewMode && (
          <FinalReview
            applicantName={applicantName}
            intendingClass={intendingClass}
            admissionBatch={admissionBatch}
            totalPaid={totalPaid}
            onSubmit={onSubmit}
            isLoading={isLoading}
            documentsData={documentsData}
          />
        )}

        <Box display="flex" sx={{ mt: 1, mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
        <QuickJump viewMode={viewMode} requirePayment={selectedBatch?.require_payment} />
      </Grid>
    </Grid>
  );
};

SubmitStep.propTypes = {
  wardData: PropTypes.object,
  academicData: PropTypes.object,
  documentsData: PropTypes.array,
  selectedBatch: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  viewMode: PropTypes.bool,
  hasPreviousSchool: PropTypes.bool,
  admissionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SubmitStep;
