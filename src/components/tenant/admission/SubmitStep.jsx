import { Box, Grid, Typography, Link, Button, Paper, useTheme } from '@mui/material';
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
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const QuickJump = ({ viewMode = false, requirePayment = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        p: 1.75,
        mb: 2,
        position: 'sticky',
        top: 24,
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        display="block"
        mb={1}
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        Quick jump
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {links.map((s) => {
          const id = `section-${s.toLowerCase().replace(' ', '-')}`;
          return (
            <Link
              key={s}
              href={`#${id}`}
              underline="none"
              onClick={(e) => handleJump(e, id)}
              sx={{
                py: 0.75,
                px: 1,
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                },
              }}
            >
              {s}
            </Link>
          );
        })}
      </Box>
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
    <Grid container spacing={2} alignItems="flex-start">
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

        <Box display="flex" sx={{ mt: 0.5, mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            disabled={isLoading}
            sx={{ textTransform: 'none' }}
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
