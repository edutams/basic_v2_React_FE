import React from 'react';
import { Box, Paper, Avatar, Typography, Chip, Button } from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Calculate form completion step based on admission_stage
 * Maps backend admission_stage to visual step index accounting for dynamic payment step
 */
const calculateFormStep = (admissionData) => {
  const admission = admissionData?.admissionData || admissionData;
  
  // If form is submitted, show as completed (last step)
  if (admission?.form_submit_status === 'yes') {
    const requiresPayment = admission?.admission_batch?.require_payment;
    return requiresPayment ? 4 : 3; // Last step index
  }
  
  // Use the current admission_stage from backend
  const stage = admission?.admission_stage ?? 0;
  const requiresPayment = admission?.admission_batch?.require_payment;
  
  // If payment is not required and stage >= 2, we need to adjust
  // because the visual steps don't include payment
  // Backend stages: 0=Ward, 1=Academic, 2=Payment, 3=Documents, 4=Submit
  // Visual steps (no payment): 0=Ward, 1=Academic, 2=Documents, 3=Submit
  if (!requiresPayment && stage >= 2) {
    return stage - 1; // Shift down by 1 to skip payment step
  }
  
  return stage;
};

/**
 * Build form steps array based on batch configuration
 */
const buildFormSteps = (admissionData) => {
  const admission = admissionData?.admissionData || admissionData;
  const requiresPayment = admission?.admission_batch?.require_payment;

  if (requiresPayment) {
    return ['Ward Detail', 'Academic Info', 'Payment', 'Documents', 'Submit'];
  } else {
    return ['Ward Detail', 'Academic Info', 'Documents', 'Submit'];
  }
};

// Form progress stepper
const AdmissionSteps = ({ admissionData }) => {
  const steps = buildFormSteps(admissionData);
  const currentStep = calculateFormStep(admissionData);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, mb: 1 }}>
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <React.Fragment key={step}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: done || active ? 'primary.main' : 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />
                ) : (
                  <PendingIcon sx={{ fontSize: 18, color: active ? '#fff' : 'grey.400' }} />
                )}
              </Box>
              <Typography
                variant="caption"
                color={done || active ? 'primary.main' : 'text.disabled'}
                mt={0.5}
                sx={{ fontSize: '0.65rem' }}
              >
                {step}
              </Typography>
            </Box>

            {i < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  bgcolor: done ? 'primary.main' : 'grey.200',
                  mb: 2.5,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

// Prospective ward card — always expanded, click header to navigate to application
const ProspectiveWardCard = ({ ward, onViewDetails }) => {
  const isAdmitted = ward.status === 'Admitted';
  const admission = ward.admissionData;

  // Check if payment is required and not yet paid
  const requiresPayment = admission?.admission_batch?.require_payment;
  const applicationFee = parseFloat(admission?.admission_batch?.application_fee || 0);
  const acceptanceFee = parseFloat(admission?.admission_batch?.acceptance_fee || 0);
  const totalFee = applicationFee + acceptanceFee;

  // Show payment action if:
  // 1. Payment is required
  // 2. Form is submitted
  // 3. Total fee > 0
  // 4. Not yet admitted (payment should be done before admission)
  const showPaymentAction = requiresPayment &&
    admission?.form_submit_status === 'yes' &&
    totalFee > 0 &&
    admission?.admission_status !== 'admitted';

  return (
    <Paper variant="outlined" sx={{
      borderRadius: 2, overflow: 'hidden', mb: 1.5, cursor: 'pointer',
      transition: 'background 0.15s',
      '&:hover': { bgcolor: 'action.hover' }
    }}
      onClick={() => onViewDetails?.(ward)}
    >
      {/* Header row — clickable */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
          {ward.initials}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {ward.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {ward.class} · Application #{ward.applicationNo}
          </Typography>
        </Box>

        <Chip
          icon={
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: isAdmitted ? 'success.main' : 'warning.main',
                ml: 0.5,
              }}
            />
          }
          label={ward.status}
          size="small"
          sx={{
            bgcolor: isAdmitted ? '#E8F5E9' : '#FFF4E5',
            color: isAdmitted ? 'success.dark' : 'warning.dark',
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      {/* Detail — always visible */}
      <Box sx={{ px: 2, pb: 2 }}>
        <AdmissionSteps admissionData={ward} />

        {showPaymentAction && (
          <Paper
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 2,
              bgcolor: '#FFF8F0',
              border: '1px solid',
              borderColor: '#FFD8AB',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#FFD8AB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WalletIcon sx={{ color: '#EF9146', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Pay application fee · ₦{totalFee.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Complete payment to proceed
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={(e) => { e.stopPropagation(); onViewDetails?.(ward); }}
              sx={{ borderRadius: 1, fontWeight: 700, bgcolor: '#EF9146', fontSize: '0.75rem' }}
            >
              Pay now
            </Button>
          </Paper>
        )}
      </Box>
    </Paper>
  );
};

ProspectiveWardCard.propTypes = {
  ward: PropTypes.shape({
    name: PropTypes.string,
    initials: PropTypes.string,
    class: PropTypes.string,
    applicationNo: PropTypes.string,
    status: PropTypes.string,
    step: PropTypes.number,
    expanded: PropTypes.bool,
    actionLabel: PropTypes.string,
    actionDue: PropTypes.string,
    admissionData: PropTypes.object,
  }).isRequired,
  onViewDetails: PropTypes.func,
};

export default ProspectiveWardCard;
