import { Box, Grid, Typography, Paper, Tooltip, Skeleton, useTheme } from '@mui/material';
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
  loading = false,
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

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '14px',
          height: '100%',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '12px' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width="40%" height={28} />
          </Box>
        </Box>
        <Box sx={{ pt: 1.25, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
          <Skeleton variant="text" width="50%" height={12} />
        </Box>
      </Paper>
    );
  }

  const card = (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
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
 * TopStatCards Row (Total Students, Teaching Staff, Non-Teaching Staff, Attendance Rate)
 */
const TopStatCards = ({
  total_students = 0,
  teaching_staff = 0,
  non_teaching_staff = 0,
  attendance_rate = '—',
  student_growth,
  teaching_growth,
  non_teaching_growth,
  attendance_growth,
  onCardClick,
  loading = false,
}) => {
  const renderTrend = (growth) => {
    if (growth == null) return { text: '— vs last term', direction: 'up' };
    const val = Number(growth);
    const isNeg = val < 0;
    return {
      text: `${Math.abs(val).toFixed(1)}% vs last term`,
      direction: isNeg ? 'down' : 'up',
    };
  };

  const studentTrend = renderTrend(student_growth);
  const teachingTrend = renderTrend(teaching_growth);
  const nonTeachingTrend = renderTrend(non_teaching_growth);
  const attendanceTrend = renderTrend(attendance_growth);

  return (
    <Grid container spacing={2} mb={2.5}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Total Students"
          value={total_students.toLocaleString()}
          icon={Groups}
          colorScheme="blue"
          trendText={studentTrend.text}
          trendDirection={studentTrend.direction}
          subText="Active learners"
          onClick={() => onCardClick && onCardClick('students')}
          loading={loading}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Teaching Staff"
          value={teaching_staff.toLocaleString()}
          icon={PersonAddAlt1}
          colorScheme="green"
          trendText={teachingTrend.text}
          trendDirection={teachingTrend.direction}
          subText="Full & part time"
          onClick={() => onCardClick && onCardClick('teaching_staff')}
          loading={loading}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Non-Teaching Staff"
          value={non_teaching_staff.toLocaleString()}
          icon={PeopleAlt}
          colorScheme="purple"
          trendText={nonTeachingTrend.text}
          trendDirection={nonTeachingTrend.direction}
          subText="Administrative & support"
          onClick={() => onCardClick && onCardClick('non_teaching_staff')}
          loading={loading}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCardItem
          label="Attendance Rate"
          value={attendance_rate}
          icon={CalendarMonth}
          colorScheme="orange"
          trendText={attendanceTrend.text}
          trendDirection={attendanceTrend.direction}
          subText="Average this term"
          onClick={() => onCardClick && onCardClick('attendance')}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
};

export default TopStatCards;
