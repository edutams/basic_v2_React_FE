import { Box, Typography, Button, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import PageContainer from '@/components/container/PageContainer';
import SubmitStep from '@/components/tenant/admission/SubmitStep';
import { useReactToPrint } from 'react-to-print';
import { Print as PrintIcon } from '@mui/icons-material';

const FormDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (location.state?.wardData) {
      setFormData(location.state);
      // Persist to session storage so it survives a reload if we arrived via state
      sessionStorage.setItem('formDetailsData', JSON.stringify(location.state));
    } else {
      const storedData = sessionStorage.getItem('formDetailsData');
      if (storedData) {
        setFormData(JSON.parse(storedData));
        // Removed sessionStorage.removeItem('formDetailsData') to prevent data loss on reload
      }
    }
  }, [location.state]);

  const handleBack = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate('/application-tracker', {
        state: {
          wardData: formData?.wardData,
          academicData: formData?.academicData,
          selectedBatch: formData?.selectedBatch,
        },
      });
    }
  };

  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Application_Form_${formData?.wardData?.surname || ''}_${formData?.wardData?.first_name || ''}`,
  });

  if (!formData) {
    return (
      <PageContainer title="Application Form Details" description="View your submitted application">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6" color="text.secondary">
            Loading form details...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  const { wardData, academicData, documentsData, selectedBatch, admissionId } = formData;

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
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 600 }}>
            Print Application
          </Button>
          <Button variant="contained" size="small" startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Back to Tracker
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        <div ref={contentRef} style={{ padding: '20px' }}>
          <SubmitStep
            wardData={wardData}
            academicData={academicData}
            documentsData={documentsData}
            selectedBatch={selectedBatch}
            admissionId={admissionId}
            onBack={handleBack}
            onSubmit={() => {}}
            viewMode={true}
          />
        </div>
      </Paper>
    </PageContainer>
  );
};

export default FormDetails;
