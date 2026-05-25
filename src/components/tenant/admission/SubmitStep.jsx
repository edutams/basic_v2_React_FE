import { Box, Grid, Typography, Stack, Link, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

import WardReview      from './review/WardReview';
import AcademicReview  from './review/AcademicReview';
import PaymentReview   from './review/PaymentReview';
import DocumentsReview from './review/DocumentsReview';
import FinalReview     from './review/FinalReview';

const JUMP_LINKS = ['Ward Detail', 'Academic Info', 'Payment', 'Documents', 'Submit'];

const handleJump = (e, id) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
};

const QuickJump = ({ viewMode = false }) => {
  const links = viewMode ? JUMP_LINKS.slice(0, -1) : JUMP_LINKS;
  
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 2, position: 'sticky', top: 24 }}>
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
  viewMode = false 
}) => {
  const applicantName = wardData
    ? `${wardData.surname ?? ''} ${wardData.first_name ?? ''} ${wardData.other_name ?? ''}`.trim()
    : 'Adewunmi Oluwadunke Gold';

  const intendingClass = 'JSS 1 — Diamond';
  const admissionBatch = selectedBatch
    ? `${selectedBatch.session_term} Batch ${selectedBatch.batch_number ?? '2'}`
    : '2025/2026 Batch 2';
  const totalPaid = '₦25,500';

  return (
    <Grid container spacing={3} alignItems="flex-start">

      <Grid size={{ xs: 12, md: 9 }}>
        <WardReview     wardData={wardData}       intendingClass={intendingClass} />
        <AcademicReview academicData={academicData} intendingClass={intendingClass} />
        <PaymentReview  totalPaid={totalPaid} />
        <DocumentsReview documentsData={documentsData} />
        {!viewMode && (
          <FinalReview
            applicantName={applicantName}
            intendingClass={intendingClass}
            admissionBatch={admissionBatch}
            totalPaid={totalPaid}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        )}

        <Box display="flex" sx={{ mt: 1, mb: 2 }}>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
            Back
          </Button>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
        <QuickJump viewMode={viewMode} />
      </Grid>

    </Grid>
  );
};

SubmitStep.propTypes = {
  wardData:      PropTypes.object,
  academicData:  PropTypes.object,
  documentsData: PropTypes.array,
  selectedBatch: PropTypes.object,
  onBack:        PropTypes.func.isRequired,
  onSubmit:      PropTypes.func.isRequired,
  isLoading:     PropTypes.bool,
  viewMode:      PropTypes.bool,
};

export default SubmitStep;
