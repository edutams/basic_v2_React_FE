import {
  Box,
  Typography,
  Paper,
  Stack,
  Skeleton,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  BarChart as BarChartIcon,
  AssignmentTurnedIn as ProfileIcon,
  ReportProblem as AttentionIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

const MiniRing = ({ value, color, size = 36, thickness = 5 }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
    <CircularProgress variant="determinate" value={100} size={size} thickness={thickness} sx={{ color: '#F3F4F6' }} />
    <CircularProgress
      variant="determinate"
      value={value ?? 0}
      size={size}
      thickness={thickness}
      sx={{
        color,
        position: 'absolute',
        left: 0,
        '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
      }}
    />
    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="caption" fontWeight={700} fontSize={9}>
        {value ?? 0}
      </Typography>
    </Box>
  </Box>
);

const Trend = ({ diff, suffix = '' }) => {
  if (diff === null || diff === undefined || diff === 0) return null;
  const up = diff > 0;
  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      {up ? (
        <ArrowUpward sx={{ fontSize: 12, color: 'success.main' }} />
      ) : (
        <ArrowDownward sx={{ fontSize: 12, color: 'error.main' }} />
      )}
      <Typography variant="caption" fontWeight={700} color={up ? 'success.main' : 'error.main'}>
        {Math.abs(diff)}
        {suffix}
      </Typography>
    </Stack>
  );
};

const StatCard = ({ icon, iconBg, iconColor, label, children, onClick }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: '8px 10px',
      borderRadius: '10px',
      border: '1px solid #94a3b8',
      bgcolor: '#fff',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 150ms ease, border-color 150ms ease',
      '&:hover': onClick ? { borderColor: '#94a3b8', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' } : {},
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: '7px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': { fontSize: 15 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap fontSize="0.68rem">
        {label}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

const CardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{ p: '8px 10px', borderRadius: '10px', border: '1px solid #94a3b8', height: '100%' }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
      <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: '7px' }} />
      <Skeleton variant="text" width="60%" height={14} />
    </Stack>
    <Skeleton variant="text" width="40%" height={28} />
  </Paper>
);

/**
 * Stat cards row for the redesigned Single Arm View — driven entirely by
 * classArmOverview (stats stay stable while the roster table below is
 * searched/filtered/paginated).
 */
const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' },
  gap: 1,
  mb: 1.5,
};

const ClassArmStatCards = ({ stats, loading, onNeedAttentionClick }) => {
  if (loading || !stats) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 7 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={gridSx}>
      <StatCard icon={<GroupsIcon fontSize="small" />} iconBg="#DBEAFE" iconColor="#2563EB" label="Total Students">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography variant="h4" fontWeight={800} lineHeight={1}>
                {stats.total_students}
              </Typography>
              <Trend diff={stats.total_students_diff} />
            </Stack>
            {stats.total_students_diff !== null && (
              <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
                vs last term
              </Typography>
            )}
          </Box>
          <GroupsIcon sx={{ fontSize: 34, color: '#DBEAFE' }} />
        </Stack>
      </StatCard>

      <StatCard icon={<MaleIcon fontSize="small" />} iconBg="#DBEAFE" iconColor="#2563EB" label="Male">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1}>
              {stats.male_count}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              {stats.male_pct}%
            </Typography>
          </Box>
          <MiniRing value={stats.male_pct} color="#2563EB" />
        </Stack>
      </StatCard>

      <StatCard icon={<FemaleIcon fontSize="small" />} iconBg="#FCE7F3" iconColor="#DB2777" label="Female">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1}>
              {stats.female_count}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              {stats.female_pct}%
            </Typography>
          </Box>
          <MiniRing value={stats.female_pct} color="#DB2777" />
        </Stack>
      </StatCard>

      <StatCard icon={<BarChartIcon fontSize="small" />} iconBg="#DCFCE7" iconColor="#16A34A" label="Avg. Attendance">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
              {stats.avg_attendance_pct ?? 0}%
            </Typography>
            {stats.avg_attendance_pct === null ? (
              <Typography variant="caption" color="text.disabled" fontSize="0.65rem">No data yet</Typography>
            ) : (
              <Trend diff={stats.avg_attendance_diff} suffix="%" />
            )}
          </Box>
          <MiniRing value={stats.avg_attendance_pct} color="#16A34A" />
        </Stack>
      </StatCard>

      <StatCard icon={<BarChartIcon fontSize="small" />} iconBg="#F3E8FF" iconColor="#9333EA" label="Last Test Average">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography variant="h4" fontWeight={800} lineHeight={1}>
                {stats.last_test_average_pct ?? 0}%
              </Typography>
              {stats.last_test_average_pct === null ? (
                <Typography variant="caption" color="text.disabled" fontSize="0.65rem">No data yet</Typography>
              ) : (
                <Trend diff={stats.last_test_average_diff} suffix="%" />
              )}
            </Stack>
            <LinearProgress
              variant="determinate"
              value={stats.last_test_average_pct ?? 0}
              sx={{ height: 5, borderRadius: 4, bgcolor: '#F3E8FF', mt: 0.5, '& .MuiLinearProgress-bar': { bgcolor: '#9333EA' } }}
            />
          </Box>
        </Stack>
      </StatCard>

      <StatCard icon={<ProfileIcon fontSize="small" />} iconBg="#D1FAE5" iconColor="#059669" label="Profile Completeness">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1}>
              {stats.profile_completeness_pct}%
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              {stats.profile_complete_count}/{stats.profile_total_count} complete
            </Typography>
          </Box>
          <MiniRing value={stats.profile_completeness_pct} color="#059669" />
        </Stack>
      </StatCard>

      <StatCard
        icon={<AttentionIcon fontSize="small" />}
        iconBg="#FEE2E2"
        iconColor="#DC2626"
        label="Need Attention"
        onClick={onNeedAttentionClick}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1} color={stats.need_attention_count > 0 ? 'error.main' : 'text.primary'}>
              {stats.need_attention_count}
            </Typography>
            <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
              students
            </Typography>
          </Box>
          <AttentionIcon sx={{ fontSize: 34, color: stats.need_attention_count > 0 ? '#FEE2E2' : '#F3F4F6' }} />
        </Stack>
      </StatCard>
    </Box>
  );
};

export default ClassArmStatCards;
