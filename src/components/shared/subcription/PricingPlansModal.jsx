import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Chip, Stack, Skeleton, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import { planDataOf } from './PlanSummary';

const PLAN_COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#D97706', '#16A34A'];

/** Read-only pricing catalogue — reuses the same /subscriptions/plans
 * endpoint and `plan.modules`/`plan.data` shape already relied on by
 * UpgradePlanModal/RevertPlanModal, just without a selection action. */
const PricingPlansModal = ({ open, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const loadPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await subscriptionApi.getPlans();
        setPlans(res.data || []);
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
        setError('Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [open]);

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Pricing Plans"
      subtitle="Every plan currently available to your school."
      size="large"
      disableEnforceFocus
      disableAutoFocus
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))
        ) : plans.length > 0 ? (
          plans.map((plan, index) => {
            const population = planDataOf(plan.plan).students_limit;
            const modules = (plan.plan?.modules || []).map((m) => m.module_name).filter(Boolean);
            const color = PLAN_COLORS[index % PLAN_COLORS.length];

            return (
              <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderTop: '3px solid',
                    borderTopColor: color,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {plan.display_name}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color, my: 0.5 }}>
                    ₦{parseFloat(plan.price || 0).toLocaleString()}
                  </Typography>
                  {population && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      For {population} students
                    </Typography>
                  )}
                  {modules.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {modules.map((m) => (
                        <Chip key={m} label={m} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Grid>
            );
          })
        ) : (
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No plans are currently configured for your school.
            </Typography>
          </Grid>
        )}
      </Grid>
    </ReusableModal>
  );
};

PricingPlansModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PricingPlansModal;
