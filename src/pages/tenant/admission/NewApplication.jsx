import React, { useState } from 'react';
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

const STEPS = [
  { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
  { label: 'Academic info', icon: SchoolIcon, isTabler: false },
  { label: 'Payment', icon: CreditCardIcon, isTabler: false },
  { label: 'Documents', icon: DescriptionIcon, isTabler: false },
  { label: 'Submit', icon: SendIcon, isTabler: false },
];

const StepperBar = ({ activeStep }) => {
  const theme = useTheme();

  const getIconColor = (active, done) =>
    active ? '#fff' : done ? theme.palette.primary.main : theme.palette.grey[500];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, overflowX: 'auto', pb: 1 }}>
      {STEPS.map((step, i) => {
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
};

const BatchSummaryCard = ({ batch, onChangeBatch, activeStep }) => (
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
      { label: 'Post-Admission Payment', value: batch?.post_admission_fee ?? 15000 },
    ].map(({ label, value }) => (
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
          ₦{value.toLocaleString()}
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

  const batch = location.state?.batch ?? null;
  const existingWard = location.state?.ward ?? null;
  const searchParams = new URLSearchParams(location.search);
  const queryStep = searchParams.get('step');

  // prospective ward data → per-step initial values
  const seedWardData = existingWard
    ? (() => {
        const parts = (existingWard.name ?? '').trim().split(' ');
        return {
          surname: existingWard.surname ?? parts[0] ?? '',
          first_name: existingWard.first_name ?? parts[1] ?? '',
          other_name: existingWard.other_name ?? parts.slice(2).join(' '),
          dob: existingWard.dob ?? '',
          gender: existingWard.gender ?? '',
          state_of_origin: existingWard.state_of_origin ?? '',
          lga: existingWard.lga ?? '',
          home_address: existingWard.home_address ?? '',
        };
      })()
    : null;

  const seedAcademicData = existingWard
    ? {
        has_previous_school: existingWard.has_previous_school ?? false,
        previous_school_name: existingWard.previous_school_name ?? '',
        previous_school_state: existingWard.previous_school_state ?? '',
        previous_school_lga: existingWard.previous_school_lga ?? '',
        previous_class: existingWard.previous_class ?? '',
        programme_id: existingWard.programme_id ?? '',
        class_id: existingWard.class_id ?? '',
        boarding_status: existingWard.boarding_status ?? '',
      }
    : null;

  // Resume at the step where progress stopped.
  const initialStepFromWard = existingWard
    ? existingWard.isDraft
      ? (existingWard.draftStep ?? 0)
      : existingWard.step >= 1
        ? 2
        : existingWard.step >= 0
          ? 1
          : 0
    : 0;

  const resumeStep = queryStep !== null ? parseInt(queryStep, 10) : initialStepFromWard;

  const [activeStep, setActiveStep] = useState(resumeStep);
  const [wardData, setWardData] = useState(seedWardData);
  const [academicData, setAcademicData] = useState(
    existingWard?.step >= 1 || existingWard?.draftStep >= 1 ? seedAcademicData : null,
  );
  const [documentsData, setDocumentsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState(existingWard?.batch ?? batch);

  React.useEffect(() => {
    const currentQueryStep = new URLSearchParams(location.search).get('step');
    if (currentQueryStep !== String(activeStep)) {
      navigate(`?step=${activeStep}`, { replace: true, state: location.state });
    }
  }, [activeStep, location.search, navigate, location.state]);

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
        return <PaymentStep onNext={handleNext} onBack={handleBack} isLoading={isLoading} />;
      case 3:
        return (
          <DocumentsStep
            onNext={(files) => {
              setDocumentsData(files);
              handleNext();
            }}
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
              navigate('/application-tracker', {
                state: { wardData, academicData, selectedBatch },
              });
            }}
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
                Session: {selectedBatch?.session_term ?? '2025/26'}&nbsp;·&nbsp; ₦
                {(selectedBatch?.pre_application_fee ?? 5000).toLocaleString()} Application Fee
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

        <StepperBar activeStep={activeStep} />

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

          <Grid
            size={{ xs: 12, lg: 4 }}
            sx={{ display: activeStep === 4 || activeStep === 2 ? 'none' : 'block' }}
          >
            <BatchSummaryCard
              batch={selectedBatch}
              onChangeBatch={() => setBatchModalOpen(true)}
              activeStep={activeStep}
            />
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
