import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

// Custom SVG Icons matching the design mockup image exactly
const WalletIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M16 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M4 7V5a2 2 0 0 1 2-2h12" />
  </svg>
);

const StackedCoinsIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
    <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);

const ClockIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PercentIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

/**
 * Mini Card Item Component
 */
const MiniFeeCard = ({ label, value, trend, isPositive = true, icon: IconComponent, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 1.75,
        px: 2,
        borderRadius: '12px',
        fontSize:'9px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)' } : {},
      }}
    >
      {/* Top Row: Icon + Label & Value */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
        {/* Icon chip */}
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            bgcolor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconComponent />
        </Box>

        {/* Label & Value */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.7)' : '#334155',
              lineHeight: 1.2,
              mb: 0.35,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '13.5px', sm: '14.5px' },
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              lineHeight: 1.15,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Row: Trend Arrow + Percentage + vs last term */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto' }}>
        {isPositive ? (
          <ArrowUpward sx={{ fontSize: 13, color: '#16a34a' }} />
        ) : (
          <ArrowDownward sx={{ fontSize: 13, color: '#dc2626' }} />
        )}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ fontSize: '11px', color: isPositive ? '#16a34a' : '#dc2626' }}
        >
          {trend}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', ml: 0.25 }}
        >
          vs last term
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * Financial Overview Bar Component matching design mockup exactly
 */
const FinancialOverviewBar = ({
  expectedIncome = '₦ 98,450,000',
  collectedIncome = '₦ 62,340,0',
  outstandingBalance = '₦ 36,110,000',
  efficiency = '63.3%',
  onCardClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Typography
        sx={{
          fontSize: '11.5px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          mb: 1.75,
        }}
      >
        FINANCIAL OVERVIEW
      </Typography>

      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniFeeCard
            label="Total Expected Income"
            value={expectedIncome}
            trend="12.5%"
            isPositive={true}
            icon={WalletIcon}
            onClick={() => onCardClick && onCardClick('expected_income')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniFeeCard
            label="Total Collected Income"
            value={collectedIncome}
            trend="9.8%"
            isPositive={true}
            icon={StackedCoinsIcon}
            onClick={() => onCardClick && onCardClick('collected_income')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniFeeCard
            label="Total Outstanding"
            value={outstandingBalance}
            trend="3.2%"
            isPositive={false}
            icon={ClockIcon}
            onClick={() => onCardClick && onCardClick('outstanding_balance')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniFeeCard
            label="Collection Efficiency"
            value={efficiency}
            trend="4.6%"
            isPositive={true}
            icon={PercentIcon}
            onClick={() => onCardClick && onCardClick('collection_efficiency')}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FinancialOverviewBar;
