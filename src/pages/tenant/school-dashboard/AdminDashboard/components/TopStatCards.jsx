import { Box, Grid, Typography, Paper, useTheme } from '@mui/material';
import { Groups, PersonAddAlt1, PeopleAlt, CalendarMonth, ArrowUpward, ArrowDownward } from '@mui/icons-material';

const StatCardItem = ({
  label,
  value,
  icon: Icon,
  colorScheme = 'blue',
  trendText,
  trendDirection = 'up',
  subText,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const schemeMap = {
    blue: { bg: '#EEF2FF', iconColor: '#2563EB', lightBg: '#DBEAFE' },
    green: { bg: '#DCFCE7', iconColor: '#16A34A', lightBg: '#BBF7D0' },
    purple: { bg: '#F3E8FF', iconColor: '#9333EA', lightBg: '#E9D5FF' },
    orange: { bg: '#FFEDD5', iconColor: '#EA580C', lightBg: '#FED7AA' },
  };

  const colors = schemeMap[colorScheme] || schemeMap.blue;
  const isNegative = trendDirection === 'down';
  const trendColor = isNegative ? '#EF4444' : '#16A34A';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
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
      {/* Top: Icon + Label/Value */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.55)' : '#94a3b8',
              lineHeight: 1.3,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '22px', sm: '26px' },
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      {/* Bottom: Trend + Subtext */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.25,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isNegative ? (
            <ArrowDownward sx={{ fontSize: 14, color: trendColor }} />
          ) : (
            <ArrowUpward sx={{ fontSize: 14, color: trendColor }} />
          )}
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: '11.5px', color: trendColor }}>
            {trendText}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          fontWeight={500}
          sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}
        >
          {subText}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * TopStatCards Row (Total Students, Teaching Staff, Non-Teaching Staff, Attendance Rate)
 */
const TopStatCards = ({
  total_students = 2486,
  teaching_staff = 142,
  non_teaching_staff = 58,
  attendance_rate = '94.6%',
  onCardClick,
}) => {
  return (
    <Grid container spacing={2} mb={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Total Students"
          value={total_students.toLocaleString()}
          icon={Groups}
          colorScheme="blue"
          trendText="8.2% vs last term"
          trendDirection="up"
          subText="Active learners"
          onClick={() => onCardClick && onCardClick('students')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Teaching Staff"
          value={teaching_staff.toLocaleString()}
          icon={PersonAddAlt1}
          colorScheme="green"
          trendText="5.3% vs last term"
          trendDirection="up"
          subText="Full & part time"
          onClick={() => onCardClick && onCardClick('teaching_staff')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Non-Teaching Staff"
          value={non_teaching_staff.toLocaleString()}
          icon={PeopleAlt}
          colorScheme="purple"
          trendText="2.0% vs last term"
          trendDirection="up"
          subText="Administrative & support"
          onClick={() => onCardClick && onCardClick('non_teaching_staff')}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Attendance Rate"
          value={attendance_rate}
          icon={CalendarMonth}
          colorScheme="orange"
          trendText="3.7% vs last term"
          trendDirection="up"
          subText="Average this term"
          onClick={() => onCardClick && onCardClick('attendance')}
        />
      </Grid>
    </Grid>
  );
};

export default TopStatCards;
