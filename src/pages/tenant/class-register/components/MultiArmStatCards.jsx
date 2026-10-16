import { Box, Typography, Paper, Stack, Skeleton, CircularProgress } from '@mui/material';
import {
  Groups as GroupsIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  HowToReg as AssignedIcon,
  ReportProblem as UnassignedIcon,
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
      sx={{ color, position: 'absolute', left: 0, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
    />
    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="caption" fontWeight={700} fontSize={9}>
        {value ?? 0}
      </Typography>
    </Box>
  </Box>
);

const Trend = ({ diff }) => {
  if (diff === null || diff === undefined || diff === 0) return null;
  const up = diff > 0;
  return (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      {up ? <ArrowUpward sx={{ fontSize: 12, color: 'success.main' }} /> : <ArrowDownward sx={{ fontSize: 12, color: 'error.main' }} />}
      <Typography variant="caption" fontWeight={700} color={up ? 'success.main' : 'error.main'}>
        {Math.abs(diff)}
      </Typography>
    </Stack>
  );
};

const StatCard = ({ icon, iconBg, iconColor, label, children }) => (
  <Paper
    elevation={0}
    sx={{ p: '8px 10px', borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#fff', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', gap: 0.25 }}
  >
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box sx={{ width: 26, height: 26, borderRadius: '7px', bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& svg': { fontSize: 15 } }}>
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
  <Paper elevation={0} sx={{ p: '8px 10px', borderRadius: '10px', border: '1px solid #E5E7EB', height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
      <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: '7px' }} />
      <Skeleton variant="text" width="60%" height={14} />
    </Stack>
    <Skeleton variant="text" width="40%" height={28} />
  </Paper>
);

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
  gap: 1,
  mb: 1.5,
};

/**
 * Stat cards for the redesigned Multiple Arm View — scoped to a whole
 * class (every arm), driven by classMultiArmOverview.
 */
const MultiArmStatCards = ({ stats }) => {
  if (!stats) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 5 }).map((_, i) => (
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

      <StatCard icon={<AssignedIcon fontSize="small" />} iconBg="#D1FAE5" iconColor="#059669" label="Assigned to Arms">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1}>
              {stats.assigned_count}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              {stats.assigned_pct}%
            </Typography>
          </Box>
          <MiniRing value={stats.assigned_pct} color="#059669" />
        </Stack>
      </StatCard>

      <StatCard icon={<UnassignedIcon fontSize="small" />} iconBg="#FEE2E2" iconColor="#DC2626" label="Unassigned">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} lineHeight={1} color={stats.unassigned_count > 0 ? 'error.main' : 'text.primary'}>
              {stats.unassigned_count}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              {stats.unassigned_pct}%
            </Typography>
          </Box>
          <MiniRing value={stats.unassigned_pct} color="#DC2626" />
        </Stack>
      </StatCard>
    </Box>
  );
};

export default MultiArmStatCards;
