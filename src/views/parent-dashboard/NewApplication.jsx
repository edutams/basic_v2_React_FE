import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { IconSchool, IconCreditCard, IconFileText, IconSend } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import WardDetailForm from 'src/components/tenant-components/admission/WardDetailForm';
import AcademicInfoForm from 'src/components/tenant-components/admission/AcademicInfoForm';
import AdmissionBatchModal from 'src/components/tenant-components/admission/AdmissionBatchModal';
import PaymentStep from 'src/components/tenant-components/admission/PaymentStep';
import DocumentsStep from 'src/components/tenant-components/admission/DocumentsStep';
import SubmitStep from 'src/components/tenant-components/admission/SubmitStep';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Ward Detail',   icon: GroupsIcon,     isTabler: false },
  { label: 'Academic info', icon: IconSchool,     isTabler: true  },
  { label: 'Payment',       icon: IconCreditCard, isTabler: true  },
  { label: 'Documents',     icon: IconFileText,   isTabler: true  },
  { label: 'Submit',        icon: IconSend,       isTabler: true  },
];

// ── Stepper ───────────────────────────────────────────────────────────────────
const StepperBar = ({ activeStep }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, overflowX: 'auto', pb: 1 }}>
    {STEPS.map((step, i) => {
      const done   = i < activeStep;
      const active = i === activeStep;
      const Icon   = step.icon;

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
              {step.isTabler ? (
                <Icon size={20} color={active ? '#fff' : done ? '#1976d2' : '#9e9e9e'} />
              ) : (
                <Icon sx={{ fontSize: 20, color: active ? '#fff' : done ? 'primary.main' : 'grey.400' }} />
              )}
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

          {i < STEPS.length - 1 && (
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

// ── Batch Summary Sidebar ─────────────────────────────────────────────────────
const BatchSummaryCard = ({ batch, onChangeBatch }) => (
  <Paper sx={{ borderRadius: 3, p: 3, position: 'sticky', top: 24 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
      Selected Admission Batch Detail
    </Typography>

    <Typography variant="h5" fontWeight={800} mb={2}>
      {batch?.session_term ?? '2025/2026'} Admission Batch {batch?.batch_number ?? '2'}
    </Typography>

    <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2.5}>
      {(batch?.classes ?? ['JSS1', 'JSS2', 'JSS3']).map((cls) => (
        <Chip
          key={cls}
          label={cls}
          size="small"
          sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, fontSize: 11 }}
        />
      ))}
    </Stack>

    <Divider sx={{ mb: 2 }} />

    {[
      { label: 'Pre-Application Payment', value: batch?.pre_application_fee ?? 5000 },
      { label: 'Post-Admission Payment',  value: batch?.post_admission_fee  ?? 15000 },
    ].map(({ label, value }) => (
      <Box
        key={label}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#FFF5F5',
          borderRadius: 2,
          px: 2,
          py: 1.25,
          mb: 1.5,
        }}
      >
        <Typography variant="body2" color="error.main" fontWeight={500}>{label}</Typography>
        <Typography variant="body2" color="error.main" fontWeight={700}>
          ₦{value.toLocaleString()}
        </Typography>
      </Box>
    ))}

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
  </Paper>
);

// ── Placeholder for steps not yet built ──────────────────────────────────────
const PlaceholderStep = ({ label, onNext, onBack }) => (
  <Box>
    <Typography variant="h6" fontWeight={700} mb={0.5}>{label}</Typography>
    <Divider sx={{ mb: 3 }} />
    <Typography color="text.secondary">This step is coming soon.</Typography>

    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 4,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: 'text.secondary', fontWeight: 600 }}>
        Back
      </Button>
      <Button variant="contained" onClick={onNext} sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}>
        Save and Continue
      </Button>
    </Box>
  </Box>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const NewApplication = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const batch = location.state?.batch ?? null;

  const [activeStep, setActiveStep]     = useState(0);
  const [wardData,   setWardData]       = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [documentsData, setDocumentsData] = useState(null);
  const [isLoading,  setIsLoading]      = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // Keep selected batch in local state so it can be swapped via the modal
  const [selectedBatch, setSelectedBatch] = useState(batch);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => {
    if (activeStep === 0) navigate('/dashboard');
    else setActiveStep((s) => s - 1);
  };

  const handleWardSubmit = async (values) => {
    setIsLoading(true);
    try {
      setWardData(values);
      handleNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcademicSubmit = async (values) => {
    setIsLoading(true);
    try {
      setAcademicData(values);
      handleNext();
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <WardDetailForm
            initialValues={wardData}
            onSubmit={handleWardSubmit}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case 1:
        return (
          <AcademicInfoForm
            initialValues={academicData}
            onSubmit={handleAcademicSubmit}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <PaymentStep
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <DocumentsStep
            onNext={(files) => { setDocumentsData(files); handleNext(); }}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <SubmitStep
            wardData={wardData}
            academicData={academicData}
            documentsData={documentsData}
            selectedBatch={selectedBatch}
            onBack={handleBack}
            onSubmit={() => {
              // TODO: final submission API call
              handleNext();
            }}
            isLoading={isLoading}
          />
        );
      default: return null;
    }
  };

  return (
    <PageContainer title="New Application" description="Apply for admission">
      <Box sx={activeStep === 4 ? { overflow: 'hidden', height: '100vh' } : {}}>

      {/* ── Page header ── */}
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
              New Application
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Session: {selectedBatch?.session_term ?? '2025/26'}&nbsp;·&nbsp;
              ₦{(selectedBatch?.pre_application_fee ?? 5000).toLocaleString()} Application Fee
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

      {/* ── Stepper ── */}
      <StepperBar activeStep={activeStep} />

      {/* ── Content + Sidebar ── */}
      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: activeStep === 4 ? 12 : 8 }}>
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

        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: activeStep === 4 ? 'none' : 'block' }}>
          <BatchSummaryCard batch={selectedBatch} onChangeBatch={() => setBatchModalOpen(true)} />
        </Grid>
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
