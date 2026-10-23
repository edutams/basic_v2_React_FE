import React, { useState } from 'react';
import { Box, Button, Alert, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import PlanSummary, { planDataOf } from './PlanSummary';

const RevertPlanModal = ({ open, onClose, selectedRow, onRevert }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await subscriptionApi.revertSubscription(selectedRow.id, {});
      onRevert(res.data);
      onClose();
    } catch (err) {
      console.error('Error reverting subscription:', err);
      setError(err.response?.data?.message || 'Failed to revert subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Revert Plan"
      size="medium"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box>
        {selectedRow && (
          <PlanSummary
            label="Current Plan"
            name={selectedRow.my_plans?.display_name}
            price={selectedRow.my_plans?.price}
            population={planDataOf(selectedRow.plans).students_limit}
            modules={(selectedRow.plans?.modules || []).map((m) => m.module_name).filter(Boolean)}
            chipColor="default"
          />
        )}

        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Are you sure you want to revert to the previous plan?
        </Typography>

        {selectedRow?.previous_plan_id && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The subscription will revert to the plan used before the last upgrade, and will be{' '}
            <strong>reactivated immediately</strong> — no new payment is required, since you already
            paid for that plan.
          </Alert>
        )}

        {!selectedRow?.previous_plan_id && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No previous plan available to revert to.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
          <Button variant="outlined" size="small" color="inherit" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !selectedRow?.previous_plan_id}
          >
            {submitting ? <CircularProgress size={20} /> : 'Revert Plan'}
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

RevertPlanModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
  onRevert: PropTypes.func.isRequired,
};

export default RevertPlanModal;
