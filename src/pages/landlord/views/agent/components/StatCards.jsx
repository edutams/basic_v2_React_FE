import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Stack, Divider, Skeleton, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const StatCard = ({
  title,
  value,
  valueColor,
  valueBg,
  colorIndex = 0,
  subStats = [],
  onIconClick,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const schemeMap = [
    { bg: '#DBEAFE', color: '#2563EB' },
    { bg: '#DCFCE7', color: '#16A34A' },
    { bg: '#F3E8FF', color: '#9333EA' },
    { bg: '#FEF3C7', color: '#D97706' },
    { bg: '#FEE2E2', color: '#DC2626' },
  ];
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Card
      onClick={onClick}
      sx={{
        p: '0px !important',
        height: '100%',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <CardContent
        sx={{
          p: '14px !important',
          '&:last-child': { pb: '14px !important' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            fontWeight="700"
            sx={{ color: 'text.secondary', fontSize: '13px' }}
          >
            {title}
          </Typography>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onIconClick?.();
            }}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
              color: isDark ? '#ffffff' : scheme.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onIconClick ? 'pointer' : 'default',
              '&:hover': onIconClick ? { opacity: 0.85 } : {},
            }}
          >
            <IconChartBar size={18} color="currentColor" />
          </Box>
        </Box>

        {/* Value */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography
            fontWeight="800"
            sx={{
              color: isDark ? '#ffffff' : '#0f172a',
              fontSize: '28px',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>
        </Box>

        {/* Sub stats */}
        {subStats.length > 0 && (
          <>
            <Stack direction="row" spacing={0} sx={{ mt: 2 }}>
              {subStats.map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ mx: 2, borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.2,
                        fontSize: '10px',
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight="700"
                      sx={{ color: isDark ? '#fff' : '#1a1a1a', fontSize: '14px' }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const StatCardSkeleton = ({ colorIndex = 0, subStatCount = 3, titleWidth = '60%', valueWidth = 80 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        p: '0px !important',
        height: '100%',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
      }}
    >
      <CardContent
        sx={{
          p: '14px !important',
          '&:last-child': { pb: '14px !important' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={titleWidth} height={16} />
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="text" width={valueWidth} height={32} />
        </Box>
        {subStatCount > 0 && (
          <Stack direction="row" spacing={0} sx={{ mt: 2 }}>
            {[...Array(subStatCount)].map((_, i) => (
              <Box key={i} sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={10} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const StatCards = ({
  stats,
  onTransactionClick,
  onSubAgentClick,
  onSchoolClick,
  accessLevel = 1,
  loading = false,
  loadingTransaction = false,
  loadingSubAgents = false,
  loadingSchools = false,
}) => {
  const getSubAgentLevels = () => {
    switch (accessLevel) {
      case 1:
        return [
          { label: 'Lv2', value: stats.subAgentLevels?.lv2?.toString() || '0' },
          { label: 'Lv3', value: stats.subAgentLevels?.lv3?.toString() || '0' },
          { label: 'Lv4', value: stats.subAgentLevels?.lv4?.toString() || '0' },
          { label: 'Lv5', value: stats.subAgentLevels?.lv5?.toString() || '0' },
        ];
      case 2:
        return [
          { label: 'Lv3', value: stats.subAgentLevels?.lv3?.toString() || '0' },
          { label: 'Lv4', value: stats.subAgentLevels?.lv4?.toString() || '0' },
          { label: 'Lv5', value: stats.subAgentLevels?.lv5?.toString() || '0' },
        ];
      case 3:
        return [
          { label: 'Lv4', value: stats.subAgentLevels?.lv4?.toString() || '0' },
          { label: 'Lv5', value: stats.subAgentLevels?.lv5?.toString() || '0' },
        ];
      case 4:
        return [{ label: 'Lv5', value: stats.subAgentLevels?.lv5?.toString() || '0' }];
      case 5:
        return [];
      default:
        return [
          { label: 'Lv2', value: stats.subAgentLevels?.lv2?.toString() || '0' },
          { label: 'Lv3', value: stats.subAgentLevels?.lv3?.toString() || '0' },
          { label: 'Lv4', value: stats.subAgentLevels?.lv4?.toString() || '0' },
          { label: 'Lv5', value: stats.subAgentLevels?.lv5?.toString() || '0' },
        ];
    }
  };

  const showTransactionLoading = loading || loadingTransaction;
  const showSubAgentsLoading = loading || loadingSubAgents;
  const showSchoolsLoading = loading || loadingSchools;

  return (
    <Grid container spacing={2} sx={{ height: '100%', alignItems: 'stretch' }}>
      {/* Total Transaction Value */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        {showTransactionLoading ? (
          <StatCardSkeleton colorIndex={2} subStatCount={2} titleWidth="75%" valueWidth={120} />
        ) : (
          <StatCard
            title="Total Transaction Value"
            value={`₦${stats?.totalTransaction || 0}`}
            colorIndex={2}
            subStats={[
              { label: 'Commission', value: `₦${stats?.commission || 0}` },
              { label: 'Volume', value: stats?.volume || 0 },
            ]}
            onIconClick={onTransactionClick}
            onClick={onTransactionClick}
          />
        )}
      </Grid>

      {/* Total Sub Agents */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        {showSubAgentsLoading ? (
          <StatCardSkeleton colorIndex={1} subStatCount={accessLevel === 1 ? 4 : accessLevel === 2 ? 3 : accessLevel === 3 ? 2 : accessLevel === 4 ? 1 : 4} titleWidth="85%" valueWidth={60} />
        ) : (
          <StatCard
            title="Total Sub Organizations"
            value={stats.totalSubAgents}
            colorIndex={1}
            subStats={getSubAgentLevels()}
            onIconClick={onSubAgentClick}
            onClick={onSubAgentClick}
          />
        )}
      </Grid>

      {/* Total School */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        {showSchoolsLoading ? (
          <StatCardSkeleton colorIndex={0} subStatCount={3} titleWidth="55%" valueWidth={90} />
        ) : (
          <StatCard
            title="Total School"
            value={stats.totalSchools}
            colorIndex={0}
            subStats={[
              { label: 'Active', value: stats.activeSchools?.toString() || '0' },
              { label: 'Pending', value: stats.pendingSchools?.toString() || '0' },
              { label: 'Rejected', value: stats.rejectedSchools?.toString() || '0' },
            ]}
            onIconClick={onSchoolClick}
            onClick={onSchoolClick}
          />
        )}
      </Grid>
    </Grid>
  );
};

StatCards.propTypes = {
  stats: PropTypes.shape({
    totalTransaction: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    transactionCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalSchools: PropTypes.number,
    totalSubAgents: PropTypes.number,
    activeSchools: PropTypes.number,
    pendingSchools: PropTypes.number,
    rejectedSchools: PropTypes.number,
    commission: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subAgentLevels: PropTypes.shape({
      lv2: PropTypes.number,
      lv3: PropTypes.number,
      lv4: PropTypes.number,
      lv5: PropTypes.number,
    }),
  }).isRequired,
  accessLevel: PropTypes.number,
  loading: PropTypes.bool,
  loadingTransaction: PropTypes.bool,
  loadingSubAgents: PropTypes.bool,
  loadingSchools: PropTypes.bool,
  onTransactionClick: PropTypes.func,
  onSubAgentClick: PropTypes.func,
  onSchoolClick: PropTypes.func,
};

export { StatCard };
export default StatCards;
