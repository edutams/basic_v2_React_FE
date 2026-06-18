import { Box, Typography, Skeleton, Divider } from '@mui/material';
import {
  IconSchool,
  IconUsers,
  IconUserCheck,
  IconClock,
  IconCircleCheck,
  IconUserPlus,
} from '@tabler/icons-react';

const StatBox = ({ label, value, color = 'text.primary', loading, borderRight = true }) => (
  <Box
    sx={{
      flex: 1,
      px: 2.5,
      py: 2,
      borderRight: borderRight ? '1px solid' : 'none',
      borderColor: 'divider',
    }}
  >
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {label}
    </Typography>
    {loading ? (
      <Skeleton width={60} height={36} />
    ) : (
      <Typography variant="h5" fontWeight={700} color={color}>
        {(value ?? 0).toLocaleString()}
      </Typography>
    )}
  </Box>
);

const OverviewCards = ({ data, loading }) => {
  const schools = data?.schools ?? {};
  const people = data?.people ?? {};
  const apps = data?.applications ?? {};
  const onboarding = data?.onboarding ?? {};

  const rows = [
    [
      { label: 'Total Schools', value: schools.total, color: 'text.primary' },
      { label: 'Active Schools', value: schools.active, color: 'success.main' },
      { label: 'Inactive Schools', value: schools.inactive, color: 'error.main' },
      { label: 'Primary Schools', value: schools.primary, color: 'info.main' },
      { label: 'Secondary Schools', value: schools.secondary, color: 'warning.main' },
      { label: 'Schools This Month', value: schools.this_month, color: 'primary.main' },
      { label: 'Schools This Year', value: schools.this_year, color: 'primary.main' },
    ],
    [
      { label: 'Total Students', value: people.total_students, color: 'text.primary' },
      { label: 'Active Students', value: people.active_students, color: 'success.main' },
      { label: 'Total Staff', value: people.total_staff, color: 'info.main' },
      { label: 'Teaching Staff', value: people.teaching_staff, color: 'info.main' },
      { label: 'Non-Teaching Staff', value: people.non_teaching_staff, color: 'text.secondary' },
      { label: 'Total Guardians', value: people.total_guardians, color: 'warning.main' },
      { label: 'Total Enrollments', value: people.total_enrollments, color: 'primary.main' },
    ],
    [
      { label: 'Applications Total', value: apps.total, color: 'text.primary' },
      { label: 'Pending Applications', value: apps.pending, color: 'warning.main' },
      { label: 'Approved Applications', value: apps.approved, color: 'success.main' },
      { label: 'Rejected Applications', value: apps.rejected, color: 'error.main' },
      { label: 'Onboarding Pending', value: onboarding.pending, color: 'warning.main' },
      { label: 'Onboarding Completed', value: onboarding.completed, color: 'info.main' },
      { label: 'Fully Live', value: onboarding.approved, color: 'success.main' },
    ],
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {rows.map((row, ri) => (
        <Box
          key={ri}
          sx={{
            display: 'flex',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          {row.map((stat, i) => (
            <StatBox
              key={stat.label}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              loading={loading}
              borderRight={i < row.length - 1}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default OverviewCards;
