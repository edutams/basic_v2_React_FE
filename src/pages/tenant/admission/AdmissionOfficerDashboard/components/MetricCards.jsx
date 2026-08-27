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

  const card = (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.25,
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
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

  if (!onClick) {
    return card;
  }

  return (
    <Tooltip title="Click to view breakdown" placement="top" arrow>
      {card}
    </Tooltip>
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
  const applicantsCount = (total_applicants.count ?? 0).toLocaleString();
  const pendingCount = (pending_review.count ?? 0).toLocaleString();
  const pendingDueToday = pending_review.due_today ?? 0;

  const admittedCount = (total_admitted.count ?? 0).toLocaleString();
  const acceptedCount = (total_accepted.count ?? 0).toLocaleString();
  const acceptanceRate = total_accepted.rate ?? 0;

  const applicantsGrowth = total_applicants.growth;
  const admittedGrowth = total_admitted.growth;

  return (
    <Grid container spacing={2} mb={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Total Applicants"
          value={applicantsCount}
          icon={PersonOutline}
          colorScheme="blue"
          trendType={applicantsGrowth != null ? (Number(applicantsGrowth) >= 0 ? 'up' : 'warning') : 'up'}
          trendText={applicantsGrowth != null ? `${Number(applicantsGrowth) >= 0 ? '+' : ''}${applicantsGrowth}% vs last term` : '—'}
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
          trendText={pendingDueToday > 0 ? `${pendingDueToday} due today` : 'No items due today'}
          onClick={() => onCardClick && onCardClick('pending_review')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Total Admitted"
          value={admittedCount}
          icon={PersonAddAlt1Outlined}
          colorScheme="green"
          trendType={admittedGrowth != null ? (Number(admittedGrowth) >= 0 ? 'up' : 'warning') : 'up'}
          trendText={admittedGrowth != null ? `${Number(admittedGrowth) >= 0 ? '+' : ''}${admittedGrowth}% vs last term` : '—'}
          onClick={() => onCardClick && onCardClick('admitted')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Accepted / Enrolled"
          value={acceptedCount}
          icon={SchoolOutlined}
          colorScheme="purple"
          subText={acceptanceRate > 0 ? `${acceptanceRate}% acceptance rate` : '—'}
          onClick={() => onCardClick && onCardClick('accepted')}
        />
      </Grid>
    </Grid>
  );
};

export default MetricCards;
