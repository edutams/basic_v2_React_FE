import React from 'react';
import { Stack, useTheme } from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';
import SectionCard from './SectionCard';
import AlertCard from './AlertCard';

/**
 * Operational Alerts sidebar — stacks the alert cards alongside the matrix.
 */
const OperationalAlerts = ({ operational_alerts = [] }) => {
  const theme = useTheme();

  return (
    <SectionCard
      icon={NotificationsActive}
      title="Operational Alerts"
      color={theme.palette.error.main}
      sx={{ height: '100%' }}
    >
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {operational_alerts.map((alert, i) => (
          <AlertCard key={i} alert={alert} />
        ))}
      </Stack>
    </SectionCard>
  );
};

export default OperationalAlerts;
