import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Typography, Paper, Button, Chip, Stack, Divider } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  CreditCard as CreditCardIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import WardDetailForm from '@/components/tenant/admission/WardDetailForm';
import AcademicInfoForm from '@/components/tenant/admission/AcademicInfoForm';
import AdmissionBatchModal from '@/components/tenant/admission/AdmissionBatchModal';
import PaymentStep from '@/components/tenant/admission/PaymentStep';
import DocumentsStep from '@/components/tenant/admission/DocumentsStep';
import SubmitStep from '@/components/tenant/admission/SubmitStep';
import { useAdmissionForm } from '@/hooks/useAdmissionForm';
import { useNotification } from 'src/hooks/useNotification';
import { getOpenBatches } from '@/api/tenant/admission/admissionApi';

const STEPS = [
  { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
  { label: 'Academic info', icon: SchoolIcon, isTabler: false },
  { label: 'Payment', icon: CreditCardIcon, isTabler: false },
  { label: 'Documents', icon: DescriptionIcon, isTabler: false },
  { label: 'Submit', icon: SendIcon, isTabler: false },
];

const StepperBar = ({ activeStep, steps }) => {
  const theme = useTheme();

  const getIconColor = (active, done) =>
    active ? '#fff' : done ? theme.palette.primary.main : theme.palette.grey[500];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, overflowX: 'auto', pb: 1 }}>
      {steps.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.label}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                minWidth: 90,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: active || done ? 'primary.main' : 'grey.300',
                  bgcolor: active ? 'primary.main' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Icon sx={{ fontSize: 20, color: getIconColor(active, done) }} />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
                  STEP {i + 1}
                </Typography>

                <Typography
                  variant="caption"
                  fontWeight={active || done ? 700 : 400}
                  color={active || done ? 'text.primary' : 'text.secondary'}
                  display="block"
                  lineHeight={1.3}
                  mt={0.3}
                >
                  {step.label}
                </Typography>
              </Box>
            </Box>

            {i < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: done ? 'primary.main' : 'grey.200',
                  mb: 3.5,
                  minWidth: 20,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

const BatchSummaryCard = ({ batch, onChangeBatch, activeStep }) => (
  <Paper sx={{ borderRadius: 3, p: 3, position: 'sticky', top: 24 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
      Selected Admission Batch Detail
    </Typography>

        <Typography variant="h5" fontWeight={800} mb={2}>
        Session:{' '}
        {batch?.session_term?.session?.sesname}{' '}
        {batch?.session_term?.display_term?.display_name}
        {' • '}
        Admission Batch:{' '}
        {batch?.batch_name ?? '2'}
      </Typography>

    <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2.5}>
      {(batch?.classes || []).map((cls) => (
        <Chip
          key={cls.id}
          label={cls.class_code}
          size="small"
          sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, fontSize: 11 }}
        />
      ))}
    </Stack>
          {batch?.require_payment && <Divider sx={{ mb: 2 }} />}


   {[
  batch?.require_payment && batch?.acceptance_fee !== '0.00'
    ? {
        label: 'Pre-Application Payment',
        value: batch?.acceptance_fee,
      }
    : null,

  batch?.require_payment && batch?.application_fee !== '0.00'
    ? {
        label: 'Post-Admission Payment',
        value: batch?.application_fee,
      }
    : null,
]
  .filter(Boolean)
  .map(({ label, value }) => (
    <Box
      key={label}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'error.light',
        borderRadius: 2,
        px: 2,
        py: 1.25,
        mb: 1.5,
      }}
    >
      <Typography variant="body2" color="error.dark" fontWeight={500}>
        {label}
      </Typography>

      <Typography variant="body2" color="error.dark" fontWeight={700}>
        ₦{Number(value).toLocaleString()}
      </Typography>
    </Box>
  ))}

    {activeStep !== 3 && (
      <>
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={onChangeBatch}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            borderColor: 'grey.300',
            color: 'text.primary',
            '&:hover': { borderColor: 'primary.main', color: '#FFFF' },
          }}
        >
          Change your Admission Batch
        </Button>
      </>
    )}
  </Paper>
);

// ── Main Page
const NewApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();

  const batch = location.state?.batch ?? null;
  const existingWard = location.state?.ward ?? null;
  const resumeApplication = location.state?.resumeApplication ?? false;
  const searchParams = new URLSearchParams(location.search);
  const queryStep = searchParams.get('step');
  const parsedQueryStep = queryStep ? Number(queryStep) - 1 : null;

  const [selectedBatch, setSelectedBatch] = useState(existingWard?.admission_batch ?? batch);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // Load full batch data when resuming application to ensure classes are available
  useEffect(() => {
    if (resumeApplication && selectedBatch?.id && !selectedBatch?.classes) {
      const loadFullBatchData = async () => {
        try {
          const response = await getOpenBatches();
          const batches = response?.data?.data || response?.data || [];
          const fullBatch = batches.find(b => b.id === selectedBatch.id);
          if (fullBatch) {
            setSelectedBatch(fullBatch);
          }
        } catch (error) {
          console.error('Failed to load full batch data:', error);
          // Continue with existing batch data if fetch fails
        }
      };
      loadFullBatchData();
    }
  }, [resumeApplication, selectedBatch?.id]);

  // Initialize the admission form hook with existing admission data if resuming
  const {
    admissionId,
    currentStage,
    formData,
    isLoading,
    errors: serverErrors,
    saveStepData,
    updateStage,
    submitApplication,
  } = useAdmissionForm(selectedBatch, resumeApplication ? existingWard : null);

  // Build dynamic steps based on batch requirements
  const ALL_STEPS = [
    { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
    { label: 'Academic info', icon: SchoolIcon, isTabler: false },
    ...(selectedBatch?.require_payment ? [{ label: 'Payment', icon: CreditCardIcon, isTabler: false }] : []),
    { label: 'Documents', icon: DescriptionIcon, isTabler: false },
    { label: 'Submit', icon: SendIcon, isTabler: false },
  ];

  const STEPS = ALL_STEPS;

  // Determine initial step - use currentStage from hook if resuming, otherwise start at 0
  const resumeStep =
    parsedQueryStep !== null && !Number.isNaN(parsedQueryStep)
      ? parsedQueryStep
      : 0;

  const [activeStep, setActiveStep] = useState(resumeStep);
  const hideBatchSummary = [2, 4].includes(activeStep);

  // Update activeStep when currentStage changes (for resuming applications)
  useEffect(() => {
    if (resumeApplication && currentStage !== null && currentStage !== undefined) {
      // Only update if we're resuming and currentStage is loaded
      setActiveStep(currentStage);
    }
  }, [currentStage, resumeApplication]);

  // Sync URL with active step
  useEffect(() => {
    const currentQueryStep = new URLSearchParams(location.search).get('step');
    if (currentQueryStep !== String(activeStep + 1)) {
      navigate(`?step=${activeStep + 1}`, {
        replace: true,
        state: location.state,
      });
    }
  }, [activeStep, location.search, navigate, location.state]);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => {
    if (activeStep === 0) navigate('/dashboard');
    else setActiveStep((s) => s - 1);
  };

  const handleWardSubmit = async (values) => {
    const result = await saveStepData(0, values);
    if (result.success) {
      handleNext();
    } else {
      notify.error(result.error || 'Failed to save ward details');
    }
  };

  const handleAcademicSubmit = async (values) => {
    const result = await saveStepData(1, values);
    if (result.success) {
      handleNext();
    } else {
      notify.error(result.error || 'Failed to save academic information');
    }
  };

  const handlePaymentComplete = async () => {
    const paymentStepIndex = 2; // Payment is always step 2 when present
    const result = await updateStage(paymentStepIndex);
    if (result.success) {
      handleNext();
    } else {
      notify.error(result.error || 'Failed to update payment status');
    }
  };

  const handleDocumentsSubmit = async (files) => {
    const documentsStepIndex = selectedBatch?.require_payment ? 3 : 2;
    const result = await saveStepData(documentsStepIndex, files);
    if (result.success) {
      handleNext();
    } else {
      notify.error(result.error || 'Failed to save documents');
    }
  };

  const handleFinalSubmit = async () => {
    const result = await submitApplication();
    if (result.success) {
      notify.success('Application submitted successfully!');
      // Clear any persisted form state from storage
      sessionStorage.removeItem('formDetailsData');
      sessionStorage.removeItem('admissionFormData');
      localStorage.removeItem('admissionFormData');
      navigate('/admission_manager/my_applications');
    } else {
      notify.error(result.error || 'Failed to submit application');
    }
  };

  const renderStep = () => {
    // Map activeStep to actual step considering dynamic payment step
    let actualStep = activeStep;
    
    switch (actualStep) {
      case 0:
        return (
          <WardDetailForm
            initialValues={formData.wardData}
            onSubmit={handleWardSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            serverErrors={serverErrors}
          />
        );
      case 1:
        return (
          <AcademicInfoForm
            initialValues={formData.academicData}
            onSubmit={handleAcademicSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            serverErrors={serverErrors}
            selectedBatch={selectedBatch}
          />
        );
      case 2:
        if (selectedBatch?.require_payment) {
          return (
            <PaymentStep
              onNext={handlePaymentComplete}
              onBack={handleBack}
              isLoading={isLoading}
            />
          );
        } else {
          // Documents step when no payment required
          return (
            <DocumentsStep
              initialValues={formData.documentsData}
              hasPreviousSchool={Boolean(formData.academicData?.has_previous_school)}
              onNext={handleDocumentsSubmit}
              onBack={handleBack}
              isLoading={isLoading}
            />
          );
        }
      case 3:
        if (selectedBatch?.require_payment) {
          // Documents step when payment is required
          return (
            <DocumentsStep
              initialValues={formData.documentsData}
              hasPreviousSchool={Boolean(formData.academicData?.has_previous_school)}
              onNext={handleDocumentsSubmit}
              onBack={handleBack}
              isLoading={isLoading}
            />
          );
        } else {
          // Submit step when no payment required
          return (
            <SubmitStep
              wardData={formData.wardData}
              academicData={formData.academicData}
              documentsData={formData.documentsData}
              selectedBatch={selectedBatch}
              onBack={handleBack}
              onSubmit={handleFinalSubmit}
              isLoading={isLoading}
            />
          );
        }
      case 4:
        // Submit step when payment is required
        return (
          <SubmitStep
            wardData={formData.wardData}
            academicData={formData.academicData}
            documentsData={formData.documentsData}
            selectedBatch={selectedBatch}
            onBack={handleBack}
            onSubmit={handleFinalSubmit}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer title="New Application" description="Apply for admission">
      <Box sx={activeStep === 4 ? { overflow: 'hidden', height: '100vh' } : {}}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: 'primary.main', borderRightWidth: 2 }}
            />
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GroupsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                Application Form
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Session: {
                selectedBatch?.session_term?.session?.sesname} {selectedBatch?.session_term?.display_term?.display_name}
                &nbsp;·&nbsp; 


               {
                selectedBatch?.require_payment &&
                selectedBatch?.application_fee !== '0.00' && (
                  <>
                    ₦{Number(selectedBatch?.application_fee ?? 5000).toLocaleString()}
                    {' '}Application Fee
                  </>
                )
              }
              </Typography>
            </Box>
          </Box>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Back to dashboard
          </Button>
        </Box>

        <StepperBar activeStep={activeStep} steps={STEPS} />

        {/* ── Content + Sidebar ── */}
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: activeStep === 4 || activeStep === 2 ? 12 : 8 }}>
            <Paper
              sx={{
                borderRadius: 3,
                p: { xs: 2.5, sm: 3.5 },
                ...(activeStep === 4 && {
                  height: 'calc(100vh - 260px)',
                  overflowY: 'auto',
                }),
              }}
            >
              {renderStep()}
            </Paper>
          </Grid>

          {!hideBatchSummary && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <BatchSummaryCard
                batch={selectedBatch}
                onChangeBatch={() => setBatchModalOpen(true)}
                activeStep={activeStep}
              />
            </Grid>
          )}
        </Grid>

        <AdmissionBatchModal
          open={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          onApply={(newBatch) => setSelectedBatch(newBatch)}
        />
      </Box>
    </PageContainer>
  );
};

export default NewApplication;
