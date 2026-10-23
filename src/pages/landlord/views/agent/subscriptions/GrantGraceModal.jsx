import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Typography,
  Collapse,
  Link,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import axios from '@/api/landlord/landlord_api';
import useNotification from '@/hooks/useNotification';
import PlanSummary, { planDataOf } from '@/components/shared/subcription/PlanSummary';

const formatDate = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/**
 * For a school with no subscription on file for its own active term right
 * now — whether they've never subscribed at all, or subscribed before and
 * the rollover to this term never created a row. "Extend Due Date" only
 * works on an existing row, so there's nothing for it to act on here. This
 * creates a pending subscription on the plan the agent picks, then
 * immediately extends its due date, in one step.
 *
 * Schools are created by agents and subscribe on their CREATING agent's
 * plans, so the plan list is fetched per-school (not from whoever is
 * logged in viewing this modal — a root-org staff member can be granting
 * grace to a school that belongs to a different sub-agent entirely). The
 * same call also returns the school's active term's generated-weeks
 * window, since a due date only makes sense inside the weeks the school
 * has actually set up for that term — the backend rejects anything
 * outside it.
 */
const GrantGraceModal = ({ open, onClose, school, onGranted }) => {
  const notify = useNotification();
  const [plans, setPlans] = useState([]);
  const [termWindow, setTermWindow] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [myPlanId, setMyPlanId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showWeeks, setShowWeeks] = useState(false);

  useEffect(() => {
    if (!open || !school?.id) return;
    setMyPlanId('');
    setDueDate('');
    setError('');
    setTermWindow(null);
    setShowWeeks(false);

    const loadPlans = async () => {
      try {
        setFetchingPlans(true);
        const res = await axios.get(`/v1/landlord/subscriptions/schools-needing-subscription/${school.id}/plans`);
        setPlans(res.data?.data || []);
        setTermWindow(res.data?.term_window || null);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setPlans([]);
      } finally {
        setFetchingPlans(false);
      }
    };
    loadPlans();
  }, [open, school?.id]);

  const selectedPlan = plans.find((p) => String(p.id) === myPlanId);

  // Due date must be both in the future (backend's own `after:today` rule)
  // and inside the term's generated weeks, when there are any — whichever
  // of those two bounds is later wins as the actual earliest pickable date.
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const minDueDate = termWindow?.start_date && termWindow.start_date > tomorrow ? termWindow.start_date : tomorrow;
  const maxDueDate = termWindow?.end_date;

  const handleSubmit = async () => {
    if (!myPlanId || !dueDate) {
      setError('Select a plan and a due date.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`/v1/landlord/subscriptions/schools-needing-subscription/${school.id}/grant-grace`, {
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
      subtitle={
        school
          ? `For ${school.tenant_name} — no subscription on file for ${
              school.active_session_name && school.active_term_name
                ? `${school.active_session_name} - ${school.active_term_name}`
                : 'their active term'
            } yet.`
          : undefined
      }
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
                ? "No active plans configured for this school's agent"
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

        {!fetchingPlans && termWindow && (
          <Box sx={{ mt: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '10px' }}>
            <Typography variant="body2" fontWeight={600}>
              {termWindow.session_name} — {termWindow.term_name}: {termWindow.weeks_count} week(s) generated,{' '}
              {formatDate(termWindow.start_date)} to {formatDate(termWindow.end_date)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              The due date below must fall somewhere in this range — it's the window the school has actually
              set up for this term.
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Link component="button" type="button" variant="caption" onClick={() => setShowWeeks((s) => !s)}>
                {showWeeks ? 'Hide week-by-week breakdown' : 'Show week-by-week breakdown'}
              </Link>
            </Box>
            <Collapse in={showWeeks}>
              <Stack spacing={0.25} sx={{ mt: 1, maxHeight: 160, overflowY: 'auto' }}>
                {(termWindow.weeks || []).map((week) => (
                  <Typography key={week.label} variant="caption" color="text.secondary">
                    {week.label}: {formatDate(week.start_date)} – {formatDate(week.end_date)}
                  </Typography>
                ))}
              </Stack>
            </Collapse>
          </Box>
        )}

        {!fetchingPlans && !termWindow && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This school hasn&apos;t generated any weeks for its active term yet (calendar setup is still
            pending on their side), so any future date is accepted below.
          </Alert>
        )}

        <TextField
          fullWidth
          type="date"
          label="New Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDueDate, max: maxDueDate }}
          helperText={
            termWindow
              ? `Must be between ${formatDate(termWindow.start_date)} and ${formatDate(termWindow.end_date)}.`
              : "Must be a future date — matches the backend's own validation."
          }
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
