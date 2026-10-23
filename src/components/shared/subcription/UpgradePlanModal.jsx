import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Button, Alert, CircularProgress, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import PlanSummary, { planDataOf } from './PlanSummary';

const UpgradePlanModal = ({ open, onClose, selectedRow, onUpgrade }) => {
  const [form, setForm] = useState({
    studentpopulation: '',
    my_plan_id: '',
  });
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && selectedRow) {
      const population = selectedRow.plans?.data?.students_limit || '';
      setForm({ studentpopulation: population, my_plan_id: '' });
      setPlans([]);
      setErrors({});
    }
  }, [open, selectedRow]);

  useEffect(() => {
    if (!form.studentpopulation) {
      setPlans([]);
      return;
    }

    const fetchPlans = async () => {
      try {
        setFetchingPlans(true);
        const res = await subscriptionApi.getPlansByPopulation(form.studentpopulation);
        setPlans(res.data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      } finally {
        setFetchingPlans(false);
      }
    };
    fetchPlans();
  }, [form.studentpopulation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'studentpopulation' ? { my_plan_id: '' } : {}) }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.studentpopulation) {
      newErrors.studentpopulation = 'Student population is required';
    }
    if (!form.my_plan_id) {
      newErrors.my_plan_id = 'Plan is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await subscriptionApi.upgradeSubscription(selectedRow.id, {
        my_plan_id: form.my_plan_id,
      });
      onUpgrade(res.data);
      onClose();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to upgrade subscription' });
    } finally {
      setSubmitting(false);
    }
  };

  const currentPopulation = planDataOf(selectedRow?.plans).students_limit;
  const currentModules = (selectedRow?.plans?.modules || []).map((m) => m.module_name).filter(Boolean);
  const selectedPlan = plans.find((p) => String(p.id) === form.my_plan_id);
  const selectedPlanPopulation = selectedPlan ? planDataOf(selectedPlan.plan).students_limit : null;
  const selectedPlanModules = selectedPlan
    ? (selectedPlan.plan?.modules || []).map((m) => m.module_name).filter(Boolean)
    : [];
  const isCurrentlyActive = selectedRow?.status === 'active';

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Change Plan"
      subtitle="Review what you currently have before switching — changing plans has real consequences for your access."
      size="medium"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box component="form" onSubmit={handleSubmit}>
        {selectedRow && (
          <PlanSummary
            label="Current Plan"
            name={selectedRow.my_plans?.display_name}
            price={selectedRow.my_plans?.price}
            population={currentPopulation}
            modules={currentModules}
            chipColor="default"
          />
        )}

        {selectedRow?.extended_due_date && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This plan was set up for your school after your free trial ended, so you wouldn&apos;t be
            locked out while deciding — it&apos;s not a plan you&apos;re required to keep. Pick whichever
            plan actually suits your school below.
          </Alert>
        )}

        <Alert severity={isCurrentlyActive ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {isCurrentlyActive ? (
            <>
              Your subscription is currently <strong>active</strong>. Changing plans will move it back to{' '}
              <strong>Pending</strong>, and you&apos;ll need to complete a new payment for the new plan
              before full access is restored. Your current plan stays active until then.
            </>
          ) : (
            <>
              Your subscription is currently <strong>pending</strong> payment. Changing plans now updates
              what you&apos;ll pay for — you still need to complete payment to activate it.
            </>
          )}
        </Alert>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Student Population"
          name="studentpopulation"
          value={form.studentpopulation}
          onChange={handleChange}
          margin="normal"
          error={!!errors.studentpopulation}
          helperText={errors.studentpopulation}
          select
          disabled={submitting}
        >
          <MenuItem value="">Select Student Population</MenuItem>
          <MenuItem value="0 - 99">0-99 Students</MenuItem>
          <MenuItem value="100 - 199">100-199 Students</MenuItem>
          <MenuItem value="200 and above">200 and above Students</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Select New Plan"
          name="my_plan_id"
          value={form.my_plan_id}
          onChange={handleChange}
          margin="normal"
          error={!!errors.my_plan_id}
          helperText={
            !form.studentpopulation
              ? 'Select a student population first'
              : fetchingPlans
                ? 'Loading plans...'
                : plans.length === 0
                  ? 'No plans available for this population'
                  : errors.my_plan_id
          }
          select
          disabled={!form.studentpopulation || fetchingPlans || submitting}
        >
          <MenuItem value="">Select Plan</MenuItem>
          {plans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id.toString()}>
              {plan.display_name} (₦{parseFloat(plan.price).toLocaleString()})
            </MenuItem>
          ))}
        </TextField>

        {selectedPlan && (
          <>
            <Divider sx={{ my: 2 }} />
            <PlanSummary
              label="New Plan"
              name={selectedPlan.display_name}
              price={selectedPlan.price}
              population={selectedPlanPopulation}
              modules={selectedPlanModules}
              chipColor="primary"
            />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="small" type="submit" color="primary" disabled={submitting || fetchingPlans}>
            {submitting ? <CircularProgress size={20} /> : 'Change Plan'}
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

UpgradePlanModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
  onUpgrade: PropTypes.func.isRequired,
};

export default UpgradePlanModal;
