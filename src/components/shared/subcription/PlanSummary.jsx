import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import PropTypes from 'prop-types';

export const planDataOf = (plan) => {
  if (!plan?.data) return {};
  return typeof plan.data === 'string' ? JSON.parse(plan.data) : plan.data;
};

/** Read-only "what this plan includes" block — shared by UpgradePlanModal
 * and RevertPlanModal so a school always sees the same level of detail
 * (price, student population, included modules) for any plan it's about
 * to be moved onto, not just the plan's bare name. */
const PlanSummary = ({ label, name, price, population, modules, chipColor }) => (
  <Box sx={{ p: 1.5, borderRadius: '8px', border: '1px solid', borderColor: 'divider', mb: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
      <Typography variant="subtitle2" fontWeight={700}>{label}: {name || 'N/A'}</Typography>
      {price != null && <Chip size="small" color={chipColor} label={`₦${parseFloat(price).toLocaleString()}`} />}
    </Stack>
    {population && (
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
        For {population} students
      </Typography>
    )}
    {modules?.length > 0 && (
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {modules.map((m) => (
          <Chip key={m} label={m} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
        ))}
      </Stack>
    )}
  </Box>
);

PlanSummary.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  population: PropTypes.string,
  modules: PropTypes.arrayOf(PropTypes.string),
  chipColor: PropTypes.string,
};

export default PlanSummary;
