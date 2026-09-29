import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Grid, Typography, Paper, Button, Chip, Stack, Divider, CircularProgress } from '@mui/material';
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
import { getOpenBatches, checkAdmissionPaymentStatus } from '@/api/tenant/admission/admissionApi';
import { getFeeSummary } from '@/utils/feeSummary';

const STEPS = [
  { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
  { label: 'Academic info', icon: SchoolIcon, isTabler: false },
  { label: 'Payment', icon: CreditCardIcon, isTabler: false },
  { label: 'Documents', icon: DescriptionIcon, isTabler: false },
  { label: 'Submit', icon: SendIcon, isTabler: false },
];

const StepperBar = ({ activeStep, steps }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getIconColor = (active, done) =>
    active ? '#fff' : done ? theme.palette.primary.main : theme.palette.grey[500];

  const CurrentIcon = steps[activeStep]?.icon;
  const progressPct = steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 100;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        p: { xs: 1.5, sm: 1.5 },
        mb: 2,
      }}
    >
      {/* Mobile: compact "step X of Y" + progress bar — the full multi-node
          layout below doesn't fit a phone screen without forcing a
          horizontal scroll just to see which step you're on. */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {CurrentIcon && <CurrentIcon sx={{ fontSize: 17, color: '#fff' }} />}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }} display="block">
              STEP {activeStep + 1} OF {steps.length}
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap>
              {steps[activeStep]?.label}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 4, borderRadius: 4, bgcolor: 'grey.200', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${progressPct}%`,
              bgcolor: 'primary.main',
              borderRadius: 4,
              transition: 'width 0.25s ease',
            }}
          />
        </Box>
      </Box>

      {/* Tablet/desktop: full multi-node stepper */}
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', overflowX: 'auto' }}>
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
                  gap: 0.5,
                  minWidth: 84,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
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
                  <Icon sx={{ fontSize: 18, color: getIconColor(active, done) }} />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block" lineHeight={1} sx={{ fontSize: '0.65rem' }}>
                    STEP {i + 1}
                  </Typography>

                  <Typography
                    variant="caption"
                    fontWeight={active || done ? 700 : 400}
                    color={active || done ? 'text.primary' : 'text.secondary'}
                    display="block"
                    lineHeight={1.3}
                    mt={0.2}
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
                    mb: 3,
                    minWidth: 16,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Paper>
  );
};

const BatchSummaryCard = ({ batch, batchLoaded, onChangeBatch, activeStep, intendingClassId }) => {
  const cardSx = {
    borderRadius: '8px',
    border: '1px solid',
    borderColor: '#e2e8f0',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
  };

  if (!batch) {
    return (
      <Paper elevation={0} sx={{ ...cardSx, p: 1.75, position: { xs: 'static', lg: 'sticky' }, top: 24 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {batchLoaded
            ? 'No admission batch selected. Please select a batch to continue.'
            : 'Loading batch details...'}
        </Typography>
        {batchLoaded && (
          <Button variant="contained" size="small" fullWidth onClick={onChangeBatch} sx={{ textTransform: 'none' }}>
            Select Admission Batch
          </Button>
        )}
      </Paper>
    );
  }

  // If the applicant's class is already known, show the exact fee for that
  // class. Otherwise (class not chosen yet), summarize across classes and
  // show a range only if the fee genuinely differs by class.
  const relevantPayments = intendingClassId
    ? (batch.pre_application_payments || []).filter((p) => p.class_id === intendingClassId)
    : batch.pre_application_payments || [];

  const feeSummary = getFeeSummary(relevantPayments);
  const feeTotal = feeSummary.reduce((sum, f) => sum + f.amount, 0);
  const feeHasRange = feeSummary.some((f) => f.isRange);

  return (
    <Paper elevation={0} sx={{ ...cardSx, p: 1.75, position: { xs: 'static', lg: 'sticky' }, top: 24 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
        Selected Admission Batch Detail
      </Typography>
      <Typography variant="subtitle1" fontWeight={800} mb={2} lineHeight={1.35}>
        Session: {batch?.session_term?.session?.session_name}{' '}
        {batch?.session_term?.term?.term_name}
        {' • '}
        Admission Batch: {batch?.batch_name ?? '2'}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2}>
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
      {batch?.require_payment && feeSummary.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'error.light',
            borderRadius: '8px',
            px: 1.5,
            py: 1,
            mb: 1.5,
          }}
        >
          <Typography variant="body2" color="error.dark" fontWeight={500}>
            Pre-Application Payment
          </Typography>
          <Typography variant="body2" color="error.dark" fontWeight={700}>
            {feeHasRange ? 'from ' : ''}₦{feeTotal.toLocaleString()}
          </Typography>
        </Box>
      )}
      {activeStep !== 3 && (
        <>
          <Divider sx={{ mb: 1.5 }} />
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<VisibilityIcon />}
            onClick={onChangeBatch}
            sx={{
              borderRadius: '8px',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'grey.300',
              color: 'text.primary',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'text.primary' },
            }}
          >
            Change your Admission Batch
          </Button>
        </>
      )}
    </Paper>
  );
};

// ── Main Page
const NewApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();

  // Cache initial location.state so it survives manual URL edits which clear location.state
  const locationStateRef = useRef({
    batch: location.state?.batch ?? null,
    ward: location.state?.ward ?? null,
    resumeApplication: location.state?.resumeApplication ?? false,
  });

  const batch = locationStateRef.current?.batch ?? null;
  const existingWard = locationStateRef.current?.ward ?? null;
  const resumeApplication = locationStateRef.current?.resumeApplication ?? false;
  const searchParams = new URLSearchParams(location.search);
  const queryStep = searchParams.get('step');
  const parsedQueryStep = queryStep ? Number(queryStep) - 1 : null;

  const [selectedBatch, setSelectedBatch] = useState(null); // Initialize as null
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [userChangedBatch, setUserChangedBatch] = useState(false); // Track when user manually changes batch

  // Persist selectedBatch to sessionStorage so it survives URL changes and page reloads within the same tab
  useEffect(() => {
    if (selectedBatch) {
      try {
        sessionStorage.setItem('selected_admission_batch', JSON.stringify(selectedBatch));
      } catch (e) {
        console.warn('Failed to persist batch to sessionStorage:', e);
      }
    }
  }, [selectedBatch]);

  // Restore batch from sessionStorage on mount (for URL edits that reload the page)
  const restoreBatchFromSession = useCallback(() => {
    try {
      const saved = sessionStorage.getItem('selected_admission_batch');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to restore batch from sessionStorage:', e);
    }
    return null;
  }, []);

  // Initialize the admission form hook
  const {
    admissionId,
    currentStage,
    formData,
    isLoading,
    errors: serverErrors,
    saveStepData,
    updateStage,
    submitApplication,
  } = useAdmissionForm(selectedBatch, existingWard);

  // Load batch details on mount or when batch/existingWard changes
  useEffect(() => {
    const loadBatchDetails = async () => {
      try {
        // Always fetch all open batches to get complete payment data
        const response = await getOpenBatches();
        const allBatches = response?.data?.data || response?.data || [];

        let targetBatchId = null;

        // Priority 1: If we have a saved admission batch from formData
        if (formData?.admission_batch?.id) {
          // console.log('Loading batch details from formData:', formData.admission_batch.id);
          targetBatchId = formData.admission_batch.id;
        }
        // Priority 2: If we have a batch from location.state (Apply Now from modal)
        else if (batch?.id && !formData?.admission_batch) {
          // console.log('Loading batch details from location.state:', batch.id);
          targetBatchId = batch.id;
        }
        // Priority 3: If we have existingWard with admission_batch
        else if (existingWard?.admission_batch?.id && !formData?.admission_batch && !batch?.id) {
          // console.log('Loading batch details from existingWard:', existingWard.admission_batch.id);
          targetBatchId = existingWard.admission_batch.id;
        }

        // Priority 4: Check sessionStorage (preserved across URL changes / page reloads within the same tab)
        if (!targetBatchId) {
          const sessionBatch = restoreBatchFromSession();
          if (sessionBatch?.id) {
            // console.log('Loading batch from sessionStorage:', sessionBatch.id);
            targetBatchId = sessionBatch.id;
          }
        }

        // If we have a target batch ID, find it in the full batches list
        if (targetBatchId) {
          const fullBatch = allBatches.find((b) => b.id === targetBatchId);
          if (fullBatch) {
            // console.log('Loaded full batch data with payments:', fullBatch);
            // Ensure payment arrays exist
            if (!fullBatch.pre_application_payments) {
              fullBatch.pre_application_payments = [];
            }
            if (!fullBatch.post_application_payments) {
              fullBatch.post_application_payments = [];
            }
            setSelectedBatch(fullBatch);
            setBatchLoaded(true);
            // (sessionStorage is updated automatically by the selectedBatch watcher effect)
          } else {
            console.warn('Batch not found in open batches:', targetBatchId);
            setBatchLoaded(true);
          }
        } else {
          // No batch source found (no location.state, no formData) — mark as loaded
          // so the UI doesn't show "Loading..." indefinitely
          // console.log('No target batch ID found — batch selection needed');
          setBatchLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load batch details:', error);
        // Fallback to whatever batch data we have
        if (batch) {
          setSelectedBatch(batch);
        } else if (formData?.admission_batch) {
          setSelectedBatch(formData.admission_batch);
        } else if (existingWard?.admission_batch) {
          setSelectedBatch(existingWard.admission_batch);
        }
        setBatchLoaded(true);
      }
    };

    loadBatchDetails();
  }, [
    formData?.admission_batch?.id,
    batch?.id,
    existingWard?.admission_batch?.id,
    batch,
    formData?.admission_batch,
    existingWard?.admission_batch,
  ]);

  useEffect(() => {
    if (userChangedBatch) {
      // console.log('Skipping formData batch update - user manually changed batch');
      return;
    }

    if (formData?.admission_batch && formData.admission_batch.id !== selectedBatch?.id) {
      // If formData has a batch but selectedBatch is different or null, reload with full payment data
      const reloadBatchWithPayments = async () => {
        try {
          const response = await getOpenBatches();
          const batches = response?.data?.data || response?.data || [];
          const fullBatch = batches.find((b) => b.id === formData.admission_batch.id);
          if (fullBatch) {
            // Ensure payment arrays exist
            if (!fullBatch.pre_application_payments) {
              fullBatch.pre_application_payments = [];
            }
            if (!fullBatch.post_application_payments) {
              fullBatch.post_application_payments = [];
            }
            setSelectedBatch(fullBatch);
            setBatchLoaded(true);
          } else {
            // Fallback to formData batch if not found in open batches
            setSelectedBatch(formData.admission_batch);
            setBatchLoaded(true);
          }
        } catch (error) {
          console.error('Failed to reload batch with payments:', error);
          setSelectedBatch(formData.admission_batch);
          setBatchLoaded(true);
        }
      };

      reloadBatchWithPayments();
    }
  }, [formData?.admission_batch, selectedBatch?.id, userChangedBatch]);

  // Build dynamic steps based on batch requirements
  // Only build steps once batch is loaded to prevent flickering
  const ALL_STEPS = React.useMemo(() => {
    // Always include all possible steps while batch is loading to prevent step removal
    if (!batchLoaded || !selectedBatch) {
      // Default to showing all steps including payment while loading
      return [
        { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
        { label: 'Academic info', icon: SchoolIcon, isTabler: false },
        { label: 'Payment', icon: CreditCardIcon, isTabler: false },
        { label: 'Documents', icon: DescriptionIcon, isTabler: false },
        { label: 'Submit', icon: SendIcon, isTabler: false },
      ];
    }

    // Once batch is loaded, build actual steps based on payment requirement
    return [
      { label: 'Ward Detail', icon: GroupsIcon, isTabler: false },
      { label: 'Academic info', icon: SchoolIcon, isTabler: false },
      ...(selectedBatch.require_payment
        ? [{ label: 'Payment', icon: CreditCardIcon, isTabler: false }]
        : []),
      { label: 'Documents', icon: DescriptionIcon, isTabler: false },
      { label: 'Submit', icon: SendIcon, isTabler: false },
    ];
  }, [selectedBatch, batchLoaded]);

  const STEPS = ALL_STEPS;

  // Determine initial step - use currentStage from hook if resuming, otherwise start at 0
  // Clamp to valid range [0, 4]; invalid/low values (e.g., ?step=0 → -1) default to 0
  const resumeStep =
    parsedQueryStep !== null && !Number.isNaN(parsedQueryStep) && parsedQueryStep >= 0
      ? parsedQueryStep
      : 0;

  const [activeStep, setActiveStep] = useState(resumeStep);
  const [maxAllowedStep, setMaxAllowedStep] = useState(0); // Track the maximum step user can access

  // Hide batch summary on submit step (step 4 for payment batches, step 3 for no-payment batches).
  // Stays null until the batch has actually finished loading — otherwise
  // `selectedBatch?.require_payment` reads as falsy for an instant while the
  // batch is still in flight, guessing the "no payment" step count and
  // briefly hiding/showing the sidebar for the wrong reason.
  const submitStepIndex = batchLoaded && selectedBatch ? (selectedBatch.require_payment ? 4 : 3) : null;
  const hideBatchSummary = submitStepIndex !== null && activeStep === submitStepIndex;

  // Calculate max allowed step based on admission stage and payment status
  useEffect(() => {
    const calculateMaxAllowedStep = async () => {
      if (!admissionId || !selectedBatch) {
        // For new applications, user can only access step 0
        setMaxAllowedStep(0);
        return;
      }

      // Get the current admission stage from the database
      const dbStage = currentStage ?? 0;

      // For applications with payment requirement, check if payment has been made
      if (selectedBatch.require_payment) {
        // If user is on or past payment step (stage 2), check payment status
        if (dbStage >= 2) {
          try {
            const response = await checkAdmissionPaymentStatus(admissionId);
            const hasPaid = response?.data?.has_paid === true;

            if (!hasPaid && dbStage === 2) {
              // User is on payment step but hasn't paid - can't go beyond step 2
              setMaxAllowedStep(2);
            } else if (hasPaid) {
              // User has paid - can access up to their current stage
              setMaxAllowedStep((prev) => Math.max(prev, dbStage));
            } else {
              // Default: use database stage
              setMaxAllowedStep((prev) => Math.max(prev, dbStage));
            }
          } catch (error) {
            console.error('Failed to check payment status:', error);
            setMaxAllowedStep((prev) => Math.max(prev, dbStage));
          }
        } else {
          // User hasn't reached payment step yet
          setMaxAllowedStep((prev) => Math.max(prev, dbStage));
        }
      } else {
        // No payment required - use database stage directly
        setMaxAllowedStep((prev) => Math.max(prev, dbStage));
      }
    };

    calculateMaxAllowedStep();
  }, [admissionId, currentStage, selectedBatch]);

  // Enforce step validation - redirect if user tries to access a step beyond their allowed step
  // But allow temporary exceeding during legitimate progression (will be validated on next render)
  useEffect(() => {
    // maxAllowedStep defaults to 0 the instant this page mounts, before the
    // batch (and, when resuming, the admission itself) have actually loaded.
    // Enforcing against that transient default kicks a resuming user back to
    // step 1 before their real progress is known; once the real data lands a
    // moment later, the resume-sync effect below pushes activeStep forward
    // again — so without this guard the step visibly bounces on every load.
    if (!batchLoaded) return undefined;
    if (resumeApplication && !admissionId) return undefined;

    // Don't enforce if we're in a transition (activeStep was just updated by handleNext)
    // This prevents blocking legitimate progression
    const timer = setTimeout(() => {
      if (activeStep > maxAllowedStep) {
        console.warn(
          `User tried to access step ${activeStep}, but max allowed is ${maxAllowedStep}. Redirecting...`,
        );
        notify.warning('Please complete the previous steps first');
        setActiveStep(maxAllowedStep);
        navigate(`?step=${maxAllowedStep + 1}`, {
          replace: true,
          state: location.state,
        });
      }
    }, 100); // Small delay to allow state updates to complete

    return () => clearTimeout(timer);
  }, [activeStep, maxAllowedStep, navigate, location.state, notify, batchLoaded, resumeApplication, admissionId]);

  // Update activeStep when currentStage changes (for resuming applications)
  useEffect(() => {
    if (resumeApplication && currentStage !== null && currentStage !== undefined) {
      // Only update if we're resuming and currentStage is loaded
      setActiveStep(currentStage);
    }
  }, [currentStage, resumeApplication]);

  // Watch for manual URL step changes (e.g., user edits step in browser address bar)
  // This runs BEFORE the activeStep→URL sync so the URL change takes effect first
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      const step = Number(stepParam) - 1;
      if (!Number.isNaN(step) && step >= 0 && step < 5 && step !== activeStep) {
        setActiveStep(step);
      }
    }
  }, [location.search]);

  // Sync activeStep to URL (fires when user clicks Next/Back or step changes)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentStep = params.get('step');
    if (currentStep !== String(activeStep + 1)) {
      navigate(`?step=${activeStep + 1}`, {
        replace: true,
        state: locationStateRef.current,
      });
    }
  }, [activeStep, navigate]);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => {
    if (activeStep === 0) navigate('/dashboard');
    else setActiveStep((s) => s - 1);
  };

  const handleWardSubmit = async (values) => {
    // Include the selected batch ID with ward data
    const dataWithBatch = {
      ...values,
      admission_batch_id: selectedBatch?.id,
    };

    const result = await saveStepData(0, dataWithBatch);
    if (result.success) {
      // Update selectedBatch if the backend returned updated admission_batch
      // Always fetch full batch data to ensure payment arrays are present
      if (result.data?.admission_batch?.id) {
        try {
          const response = await getOpenBatches();
          const batches = response?.data?.data || response?.data || [];
          const fullBatch = batches.find((b) => b.id === result.data.admission_batch.id);
          if (fullBatch) {
            // Ensure payment arrays exist
            if (!fullBatch.pre_application_payments) {
              fullBatch.pre_application_payments = [];
            }
            if (!fullBatch.post_application_payments) {
              fullBatch.post_application_payments = [];
            }
            setSelectedBatch(fullBatch);
            setBatchLoaded(true);
          }
        } catch (error) {
          console.error('Failed to reload batch after ward submit:', error);
          // Fallback: merge with existing batch to preserve payment arrays
          const updatedBatch = result.data.admission_batch;
          setSelectedBatch((prev) => ({
            ...updatedBatch,
            pre_application_payments:
              updatedBatch.pre_application_payments ?? prev?.pre_application_payments ?? [],
            post_application_payments:
              updatedBatch.post_application_payments ?? prev?.post_application_payments ?? [],
          }));
          setBatchLoaded(true);
        }
      }
      // Reset the userChangedBatch flag since we've now saved the batch change
      setUserChangedBatch(false);
      // Update max allowed step FIRST to allow access to next step
      const nextStep = activeStep + 1;
      setMaxAllowedStep((prev) => Math.max(prev, nextStep));
      // Then proceed to next step
      handleNext();
    } else {
      notify.error(result.error || 'Failed to save ward details');
    }
  };

  const handleAcademicSubmit = async (values) => {
    // Include the selected batch ID with academic data
    const dataWithBatch = {
      ...values,
      admission_batch_id: selectedBatch?.id,
    };

    const result = await saveStepData(1, dataWithBatch);
    if (result.success) {
      // Update selectedBatch if the backend returned updated admission_batch
      // Always fetch full batch data to ensure payment arrays are present
      if (result.data?.admission_batch?.id) {
        try {
          const response = await getOpenBatches();
          const batches = response?.data?.data || response?.data || [];
          const fullBatch = batches.find((b) => b.id === result.data.admission_batch.id);
          if (fullBatch) {
            // Ensure payment arrays exist
            if (!fullBatch.pre_application_payments) {
              fullBatch.pre_application_payments = [];
            }
            if (!fullBatch.post_application_payments) {
              fullBatch.post_application_payments = [];
            }
            setSelectedBatch(fullBatch);
            setBatchLoaded(true);
          }
        } catch (error) {
          console.error('Failed to reload batch after academic submit:', error);
          // Fallback: merge with existing batch to preserve payment arrays
          const updatedBatch = result.data.admission_batch;
          setSelectedBatch((prev) => ({
            ...updatedBatch,
            pre_application_payments:
              updatedBatch.pre_application_payments ?? prev?.pre_application_payments ?? [],
            post_application_payments:
              updatedBatch.post_application_payments ?? prev?.post_application_payments ?? [],
          }));
          setBatchLoaded(true);
        }
      }
      // Reset the userChangedBatch flag since we've now saved the batch change
      setUserChangedBatch(false);
      // Update max allowed step FIRST to allow access to next step
      const nextStep = activeStep + 1;
      setMaxAllowedStep((prev) => Math.max(prev, nextStep));
      // Then proceed to next step
      handleNext();
    } else {
      notify.error(result.error || 'Failed to save academic information');
    }
  };

  const handlePaymentComplete = async () => {
    const paymentStepIndex = 2; // Payment is always step 2 when present
    const result = await updateStage(paymentStepIndex);
    if (result.success) {
      // Update max allowed step FIRST to allow access to documents step
      const nextStep = activeStep + 1;
      setMaxAllowedStep((prev) => Math.max(prev, nextStep));
      // Then proceed to next step
      handleNext();
    } else {
      notify.error(result.error || 'Failed to update payment status');
    }
  };

  const handleDocumentsSubmit = async (files) => {
    const documentsStepIndex = selectedBatch?.require_payment ? 3 : 2;
    const result = await saveStepData(documentsStepIndex, files);
    if (result.success) {
      // Update selectedBatch if the backend returned updated admission_batch
      if (result.data?.admission_batch) {
        setSelectedBatch(result.data.admission_batch);
      }
      // Update max allowed step FIRST to allow access to submit step
      const nextStep = activeStep + 1;
      setMaxAllowedStep((prev) => Math.max(prev, nextStep));
      // Then proceed to next step
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
      sessionStorage.removeItem('selected_admission_batch');
      localStorage.removeItem('admissionFormData');
      navigate(`/application-tracker/${admissionId}`);
    } else {
      notify.error(result.error || 'Failed to submit application');
    }
  };

  const renderStep = () => {
    // Map activeStep to actual step considering dynamic payment step
    let actualStep = activeStep;

    // Steps 2+ render a different component depending on whether this batch
    // requires payment — which isn't known until the batch has actually
    // finished loading. Rendering before then guesses the "no payment"
    // branch and briefly shows the wrong step (e.g. Submit instead of
    // Documents) right before it snaps to the correct one. Wait it out
    // instead of flashing the wrong content.
    if (actualStep >= 2 && (!batchLoaded || !selectedBatch)) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (actualStep) {
      case 0:
        return (
          <WardDetailForm
            initialValues={formData.wardData}
            onSubmit={handleWardSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            serverErrors={serverErrors}
            selectedBatch={selectedBatch}
            admissionId={admissionId}
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
            admissionId={admissionId}
          />
        );
      case 2:
        if (selectedBatch?.require_payment) {
          return (
            <PaymentStep
              onNext={handlePaymentComplete}
              onBack={handleBack}
              isLoading={isLoading}
              selectedBatch={selectedBatch}
              admissionId={admissionId}
              intendingClassId={formData?.academicData?.intending_class_id}
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
              selectedBatch={selectedBatch}
              admissionId={admissionId}
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
              selectedBatch={selectedBatch}
              admissionId={admissionId}
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
              admissionId={admissionId}
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
            admissionId={admissionId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer title="New Application" description="Apply for admission">
      <Box sx={hideBatchSummary ? { overflow: { xs: 'visible', sm: 'hidden' }, height: { xs: 'auto', sm: '100vh' } } : {}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.25,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            <Box
              sx={{
                width: 4,
                height: 32,
                borderRadius: 4,
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GroupsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
                Application Form
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word' }}>
                Session: {selectedBatch?.session_term?.session?.session_name}{' '}
                {selectedBatch?.session_term?.term?.term_name}
                {selectedBatch?.require_payment && selectedBatch?.application_fee !== '0.00' && (
                  <>
                    {' · '}₦{Number(selectedBatch?.application_fee ?? 5000).toLocaleString()} Application Fee
                  </>
                )}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: '16px !important' }} />}
            onClick={() => navigate('/dashboard')}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'none',
              flexShrink: 0,
              alignSelf: { xs: 'flex-end', sm: 'center' },
              '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
            }}
          >
            Back to dashboard
          </Button>
        </Box>

        <StepperBar activeStep={activeStep} steps={STEPS} />

        {/* ── Content + Sidebar ── */}
        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: hideBatchSummary ? 12 : 8 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: '#e2e8f0',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                p: { xs: 1.5, sm: 1.75 },
                ...(hideBatchSummary && {
                  // Locking to a fixed height + internal scroll only makes sense
                  // once there's room for it — on mobile it fights the browser's
                  // own collapsing address bar and can clip content, so let the
                  // page scroll naturally there instead.
                  height: { xs: 'auto', sm: 'calc(100vh - 260px)' },
                  overflowY: { xs: 'visible', sm: 'auto' },
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
                batchLoaded={batchLoaded}
                onChangeBatch={() => setBatchModalOpen(true)}
                activeStep={activeStep}
              />
            </Grid>
          )}
        </Grid>

        <AdmissionBatchModal
          open={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          onApply={(newBatch) => {
            // console.log('User manually changed batch to:', newBatch);
            setSelectedBatch(newBatch);
            setBatchLoaded(true);
            setUserChangedBatch(true); // Mark that user manually changed the batch
          }}
        />
      </Box>
    </PageContainer>
  );
};

export default NewApplication;
