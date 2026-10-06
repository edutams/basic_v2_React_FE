import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Button, Alert, CircularProgress, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import axios from '@/api/landlord/landlord_api';
import useNotification from '@/hooks/useNotification';
import PlanSummary, { planDataOf } from '@/components/shared/subcription/PlanSummary';

/**
 * For a school whose free trial ended with no subscription ever created —
 * "Extend Due Date" only works on an existing row, so there's nothing for
 * it to act on here. This creates a pending subscription on the plan the
 * agent picks, then immediately extends its due date, in one step.
 */
const GrantGraceModal = ({ open, onClose, school, onGranted }) => {
  const notify = useNotification();
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [myPlanId, setMyPlanId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setMyPlanId('');
    setDueDate('');
    setError('');

    const loadPlans = async () => {
      try {
        setFetchingPlans(true);
        const res = await axios.get('/v1/landlord/subscriptions/never-subscribed/plans');
        setPlans(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setPlans([]);
      } finally {
        setFetchingPlans(false);
      }
    };
    loadPlans();
  }, [open]);

  const selectedPlan = plans.find((p) => String(p.id) === myPlanId);

  const handleSubmit = async () => {
    if (!myPlanId || !dueDate) {
      setError('Select a plan and a due date.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`/v1/landlord/subscriptions/never-subscribed/${school.id}/grant-grace`, {
        my_plan_id: myPlanId,
        due_date: dueDate,
      });
      notify.success(`Grace period granted to ${school.tenant_name}`, 'Success');
      onGranted?.(res.data?.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grant grace period');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Grant Grace Period"
      subtitle={school ? `For ${school.tenant_name} — their free trial ended with no subscription on file yet.` : undefined}
      size="medium"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          This creates a <strong>pending</strong> subscription for the school&apos;s active term on the plan
          you choose below, and extends its due date so they aren&apos;t locked out while they decide. The
          school can change to a different plan at any time before paying — this doesn&apos;t commit them
          to it.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          select
          label="Plan"
          value={myPlanId}
          onChange={(e) => setMyPlanId(e.target.value)}
          margin="normal"
          disabled={fetchingPlans || submitting}
          helperText={
            fetchingPlans
              ? 'Loading plans...'
              : plans.length === 0
                ? 'No active plans configured for your organization'
                : ''
          }
        >
          <MenuItem value="">Select Plan</MenuItem>
          {plans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id.toString()}>
              {plan.display_name} (₦{parseFloat(plan.price).toLocaleString()})
            </MenuItem>
          ))}
        </TextField>

        {selectedPlan && (
          <PlanSummary
            label="Selected Plan"
            name={selectedPlan.display_name}
            price={selectedPlan.price}
            population={planDataOf(selectedPlan.plan).students_limit}
            modules={(selectedPlan.plan?.modules || []).map((m) => m.module_name).filter(Boolean)}
            chipColor="primary"
          />
        )}

        <TextField
          fullWidth
          type="date"
          label="New Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: new Date(Date.now() + 86400000).toISOString().slice(0, 10) }}
          helperText="Must be a future date — matches the backend's own validation."
          margin="normal"
          disabled={submitting}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
          <Button variant="outlined" size="small" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSubmit} disabled={submitting || fetchingPlans}>
            {submitting ? <CircularProgress size={18} /> : 'Grant Grace Period'}
          </Button>
        </Stack>
      </Box>
    </ReusableModal>
  );
};

GrantGraceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  school: PropTypes.object,
  onGranted: PropTypes.func,
};

export default GrantGraceModal;
