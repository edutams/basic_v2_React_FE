import React from 'react';
import { Box, Paper, Avatar, Typography, Chip, Button } from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Build admission steps array based on batch configuration
 * These represent the admission process stages, not form completion
 */
const buildAdmissionSteps = (adm) => {
  const admission = adm?.admissionData;
  const hasEntranceExam = admission?.admission_batch?.has_entrance_exam;

  if (hasEntranceExam) {
    return ['Applied', 'E-Exam', 'Admitted', 'Enrolled'];
  } else {
    return ['Applied', 'Admitted', 'Enrolled'];
  }
};

/**
 * Calculate current admission step based on admission status
 * Returns the index of the current step in the admission process
 */
const calculateAdmissionStep = (admissionData) => {
  const admission = admissionData?.admissionData || admissionData;
  const hasExam = admission?.admission_batch?.has_entrance_exam;

  const isAdmitted = admission?.admission_status === 'admitted';
  const isEnrolled = isAdmitted && admission?.accept_admission_offer === 'yes';

  // Step 3: Enrolled 
  if (isEnrolled) {
    return hasExam ? 3 : 2;
  }

  // Step 2: Admitted
  if (isAdmitted) {
    return hasExam ? 2 : 1;
  }

  // Step 1: Exam completed
  if (
    hasExam &&
    admission?.form_submit_status === 'yes' &&
    admission?.entrance_exam_score != null
  ) {
    return 1;
  }

  // Step 0: Applied (ONLY if submitted but not admitted)
  if (admission?.form_submit_status === 'yes') {
    return 0;
  }

  // Draft
  return -1;
};

// Admission progress stepper
const AdmissionSteps = ({ admissionData }) => {
  const steps = buildAdmissionSteps(admissionData);
  const currentStep = calculateAdmissionStep(admissionData);
  const admission = admissionData?.admissionData || admissionData;
  
  // If form not submitted yet, show "Draft" state
  const isDraft = admission?.form_submit_status !== 'yes';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, mb: 1 }}>
      {isDraft ? (
        // Show draft state
        <Box sx={{ 
          width: '100%', 
          textAlign: 'center', 
          py: 1, 
          bgcolor: 'warning.lighter',
          borderRadius: 1,
        }}>
          <Typography variant="caption" color="warning.dark" fontWeight={600}>
            Application Draft - Not Yet Submitted
          </Typography>
        </Box>
      ) : (
        // Show admission process steps
        steps.map((step, i) => {
          // A step is "done" if it's at or before the current step
          const done = i <= currentStep;
          // No "active" state - steps are either done or pending
          const pending = i > currentStep;
          
          return (
            <React.Fragment key={step}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: done ? 'primary.main' : 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done ? (
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />
                  ) : (
                    <PendingIcon sx={{ fontSize: 18, color: 'grey.400' }} />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color={done ? 'primary.main' : 'text.disabled'}
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
        })
      )}
    </Box>
  );
};

// Prospective ward card — always expanded, click header to navigate to application
const ProspectiveWardCard = ({ ward, onViewDetails }) => {
  const isAdmitted = ward.status === 'admitted';
  const admission = ward.admissionData;

  // Check if payment is required and not yet paid
  const requiresPayment = admission?.admission_batch?.require_payment;
  const applicationFee = parseFloat(admission?.admission_batch?.application_fee || 0);
  const acceptanceFee = parseFloat(admission?.admission_batch?.acceptance_fee || 0);
  const totalFee = applicationFee + acceptanceFee;

  // Show payment action if ALL conditions are met:
  // 1. Payment is required (require_payment === true)
  // 2. Form is submitted (form_submit_status === 'yes')
  // 3. Total fee > 0 (application_fee + acceptance_fee)
  // 4. Not yet admitted (admission_status !== 'admitted')
  const showPaymentAction = 
    requiresPayment &&
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
