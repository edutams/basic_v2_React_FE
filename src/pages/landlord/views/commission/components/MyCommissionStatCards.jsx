import React from 'react';
import { Box, useTheme, Paper, Typography, Skeleton } from '@mui/material';
import { IconChartBar, IconWallet } from '@tabler/icons-react';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const formatNaira = (value) =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Divider = ({ isDarkMode }) => (
  <Box
    sx={{
      width: '1px',
      height: 40,
      bgcolor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    }}
  />
);

const CardIcon = ({ scheme, isDarkMode, icon: Icon = IconChartBar }) => (
  <Box
    sx={{
      width: 32,
      height: 32,
      borderRadius: '8px',
      bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : scheme.bg,
      color: isDarkMode ? '#fff' : scheme.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Icon size={18} color="currentColor" />
  </Box>
);

const Badge = ({ scheme, isDarkMode, value }) => (
  <Box
    sx={{
      bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : scheme.bg,
      borderRadius: '8px',
      px: 3,
      py: 1,
      display: 'inline-flex',
      alignItems: 'center',
      alignSelf: 'flex-start',
    }}
  >
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: isDarkMode ? '#fff' : scheme.color }}>
      {value}
    </Typography>
  </Box>
);

const SplitRow = ({ left, right, isDarkMode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {left.label}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
        {left.value}
      </Typography>
    </Box>

    <Divider isDarkMode={isDarkMode} />

    <Box sx={{ textAlign: 'right' }}>
      <Typography variant="body2" color="text.secondary">
        {right.label}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
        {right.value}
      </Typography>
    </Box>
  </Box>
);

const MyCommissionStatCards = ({
  organizationName,
  wallet,
  subOrgs,
  schools,
  loading,
  onViewTransactions,
  onViewSubOrgs,
  onViewSchools,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const s0 = schemeMap[0];
  const s1 = schemeMap[1];
  const s2 = schemeMap[2];
  const s3 = schemeMap[3];

  const cardSx = (clickable) => ({
    p: '10px',
    borderRadius: '14px',
    border: '1px solid',
    borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    bgcolor: isDarkMode ? theme.palette.background.paper : '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 1,
    cursor: clickable ? 'pointer' : 'default',
    transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
    '&:hover': clickable
      ? {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }
      : undefined,
  });

  if (loading) {
    return (
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 2 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: '14px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        {/* Wallet Card — informational only, not clickable */}
        <Paper sx={cardSx(false)}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {organizationName || 'My Organization'}
            </Typography>
            <CardIcon scheme={s0} isDarkMode={isDarkMode} icon={IconWallet} />
          </Box>

          <Badge scheme={s0} isDarkMode={isDarkMode} value={formatNaira(wallet?.myCommission)} />

          <SplitRow
            isDarkMode={isDarkMode}
            left={{ label: 'Account Number', value: wallet?.accountNumber || '—' }}
            right={{ label: 'Bank', value: wallet?.bankName || '—' }}
          />
        </Paper>

        {/* Total Transaction Card */}
        <Paper sx={cardSx(true)} onClick={onViewTransactions}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Total Transaction
            </Typography>
            <CardIcon scheme={s1} isDarkMode={isDarkMode} />
          </Box>

          <Badge
            scheme={s1}
            isDarkMode={isDarkMode}
            value={(wallet?.totalTransactionVolume ?? 0).toLocaleString()}
          />

          <SplitRow
            isDarkMode={isDarkMode}
            left={{ label: 'Inflow', value: formatNaira(wallet?.totalInflow) }}
            right={{ label: 'Outflow', value: formatNaira(wallet?.totalOutflow) }}
          />
        </Paper>

        {/* Total Sub Orgs Card */}
        <Paper sx={cardSx(true)} onClick={onViewSubOrgs}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Total Sub Orgs
            </Typography>
            <CardIcon scheme={s2} isDarkMode={isDarkMode} />
          </Box>

          <Badge scheme={s2} isDarkMode={isDarkMode} value={subOrgs?.total ?? 0} />

          <Typography variant="body2" color="text.secondary">
            {(subOrgs?.total ?? 0) === 1
              ? '1 agent is currently earning commission under your organization.'
              : `${subOrgs?.total ?? 0} agents are currently earning commission under your organization.`}
          </Typography>
        </Paper>

        {/* Total School Card */}
        <Paper sx={cardSx(true)} onClick={onViewSchools}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Total School
            </Typography>
            <CardIcon scheme={s3} isDarkMode={isDarkMode} />
          </Box>

          <Badge scheme={s3} isDarkMode={isDarkMode} value={schools?.total ?? 0} />

          <SplitRow
            isDarkMode={isDarkMode}
            left={{ label: 'Primary', value: schools?.primary ?? 0 }}
            right={{ label: 'Secondary', value: schools?.secondary ?? 0 }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default MyCommissionStatCards;
