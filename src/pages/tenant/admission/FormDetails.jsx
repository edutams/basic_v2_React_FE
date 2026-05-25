import { Box, Typography, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import SubmitStep from '@/components/tenant/admission/SubmitStep';

const FormDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { wardData, academicData, documentsData, selectedBatch } = location.state ?? {};

  const handleBack = () => {
    navigate('/application-tracker', {
      state: { wardData, academicData, selectedBatch },
    });
  };

  return (
    <PageContainer title="Application Form Details" description="View your submitted application">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        mb={3}
      >
        <Typography variant="h5" fontWeight={800}>
          Application Form Details
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Tracker
        </Button>
      </Box>

      <Paper
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        <SubmitStep
          wardData={wardData}
          academicData={academicData}
          documentsData={documentsData}
          selectedBatch={selectedBatch}
          onBack={handleBack}
          onSubmit={() => {}}
          viewMode={true}
        />
      </Paper>
    </PageContainer>
  );
};

export default FormDetails;
