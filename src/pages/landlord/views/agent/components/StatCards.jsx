import React from 'react';
import { Grid, Card, Box, Typography, Stack, Divider, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import { getStatCardColor } from 'src/utils/statCardColors';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, valueColor, valueBg, colorIndex = 0, subStats = [], onIconClick, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const softColors = getStatCardColor(valueColor, colorIndex, isDark, theme);
  const resolvedValueColor = valueColor || softColors.accentColor;
  const resolvedValueBg = valueBg || softColors.valueBg;

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: '16px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : `1px solid ${softColors.borderColor}`,
        background: isDark ? theme.palette.background.paper : `${softColors.cardBg} !important`,
        boxShadow: isDark
          ? '0 6px 24px rgba(0,0,0,0.28)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              boxShadow: isDark
                ? '0 8px 30px rgba(0,0,0,0.35)'
                : '0 6px 24px rgba(0,0,0,0.12)',
              transform: 'translateY(-3px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          : {},
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box sx={{ p: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="600"
            sx={{ color: isDark ? 'text.secondary' : 'text.primary', fontSize: '13px' }}
          >
            {title}
          </Typography>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onIconClick?.();
            }}
            sx={{
              bgcolor: softColors.iconBg,
              p: '5px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              cursor: onIconClick ? 'pointer' : 'default',
              flexShrink: 0,
              '&:hover': onIconClick ? { opacity: 0.85 } : {},
            }}
          >
            <IconChartBar size={15} color={softColors.iconColor || 'white'} />
          </Box>
        </Box>

        {/* Value */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              bgcolor: resolvedValueBg,
              borderRadius: '10px',
              px: 2.5,
              py: 1.2,
            }}
          >
            <Typography
              fontWeight="800"
              sx={{
                color: resolvedValueColor,
                fontSize: '28px',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {value}
            </Typography>
          </Box>
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
                      sx={{ mx: 2, borderColor: softColors.borderColor }}
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
      </Box>
    </Card>
  );
};

const StatCards = ({ stats, onTransactionClick, onSubAgentClick, onSchoolClick, accessLevel = 1 }) => {
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
        return [
          { label: 'Lv5', value: stats.subAgentLevels?.lv5?.toString() || '0' },
        ];
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

  return (
    <Grid container spacing={2} sx={{ height: '100%', alignItems: 'stretch' }}>
      {/* Total Transaction Value */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
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
      </Grid>

      {/* Total Sub Agents */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        <StatCard
          title="Total Sub Organizations"
          value={stats.totalSubAgents}
          colorIndex={1}
          subStats={getSubAgentLevels()}
          onIconClick={onSubAgentClick}
          onClick={onSubAgentClick}
        />
      </Grid>

      {/* Total School */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
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
  onTransactionClick: PropTypes.func,
  onSubAgentClick: PropTypes.func,
  onSchoolClick: PropTypes.func,
};

export { StatCard };
export default StatCards;
