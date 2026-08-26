import React from 'react';
import { Box, Grid, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import { PersonOutline, FindInPageOutlined, PersonAddAlt1Outlined, SchoolOutlined, ArrowUpward, WarningAmberOutlined } from '@mui/icons-material';

/**
 * Top KPI Stat Card Component matching Bursary/Parent Dashboard style
 */
const StatCardItem = ({
  label,
  value,
  icon: Icon,
  colorScheme,
  trendText,
  trendType = 'up', // 'up', 'warning', 'info'
  subText,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const schemeMap = {
    blue: { bg: '#EEF2FF', iconColor: '#2563EB', badgeBg: '#DCFCE7', badgeColor: '#166534' },
    orange: { bg: '#FEF3C7', iconColor: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    green: { bg: '#DCFCE7', iconColor: '#16A34A', badgeBg: '#DCFCE7', badgeColor: '#166534' },
    purple: { bg: '#F3E8FF', iconColor: '#9333EA', badgeBg: '#F3E8FF', badgeColor: '#6B21A8' },
  };

  const colors = schemeMap[colorScheme] || schemeMap.blue;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.25,
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04), 0 10px 20px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            }
          : {},
      }}
    >
      {/* Top row: Icon + Label & Value */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : colors.bg,
            color: isDark ? '#fff' : colors.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 700,
              color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b',
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '24px', sm: '28px' },
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      {/* Bottom row: Trend badge or subtext */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pt: 1, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
        {trendType === 'up' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a' }}>
            <ArrowUpward sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: '11.5px', color: '#16a34a' }}>
              {trendText}
            </Typography>
          </Box>
        )}

        {trendType === 'warning' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#d97706' }}>
            <WarningAmberOutlined sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: '11.5px', color: '#d97706' }}>
              {trendText}
            </Typography>
          </Box>
        )}

        {subText && (
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '11.5px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
            {subText}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

/**
 * MetricCards row of 4 Stat Cards
 */
const MetricCards = ({
  total_applicants = {},
  pending_review = {},
  total_admitted = {},
  total_accepted = {},
  onCardClick,
}) => {
  const applicantsCount = (total_applicants.count ?? 3842).toLocaleString();
  const pendingCount = (pending_review.count ?? 624).toLocaleString();
  const pendingDueToday = pending_review.due_today ?? 86;

  const admittedCount = (total_admitted.count ?? 1256).toLocaleString();
  const acceptedCount = (total_accepted.count ?? 1045).toLocaleString();
  const acceptanceRate = total_accepted.rate ?? '83.2';

  return (
    <Grid container spacing={2} mb={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Total Applicants"
          value={applicantsCount}
          icon={PersonOutline}
          colorScheme="blue"
          trendType="up"
          trendText="18% vs 2023/24"
          onClick={() => onCardClick && onCardClick('applicants')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Pending Review"
          value={pendingCount}
          icon={FindInPageOutlined}
          colorScheme="orange"
          trendType="warning"
          trendText={`${pendingDueToday} due today`}
          onClick={() => onCardClick && onCardClick('pending_review')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Total Admitted"
          value={admittedCount}
          icon={PersonAddAlt1Outlined}
          colorScheme="green"
          trendType="up"
          trendText="15% vs 2023/24"
          onClick={() => onCardClick && onCardClick('admitted')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Accepted / Enrolled"
          value={acceptedCount}
          icon={SchoolOutlined}
          colorScheme="purple"
          subText={`${acceptanceRate}% acceptance rate`}
          onClick={() => onCardClick && onCardClick('accepted')}
        />
      </Grid>
    </Grid>
  );
};

export default MetricCards;
