import React, { useContext } from 'react';
import { Box, Paper, Typography, Skeleton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import PropTypes from 'prop-types';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const StatCard = ({
  count,
  label,
  icon: Icon,
  color,
  colorIndex = 0,
  loading,
  subtitle,
  onClick,
  tooltip,
  tooltipPlacement = 'top',
}) => {
  const { isCardShadow } = useContext(CustomizerContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  const cardContent = (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: '14px',
        p: '14px',
        width: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      {/* Icon Badge */}
      {loading ? (
        <Skeleton
          variant="rounded"
          width={40}
          height={40}
          sx={{ borderRadius: '12px', flexShrink: 0 }}
        />
      ) : (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
            color: isDark ? '#ffffff' : scheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {Icon && <Icon size={22} />}
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          pl: 1,
          textAlign: 'right',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
            <Skeleton variant="text" width="40%" height={26} />
            <Skeleton variant="text" width="70%" height={16} />
            {subtitle && <Skeleton variant="text" width="55%" height={14} sx={{ mt: 0.25 }} />}
          </Box>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: isDark ? '#fff' : scheme.color,
              }}
            >
              {count}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                fontWeight: 600,
                color: isDark
                  ? '#ffffff'
                  : '#4B5563',
              }}
            >
              {label}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 11,
                  fontWeight: 500,
                  color: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
        <Box sx={{ width: '100%', display: 'flex' }}>
          {cardContent}
        </Box>
      </Tooltip>
    );
  }

  return cardContent;
};

StatCard.propTypes = {
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  colorIndex: PropTypes.number,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  tooltip: PropTypes.node,
  tooltipPlacement: PropTypes.string,
};

export default StatCard;